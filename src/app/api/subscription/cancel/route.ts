import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getInfluencerConfig } from '@/lib/config';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { email, password, reason } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get Supabase configuration
    const config = getInfluencerConfig();
    const supabaseUrl = config.database.supabase.url;
    const supabaseServiceKey = config.database.supabase.serviceRoleKey;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create service client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user credentials using service client
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Log the cancellation request (optional - for analytics)
    console.log('Subscription cancellation requested:', {
      userId: authData.user.id,
      email,
      reason,
      timestamp: new Date().toISOString(),
    });

    const userId = authData.user.id;

    // Get user's subscriptions from user_subscriptions table
    const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('stripe_subscription_id, id')
      .eq('user_id', userId);

    if (subscriptionsError) {
      console.error('Error fetching user subscriptions:', subscriptionsError);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    // Cancel subscriptions in Stripe and update database
    for (const subscription of subscriptions || []) {
      if (subscription.stripe_subscription_id) {
        try {
          await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
          console.log(`Cancelled Stripe subscription: ${subscription.stripe_subscription_id}`);
        } catch (stripeError) {
          console.error('Error cancelling Stripe subscription:', stripeError);
          // Continue with database update even if Stripe fails
        }
      }

      // Update subscription status in database
      const { error: updateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason
        })
        .eq('id', subscription.id);

      if (updateError) {
        console.error('Error updating subscription status:', updateError);
      }
    }

    return NextResponse.json({ 
      message: 'Subscription cancelled successfully' 
    });

  } catch (error) {
    console.error('Error in cancel-subscription API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

