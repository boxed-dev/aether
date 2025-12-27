#!/bin/bash
# Test script to verify rate limiting is working

echo "Testing Rate Limiting"
echo "===================="
echo ""

API_URL="http://localhost:3001"

# Test 1: Check health endpoint (should never be rate limited)
echo "Test 1: Health endpoint (should NOT be rate limited)"
for i in {1..10}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health")
  echo "  Request $i: HTTP $response"
done
echo ""

# Test 2: Test AUTH rate limit (5 req/min)
echo "Test 2: Auth endpoint (limit: 5 req/min)"
for i in {1..7}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.100" \
    -d '{"email":"test@example.com","password":"test123"}' \
    "$API_URL/api/auth/register")

  if [ $i -le 5 ]; then
    echo "  Request $i: HTTP $response (should be 400 or 409 - validation error or conflict)"
  else
    echo "  Request $i: HTTP $response (should be 429 - rate limited)"
  fi
done
echo ""

# Test 3: Test READ rate limit (100 req/min) - just test first 10
echo "Test 3: Read endpoint (limit: 100 req/min, testing first 10)"
for i in {1..10}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "X-Forwarded-For: 192.168.1.101" \
    "$API_URL/api/profiles/handle/test")
  echo "  Request $i: HTTP $response"
done
echo ""

# Test 4: Test different IPs get separate limits
echo "Test 4: Different IPs have separate limits"
echo "  IP 192.168.1.102:"
for i in {1..3}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.102" \
    -d '{"email":"test2@example.com","password":"test123"}' \
    "$API_URL/api/auth/register")
  echo "    Request $i: HTTP $response"
done

echo "  IP 192.168.1.103:"
for i in {1..3}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.103" \
    -d '{"email":"test3@example.com","password":"test123"}' \
    "$API_URL/api/auth/register")
  echo "    Request $i: HTTP $response"
done
echo ""

echo "Test 5: Check Retry-After header"
# Exceed limit first
for i in {1..5}; do
  curl -s -o /dev/null \
    -X POST \
    -H "Content-Type: application/json" \
    -H "X-Forwarded-For: 192.168.1.104" \
    -d '{"email":"test4@example.com","password":"test123"}' \
    "$API_URL/api/auth/register"
done

# Now check the error response
echo "  Exceeding limit..."
response=$(curl -s -i \
  -X POST \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 192.168.1.104" \
  -d '{"email":"test4@example.com","password":"test123"}' \
  "$API_URL/api/auth/register" | grep -E "(HTTP|Retry-After|rate)")

echo "$response"
echo ""

echo "===================="
echo "Rate limiting tests complete!"
echo ""
echo "Expected results:"
echo "  - Health checks: All should return 200"
echo "  - Auth requests: First 5 should pass, 6th+ should get 429"
echo "  - Read requests: All 10 should pass (under 100 limit)"
echo "  - Different IPs: Each should have separate limits"
echo "  - Retry-After: Should be present in 429 responses"
