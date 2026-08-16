import { test, expect } from '@playwright/test';

test.describe('Web App', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('AI Resume Builder');
  });

  test('dashboard link navigates to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/dashboard"]');
    await expect(page.locator('h1')).toContainText('Dashboard');
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
    const count = await page.locator('button').count();
    expect(count).toBe(3);
  });

  test('history page shows placeholder', async ({ page }) => {
    await page.goto('/history');
    await expect(page.locator('h1')).toContainText('Version History');
    await expect(page.locator('text=No versions yet')).toBeVisible();
  });
});
