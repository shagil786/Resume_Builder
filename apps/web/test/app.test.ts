import { test, expect, type Page } from '@playwright/test';

async function mockAuth(page: Page, status: 200 | 401) {
  await page.addInitScript(({ authStatus }) => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (url.includes('/auth/me')) {
        return new Response(authStatus === 200 ? JSON.stringify({ email: 'test@example.com', name: 'Test User' }) : JSON.stringify({ error: 'Unauthorized' }), {
          status: authStatus,
          headers: { 'content-type': 'application/json' },
        });
      }
      return originalFetch(input, init);
    };
  }, { authStatus: status });
}

async function mockTemplates(page: Page) {
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (url.includes('/candidates/templates')) {
        return new Response(JSON.stringify({ templates: [
          { id: 'modern-professional', name: 'Modern', description: 'Modern layout', category: 'PROFESSIONAL' },
          { id: 'classic-academic', name: 'Classic', description: 'Academic layout', category: 'ACADEMIC' },
          { id: 'minimal-clean', name: 'Minimal', description: 'Minimal layout', category: 'MINIMAL' },
        ] }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return originalFetch(input, init);
    };
  });
}

test.describe('Web App', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Make your experience easier to see.');
  });

  test('dashboard requires authentication', async ({ page }) => {
    await mockAuth(page, 401);
    await page.goto('/');
    await page.click('a[href="/dashboard"]');
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
    await expect(page.locator('h2')).toContainText('Sign in to continue');
  });

  test('templates page shows templates', async ({ page }) => {
    await mockTemplates(page);
    await page.goto('/templates');
    await expect(page.locator('h1')).toContainText('Templates');
    const count = await page.locator('main button').count();
    expect(count).toBe(3);
  });

  test('history requires authentication', async ({ page }) => {
    await mockAuth(page, 401);
    await page.goto('/history');
    await expect(page).toHaveURL(/\/login\?next=%2Fhistory/);
    await expect(page.locator('h2')).toContainText('Sign in to continue');
  });

  test('mobile navigation opens the workspace menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Open navigation' })).toBeVisible();
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'My profile' })).toBeVisible();
  });

  test('profile workspace presents editable contact fields', async ({ page }) => {
    await mockAuth(page, 200);
    await page.goto('/profile');
    await expect(page.locator('h1')).toContainText('Candidate profile');
    await expect(page.getByLabel('First name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create profile' })).toBeVisible();
  });
});
