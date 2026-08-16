import { eq } from 'drizzle-orm';
import type { DB, TX } from './types';
import { sourceDocuments } from '../schema';
import type { SourceDocument } from '@resume-builder/domain';

export interface ISourceDocumentRepository {
  findById(id: string): Promise<SourceDocument | null>;
  findByProfileId(profileId: string): Promise<SourceDocument[]>;
  findByStatus(status: string): Promise<SourceDocument[]>;
  create(data: Omit<SourceDocument, 'id' | 'uploadDate'>): Promise<SourceDocument>;
  update(id: string, data: Partial<SourceDocument>): Promise<SourceDocument | null>;
  updateStatus(id: string, status: string): Promise<SourceDocument | null>;
  updateExtractedAt(id: string, extractedAt: Date): Promise<SourceDocument | null>;
  delete(id: string): Promise<boolean>;
}

export function createSourceDocumentRepository(db: DB | TX): ISourceDocumentRepository {
  return {
    async findById(id) {
      const row = await db.select().from(sourceDocuments).where(eq(sourceDocuments.id, id)).limit(1);
      return row[0] ? dbRowToDocument(row[0]) : null;
    },

    async findByProfileId(profileId) {
      const rows = await db.select().from(sourceDocuments).where(eq(sourceDocuments.profileId, profileId));
      return rows.map(dbRowToDocument);
    },

    async findByStatus(status) {
      const rows = await db.select().from(sourceDocuments).where(eq(sourceDocuments.status, status as typeof sourceDocuments.$inferSelect.status));
      return rows.map(dbRowToDocument);
    },

    async create(data) {
      const row = await db.insert(sourceDocuments).values({
        profileId: data.profileId,
        filename: data.filename,
        mimetype: data.mimetype,
        size: data.size,
        storagePath: data.storagePath ?? null,
        status: data.status,
        checksum: data.checksum ?? null,
      }).returning();
      return dbRowToDocument(row[0]);
    },

    async update(id, data) {
      const row = await db.update(sourceDocuments)
        .set({
          filename: data.filename,
          mimetype: data.mimetype,
          size: data.size,
          storagePath: data.storagePath,
          checksum: data.checksum,
        })
        .where(eq(sourceDocuments.id, id))
        .returning();
      return row[0] ? dbRowToDocument(row[0]) : null;
    },

    async updateStatus(id, status) {
      const row = await db.update(sourceDocuments)
        .set({ status: status as typeof sourceDocuments.$inferSelect.status })
        .where(eq(sourceDocuments.id, id))
        .returning();
      return row[0] ? dbRowToDocument(row[0]) : null;
    },

    async updateExtractedAt(id, extractedAt) {
      const row = await db.update(sourceDocuments)
        .set({ extractedAt })
        .where(eq(sourceDocuments.id, id))
        .returning();
      return row[0] ? dbRowToDocument(row[0]) : null;
    },

    async delete(id) {
      const row = await db.delete(sourceDocuments).where(eq(sourceDocuments.id, id)).returning({ id: sourceDocuments.id });
      return row.length > 0;
    },
  };
}

function dbRowToDocument(row: typeof sourceDocuments.$inferSelect): SourceDocument {
  return {
    id: row.id,
    profileId: row.profileId,
    filename: row.filename,
    mimetype: row.mimetype,
    size: row.size,
    uploadDate: row.uploadDate,
    storagePath: row.storagePath ?? undefined,
    status: row.status as SourceDocument['status'],
    processingError: row.processingError ?? undefined,
    extractedAt: row.extractedAt ?? undefined,
    checksum: row.checksum ?? undefined,
  };
}
