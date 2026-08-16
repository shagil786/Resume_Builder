import { eq } from 'drizzle-orm';
import type { DB, TX } from './types';
import { candidateProfiles } from '../schema';
import type { CandidateProfile } from '@resume-builder/domain';
import { createWorkExperienceRepository } from './work-experience.repository';
import { createProjectRepository } from './project.repository';
import { createSkillRepository } from './skill.repository';
import { createEducationRepository } from './education.repository';
import { createCertificationRepository } from './certification.repository';
import { createSourceDocumentRepository } from './source-document.repository';

export interface IFactSearchFilters {
  factStatus?: string[];
  dateRange?: { start: Date; end: Date };
  confidenceThreshold?: number;
}

export interface ICandidateProfileRepository {
  findById(id: string): Promise<CandidateProfile | null>;
  findByUserId(userId: string): Promise<CandidateProfile[]>;
  findAll(): Promise<CandidateProfile[]>;
  create(data: CandidateProfileCreate): Promise<CandidateProfile>;
  update(id: string, data: Partial<CandidateProfile>): Promise<CandidateProfile | null>;
  delete(id: string): Promise<boolean>;
  archive(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}

export type CandidateProfileCreate = Pick<CandidateProfile, 'userId' | 'personalInfo' | 'visibility' | 'status'> &
  Partial<Pick<CandidateProfile, 'summary'>>;

export function createCandidateProfileRepository(db: DB | TX): ICandidateProfileRepository {
  return {
    async findById(id) {
      const row = await db.select().from(candidateProfiles).where(eq(candidateProfiles.id, id)).limit(1);
      return row[0] ? hydrateProfile(db, dbRowToProfile(row[0])) : null;
    },

    async findByUserId(userId) {
      const rows = await db.select().from(candidateProfiles).where(eq(candidateProfiles.userId, userId));
      return Promise.all(rows.map(async row => hydrateProfile(db, dbRowToProfile(row))));
    },

    async findAll() {
      const rows = await db.select().from(candidateProfiles);
      return Promise.all(rows.map(async row => hydrateProfile(db, dbRowToProfile(row))));
    },

    async create(data) {
      const row = await db.insert(candidateProfiles).values({
        userId: data.userId,
        personalInfo: data.personalInfo,
        summary: data.summary ?? null,
        visibility: data.visibility ?? 'PRIVATE',
        status: data.status ?? 'DRAFT',
      }).returning();
      return hydrateProfile(db, dbRowToProfile(row[0]));
    },

    async update(id, data) {
      const updateData: Partial<typeof candidateProfiles.$inferInsert> = {};
      if (data.personalInfo !== undefined) updateData.personalInfo = data.personalInfo;
      if (data.summary !== undefined) updateData.summary = data.summary ?? null;
      const row = await db.update(candidateProfiles)
        .set({ ...updateData, updatedAt: new Date() })
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

async function hydrateProfile(db: DB | TX, profile: CandidateProfile): Promise<CandidateProfile> {
  const [workExperience, projects, skills, education, certifications, sourceDocuments] = await Promise.all([
    createWorkExperienceRepository(db).findByProfileId(profile.id),
    createProjectRepository(db).findByProfileId(profile.id),
    createSkillRepository(db).findByProfileId(profile.id),
    createEducationRepository(db).findByProfileId(profile.id),
    createCertificationRepository(db).findByProfileId(profile.id),
    createSourceDocumentRepository(db).findByProfileId(profile.id),
  ]);
  return { ...profile, workExperience, projects, skills, education, certifications, sourceDocuments };
}
