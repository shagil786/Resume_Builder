import { eq } from 'drizzle-orm';
import type { DB, TX } from './types';
import { factProvenance } from '../schema';
import type { FactProvenance } from '@resume-builder/domain';

export interface IFactProvenanceRepository {
  findByFactId(factId: string): Promise<FactProvenance | null>;
  findBySourceId(sourceId: string): Promise<FactProvenance[]>;
  create(data: Omit<FactProvenance, 'id'>): Promise<FactProvenance>;
  createMany(data: Omit<FactProvenance, 'id'>[]): Promise<FactProvenance[]>;
  update(factId: string, data: Partial<FactProvenance>): Promise<FactProvenance | null>;
  deleteByFactId(factId: string): Promise<boolean>;
}

export function createFactProvenanceRepository(db: DB | TX): IFactProvenanceRepository {
  return {
    async findByFactId(factId) {
      const row = await db.select().from(factProvenance).where(eq(factProvenance.factId, factId)).limit(1);
      return row[0] ? dbRowToProvenance(row[0]) : null;
    },

    async findBySourceId(sourceId) {
      const rows = await db.select().from(factProvenance).where(eq(factProvenance.sourceId, sourceId));
      return rows.map(dbRowToProvenance);
    },

    async create(data) {
      const row = await db.insert(factProvenance).values({
        factId: data.factId,
        sourceId: data.sourceId,
        extractionMethod: data.extractionMethod as typeof factProvenance.$inferSelect.extractionMethod,
        humanVerified: data.humanVerified,
        verificationNotes: data.verificationNotes ?? null,
        confidenceAtExtraction: data.confidenceAtExtraction,
      }).returning();
      return dbRowToProvenance(row[0]);
    },

    async createMany(data) {
      if (data.length === 0) return [];
      const rows = await db.insert(factProvenance).values(
        data.map(d => ({
          factId: d.factId,
          sourceId: d.sourceId,
          extractionMethod: d.extractionMethod as typeof factProvenance.$inferSelect.extractionMethod,
          humanVerified: d.humanVerified,
          verificationNotes: d.verificationNotes ?? null,
          confidenceAtExtraction: d.confidenceAtExtraction,
        }))
      ).returning();
      return rows.map(dbRowToProvenance);
    },

    async update(factId, data) {
      const row = await db.update(factProvenance)
        .set({
          humanVerified: data.humanVerified,
          verificationNotes: data.verificationNotes,
        })
        .where(eq(factProvenance.factId, factId))
        .returning();
      return row[0] ? dbRowToProvenance(row[0]) : null;
    },

    async deleteByFactId(factId) {
      const row = await db.delete(factProvenance).where(eq(factProvenance.factId, factId)).returning({ factId: factProvenance.factId });
      return row.length > 0;
    },
  };
}

function dbRowToProvenance(row: typeof factProvenance.$inferSelect): FactProvenance {
  return {
    factId: row.factId,
    sourceId: row.sourceId,
    extractionMethod: row.extractionMethod as FactProvenance['extractionMethod'],
    humanVerified: row.humanVerified,
    verificationNotes: row.verificationNotes ?? undefined,
    confidenceAtExtraction: row.confidenceAtExtraction,
  };
}
