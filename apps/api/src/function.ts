import { app, type HttpRequest, type InvocationContext, type HttpResponseInit } from '@azure/functions';
import type { InjectOptions } from 'fastify';
import { buildApp } from './index.js';

let appPromise: ReturnType<typeof buildApp> | undefined;

async function handler(request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
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
}

app.http('resumeBuilderApi', {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  authLevel: 'anonymous',
  route: '{*segments}',
  handler,
});
