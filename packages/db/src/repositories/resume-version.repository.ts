import { eq, desc } from 'drizzle-orm';
import type { ResumeVersion } from '@resume-builder/domain';
import type { DB, TX } from './types';
import { resumeVersions } from '../schema';

export interface IResumeVersionRepository {
  create(version: ResumeVersion): Promise<ResumeVersion>;
  findById(id: string): Promise<ResumeVersion | null>;
  findByGenerationRunId(runId: string): Promise<ResumeVersion | null>;
  findByProfileId(profileId: string): Promise<ResumeVersion[]>;
}

export function createResumeVersionRepository(db: DB | TX): IResumeVersionRepository {
  const toDomain = (row: typeof resumeVersions.$inferSelect): ResumeVersion => ({
    id: row.id,
    profileId: row.profileId,
    templateId: row.templateId,
    jobId: row.jobId ?? undefined,
    versionNumber: row.versionNumber,
    structuredData: row.structuredData as ResumeVersion['structuredData'],
    status: row.status,
    generationRunId: row.generationRunId ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    storagePath: row.storagePath ?? undefined,
    pdfChecksum: row.pdfChecksum ?? undefined,
  });

  return {
    async create(version) {
      const [row] = await db.insert(resumeVersions).values({
        id: version.id,
        profileId: version.profileId,
        templateId: version.templateId,
        jobId: version.jobId,
        versionNumber: version.versionNumber,
        structuredData: version.structuredData,
        status: version.status,
        generationRunId: version.generationRunId,
        createdAt: version.createdAt,
        updatedAt: version.updatedAt,
        storagePath: version.storagePath,
        pdfChecksum: version.pdfChecksum,
      }).returning();
      return toDomain(row);
    },
    async findById(id) {
      const [row] = await db.select().from(resumeVersions).where(eq(resumeVersions.id, id)).limit(1);
      return row ? toDomain(row) : null;
    },
    async findByGenerationRunId(runId) {
      const [row] = await db.select().from(resumeVersions).where(eq(resumeVersions.generationRunId, runId)).limit(1);
      return row ? toDomain(row) : null;
    },
    async findByProfileId(profileId) {
      const rows = await db.select().from(resumeVersions).where(eq(resumeVersions.profileId, profileId)).orderBy(desc(resumeVersions.createdAt));
      return rows.map(toDomain);
    },
  };
}
