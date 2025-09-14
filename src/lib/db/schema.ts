import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, bigint, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const messageSenderEnum = pgEnum('message_sender', ['user', 'influencer', 'system']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'trialing']);
export const planIntervalEnum = pgEnum('plan_interval', ['month', 'year', 'week', 'day']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  username: text('username'),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  provider: text('provider'),
  providerId: text('provider_id'),
  stripeCustomerId: text('stripe_customer_id'), // Add Stripe customer ID
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Influencers table
export const influencers = pgTable('influencers', {
  id: uuid('id').primaryKey().defaultRandom(),
  handle: text('handle').notNull(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  prompt: text('prompt'),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  modelPreset: jsonb('model_preset'),
  priceCents: integer('price_cents').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Plans table for subscription plans
export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  currency: text('currency').default('usd').notNull(),
  interval: planIntervalEnum('interval').notNull(),
  influencerId: uuid('influencer_id').notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  features: jsonb('features'), // Array of features
  isActive: boolean('is_active').default(true).notNull(),
  stripePriceId: text('stripe_price_id'), // Stripe price ID
  stripeProductId: text('stripe_product_id'), // Stripe product ID
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// User subscriptions table
export const userSubscriptions = pgTable('user_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  influencerId: uuid('influencer_id').notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').notNull().references(() => plans.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id').notNull(),
  stripeCustomerId: text('stripe_customer_id').notNull(),
  status: subscriptionStatusEnum('status').notNull(),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Chat messages table
export const chatMessages = pgTable('chat_messages', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  influencerId: uuid('influencer_id').notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  sender: messageSenderEnum('sender').notNull(),
  content: text('content'),
  contentType: text('content_type').default('text').notNull(),
  mediaUrl: text('media_url'),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  contentTsv: text('content_tsv'),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(userSubscriptions),
  chatMessages: many(chatMessages),
}));

export const influencersRelations = relations(influencers, ({ many }) => ({
  plans: many(plans),
  subscriptions: many(userSubscriptions),
  chatMessages: many(chatMessages),
}));

export const plansRelations = relations(plans, ({ one, many }) => ({
  influencer: one(influencers, {
    fields: [plans.influencerId],
    references: [influencers.id],
  }),
  subscriptions: many(userSubscriptions),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
  influencer: one(influencers, {
    fields: [userSubscriptions.influencerId],
    references: [influencers.id],
  }),
  plan: one(plans, {
    fields: [userSubscriptions.planId],
    references: [plans.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
  influencer: one(influencers, {
    fields: [chatMessages.influencerId],
    references: [influencers.id],
  }),
}));

// TypeScript types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Influencer = typeof influencers.$inferSelect;
export type NewInfluencer = typeof influencers.$inferInsert;
export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
