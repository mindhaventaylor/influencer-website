import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { userQueries } from '@/lib/db/queries';
import { getInfluencerConfig } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Get the user details
    const user = await userQueries.getById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create Stripe customer if one doesn't exist
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      console.log(`Creating Stripe customer for user: ${user.id}`);
      try {
        const stripeCustomer = await stripe.customers.create({
          email: user.email,
          name: user.displayName || user.username || user.email,
          metadata: {
            userId: user.id,
          },
        });
        customerId = stripeCustomer.id;
        
        // Update user with the new customer ID
        await userQueries.update(user.id, { stripeCustomerId: customerId });
        console.log(`Created and saved Stripe customer: ${customerId} for user: ${user.id}`);
      } catch (stripeError) {
        console.error('Error creating Stripe customer:', stripeError);
        return NextResponse.json(
          { error: 'Failed to create Stripe customer' },
          { status: 500 }
        );
      }
    }

    // Create Stripe customer portal session
    const config = getInfluencerConfig();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${config.deployment?.baseUrl || 'http://localhost:3003'}/profile`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
