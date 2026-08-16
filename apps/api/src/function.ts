import { app, type HttpRequest, type InvocationContext, type HttpResponseInit } from '@azure/functions';
import type { InjectOptions } from 'fastify';
import { buildApp } from './index.js';

let appPromise: ReturnType<typeof buildApp> | undefined;

function allowedCorsOrigins(): string[] {
  const configured = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);
  return configured.length > 0 ? configured : ['http://localhost:3000', 'http://127.0.0.1:3000'];
}

function corsHeaders(request: HttpRequest): Record<string, string> {
  const origin = request.headers.get('origin');
  if (!origin || !allowedCorsOrigins().includes(origin)) return {};
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': request.headers.get('access-control-request-headers') ?? 'content-type',
    vary: 'Origin',
  };
}

function isLivenessRequest(request: HttpRequest): boolean {
  const pathname = new URL(request.url).pathname.replace(/^\/api(?=\/|$)/, '');
  return request.method === 'GET' && (pathname === '/health' || pathname === '/');
}

async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const headers = corsHeaders(request);
  if (request.method === 'OPTIONS') {
    return { status: 204, headers };
  }

  // Keep the platform liveness probe independent of application dependencies.
  // Readiness and all API routes still initialize the full application below.
  if (isLivenessRequest(request)) {
    return { status: 200, jsonBody: { status: 'ok' } };
  }

  try {
    appPromise ??= buildApp();
    const fastify = await appPromise;
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text();
    const injectOptions: InjectOptions = {
      method: request.method.toUpperCase() as InjectOptions['method'],
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      payload: body,
    };
    const response = await fastify.inject(injectOptions);

    return {
      status: response.statusCode,
      headers: {
        ...Object.fromEntries(Object.entries(response.headers).map(([key, value]) => [key, String(value)])),
        ...headers,
      },
      body: response.body,
    };
  } catch (error) {
    context.error(error instanceof Error ? error.stack ?? error.message : 'Function initialization failed');
    return { status: 503, jsonBody: { error: 'Service initialization failed' } };
  }
}

app.http('resumeBuilderApi', {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  authLevel: 'anonymous',
  route: '{*segments}',
  handler,
});
