import { test, expect } from '@playwright/test';

const apiBase = (process.env.LIVE_API_URL ?? 'https://shagilnizami786-api.azurewebsites.net/api/v1').replace(/\/$/, '');
const apiOrigin = new URL(apiBase).origin;

test.describe('Live Azure API smoke checks', () => {
  test('deployed API is healthy', async ({ request }) => {
    const response = await request.get(`${apiOrigin}/health`);
    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ status: 'ok' });
  });

  test('public templates are available', async ({ request }) => {
    const response = await request.get(`${apiBase}/candidates/templates`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.templates.length).toBeGreaterThan(0);
  });

  test('protected session endpoint rejects anonymous access', async ({ request }) => {
    const response = await request.get(`${apiBase}/auth/me`);
    expect(response.status()).toBe(401);
  });

  test('login validates required fields in production', async ({ request }) => {
    const response = await request.post(`${apiBase}/auth/login`, { data: { email: 'smoke@example.com' } });
    expect(response.status()).toBe(400);
  });
});
