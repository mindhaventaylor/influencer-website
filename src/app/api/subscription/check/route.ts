import { NextRequest, NextResponse } from 'next/server';
import { getUserAccessLevel, getUserPermissions, hasActiveSubscription } from '@/lib/access-control';
import { subscriptionQueries } from '@/lib/db/queries';
import { usageQueries } from '@/lib/db/usage-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const influencerId = searchParams.get('influencerId');

    if (!userId || !influencerId) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, influencerId' },
        { status: 400 }
      );
    }

    // Get user's access level and permissions
    const accessLevel = await getUserAccessLevel(userId, influencerId);
    const permissions = await getUserPermissions(userId, influencerId);
    const hasSubscription = await hasActiveSubscription(userId, influencerId);

    // Get current usage
    const totalMessagesToday = await usageQueries.getTotalMessagesToday(userId, influencerId);
    const messageLimit = await usageQueries.canSendMessage(userId, influencerId, permissions.maxMessagesPerDay);

    // Get subscription details if exists
    let subscriptionDetails = null;
    if (hasSubscription) {
      const subscription = await subscriptionQueries.getActiveByUserAndInfluencer(userId, influencerId);
      subscriptionDetails = subscription;
    }

    return NextResponse.json({
      accessLevel,
      permissions,
      hasActiveSubscription: hasSubscription,
      subscriptionDetails,
      usage: {
        messagesToday: totalMessagesToday,
        messageLimit,
      },
    });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    );
  }
}
