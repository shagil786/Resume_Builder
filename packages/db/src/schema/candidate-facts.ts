import { pgTable, uuid, text, timestamp, pgEnum, real, integer, jsonb } from 'drizzle-orm/pg-core';
import { candidateProfiles } from './candidate-profiles';

export const factStatus = pgEnum('fact_status', ['EXTRACTED', 'USER_PROVIDED', 'VERIFIED', 'REJECTED', 'NEEDS_REVIEW']);
export const factCategory = pgEnum('fact_category', ['WORK', 'SKILL', 'PROJECT', 'EDUCATION', 'CERTIFICATION', 'ACHIEVEMENT']);

export const candidateFacts = pgTable('candidate_facts', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => candidateProfiles.id),
  sourceRef: text('source_ref').notNull(),
  sourceLocation: jsonb('source_location'),
  claim: text('claim').notNull(),
  context: text('context').notNull(),
  confidence: real('confidence').notNull(),
  status: factStatus('status').notNull().default('EXTRACTED'),
  category: factCategory('category').notNull(),
  version: integer('version').notNull().default(1),
  verificationNotes: text('verification_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
