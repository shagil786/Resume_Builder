import { pgTable, uuid, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const jobSource = pgEnum('job_source', ['TEXT_INPUT', 'JOB_URL', 'API_IMPORT']);
export const jobStatus = pgEnum('job_status', ['ANALYZED', 'FAILED_ANALYSIS']);

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  source: jobSource('source').notNull(),
  sourceUrl: text('source_url'),
  rawText: text('raw_text').notNull(),
  title: text('title').notNull(),
  company: text('company').notNull(),
  location: text('location'),
  url: text('url'),
  extractedAt: timestamp('extracted_at', { withTimezone: true }),
  status: jobStatus('status').notNull().default('FAILED_ANALYSIS'),
});
