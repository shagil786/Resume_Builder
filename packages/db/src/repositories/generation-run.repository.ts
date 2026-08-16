import { eq } from 'drizzle-orm';
import type { GenerationRun } from '@resume-builder/domain';
import type { DB, TX } from './types';
import { generationRuns } from '../schema';

export interface IGenerationRunRepository {
  create(run: GenerationRun): Promise<GenerationRun>;
  findById(id: string): Promise<GenerationRun | null>;
}

export function createGenerationRunRepository(db: DB | TX): IGenerationRunRepository {
  const toDomain = (row: typeof generationRuns.$inferSelect): GenerationRun => ({
    id: row.id,
    profileId: row.profileId,
    jobId: row.jobId ?? undefined,
    templateId: row.templateId,
    startedAt: row.startedAt,
    completedAt: row.completedAt ?? undefined,
    status: row.status,
    stages: row.stages as GenerationRun['stages'],
    errors: row.errors as string[] | undefined,
  });

  return {
    async create(run) {
      const [row] = await db.insert(generationRuns).values({
        id: run.id,
        profileId: run.profileId,
        jobId: undefined,
        templateId: run.templateId,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        status: run.status,
        stages: run.stages,
        errors: run.errors ?? null,
      }).returning();
      return toDomain(row);
    },
    async findById(id) {
      const [row] = await db.select().from(generationRuns).where(eq(generationRuns.id, id)).limit(1);
      return row ? toDomain(row) : null;
    },
  };
}
