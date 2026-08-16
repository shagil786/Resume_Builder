import { pgTable, uuid, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { candidateProfiles } from './candidate-profiles';
import { jobs } from './jobs';

export const generationStatus = pgEnum('generation_status', ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']);

export const generationRuns = pgTable('generation_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => candidateProfiles.id),
  jobId: uuid('job_id').references(() => jobs.id),
  templateId: text('template_id').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  status: generationStatus('status').notNull().default('PENDING'),
  stages: jsonb('stages').notNull().default([]),
  errors: jsonb('errors'),
});
