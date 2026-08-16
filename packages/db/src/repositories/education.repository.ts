import { eq, and } from 'drizzle-orm';
import type { DB, TX } from './types';
import { educationEntries } from '../schema';
import type { EducationEntry } from '@resume-builder/domain';

export interface IEducationRepository {
  findById(id: string): Promise<EducationEntry | null>;
  findByProfileId(profileId: string): Promise<EducationEntry[]>;
  findByInstitution(profileId: string, institution: string): Promise<EducationEntry[]>;
  create(data: Omit<EducationEntry, 'id'>): Promise<EducationEntry>;
  createMany(data: Omit<EducationEntry, 'id'>[]): Promise<EducationEntry[]>;
  update(id: string, data: Partial<EducationEntry>): Promise<EducationEntry | null>;
  delete(id: string): Promise<boolean>;
}

export function createEducationRepository(db: DB | TX): IEducationRepository {
  return {
    async findById(id) {
      const row = await db.select().from(educationEntries).where(eq(educationEntries.id, id)).limit(1);
      return row[0] ? dbRowToEducation(row[0]) : null;
    },

    async findByProfileId(profileId) {
      const rows = await db.select().from(educationEntries).where(eq(educationEntries.profileId, profileId));
      return rows.map(dbRowToEducation);
    },

    async findByInstitution(profileId, institution) {
      const rows = await db.select().from(educationEntries)
        .where(and(eq(educationEntries.profileId, profileId), eq(educationEntries.institution, institution)));
      return rows.map(dbRowToEducation);
    },

    async create(data) {
      const row = await db.insert(educationEntries).values({
        profileId: data.profileId,
        institution: data.institution,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate.toISOString().split('T')[0],
        gpa: data.gpa ?? null,
        factIds: data.factIds ?? [],
      }).returning();
      return dbRowToEducation(row[0]);
    },

    async createMany(data) {
      if (data.length === 0) return [];
      const rows = await db.insert(educationEntries).values(
        data.map(d => ({
          profileId: d.profileId,
          institution: d.institution,
          degree: d.degree,
          fieldOfStudy: d.fieldOfStudy,
          startDate: d.startDate.toISOString().split('T')[0],
          endDate: d.endDate.toISOString().split('T')[0],
          gpa: d.gpa ?? null,
          factIds: d.factIds ?? [],
        }))
      ).returning();
      return rows.map(dbRowToEducation);
    },

    async update(id, data) {
      const row = await db.update(educationEntries)
        .set({
          institution: data.institution,
          degree: data.degree,
          fieldOfStudy: data.fieldOfStudy,
          startDate: data.startDate?.toISOString().split('T')[0],
          endDate: data.endDate?.toISOString().split('T')[0],
          gpa: data.gpa,
          factIds: data.factIds,
        })
        .where(eq(educationEntries.id, id))
        .returning();
      return row[0] ? dbRowToEducation(row[0]) : null;
    },

    async delete(id) {
      const row = await db.delete(educationEntries).where(eq(educationEntries.id, id)).returning({ id: educationEntries.id });
      return row.length > 0;
    },
  };
}

function dbRowToEducation(row: typeof educationEntries.$inferSelect): EducationEntry {
  return {
    id: row.id,
    profileId: row.profileId,
    institution: row.institution,
    degree: row.degree,
    fieldOfStudy: row.fieldOfStudy,
    startDate: new Date(row.startDate),
    endDate: new Date(row.endDate),
    gpa: row.gpa ?? undefined,
    factIds: row.factIds as string[],
  };
}
