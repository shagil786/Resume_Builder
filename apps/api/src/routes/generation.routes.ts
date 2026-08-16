import type { FastifyInstance } from 'fastify';
import type { ICandidateProfileService } from '../services/candidate.interface.js';
import { GenerationService } from '../services/generation.service.js';
import type { CandidateFact } from '@resume-builder/domain';
import type { ApplicationConfig } from '@resume-builder/config';
import type { DB } from '@resume-builder/db';

export async function generationRoutes(app: FastifyInstance, profileService: ICandidateProfileService, azureOpenAI?: ApplicationConfig['azureOpenAI'], db?: DB) {
  const generationService = new GenerationService(azureOpenAI, db);

  app.post<{
    Params: { profileId: string };
    Body: { jobDescription: string; company: string; title: string; templateId?: string; language?: string };
  }>(
    '/:profileId/generate',
    async (request, reply) => {
      const profile = await profileService.getProfile(request.params.profileId);
      if (!profile) { reply.status(404).send({ error: 'Profile not found' }); return; }

      const job = {
        id: `job-${Date.now()}`,
        userId: profile.userId,
        source: 'TEXT_INPUT' as const,
        rawText: request.body.jobDescription,
        title: request.body.title,
        company: request.body.company,
        status: 'ANALYZED' as const,
      };

      const factsResult = await profileService.searchFacts(request.params.profileId, '');
      const facts: CandidateFact[] = factsResult.facts;
      const result = await generationService.generate(profile, job, facts, request.body.templateId ?? 'modern-professional', request.body.language);
      return result;
    }
  );

  app.get<{ Params: { profileId: string; runId: string } }>('/:profileId/generations/:runId/status',
    async (request, reply) => {
      const run = await generationService.getRun(request.params.runId);
      if (!run || run.profileId !== request.params.profileId) {
        reply.status(404).send({ error: 'Generation run not found' });
        return;
      }
      return run;
    }
  );
}
