import { Queue } from "bullmq";

// Queue names as constants for reference
export const QUEUE_NAMES = {
  EMAIL: "email",
  LICENSE_SYNC: "license-sync",
  NOTIFICATION: "notification",
} as const;

const connectionOptions = process.env.REDIS_URL
  ? { connection: { host: "localhost", port: 6381 } }
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
