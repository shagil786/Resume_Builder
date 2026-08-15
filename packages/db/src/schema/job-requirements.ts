import { pgTable, uuid, text, pgEnum, real } from 'drizzle-orm/pg-core';
import { jobs } from './jobs';

export const requirementType = pgEnum('requirement_type', ['HARD', 'SOFT', 'NICE_TO_HAVE']);
export const requirementCategory = pgEnum('requirement_category', ['TECHNICAL', 'EXPERIENCE', 'SKILL', 'EDUCATION', 'SOFT']);

export const jobRequirements = pgTable('job_requirements', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id),
  type: requirementType('type').notNull(),
  category: requirementCategory('category').notNull(),
  text: text('text').notNull(),
  originalText: text('original_text').notNull(),
  weight: real('weight').notNull(),
  matchedFactIds: text('matched_fact_ids').array(),
  coverageScore: real('coverage_score'),
});
