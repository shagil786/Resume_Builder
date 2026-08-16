import Fastify, { type FastifyInstance } from 'fastify';
import authPlugin from '../src/plugins/auth.js';
import { authRoutes } from '../src/routes/auth.routes.js';
import { candidateRoutes } from '../src/routes/candidate.routes.js';
import { generationRoutes } from '../src/routes/generation.routes.js';
import { renderingRoutes, templateRoutes } from '../src/routes/rendering.routes.js';
import { documentRoutes } from '../src/routes/document.routes.js';
import { coverLetterRoutes } from '../src/routes/cover-letter.routes.js';
import { CandidateProfileService } from '../src/services/candidate.service.js';
import { SearchSyncService } from '../src/services/search-sync.service.js';
import { errorHandler } from '../src/plugins/error-handler.js';

export async function createTestApp(): Promise<FastifyInstance> {
  const app = Fastify();
  const service = new CandidateProfileService();
  const searchSync = new SearchSyncService();

  await app.register(authPlugin, { secret: 'test-only-secret' });
  await app.register(async instance => authRoutes(instance), { prefix: '/api/v1' });
  await app.register(async instance => templateRoutes(instance), { prefix: '/api/v1/candidates' });
  app.setErrorHandler(errorHandler);

  const ownedProfile = async (request: { params: unknown; userId: string }, reply: { status: (code: number) => { send: (body: unknown) => unknown } }) => {
    const profileId = (request.params as { profileId?: string }).profileId;
    if (!profileId) return;
    const profile = await service.getProfile(profileId);
    if (!profile || profile.userId !== request.userId) reply.status(404).send({ error: 'Profile not found' });
  };

  await app.register(async instance => {
    instance.addHook('preHandler', instance.authenticate);
    instance.addHook('preHandler', ownedProfile);
    await candidateRoutes(instance, service, searchSync);
    await generationRoutes(instance, service);
    await renderingRoutes(instance, service);
    await documentRoutes(instance, service, {});
    await coverLetterRoutes(instance, service);
  }, { prefix: '/api/v1/candidates' });

  await app.ready();
  return app;
}
