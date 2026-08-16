import { test, expect, describe, beforeAll, afterAll } from 'vitest';

const BASE = 'http://localhost:3001';

let token = '';

describe('Auth Flow', () => {
  test('POST /auth/register creates user and returns token', async () => {
    const res = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'pass123', name: 'Test User' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.token).toBeDefined();
    expect(body.user.email).toBe('test@test.com');
    expect(body.user.name).toBe('Test User');
    token = body.token;
  });

  test('POST /auth/register rejects duplicate email', async () => {
    const res = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'pass123', name: 'Another' }),
    });
    expect(res.status).toBe(409);
  });

  test('POST /auth/login returns token', async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'pass123' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toBeDefined();
  });

  test('POST /auth/login rejects wrong password', async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'wrong' }),
    });
    expect(res.status).toBe(401);
  });

  test('GET /auth/me returns user info with valid token', async () => {
    const res = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.email).toBe('test@test.com');
  });

  test('GET /auth/me rejects without token', async () => {
    const res = await fetch(`${BASE}/auth/me`);
    expect(res.status).toBe(401);
  });
});
