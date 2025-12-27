import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  checkRateLimit,
  getRateLimitTier,
  RateLimitTier,
  rateLimitStore,
} from './rateLimit';
import { isOk } from '@aether-link/core-logic';

describe('rateLimit', () => {
  beforeEach(() => {
    // Clear the rate limit store before each test
    rateLimitStore.reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getRateLimitTier', () => {
    it('should return AUTH tier for register endpoint', () => {
      const request = new NextRequest('http://localhost:3001/api/auth/register', {
        method: 'POST',
      });
      expect(getRateLimitTier(request)).toBe(RateLimitTier.AUTH);
    });

    it('should return AUTH tier for auth/user endpoint', () => {
      const request = new NextRequest('http://localhost:3001/api/auth/user', {
        method: 'GET',
      });
      expect(getRateLimitTier(request)).toBe(RateLimitTier.AUTH);
    });

    it('should return CLICK tier for click tracking endpoint', () => {
      const request = new NextRequest('http://localhost:3001/api/links/123/click', {
        method: 'POST',
      });
      expect(getRateLimitTier(request)).toBe(RateLimitTier.CLICK);
    });

    it('should return WRITE tier for POST requests', () => {
      const request = new NextRequest('http://localhost:3001/api/profiles', {
        method: 'POST',
      });
      expect(getRateLimitTier(request)).toBe(RateLimitTier.WRITE);
    });

    it('should return WRITE tier for PATCH requests', () => {
      const request = new NextRequest('http://localhost:3001/api/profiles/123', {
        method: 'PATCH',
      });
      expect(getRateLimitTier(request)).toBe(RateLimitTier.WRITE);
    });

    it('should return WRITE tier for DELETE requests', () => {
      const request = new NextRequest('http://localhost:3001/api/links/123', {
        method: 'DELETE',
      });
      expect(getRateLimitTier(request)).toBe(RateLimitTier.WRITE);
    });

    it('should return READ tier for GET requests', () => {
      const request = new NextRequest('http://localhost:3001/api/profiles', {
        method: 'GET',
      });
      expect(getRateLimitTier(request)).toBe(RateLimitTier.READ);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests under the limit', () => {
      const request = new NextRequest('http://localhost:3001/api/profiles', {
        method: 'GET',
      });

      // First request should succeed
      const result = checkRateLimit(request, RateLimitTier.READ);
      expect(isOk(result)).toBe(true);
    });

    it('should block requests over the AUTH limit (5 req/min)', () => {
      const baseTime = Date.now();
      vi.setSystemTime(baseTime);

      const createRequest = () =>
        new NextRequest('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.168.1.1' },
        });

      // Make 5 requests - all should succeed
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(createRequest(), RateLimitTier.AUTH);
        expect(isOk(result)).toBe(true);
      }

      // 6th request should fail
      const result = checkRateLimit(createRequest(), RateLimitTier.AUTH);
      expect(isOk(result)).toBe(false);
      if (!isOk(result)) {
        expect(result.error.code).toBe('RATE_LIMITED');
        expect(result.error.details?.limit).toBe(5);
        expect(result.error.details?.retryAfter).toBeGreaterThan(0);
      }
    });

    it('should block requests over the WRITE limit (30 req/min)', () => {
      const baseTime = Date.now();
      vi.setSystemTime(baseTime);

      const createRequest = () =>
        new NextRequest('http://localhost:3001/api/profiles', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.168.1.1' },
        });

      // Make 30 requests - all should succeed
      for (let i = 0; i < 30; i++) {
        const result = checkRateLimit(createRequest(), RateLimitTier.WRITE);
        expect(isOk(result)).toBe(true);
      }

      // 31st request should fail
      const result = checkRateLimit(createRequest(), RateLimitTier.WRITE);
      expect(isOk(result)).toBe(false);
      if (!isOk(result)) {
        expect(result.error.code).toBe('RATE_LIMITED');
        expect(result.error.details?.limit).toBe(30);
      }
    });

    it('should reset after the time window passes', () => {
      const baseTime = Date.now();
      vi.setSystemTime(baseTime);

      const createRequest = () =>
        new NextRequest('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.168.1.1' },
        });

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(createRequest(), RateLimitTier.AUTH);
        expect(isOk(result)).toBe(true);
      }

      // 6th request should fail
      let result = checkRateLimit(createRequest(), RateLimitTier.AUTH);
      expect(isOk(result)).toBe(false);

      // Advance time by 61 seconds (past the 60-second window)
      vi.setSystemTime(baseTime + 61 * 1000);

      // Now request should succeed again
      result = checkRateLimit(createRequest(), RateLimitTier.AUTH);
      expect(isOk(result)).toBe(true);
    });

    it('should use sliding window (not fixed window)', () => {
      const baseTime = Date.now();
      vi.setSystemTime(baseTime);

      const createRequest = () =>
        new NextRequest('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.168.1.1' },
        });

      // Make 5 requests at time 0
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(createRequest(), RateLimitTier.AUTH);
        expect(isOk(result)).toBe(true);
      }

      // At time 30s, 6th request should still fail
      vi.setSystemTime(baseTime + 30 * 1000);
      let result = checkRateLimit(createRequest(), RateLimitTier.AUTH);
      expect(isOk(result)).toBe(false);

      // At time 60s+1ms, first request is now outside the window
      vi.setSystemTime(baseTime + 60 * 1000 + 1);
      result = checkRateLimit(createRequest(), RateLimitTier.AUTH);
      expect(isOk(result)).toBe(true);
    });

    it('should track different IPs separately', () => {
      const createRequest = (ip: string) =>
        new NextRequest('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: { 'x-forwarded-for': ip },
        });

      // IP 1: Make 5 requests
      for (let i = 0; i < 5; i++) {
        const result = checkRateLimit(createRequest('192.168.1.1'), RateLimitTier.AUTH);
        expect(isOk(result)).toBe(true);
      }

      // IP 1: 6th request should fail
      let result = checkRateLimit(createRequest('192.168.1.1'), RateLimitTier.AUTH);
      expect(isOk(result)).toBe(false);

      // IP 2: Should still have full quota
      for (let i = 0; i < 5; i++) {
        result = checkRateLimit(createRequest('192.168.1.2'), RateLimitTier.AUTH);
        expect(isOk(result)).toBe(true);
      }
    });

    it('should extract IP from X-Forwarded-For header', () => {
      const request = new NextRequest('http://localhost:3001/api/profiles', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
      });

      const result = checkRateLimit(request, RateLimitTier.READ);
      expect(isOk(result)).toBe(true);
    });

    it('should extract IP from X-Real-IP header', () => {
      const request = new NextRequest('http://localhost:3001/api/profiles', {
        method: 'GET',
        headers: { 'x-real-ip': '192.168.1.1' },
      });

      const result = checkRateLimit(request, RateLimitTier.READ);
      expect(isOk(result)).toBe(true);
    });

    it('should handle missing IP headers gracefully', () => {
      const request = new NextRequest('http://localhost:3001/api/profiles', {
        method: 'GET',
      });

      const result = checkRateLimit(request, RateLimitTier.READ);
      expect(isOk(result)).toBe(true);
    });

    it('should include retryAfter in error details', () => {
      const baseTime = Date.now();
      vi.setSystemTime(baseTime);

      const createRequest = () =>
        new NextRequest('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: { 'x-forwarded-for': '192.168.1.1' },
        });

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        checkRateLimit(createRequest(), RateLimitTier.AUTH);
      }

      // 6th request should fail with retryAfter
      const result = checkRateLimit(createRequest(), RateLimitTier.AUTH);
      expect(isOk(result)).toBe(false);
      if (!isOk(result)) {
        expect(result.error.details?.retryAfter).toBeDefined();
        expect(typeof result.error.details?.retryAfter).toBe('number');
        expect(result.error.details?.retryAfter).toBeGreaterThan(0);
        expect(result.error.details?.retryAfter).toBeLessThanOrEqual(60);
      }
    });
  });
});
