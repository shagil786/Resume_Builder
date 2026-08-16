import { beforeAll, afterAll, describe, expect, test } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp } from './test-app.js';

describe('Auth Flow', () => {
  let app: FastifyInstance;
  let authCookie = '';

  beforeAll(async () => { app = await createTestApp(); });
  afterAll(async () => { await app.close(); });

  test('register creates a user and returns a token', async () => {
    const res = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { email: 'auth-test@example.com', password: 'pass12345', name: 'Test User' } });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.user.email).toBe('auth-test@example.com');
    authCookie = String(res.headers['set-cookie']).split(';')[0];
    expect(authCookie).toMatch(/^resume_builder_token=/);
  });

  test('rejects duplicate email and wrong password', async () => {
    const duplicate = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { email: 'auth-test@example.com', password: 'pass12345', name: 'Another' } });
    expect(duplicate.statusCode).toBe(409);
    const wrongPassword = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'auth-test@example.com', password: 'wrongpass' } });
    expect(wrongPassword.statusCode).toBe(401);
  });

  test('login and auth/me work with a valid token', async () => {
    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: 'auth-test@example.com', password: 'pass12345' } });
    expect(login.statusCode).toBe(200);
    authCookie = String(login.headers['set-cookie']).split(';')[0];
    const me = await app.inject({ method: 'GET', url: '/api/v1/auth/me', headers: { cookie: authCookie } });
    expect(me.statusCode).toBe(200);
    expect(me.json().email).toBe('auth-test@example.com');
  });

  test('rejects unauthenticated requests', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/auth/me' });
    expect(res.statusCode).toBe(401);
  });

  test('validates malformed authentication requests', async () => {
    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: {} });
    expect(login.statusCode).toBe(400);
    const register = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { email: 'new@example.com' } });
    expect(register.statusCode).toBe(400);
  });

  test('logout clears the authentication cookie', async () => {
    const logout = await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: { cookie: authCookie } });
    expect(logout.statusCode).toBe(200);
    expect(String(logout.headers['set-cookie'])).toContain('resume_builder_token=');
  });
});

describe('Auth rate limiting', () => {
  let app: FastifyInstance;

  beforeAll(async () => { app = await createTestApp(); });
  afterAll(async () => { await app.close(); });

  test('limits repeated registration attempts per client', async () => {
    const responses = await Promise.all(Array.from({ length: 11 }, (_, index) => app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email: `rate-limit-${index}@example.com`, password: 'pass12345', name: 'Rate Limit' },
    })));
    expect(responses.at(-1)?.statusCode).toBe(429);
    expect(responses.at(-1)?.headers['retry-after']).toBeDefined();
  });
});
