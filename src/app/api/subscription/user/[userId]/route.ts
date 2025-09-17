import { NextRequest, NextResponse } from 'next/server';
import { postgres } from '@/lib/db';
import { getInfluencerInfo } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const sql = postgres;
  
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const influencerId = searchParams.get('influencerId');

    // Get current influencer from config and resolve to database ID
    const currentInfluencer = getInfluencerInfo();
    let targetInfluencerId = influencerId;
    
    if (!targetInfluencerId) {
      // Look up influencer by name to get the database UUID
      const dbInfluencer = await sql`
        SELECT id FROM influencers 
        WHERE name = ${currentInfluencer.name} AND is_active = true
        LIMIT 1
      `;
      
      if (dbInfluencer.length > 0) {
        targetInfluencerId = dbInfluencer[0].id;
      } else {
        return NextResponse.json(
          { error: 'Influencer not found in database' },
          { status: 404 }
        );
      }
    }

    // Get user subscriptions from user_subscriptions table for the specific influencer
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
      WHERE us.user_id = ${userId} AND us.influencer_id = ${targetInfluencerId}
      ORDER BY us.created_at DESC
    `;

    // If no subscription exists, return empty array (user can subscribe)
    if (subscriptions.length === 0) {
      return NextResponse.json([]);
    }

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
    console.error('Error fetching user subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  } finally {
    // Don't call sql.end() - let the connection pool handle it
  }
}