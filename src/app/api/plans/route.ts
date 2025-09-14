import { NextRequest, NextResponse } from 'next/server';
import { postgres } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const influencerId = searchParams.get('influencerId');

    const sql = postgres;

    let query = sql`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price_cents,
        p.currency,
        p.interval,
        p.influencer_id,
        p.features,
        p.is_active,
        p.stripe_price_id,
        p.stripe_product_id,
        p.access_level,
        i.handle as influencer_handle,
        i.display_name as influencer_name
      FROM plans p
      JOIN influencers i ON p.influencer_id = i.id
      WHERE p.is_active = true
    `;

    if (influencerId) {
      query = sql`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.price_cents,
          p.currency,
          p.interval,
          p.influencer_id,
          p.features,
          p.is_active,
          p.stripe_price_id,
          p.stripe_product_id,
          p.access_level,
          i.handle as influencer_handle,
          i.display_name as influencer_name
        FROM plans p
        JOIN influencers i ON p.influencer_id = i.id
        WHERE p.is_active = true AND p.influencer_id = ${influencerId}
      `;
    }

    const plans = await query;

    // Transform the plans to match the expected format
    const transformedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceCents: plan.price_cents,
      currency: plan.currency,
      interval: plan.interval,
      influencerId: plan.influencer_id,
      features: Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features || '[]'),
      isActive: plan.is_active,
      stripePriceId: plan.stripe_price_id,
      stripeProductId: plan.stripe_product_id,
      accessLevel: plan.access_level || 'basic',
      isPopular: plan.access_level === 'premium',
      influencerHandle: plan.influencer_handle,
      influencerName: plan.influencer_name
    }));

    return NextResponse.json({ 
      plans: transformedPlans,
      total: transformedPlans.length
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const planData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'priceCents', 'interval', 'influencerId'];
    for (const field of requiredFields) {
      if (!planData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const plan = await planQueries.create(planData);

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}
