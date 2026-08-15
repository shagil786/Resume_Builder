import { pgTable, uuid, text, pgEnum, real, timestamp, integer } from 'drizzle-orm/pg-core';
import { candidateProfiles } from './candidate-profiles';

export const skillProficiency = pgEnum('skill_proficiency', ['ENTRY', 'JUNIOR', 'INTERMEDIATE', 'SENIOR', 'EXPERT']);

export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => candidateProfiles.id),
  name: text('name').notNull(),
  category: text('category').notNull(),
  yearsOfExperience: real('years_of_experience'),
  proficiency: skillProficiency('proficiency'),
  factId: uuid('fact_id'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
});
