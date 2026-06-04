import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

let redis: Redis | null = null;
let memoryStore: Map<string, { value: string; expires: number }> | null = null;

if (process.env.REDIS_URL) {
  redis =
    globalForRedis.redis ??
    new Redis(process.env.REDIS_URL, {
      // Connection optimization
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 10) return null;
        return Math.min(times * 200, 5000);
      },
      // Performance optimization
      enableReadyCheck: true,
      enableOfflineQueue: true,
      // Connection pooling
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      // Keep-alive settings
      keepAlive: 30,
      // Connection timeout
      connectTimeout: 10000,
      // Command timeout
      lazyConnect: false,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = redis;
  }

  redis.on("error", (err) => {
    console.warn("[Redis] Connection error:", err.message);
  });

  redis.on("connect", () => {
    console.log("[Redis] Connected successfully");
  });

  redis.on("ready", () => {
    console.log("[Redis] Ready for commands");
  });

  console.warn("[Redis] Connected to Redis for session storage and caching.");
} else {
  memoryStore = new Map();
  console.warn(
    "[Redis] No REDIS_URL found. Using in-memory fallback. Sessions will not persist across restarts."
  );
}

// Cache key prefixes for better organization
const CACHE_PREFIX = {
  SESSION: 'session:',
  BLOG: 'blog:',
  SEO: 'seo:',
  API: 'api:',
  USER: 'user:',
  LICENSE: 'license:',
};

// Helper functions that work with either Redis or memory store
export async function kvGet(key: string): Promise<string | null> {
  if (redis) return redis.get(key);
  if (!memoryStore) return null;
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expires && Date.now() > entry.expires) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

export async function kvSet(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> {
  if (redis) {
    if (ttlSeconds) {
      await redis.set(key, value, "EX", ttlSeconds);
    } else {
      await redis.set(key, value);
    }
    return;
  }
  if (!memoryStore) return;
  memoryStore.set(key, {
    value,
    expires: ttlSeconds ? Date.now() + ttlSeconds * 1000 : Infinity,
  });
}

export async function kvDelete(key: string): Promise<void> {
  if (redis) {
    await redis.del(key);
    return;
  }
  memoryStore?.delete(key);
}

// New cache management functions
export async function cacheGet(
  type: keyof typeof CACHE_PREFIX,
  key: string
): Promise<string | null> {
  return kvGet(`${CACHE_PREFIX[type]}${key}`);
}

export async function cacheSet(
  type: keyof typeof CACHE_PREFIX,
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> {
  // Default TTLs based on cache type
  const defaultTTLs: Record<string, number> = {
    SESSION: 86400, // 24 hours
    BLOG: 3600,     // 1 hour
    SEO: 7200,      // 2 hours
    API: 1800,      // 30 minutes
    USER: 3600,     // 1 hour
    LICENSE: 300,   // 5 minutes
  };

  const ttl = ttlSeconds ?? defaultTTLs[type];
  return kvSet(`${CACHE_PREFIX[type]}${key}`, value, ttl);
}

export async function cacheDelete(
  type: keyof typeof CACHE_PREFIX,
  key: string
): Promise<void> {
  return kvDelete(`${CACHE_PREFIX[type]}${key}`);
}

// Batch operations for better performance
export async function cacheGetMany(
  type: keyof typeof CACHE_PREFIX,
  keys: string[]
): Promise<string[]> {
  if (redis) {
    const prefixedKeys = keys.map(key => `${CACHE_PREFIX[type]}${key}`);
    return redis.mget(...prefixedKeys).then(vals => vals.map(v => v ?? ''));
  }

  // Memory store fallback
  const results: string[] = [];
  for (const key of keys) {
    const value = await cacheGet(type, key);
    results.push(value || '');
  }
  return results;
}

export async function cacheDeletePattern(
  type: keyof typeof CACHE_PREFIX,
  pattern: string
): Promise<void> {
  if (redis) {
    const stream = redis.scanStream({
      match: `${CACHE_PREFIX[type]}${pattern}`,
      count: 100,
    });

    const keys: string[] = [];
    for await (const key of stream) {
      keys.push(key);
    }

    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return;
  }

  // Memory store fallback - delete all matching keys
  if (!memoryStore) return;
  const prefix = CACHE_PREFIX[type];
  for (const key of memoryStore.keys()) {
    if (key.startsWith(prefix) && key.substring(prefix.length).match(pattern)) {
      memoryStore.delete(key);
    }
  }
}

// Cache statistics (for monitoring)
export async function getCacheSize(type: keyof typeof CACHE_PREFIX): Promise<number> {
  if (redis) {
    const keys = await redis.keys(`${CACHE_PREFIX[type]}*`);
    return keys.length;
  }
  if (!memoryStore) return 0;

  let count = 0;
  const prefix = CACHE_PREFIX[type];
  for (const key of memoryStore.keys()) {
    if (key.startsWith(prefix)) count++;
  }
  return count;
}

// BullMQ requires maxRetriesPerRequest to be null — it handles retries at the job level.
// Create a dedicated connection for BullMQ workers/queues.
let bullRedis: Redis | null = null;
if (process.env.REDIS_URL) {
  const globalForBull = globalThis as unknown as { bullRedis: Redis | undefined };
  bullRedis =
    globalForBull.bullRedis ??
    new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      enableOfflineQueue: true,
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || "0"),
      keepAlive: 30,
      connectTimeout: 10000,
      lazyConnect: false,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForBull.bullRedis = bullRedis;
  }
}

export { redis, bullRedis, memoryStore, CACHE_PREFIX };
