import { pgTable, uuid, text, date, real, jsonb } from 'drizzle-orm/pg-core';
import { candidateProfiles } from './candidate-profiles';

export const educationEntries = pgTable('education_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => candidateProfiles.id),
  institution: text('institution').notNull(),
  degree: text('degree').notNull(),
  fieldOfStudy: text('field_of_study').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  gpa: real('gpa'),
  factIds: jsonb('fact_ids').notNull().default([]),
});
