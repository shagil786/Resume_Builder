import { pgTable, uuid, text, timestamp, pgEnum, bigint, jsonb } from 'drizzle-orm/pg-core';
import { candidateProfiles } from './candidate-profiles';

export const documentStatus = pgEnum('document_status', ['PENDING_PROCESSING', 'PROCESSED', 'FAILED']);

export const sourceDocuments = pgTable('source_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => candidateProfiles.id),
  filename: text('filename').notNull(),
  mimetype: text('mimetype').notNull(),
  size: bigint('size', { mode: 'number' }).notNull(),
  uploadDate: timestamp('upload_date', { withTimezone: true }).notNull().defaultNow(),
  storagePath: text('storage_path'),
  status: documentStatus('status').notNull().default('PENDING_PROCESSING'),
  processingError: text('processing_error'),
  extractedAt: timestamp('extracted_at', { withTimezone: true }),
  checksum: text('checksum'),
});
