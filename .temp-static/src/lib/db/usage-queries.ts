import { db } from './index';
import { userUsage } from './usage-schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// Usage tracking operations
export const usageQueries = {
  async getTodayUsage(userId: string, influencerId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db.select().from(userUsage)
      .where(and(
        eq(userUsage.userId, userId),
        eq(userUsage.influencerId, influencerId),
        eq(userUsage.date, today.toISOString().split('T')[0])
      ))
      .limit(1);
    
    return result[0] || null;
  },

  async incrementMessageCount(userId: string, influencerId: string, messageType: 'text' | 'media' | 'voice' = 'text') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = today.toISOString().split('T')[0];
    
    // Try to update existing record
    const updateField = messageType === 'media' ? 'mediaMessagesSent' : 
                       messageType === 'voice' ? 'voiceMessagesSent' : 'messagesSent';
    
    const result = await db.update(userUsage)
      .set({ 
        [updateField]: userUsage[updateField] + 1,
        updatedAt: new Date()
      })
      .where(and(
        eq(userUsage.userId, userId),
        eq(userUsage.influencerId, influencerId),
        eq(userUsage.date, dateStr)
      ))
      .returning();
    
    if (result.length > 0) {
      return result[0];
    }
    
    // Create new record if none exists
    const newUsage = {
      userId,
      influencerId,
      date: dateStr,
      messagesSent: messageType === 'text' ? 1 : 0,
      mediaMessagesSent: messageType === 'media' ? 1 : 0,
      voiceMessagesSent: messageType === 'voice' ? 1 : 0,
    };
    
    return await db.insert(userUsage).values(newUsage).returning();
  },

  async getUsageInDateRange(
    userId: string, 
    influencerId: string, 
    startDate: Date, 
    endDate: Date
  ) {
    return await db.select().from(userUsage)
      .where(and(
        eq(userUsage.userId, userId),
        eq(userUsage.influencerId, influencerId),
        gte(userUsage.date, startDate.toISOString().split('T')[0]),
        lte(userUsage.date, endDate.toISOString().split('T')[0])
      ))
      .orderBy(userUsage.date);
  },

  async getTotalMessagesToday(userId: string, influencerId: string): Promise<number> {
    const usage = await this.getTodayUsage(userId, influencerId);
    if (!usage) return 0;
    
    return usage.messagesSent + usage.mediaMessagesSent + usage.voiceMessagesSent;
  },

  async canSendMessage(userId: string, influencerId: string, maxMessages: number): Promise<{
    canSend: boolean;
    currentCount: number;
    maxAllowed: number;
    resetTime: Date;
  }> {
    const currentCount = await this.getTotalMessagesToday(userId, influencerId);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return {
      canSend: maxMessages === -1 || currentCount < maxMessages,
      currentCount,
      maxAllowed: maxMessages,
      resetTime: tomorrow,
    };
  },

  async resetUsageForUser(userId: string, influencerId: string, date?: Date) {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    return await db.delete(userUsage)
      .where(and(
        eq(userUsage.userId, userId),
        eq(userUsage.influencerId, influencerId),
        eq(userUsage.date, dateStr)
      ));
  },

  async getUsageStats(userId: string, influencerId: string, days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const usage = await this.getUsageInDateRange(userId, influencerId, startDate, endDate);
    
    const totalMessages = usage.reduce((sum, day) => 
      sum + day.messagesSent + day.mediaMessagesSent + day.voiceMessagesSent, 0
    );
    
    const totalMedia = usage.reduce((sum, day) => sum + day.mediaMessagesSent, 0);
    const totalVoice = usage.reduce((sum, day) => sum + day.voiceMessagesSent, 0);
    
    return {
      totalMessages,
      totalMedia,
      totalVoice,
      averagePerDay: Math.round(totalMessages / Math.max(days, 1)),
      usageByDay: usage,
    };
  },
};
