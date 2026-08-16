import type { FastifyInstance } from 'fastify';
import type { ICandidateProfileService } from '../services/candidate.interface.js';
import { GenerationService } from '../services/generation.service.js';
import type { CandidateFact } from '@resume-builder/domain';
import type { ApplicationConfig } from '@resume-builder/config';
import type { DB } from '@resume-builder/db';
import { RenderingService } from '@resume-builder/rendering';

export async function generationRoutes(app: FastifyInstance, profileService: ICandidateProfileService, azureOpenAI?: ApplicationConfig['azureOpenAI'], db?: DB) {
  const generationService = new GenerationService(azureOpenAI, db);
  const renderer = new RenderingService();

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

  app.get<{ Params: { profileId: string; runId: string } }>('/:profileId/generations/:runId/preview', async (request, reply) => {
    const result = await generationService.getResult(request.params.runId);
    if (!result || result.run.profileId !== request.params.profileId) {
      reply.status(404).send({ error: 'Generated resume not found' });
      return;
    }
    reply.header('Content-Type', 'text/html');
    return renderer.render(result.resume, result.run.templateId).html;
  });

  app.get<{ Params: { profileId: string } }>('/:profileId/generations', async (request) => {
    return { runs: await generationService.listRuns(request.params.profileId) };
  });

  app.get<{ Params: { profileId: string; runId: string } }>('/:profileId/generations/:runId', async (request, reply) => {
    const result = await generationService.getResult(request.params.runId);
    if (!result || result.run.profileId !== request.params.profileId) {
      reply.status(404).send({ error: 'Generated resume not found' });
      return;
    }
    return result;
  });
}
