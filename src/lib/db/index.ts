import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

// Database connection optimization with proper pooling
const client = globalForDb.client ?? postgres(connectionString, {
  max: 10, // Maximum connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout
  statement_timeout: 30, // Query timeout (30 seconds)
  // Enable prepared statements for better performance
  prepare: true,
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "development", // Enable query logging in dev
});
