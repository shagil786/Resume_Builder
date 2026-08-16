import type { FastifyInstance } from 'fastify';
import type { ICandidateProfileService } from '../services/candidate.interface.js';
import { createLLMClient, createAzureOpenAIClient, JobAnalyzer, CoverLetterWriter } from '@resume-builder/ai';
import { CoverLetterRenderEngine } from '../services/cover-letter-renderer.js';
import type { ApplicationConfig } from '@resume-builder/config';

export async function coverLetterRoutes(app: FastifyInstance, profileService: ICandidateProfileService, azureOpenAI?: ApplicationConfig['azureOpenAI']) {
  const renderer = new CoverLetterRenderEngine();

  app.post<{
    Params: { profileId: string };
    Body: { jobDescription: string; company: string; title: string };
  }>(
    '/:profileId/cover-letter',
    async (request, reply) => {
      const profile = await profileService.getProfile(request.params.profileId);
      if (!profile) { reply.status(404).send({ error: 'Profile not found' }); return; }

      let llm;
      if (azureOpenAI?.endpoint) {
        llm = createAzureOpenAIClient({
          endpoint: azureOpenAI.endpoint,
          apiKey: azureOpenAI.apiKey,
          deployment: azureOpenAI.deployment ?? 'gpt-4o',
        });
      } else {
        llm = createLLMClient({ model: 'gpt-4o-mini', temperature: 0.3 });
      }

      const analyzer = new JobAnalyzer(llm);
      const writer = new CoverLetterWriter(llm);

      const job = {
        id: `job-${Date.now()}`,
        userId: profile.userId,
        source: 'TEXT_INPUT' as const,
        rawText: request.body.jobDescription,
        title: request.body.title,
        company: request.body.company,
        status: 'ANALYZED' as const,
      };

      const analysis = await analyzer.analyze(job);
      const stats = {
        role: analysis.role,
        company: analysis.company,
        seniority: analysis.seniority,
        mustHaveSkills: analysis.mustHaveSkills,
        preferredSkills: analysis.preferredSkills,
        responsibilities: analysis.responsibilities,
        domain: analysis.domain,
        keywords: analysis.keywords,
        leadershipExpectations: analysis.leadershipExpectations,
        educationRequirements: analysis.educationRequirements,
        experienceRequirements: analysis.experienceRequirements,
      };

      const result = await writer.write(profile, stats, []);
      const html = renderer.render(result, `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`);

      reply.send({ coverLetter: result, html });
    }
  );
}
