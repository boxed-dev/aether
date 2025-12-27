import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applyRateLimit } from '@/lib/rateLimit';
import { isOk } from '@aether-link/core-logic';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3002',
];

/**
 * Checks if an origin is allowed based on environment configuration
 * Supports:
 * - Explicit origins from ALLOWED_ORIGINS env var
 * - Localhost URLs in development (when ALLOWED_ORIGINS not set)
 * - Vercel preview deployments (*.vercel.app)
 */
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    return false;
  }

  // Parse the origin URL
  let originUrl: URL;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  // Get explicitly allowed origins from environment
  const envOrigins = process.env.ALLOWED_ORIGINS;
  const hasExplicitOrigins = Boolean(envOrigins);
  const explicitOrigins = envOrigins
    ? envOrigins.split(',').map(o => o.trim())
    : [];

  // Check if origin is in explicit allow list
  if (explicitOrigins.includes(origin)) {
    return true;
  }

  // In Vercel preview/development environments, allow *.vercel.app domains
  const isVercelPreview = process.env.VERCEL_ENV === 'preview';
  const isVercelDevelopment = process.env.VERCEL_ENV === 'development';
  const isVercelDeployment = isVercelPreview || isVercelDevelopment;

  if (isVercelDeployment && originUrl.hostname.endsWith('.vercel.app')) {
    // Ensure it's HTTPS in Vercel deployments
    if (originUrl.protocol === 'https:') {
      return true;
    }
  }

  // In local development (not Vercel), allow localhost URLs ONLY if no explicit origins set
  // When VERCEL_ENV is set, we're in a Vercel deployment, so block localhost for security
  if (!process.env.VERCEL_ENV) {
    // Only allow localhost if no explicit origins configured
    if (!hasExplicitOrigins) {
      const isLocalhost = originUrl.hostname === 'localhost' ||
                         originUrl.hostname === '127.0.0.1' ||
                         originUrl.hostname.endsWith('.localhost');
      if (isLocalhost) {
        return true;
      }
    }
  }

  return false;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const originAllowed = isOriginAllowed(origin);

  // Handle preflight requests early (no rate limiting for OPTIONS)
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });

    if (originAllowed && origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  }

  // Apply rate limiting (skip health check endpoint)
  if (!request.nextUrl.pathname.includes('/api/health')) {
    const rateLimitResult = applyRateLimit(request);

    if (!isOk(rateLimitResult)) {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add CORS headers to error response
      if (originAllowed && origin) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
      }

      // Add Retry-After header
      if (rateLimitResult.error.details?.retryAfter) {
        headers['Retry-After'] = String(rateLimitResult.error.details.retryAfter);
      }

      const isProduction = process.env.NODE_ENV === 'production';

      return NextResponse.json(
        {
          error: {
            code: rateLimitResult.error.code,
            message: rateLimitResult.error.message,
            ...(isProduction ? {} : { details: rateLimitResult.error.details }),
          },
        },
        { status: 429, headers }
      );
    }
  }

  const response = NextResponse.next();

  // Set CORS headers for successful requests
  if (originAllowed && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
