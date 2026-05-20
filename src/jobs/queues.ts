import { Queue } from "bullmq";
import { redisConnection } from "@/jobs/redis";

export const QUEUE_NAMES = {
  LICENSE_SYNC: "license-sync",
  NOTIFICATION: "notification",
} as const;

const connectionOptions = process.env.REDIS_URL
  ? { connection: redisConnection }
  : undefined;

export const licenseSyncQueue = connectionOptions
  ? new Queue(QUEUE_NAMES.LICENSE_SYNC, connectionOptions)
  : null;

export const notificationQueue = connectionOptions
  ? new Queue(QUEUE_NAMES.NOTIFICATION, connectionOptions)
  : null;
