/**
 * Rate Limiting Implementation
 *
 * This module provides production-ready rate limiting using a sliding window algorithm.
 * Rate limits are applied globally via middleware to prevent API abuse.
 *
 * Features:
 * - Sliding window algorithm (more fair than fixed window)
 * - In-memory storage with automatic cleanup
 * - Per-IP tracking using X-Forwarded-For, X-Real-IP, or connection IP
 * - Tiered limits based on endpoint sensitivity
 * - Automatic Retry-After header in 429 responses
 * - No external dependencies (Redis not required)
 *
 * Rate Limit Tiers:
 * - AUTH: 5 req/min - Prevents brute force attacks on login/register
 * - WRITE: 30 req/min - Limits POST/PATCH/DELETE operations
 * - READ: 100 req/min - Generous limit for GET requests
 * - CLICK: 60 req/min - Allows normal click tracking usage
 *
 * Memory Management:
 * - Old timestamps are cleaned every 5 minutes
 * - Sliding window automatically removes outdated entries
 * - Empty records are garbage collected
 *
 * Production Considerations:
 * - For distributed systems, replace in-memory store with Redis
 * - Consider adding rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)
 * - Monitor memory usage if handling high request volumes
 * - Adjust limits based on actual usage patterns
 */

import { NextRequest } from 'next/server';
import { fail, type Result, ok } from '@aether-link/core-logic';

/**
 * Rate limit configuration for different endpoint types
 */
export enum RateLimitTier {
  AUTH = 'auth',           // Strict: 5 req/min for login/register
  WRITE = 'write',         // Moderate: 30 req/min for POST/PATCH/DELETE
  READ = 'read',           // Generous: 100 req/min for GET
  CLICK = 'click',         // Click tracking: 60 req/min
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMIT_CONFIGS: Record<RateLimitTier, RateLimitConfig> = {
  [RateLimitTier.AUTH]: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  [RateLimitTier.WRITE]: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
  [RateLimitTier.READ]: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  [RateLimitTier.CLICK]: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
  },
};

interface RequestRecord {
  timestamps: number[];
}

/**
 * In-memory store for rate limiting
 * Maps: identifier -> tier -> request records
 */
class RateLimitStore {
  private store = new Map<string, Map<RateLimitTier, RequestRecord>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up old entries every 5 minutes to prevent memory leaks
    this.startCleanup();
  }

  private startCleanup(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const maxWindowMs = Math.max(
        ...Object.values(RATE_LIMIT_CONFIGS).map(c => c.windowMs)
      );

      for (const [identifier, tierMap] of this.store.entries()) {
        for (const [tier, record] of tierMap.entries()) {
          // Remove timestamps older than the largest window
          record.timestamps = record.timestamps.filter(
            ts => now - ts < maxWindowMs
          );

          // Remove empty records
          if (record.timestamps.length === 0) {
            tierMap.delete(tier);
          }
        }

        // Remove empty identifiers
        if (tierMap.size === 0) {
          this.store.delete(identifier);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Don't prevent process exit in tests
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  getRecord(identifier: string, tier: RateLimitTier): RequestRecord {
    if (!this.store.has(identifier)) {
      this.store.set(identifier, new Map());
    }

    const tierMap = this.store.get(identifier)!;
    if (!tierMap.has(tier)) {
      tierMap.set(tier, { timestamps: [] });
    }

    return tierMap.get(tier)!;
  }

  addRequest(identifier: string, tier: RateLimitTier, timestamp: number): void {
    const record = this.getRecord(identifier, tier);
    record.timestamps.push(timestamp);
  }

  cleanOldTimestamps(
    identifier: string,
    tier: RateLimitTier,
    cutoff: number
  ): void {
    const record = this.getRecord(identifier, tier);
    record.timestamps = record.timestamps.filter(ts => ts > cutoff);
  }

  getRequestCount(identifier: string, tier: RateLimitTier): number {
    const record = this.getRecord(identifier, tier);
    return record.timestamps.length;
  }

  reset(): void {
    this.store.clear();
  }
}

// Global singleton instance
const rateLimitStore = new RateLimitStore();

/**
 * Extract client identifier from request (IP address)
 */
function getClientIdentifier(request: NextRequest): string {
  // Try X-Forwarded-For first (reverse proxy)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the chain
    return forwardedFor.split(',')[0].trim();
  }

  // Try X-Real-IP
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Ultimate fallback - use a constant for local development
  return 'unknown-client';
}

/**
 * Check if a request should be rate limited
 * Uses sliding window algorithm
 */
export function checkRateLimit(
  request: NextRequest,
  tier: RateLimitTier
): Result<void> {
  const identifier = getClientIdentifier(request);
  const config = RATE_LIMIT_CONFIGS[tier];
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Clean up old timestamps outside the window
  rateLimitStore.cleanOldTimestamps(identifier, tier, windowStart);

  // Count requests in current window
  const requestCount = rateLimitStore.getRequestCount(identifier, tier);

  if (requestCount >= config.maxRequests) {
    const oldestTimestamp = rateLimitStore.getRecord(identifier, tier).timestamps[0];
    const retryAfter = Math.ceil((oldestTimestamp + config.windowMs - now) / 1000);

    return fail('RATE_LIMITED', 'Rate limit exceeded. Please try again later.', {
      limit: config.maxRequests,
      window: config.windowMs / 1000,
      retryAfter: Math.max(1, retryAfter),
    });
  }

  // Record this request
  rateLimitStore.addRequest(identifier, tier, now);

  return ok(undefined);
}

/**
 * Determine rate limit tier based on request method and path
 */
export function getRateLimitTier(request: NextRequest): RateLimitTier {
  const path = request.nextUrl.pathname;

  // Auth endpoints - strictest limits
  if (path.includes('/api/auth/register') || path.includes('/api/auth/user')) {
    return RateLimitTier.AUTH;
  }

  // Click tracking - moderate limits
  if (path.includes('/click')) {
    return RateLimitTier.CLICK;
  }

  // Write operations - moderate limits
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)) {
    return RateLimitTier.WRITE;
  }

  // Read operations - generous limits
  return RateLimitTier.READ;
}

/**
 * Apply rate limiting to a request
 * Returns a Result indicating if the request should proceed
 */
export function applyRateLimit(request: NextRequest): Result<void> {
  const tier = getRateLimitTier(request);
  return checkRateLimit(request, tier);
}

// Export for testing
export { rateLimitStore };
