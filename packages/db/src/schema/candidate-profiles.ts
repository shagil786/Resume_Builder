import { pgTable, uuid, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const profileStatus = pgEnum('profile_status', ['DRAFT', 'FINALIZED']);
export const visibility = pgEnum('visibility', ['PRIVATE', 'PUBLIC_LINK']);

export const candidateProfiles = pgTable('candidate_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  personalInfo: jsonb('personal_info').notNull(),
  summary: text('summary'),
  visibility: visibility('visibility').notNull().default('PRIVATE'),
  status: profileStatus('status').notNull().default('DRAFT'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt: timestamp('archived_at', { withTimezone: true }),
  latestProcessedAt: timestamp('latest_processed_at', { withTimezone: true }),
});
