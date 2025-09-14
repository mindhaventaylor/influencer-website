import { NextRequest, NextResponse } from 'next/server';
import { postgres } from '@/lib/db';
import { getInfluencerInfo } from '@/lib/config';

export async function GET(request: NextRequest) {
  const sql = postgres;
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const influencerId = searchParams.get('influencerId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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

    // Get token balance from conversations table for the specific influencer only
    const conversations = await sql`
      SELECT 
        c.id,
        c.tokens,
        c.influencer_plan_ids,
        c.created_at,
        i.name as influencer_name
      FROM conversations c
      LEFT JOIN influencers i ON c.influencer_id = i.id
      WHERE c.user_id = ${userId} AND c.influencer_id = ${targetInfluencerId}
      ORDER BY c.created_at DESC
    `;

    // Transform the data to match the expected interface
    const tokens = conversations.map(conv => ({
      id: conv.id,
      token_type: 'subscription', // Default type
      total_tokens: conv.tokens || 0,
      used_tokens: 0,
      remaining_tokens: conv.tokens || 0,
      expires_at: null,
      auto_renew: true,
      plan_name: 'Subscription Plan',
      plan_interval: 'month',
      influencer_name: conv.influencer_name || 'Unknown'
    }));

    const totalTokens = tokens.reduce((sum, token) => sum + token.total_tokens, 0);

    const tokenBalance = {
      tokens,
      totalTokens,
      byInfluencer: tokens.reduce((acc, token) => {
        const influencerName = token.influencer_name;
        if (!acc[influencerName]) {
          acc[influencerName] = {
            influencerName,
            totalTokens: 0,
            tokens: []
          };
        }
        acc[influencerName].totalTokens += token.total_tokens;
        acc[influencerName].tokens.push(token);
        return acc;
      }, {} as Record<string, any>)
    };

    return NextResponse.json(tokenBalance);

  } catch (error) {
    console.error('Error fetching token balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token balance' },
      { status: 500 }
    );
  } finally {
    // Don't call sql.end() - let the connection pool handle it
  }
}