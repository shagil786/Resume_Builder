import type { FastifyInstance } from 'fastify';
import type { ICandidateProfileService } from '../services/candidate.interface.js';
import { GenerationService } from '../services/generation.service.js';

export async function generationRoutes(app: FastifyInstance, profileService: ICandidateProfileService) {
  const generationService = new GenerationService();

  app.post<{
    Params: { profileId: string };
    Body: { jobDescription: string; company: string; title: string; templateId?: string };
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

      const facts: never[] = [];
      const result = await generationService.generate(profile, job, facts, request.body.templateId ?? 'modern-professional');
      return result;
    }
  );

  app.get('/:profileId/generations/:runId/status',
    async (_request, reply) => {
      reply.status(501).send({ error: 'Not implemented - requires persistent storage' });
    }
  );
}
