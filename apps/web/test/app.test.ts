import { test, expect } from '@playwright/test';

test.describe('Web App', () => {
  test('home page loads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('h1')).toContainText('AI Resume Builder');
  });

  test('dashboard link navigates to dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('a[href="/dashboard"]');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('templates page shows templates', async ({ page }) => {
    await page.goto('http://localhost:3000/templates');
    await expect(page.locator('h1')).toContainText('Templates');
    const count = await page.locator('[style*="cursor: pointer"]').count();
    expect(count).toBe(3);
  });

  test('history page shows placeholder', async ({ page }) => {
    await page.goto('http://localhost:3000/history');
    await expect(page.locator('h1')).toContainText('Version History');
    await expect(page.locator('text=No versions yet')).toBeVisible();
  });
});
