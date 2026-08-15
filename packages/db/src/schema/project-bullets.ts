import { pgTable, uuid, text, integer, jsonb } from 'drizzle-orm/pg-core';
import { projectEntries } from './project-entries';

export const projectBullets = pgTable('project_bullets', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projectEntries.id),
  sortOrder: integer('sort_order').notNull().default(0),
  text: text('text').notNull(),
  factIds: jsonb('fact_ids').notNull().default([]),
  sourceReferences: jsonb('source_references').notNull().default([]),
});
