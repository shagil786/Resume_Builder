import { eq, and, like, sql, count, inArray, gte } from 'drizzle-orm';
import type { DB, TX } from './types';
import { paginatedResult, paginate } from './utils';
import type { PaginationParams, PaginatedResult } from './utils';
import type { IFactSearchFilters } from './candidate-profile.repository';
import { candidateFacts } from '../schema';
import type { CandidateFact } from '@resume-builder/domain';

export interface ICandidateFactRepository {
  findById(id: string): Promise<CandidateFact | null>;
  findByProfileId(profileId: string, filters?: IFactSearchFilters, pagination?: PaginationParams): Promise<PaginatedResult<CandidateFact>>;
  findByStatus(profileId: string, status: string): Promise<CandidateFact[]>;
  searchByText(profileId: string, query: string, filters?: IFactSearchFilters): Promise<PaginatedResult<CandidateFact>>;
  create(data: CandidateFactCreate): Promise<CandidateFact>;
  createMany(data: CandidateFactCreate[]): Promise<CandidateFact[]>;
  update(id: string, data: Partial<CandidateFact>): Promise<CandidateFact | null>;
  updateStatus(id: string, status: string, notes?: string): Promise<CandidateFact | null>;
  delete(id: string): Promise<boolean>;
  deleteByProfileId(profileId: string): Promise<number>;
}

export type CandidateFactCreate = Omit<CandidateFact, 'id' | 'timestamp' | 'version'> & { profileId: string };

export function createCandidateFactRepository(db: DB | TX): ICandidateFactRepository {
  return {
    async findById(id) {
      const row = await db.select().from(candidateFacts).where(eq(candidateFacts.id, id)).limit(1);
      return row[0] ? dbRowToFact(row[0]) : null;
    },

    async findByProfileId(profileId, filters, pagination) {
      const conditions = [eq(candidateFacts.profileId, profileId)];
      if (filters?.factStatus) conditions.push(inArray(candidateFacts.status, filters.factStatus as typeof candidateFacts.$inferSelect.status[]));
      if (filters?.confidenceThreshold) conditions.push(gte(candidateFacts.confidence, filters.confidenceThreshold));

      const totalResult = await db.select({ count: count() }).from(candidateFacts).where(and(...conditions));
      const total = totalResult[0].count;

      if (!pagination) {
        const rows = await db.select().from(candidateFacts).where(and(...conditions));
        return paginatedResult(rows.map(dbRowToFact), total, { page: 1, limit: total });
      }

      const { offset, limit } = paginate(pagination);
      const rows = await db.select().from(candidateFacts)
        .where(and(...conditions))
        .limit(limit).offset(offset);
      return paginatedResult(rows.map(dbRowToFact), total, pagination);
    },

    async findByStatus(profileId, status) {
      const rows = await db.select().from(candidateFacts)
        .where(and(eq(candidateFacts.profileId, profileId), eq(candidateFacts.status, status as typeof candidateFacts.$inferSelect.status)));
      return rows.map(dbRowToFact);
    },

    async searchByText(profileId, query, filters) {
      const conditions = [
        eq(candidateFacts.profileId, profileId),
        like(candidateFacts.claim, `%${query}%`),
      ];
      if (filters?.factStatus) conditions.push(inArray(candidateFacts.status, filters.factStatus as typeof candidateFacts.$inferSelect.status[]));

      const totalResult = await db.select({ count: count() }).from(candidateFacts).where(and(...conditions));
      const total = totalResult[0].count;

      const rows = await db.select().from(candidateFacts).where(and(...conditions)).limit(50);
      return paginatedResult(rows.map(dbRowToFact), total, { page: 1, limit: 50 });
    },

    async create(data) {
      const row = await db.insert(candidateFacts).values({
        profileId: data.profileId ?? '',
        sourceRef: data.sourceRef,
        sourceLocation: data.sourceLocation ?? null,
        claim: data.claim,
        context: data.context,
        confidence: data.confidence,
        status: data.status as typeof candidateFacts.$inferSelect.status ?? 'EXTRACTED',
        category: data.category as typeof candidateFacts.$inferSelect.category,
        verificationNotes: data.verificationNotes ?? null,
      }).returning();
      return dbRowToFact(row[0]);
    },

    async createMany(data) {
      if (data.length === 0) return [];
      const rows = await db.insert(candidateFacts).values(
        data.map(d => ({
          profileId: d.profileId ?? '',
          sourceRef: d.sourceRef,
          sourceLocation: d.sourceLocation ?? null,
          claim: d.claim,
          context: d.context,
          confidence: d.confidence,
          status: (d.status ?? 'EXTRACTED') as typeof candidateFacts.$inferSelect.status,
          category: d.category as typeof candidateFacts.$inferSelect.category,
          verificationNotes: d.verificationNotes ?? null,
        }))
      ).returning();
      return rows.map(dbRowToFact);
    },

    async update(id, data) {
      const row = await db.update(candidateFacts)
        .set({
          claim: data.claim,
          context: data.context,
          confidence: data.confidence,
          verificationNotes: data.verificationNotes,
          version: sql`${candidateFacts.version} + 1`,
        })
        .where(eq(candidateFacts.id, id))
        .returning();
      return row[0] ? dbRowToFact(row[0]) : null;
    },

    async updateStatus(id, status, notes) {
      const row = await db.update(candidateFacts)
        .set({
          status: status as typeof candidateFacts.$inferSelect.status,
          verificationNotes: notes ?? null,
        })
        .where(eq(candidateFacts.id, id))
        .returning();
      return row[0] ? dbRowToFact(row[0]) : null;
    },

    async delete(id) {
      const row = await db.delete(candidateFacts).where(eq(candidateFacts.id, id)).returning({ id: candidateFacts.id });
      return row.length > 0;
    },

    async deleteByProfileId(profileId) {
      const rows = await db.delete(candidateFacts).where(eq(candidateFacts.profileId, profileId)).returning({ id: candidateFacts.id });
      return rows.length;
    },
  };
}

function dbRowToFact(row: typeof candidateFacts.$inferSelect): CandidateFact {
  return {
    id: row.id,
    sourceRef: row.sourceRef,
    sourceLocation: row.sourceLocation as CandidateFact['sourceLocation'] ?? undefined,
    claim: row.claim,
    context: row.context,
    confidence: row.confidence,
    status: row.status as CandidateFact['status'],
    category: row.category as CandidateFact['category'],
    verificationNotes: row.verificationNotes ?? undefined,
    timestamp: row.createdAt,
    version: row.version,
  };
}
