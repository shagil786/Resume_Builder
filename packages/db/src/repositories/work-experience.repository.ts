import { eq, and, gte, lte } from 'drizzle-orm';
import type { DB, TX } from './types';
import { workExperiences } from '../schema';
import type { WorkExperience } from '@resume-builder/domain';

export interface IWorkExperienceRepository {
  findById(id: string): Promise<WorkExperience | null>;
  findByProfileId(profileId: string): Promise<WorkExperience[]>;
  findByCompany(profileId: string, company: string): Promise<WorkExperience[]>;
  findByDateRange(profileId: string, start: Date, end: Date): Promise<WorkExperience[]>;
  create(data: Omit<WorkExperience, 'id' | 'bulletPoints'>): Promise<WorkExperience>;
  createMany(data: Omit<WorkExperience, 'id' | 'bulletPoints'>[]): Promise<WorkExperience[]>;
  update(id: string, data: Partial<WorkExperience>): Promise<WorkExperience | null>;
  delete(id: string): Promise<boolean>;
}

export function createWorkExperienceRepository(db: DB | TX): IWorkExperienceRepository {
  return {
    async findById(id) {
      const row = await db.select().from(workExperiences).where(eq(workExperiences.id, id)).limit(1);
      return row[0] ? dbRowToWorkExperience(row[0]) : null;
    },

    async findByProfileId(profileId) {
      const rows = await db.select().from(workExperiences).where(eq(workExperiences.profileId, profileId));
      return rows.map(dbRowToWorkExperience);
    },

    async findByCompany(profileId, company) {
      const rows = await db.select().from(workExperiences)
        .where(and(eq(workExperiences.profileId, profileId), eq(workExperiences.company, company)));
      return rows.map(dbRowToWorkExperience);
    },

    async findByDateRange(profileId, start, end) {
      const rows = await db.select().from(workExperiences)
        .where(and(
          eq(workExperiences.profileId, profileId),
          gte(workExperiences.startDate, start.toISOString().split('T')[0]),
          lte(workExperiences.startDate, end.toISOString().split('T')[0]),
        ));
      return rows.map(dbRowToWorkExperience);
    },

    async create(data) {
      const row = await db.insert(workExperiences).values({
        profileId: data.profileId,
        company: data.company,
        title: data.title,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate?.toISOString().split('T')[0] ?? null,
        location: data.location ?? null,
        factIds: data.factIds ?? [],
      }).returning();
      return dbRowToWorkExperience(row[0]);
    },

    async createMany(data) {
      if (data.length === 0) return [];
      const rows = await db.insert(workExperiences).values(
        data.map(d => ({
          profileId: d.profileId,
          company: d.company,
          title: d.title,
          startDate: d.startDate.toISOString().split('T')[0],
          endDate: d.endDate?.toISOString().split('T')[0] ?? null,
          location: d.location ?? null,
          factIds: d.factIds ?? [],
        }))
      ).returning();
      return rows.map(dbRowToWorkExperience);
    },

    async update(id, data) {
      const row = await db.update(workExperiences)
        .set({
          company: data.company,
          title: data.title,
          startDate: data.startDate?.toISOString().split('T')[0],
          endDate: data.endDate?.toISOString().split('T')[0],
          location: data.location,
          factIds: data.factIds,
        })
        .where(eq(workExperiences.id, id))
        .returning();
      return row[0] ? dbRowToWorkExperience(row[0]) : null;
    },

    async delete(id) {
      const row = await db.delete(workExperiences).where(eq(workExperiences.id, id)).returning({ id: workExperiences.id });
      return row.length > 0;
    },
  };
}

function dbRowToWorkExperience(row: typeof workExperiences.$inferSelect): WorkExperience {
  return {
    id: row.id,
    profileId: row.profileId,
    company: row.company,
    title: row.title,
    startDate: new Date(row.startDate),
    endDate: row.endDate ? new Date(row.endDate) : undefined,
    location: row.location ?? undefined,
    factIds: row.factIds as string[],
    bulletPoints: [],
  };
}
