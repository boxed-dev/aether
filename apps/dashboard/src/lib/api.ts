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

export interface CreateProfileInput {
  userId: string;
  handle: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateProfileInput {
  handle?: string;
  displayName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  isPublic?: boolean;
}

export interface CreateLinkInput {
  profileId: string;
  title: string;
  url: string;
  icon?: string;
}

export interface UpdateLinkInput {
  title?: string;
  url?: string;
  icon?: string | null;
  isActive?: boolean;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Request failed' } }));
    throw new Error(error.error?.message ?? 'Request failed');
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export const api = {
  profiles: {
    getByUserId: (userId: string) =>
      fetch(`${API_BASE}/api/profiles?userId=${userId}`).then(handleResponse<Profile | null>),

    getById: (id: string) =>
      fetch(`${API_BASE}/api/profiles/${id}`).then(handleResponse<Profile>),

    create: (data: CreateProfileInput) =>
      fetch(`${API_BASE}/api/profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse<Profile>),

    update: (id: string, data: UpdateProfileInput) =>
      fetch(`${API_BASE}/api/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse<Profile>),

    checkHandle: (handle: string) =>
      fetch(`${API_BASE}/api/profiles/check-handle?handle=${handle}`).then(
        handleResponse<{ available: boolean }>
      ),
  },

  links: {
    getByProfileId: (profileId: string) =>
      fetch(`${API_BASE}/api/links?profileId=${profileId}`).then(handleResponse<Link[]>),

    create: (data: CreateLinkInput) =>
      fetch(`${API_BASE}/api/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse<Link>),

    update: (id: string, data: UpdateLinkInput) =>
      fetch(`${API_BASE}/api/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(handleResponse<Link>),

    delete: (id: string) =>
      fetch(`${API_BASE}/api/links/${id}`, { method: 'DELETE' }).then(handleResponse<void>),

    reorder: (profileId: string, linkIds: string[]) =>
      fetch(`${API_BASE}/api/links/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, linkIds }),
      }).then(handleResponse<void>),
  },
};
