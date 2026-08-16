import { pgTable, uuid, text, date, jsonb } from 'drizzle-orm/pg-core';
import { candidateProfiles } from './candidate-profiles';

export const certifications = pgTable('certifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => candidateProfiles.id),
  name: text('name').notNull(),
  issuingOrganization: text('issuing_organization').notNull(),
  issueDate: date('issue_date').notNull(),
  expiryDate: date('expiry_date'),
  credentialId: text('credential_id'),
  credentialUrl: text('credential_url'),
  factIds: jsonb('fact_ids').notNull().default([]),
});
