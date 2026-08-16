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

async function mockAuthenticatedApi(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('resume_builder_profile_id', 'profile-1');
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
      if (url.includes('/auth/me')) return json({ email: 'test@example.com', name: 'Test User' });
      if (url.includes('/candidates/profile-1/facts/search')) return json({ facts: [{ id: 'fact-1', claim: 'Reduced deployment time by 40%', context: 'Platform migration', category: 'ACHIEVEMENT', confidence: 0.94, status: 'EXTRACTED', sourceRef: 'resume.pdf' }], total: 1 });
      if (url.includes('/candidates/profile-1/facts/fact-1/status')) return json({ status: 'UPDATED' });
      if (url.endsWith('/candidates/profile-1/documents')) return json({ factCount: 4, status: 'PROCESSED' });
      if (url.endsWith('/candidates/profile-1/generate')) return json({ run: { id: 'run-123', status: 'COMPLETED' } });
      if (url.includes('/candidates/profile-1/generations/run-123/preview')) return new Response('<html><body><h1>Generated Resume</h1></body></html>', { headers: { 'content-type': 'text/html' } });
      if (url.endsWith('/candidates/profile-1/generations')) return json({ runs: [{ id: 'run-123', status: 'COMPLETED', startedAt: '2026-08-17T10:00:00.000Z', templateId: 'modern-professional' }] });
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

  test('authenticated upload reports extracted facts', async ({ page }) => {
    await mockAuthenticatedApi(page);
    await page.goto('/upload');
    await page.setInputFiles('input[type="file"]', { name: 'resume.pdf', mimeType: 'application/pdf', buffer: Buffer.from('resume') });
    await expect(page.getByText(/Ready to extract/)).toBeVisible();
    await page.getByRole('button', { name: 'Upload & Extract' }).click();
    await expect(page.getByRole('status')).toContainText('4 facts');
    await expect(page.getByRole('link', { name: /Review extracted facts/ })).toBeVisible();
  });

  test('authenticated fact review updates a fact', async ({ page }) => {
    await mockAuthenticatedApi(page);
    await page.goto('/facts');
    await expect(page.getByText('Reduced deployment time by 40%')).toBeVisible();
    await page.getByLabel('Status for Reduced deployment time by 40%').selectOption('VERIFIED');
    await expect(page.getByRole('status')).toContainText('Fact status updated');
  });

  test('authenticated generation opens the selected preview', async ({ page }) => {
    await mockAuthenticatedApi(page);
    await page.goto('/job');
    await page.getByLabel('Company').fill('Example Co');
    await page.getByLabel('Target title').fill('Product Designer');
    await page.locator('#job-description').fill('We are looking for a product designer to lead research, interaction design, and accessible product improvements across our platform.');
    await page.getByRole('button', { name: 'Generate tailored resume' }).click();
    await expect(page).toHaveURL(/\/preview\?runId=run-123/);
    await expect(page.getByTitle('Resume Preview')).toBeVisible();
  });

  test('authenticated history links to the selected version', async ({ page }) => {
    await mockAuthenticatedApi(page);
    await page.goto('/history');
    await expect(page.getByRole('link', { name: /modern-professional resume/ })).toHaveAttribute('href', '/preview?runId=run-123');
  });
});
