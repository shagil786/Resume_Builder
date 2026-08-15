import { pgTable, uuid, text, integer, jsonb } from 'drizzle-orm/pg-core';
import { workExperiences } from './work-experiences';

export const experienceBullets = pgTable('experience_bullets', {
  id: uuid('id').primaryKey().defaultRandom(),
  experienceId: uuid('experience_id').notNull().references(() => workExperiences.id),
  sortOrder: integer('sort_order').notNull().default(0),
  text: text('text').notNull(),
  factIds: jsonb('fact_ids').notNull().default([]),
  sourceReferences: jsonb('source_references').notNull().default([]),
});
