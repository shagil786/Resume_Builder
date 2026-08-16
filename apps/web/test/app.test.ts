import { test, expect } from '@playwright/test';

test.describe('Web App', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Build a resume that earns the interview.');
  });

  test('dashboard requires authentication', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/dashboard"]');
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
    await expect(page.locator('h2')).toContainText('Sign in to continue');
  });

  test('templates page shows templates', async ({ page }) => {
    await page.route('**/api/v1/candidates/templates', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ templates: [
        { id: 'modern-professional', name: 'Modern', description: 'Modern layout', category: 'PROFESSIONAL' },
        { id: 'classic-academic', name: 'Classic', description: 'Academic layout', category: 'ACADEMIC' },
        { id: 'minimal-clean', name: 'Minimal', description: 'Minimal layout', category: 'MINIMAL' },
      ] }),
    }));
    await page.goto('/templates');
    await expect(page.locator('h1')).toContainText('Templates');
    const count = await page.locator('main button').count();
    expect(count).toBe(3);
  });

  test('history requires authentication', async ({ page }) => {
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
    await page.addInitScript(() => window.localStorage.setItem('resume_builder_token', 'test-token'));
    await page.goto('/profile');
    await expect(page.locator('h1')).toContainText('Candidate profile');
    await expect(page.getByLabel('First name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create profile' })).toBeVisible();
  });
});
