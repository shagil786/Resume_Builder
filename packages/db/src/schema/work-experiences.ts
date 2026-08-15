import { pgTable, uuid, text, timestamp, date, integer, jsonb } from 'drizzle-orm/pg-core';
import { candidateProfiles } from './candidate-profiles';

export const workExperiences = pgTable('work_experiences', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => candidateProfiles.id),
  company: text('company').notNull(),
  title: text('title').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  location: text('location'),
  factIds: jsonb('fact_ids').notNull().default([]),
});
