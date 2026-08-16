import { pgTable, uuid, text, date, jsonb } from 'drizzle-orm/pg-core';
import { candidateProfiles } from './candidate-profiles';

export const projectEntries = pgTable('project_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => candidateProfiles.id),
  name: text('name').notNull(),
  description: text('description').notNull(),
  url: text('url'),
  githubUrl: text('github_url'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  factIds: jsonb('fact_ids').notNull().default([]),
});
