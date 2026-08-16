import { pgTable, uuid, text, pgEnum, real, boolean } from 'drizzle-orm/pg-core';
import { candidateFacts } from './candidate-facts';

export const extractionMethod = pgEnum('extraction_method', ['PDF_PARSER', 'DOCX_PARSER', 'OCR', 'USER_INPUT']);

export const factProvenance = pgTable('fact_provenance', {
  factId: uuid('fact_id').primaryKey().references(() => candidateFacts.id),
  sourceId: text('source_id').notNull(),
  extractionMethod: extractionMethod('extraction_method').notNull(),
  humanVerified: boolean('human_verified').notNull().default(false),
  verificationNotes: text('verification_notes'),
  confidenceAtExtraction: real('confidence_at_extraction').notNull(),
});
