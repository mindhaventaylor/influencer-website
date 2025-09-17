import { NextRequest, NextResponse } from 'next/server';
import { postgres } from '@/lib/db';

export async function POST(request: NextRequest) {
  const sql = postgres;
  
  try {
    const { userId, influencerId, tokensToConsume = 1 } = await request.json();

    if (!userId || !influencerId) {
      return NextResponse.json(
        { error: 'User ID and Influencer ID are required' },
        { status: 400 }
      );
    }

    // Update tokens in conversations table
    const [conversation] = await sql`
      UPDATE conversations 
      SET tokens = GREATEST(tokens - ${tokensToConsume}, 0)
      WHERE user_id = ${userId} AND influencer_id = ${influencerId}
      RETURNING tokens
    `;

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      remaining_tokens: conversation.tokens
    });

  } catch (error) {
    console.error('Error consuming tokens:', error);
    return NextResponse.json(
      { error: 'Failed to consume tokens' },
      { status: 500 }
    );
  } finally {
    // Don't call sql.end() - let the connection pool handle it
  }
}