/**
 * Shared Redis connection config for BullMQ queues and workers.
 * Single source of truth to prevent config drift between files.
 */
export const redisConnection = { host: "localhost", port: 6381 };
