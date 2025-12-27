import { describe, it, expect, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyAuth, requireAuth, verifyProfileOwnership, verifyLinkOwnership } from './auth';
import { SignJWT } from 'jose';
import { isOk } from '@aether-link/core-logic';

const TEST_SECRET = 'test-secret-key-for-jwt-verification-only';
const secret = new TextEncoder().encode(TEST_SECRET);

describe('Auth Utilities', () => {
  let validToken: string;
  const userId = 'test-user-id';

  beforeAll(async () => {
    // Override AUTH_SECRET for tests FIRST before creating token
    process.env.AUTH_SECRET = TEST_SECRET;

    // Create a valid JWT token for testing
    // NextAuth expects specific claims in the JWT
    validToken = await new SignJWT({
      id: userId,
      email: 'test@example.com',
      sub: userId // subject claim
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(secret);
  });

  describe('verifyAuth', () => {
    it('should return null when no Authorization header is present', async () => {
      const request = new NextRequest('http://localhost:3001/api/test');
      const result = await verifyAuth(request);
      expect(result).toBeNull();
    });

    it('should return null when Authorization header is malformed', async () => {
      const request = new NextRequest('http://localhost:3001/api/test', {
        headers: {
          Authorization: 'InvalidFormat',
        },
      });
      const result = await verifyAuth(request);
      expect(result).toBeNull();
    });

    it('should return null when token is invalid', async () => {
      const request = new NextRequest('http://localhost:3001/api/test', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });
      const result = await verifyAuth(request);
      expect(result).toBeNull();
    });

    it('should return user ID when token is valid', async () => {
      const request = new NextRequest('http://localhost:3001/api/test', {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });
      const result = await verifyAuth(request);
      expect(result).toBe(userId);
    });
  });

  describe('requireAuth', () => {
    it('should return UNAUTHORIZED error when no token is present', async () => {
      const request = new NextRequest('http://localhost:3001/api/test');
      const result = await requireAuth(request);
      expect(isOk(result)).toBe(false);
      if (!isOk(result)) {
        expect(result.error.code).toBe('UNAUTHORIZED');
        expect(result.error.message).toBe('Authentication required');
      }
    });

    it('should return user ID when token is valid', async () => {
      const request = new NextRequest('http://localhost:3001/api/test', {
        headers: {
          Authorization: `Bearer ${validToken}`,
        },
      });
      const result = await requireAuth(request);
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(userId);
      }
    });
  });

  describe('verifyProfileOwnership', () => {
    it('should return NOT_FOUND when profile is null', () => {
      const result = verifyProfileOwnership(userId, null);
      expect(isOk(result)).toBe(false);
      if (!isOk(result)) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });

    it('should return FORBIDDEN when user does not own the profile', () => {
      const profile = { userId: 'other-user-id' };
      const result = verifyProfileOwnership(userId, profile);
      expect(isOk(result)).toBe(false);
      if (!isOk(result)) {
        expect(result.error.code).toBe('FORBIDDEN');
      }
    });

    it('should return success when user owns the profile', () => {
      const profile = { userId };
      const result = verifyProfileOwnership(userId, profile);
      expect(isOk(result)).toBe(true);
    });
  });

  describe('verifyLinkOwnership', () => {
    it('should return NOT_FOUND when link is null', () => {
      const profile = { userId };
      const result = verifyLinkOwnership(userId, null, profile);
      expect(isOk(result)).toBe(false);
      if (!isOk(result)) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });

    it('should return NOT_FOUND when profile is null', () => {
      const link = { profileId: 'profile-id' };
      const result = verifyLinkOwnership(userId, link, null);
      expect(isOk(result)).toBe(false);
      if (!isOk(result)) {
        expect(result.error.code).toBe('NOT_FOUND');
      }
    });

    it('should return FORBIDDEN when user does not own the profile', () => {
      const link = { profileId: 'profile-id' };
      const profile = { userId: 'other-user-id' };
      const result = verifyLinkOwnership(userId, link, profile);
      expect(isOk(result)).toBe(false);
      if (!isOk(result)) {
        expect(result.error.code).toBe('FORBIDDEN');
      }
    });

    it('should return success when user owns the profile', () => {
      const link = { profileId: 'profile-id' };
      const profile = { userId };
      const result = verifyLinkOwnership(userId, link, profile);
      expect(isOk(result)).toBe(true);
    });
  });
});
