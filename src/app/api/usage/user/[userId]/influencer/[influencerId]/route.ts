import { NextRequest, NextResponse } from 'next/server';
import { postgres } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; influencerId: string }> }
) {
  const sql = postgres;
  
  try {
    const { userId, influencerId } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Optional: specific date, defaults to today

    const targetDate = date ? new Date(date) : new Date();
    const dateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get usage for the specific date
    const usage = await sql`
      SELECT 
        user_id,
        influencer_id,
        date,
        messages_sent,
        media_messages_sent,
        voice_messages_sent,
        created_at,
        updated_at
      FROM user_usage 
      WHERE user_id = ${userId} 
        AND influencer_id = ${influencerId} 
        AND date = ${dateString}
      LIMIT 1
    `;

    // If no usage record exists, return default values
    if (usage.length === 0) {
      return NextResponse.json({
        user_id: userId,
        influencer_id: influencerId,
        date: dateString,
        messages_sent: 0,
        media_messages_sent: 0,
        voice_messages_sent: 0,
        total_messages: 0,
        created_at: null,
        updated_at: null
      });
    }

    const usageData = usage[0];
    return NextResponse.json({
      user_id: usageData.user_id,
      influencer_id: usageData.influencer_id,
      date: usageData.date,
      messages_sent: usageData.messages_sent,
      media_messages_sent: usageData.media_messages_sent,
      voice_messages_sent: usageData.voice_messages_sent,
      total_messages: usageData.messages_sent + usageData.media_messages_sent + usageData.voice_messages_sent,
      created_at: usageData.created_at,
      updated_at: usageData.updated_at
    });

  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  } finally {
    // Don't call sql.end() - let the connection pool handle it
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; influencerId: string }> }
) {
  const sql = postgres;
  
  try {
    const { userId, influencerId } = await params;
    const { messageType = 'text' } = await request.json(); // 'text', 'media', 'voice'

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Increment the appropriate counter
    let updateField = 'messages_sent';
    if (messageType === 'media') {
      updateField = 'media_messages_sent';
    } else if (messageType === 'voice') {
      updateField = 'voice_messages_sent';
    }

    // Use UPSERT to create or update usage record
    const result = await sql`
      INSERT INTO user_usage (user_id, influencer_id, date, ${sql(updateField)})
      VALUES (${userId}, ${influencerId}, ${today}, 1)
      ON CONFLICT (user_id, influencer_id, date)
      DO UPDATE SET 
        ${sql(updateField)} = user_usage.${sql(updateField)} + 1,
        updated_at = now()
      RETURNING *
    `;

    return NextResponse.json({
      user_id: result[0].user_id,
      influencer_id: result[0].influencer_id,
      date: result[0].date,
      messages_sent: result[0].messages_sent,
      media_messages_sent: result[0].media_messages_sent,
      voice_messages_sent: result[0].voice_messages_sent,
      total_messages: result[0].messages_sent + result[0].media_messages_sent + result[0].voice_messages_sent,
      created_at: result[0].created_at,
      updated_at: result[0].updated_at
    });

  } catch (error) {
    console.error('Error updating usage data:', error);
    return NextResponse.json(
      { error: 'Failed to update usage data' },
      { status: 500 }
    );
  } finally {
    // Don't call sql.end() - let the connection pool handle it
  }
}

