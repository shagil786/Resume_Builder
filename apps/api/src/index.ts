import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { createConnection, runMigrations } from '@resume-builder/db';
import type { DBConfig } from '@resume-builder/db';
import type { ICandidateProfileService } from './services/candidate.interface.js';
import { CandidateProfileService } from './services/candidate.service.js';
import { DbCandidateProfileService } from './services/candidate.db-service.js';
import { SearchSyncService } from './services/search-sync.service.js';
import type { SearchConfig } from './services/search-sync.service.js';
import authPlugin from './plugins/auth.js';
import { authRoutes } from './routes/auth.routes.js';
import { candidateRoutes } from './routes/candidate.routes.js';
import { generationRoutes } from './routes/generation.routes.js';
import { renderingRoutes, templateRoutes } from './routes/rendering.routes.js';
import { documentRoutes } from './routes/document.routes.js';
import { coverLetterRoutes } from './routes/cover-letter.routes.js';
import type { DocumentServiceConfig } from './services/document.service.js';
import { errorHandler } from './plugins/error-handler.js';
import { loadApplicationConfig } from '@resume-builder/config';
import type { ApplicationConfig } from '@resume-builder/config';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

async function bootstrapStage<T>(stage: string, operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const code = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
      ? error.code
      : undefined;
    throw new Error(`Application bootstrap failed at ${stage}${code ? ` (${code})` : ''}`);
  }
}

async function requireOwnedProfile(request: { params: unknown; userId: string }, reply: { status: (code: number) => { send: (body: unknown) => unknown } }, service: ICandidateProfileService) {
  const profileId = (request.params as { profileId?: string }).profileId;
  if (!profileId) return;
  const profile = await service.getProfile(profileId);
  if (!profile || profile.userId !== request.userId) {
    reply.status(404).send({ error: 'Profile not found' });
  }
}

function loadDocumentConfig(config: ApplicationConfig): DocumentServiceConfig {
  const documentConfig: DocumentServiceConfig = {};
  if (config.blob.accountName) {
    documentConfig.blob = {
      accountName: config.blob.accountName,
      accountKey: config.blob.accountKey,
      container: config.blob.container ?? 'resumes',
    };
  }
  if (config.documentIntelligence.endpoint) {
    documentConfig.docIntel = {
      endpoint: config.documentIntelligence.endpoint,
      apiKey: config.documentIntelligence.apiKey,
    };
  }
  return documentConfig;
}

function loadSearchConfig(config: ApplicationConfig): SearchConfig | null {
  if (!config.search.endpoint) return null;
  return {
    endpoint: config.search.endpoint,
    apiKey: config.search.apiKey,
    indexName: config.search.index ?? 'candidate-facts',
  };
}

async function buildApp() {
  const config = await bootstrapStage('config', () => loadApplicationConfig());
  const app = Fastify({ logger: true });

  const configuredCorsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
  const corsOrigins = configuredCorsOrigins.length > 0
    ? configuredCorsOrigins
    : process.env.NODE_ENV === 'production'
      ? []
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];
  await app.register(cors, { origin: corsOrigins.length > 0 ? corsOrigins : false, credentials: corsOrigins.length > 0 });
  await app.register(cookie);
  await app.register(rateLimit, { global: false, skipOnError: true });
  await app.register(multipart, { limits: { files: 1, fileSize: 10 * 1024 * 1024 } });
  await app.register(authPlugin, { secret: config.jwtSecret });

  app.setErrorHandler(errorHandler);

  const dbConfig: DBConfig | null = config.database ?? null;
  const docConfig = loadDocumentConfig(config);
  const searchConfig = loadSearchConfig(config);
  let db: ReturnType<typeof createConnection> | undefined;
  let service: ICandidateProfileService;

  if (dbConfig) {
    app.log.info('Connecting to database');
    db = createConnection(dbConfig);
    await bootstrapStage('migrations', () => runMigrations(dbConfig));
    service = new DbCandidateProfileService(db);
    app.log.info('Database connected and migrations applied');
  } else {
    app.log.warn('No DATABASE_HOST set — using in-memory storage');
    service = new CandidateProfileService();
  }

  await app.register(async (instance) => authRoutes(instance, db), { prefix: '/api/v1' });
  await app.register(async (instance) => templateRoutes(instance), { prefix: '/api/v1/candidates' });

  const searchSync = new SearchSyncService(searchConfig ?? undefined);
  await bootstrapStage('search', () => searchSync.initialize());

  await bootstrapStage('routes', async () => {
    await app.register(async (instance) => {
      instance.addHook('preHandler', instance.authenticate);
      instance.addHook('preHandler', async (request, reply) => requireOwnedProfile(request, reply, service));
      await candidateRoutes(instance, service, searchSync);
    }, { prefix: '/api/v1/candidates' });

    await app.register(async (instance) => {
      instance.addHook('preHandler', instance.authenticate);
      instance.addHook('preHandler', async (request, reply) => requireOwnedProfile(request, reply, service));
      await generationRoutes(instance, service, config.azureOpenAI, db);
    }, { prefix: '/api/v1/candidates' });

    await app.register(async (instance) => {
      instance.addHook('preHandler', instance.authenticate);
      instance.addHook('preHandler', async (request, reply) => requireOwnedProfile(request, reply, service));
      await renderingRoutes(instance, service);
    }, { prefix: '/api/v1/candidates' });

    await app.register(async (instance) => {
      instance.addHook('preHandler', instance.authenticate);
      instance.addHook('preHandler', async (request, reply) => requireOwnedProfile(request, reply, service));
      await documentRoutes(instance, service, docConfig, db, searchSync);
    }, { prefix: '/api/v1/candidates' });

    await app.register(async (instance) => {
      instance.addHook('preHandler', instance.authenticate);
      instance.addHook('preHandler', async (request, reply) => requireOwnedProfile(request, reply, service));
      await coverLetterRoutes(instance, service, config.azureOpenAI);
    }, { prefix: '/api/v1/candidates' });
  });

  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}

async function start() {
  const app = await buildApp();
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Server listening on ${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (!process.env.FUNCTIONS_WORKER_RUNTIME) {
  start();
}

export { buildApp };
