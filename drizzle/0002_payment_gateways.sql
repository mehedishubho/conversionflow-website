-- 0002_payment_gateways.sql
-- Phase 34 (Multi-Gateway Payment System) schema drift.
--
-- These objects exist in src/lib/db/schema.ts but were never created in the
-- database (the project manages the DB with `drizzle-kit push`, and this
-- phase's tables were never pushed). They are the cause of the checkout
-- "No payment methods available" bug: getActiveGateways() queries
-- payment_gateways, which did not exist, so the query threw at runtime.
--
-- Missing objects created here:
--   1. TYPE gateway_status  (enum: draft | test | live)
--   2. TABLE payment_gateways
--   3. TABLE payment_webhook_events (+ 3 indexes)
--
-- NOTE on apply strategy:
--   This database is push-managed (the live DB contains many tables that the
--   0000/0001 migration files do not create, e.g. products, product_plans,
--   license_activations, redirects). The migration snapshots in drizzle/meta/
--   are therefore stale, so `drizzle-kit generate` cannot be used reliably.
--
--   Apply this change with EITHER:
--     pnpm db:push                          # recommended — matches project practice
--     # or run this file directly:
--     psql "$DATABASE_URL" -f drizzle/0002_payment_gateways.sql
--
--   `db:push` is idempotent and will create only what is missing. This file
--   is provided for auditability and direct application. It is NOT wired into
--   drizzle/meta/_journal.json on purpose (see note above); use push or psql.

-- ──────────────────────────────────────────────
-- 1. gateway_status enum
-- ──────────────────────────────────────────────
CREATE TYPE "gateway_status" AS ENUM ('draft', 'test', 'live');

-- ──────────────────────────────────────────────
-- 2. payment_gateways
--    One row per configured payment gateway (ssl_commerz, paddle, bkash_api, …).
--    Mirrors src/lib/db/schema.ts `paymentGateways`.
-- ──────────────────────────────────────────────
CREATE TABLE "payment_gateways" (
  "id" uuid primary key default gen_random_uuid(),
  "gateway_id" text not null,
  "name" text not null,
  "config" jsonb not null,
  "active" boolean default false,
  "test_mode" boolean default true,
  "status" "gateway_status" default 'draft',
  "priority" integer default 0,
  "created_at" timestamp not null default now(),
  "updated_at" timestamp not null default now(),
  constraint "payment_gateways_gateway_id_unique" unique ("gateway_id")
);

-- ──────────────────────────────────────────────
-- 3. payment_webhook_events
--    Idempotency log for inbound payment webhooks (prevents duplicate
--    processing). Mirrors src/lib/db/schema.ts `paymentWebhookEvents`.
-- ──────────────────────────────────────────────
CREATE TABLE "payment_webhook_events" (
  "id" uuid primary key default gen_random_uuid(),
  "gateway_id" text not null,
  "event_type" text not null,
  "payload" jsonb not null,
  "processed" boolean default false,
  "processed_at" timestamp,
  "created_at" timestamp not null default now()
);

CREATE INDEX "payment_webhook_events_gateway_id_idx"
  ON "payment_webhook_events" USING btree ("gateway_id");
CREATE INDEX "payment_webhook_events_processed_idx"
  ON "payment_webhook_events" USING btree ("processed");
CREATE INDEX "payment_webhook_events_created_at_idx"
  ON "payment_webhook_events" USING btree ("created_at");
