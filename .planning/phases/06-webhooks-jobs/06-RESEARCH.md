# Phase 6: Webhooks, Background Jobs, and License Intelligence - Research

**Researched:** 2026-05-18
**Domain:** Webhook processing, BullMQ background jobs, license intelligence dashboard, piracy detection
**Confidence:** HIGH

## Summary

Phase 6 builds the critical sync layer between this platform and the central licensing API at license.devsroom.com. The architecture has three pillars: (1) an inbound webhook handler at `/api/webhooks/license` that receives HMAC-signed events from the central API, (2) a BullMQ-based background job system with a 15-minute repeatable sync job as a fallback, and (3) an admin license intelligence dashboard with KPI cards, plan distribution charts, domain tracking detail pages, and piracy detection flagging.

The codebase already has substantial infrastructure in place. BullMQ 5.76.8 is installed with three queues defined in `src/jobs/queues.ts` including a `licenseSyncQueue`. ApexCharts 5.12.0 is installed. The admin dashboard already has KPI card components (`DashboardKPIs.tsx`), chart components (`RevenueChart.tsx`), and query patterns (`admin-dashboard.ts`) with `calcTrend()` and `sql<number>` aggregations. The central API client (`src/lib/central-api.ts`) handles Bearer token auth. The existing admin licenses page (`src/app/(admin)/admin/licenses/page.tsx`) can be extended. The `fraud_alert` notification type already exists in `ADMIN_NOTIFICATION_TYPES`.

**Primary recommendation:** Build on existing infrastructure. Create workers in `src/jobs/workers/`, add the webhook route at `src/app/api/webhooks/license/route.ts`, extend the admin licenses page with an intelligence view, add a `[id]` detail page for domain tracking, and create server actions for piracy review and sync retry.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** KPI cards + chart + table layout -- follows Phase 5 admin dashboard pattern
- **D-02:** Dashboard highlights: status counts, renewal rate by plan, expiring soon (7/30 day), activation rate
- **D-03:** Dedicated admin page at `/admin/licenses/intelligence` or enhancement of existing `/admin/licenses`
- **D-04:** Four piracy triggers: activation count exceeds plan limit, rapid domain burst, geographic anomaly, cross-site match
- **D-05:** Review queue + manual action approach (no auto-action)
- **D-06:** Drill-down detail page for domain tracking
- **D-07:** Track: domain URL, activation timestamps, multisite flag, geo/IP, last verification
- **D-08:** License detail page is license-only (no customer context)
- **D-09:** Sync failures as filter/tab on existing licenses page
- **D-10:** All four webhook events handled: license.created, license.updated, license.expired, license.payment_refunded
- **D-11:** 15-minute sync via BullMQ repeatable job with Redis connection
- **D-12:** Single POST route at `/api/webhooks/license` with HMAC validation, event-specific handlers
- **D-13:** Define webhook payload as TypeScript interfaces, adjust when central API docs available

### Claude's Discretion
- Exact KPI card styling and chart library choice
- Piracy flag severity levels and badge colors
- Domain tracking table column layout
- Webhook HMAC implementation details (timing-safe comparison, secret rotation)
- BullMQ repeatable job configuration (retry attempts, backoff)
- Sync retry logic and error detail formatting
- License detail page component structure
- Plan distribution chart type (bar, pie, donut)

### Deferred Ideas (OUT OF SCOPE)
- Automated piracy enforcement (auto-suspend on detection)
- Real-time webhook monitoring dashboard
- License renewal flow through the platform
- Customer-facing domain management
- Webhook delivery retry from central API side
- Historical piracy trend charts
- Email notifications to customers about license expiry
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LIC-03 | Webhook handlers for license-created/updated/expired/payment-refunded events | Single webhook route at `/api/webhooks/license` with HMAC verification, event dispatch to handler functions. Pattern follows existing IPN handler at `src/app/api/ssl-commerz/ipn/route.ts`. |
| LIC-04 | Scheduled fallback sync (every 15 minutes) when webhooks fail | BullMQ 5.76.8 `upsertJobScheduler` API for cron-based repeatable job. `licenseSyncQueue` already exists in `src/jobs/queues.ts`. New worker at `src/jobs/workers/license-sync.ts`. |
| LIC-05 | HMAC signature verification on all incoming webhooks | Node.js `crypto.timingSafeEqual` for timing-attack-safe comparison. Secret from `WEBHOOK_SECRET` env var. |
| LINT-01 | License status dashboard (total/active/expired/revoked, renewal rate by product/plan) | Follow `DashboardKPIs.tsx` + `admin-dashboard.ts` patterns. Use `sql<number>` aggregations with `COALESCE`, `COUNT` against `licenses` table. ApexCharts for plan distribution. |
| LINT-02 | Domain tracking (activation domains per license, timestamps, multisite usage) | New `[id]/page.tsx` under `admin/licenses/`. Read `activationDomains` jsonb field from licenses table. Server component with detail layout. |
| LINT-03 | Piracy detection flagging (suspicious activation patterns) | Four trigger patterns per D-04. Query `activationDomains` jsonb + `currentActivations`/`maxActivations` fields. Use `fraud_alert` notification type (already exists). Manual review queue. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| bullmq | 5.76.8 | Background job processing, repeatable jobs | Already installed, queue infrastructure exists at `src/jobs/queues.ts` [VERIFIED: pnpm list] |
| apexcharts | 5.12.0 | Plan distribution chart for license intelligence | Already installed, used in `RevenueChart.tsx` [VERIFIED: pnpm list] |
| react-apexcharts | 2.1.0 | React wrapper for ApexCharts | Already installed, `dynamic()` import pattern established [VERIFIED: pnpm list] |
| crypto (Node.js built-in) | - | HMAC webhook verification with `timingSafeEqual` | No install needed, built-in Node.js module [ASSUMED] |
| drizzle-orm | installed | DB queries for license data, aggregations | Already in use across all admin actions [VERIFIED: codebase grep] |
| ioredis | installed | Redis connection for BullMQ workers | Already in use at `src/lib/redis.ts` [VERIFIED: codebase] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | installed | Icons for KPI cards, piracy flags | All admin dashboard icon needs |
| date-fns | installed | Date range calculations, formatting | KPI trend calculations, expiry windows |
| nanoid | installed | Unique IDs for mock data | Dev/test mock data generation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| BullMQ upsertJobScheduler | node-cron + in-process timer | BullMQ provides persistence, retries, dashboards. Already installed. |
| ApexCharts donut chart | Recharts pie | ApexCharts already installed and integrated. Consistent with Phase 5. |
| JSONB piracy flags column | Separate piracy_flags table | JSONB is simpler, fewer joins. Sufficient for manual review queue. |

**Installation:**
No new packages needed. All required libraries are already installed.

**Version verification:**
```
bullmq@5.76.8     [VERIFIED: pnpm list bullmq]
apexcharts@5.12.0 [VERIFIED: pnpm list apexcharts]
react-apexcharts@2.1.0 [VERIFIED: pnpm list react-apexcharts]
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   └── webhooks/
│   │       └── license/
│   │           └── route.ts          # Webhook handler (LIC-03, LIC-05)
│   └── (admin)/
│       ├── admin/
│       │   └── licenses/
│       │       ├── page.tsx           # Enhanced with intelligence view + filters
│       │       └── [id]/
│       │           └── page.tsx       # License detail with domain tracking (LINT-02)
│       └── actions/
│           └── admin-licenses.ts      # New: piracy review, sync retry, detail queries
├── jobs/
│   ├── queues.ts                      # EXISTING: licenseSyncQueue
│   └── workers/
│       ├── license-sync.ts            # New: 15-min sync worker (LIC-04)
│       └── webhook-retry.ts           # New: webhook event retry on failure
├── lib/
│   ├── central-api.ts                 # EXISTING: extend with webhook payload types
│   ├── webhook.ts                     # New: HMAC verification utility
│   └── piracy-detection.ts            # New: piracy trigger evaluation functions
├── components/
│   └── admin/
│       ├── LicenseIntelligenceKPIs.tsx # New: license status KPI cards
│       ├── LicensePlanChart.tsx        # New: plan distribution chart
│       ├── LicenseDomainTable.tsx      # New: domain tracking table component
│       └── PiracyFlagBadge.tsx         # New: piracy severity badge
└── data/
    └── dashboard-nav.ts               # MODIFY: add Intelligence sub-item to admin nav
```

### Pattern 1: Webhook Route Handler
**What:** Single POST endpoint receiving HMAC-signed events from central API
**When to use:** All inbound webhook events from license.devsroom.com
**Example:**
```typescript
// src/app/api/webhooks/license/route.ts
// Pattern follows: src/app/api/ssl-commerz/ipn/route.ts

import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/webhook";
import { handleLicenseCreated, handleLicenseUpdated, handleLicenseExpired, handlePaymentRefunded } from "@/lib/webhook-handlers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text(); // Raw body for HMAC
    const signature = request.headers.get("x-webhook-signature");

    if (!signature || !verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body);
    const eventType = payload.event;

    switch (eventType) {
      case "license.created":
        await handleLicenseCreated(payload.data);
        break;
      case "license.updated":
        await handleLicenseUpdated(payload.data);
        break;
      case "license.expired":
        await handleLicenseExpired(payload.data);
        break;
      case "license.payment_refunded":
        await handlePaymentRefunded(payload.data);
        break;
      default:
        console.warn(`[Webhook] Unknown event type: ${eventType}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Webhook] Unhandled error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Pattern 2: BullMQ Worker for License Sync
**What:** Background worker processing jobs from the licenseSyncQueue
**When to use:** 15-minute scheduled sync, retry of failed syncs
**Example:**
```typescript
// src/jobs/workers/license-sync.ts
// BullMQ 5.76.8 Worker API [VERIFIED: pnpm list]

import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { licenses, orders } from "@/lib/db/schema";
import { eq, isNull, and } from "drizzle-orm";

// Worker connection matches queue config in src/jobs/queues.ts
const connection = { host: "localhost", port: 6381 };

export function startLicenseSyncWorker() {
  const worker = new Worker(
    "license-sync",
    async (job: Job) => {
      const { type } = job.data;

      if (type === "full_sync") {
        // Find orders completed but with no central mapping (pending_sync state)
        const pendingOrders = await db
          .select()
          .from(orders)
          .where(and(eq(orders.status, "completed"), isNull(orders.centralOrderId)));

        for (const order of pendingOrders) {
          // Retry central API sync...
        }
      }

      if (type === "single_retry") {
        // Retry a single failed sync
        const { orderId } = job.data;
        // ...
      }
    },
    {
      connection,
      concurrency: 5,
      limiter: { max: 10, duration: 1000 },
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`[LicenseSync] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
```

### Pattern 3: BullMQ Job Scheduler (Cron-based Repeatable)
**What:** Register a 15-minute repeatable sync job using the new Job Schedulers API
**When to use:** Application startup or dedicated initialization
**Example:**
```typescript
// BullMQ 5.76.8 supports upsertJobScheduler since v5.16.0 [VERIFIED: installed version]
// This replaces the deprecated Queue.add with repeat option

import { licenseSyncQueue } from "@/jobs/queues";

export async function registerScheduledJobs() {
  if (!licenseSyncQueue) {
    console.warn("[Jobs] No Redis, skipping job scheduler registration");
    return;
  }

  await licenseSyncQueue.upsertJobScheduler(
    "license-sync-cron",
    {
      every: 900000, // 15 minutes in ms
      // Alternative: pattern: "*/15 * * * *" for cron
    },
    {
      name: "license-sync",
      data: { type: "full_sync" },
      opts: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      },
    }
  );
}
```

### Pattern 4: HMAC Webhook Verification
**What:** Timing-safe HMAC-SHA256 verification for webhook signatures
**When to use:** Every incoming webhook request
**Example:**
```typescript
// src/lib/webhook.ts

import crypto from "crypto";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!WEBHOOK_SECRET) {
    console.error("[Webhook] WEBHOOK_SECRET not configured");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  // timingSafeEqual prevents timing attacks [ASSUMED: Node.js crypto API]
  const expected = Buffer.from(expectedSignature, "utf8");
  const actual = Buffer.from(signature, "utf8");

  if (expected.length !== actual.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, actual);
}
```

### Pattern 5: License Intelligence KPI Queries
**What:** SQL aggregations for license dashboard metrics
**When to use:** Admin license intelligence page data loading
**Example:**
```typescript
// Pattern follows: src/app/(admin)/actions/admin-dashboard.ts
// Uses sql<number> template with COALESCE for safe aggregations

import { sql, eq, and, gte } from "drizzle-orm";
import { licenses } from "@/lib/db/schema";

// Total / Active / Expired / Revoked counts
const [statusCounts] = await db
  .select({
    total: sql<number>`COUNT(*)`,
    active: sql<number>`COUNT(*) FILTER (WHERE ${licenses.status} = 'active')`,
    expired: sql<number>`COUNT(*) FILTER (WHERE ${licenses.status} = 'expired')`,
    revoked: sql<number>`COUNT(*) FILTER (WHERE ${licenses.status} = 'revoked')`,
  })
  .from(licenses);

// Expiring soon (7-day and 30-day windows)
const now = new Date();
const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

const [expiring] = await db
  .select({
    within7Days: sql<number>`COUNT(*) FILTER (WHERE ${licenses.expiresAt} <= ${sevenDays} AND ${licenses.expiresAt} > ${now})`,
    within30Days: sql<number>`COUNT(*) FILTER (WHERE ${licenses.expiresAt} <= ${thirtyDays} AND ${licenses.expiresAt} > ${sevenDays})`,
  })
  .from(licenses);

// Plan distribution for chart
const planDistribution = await db
  .select({
    plan: licenses.plan,
    count: sql<number>`COUNT(*)`,
  })
  .from(licenses)
  .groupBy(licenses.plan);
```

### Anti-Patterns to Avoid
- **Parsing JSON before HMAC verification:** Always verify the raw body string first, then parse. Parsing before verification can introduce timing side-channels.
- **Auto-enforcing piracy actions:** D-05 explicitly requires manual review. Never auto-suspend or auto-revoke based on piracy flags.
- **Running BullMQ workers in Next.js request context:** Workers are long-running processes. They must be started in a separate entry point or custom server, not inside API routes or server actions.
- **Using `Queue.add()` with `repeat` option for 15-minute sync:** This is the deprecated BullMQ API. Use `upsertJobScheduler()` instead (available since v5.16.0, installed version is 5.76.8). [VERIFIED: BullMQ docs]
- **Forgetting BullMQ null check:** `licenseSyncQueue` can be `null` when `REDIS_URL` is not set. Always guard with `if (!licenseSyncQueue) return`.
- **Querying jsonb without type casting:** Drizzle's `jsonb()` column does not enforce inner types. Cast `activationDomains` via `as unknown as ActivationDomain[]` when reading.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HMAC signature comparison | Custom string comparison | `crypto.timingSafeEqual` | Prevents timing attacks that leak secret length |
| Job scheduling | `setInterval` / `setTimeout` loop | BullMQ `upsertJobScheduler` | Persistence across restarts, retry logic, monitoring |
| Job failure handling | Custom retry counter | BullMQ `attempts` + `backoff` config | Exponential backoff, dead-letter queue, dashboards |
| DB aggregations | JavaScript `.reduce()` over rows | PostgreSQL `COUNT FILTER` + `sql<number>` | Database does the math, orders of magnitude faster |
| Chart rendering | Custom SVG/canvas chart | ApexCharts (already installed) | Handles responsiveness, tooltips, animations, dark mode |

**Key insight:** This project already has a rich infrastructure. The IPN handler, central API client, BullMQ queues, KPI components, chart components, and audit logging are all in place. Phase 6 is primarily about wiring these existing pieces together with new webhook handlers, workers, and UI pages.

## Runtime State Inventory

> Phase 6 is greenfield feature addition, not a rename/refactor/migration phase.
> Runtime State Inventory is not applicable.

## Common Pitfalls

### Pitfall 1: Webhook Idempotency
**What goes wrong:** Central API retries webhook delivery, causing duplicate license status updates or duplicate notifications.
**Why it happens:** HTTP 500 or timeout responses trigger retries from the central API.
**How to avoid:** Always check current state before mutating. If a license is already in the target state, return 200 without re-processing. Follow the idempotency pattern in `src/app/api/ssl-commerz/ipn/route.ts` lines 69-71.
**Warning signs:** Duplicate audit log entries, duplicate admin notifications for the same event.

### Pitfall 2: BullMQ Worker Not Starting
**What goes wrong:** Worker code is written but never instantiated. Jobs pile up in the queue with no processor.
**Why it happens:** BullMQ Workers must be explicitly created and kept alive. They are not auto-started by the Queue.
**How to avoid:** Create a worker initialization module that's called from a custom server entry point or a dedicated worker script. Consider a `src/jobs/start.ts` that imports and starts all workers.
**Warning signs:** Queue grows but jobs never complete. `Queue.getWaiting()` returns increasing counts.

### Pitfall 3: HMAC Verification on Transformed Body
**What goes wrong:** Webhook signature fails verification even though the secret is correct.
**Why it happens:** `request.json()` or `request.text()` with encoding changes can subtly alter the body. If the central API signs the exact bytes it sent, any transformation breaks verification.
**How to avoid:** Call `request.text()` exactly once, store the result, verify against that raw string, then parse JSON from the same string.
**Warning signs:** All webhooks return 401. Signature verification always fails.

### Pitfall 4: Redis Not Available in Development
**What goes wrong:** Worker initialization crashes or job scheduler registration fails because Redis is not running.
**Why it happens:** The project uses `REDIS_URL` env var to conditionally create queues. In dev without Redis, `licenseSyncQueue` is `null`.
**How to avoid:** Guard all queue/worker/scheduler operations behind a null check. Provide a fallback path (log warning, skip scheduling). Pattern exists at `src/jobs/queues.ts` lines 15-25.
**Warning signs:** `Cannot read properties of null` errors when calling `.upsertJobScheduler()` on null queue.

### Pitfall 5: activationDomains Type Unsafety
**What goes wrong:** Runtime errors when accessing properties of activation domains.
**Why it happens:** Drizzle's `jsonb()` column type is `unknown` at the TypeScript level. The database stores whatever JSON is written. No runtime validation.
**How to avoid:** Always cast and validate: `(license.activationDomains as unknown as ActivationDomain[])`. Consider a runtime validation helper. Pattern documented in Phase 3 decisions (D-?).
**Warning signs:** TypeScript compiles but runtime throws "Cannot read property 'domain' of undefined".

### Pitfall 6: Webhook Route Not Matching Central API Contract
**What goes wrong:** Central API sends webhook payloads in a format that doesn't match our TypeScript interfaces.
**Why it happens:** Central API documentation may not be finalized. D-13 explicitly states "adjust when central API documentation is available."
**How to avoid:** Define interfaces as a starting point. Add runtime validation (check for required fields). Log the full payload on validation failure for debugging. Make the handler resilient to unknown fields.
**Warning signs:** Webhook handler silently fails or throws on fields that don't exist.

## Code Examples

### Webhook Payload TypeScript Interfaces
```typescript
// src/lib/webhook-types.ts
// Per D-13: define expected contract, adjust when central API docs available

export interface WebhookPayload {
  event: "license.created" | "license.updated" | "license.expired" | "license.payment_refunded";
  timestamp: string;
  data: WebhookEventData;
}

export interface WebhookEventData {
  centralLicenseId: string;
  licenseKey: string;
  userId: string;
  plan: string;
  status: string;
  activationDomains: ActivationDomain[];
  currentActivations: number;
  maxActivations: number;
  expiresAt: string | null;
  orderId?: string;
  refundReason?: string;
}

export interface ActivationDomain {
  domain: string;
  activatedAt: string;
  lastVerifiedAt: string;
  ipAddress: string;
  country: string;
  isMultisite: boolean;
  isActive: boolean;
}
```

### Piracy Detection Functions
```typescript
// src/lib/piracy-detection.ts
// Four trigger patterns per D-04

import type { ActivationDomain } from "./webhook-types";

export interface PiracyFlag {
  type: "activation_limit_exceeded" | "rapid_domain_burst" | "geo_anomaly" | "cross_site_match";
  severity: "low" | "medium" | "high";
  description: string;
  detectedAt: Date;
}

export function evaluatePiracyTriggers(params: {
  currentActivations: number;
  maxActivations: number;
  domains: ActivationDomain[];
  licenseKey: string;
}): PiracyFlag[] {
  const flags: PiracyFlag[] = [];

  // Trigger 1: Activation count exceeds plan limit
  if (params.currentActivations > params.maxActivations) {
    flags.push({
      type: "activation_limit_exceeded",
      severity: "high",
      description: `${params.currentActivations} activations exceed plan limit of ${params.maxActivations}`,
      detectedAt: new Date(),
    });
  }

  // Trigger 2: Rapid domain activation burst (5+ domains in 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentDomains = params.domains.filter(
    (d) => new Date(d.activatedAt) > oneDayAgo
  );
  if (recentDomains.length >= 5) {
    flags.push({
      type: "rapid_domain_burst",
      severity: "medium",
      description: `${recentDomains.length} domains activated in 24 hours`,
      detectedAt: new Date(),
    });
  }

  // Trigger 3: Geographic anomaly (3+ different countries)
  const uniqueCountries = new Set(params.domains.map((d) => d.country));
  if (uniqueCountries.size >= 3) {
    flags.push({
      type: "geo_anomaly",
      severity: "low",
      description: `Activations from ${uniqueCountries.size} different countries`,
      detectedAt: new Date(),
    });
  }

  // Trigger 4: Cross-site match detection requires querying other licenses
  // This is done at the server action level, not in this pure function

  return flags;
}
```

### Admin Licenses Page Enhancement (Sync Failures Filter)
```typescript
// Extend existing src/app/(admin)/admin/licenses/page.tsx
// Add a searchParams-based filter for sync failures

// Query pattern for finding pending_sync licenses (orders completed, no central mapping):
const syncFailedLicenses = await db
  .select({
    id: licenses.id,
    licenseKey: licenses.licenseKey,
    plan: licenses.plan,
    status: licenses.status,
    createdAt: licenses.createdAt,
    orderCentralId: orders.centralOrderId,
  })
  .from(licenses)
  .leftJoin(orders, eq(licenses.orderId, orders.id))
  .where(isNull(orders.centralOrderId));
```

### License Detail Page Route
```typescript
// src/app/(admin)/admin/licenses/[id]/page.tsx
// Follows pattern from: src/app/(admin)/admin/users/[id]/page.tsx

export const dynamic = "force-dynamic";

export default async function LicenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Fetch license with domain tracking data
  // Render ComponentCard with domain table, piracy flags, sync status
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| BullMQ `queue.add(name, data, { repeat })` | `queue.upsertJobScheduler(id, opts, jobTemplate)` | BullMQ v5.16.0 | New API is more reliable, supports cron patterns, easier to update/remove |
| String equality for HMAC | `crypto.timingSafeEqual` | Node.js 6+ | Prevents timing side-channel attacks on signature verification |
| JavaScript aggregation over rows | PostgreSQL `COUNT(*) FILTER (WHERE ...)` | PostgreSQL 9.4+ | Single query returns all status counts, no N+1 queries |

**Deprecated/outdated:**
- BullMQ `repeatable jobs` via `queue.add()` with `repeat` option: Use `upsertJobScheduler()` instead [VERIFIED: BullMQ 5.76.8 installed]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `crypto.timingSafeEqual` is the correct API for timing-safe comparison in Node.js | Architecture Patterns | Low -- this is a stable Node.js API |
| A2 | Central API sends webhook signature in `x-webhook-signature` header | Architecture Patterns | Medium -- header name may differ, but easily configurable |
| A3 | Central API webhook payload structure matches defined interfaces | Code Examples | Medium -- D-13 explicitly says adjust when docs available |
| A4 | `upsertJobScheduler` with `every: 900000` creates a stable 15-minute repeatable job | Architecture Patterns | Low -- documented BullMQ API, but cron pattern `*/15 * * * *` is an alternative |
| A5 | PostgreSQL `COUNT(*) FILTER (WHERE ...)` syntax works with Drizzle's `sql` template | Architecture Patterns | Low -- this is standard PostgreSQL 9.4+ syntax |

## Open Questions

1. **Worker Lifecycle Management**
   - What we know: BullMQ workers are long-running processes. They must be started outside the Next.js request lifecycle.
   - What's unclear: The exact mechanism for starting workers in a Next.js App Router application deployed standalone (`output: 'standalone'`). Options include: custom server entry point, `instrumentation.ts` (Next.js 14+), or a separate process.
   - Recommendation: Use Next.js `instrumentation.ts` file to register job schedulers on startup. Workers may need a separate process if using `output: 'standalone'`. Planner should design for both and flag this for implementer.

2. **Central API Webhook Documentation**
   - What we know: D-13 says "define expected contract, adjust when available." The central API is at license.devsroom.com.
   - What's unclear: The exact webhook payload format, header names, retry policy, and available events.
   - Recommendation: Define interfaces as a reasonable starting point based on the existing `ImportOrderResponse` type. Add a runtime validation layer that logs unexpected fields. The webhook handler should be resilient to extra fields.

3. **Piracy Flags Storage Strategy**
   - What we know: Need to flag licenses for admin review. Manual action only.
   - What's unclear: Whether to store flags in a dedicated `license_flags` table, as a jsonb field on the `licenses` table, or compute on-the-fly from activation data.
   - Recommendation: Store as a jsonb `piracyFlags` field on the licenses table. This is simple, avoids a new table, and can be queried with PostgreSQL jsonb operators. Add via a Drizzle migration.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL | DB queries | Assumed running | - | - |
| Redis (port 6381) | BullMQ queues/workers/schedulers | Requires REDIS_URL env var | ioredis installed | In-memory Map (no jobs, no scheduling) |
| Node.js crypto | HMAC verification | Built-in | - | - |
| Central API (license.devsroom.com) | Webhook source, sync target | External service | - | Mock fallback exists in central-api.ts |
| WEBHOOK_SECRET env var | HMAC verification | Not configured yet | - | Verification fails, webhooks rejected |

**Missing dependencies with no fallback:**
- `WEBHOOK_SECRET` env var must be configured before webhook processing works. This is a configuration step, not an install.
- Redis must be running for job scheduling. Without it, the 15-minute sync and retry jobs won't execute. The system should gracefully degrade (log warning, skip scheduling).

**Missing dependencies with fallback:**
- Central API availability: mock fallback exists for development (same pattern as `mockImportOrderToCentral`).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LIC-03 | Webhook processes four event types | manual-only | N/A | N/A |
| LIC-04 | 15-minute sync job runs via BullMQ | manual-only | N/A | N/A |
| LIC-05 | HMAC verification rejects invalid signatures | manual-only | N/A | N/A |
| LINT-01 | License KPI dashboard displays correct counts | manual-only | N/A | N/A |
| LINT-02 | Domain tracking detail page shows activation data | manual-only | N/A | N/A |
| LINT-03 | Piracy flags appear for suspicious patterns | manual-only | N/A | N/A |

**Justification for manual-only:** This project has no test framework installed (no jest, vitest, or pytest). All prior phases validated through manual UAT. Phase 6 follows the same pattern. The existing verification is through human UAT and code review.

### Sampling Rate
- **Per task commit:** Build check (`pnpm build`)
- **Per wave merge:** Build check + lint (`pnpm build && pnpm lint`)
- **Phase gate:** Human UAT per ROADMAP success criteria

### Wave 0 Gaps
- No test framework to install -- project follows manual UAT verification
- All validation via human UAT at phase gate, consistent with prior phases 1-5

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Better Auth session check via `requireAdmin()` for admin pages |
| V3 Session Management | yes | Better Auth + Redis sessions (existing) |
| V4 Access Control | yes | `requireAdmin()` guard on all admin server actions |
| V5 Input Validation | yes | TypeScript interfaces for webhook payloads, runtime field checks |
| V6 Cryptography | yes | HMAC-SHA256 with `crypto.timingSafeEqual` for webhook verification |

### Known Threat Patterns for Webhook + Background Job Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Webhook replay attack | Tampering | Idempotency checks, timestamp validation |
| Webhook signature forgery | Spoofing | HMAC-SHA256 with timing-safe comparison |
| Webhook payload injection | Tampering | Validate all fields, never trust client data |
| Job queue poisoning | Elevation | Redis access restricted to localhost, no external access |
| Admin action forgery | Elevation | `requireAdmin()` on all server actions, CSRF protection via SameSite cookies |
| Sensitive data in logs | Information Disclosure | Never log license keys in full, webhook secrets, or HMAC values |

### Webhook Security Checklist
1. Verify HMAC signature before any processing
2. Use raw body for signature verification (not parsed JSON)
3. Return 200 quickly to avoid central API timeout retries
4. Process events idempotently (check current state before mutating)
5. Log events for audit trail (use existing `createAuditLog`)
6. Never expose internal errors to webhook caller (return generic 500)

## Sources

### Primary (HIGH confidence)
- `src/jobs/queues.ts` -- BullMQ queue setup, connection config, null-safe pattern
- `src/lib/central-api.ts` -- Central API client, types, mock fallback
- `src/lib/db/schema.ts` -- Full schema: licenses table fields, status enum, activationDomains jsonb
- `src/app/api/ssl-commerz/ipn/route.ts` -- Existing webhook-like pattern with idempotency, central API sync
- `src/app/(admin)/actions/admin-dashboard.ts` -- KPI query patterns, calcTrend(), date ranges, sql aggregations
- `src/components/admin/DashboardKPIs.tsx` -- KPI card component structure
- `src/components/admin/RevenueChart.tsx` -- ApexCharts integration pattern
- `src/app/(admin)/actions/admin-notifications.ts` -- Admin notification system with fraud_alert type
- `src/app/(admin)/admin/licenses/page.tsx` -- Existing licenses page to extend
- `src/lib/audit.ts` -- Audit logging with AuditAction type union
- `src/lib/redis.ts` -- Redis connection with in-memory fallback

### Secondary (MEDIUM confidence)
- `06-CONTEXT.md` -- User decisions D-01 through D-13 constraining all implementation
- `04-CONTEXT.md` -- Phase 4 decisions establishing pending_sync state and webhook route stub
- `.planning/REQUIREMENTS.md` -- LIC-03 through LIC-05, LINT-01 through LINT-03 acceptance criteria
- `.planning/ROADMAP.md` -- Phase 6 goal, requirements, success criteria
- `src/data/dashboard-nav.ts` -- Admin navigation structure for adding new pages

### Tertiary (LOW confidence)
- BullMQ `upsertJobScheduler` API behavior -- based on BullMQ documentation, not tested against this specific codebase [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and verified
- Architecture: HIGH - follows established patterns from prior phases
- Pitfalls: HIGH - based on direct codebase analysis of existing patterns and known BullMQ/crypto patterns

**Research date:** 2026-05-18
**Valid until:** 2026-06-17 (stable stack, no fast-moving dependencies)
