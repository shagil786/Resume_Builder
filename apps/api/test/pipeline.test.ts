import { test, expect, describe, beforeAll } from 'vitest';
import { createTestApp } from './test-app.js';
import type { FastifyInstance } from 'fastify';

describe('AI generation pipeline (mock LLM)', () => {
  let app: FastifyInstance;
  let token = '';
  let cookie = '';
  let profileId = '';

  const jobBody = {
    jobDescription:
      'Senior Frontend Engineer building large-scale React applications. Requires strong TypeScript, GraphQL experience and performance optimization skills. You will lead frontend architecture.',
    company: 'TechCorp',
    title: 'Senior Frontend Engineer',
  };

  beforeAll(async () => {
    app = await createTestApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email: 'pipeline@test.com', password: 'pass', name: 'Pipeline' },
    });
    const setCookie = res.cookies.find(c => c.name === 'resume_builder_token');
    token = setCookie?.value ?? '';
    cookie = `resume_builder_token=${token}`;

    const profileRes = await app.inject({
      method: 'POST',
      url: '/api/v1/candidates',
      headers: { authorization: `Bearer ${token}` },
      payload: { personalInfo: { firstName: 'Alice', lastName: 'Chen', piiFields: [] } },
    });
    profileId = profileRes.json().profileId;
  });

  test('generates a resume with structured sections', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/candidates/${profileId}/generate`,
      headers: { authorization: `Bearer ${token}`, cookie },
      payload: jobBody,
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.run.status).toBe('COMPLETED');
    const sectionTypes = body.resume.sections.map((s: { type: string }) => s.type);
    expect(sectionTypes).toContain('SUMMARY');
    expect(sectionTypes).toContain('EXPERIENCE');
    expect(sectionTypes).toContain('SKILL');
    for (const stage of body.run.stages) {
      expect(stage.status, `stage ${stage.stageName}`).toBe('COMPLETED');
    }
  });

  test('generates a cover letter with language support', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/candidates/${profileId}/cover-letter`,
      headers: { authorization: `Bearer ${token}`, cookie },
      payload: { ...jobBody, language: 'French' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.coverLetter.subject).toBeTruthy();
    expect(Array.isArray(body.coverLetter.body)).toBe(true);
    expect(body.coverLetter.body.length).toBeGreaterThan(0);
    expect(body.html).toContain('<!DOCTYPE html>');
  });

  test('rejects cover letter without job input', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/candidates/${profileId}/cover-letter`,
      headers: { authorization: `Bearer ${token}`, cookie },
      payload: { company: 'TechCorp', title: 'Engineer' },
    });
    expect(res.statusCode).toBe(400);
  });
});
