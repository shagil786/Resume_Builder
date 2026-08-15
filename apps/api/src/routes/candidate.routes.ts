import type { FastifyInstance } from 'fastify';
import { createCandidateProfileService } from '../services/candidate.service.js';

export async function candidateRoutes(app: FastifyInstance) {
  const service = createCandidateProfileService();

  app.get('/health', async () => ({ status: 'candidate-routes-ok' }));

  app.post<{ Body: { userId: string; personalInfo: Record<string, unknown> } }>(
    '/',
    async (request, reply) => {
      const { userId, personalInfo } = request.body;
      const result = await service.createProfile(userId, personalInfo);
      reply.status(201).send({ profileId: result.profileId, status: 'CREATED' as const });
    }
  );

  app.get<{ Params: { profileId: string } }>(
    '/:profileId',
    async (request, reply) => {
      const profile = await service.getProfile(request.params.profileId);
      if (!profile) {
        reply.status(404).send({ error: 'Profile not found' });
        return;
      }
      return profile;
    }
  );

  app.patch<{ Params: { profileId: string }; Body: Record<string, unknown> }>(
    '/:profileId',
    async (request, reply) => {
      await service.updateProfile(request.params.profileId, request.body);
      return { profileId: request.params.profileId, status: 'UPDATED' as const };
    }
  );

  app.delete<{ Params: { profileId: string } }>(
    '/:profileId',
    async (request, reply) => {
      await service.deleteProfile(request.params.profileId);
      reply.status(204).send();
    }
  );

  app.post<{ Params: { profileId: string }; Body: { company: string; title: string; startDate: string } }>(
    '/:profileId/experience',
    async (request, reply) => {
      const experience = await service.addExperience(request.params.profileId, request.body);
      reply.status(201).send({ experienceId: experience.experienceId, status: 'CREATED' as const });
    }
  );

  app.post<{ Params: { profileId: string }; Body: { name: string; description: string } }>(
    '/:profileId/projects',
    async (request, reply) => {
      const project = await service.addProject(request.params.profileId, request.body);
      reply.status(201).send({ projectId: project.projectId, status: 'CREATED' as const });
    }
  );

  app.post<{ Params: { profileId: string }; Body: { name: string; category: string } }>(
    '/:profileId/skills',
    async (request, reply) => {
      const skill = await service.addSkill(request.params.profileId, request.body);
      reply.status(201).send({ skillId: skill.skillId, status: 'CREATED' as const });
    }
  );

  app.post<{ Params: { profileId: string }; Body: { institution: string; degree: string; fieldOfStudy: string } }>(
    '/:profileId/education',
    async (request, reply) => {
      const education = await service.addEducation(request.params.profileId, request.body);
      reply.status(201).send({ educationId: education.educationId, status: 'CREATED' as const });
    }
  );

  app.post<{ Params: { profileId: string }; Body: { name: string; issuingOrganization: string } }>(
    '/:profileId/certifications',
    async (request, reply) => {
      const certification = await service.addCertification(request.params.profileId, request.body);
      reply.status(201).send({ certificationId: certification.certificationId, status: 'CREATED' as const });
    }
  );

  app.post<{ Params: { profileId: string }; Body: { query: string } }>(
    '/:profileId/facts/search',
    async (request, reply) => {
      return service.searchFacts(request.params.profileId, request.body.query);
    }
  );

  app.patch<{ Params: { profileId: string; factId: string }; Body: { status: string; verificationNotes?: string } }>(
    '/:profileId/facts/:factId/status',
    async (request, reply) => {
      await service.updateFactStatus(request.params.factId, request.body.status, request.body.verificationNotes);
      return { status: 'UPDATED' };
    }
  );

  app.get<{ Params: { profileId: string; factId: string } }>(
    '/:profileId/facts/:factId/provenance',
    async (request, reply) => {
      const provenance = await service.getFactProvenance(request.params.factId);
      if (!provenance) {
        reply.status(404).send({ error: 'Provenance not found' });
        return;
      }
      return provenance;
    }
  );
}
