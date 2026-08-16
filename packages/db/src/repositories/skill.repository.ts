import { eq, and } from 'drizzle-orm';
import type { DB, TX } from './types';
import { skills } from '../schema';
import type { Skill } from '@resume-builder/domain';

export interface ISkillRepository {
  findById(id: string): Promise<Skill | null>;
  findByProfileId(profileId: string): Promise<Skill[]>;
  findByCategory(profileId: string, category: string): Promise<Skill[]>;
  findByName(profileId: string, name: string): Promise<Skill | null>;
  create(data: Omit<Skill, 'id'>): Promise<Skill>;
  createMany(data: Omit<Skill, 'id'>[]): Promise<Skill[]>;
  update(id: string, data: Partial<Skill>): Promise<Skill | null>;
  delete(id: string): Promise<boolean>;
}

export function createSkillRepository(db: DB | TX): ISkillRepository {
  return {
    async findById(id) {
      const row = await db.select().from(skills).where(eq(skills.id, id)).limit(1);
      return row[0] ? dbRowToSkill(row[0]) : null;
    },

    async findByProfileId(profileId) {
      const rows = await db.select().from(skills).where(eq(skills.profileId, profileId));
      return rows.map(dbRowToSkill);
    },

    async findByCategory(profileId, category) {
      const rows = await db.select().from(skills)
        .where(and(eq(skills.profileId, profileId), eq(skills.category, category)));
      return rows.map(dbRowToSkill);
    },

    async findByName(profileId, name) {
      const row = await db.select().from(skills)
        .where(and(eq(skills.profileId, profileId), eq(skills.name, name)))
        .limit(1);
      return row[0] ? dbRowToSkill(row[0]) : null;
    },

    async create(data) {
      const row = await db.insert(skills).values({
        profileId: data.profileId,
        name: data.name,
        category: data.category,
        yearsOfExperience: data.yearsOfExperience ?? null,
        proficiency: data.proficiency as typeof skills.$inferSelect.proficiency ?? null,
        factId: data.factId ?? null,
        verifiedAt: data.verifiedAt ?? null,
      }).returning();
      return dbRowToSkill(row[0]);
    },

    async createMany(data) {
      if (data.length === 0) return [];
      const rows = await db.insert(skills).values(
        data.map(d => ({
          profileId: d.profileId,
          name: d.name,
          category: d.category,
          yearsOfExperience: d.yearsOfExperience ?? null,
          proficiency: d.proficiency as typeof skills.$inferSelect.proficiency ?? null,
          factId: d.factId ?? null,
          verifiedAt: d.verifiedAt ?? null,
        }))
      ).returning();
      return rows.map(dbRowToSkill);
    },

    async update(id, data) {
      const row = await db.update(skills)
        .set({
          name: data.name,
          category: data.category,
          yearsOfExperience: data.yearsOfExperience,
          proficiency: data.proficiency as typeof skills.$inferSelect.proficiency,
          verifiedAt: data.verifiedAt,
        })
        .where(eq(skills.id, id))
        .returning();
      return row[0] ? dbRowToSkill(row[0]) : null;
    },

    async delete(id) {
      const row = await db.delete(skills).where(eq(skills.id, id)).returning({ id: skills.id });
      return row.length > 0;
    },
  };
}

function dbRowToSkill(row: typeof skills.$inferSelect): Skill {
  return {
    id: row.id,
    profileId: row.profileId,
    name: row.name,
    category: row.category,
    yearsOfExperience: row.yearsOfExperience ?? undefined,
    proficiency: row.proficiency as Skill['proficiency'] ?? undefined,
    factId: row.factId ?? undefined,
    verifiedAt: row.verifiedAt ?? undefined,
  };
}
