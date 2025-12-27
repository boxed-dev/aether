import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { fail, type Result } from '@aether-link/core-logic';

/**
 * Gets AUTH_SECRET from environment
 * Read dynamically to support testing
 */
function getAuthSecret(): string | undefined {
  const secret = process.env.AUTH_SECRET;

  if (!secret && process.env.NODE_ENV !== 'test') {
    throw new Error('AUTH_SECRET environment variable is required');
  }

  return secret;
}

interface JWTPayload {
  id: string;
  email?: string;
}

/**
 * Verifies JWT token from Authorization header
 * @param request - NextRequest object
 * @returns User ID if token is valid, null otherwise
 */
export async function verifyAuth(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const AUTH_SECRET = getAuthSecret();

  if (!token || !AUTH_SECRET) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const userId = payload.id as string | undefined;

    if (!userId) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}

/**
 * Requires authentication for the request
 * @param request - NextRequest object
 * @returns Result containing user ID or UNAUTHORIZED error
 */
export async function requireAuth(request: NextRequest): Promise<Result<string>> {
  const userId = await verifyAuth(request);

  if (!userId) {
    return fail('UNAUTHORIZED', 'Authentication required');
  }

  return { success: true, data: userId };
}

/**
 * Verifies that the authenticated user owns a profile
 * @param userId - Authenticated user ID
 * @param profile - Profile to check ownership for
 * @returns Result with void on success or FORBIDDEN error
 */
export function verifyProfileOwnership(
  userId: string,
  profile: { userId: string } | null
): Result<void> {
  if (!profile) {
    return fail('NOT_FOUND', 'Profile not found');
  }

  if (profile.userId !== userId) {
    return fail('FORBIDDEN', 'You do not have permission to access this profile');
  }

  return { success: true, data: undefined };
}

/**
 * Verifies that the authenticated user owns a link's profile
 * @param userId - Authenticated user ID
 * @param link - Link with profile information to check ownership for
 * @param profile - Profile that owns the link
 * @returns Result with void on success or FORBIDDEN error
 */
export function verifyLinkOwnership(
  userId: string,
  link: { profileId: string } | null,
  profile: { userId: string } | null
): Result<void> {
  if (!link) {
    return fail('NOT_FOUND', 'Link not found');
  }

  if (!profile) {
    return fail('NOT_FOUND', 'Profile not found');
  }

  if (profile.userId !== userId) {
    return fail('FORBIDDEN', 'You do not have permission to access this link');
  }

  return { success: true, data: undefined };
}
