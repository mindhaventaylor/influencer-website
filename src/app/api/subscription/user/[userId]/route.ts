import { NextRequest, NextResponse } from 'next/server';
import { postgres } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const sql = postgres;
  
  try {
    const { userId } = await params;

    // Get user subscriptions from conversations table
    const conversations = await sql`
      SELECT 
        c.id,
        c.user_id,
        c.influencer_id,
        c.influencer_plan_ids,
        c.tokens,
        c.created_at,
        i.name as influencer_name
      FROM conversations c
      JOIN influencers i ON c.influencer_id = i.id
      WHERE c.user_id = ${userId}
      ORDER BY c.created_at DESC
    `;

    const subscriptions = conversations.map(conv => ({
      id: conv.id,
      user_id: conv.user_id,
      influencer_id: conv.influencer_id,
      influencer_name: conv.influencer_name,
      plan_ids: conv.influencer_plan_ids,
      tokens: conv.tokens,
      status: 'active',
      created_at: conv.created_at
    }));

    return NextResponse.json(subscriptions);

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