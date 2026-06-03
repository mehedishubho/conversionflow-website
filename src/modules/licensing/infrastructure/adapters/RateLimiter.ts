/**
 * RateLimiter - Redis sorted-set sliding window rate limiter
 *
 * Enforces 100 requests per minute per IP address (D-08).
 * Uses Redis sorted sets (ZADD/ZREMRANGEBYSCORE/ZCARD) for atomic sliding window.
 * Falls back to in-memory tracking when Redis is unavailable (dev mode).
 */

import { redis } from "@/lib/redis";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 100;
const RATE_LIMIT_KEY_PREFIX = "ratelimit:v1:";

// In-memory fallback for dev without Redis
const memoryBuckets = new Map<string, number[]>();

export class RateLimiter {
  /**
   * Check if a request from the given IP is within rate limits.
   * Uses Redis sorted-set sliding window when available, in-memory fallback otherwise.
   *
   * @param ip - Client IP address
   * @returns Object with allowed flag and retryAfter seconds (0 if allowed)
   */
  static async check(ip: string): Promise<{ allowed: boolean; retryAfter: number }> {
    if (!redis) {
      return InMemoryRateLimiter.check(ip);
    }

    const key = `${RATE_LIMIT_KEY_PREFIX}${ip}`;
    const now = Date.now();
    const windowStart = now - WINDOW_SECONDS * 1000;

    // Pipeline for atomicity: remove expired, add current, count, set expiry
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, now, `${now}-${Math.random().toString(36).slice(2)}`);
    pipeline.zcard(key);
    pipeline.pexpire(key, WINDOW_SECONDS * 1000 + 10000);

    const results = await pipeline.exec();
    if (!results) return { allowed: true, retryAfter: 0 };
    for (const [err] of results) {
      if (err) {
        console.error("[RateLimiter] Pipeline error:", err);
        return { allowed: true, retryAfter: 0 }; // Fail open
      }
    }
    const count = (results[2][1] as number) ?? 0;

    if (count > MAX_REQUESTS) {
      // Find oldest entry to calculate retry-after
      const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
      const oldestScore = oldest[1] ? parseInt(oldest[1], 10) : now;
      const retryAfter = Math.ceil((oldestScore + WINDOW_SECONDS * 1000 - now) / 1000);
      return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
    }

    return { allowed: true, retryAfter: 0 };
  }
}

/**
 * In-memory rate limiter for development without Redis.
 * Uses a simple sliding window with timestamp array per IP.
 */
class InMemoryRateLimiter {
  static check(ip: string): { allowed: boolean; retryAfter: number } {
    const now = Date.now();
    const windowStart = now - WINDOW_SECONDS * 1000;
    let bucket = memoryBuckets.get(ip) ?? [];
    bucket = bucket.filter((t) => t > windowStart);
    if (bucket.length >= MAX_REQUESTS) {
      return {
        allowed: false,
        retryAfter: Math.ceil((bucket[0] + WINDOW_SECONDS * 1000 - now) / 1000),
      };
    }
    bucket.push(now);
    memoryBuckets.set(ip, bucket);
    return { allowed: true, retryAfter: 0 };
  }
}
