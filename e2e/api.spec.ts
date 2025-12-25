import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3001';

test.describe('API Health', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/health`);

    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });
});

test.describe('Profile API', () => {
  let testProfileId: string;

  test('creates a profile', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/profiles`, {
      data: {
        userId: `api-test-${Date.now()}`,
        handle: `apitest${Date.now()}`,
        displayName: 'API Test User',
        bio: 'Testing the API',
      },
    });

    expect(response.status()).toBe(201);

    const profile = await response.json();
    expect(profile.displayName).toBe('API Test User');
    expect(profile.id).toBeDefined();

    testProfileId = profile.id;
  });

  test('gets profile by handle', async ({ request }) => {
    // First create a profile
    const createRes = await request.post(`${API_BASE}/api/profiles`, {
      data: {
        userId: `handle-test-${Date.now()}`,
        handle: `handletest${Date.now()}`,
        displayName: 'Handle Test',
      },
    });

    const profile = await createRes.json();

    const response = await request.get(`${API_BASE}/api/profiles/handle/${profile.handle}`);

    expect(response.ok()).toBe(true);

    const fetched = await response.json();
    expect(fetched.displayName).toBe('Handle Test');
  });

  test('returns 404 for non-existent handle', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/profiles/handle/nonexistent12345`);

    expect(response.status()).toBe(404);
  });

  test('validates handle format', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/profiles`, {
      data: {
        userId: 'validation-test',
        handle: 'invalid handle!',
        displayName: 'Test',
      },
    });

    expect(response.status()).toBe(400);

    const error = await response.json();
    expect(error.error.code).toBe('VALIDATION_ERROR');
  });

  test('prevents duplicate handles', async ({ request }) => {
    const handle = `duplicate${Date.now()}`;

    await request.post(`${API_BASE}/api/profiles`, {
      data: {
        userId: `dup-1-${Date.now()}`,
        handle,
        displayName: 'First User',
      },
    });

    const response = await request.post(`${API_BASE}/api/profiles`, {
      data: {
        userId: `dup-2-${Date.now()}`,
        handle,
        displayName: 'Second User',
      },
    });

    expect(response.status()).toBe(409);
  });
});

test.describe('Links API', () => {
  test('creates and retrieves links', async ({ request }) => {
    // Create a profile first
    const profileRes = await request.post(`${API_BASE}/api/profiles`, {
      data: {
        userId: `links-test-${Date.now()}`,
        handle: `linkstest${Date.now()}`,
        displayName: 'Links Test',
      },
    });

    const profile = await profileRes.json();

    // Create links
    const link1Res = await request.post(`${API_BASE}/api/links`, {
      data: {
        profileId: profile.id,
        title: 'Link 1',
        url: 'https://example.com/1',
      },
    });

    expect(link1Res.status()).toBe(201);

    const link2Res = await request.post(`${API_BASE}/api/links`, {
      data: {
        profileId: profile.id,
        title: 'Link 2',
        url: 'https://example.com/2',
      },
    });

    expect(link2Res.status()).toBe(201);

    // Fetch links
    const linksRes = await request.get(`${API_BASE}/api/links?profileId=${profile.id}`);

    expect(linksRes.ok()).toBe(true);

    const links = await linksRes.json();
    expect(links).toHaveLength(2);
    expect(links[0].title).toBe('Link 1');
    expect(links[1].title).toBe('Link 2');
  });

  test('validates URL format', async ({ request }) => {
    const profileRes = await request.post(`${API_BASE}/api/profiles`, {
      data: {
        userId: `url-test-${Date.now()}`,
        handle: `urltest${Date.now()}`,
        displayName: 'URL Test',
      },
    });

    const profile = await profileRes.json();

    const response = await request.post(`${API_BASE}/api/links`, {
      data: {
        profileId: profile.id,
        title: 'Bad Link',
        url: 'not-a-url',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('tracks link clicks', async ({ request }) => {
    const profileRes = await request.post(`${API_BASE}/api/profiles`, {
      data: {
        userId: `click-test-${Date.now()}`,
        handle: `clicktest${Date.now()}`,
        displayName: 'Click Test',
      },
    });

    const profile = await profileRes.json();

    const linkRes = await request.post(`${API_BASE}/api/links`, {
      data: {
        profileId: profile.id,
        title: 'Clickable',
        url: 'https://example.com/click',
      },
    });

    const link = await linkRes.json();

    // Click the link multiple times
    await request.post(`${API_BASE}/api/links/${link.id}/click`);
    await request.post(`${API_BASE}/api/links/${link.id}/click`);

    // Verify click count
    const fetchRes = await request.get(`${API_BASE}/api/links/${link.id}`);
    const updated = await fetchRes.json();

    expect(updated.clickCount).toBe(2);
  });
});
