import { beforeAll, afterAll, describe, expect, test } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp } from './test-app.js';

describe('Candidate API', () => {
  let app: FastifyInstance;
  let token = '';
  let profileId = '';

  beforeAll(async () => {
    app = await createTestApp();
    const auth = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { email: 'candidate-test@example.com', password: 'pass12345', name: 'Candidate' } });
    token = auth.json().token;
  });
  afterAll(async () => { await app.close(); });

  const authHeaders = () => ({ authorization: `Bearer ${token}` });

  test('creates and reads a profile owned by the authenticated user', async () => {
    const created = await app.inject({ method: 'POST', url: '/api/v1/candidates', headers: authHeaders(), payload: { userId: 'ignored', personalInfo: { firstName: 'John', lastName: 'Doe', piiFields: [] } } });
    expect(created.statusCode).toBe(201);
    profileId = created.json().profileId;
    const fetched = await app.inject({ method: 'GET', url: `/api/v1/candidates/${profileId}`, headers: authHeaders() });
    expect(fetched.statusCode).toBe(200);
    expect(fetched.json().personalInfo.firstName).toBe('John');
  });

  test('rejects access to another or missing profile', async () => {
    const missing = await app.inject({ method: 'GET', url: '/api/v1/candidates/missing-id', headers: authHeaders() });
    expect(missing.statusCode).toBe(404);
    const otherAuth = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { email: 'other-test@example.com', password: 'pass12345', name: 'Other' } });
    const forbidden = await app.inject({ method: 'GET', url: `/api/v1/candidates/${profileId}`, headers: { authorization: `Bearer ${otherAuth.json().token}` } });
    expect(forbidden.statusCode).toBe(404);
  });

  test('supports profile entries and rendering', async () => {
    const experience = await app.inject({ method: 'POST', url: `/api/v1/candidates/${profileId}/experience`, headers: authHeaders(), payload: { company: 'Test Corp', title: 'Engineer', startDate: '2023-01-01' } });
    expect(experience.statusCode).toBe(201);
    const skill = await app.inject({ method: 'POST', url: `/api/v1/candidates/${profileId}/skills`, headers: authHeaders(), payload: { name: 'TypeScript', category: 'TECHNICAL' } });
    expect(skill.statusCode).toBe(201);
    const rendered = await app.inject({ method: 'POST', url: `/api/v1/candidates/${profileId}/render`, headers: authHeaders(), payload: {} });
    expect(rendered.statusCode).toBe(200);
    expect(rendered.body).toContain('<!DOCTYPE html>');
    expect(rendered.body).toContain('TypeScript');
  });

  test('only updates allowlisted profile fields', async () => {
    const update = await app.inject({
      method: 'PATCH',
      url: `/api/v1/candidates/${profileId}`,
      headers: authHeaders(),
      payload: { summary: 'Updated summary', userId: 'attacker', status: 'PUBLISHED' },
    });
    expect(update.statusCode).toBe(200);
    const profile = await app.inject({ method: 'GET', url: `/api/v1/candidates/${profileId}`, headers: authHeaders() });
    expect(profile.json().summary).toBe('Updated summary');
    expect(profile.json().userId).not.toBe('attacker');
    expect(profile.json().status).toBe('DRAFT');
  });

  test('does not allow a user to update another profile fact', async () => {
    const facts = await app.inject({ method: 'POST', url: `/api/v1/candidates/${profileId}/facts/search`, headers: authHeaders(), payload: { query: '' } });
    const factId = facts.json().facts[0].id as string;
    const otherAuth = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { email: 'fact-owner-test@example.com', password: 'pass12345', name: 'Other' } });
    const forbidden = await app.inject({
      method: 'PATCH',
      url: `/api/v1/candidates/${profileId}/facts/${factId}/status`,
      headers: { authorization: `Bearer ${otherAuth.json().token}` },
      payload: { status: 'VERIFIED' },
    });
    expect(forbidden.statusCode).toBe(404);
  });

  test('template catalog is public while profile routes require authentication', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/candidates/templates' });
    expect(res.statusCode).toBe(200);
    expect(res.json().templates.length).toBeGreaterThan(0);
  });
});
