import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { email, username, display_name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Get the current user from the auth token
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

    // Create Stripe customer for the user
    let stripeCustomerId = null;
    try {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: display_name || username || user.email,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = stripeCustomer.id;
      console.log(`Created Stripe customer: ${stripeCustomerId} for user: ${user.id}`);
    } catch (stripeError) {
      console.error('Error creating Stripe customer:', stripeError);
      // Continue without Stripe customer - they can still use the app
    }

    // Create user profile in the database
    const { error: insertError } = await supabase
      .from('users')
      .upsert([{ 
        id: user.id, 
        email: user.email,
        username: username || null,
        display_name: display_name || null,
        stripe_customer_id: stripeCustomerId
      }], { 
        onConflict: 'id',
        ignoreDuplicates: false 
      });

    if (insertError) {
      console.error("Error inserting user into public.users:", insertError);
      return NextResponse.json(
        { error: `Failed to create user profile: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, username, display_name }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

