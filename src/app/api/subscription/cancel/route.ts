import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { email, password, reason } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Verify user credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
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

    // Here you would typically integrate with your payment provider (Stripe, etc.)
    // to cancel the subscription. For now, we'll just log it.
    
    // Example Stripe integration (uncomment and configure as needed):
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    // Get user's subscription from your database
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', authData.user.id)
      .single();

    if (subscription?.stripe_subscription_id) {
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    }
    */

    // Update subscription status in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason
      })
      .eq('user_id', authData.user.id);

    if (updateError) {
      console.error('Error updating subscription status:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      );
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

