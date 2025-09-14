import { NextRequest, NextResponse } from 'next/server';
import { usageQueries } from '@/lib/db/usage-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const influencerId = searchParams.get('influencerId');
    const days = parseInt(searchParams.get('days') || '7');

    if (!userId || !influencerId) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, influencerId' },
        { status: 400 }
      );
    }

    // Get usage statistics
    const stats = await usageQueries.getUsageStats(userId, influencerId, days);
    const todayUsage = await usageQueries.getTodayUsage(userId, influencerId);

    return NextResponse.json({
      today: todayUsage,
      stats,
      period: {
        days,
        startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        endDate: new Date(),
      },
    });
  } catch (error) {
    console.error('Error getting usage data:', error);
    return NextResponse.json(
      { error: 'Failed to get usage data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, influencerId, messageType } = await request.json();

    if (!userId || !influencerId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, influencerId' },
        { status: 400 }
      );
    }

    // Increment message count
    const usage = await usageQueries.incrementMessageCount(userId, influencerId, messageType || 'text');

    return NextResponse.json({ success: true, usage });
  } catch (error) {
    console.error('Error updating usage:', error);
    return NextResponse.json(
      { error: 'Failed to update usage' },
      { status: 500 }
    );
  }
}
