import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { subscriptionQueries, userQueries, planQueries } from '@/lib/db/queries';
import { postgres } from '@/lib/db';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Function to allocate tokens based on plan
async function allocateTokensForPlan(userId: string, planId: string, stripeSubscriptionId?: string, isSubscription: boolean = false) {
  const sql = postgres;
  
  try {
    // Get influencer ID from config
    const influencerId = 'f3593ed0-0844-476c-9a5a-a30e6ebcb86d'; // Taylor Swift ID
    
    // Calculate tokens based on plan
    const tokensPerMonth = calculateTokensForPlan(planId);
    
    // Create or update conversation with tokens
    const [conversation] = await sql`
      INSERT INTO conversations (
        user_id, influencer_id, influencer_plan_ids, tokens, created_at
      ) VALUES (
        ${userId}, ${influencerId}, ARRAY[${planId}]::UUID[], ${tokensPerMonth}, NOW()
      )
      ON CONFLICT (user_id, influencer_id) 
      DO UPDATE SET 
        tokens = conversations.tokens + ${tokensPerMonth},
        influencer_plan_ids = ARRAY[${planId}]::UUID[]
      RETURNING *
    `;

    console.log(`✅ Allocated ${tokensPerMonth} tokens for user ${userId}, plan ${planId}`);
    return conversation;

  } catch (error) {
    console.error('Error allocating tokens:', error);
    throw error;
  } finally {
    // Don't call sql.end() - let the connection pool handle it
  }
}

// Function to calculate tokens based on access level
function calculateTokensForPlan(planId: string): number {
  switch (planId) {
    case 'basic':
      return 150; // 5 messages per day * 30 days
    case 'premium':
      return 900; // 30 messages per day * 30 days
    case 'vip':
      return 3000; // 100 messages per day * 30 days
    default:
      return 90; // Free plan: 3 messages per day * 30 days
  }
}

// Function to renew subscription tokens
async function renewSubscriptionTokens(stripeSubscriptionId: string) {
  const sql = postgres;
  
  try {
    // Find conversations with this subscription and renew tokens
    const conversations = await sql`
      SELECT * FROM conversations 
      WHERE influencer_plan_ids IS NOT NULL
    `;

    for (const conv of conversations) {
      const planId = conv.influencer_plan_ids[0]; // Get first plan ID
      const newTokens = calculateTokensForPlan(planId);
      
      await sql`
        UPDATE conversations
        SET tokens = tokens + ${newTokens}
        WHERE id = ${conv.id}
      `;
    }

    console.log(`✅ Renewed tokens for subscription ${stripeSubscriptionId}`);

  } catch (error) {
    console.error('Error renewing subscription tokens:', error);
    throw error;
  } finally {
    // Don't call sql.end() - let the connection pool handle it
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Received webhook event:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);
  // The subscription will be handled by the subscription.created event
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const { userId, planId, influencerId } = subscription.metadata;

    if (!userId || !planId || !influencerId) {
      console.error('Missing metadata in subscription:', subscription.id);
      return;
    }

    const plan = await planQueries.getById(planId);
    if (!plan) {
      console.error('Plan not found:', planId);
      return;
    }

    const subscriptionData = {
      userId,
      influencerId,
      planId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      status: subscription.status as any,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    };

    await subscriptionQueries.create(subscriptionData);
    
    // Allocate tokens for the subscription
    await allocateTokensForPlan(userId, planId, subscription.id, true);
    
    console.log('Subscription created in database:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const subscriptionData = {
      status: subscription.status as any,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
    };

    await subscriptionQueries.updateByStripeSubscriptionId(
      subscription.id,
      subscriptionData
    );
    console.log('Subscription updated in database:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    await subscriptionQueries.updateByStripeSubscriptionId(
      subscription.id,
      { status: 'canceled' }
    );
    console.log('Subscription canceled in database:', subscription.id);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription as string;
    if (subscriptionId) {
      await subscriptionQueries.updateByStripeSubscriptionId(
        subscriptionId,
        { status: 'active' }
      );
      
      // Renew subscription tokens
      await renewSubscriptionTokens(subscriptionId);
      
      console.log('Invoice payment succeeded for subscription:', subscriptionId);
    } else {
      // Handle one-time payment
      const userId = invoice.metadata?.userId;
      const planId = invoice.metadata?.planId;
      
      if (userId && planId) {
        await allocateTokensForPlan(userId, planId, undefined, false);
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = (invoice as any).subscription as string;
    if (subscriptionId) {
      await subscriptionQueries.updateByStripeSubscriptionId(
        subscriptionId,
        { status: 'past_due' }
      );
      console.log('Invoice payment failed for subscription:', subscriptionId);
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}
