import type { FastifyInstance, FastifyReply } from 'fastify';
import type { ICandidateProfileService } from '../services/candidate.interface.js';
import { createLLMClient, createAzureOpenAIClient, JobAnalyzer, CoverLetterWriter } from '@resume-builder/ai';
import { CoverLetterRenderEngine } from '../services/cover-letter-renderer.js';
import { fetchJobDescription } from '../services/job-description-fetcher.js';
import type { ApplicationConfig } from '@resume-builder/config';

function coverLetterFailure(reply: FastifyReply, error: unknown): void {
  const message = error instanceof Error ? error.message : '';
  const status = message.match(/Azure OpenAI API error: (\d{3})/)?.[1];
  reply.status(502).send({
    error: {
      code: 'COVER_LETTER_GENERATION_FAILED',
      message: status
        ? `Azure OpenAI request failed (HTTP ${status})`
        : 'Cover letter generation failed',
      statusCode: 502,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function coverLetterRoutes(app: FastifyInstance, profileService: ICandidateProfileService, azureOpenAI?: ApplicationConfig['azureOpenAI']) {
  const renderer = new CoverLetterRenderEngine();

  app.post<{
    Params: { profileId: string };
    Body: { jobDescription?: string; jobUrl?: string; company: string; title: string; language?: string };
  }>(
    '/:profileId/cover-letter',
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

      const llm = azureOpenAI?.endpoint
        ? createAzureOpenAIClient({
            endpoint: azureOpenAI.endpoint,
            apiKey: azureOpenAI.apiKey,
            deployment: azureOpenAI.deployment ?? 'gpt-4o',
          })
        : createLLMClient({ model: 'gpt-4o-mini', temperature: 0.3 });

      const analyzerDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_JOB_ANALYZER?.trim();
      const writerDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_COVER_LETTER?.trim();
      const analyzer = new JobAnalyzer(llm, analyzerDeployment ? { model: analyzerDeployment } : undefined);
      const writer = new CoverLetterWriter(llm, writerDeployment ? { model: writerDeployment } : undefined);

      const job = {
        id: `job-${Date.now()}`,
        userId: profile.userId,
        source: 'TEXT_INPUT' as const,
        rawText: jobDescription,
        title: request.body.title,
        company: request.body.company,
        status: 'ANALYZED' as const,
      };

      try {
        const analysis = await analyzer.analyze(job);

        // Evidence for the writer: same fact source as resume generation.
        const factsResult = await profileService.searchFacts(request.params.profileId, '');
        const facts = factsResult.facts.filter(fact => fact.status !== 'REJECTED');

        const result = await writer.write(profile, analysis, facts, request.body.language);
        const html = renderer.render(result, `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`);

        reply.send({ coverLetter: result, html });
      } catch (error) {
        coverLetterFailure(reply, error);
      }
    }
  );
}
