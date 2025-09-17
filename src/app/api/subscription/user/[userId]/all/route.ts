import { NextRequest, NextResponse } from 'next/server';
import { postgres } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const sql = postgres;
  
  try {
    const { userId } = await params;

    // Get all user subscriptions across all influencers
    const subscriptions = await sql`
      SELECT 
        us.id,
        us.user_id,
        us.influencer_id,
        us.plan_id,
        us.stripe_subscription_id,
        us.stripe_customer_id,
        us.status,
        us.current_period_start,
        us.current_period_end,
        us.cancel_at_period_end,
        us.created_at,
        i.name as influencer_name,
        p.name as plan_name,
        p.price_cents,
        p.interval as plan_interval
      FROM user_subscriptions us
      JOIN influencers i ON us.influencer_id = i.id
      LEFT JOIN plans p ON us.plan_id = p.id
      WHERE us.user_id = ${userId}
      ORDER BY us.created_at DESC
    `;

    const formattedSubscriptions = subscriptions.map(sub => ({
      id: sub.id,
      user_id: sub.user_id,
      influencer_id: sub.influencer_id,
      influencer_name: sub.influencer_name,
      plan_id: sub.plan_id,
      plan_name: sub.plan_name,
      price_cents: sub.price_cents,
      plan_interval: sub.plan_interval,
      stripe_subscription_id: sub.stripe_subscription_id,
      stripe_customer_id: sub.stripe_customer_id,
      status: sub.status,
      current_period_start: sub.current_period_start,
      current_period_end: sub.current_period_end,
      cancel_at_period_end: sub.cancel_at_period_end,
      created_at: sub.created_at
    }));

    return NextResponse.json(formattedSubscriptions);

  } catch (error) {
    console.error('Error fetching all user subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  } finally {
    // Don't call sql.end() - let the connection pool handle it
  }
}

