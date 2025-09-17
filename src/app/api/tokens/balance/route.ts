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
    const tokens = await Promise.all(conversations.map(async (conv) => {
      // Get plan names from influencer_plan_ids
      let planName = 'Free Plan';
      let planInterval = 'month';
      
      if (conv.influencer_plan_ids && Array.isArray(conv.influencer_plan_ids) && conv.influencer_plan_ids.length > 0) {
        // Get the first plan ID to fetch the actual plan name
        const planId = conv.influencer_plan_ids[0];
        if (planId) {
          try {
            const planData = await sql`
              SELECT name, interval 
              FROM plans 
              WHERE id = ${planId} AND influencer_id = ${targetInfluencerId}
              LIMIT 1
            `;
            
            if (planData.length > 0) {
              planName = planData[0].name;
              planInterval = planData[0].interval;
            }
          } catch (error) {
            console.error('Error fetching plan data:', error);
            // Fallback to token-based naming
            if (conv.tokens >= 1000) {
              planName = 'Premium Plan';
            } else if (conv.tokens >= 500) {
              planName = 'Standard Plan';
            } else if (conv.tokens >= 100) {
              planName = 'Basic Plan';
            }
          }
        }
      }

      return {
        id: conv.id,
        token_type: 'subscription',
        total_tokens: conv.tokens || 0,
        used_tokens: 0,
        remaining_tokens: conv.tokens || 0,
        expires_at: null,
        auto_renew: true,
        plan_name: planName,
        plan_interval: planInterval,
        influencer_name: conv.influencer_name || 'Unknown'
      };
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