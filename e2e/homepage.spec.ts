import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('displays welcome message', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Aether Link' })).toBeVisible();
    await expect(page.getByText(/link-in-bio/i)).toBeVisible();
  });

  test('has glass card styling', async ({ page }) => {
    await page.goto('/');

    const card = page.locator('[class*="backdrop-blur"]').first();
    await expect(card).toBeVisible();
  });
});
