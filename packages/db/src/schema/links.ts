import { pgTable, text, timestamp, uuid, integer, boolean, index } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

export const links = pgTable('links', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  icon: text('icon'),
  position: integer('position').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  clickCount: integer('click_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  profileIdIdx: index('links_profile_id_idx').on(table.profileId),
}));

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
