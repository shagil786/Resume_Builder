import Fastify from 'fastify';
import cors from '@fastify/cors';
import { candidateRoutes } from './routes/candidate.routes.js';
import { errorHandler } from './plugins/error-handler.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.setErrorHandler(errorHandler);

  await app.register(candidateRoutes, { prefix: '/api/v1/candidates' });

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
