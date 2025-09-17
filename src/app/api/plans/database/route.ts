import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Return plans from config instead of database
    const plans = config.plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price_cents: plan.priceCents,
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features,
      access_level: plan.accessLevel,
      is_popular: plan.isPopular,
      stripe_price_id: plan.stripePriceId,
      stripe_product_id: config.stripe.products[plan.id]
    }));

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans from config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}