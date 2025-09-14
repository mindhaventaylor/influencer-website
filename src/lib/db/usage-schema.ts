import { pgTable, uuid, text, timestamp, integer, date, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, influencers } from './schema';

// User usage tracking table
export const userUsage = pgTable('user_usage', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  influencerId: uuid('influencer_id').notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  messagesSent: integer('messages_sent').default(0).notNull(),
  mediaMessagesSent: integer('media_messages_sent').default(0).notNull(),
  voiceMessagesSent: integer('voice_messages_sent').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.influencerId, table.date] }),
}));

// Define relationships
export const userUsageRelations = relations(userUsage, ({ one }) => ({
  user: one(users, {
    fields: [userUsage.userId],
    references: [users.id],
  }),
  influencer: one(influencers, {
    fields: [userUsage.influencerId],
    references: [influencers.id],
  }),
}));

// TypeScript types
export type UserUsage = typeof userUsage.$inferSelect;
export type NewUserUsage = typeof userUsage.$inferInsert;
