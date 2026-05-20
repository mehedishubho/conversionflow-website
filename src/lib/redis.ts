import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

let redis: Redis | null = null;
let memoryStore: Map<string, { value: string; expires: number }> | null = null;

if (process.env.REDIS_URL) {
  redis =
    globalForRedis.redis ??
    new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 10) return null;
        return Math.min(times * 200, 5000);
      },
    });

  if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = redis;
  }

  redis.on("error", (err) => {
    console.warn("[Redis] Connection error:", err.message);
  });

  console.warn("[Redis] Connected to Redis for session storage and caching.");
} else {
  memoryStore = new Map();
  console.warn(
    "[Redis] No REDIS_URL found. Using in-memory fallback. Sessions will not persist across restarts."
  );
}

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

export { redis, memoryStore };
