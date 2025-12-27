# Rate Limiting

## Overview

The Aether Link API implements production-ready rate limiting to prevent abuse and ensure fair usage. Rate limits are applied automatically via middleware using a sliding window algorithm.

## Rate Limit Tiers

| Tier | Endpoints | Limit | Purpose |
|------|-----------|-------|---------|
| **AUTH** | `/api/auth/register`, `/api/auth/user` | 5 req/min | Prevents brute force attacks |
| **WRITE** | POST, PATCH, PUT, DELETE operations | 30 req/min | Limits write operations |
| **READ** | GET operations | 100 req/min | Generous limit for reads |
| **CLICK** | `/api/links/[id]/click` | 60 req/min | Allows normal click tracking |

All limits are **per IP address per minute**.

## Implementation Details

### Algorithm
- **Sliding Window**: More fair than fixed windows
- Tracks request timestamps within a rolling 60-second window
- Automatically cleans up old entries every 5 minutes

### IP Detection
The system extracts client IP from headers in this order:
1. `X-Forwarded-For` (first IP in the chain)
2. `X-Real-IP`
3. Connection IP
4. Fallback to `unknown-client` (for local development)

### Error Response
When rate limited, clients receive:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
Content-Type: application/json

{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 5,
      "window": 60,
      "retryAfter": 45
    }
  }
}
```

**Note:** `details` are only included in non-production environments.

## Excluded Endpoints

The following endpoints are NOT rate limited:
- `/api/health` - Health checks should always work

## Testing Rate Limits

### Automated Tests
```bash
# Run rate limit unit tests
pnpm test rateLimit

# Run middleware integration tests
pnpm test middleware

# Run all tests
pnpm test
```

### Manual Testing
```bash
# Start the API server
pnpm --filter @aether-link/api dev

# Run the test script (in another terminal)
cd apps/api
./test-rate-limit.sh
```

### Using cURL
```bash
# Test auth endpoint (limit: 5/min)
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/register \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.1" \
    -d '{"email":"test@example.com","password":"test123"}' \
    -w "\nHTTP Status: %{http_code}\n\n"
done
```

## Monitoring

### Recommended Metrics
Track the following in production:
- Rate limit hits (429 responses) by endpoint
- Top offending IPs
- Average requests per IP
- Memory usage of rate limit store

### Log Example
```typescript
// Log rate limit hits
if (response.status === 429) {
  console.log('[RATE_LIMIT]', {
    ip: request.headers.get('x-forwarded-for'),
    endpoint: request.url,
    tier: rateLimitTier,
  });
}
```

## Scaling Considerations

### Current Implementation
- **Storage**: In-memory Map
- **Cleanup**: Every 5 minutes via setInterval
- **Best For**: Single-server deployments

### For Multi-Server Deployments
Replace the in-memory store with Redis:

```typescript
// Example Redis-based rate limiter
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function checkRateLimit(ip: string, tier: RateLimitTier) {
  const key = `ratelimit:${tier}:${ip}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 60); // 1 minute TTL
  }

  const limit = RATE_LIMIT_CONFIGS[tier].maxRequests;

  if (count > limit) {
    const ttl = await redis.ttl(key);
    return fail('RATE_LIMITED', 'Rate limit exceeded', {
      limit,
      retryAfter: ttl,
    });
  }

  return ok(undefined);
}
```

## Adjusting Limits

To modify rate limits, edit `/apps/api/src/lib/rateLimit.ts`:

```typescript
const RATE_LIMIT_CONFIGS: Record<RateLimitTier, RateLimitConfig> = {
  [RateLimitTier.AUTH]: {
    maxRequests: 5,      // ← Adjust this
    windowMs: 60 * 1000, // ← Or this (1 minute)
  },
  // ...
};
```

### Recommended Limits by Environment

| Environment | AUTH | WRITE | READ | CLICK |
|------------|------|-------|------|-------|
| Development | 100 | 1000 | 1000 | 1000 |
| Staging | 10 | 60 | 200 | 120 |
| Production | 5 | 30 | 100 | 60 |

## Troubleshooting

### Issue: Getting 429 errors during development

**Solution 1**: The rate limit store persists across hot reloads. Restart the dev server.

**Solution 2**: Temporarily increase limits for development:
```typescript
// In rateLimit.ts
const isDevelopment = process.env.NODE_ENV === 'development';
const RATE_LIMIT_CONFIGS = {
  [RateLimitTier.AUTH]: {
    maxRequests: isDevelopment ? 1000 : 5,
    windowMs: 60 * 1000,
  },
  // ...
};
```

### Issue: Rate limits not working

**Check these:**
1. Is middleware applied? Check `/apps/api/src/middleware.ts`
2. Is the endpoint excluded? Check health endpoint exception
3. Are you testing from the same IP? Try different IPs via X-Forwarded-For header

### Issue: Memory leaks

The cleanup interval runs every 5 minutes. If you're seeing memory issues:
1. Reduce cleanup interval
2. Implement more aggressive cleanup
3. Consider Redis-based storage

## Security Best Practices

1. **Never disable rate limiting in production**
2. **Monitor 429 responses** - High rates indicate potential attacks
3. **Combine with other security measures**:
   - IP allowlisting for admin endpoints
   - CAPTCHA for repeated failed auth attempts
   - Account lockouts after N failed logins
4. **Use reverse proxy rate limiting** (Nginx, Cloudflare) as first line of defense
5. **Set up alerts** for unusual rate limit patterns

## Future Enhancements

Potential improvements:
- [ ] Distributed rate limiting with Redis
- [ ] Rate limit headers (X-RateLimit-*)
- [ ] User-based rate limiting (in addition to IP)
- [ ] Configurable limits via environment variables
- [ ] Rate limit bypass for authenticated admin users
- [ ] Exponential backoff for repeated violations
- [ ] Persistent blocklist for abusive IPs
