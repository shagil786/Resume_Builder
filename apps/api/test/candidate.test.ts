import { test, expect, describe } from 'vitest';

const BASE = 'http://localhost:3001';
let token = '';
let profileId = '';

describe('Candidate CRUD', () => {
  test('register for candidate tests', async () => {
    const res = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'candidate@test.com', password: 'pass', name: 'Candidate' }),
    });
    const body = await res.json();
    token = body.token;
    expect(token).toBeDefined();
  });

  test('POST /api/v1/candidates creates profile', async () => {
    const res = await fetch(`${BASE}/api/v1/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: 'u1', personalInfo: { firstName: 'John', lastName: 'Doe', piiFields: [] } }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.profileId).toBeDefined();
    profileId = body.profileId;
  });

  test('GET /api/v1/candidates/:id returns profile', async () => {
    const res = await fetch(`${BASE}/api/v1/candidates/${profileId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(profileId);
    expect(body.personalInfo.firstName).toBe('John');
  });

  test('GET /api/v1/candidates/:id returns 404 for missing', async () => {
    const res = await fetch(`${BASE}/api/v1/candidates/missing-id`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
  });

  test('protected routes reject without token', async () => {
    const res = await fetch(`${BASE}/api/v1/candidates/templates`);
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/candidates/templates lists templates', async () => {
    const res = await fetch(`${BASE}/api/v1/candidates/templates`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.templates.length).toBeGreaterThanOrEqual(3);
  });

  test('POST /api/v1/candidates/:id/experience adds experience', async () => {
    const res = await fetch(`${BASE}/api/v1/candidates/${profileId}/experience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ company: 'Test Corp', title: 'Engineer', startDate: '2023-01-01' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.experienceId).toBeDefined();
  });

  test('POST /api/v1/candidates/:id/skills adds skill', async () => {
    const res = await fetch(`${BASE}/api/v1/candidates/${profileId}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'TypeScript', category: 'TECHNICAL' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.skillId).toBeDefined();
  });

  test('POST /api/v1/candidates/:id/render returns HTML', async () => {
    const res = await fetch(`${BASE}/api/v1/candidates/${profileId}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('<!DOCTYPE html>');
  });

  test('POST /api/v1/candidates/:id/render/pdf returns PDF', async () => {
    const res = await fetch(`${BASE}/api/v1/candidates/${profileId}/render/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
  });
});
