import { subscriptionQueries } from './db/queries';
import { User, UserSubscription, Plan } from './db/schema';

// Access levels for different subscription tiers
export const ACCESS_LEVELS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  VIP: 'vip',
} as const;

export type AccessLevel = typeof ACCESS_LEVELS[keyof typeof ACCESS_LEVELS];

// Feature permissions for each access level
export const ACCESS_PERMISSIONS = {
  [ACCESS_LEVELS.FREE]: {
    maxMessagesPerDay: 3,
    maxMessageLength: 100,
    canSendMedia: false,
    canAccessExclusiveContent: false,
    responsePriority: 'low',
    maxConversationLength: 10,
    canUseVoiceMessages: false,
    canAccessAnalytics: false,
  },
  [ACCESS_LEVELS.BASIC]: {
    maxMessagesPerDay: 20,
    maxMessageLength: 500,
    canSendMedia: true,
    canAccessExclusiveContent: false,
    responsePriority: 'medium',
    maxConversationLength: 50,
    canUseVoiceMessages: false,
    canAccessAnalytics: false,
  },
  [ACCESS_LEVELS.PREMIUM]: {
    maxMessagesPerDay: 100,
    maxMessageLength: 1000,
    canSendMedia: true,
    canAccessExclusiveContent: true,
    responsePriority: 'high',
    maxConversationLength: 200,
    canUseVoiceMessages: true,
    canAccessAnalytics: true,
  },
  [ACCESS_LEVELS.VIP]: {
    maxMessagesPerDay: -1, // unlimited
    maxMessageLength: -1, // unlimited
    canSendMedia: true,
    canAccessExclusiveContent: true,
    responsePriority: 'highest',
    maxConversationLength: -1, // unlimited
    canUseVoiceMessages: true,
    canAccessAnalytics: true,
  },
};

// Map plan names to access levels
export function getAccessLevelFromPlan(planName: string): AccessLevel {
  const name = planName.toLowerCase();
  
  if (name.includes('vip')) return ACCESS_LEVELS.VIP;
  if (name.includes('premium')) return ACCESS_LEVELS.PREMIUM;
  if (name.includes('basic')) return ACCESS_LEVELS.BASIC;
  
  return ACCESS_LEVELS.FREE;
}

// Get user's access level for a specific influencer
export async function getUserAccessLevel(
  userId: string,
  influencerId: string
): Promise<AccessLevel> {
  try {
    const subscription = await subscriptionQueries.getActiveByUserAndInfluencer(
      userId,
      influencerId
    );

    if (!subscription) {
      return ACCESS_LEVELS.FREE;
    }

    return getAccessLevelFromPlan(subscription.plan.name);
  } catch (error) {
    console.error('Error getting user access level:', error);
    return ACCESS_LEVELS.FREE;
  }
}

// Check if user has specific permission
export async function hasPermission(
  userId: string,
  influencerId: string,
  permission: keyof typeof ACCESS_PERMISSIONS[AccessLevel]
): Promise<boolean> {
  const accessLevel = await getUserAccessLevel(userId, influencerId);
  const permissions = ACCESS_PERMISSIONS[accessLevel];
  
  return permissions[permission] === true;
}

// Get user's permissions for a specific influencer
export async function getUserPermissions(
  userId: string,
  influencerId: string
): Promise<typeof ACCESS_PERMISSIONS[AccessLevel]> {
  const accessLevel = await getUserAccessLevel(userId, influencerId);
  return ACCESS_PERMISSIONS[accessLevel];
}

// Check if user can send a message (rate limiting)
export async function canSendMessage(
  userId: string,
  influencerId: string
): Promise<{ canSend: boolean; reason?: string; resetTime?: Date }> {
  const permissions = await getUserPermissions(userId, influencerId);
  
  if (permissions.maxMessagesPerDay === -1) {
    return { canSend: true };
  }

  // Get today's message count for this user and influencer
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // This would need to be implemented in your message queries
  // For now, we'll assume they can send
  // You'll need to add a method to count messages by date range
  
  return { canSend: true };
}

// Check if user can send media
export async function canSendMedia(
  userId: string,
  influencerId: string
): Promise<boolean> {
  return await hasPermission(userId, influencerId, 'canSendMedia');
}

// Check if user can access exclusive content
export async function canAccessExclusiveContent(
  userId: string,
  influencerId: string
): Promise<boolean> {
  return await hasPermission(userId, influencerId, 'canAccessExclusiveContent');
}

// Get response priority for user
export async function getResponsePriority(
  userId: string,
  influencerId: string
): Promise<'low' | 'medium' | 'high' | 'highest'> {
  const permissions = await getUserPermissions(userId, influencerId);
  return permissions.responsePriority as 'low' | 'medium' | 'high' | 'highest';
}

// Utility function to format access level for display
export function formatAccessLevel(accessLevel: AccessLevel): string {
  return accessLevel.charAt(0).toUpperCase() + accessLevel.slice(1);
}

// Check if user has any active subscription for an influencer
export async function hasActiveSubscription(
  userId: string,
  influencerId: string
): Promise<boolean> {
  const subscription = await subscriptionQueries.getActiveByUserAndInfluencer(
    userId,
    influencerId
  );
  return subscription !== null;
}

// Check if access level A is higher than or equal to access level B
export function isHigherLevel(levelA: AccessLevel, levelB: AccessLevel): boolean {
  const levels = [ACCESS_LEVELS.FREE, ACCESS_LEVELS.BASIC, ACCESS_LEVELS.PREMIUM, ACCESS_LEVELS.VIP];
  return levels.indexOf(levelA) >= levels.indexOf(levelB);
}
