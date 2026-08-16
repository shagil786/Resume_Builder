import type { FastifyInstance } from 'fastify';
import type { ICandidateProfileService } from '../services/candidate.interface.js';
import { GenerationService } from '../services/generation.service.js';
import type { CandidateFact } from '@resume-builder/domain';
import type { ApplicationConfig } from '@resume-builder/config';
import type { DB } from '@resume-builder/db';
import { PdfRenderEngine, RenderingService } from '@resume-builder/rendering';
import { fetchJobDescription } from '../services/job-description-fetcher.js';

export async function generationRoutes(app: FastifyInstance, profileService: ICandidateProfileService, azureOpenAI?: ApplicationConfig['azureOpenAI'], db?: DB) {
  const generationService = new GenerationService(azureOpenAI, db);
  const renderer = new RenderingService();
  const pdfEngine = new PdfRenderEngine();

  app.post<{
    Params: { profileId: string };
    Body: { jobDescription?: string; jobUrl?: string; company: string; title: string; templateId?: string; language?: string };
  }>(
    '/:profileId/generate',
    async (request, reply) => {
      const profile = await profileService.getProfile(request.params.profileId);
      if (!profile) { reply.status(404).send({ error: 'Profile not found' }); return; }

      let jobDescription = request.body.jobDescription?.trim() ?? '';
      if (jobDescription.length < 40 && request.body.jobUrl?.trim()) {
        try { jobDescription = await fetchJobDescription(request.body.jobUrl.trim()); }
        catch (error) { reply.status(422).send({ error: error instanceof Error ? error.message : 'Unable to fetch the job posting' }); return; }
      }
      if (jobDescription.length < 40) {
        reply.status(400).send({ error: 'Provide a job description or a public job posting URL' });
        return;
      }
      const job = {
        id: `job-${Date.now()}`,
        userId: profile.userId,
        source: request.body.jobUrl?.trim() && !request.body.jobDescription?.trim() ? 'JOB_URL' as const : 'TEXT_INPUT' as const,
        rawText: jobDescription,
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

  app.get<{ Params: { profileId: string; runId: string } }>('/:profileId/generations/:runId/preview/pdf', async (request, reply) => {
    const result = await generationService.getResult(request.params.runId);
    if (!result || result.run.profileId !== request.params.profileId) {
      reply.status(404).send({ error: 'Generated resume not found' });
      return;
    }
    const html = renderer.render(result.resume, result.run.templateId).html;
    const pdf = await pdfEngine.render(html);
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', `attachment; filename="resume-${request.params.runId}.pdf"`);
    return pdf;
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
