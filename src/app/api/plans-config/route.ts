import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Return plans from config
    const plans = config.plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceCents: plan.priceCents,
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features,
      stripePriceId: plan.stripePriceId,
      isPopular: plan.isPopular || false,
    }));

    return NextResponse.json({ 
      plans: plans,
      total: plans.length
    });
  } catch (error) {
    console.error('Error fetching plans from config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans from config' },
      { status: 500 }
    );
  }
}

