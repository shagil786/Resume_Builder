import { eq, and, or, like, gte, lte, inArray, sql, count } from 'drizzle-orm';
import type { DB, TX } from './types';
import { paginatedResult, paginate, repoError } from './utils';
import type { PaginationParams, PaginatedResult } from './utils';
import { candidateProfiles } from '../schema';
import type { CandidateProfile } from '@resume-builder/domain';

export interface IFactSearchFilters {
  factStatus?: string[];
  dateRange?: { start: Date; end: Date };
  confidenceThreshold?: number;
}

export interface ICandidateProfileRepository {
  findById(id: string): Promise<CandidateProfile | null>;
  findByUserId(userId: string): Promise<CandidateProfile[]>;
  findAll(): Promise<CandidateProfile[]>;
  create(data: Omit<CandidateProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<CandidateProfile>;
  update(id: string, data: Partial<CandidateProfile>): Promise<CandidateProfile | null>;
  delete(id: string): Promise<boolean>;
  archive(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}

export function createCandidateProfileRepository(db: DB | TX): ICandidateProfileRepository {
  return {
    async findById(id) {
      const row = await db.select().from(candidateProfiles).where(eq(candidateProfiles.id, id)).limit(1);
      return row[0] ? dbRowToProfile(row[0]) : null;
    },

    async findByUserId(userId) {
      const rows = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, userId));
      return rows.map(dbRowToProfile);
    },

    async findAll() {
      const rows = await db.select().from(candidateProfiles);
      return rows.map(dbRowToProfile);
    },

    async create(data) {
      const row = await db.insert(candidateProfiles).values({
        userId: data.userId,
        personalInfo: data.personalInfo,
        summary: data.summary ?? null,
        visibility: data.visibility ?? 'PRIVATE',
        status: data.status ?? 'DRAFT',
      }).returning();
      return dbRowToProfile(row[0]);
    },

    async update(id, data) {
      const row = await db.update(candidateProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(candidateProfiles.id, id))
        .returning();
      return row[0] ? dbRowToProfile(row[0]) : null;
    },

    async delete(id) {
      const row = await db.delete(candidateProfiles).where(eq(candidateProfiles.id, id)).returning({ id: candidateProfiles.id });
      return row.length > 0;
    },

    async archive(id) {
      const row = await db.update(candidateProfiles)
        .set({ archivedAt: new Date(), updatedAt: new Date() })
        .where(eq(candidateProfiles.id, id))
        .returning({ id: candidateProfiles.id });
      return row.length > 0;
    },

    async restore(id) {
      const row = await db.update(candidateProfiles)
        .set({ archivedAt: null, updatedAt: new Date() })
        .where(eq(candidateProfiles.id, id))
        .returning({ id: candidateProfiles.id });
      return row.length > 0;
    },
  };
}

function dbRowToProfile(row: typeof candidateProfiles.$inferSelect): CandidateProfile {
  return {
    id: row.id,
    userId: row.userId,
    personalInfo: row.personalInfo as CandidateProfile['personalInfo'],
    summary: row.summary ?? undefined,
    visibility: row.visibility,
    status: row.status,
    workExperience: [],
    projects: [],
    skills: [],
    education: [],
    certifications: [],
    sourceDocuments: [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt ?? undefined,
    latestProcessedAt: row.latestProcessedAt ?? undefined,
  };
}
