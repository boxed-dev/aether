const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface Profile {
  id: string;
  userId: string;
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Link {
  id: string;
  profileId: string;
  title: string;
  url: string;
  icon: string | null;
  position: number;
  isActive: boolean;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

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
  await fetch(`${API_BASE}/api/links/${linkId}/click`, {
    method: 'POST',
  });
}
