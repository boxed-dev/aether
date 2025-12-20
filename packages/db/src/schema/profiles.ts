import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().unique(),
  handle: text('handle').notNull().unique(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  isPublic: boolean('is_public').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
