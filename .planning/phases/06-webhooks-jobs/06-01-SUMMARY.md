---
phase: 06-webhooks-jobs
plan: 01
subsystem: webhook-handlers
tags: [webhook, hmac, license-events, api-route]
dependency_graph:
  requires: [db-schema, audit-logging]
  provides: [webhook-route, webhook-handlers, hmac-verification, webhook-types]
  affects: [licenses, orders, audit-logs]
tech_stack:
  added: []
  patterns: [HMAC-SHA256 verification, timing-safe comparison, idempotent event handlers, event-dispatch pattern]
key_files:
  created:
    - src/lib/webhook-types.ts
    - src/lib/webhook.ts
    - src/lib/webhook-handlers.ts
    - src/app/api/webhooks/license/route.ts
  modified: []
decisions:
  - Added productId to WebhookEventData interface since licenses table requires it as NOT NULL
metrics:
  duration: 6min
  tasks: 2
  files: 4
  completed: 2026-05-18
---

# Phase 06 Plan 01: Webhook Handler Summary

HMAC-verified webhook endpoint at `/api/webhooks/license` that dispatches four license event types to idempotent handler functions with audit logging and timing-safe signature comparison.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create webhook types and HMAC verification utility | c949ea1 | `src/lib/webhook-types.ts`, `src/lib/webhook.ts` |
| 2 | Create webhook handler functions and POST route | 4a1d411 | `src/lib/webhook-handlers.ts`, `src/app/api/webhooks/license/route.ts`, `src/lib/webhook-types.ts` |

## What Was Built

### Webhook Payload Types (`src/lib/webhook-types.ts`)
- `WebhookPayload` interface with typed event discriminator (`license.created`, `license.updated`, `license.expired`, `license.payment_refunded`)
- `WebhookEventData` interface with all fields needed for handler processing
- `ActivationDomain` interface exported for reuse by piracy-detection.ts (Plan 04) and domain tracking UI

### HMAC Verification Utility (`src/lib/webhook.ts`)
- `verifyWebhookSignature()` using `crypto.timingSafeEqual` to prevent timing attacks (T-06-01)
- Guards against missing `WEBHOOK_SECRET` env var with error logging
- Uses raw string payload for HMAC computation (before JSON.parse)
- Reads signature from `x-webhook-signature` header

### Webhook Event Handlers (`src/lib/webhook-handlers.ts`)
- `handleLicenseCreated`: Inserts new license row; idempotent by centralLicenseId lookup
- `handleLicenseUpdated`: Updates existing license fields; validates status against enum before update (T-06-03); skips if not found
- `handleLicenseExpired`: Sets status to "expired"; idempotent (skips if already expired)
- `handlePaymentRefunded`: Sets license to "revoked" and linked order to "refunded"; idempotent (skips if already revoked)
- All handlers: Drizzle parameterized queries, `createAuditLog` calls with actor "system/webhook", license keys truncated to first 8 chars in logs

### Webhook POST Route (`src/app/api/webhooks/license/route.ts`)
- POST endpoint at `/api/webhooks/license`
- Verifies HMAC signature from `x-webhook-signature` header before any processing
- Returns 401 for invalid/missing signatures (T-06-02)
- Returns generic "Internal server error" on exceptions (T-06-04)
- Unknown event types logged with warning, return 200 (no 500 errors)
- Pattern follows existing IPN handler at `src/app/api/ssl-commerz/ipn/route.ts`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added productId to WebhookEventData**
- **Found during:** Task 2, build verification
- **Issue:** The `licenses` table schema requires `productId` as NOT NULL, but the plan's `WebhookEventData` interface did not include it, causing a TypeScript type error on insert
- **Fix:** Added `productId: string` to the `WebhookEventData` interface and included it in the `handleLicenseCreated` insert values
- **Files modified:** `src/lib/webhook-types.ts`, `src/lib/webhook-handlers.ts`

**2. [Rule 1 - Bug] Fixed TypeScript strict mode cast for unknown event type**
- **Found during:** Task 2, build verification
- **Issue:** `(payload as Record<string, unknown>)` fails strict TypeScript because `WebhookPayload` doesn't have an index signature
- **Fix:** Changed to `(payload as unknown as Record<string, unknown>)` double cast
- **Files modified:** `src/app/api/webhooks/license/route.ts`

## Verification

- `pnpm build` passes with no TypeScript errors
- New route `/api/webhooks/license` appears in build output as dynamic (f) route
- All four handler functions exported from `webhook-handlers.ts`
- `verifyWebhookSignature` uses `crypto.timingSafeEqual` (not string equality)
- No full license keys in any console.log/console.error output

## Self-Check: PASSED

All 4 created files exist on disk. Both commit hashes verified in git log.
