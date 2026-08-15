import { eq, and, like, sql, gte, count } from 'drizzle-orm';
import type { DB, TX } from './types';
import { projectEntries } from '../schema';
import type { ProjectEntry } from '@resume-builder/domain';

export interface IProjectRepository {
  findById(id: string): Promise<ProjectEntry | null>;
  findByProfileId(profileId: string): Promise<ProjectEntry[]>;
  create(data: Omit<ProjectEntry, 'id' | 'bulletPoints'>): Promise<ProjectEntry>;
  createMany(data: Omit<ProjectEntry, 'id' | 'bulletPoints'>[]): Promise<ProjectEntry[]>;
  update(id: string, data: Partial<ProjectEntry>): Promise<ProjectEntry | null>;
  delete(id: string): Promise<boolean>;
}

export function createProjectRepository(db: DB | TX): IProjectRepository {
  return {
    async findById(id) {
      const row = await db.select().from(projectEntries).where(eq(projectEntries.id, id)).limit(1);
      return row[0] ? dbRowToProject(row[0]) : null;
    },

    async findByProfileId(profileId) {
      const rows = await db.select().from(projectEntries).where(eq(projectEntries.profileId, profileId));
      return rows.map(dbRowToProject);
    },

    async create(data) {
      const row = await db.insert(projectEntries).values({
        profileId: data.profileId,
        name: data.name,
        description: data.description,
        url: data.url ?? null,
        githubUrl: data.githubUrl ?? null,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate?.toISOString().split('T')[0] ?? null,
        factIds: data.factIds ?? [],
      }).returning();
      return dbRowToProject(row[0]);
    },

    async createMany(data) {
      if (data.length === 0) return [];
      const rows = await db.insert(projectEntries).values(
        data.map(d => ({
          profileId: d.profileId,
          name: d.name,
          description: d.description,
          url: d.url ?? null,
          githubUrl: d.githubUrl ?? null,
          startDate: d.startDate.toISOString().split('T')[0],
          endDate: d.endDate?.toISOString().split('T')[0] ?? null,
          factIds: d.factIds ?? [],
        }))
      ).returning();
      return rows.map(dbRowToProject);
    },

    async update(id, data) {
      const row = await db.update(projectEntries)
        .set({
          name: data.name,
          description: data.description,
          url: data.url,
          githubUrl: data.githubUrl,
          startDate: data.startDate?.toISOString().split('T')[0],
          endDate: data.endDate?.toISOString().split('T')[0],
          factIds: data.factIds,
        })
        .where(eq(projectEntries.id, id))
        .returning();
      return row[0] ? dbRowToProject(row[0]) : null;
    },

    async delete(id) {
      const row = await db.delete(projectEntries).where(eq(projectEntries.id, id)).returning({ id: projectEntries.id });
      return row.length > 0;
    },
  };
}

function dbRowToProject(row: typeof projectEntries.$inferSelect): ProjectEntry {
  return {
    id: row.id,
    profileId: row.profileId,
    name: row.name,
    description: row.description,
    url: row.url ?? undefined,
    githubUrl: row.githubUrl ?? undefined,
    startDate: new Date(row.startDate),
    endDate: row.endDate ? new Date(row.endDate) : undefined,
    factIds: row.factIds as string[],
    bulletPoints: [],
  };
}
