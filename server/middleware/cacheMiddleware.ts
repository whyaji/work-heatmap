/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context, Next } from 'hono';
import Redis from 'ioredis';

import env from '../lib/env';

// Redis client setup
const redis = new Redis(Number(env.REDIS_PORT), env.REDIS_HOST, {
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    return Math.min(times * 50, 1000);
  },
});

export class CacheService {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        return await this.redis.del(...keys);
      }
      return 0;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      return 0;
    }
  }
}

export const cacheService = new CacheService(redis);

// Generate cache key from request
function generateCacheKey(c: Context): string {
  const path = c.req.path;
  const query = c.req.query();
  const queryString =
    Object.keys(query).length > 0 ? '?' + new URLSearchParams(query).toString() : '';

  return `cwa-api-cache:${path}${queryString}`;
}

// Cache middleware factory
export const cacheMiddleware = (ttl: number = 300) => {
  return async (c: Context, next: Next) => {
    const cacheKey = generateCacheKey(c);

    // Try to get from cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log(`Cache HIT: ${cacheKey}`);
      return c.json(cached);
    }

    console.log(`Cache MISS: ${cacheKey}`);

    // Store original json method
    const originalJson = c.json.bind(c);
    let responseData: any = null;
    let statusCode: number = 200;

    // Override json method to capture response
    c.json = (data: any) => {
      responseData = data;
      statusCode = c.res.status;
      return originalJson(data);
    };

    await next();

    // Cache successful responses
    if (statusCode === 200 && responseData) {
      await cacheService.set(cacheKey, responseData, ttl);
      console.log(`Cached response: ${cacheKey}`);
    }
  };
};

// Cache invalidation middleware for data modifications
export const cacheInvalidationMiddleware = (patterns: string[]) => {
  return async (c: Context, next: Next) => {
    await next();

    // Only invalidate on successful modifications
    if (c.res.status >= 200 && c.res.status < 300) {
      for (const pattern of patterns) {
        const deletedCount = await cacheService.delPattern(pattern);
        if (deletedCount > 0) {
          console.log(`Invalidated ${deletedCount} cache entries matching pattern: ${pattern}`);
        }
      }
    }
  };
};

const hour = 3600;
const day = 24 * hour;
// Specific cache configurations for area endpoints
export const areaCacheConfig = {
  // Static hierarchical data - cache for 1 hour
  regional: cacheMiddleware(7 * day),
  wilayah: cacheMiddleware(7 * day),
  estate: cacheMiddleware(3 * day),
  afdeling: cacheMiddleware(3 * day),

  geoJson: cacheMiddleware(3 * day),
};

// Health check for cache
export const cacheHealthCheck = async (): Promise<boolean> => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing Redis connection...');
  await redis.quit();
});

process.on('SIGTERM', async () => {
  console.log('Closing Redis connection...');
  await redis.quit();
});
