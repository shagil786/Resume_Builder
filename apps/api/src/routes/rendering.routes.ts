import type { FastifyInstance } from 'fastify';
import type { ICandidateProfileService } from '../services/candidate.interface.js';
import { RenderingService, PdfRenderEngine } from '@resume-builder/rendering';

export async function renderingRoutes(app: FastifyInstance, profileService: ICandidateProfileService) {
  const renderer = new RenderingService();
  const pdfEngine = new PdfRenderEngine();

  app.get('/templates', async () => {
    return { templates: renderer.listTemplates() };
  });

  app.get('/templates/:templateId', async (request, reply) => {
    const { templateId } = request.params as { templateId: string };
    const template = renderer.getTemplate(templateId);
    if (!template) { reply.status(404).send({ error: 'Template not found' }); return; }
    return template;
  });

  app.post<{
    Params: { profileId: string };
    Body: { templateId?: string };
  }>(
    '/:profileId/render',
    async (request, reply) => {
      const profile = await profileService.getProfile(request.params.profileId);
      if (!profile) { reply.status(404).send({ error: 'Profile not found' }); return; }

      const resumeContent = {
        sections: [{
          id: 'profile', type: 'SUMMARY' as const, title: 'Summary', order: 1,
          items: [{ id: 'summary', content: profile.summary ?? '' }],
        }],
        metadata: { factUsageMap: {} },
      };

      const result = renderer.render(resumeContent, request.body.templateId);
      reply.header('Content-Type', 'text/html');
      return result.html;
    }
  );

  app.post<{
    Params: { profileId: string };
    Body: { templateId?: string };
  }>(
    '/:profileId/render/pdf',
    async (request, reply) => {
      const profile = await profileService.getProfile(request.params.profileId);
      if (!profile) { reply.status(404).send({ error: 'Profile not found' }); return; }

      const resumeContent = {
        sections: [{
          id: 'profile', type: 'SUMMARY' as const, title: 'Summary', order: 1,
          items: [{ id: 'summary', content: profile.summary ?? '' }],
        }],
        metadata: { factUsageMap: {} },
      };

      const result = renderer.render(resumeContent, request.body.templateId);
      const pdf = await pdfEngine.render(result.html);

      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `attachment; filename="resume-${request.params.profileId}.pdf"`);
      return pdf;
    }
  );
}
