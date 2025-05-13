import { Redis } from 'ioredis';
import { NextRequest } from 'next/server';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  uniqueTokenPerInterval: number; // Max number of unique tokens per interval
  maxRequests: number; // Max number of requests per interval
}

export class RateLimit {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.config = config;
  }
  async check(request: NextRequest): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
    const key = `rate-limit:${ip}`;

    const now = Date.now();
    const windowStart = now - this.config.interval;

    // Get current count and window start
    const multi = this.redis.multi();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zcard(key);
    multi.zadd(key, now, `${now}`);
    multi.expire(key, Math.ceil(this.config.interval / 1000));

    const [, count] = await multi.exec() as [any, number];

    const limit = this.config.maxRequests;
    const remaining = Math.max(0, limit - count);
    const reset = now + this.config.interval;

    return {
      success: count < limit,
      limit,
      remaining,
      reset
    };
  }
}

// Create a singleton instance
export const rateLimit = new RateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
  maxRequests: 60 // 60 requests per minute
});