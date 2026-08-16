import { app, type HttpRequest, type InvocationContext, type HttpResponseInit } from '@azure/functions';
import type { InjectOptions } from 'fastify';
import { buildApp } from './index.js';

let appPromise: ReturnType<typeof buildApp> | undefined;

function isLivenessRequest(request: HttpRequest): boolean {
  const pathname = new URL(request.url).pathname.replace(/^\/api(?=\/|$)/, '');
  return request.method === 'GET' && (pathname === '/health' || pathname === '/');
}

async function handler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
      headers: Object.fromEntries(Object.entries(response.headers).map(([key, value]) => [key, String(value)])),
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
