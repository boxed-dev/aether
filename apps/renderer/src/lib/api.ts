import type { Profile, Link } from '@aether-link/core-logic';

// Re-export types for convenience
export type { Profile, Link };

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function fetchProfileByHandle(handle: string): Promise<Profile> {
  const res = await fetch(`${API_BASE}/api/profiles/handle/${handle}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Profile not found');
    }
    throw new Error('Failed to fetch profile');
  }

  return res.json();
}

export async function fetchLinksByProfileId(profileId: string): Promise<Link[]> {
  const res = await fetch(`${API_BASE}/api/links?profileId=${profileId}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch links');
  }

  return res.json();
}

export async function trackClick(linkId: string): Promise<void> {
  const url = `${API_BASE}/api/links/${linkId}/click`;

  try {
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob(['{}'], { type: 'application/json' });
      const success = navigator.sendBeacon(url, blob);

      if (success) {
        return;
      }
    }

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    });
  } catch (error) {
    console.error('Failed to track click:', error);
  }
}
