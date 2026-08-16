import type { FastifyInstance } from 'fastify';
import type { ICandidateProfileService } from '../services/candidate.interface.js';
import { RenderingService, PdfRenderEngine } from '@resume-builder/rendering';
import type { CandidateProfile, ResumeContent, ResumeSection } from '@resume-builder/domain';

function toResumeContent(profile: CandidateProfile): ResumeContent {
  const sections: ResumeSection[] = [];
  let order = 1;
  const add = (id: string, type: ResumeSection['type'], title: string, items: ResumeSection['items']) => {
    if (items.length > 0) sections.push({ id, type, title, order: order++, items });
  };

  add('summary', 'SUMMARY', 'Summary', profile.summary ? [{ id: 'summary', content: profile.summary }] : []);
  add('experience', 'EXPERIENCE', 'Experience', profile.workExperience.map(experience => ({
    id: experience.id,
    content: `${experience.title} — ${experience.company}`,
    bulletPoints: experience.bulletPoints.map(bullet => ({ id: bullet.id, text: bullet.text, evidence: bullet.factIds })),
    sourceFactIds: experience.factIds,
  })));
  add('projects', 'PROJECT', 'Projects', profile.projects.map(project => ({
    id: project.id,
    content: project.name,
    bulletPoints: [{ id: `${project.id}-description`, text: project.description, evidence: project.factIds }],
    sourceFactIds: project.factIds,
  })));
  add('skills', 'SKILL', 'Skills', profile.skills.map(skill => ({
    id: skill.id,
    content: `${skill.name}${skill.category ? ` (${skill.category})` : ''}`,
    sourceFactIds: skill.factId ? [skill.factId] : [],
  })));
  add('education', 'EDUCATION', 'Education', profile.education.map(entry => ({
    id: entry.id,
    content: `${entry.degree} — ${entry.institution}${entry.fieldOfStudy ? `, ${entry.fieldOfStudy}` : ''}`,
    sourceFactIds: entry.factIds,
  })));
  add('certifications', 'CERTIFICATION', 'Certifications', profile.certifications.map(certification => ({
    id: certification.id,
    content: `${certification.name} — ${certification.issuingOrganization}`,
    sourceFactIds: certification.factIds,
  })));

  return { sections, metadata: { factUsageMap: {} } };
}

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

      const result = renderer.render(toResumeContent(profile), request.body.templateId);
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

      const result = renderer.render(toResumeContent(profile), request.body.templateId);
      const pdf = await pdfEngine.render(result.html);

      reply.header('Content-Type', 'application/pdf');
      reply.header('Content-Disposition', `attachment; filename="resume-${request.params.profileId}.pdf"`);
      return pdf;
    }
  );
}
