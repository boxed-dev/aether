import type {
  Profile,
  Link,
  CreateProfileInput,
  UpdateProfileInput,
  CreateLinkInput,
  UpdateLinkInput,
  HandleAvailabilityResponse,
} from '@aether-link/core-logic';

// Re-export types for convenience
export type {
  Profile,
  Link,
  CreateProfileInput,
  UpdateProfileInput,
  CreateLinkInput,
  UpdateLinkInput,
  HandleAvailabilityResponse,
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

/**
 * Gets authentication token from cookies
 * In NextAuth v5, the session token is stored in cookies and we need to pass it to the API
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Get the session token from cookies
  // NextAuth v5 stores the token in cookies, we'll use a helper to get it
  if (typeof window !== 'undefined') {
    const sessionToken = await getSessionToken();
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
  }

  return headers;
}

/**
 * Gets the NextAuth session token from cookies
 * This is used for client-side authentication
 */
async function getSessionToken(): Promise<string | null> {
  try {
    // For client-side, we need to get the JWT token that NextAuth stores
    // We'll make a request to a helper endpoint that returns the token
    const response = await fetch('/api/auth/session-token');
    if (response.ok) {
      const data = await response.json();
      return data.token || null;
    }
  } catch {
    // If we can't get the token, return null
  }
  return null;
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

    update: async (id: string, data: UpdateProfileInput) =>
      fetch(`${API_BASE}/api/profiles/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse<Profile>),

    checkHandle: (handle: string) =>
      fetch(`${API_BASE}/api/profiles/check-handle?handle=${handle}`).then(
        handleResponse<HandleAvailabilityResponse>
      ),
  },

  links: {
    getByProfileId: (profileId: string) =>
      fetch(`${API_BASE}/api/links?profileId=${profileId}`).then(handleResponse<Link[]>),

    create: async (data: CreateLinkInput) =>
      fetch(`${API_BASE}/api/links`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse<Link>),

    update: async (id: string, data: UpdateLinkInput) =>
      fetch(`${API_BASE}/api/links/${id}`, {
        method: 'PATCH',
        headers: await getAuthHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse<Link>),

    delete: async (id: string) =>
      fetch(`${API_BASE}/api/links/${id}`, {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      }).then(handleResponse<void>),

    reorder: async (profileId: string, linkIds: string[]) =>
      fetch(`${API_BASE}/api/links/reorder`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ profileId, linkIds }),
      }).then(handleResponse<void>),
  },
};
