import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from './middleware';
import { rateLimitStore } from './lib/rateLimit';

describe('CORS Middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    rateLimitStore.reset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('allows requests from localhost:3000', () => {
    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'http://localhost:3000',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBeTruthy();
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
  });

  it('allows requests from localhost:3002', () => {
    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'http://localhost:3002',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3002');
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
  });

  it('blocks requests from unauthorized origins', () => {
    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'http://malicious-site.com',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('allows custom origins from environment variable', () => {
    process.env.ALLOWED_ORIGINS = 'https://example.com,https://app.example.com';

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'https://example.com',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
  });

  it('blocks default origins when custom origins are set', () => {
    process.env.ALLOWED_ORIGINS = 'https://example.com';

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'http://localhost:3000',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('handles OPTIONS preflight requests', () => {
    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'OPTIONS',
      headers: {
        origin: 'http://localhost:3000',
      },
    });

    const response = middleware(request);

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
  });

  it('handles requests without origin header', () => {
    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('trims whitespace in ALLOWED_ORIGINS', () => {
    process.env.ALLOWED_ORIGINS = 'https://example.com , https://app.example.com';

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'https://app.example.com',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com');
  });

  it('allows Vercel preview URLs when VERCEL_ENV=preview', () => {
    process.env.VERCEL_ENV = 'preview';

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'https://my-app-abc123.vercel.app',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://my-app-abc123.vercel.app');
  });

  it('allows Vercel development URLs when VERCEL_ENV=development', () => {
    process.env.VERCEL_ENV = 'development';

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'https://my-app-dev-xyz.vercel.app',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://my-app-dev-xyz.vercel.app');
  });

  it('blocks HTTP Vercel URLs in preview environment (requires HTTPS)', () => {
    process.env.VERCEL_ENV = 'preview';

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'http://my-app-abc123.vercel.app',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('blocks non-Vercel URLs in preview environment without explicit allow list', () => {
    process.env.VERCEL_ENV = 'preview';

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'https://example.com',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('allows explicit origins in ALLOWED_ORIGINS even in Vercel preview', () => {
    process.env.VERCEL_ENV = 'preview';
    process.env.ALLOWED_ORIGINS = 'https://example.com';

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'https://example.com',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
  });

  it('blocks localhost in Vercel environments', () => {
    process.env.VERCEL_ENV = 'preview';
    delete process.env.ALLOWED_ORIGINS;

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'http://localhost:3000',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('allows localhost:3000 in local development (no VERCEL_ENV)', () => {
    delete process.env.VERCEL_ENV;

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'http://localhost:3000',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
  });

  it('allows 127.0.0.1 in local development', () => {
    delete process.env.VERCEL_ENV;

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'http://127.0.0.1:3000',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://127.0.0.1:3000');
  });

  it('allows *.localhost domains in local development', () => {
    delete process.env.VERCEL_ENV;

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'http://myapp.localhost:3000',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://myapp.localhost:3000');
  });

  it('handles invalid origin URLs gracefully', () => {
    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'not-a-valid-url',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('blocks Vercel URLs when not in Vercel environment', () => {
    delete process.env.VERCEL_ENV;

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'https://my-app-abc123.vercel.app',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('does not allow Vercel URLs in production unless in ALLOWED_ORIGINS', () => {
    process.env.VERCEL_ENV = 'production';

    const request = new NextRequest('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        origin: 'https://my-app-abc123.vercel.app',
      },
    });

    const response = middleware(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });
});

describe('Rate Limiting Middleware', () => {
  beforeEach(() => {
    rateLimitStore.reset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow OPTIONS requests without rate limiting', () => {
    const request = new NextRequest('http://localhost:3001/api/profiles', {
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:3000' },
    });

    const response = middleware(request);

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
  });

  it('should allow requests under rate limit', () => {
    const request = new NextRequest('http://localhost:3001/api/profiles', {
      method: 'GET',
      headers: {
        origin: 'http://localhost:3000',
        'x-forwarded-for': '192.168.1.1',
      },
    });

    const response = middleware(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
  });

  it('should block requests over rate limit for auth endpoints', () => {
    const baseTime = Date.now();
    vi.setSystemTime(baseTime);

    const createRequest = () =>
      new NextRequest('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          'x-forwarded-for': '192.168.1.1',
        },
      });

    // Make 5 requests - all should succeed
    for (let i = 0; i < 5; i++) {
      const response = middleware(createRequest());
      expect(response.status).toBe(200);
    }

    // 6th request should fail with 429
    const response = middleware(createRequest());
    expect(response.status).toBe(429);

    // Should have CORS headers even on error
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');

    // Should have Retry-After header
    expect(response.headers.get('Retry-After')).toBeDefined();
  });

  it('should not rate limit health check endpoint', () => {
    const baseTime = Date.now();
    vi.setSystemTime(baseTime);

    // Make 200 health check requests (well over any limit)
    for (let i = 0; i < 200; i++) {
      const request = new NextRequest('http://localhost:3001/api/health', {
        method: 'GET',
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });

      const response = middleware(request);
      expect(response.status).toBe(200);
    }
  });

  it('should return proper error response structure when rate limited', async () => {
    const baseTime = Date.now();
    vi.setSystemTime(baseTime);

    const createRequest = () =>
      new NextRequest('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          'x-forwarded-for': '192.168.1.1',
        },
      });

    // Exceed limit
    for (let i = 0; i < 5; i++) {
      middleware(createRequest());
    }

    const response = middleware(createRequest());
    expect(response.status).toBe(429);

    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toHaveProperty('code', 'RATE_LIMITED');
    expect(body.error).toHaveProperty('message');
  });

  it('should not set CORS headers for disallowed origins on rate limit errors', () => {
    const baseTime = Date.now();
    vi.setSystemTime(baseTime);

    const createRequest = () =>
      new NextRequest('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          origin: 'http://evil-site.com',
          'x-forwarded-for': '192.168.1.1',
        },
      });

    // Exceed limit
    for (let i = 0; i < 5; i++) {
      middleware(createRequest());
    }

    const response = middleware(createRequest());

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
  });

  it('should apply different limits for different endpoint types', () => {
    const baseTime = Date.now();
    vi.setSystemTime(baseTime);

    // Test AUTH limit (5 req/min)
    for (let i = 0; i < 5; i++) {
      const request = new NextRequest('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });
      const response = middleware(request);
      expect(response.status).toBe(200);
    }

    const authRequest = new NextRequest('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'x-forwarded-for': '192.168.1.1' },
    });
    expect(middleware(authRequest).status).toBe(429);

    // Test WRITE limit (30 req/min) - different IP
    for (let i = 0; i < 30; i++) {
      const request = new NextRequest('http://localhost:3001/api/profiles', {
        method: 'POST',
        headers: { 'x-forwarded-for': '192.168.1.2' },
      });
      const response = middleware(request);
      expect(response.status).toBe(200);
    }

    const writeRequest = new NextRequest('http://localhost:3001/api/profiles', {
      method: 'POST',
      headers: { 'x-forwarded-for': '192.168.1.2' },
    });
    expect(middleware(writeRequest).status).toBe(429);
  });
});
