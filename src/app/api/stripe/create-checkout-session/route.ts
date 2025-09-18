import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import { postgres } from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    console.log('Received request body:', requestBody);
    
    const { planId, influencerId } = requestBody;
    console.log('Extracted planId:', planId);
    console.log('Extracted influencerId:', influencerId);

    if (!planId || !influencerId) {
      console.log('Missing fields - planId:', !!planId, 'influencerId:', !!influencerId);
      return NextResponse.json(
        { error: 'Missing required fields: planId, influencerId' },
        { status: 400 }
      );
    }

    // Get the user from Supabase Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const sql = postgres;

    // Get the plan details from configuration
    console.log('Fetching plan with ID:', planId);
    const plan = config.plans.find(p => p.id === planId);
    console.log('Plan found:', plan);
    console.log('Stripe price ID:', plan?.stripePriceId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Get the user details from database
    const [userRecord] = await sql`
      SELECT id, email, stripe_id
      FROM users 
      WHERE id = ${userId}
      LIMIT 1
    `;
    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Create or get Stripe customer
    let customerId = userRecord.stripe_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email, // Use email from Supabase Auth user
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await sql`
        UPDATE users 
        SET stripe_id = ${customerId}
        WHERE id = ${userId}
      `;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${STRIPE_CONFIG.cancelUrl}?plan_id=${planId}`,
      metadata: {
        userId: userId,
        planId: planId,
        influencerId: influencerId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          planId: planId,
          influencerId: influencerId,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: `Failed to create checkout session: ${error.message}` },
      { status: 500 }
    );
  }
}
