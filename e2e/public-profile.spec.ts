import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

test.describe('Public Profile View', () => {
  test.beforeAll(async ({ request }) => {
    // Seed test data
    const profileRes = await request.post(`${API_BASE}/api/profiles`, {
      data: {
        userId: 'test-user-e2e',
        handle: 'johndoe',
        displayName: 'John Doe',
        bio: 'Full-stack developer',
      },
    });

    if (profileRes.ok()) {
      const profile = await profileRes.json();

      await request.post(`${API_BASE}/api/links`, {
        data: {
          profileId: profile.id,
          title: 'GitHub',
          url: 'https://github.com/johndoe',
          icon: '🐙',
        },
      });

      await request.post(`${API_BASE}/api/links`, {
        data: {
          profileId: profile.id,
          title: 'Twitter',
          url: 'https://twitter.com/johndoe',
          icon: '🐦',
        },
      });
    }
  });

  test('displays profile information', async ({ page }) => {
    await page.goto('/johndoe');

    await expect(page.getByRole('heading', { name: 'John Doe' })).toBeVisible();
    await expect(page.getByText('Full-stack developer')).toBeVisible();
  });

  test('displays links', async ({ page }) => {
    await page.goto('/johndoe');

    await expect(page.getByRole('link', { name: /GitHub/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Twitter/i })).toBeVisible();
  });

  test('links open in new tab', async ({ page }) => {
    await page.goto('/johndoe');

    const githubLink = page.getByRole('link', { name: /GitHub/i });
    await expect(githubLink).toHaveAttribute('target', '_blank');
    await expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('loads page in under 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/johndoe');
    await expect(page.getByRole('heading', { name: 'John Doe' })).toBeVisible();
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(3000);
  });

  test('shows 404 for non-existent profile', async ({ page }) => {
    await page.goto('/nonexistentuser12345');

    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText(/doesn't exist/i)).toBeVisible();
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('profile page is responsive', async ({ page }) => {
    await page.goto('/johndoe');

    await expect(page.getByRole('heading', { name: 'John Doe' })).toBeVisible();

    // Check no horizontal overflow
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    expect(bodyBox?.width).toBeLessThanOrEqual(375);
  });

  test('links are tappable on mobile', async ({ page }) => {
    await page.goto('/johndoe');

    const githubLink = page.getByRole('link', { name: /GitHub/i });
    const linkBox = await githubLink.boundingBox();

    // Touch target should be at least 44x44 pixels
    expect(linkBox?.height).toBeGreaterThanOrEqual(44);
  });
});
