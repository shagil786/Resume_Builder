import { pgTable, uuid, text, timestamp, pgEnum, integer, jsonb } from 'drizzle-orm/pg-core';
import { candidateProfiles } from './candidate-profiles';
import { resumeTemplates } from './resume-templates';
import { jobs } from './jobs';

export const resumeVersionStatus = pgEnum('resume_version_status', ['DRAFT', 'GENERATED', 'FINALIZED', 'ARCHIVED']);

export const resumeVersions = pgTable('resume_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => candidateProfiles.id),
  templateId: uuid('template_id').notNull().references(() => resumeTemplates.id),
  jobId: uuid('job_id').references(() => jobs.id),
  versionNumber: integer('version_number').notNull(),
  structuredData: jsonb('structured_data').notNull(),
  status: resumeVersionStatus('status').notNull().default('DRAFT'),
  generationRunId: uuid('generation_run_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  storagePath: text('storage_path'),
  pdfChecksum: text('pdf_checksum'),
});
