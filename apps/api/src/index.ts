import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
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
import { renderingRoutes } from './routes/rendering.routes.js';
import { documentRoutes } from './routes/document.routes.js';
import type { DocumentServiceConfig } from './services/document.service.js';
import { errorHandler } from './plugins/error-handler.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

function loadDbConfig(): DBConfig | null {
  if (!process.env.DATABASE_HOST) return null;
  return {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    database: process.env.DATABASE_NAME ?? 'resume_builder',
    username: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? 'postgres',
    ssl: process.env.DATABASE_SSL === 'true',
  };
}

function loadDocumentConfig(): DocumentServiceConfig {
  const config: DocumentServiceConfig = {};
  if (process.env.BLOB_ACCOUNT_NAME && process.env.BLOB_ACCOUNT_KEY) {
    config.blob = {
      accountName: process.env.BLOB_ACCOUNT_NAME,
      accountKey: process.env.BLOB_ACCOUNT_KEY,
      container: process.env.BLOB_CONTAINER ?? 'resumes',
    };
  }
  if (process.env.DOC_INTELLIGENCE_ENDPOINT && process.env.DOC_INTELLIGENCE_KEY) {
    config.docIntel = {
      endpoint: process.env.DOC_INTELLIGENCE_ENDPOINT,
      apiKey: process.env.DOC_INTELLIGENCE_KEY,
    };
  }
  return config;
}

function loadSearchConfig(): SearchConfig | null {
  if (!process.env.SEARCH_ENDPOINT || !process.env.SEARCH_KEY) return null;
  return {
    endpoint: process.env.SEARCH_ENDPOINT,
    apiKey: process.env.SEARCH_KEY,
    indexName: process.env.SEARCH_INDEX ?? 'candidate-facts',
  };
}

async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await app.register(multipart);
  await app.register(authPlugin, { secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production' });

  app.setErrorHandler(errorHandler);

  await app.register(authRoutes);

  const dbConfig = loadDbConfig();
  const docConfig = loadDocumentConfig();
  const searchConfig = loadSearchConfig();
  let db: ReturnType<typeof createConnection> | undefined;
  let service: ICandidateProfileService;

  if (dbConfig) {
    app.log.info('Connecting to database');
    db = createConnection(dbConfig);
    await runMigrations(dbConfig);
    service = new DbCandidateProfileService(db);
    app.log.info('Database connected and migrations applied');
  } else {
    app.log.warn('No DATABASE_HOST set — using in-memory storage');
    service = new CandidateProfileService();
  }

  const searchSync = new SearchSyncService(searchConfig ?? undefined);
  await searchSync.initialize();

  await app.register(async (instance) => {
    instance.addHook('preHandler', instance.authenticate);
    await candidateRoutes(instance, service, searchSync);
  }, { prefix: '/api/v1/candidates' });

  await app.register(async (instance) => {
    instance.addHook('preHandler', instance.authenticate);
    await generationRoutes(instance, service);
  }, { prefix: '/api/v1/candidates' });

  await app.register(async (instance) => {
    instance.addHook('preHandler', instance.authenticate);
    await renderingRoutes(instance, service);
  }, { prefix: '/api/v1/candidates' });

  await app.register(async (instance) => {
    instance.addHook('preHandler', instance.authenticate);
    await documentRoutes(instance, service, docConfig);
  }, { prefix: '/api/v1/candidates' });

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

start();

export { buildApp };
