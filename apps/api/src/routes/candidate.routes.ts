import type { FastifyInstance } from 'fastify';
import type { ICandidateProfileService } from '../services/candidate.interface.js';
import type { SearchSyncService } from '../services/search-sync.service.js';

export async function candidateRoutes(app: FastifyInstance, service: ICandidateProfileService, searchSync: SearchSyncService) {

  app.post<{ Body: { userId: string; personalInfo: Record<string, unknown> } }>(
    '/',
    async (request, reply) => {
      const { userId, personalInfo } = request.body;
      const result = await service.createProfile(userId, personalInfo as never);
      reply.status(201).send({ profileId: result.profileId, status: 'CREATED' });
    }
  );

  app.get<{ Params: { profileId: string } }>(
    '/:profileId',
    async (request, reply) => {
      const profile = await service.getProfile(request.params.profileId);
      if (!profile) { reply.status(404).send({ error: 'Profile not found' }); return; }
      return profile;
    }
  );

  app.patch<{ Params: { profileId: string }; Body: Record<string, unknown> }>(
    '/:profileId',
    async (request, reply) => {
      await service.updateProfile(request.params.profileId, request.body as never);
      return { profileId: request.params.profileId, status: 'UPDATED' };
    }
  );

  app.delete<{ Params: { profileId: string } }>(
    '/:profileId',
    async (_request, reply) => {
      reply.status(204).send();
    }
  );

  app.post<{ Params: { profileId: string }; Body: { company: string; title: string; startDate: string } }>(
    '/:profileId/experience',
    async (request, reply) => {
      const { experienceId } = await service.addExperience(request.params.profileId, request.body);
      reply.status(201).send({ experienceId, status: 'CREATED' });
    }
  );

  app.post<{ Params: { profileId: string }; Body: { name: string; description: string } }>(
    '/:profileId/projects',
    async (request, reply) => {
      const { projectId } = await service.addProject(request.params.profileId, request.body);
      reply.status(201).send({ projectId, status: 'CREATED' });
    }
  );

  app.post<{ Params: { profileId: string }; Body: { name: string; category: string } }>(
    '/:profileId/skills',
    async (request, reply) => {
      const { skillId } = await service.addSkill(request.params.profileId, request.body);
      reply.status(201).send({ skillId, status: 'CREATED' });
    }
  );

  app.post<{ Params: { profileId: string }; Body: { institution: string; degree: string; fieldOfStudy: string } }>(
    '/:profileId/education',
    async (request, reply) => {
      const { educationId } = await service.addEducation(request.params.profileId, request.body);
      reply.status(201).send({ educationId, status: 'CREATED' });
    }
  );

  app.post<{ Params: { profileId: string }; Body: { name: string; issuingOrganization: string } }>(
    '/:profileId/certifications',
    async (request, reply) => {
      const { certificationId } = await service.addCertification(request.params.profileId, request.body);
      reply.status(201).send({ certificationId, status: 'CREATED' });
    }
  );

  app.post<{ Params: { profileId: string }; Body: { query: string } }>(
    '/:profileId/facts/search',
    async (request, reply) => {
      const result = await searchSync.searchFacts(request.params.profileId, request.body.query);
      if (result.total === 0) {
        return service.searchFacts(request.params.profileId, request.body.query);
      }
      return result;
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
      if (!provenance) { reply.status(404).send({ error: 'Provenance not found' }); return; }
      return provenance;
    }
  );
}
