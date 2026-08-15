import { eq, and, like, lte, count } from 'drizzle-orm';
import type { DB, TX } from './types';
import { certifications } from '../schema';
import type { Certification } from '@resume-builder/domain';

export interface ICertificationRepository {
  findById(id: string): Promise<Certification | null>;
  findByProfileId(profileId: string): Promise<Certification[]>;
  findByIssuingOrg(profileId: string, org: string): Promise<Certification[]>;
  findExpiringSoon(profileId: string, days: number): Promise<Certification[]>;
  create(data: Omit<Certification, 'id'>): Promise<Certification>;
  createMany(data: Omit<Certification, 'id'>[]): Promise<Certification[]>;
  update(id: string, data: Partial<Certification>): Promise<Certification | null>;
  delete(id: string): Promise<boolean>;
}

export function createCertificationRepository(db: DB | TX): ICertificationRepository {
  return {
    async findById(id) {
      const row = await db.select().from(certifications).where(eq(certifications.id, id)).limit(1);
      return row[0] ? dbRowToCertification(row[0]) : null;
    },

    async findByProfileId(profileId) {
      const rows = await db.select().from(certifications).where(eq(certifications.profileId, profileId));
      return rows.map(dbRowToCertification);
    },

    async findByIssuingOrg(profileId, org) {
      const rows = await db.select().from(certifications)
        .where(and(eq(certifications.profileId, profileId), eq(certifications.issuingOrganization, org)));
      return rows.map(dbRowToCertification);
    },

    async findExpiringSoon(profileId, days) {
      const expiryThreshold = new Date();
      expiryThreshold.setDate(expiryThreshold.getDate() + days);
      const rows = await db.select().from(certifications)
        .where(and(
          eq(certifications.profileId, profileId),
          lte(certifications.expiryDate, expiryThreshold.toISOString().split('T')[0]),
        ));
      return rows.map(dbRowToCertification);
    },

    async create(data) {
      const row = await db.insert(certifications).values({
        profileId: data.profileId,
        name: data.name,
        issuingOrganization: data.issuingOrganization,
        issueDate: data.issueDate.toISOString().split('T')[0],
        expiryDate: data.expiryDate?.toISOString().split('T')[0] ?? null,
        credentialId: data.credentialId ?? null,
        credentialUrl: data.credentialUrl ?? null,
        factIds: data.factIds ?? [],
      }).returning();
      return dbRowToCertification(row[0]);
    },

    async createMany(data) {
      if (data.length === 0) return [];
      const rows = await db.insert(certifications).values(
        data.map(d => ({
          profileId: d.profileId,
          name: d.name,
          issuingOrganization: d.issuingOrganization,
          issueDate: d.issueDate.toISOString().split('T')[0],
          expiryDate: d.expiryDate?.toISOString().split('T')[0] ?? null,
          credentialId: d.credentialId ?? null,
          credentialUrl: d.credentialUrl ?? null,
          factIds: d.factIds ?? [],
        }))
      ).returning();
      return rows.map(dbRowToCertification);
    },

    async update(id, data) {
      const row = await db.update(certifications)
        .set({
          name: data.name,
          issuingOrganization: data.issuingOrganization,
          issueDate: data.issueDate?.toISOString().split('T')[0],
          expiryDate: data.expiryDate?.toISOString().split('T')[0],
          credentialId: data.credentialId,
          credentialUrl: data.credentialUrl,
          factIds: data.factIds,
        })
        .where(eq(certifications.id, id))
        .returning();
      return row[0] ? dbRowToCertification(row[0]) : null;
    },

    async delete(id) {
      const row = await db.delete(certifications).where(eq(certifications.id, id)).returning({ id: certifications.id });
      return row.length > 0;
    },
  };
}

function dbRowToCertification(row: typeof certifications.$inferSelect): Certification {
  return {
    id: row.id,
    profileId: row.profileId,
    name: row.name,
    issuingOrganization: row.issuingOrganization,
    issueDate: new Date(row.issueDate),
    expiryDate: row.expiryDate ? new Date(row.expiryDate) : undefined,
    credentialId: row.credentialId ?? undefined,
    credentialUrl: row.credentialUrl ?? undefined,
    factIds: row.factIds as string[],
  };
}
