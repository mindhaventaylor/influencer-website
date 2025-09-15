import { NextRequest, NextResponse } from 'next/server';
import { postgres } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  const sql = postgres;
  
  try {
    const { userId, influencerId, planId } = await request.json();

    if (!userId || !influencerId || !planId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, influencerId, planId' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = await sql`
      SELECT * FROM plans 
      WHERE id = ${planId} AND is_active = true
      LIMIT 1
    `;

    if (plan.length === 0) {
      return NextResponse.json(
        { error: 'Plan not found or inactive' },
        { status: 404 }
      );
    }

    // Get user details
    const user = await sql`
      SELECT id, email, username, display_name, stripe_customer_id
      FROM users 
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a subscription for this influencer
    const existingSubscription = await sql`
      SELECT id FROM user_subscriptions 
      WHERE user_id = ${userId} AND influencer_id = ${influencerId}
      LIMIT 1
    `;

    if (existingSubscription.length > 0) {
      return NextResponse.json(
        { error: 'User already has a subscription for this influencer' },
        { status: 409 }
      );
    }

    // Create or get Stripe customer
    let customerId = user[0].stripe_customer_id;
    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user[0].email,
        name: user[0].display_name || user[0].username || user[0].email,
        metadata: {
          userId: user[0].id,
        },
      });
      customerId = stripeCustomer.id;

      // Update user with customer ID
      await sql`
        UPDATE users 
        SET stripe_customer_id = ${customerId}
        WHERE id = ${userId}
      `;
    }

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: plan[0].stripe_price_id,
        },
      ],
      metadata: {
        userId: userId,
        influencerId: influencerId,
        planId: planId,
      },
    });

    // Create subscription record in database
    const subscription = await sql`
      INSERT INTO user_subscriptions (
        user_id,
        influencer_id,
        plan_id,
        stripe_subscription_id,
        stripe_customer_id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end
      ) VALUES (
        ${userId},
        ${influencerId},
        ${planId},
        ${stripeSubscription.id},
        ${customerId},
        ${stripeSubscription.status},
        ${new Date(stripeSubscription.current_period_start * 1000)},
        ${new Date(stripeSubscription.current_period_end * 1000)},
        ${stripeSubscription.cancel_at_period_end}
      ) RETURNING *
    `;

    return NextResponse.json({
      id: subscription[0].id,
      user_id: subscription[0].user_id,
      influencer_id: subscription[0].influencer_id,
      plan_id: subscription[0].plan_id,
      stripe_subscription_id: subscription[0].stripe_subscription_id,
      stripe_customer_id: subscription[0].stripe_customer_id,
      status: subscription[0].status,
      current_period_start: subscription[0].current_period_start,
      current_period_end: subscription[0].current_period_end,
      cancel_at_period_end: subscription[0].cancel_at_period_end,
      created_at: subscription[0].created_at
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  } finally {
    // Don't call sql.end() - let the connection pool handle it
  }
}

