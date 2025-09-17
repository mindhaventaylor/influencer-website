import { db } from './index';
import { users, influencers, plans, userSubscriptions, chatMessages } from './schema';
import { eq, and, desc, asc, isNull, inArray } from 'drizzle-orm';

// User operations
export const userQueries = {
  async create(userData: {
    id?: string;
    email: string;
    username?: string;
    displayName?: string;
    avatarUrl?: string;
    provider?: string;
    providerId?: string;
    stripeCustomerId?: string;
  }) {
    return await db.insert(users).values(userData).returning();
  },

  async getById(id: string) {
    const result = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      displayName: users.displayName,
      stripeCustomerId: users.stripeCustomerId,
      createdAt: users.createdAt
    }).from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0] || null;
  },

  async getByEmail(email: string) {
    const result = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      displayName: users.displayName,
      stripeCustomerId: users.stripeCustomerId,
      createdAt: users.createdAt
    }).from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] || null;
  },

  async getByStripeCustomerId(stripeCustomerId: string) {
    const result = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      displayName: users.displayName,
      stripeCustomerId: users.stripeCustomerId,
      createdAt: users.createdAt
    }).from(users)
      .where(eq(users.stripeCustomerId, stripeCustomerId))
      .limit(1);
    return result[0] || null;
  },

  async update(id: string, updates: Partial<typeof users.$inferInsert>) {
    return await db.update(users).set(updates)
      .where(eq(users.id, id)).returning();
  },

  async getAll() {
    return await db.select().from(users)
      .orderBy(desc(users.createdAt));
  },
};

// Influencer operations
export const influencerQueries = {
  async getAll() {
    return await db.select().from(influencers)
      .where(and(eq(influencers.isActive, true), isNull(influencers.deletedAt)))
      .orderBy(desc(influencers.createdAt));
  },

  async getById(id: string) {
    const result = await db.select().from(influencers)
      .where(and(eq(influencers.id, id), isNull(influencers.deletedAt)))
      .limit(1);
    return result[0] || null;
  },

  async getByHandle(handle: string) {
    const result = await db.select().from(influencers)
      .where(and(eq(influencers.handle, handle), isNull(influencers.deletedAt)))
      .limit(1);
    return result[0] || null;
  },

  async create(influencerData: typeof influencers.$inferInsert) {
    return await db.insert(influencers).values(influencerData).returning();
  },

  async update(id: string, updates: Partial<typeof influencers.$inferInsert>) {
    return await db.update(influencers).set({ ...updates, updatedAt: new Date() })
      .where(eq(influencers.id, id)).returning();
  },

  async delete(id: string) {
    return await db.update(influencers).set({ 
      deletedAt: new Date(),
      updatedAt: new Date(),
      isActive: false 
    }).where(eq(influencers.id, id)).returning();
  },
};

// Plan operations
export const planQueries = {
  async create(planData: typeof plans.$inferInsert) {
    return await db.insert(plans).values(planData).returning();
  },

  async getByInfluencerId(influencerId: string) {
    return await db.select().from(plans)
      .where(and(eq(plans.influencerId, influencerId), eq(plans.isActive, true)))
      .orderBy(asc(plans.priceCents));
  },

  async getById(id: string) {
    const result = await db.select().from(plans)
      .where(eq(plans.id, id))
      .limit(1);
    return result[0] || null;
  },

  async getByStripePriceId(stripePriceId: string) {
    const result = await db.select().from(plans)
      .where(eq(plans.stripePriceId, stripePriceId))
      .limit(1);
    return result[0] || null;
  },

  async update(id: string, updates: Partial<typeof plans.$inferInsert>) {
    return await db.update(plans).set({ ...updates, updatedAt: new Date() })
      .where(eq(plans.id, id)).returning();
  },

  async delete(id: string) {
    return await db.update(plans).set({ 
      isActive: false,
      updatedAt: new Date()
    }).where(eq(plans.id, id)).returning();
  },
};

// Subscription operations
export const subscriptionQueries = {
  async create(subscriptionData: typeof userSubscriptions.$inferInsert) {
    return await db.insert(userSubscriptions).values(subscriptionData).returning();
  },

  async getByUserId(userId: string) {
    return await db.select({
      subscription: userSubscriptions,
      plan: plans,
      influencer: influencers,
    })
    .from(userSubscriptions)
    .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
    .innerJoin(influencers, eq(userSubscriptions.influencerId, influencers.id))
    .where(eq(userSubscriptions.userId, userId))
    .orderBy(desc(userSubscriptions.createdAt));
  },

  async getByStripeSubscriptionId(stripeSubscriptionId: string) {
    const result = await db.select({
      subscription: userSubscriptions,
      plan: plans,
      influencer: influencers,
      user: users,
    })
    .from(userSubscriptions)
    .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
    .innerJoin(influencers, eq(userSubscriptions.influencerId, influencers.id))
    .innerJoin(users, eq(userSubscriptions.userId, users.id))
    .where(eq(userSubscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);
    return result[0] || null;
  },

  async getActiveByUserAndInfluencer(userId: string, influencerId: string) {
    const result = await db.select({
      subscription: userSubscriptions,
      plan: plans,
    })
    .from(userSubscriptions)
    .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
    .where(and(
      eq(userSubscriptions.userId, userId),
      eq(userSubscriptions.influencerId, influencerId),
      eq(userSubscriptions.status, 'active')
    ))
    .limit(1);
    return result[0] || null;
  },

  async update(id: string, updates: Partial<typeof userSubscriptions.$inferInsert>) {
    return await db.update(userSubscriptions).set({ ...updates, updatedAt: new Date() })
      .where(eq(userSubscriptions.id, id)).returning();
  },

  async updateByStripeSubscriptionId(stripeSubscriptionId: string, updates: Partial<typeof userSubscriptions.$inferInsert>) {
    return await db.update(userSubscriptions).set({ ...updates, updatedAt: new Date() })
      .where(eq(userSubscriptions.stripeSubscriptionId, stripeSubscriptionId)).returning();
  },

  async getActiveByUser(userId: string) {
    return await db.select({
      subscription: userSubscriptions,
      plan: plans,
      influencer: influencers,
    })
    .from(userSubscriptions)
    .innerJoin(plans, eq(userSubscriptions.planId, plans.id))
    .innerJoin(influencers, eq(userSubscriptions.influencerId, influencers.id))
    .where(and(
      eq(userSubscriptions.userId, userId),
      eq(userSubscriptions.status, 'active')
    ))
    .orderBy(desc(userSubscriptions.createdAt));
  },
};

// Chat message operations
export const messageQueries = {
  async create(messageData: typeof chatMessages.$inferInsert) {
    return await db.insert(chatMessages).values(messageData).returning();
  },

  async getByUserAndInfluencer(userId: string, influencerId: string, limit = 50, offset = 0) {
    return await db.select().from(chatMessages)
      .where(and(
        eq(chatMessages.userId, userId),
        eq(chatMessages.influencerId, influencerId),
        eq(chatMessages.isDeleted, false)
      ))
      .orderBy(asc(chatMessages.createdAt))
      .limit(limit)
      .offset(offset);
  },

  async getByUser(userId: string, limit = 50, offset = 0) {
    return await db.select({
      message: chatMessages,
      influencer: influencers,
    })
    .from(chatMessages)
    .innerJoin(influencers, eq(chatMessages.influencerId, influencers.id))
    .where(and(
      eq(chatMessages.userId, userId),
      eq(chatMessages.isDeleted, false)
    ))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit)
    .offset(offset);
  },

  async markAsRead(userId: string, influencerId: string) {
    return await db.update(chatMessages)
      .set({ readAt: new Date() })
      .where(and(
        eq(chatMessages.userId, userId),
        eq(chatMessages.influencerId, influencerId),
        eq(chatMessages.sender, 'influencer'),
        isNull(chatMessages.readAt)
      ));
  },

  async deleteMessage(messageId: number) {
    return await db.update(chatMessages)
      .set({ isDeleted: true })
      .where(eq(chatMessages.id, messageId)).returning();
  },

  async getUnreadCount(userId: string) {
    const result = await db.select({ count: chatMessages.id })
      .from(chatMessages)
      .where(and(
        eq(chatMessages.userId, userId),
        eq(chatMessages.sender, 'influencer'),
        isNull(chatMessages.readAt),
        eq(chatMessages.isDeleted, false)
      ));
    return result.length;
  },
};
