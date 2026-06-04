import { Queue } from "bullmq";

// Queue names as constants for reference
export const QUEUE_NAMES = {
  EMAIL: "email",
  LICENSE_SYNC: "license-sync",
  NOTIFICATION: "notification",
  SUBSCRIPTION_LIFECYCLE: "subscription-lifecycle",
  ANALYTICS_AGGREGATION: "analytics-aggregation",
  BACKUP: "backup",
} as const;

function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port, 10) || 6379,
    password: parsed.password || undefined,
  };
}

const connectionOptions = process.env.REDIS_URL
  ? { connection: parseRedisUrl(process.env.REDIS_URL) }
  : undefined;

// Only create queues if Redis is available
export const emailQueue = connectionOptions
  ? new Queue(QUEUE_NAMES.EMAIL, connectionOptions)
  : null;

export const licenseSyncQueue = connectionOptions
  ? new Queue(QUEUE_NAMES.LICENSE_SYNC, connectionOptions)
  : null;

export const notificationQueue = connectionOptions
  ? new Queue(QUEUE_NAMES.NOTIFICATION, connectionOptions)
  : null;

export const subscriptionQueue = connectionOptions
  ? new Queue(QUEUE_NAMES.SUBSCRIPTION_LIFECYCLE, connectionOptions)
  : null;

export const analyticsQueue = connectionOptions
  ? new Queue(QUEUE_NAMES.ANALYTICS_AGGREGATION, connectionOptions)
  : null;

export const backupQueue = connectionOptions
  ? new Queue(QUEUE_NAMES.BACKUP, connectionOptions)
  : null;
