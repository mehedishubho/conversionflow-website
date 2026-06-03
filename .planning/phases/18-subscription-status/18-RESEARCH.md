# Phase 18: Subscription & Status Management - Research

**Researched:** 2026-06-03
**Domain:** License subscription lifecycle, BullMQ background workers, state machine, email notifications
**Confidence:** HIGH

## Summary

Phase 18 introduces the subscription lifecycle management layer on top of the existing licensing bounded context. The core work involves: (1) extending the `licenseStatusEnum` with `grace_period`, (2) building a strict state machine for license status transitions, (3) creating a daily BullMQ worker that processes expirations and sends reminder emails, (4) updating the validation API to handle grace period in real-time, (5) adding exact calendar date calculation for expiry, and (6) building admin settings UI for subscription configuration.

The existing codebase already has strong foundations: BullMQ v5.78.0 is installed with queue stubs in `src/jobs/queues.ts`, the event bus infrastructure supports both in-process and cross-process patterns, the license entity already tracks `expiresAt`, and the admin settings page uses a key-value pattern in the `settings` table. The primary integration points are well-defined: `OrderCompletedHandler.resolvePlanDetails()` needs exact calendar math, `ValidateLicenseHandler` needs grace period awareness, and `module-init.ts` needs worker registration.

**Primary recommendation:** Extend existing bounded contexts (licensing, billing) in-place rather than creating new modules. The subscription worker lives in `src/jobs/` and subscribes to domain events via `inProcessPublisher`. Follow the established DDD layering: domain logic in entities/services, application logic in command handlers, infrastructure in repositories/adapters.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Grace period length admin-configurable via settings table, default 7 days, range 7-30 days
- **D-02:** During grace period, validation API returns `valid: true` with `grace_period_expires_at`
- **D-03:** Validation API performs real-time expiry check on every request (safety net)
- **D-04:** Status transitions are worker-driven; validation API only reads
- **D-05:** Grace period starts from exact `expires_at` timestamp, fixed day count
- **D-06:** Grace period entry triggers notification email (separate from reminders)
- **D-07:** Admin revocation/suspension bypass grace period (immediate)
- **D-08:** Single combined daily worker for all subscription tasks
- **D-09:** Worker processes all licenses in one query + loop, no chunking
- **D-10:** BullMQ workers run in same Next.js process via module initialization
- **D-11:** BullMQ repeatable jobs with cron-style scheduling
- **D-12:** Auto-retry with exponential backoff (1 min, 5 min, 30 min), max 3 attempts
- **D-13:** Continue on partial failure (log errors, continue processing)
- **D-14:** Exact calendar dates for expiry (same day next month, last-day clamp)
- **D-15:** Renewal calculates from renewal date (fresh start)
- **D-16:** Lifetime licenses: `expiresAt = NULL`, worker skips them
- **D-17:** `expiresAt` set at license creation by OrderCompletedHandler using exact calendar math
- **D-18:** Email-only reminders (no in-app notifications)
- **D-19:** Single email template for countdown reminders (variable urgency)
- **D-20:** Grace period entry and final expiration get separate templates
- **D-21:** Reminder dedup via `license_reminders` table
- **D-22:** One combined daily worker for all tasks
- **D-23:** Strict state machine with only valid transitions allowed
- **D-24:** Domain activations preserved on expiry
- **D-25:** Config changes apply immediately to all licenses
- **D-26:** Admin UI for grace period days and reminder milestones
- **D-27:** Settings stored in existing `settings` table (key-value pattern)
- **D-28:** Worker publishes LICENSE_GRACE_PERIOD_STARTED and LICENSE_EXPIRED events
- **D-29:** Events use inProcessPublisher, handler failures log but don't block

### Claude's Discretion
- Exact `license_reminders` table schema vs JSONB column choice
- Worker registration pattern (new `initializeSubscriptionModule()` vs inline in existing)
- Reminder email template design, content, and subject lines
- Grace period notification email subject and body
- Expiration notification email subject and body
- How to surface failed jobs to admin
- Exact exponential backoff intervals
- State machine implementation pattern (enum map, transition validation function, etc.)
- Admin settings UI layout (form fields, validation, save pattern)

### Deferred Ideas (OUT OF SCOPE)
- Renewal checkout flow (future phase)
- Customer self-renewal (Phase 19)
- In-app notifications in customer portal (Phase 19)
- Auto-renewal (far future)
- Subscription analytics (Phase 19)
- Admin dashboard for subscriptions (Phase 19)
- Failed job admin UI (future)
- Worker batch/chunk processing (if scale grows)
- Renewal from old expiry date (stacking)
- Cross-process event publishing (in-process sufficient)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LSTAT-01 | License status supports: active, expired, revoked, suspended, grace_period | Schema: add `grace_period` to `licenseStatusEnum` in schema.ts. State machine: define valid transitions in licensing domain. |
| LSTAT-02 | Subscription licenses have `expires_at` timestamp in UTC | Already exists in schema (`licenses.expiresAt`). Update `OrderCompletedHandler` to set exact calendar date. |
| LSTAT-03 | Grace period of 7-30 days after expiration (license remains valid) | Worker transitions `active -> grace_period`. Validation API returns `valid: true` during grace period. Settings table stores config. |
| LSTAT-04 | Lifetime licenses have null or far-future `expires_at` (never expire) | Already handled: `expiresAt = NULL` for lifetime. Worker skips NULL entries. |
| LSTAT-07 | Background job checks for expiring licenses daily, sends reminder emails (30, 14, 7, 3, 1 days) | BullMQ repeatable job with cron pattern. `license_reminders` table for dedup. 3 email templates. |
| JOB-01 | BullMQ worker processes license expiration checks daily | Daily worker at 2 AM UTC. Queries licenses near expiry, processes transitions. |
| JOB-02 | BullMQ worker sends renewal reminder emails based on expiration date | Same daily worker. Checks milestones, sends emails with dedup tracking. |
| JOB-04 | Jobs use Redis for queue management and retry logic with exponential backoff | BullMQ repeatable jobs with `attempts: 3`, `backoff: { type: 'exponential' }`. Redis already configured. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| bullmq | 5.78.0 (installed) | Background job processing, repeatable jobs | Already installed, queue stubs exist in `src/jobs/queues.ts` [VERIFIED: pnpm view] |
| ioredis | installed | Redis client for BullMQ | Already configured in `src/lib/redis.ts` with connection pooling [VERIFIED: codebase] |
| drizzle-orm | 0.45.2 (installed) | Database ORM for schema changes | Existing ORM for all DB operations [VERIFIED: pnpm view] |
| resend | installed (6.x) | Email delivery for reminder templates | Existing email pattern in `src/lib/emails/order-confirmation.ts` [VERIFIED: codebase] |
| next | 16.2.6 (installed) | Framework (module-init runs in same process) | Workers registered via `module-init.ts` in Next.js process [VERIFIED: codebase] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nanoid | installed | Event ID generation | Event creation (already used in `LicenseEvents.ts`) |
| lucide-react | installed | Icons for admin settings UI | Admin subscription settings page |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| BullMQ repeatable | node-cron + manual scheduling | BullMQ provides persistence, retries, and monitoring out of the box. Manual cron would require rebuilding all of these. [VERIFIED: CONTEXT.md D-11] |
| Separate workers per task | Single combined worker | CONTEXT.md D-08 locks single worker. Simpler at current scale. |

**Installation:**
```bash
# No new packages needed — all dependencies already installed
# bullmq: 5.78.0, ioredis: installed, resend: installed, drizzle-orm: 0.45.2
```

**Version verification:**
```bash
pnpm view bullmq version   # 5.78.0 (installed matches registry)
pnpm view resend version    # 6.12.4
pnpm view drizzle-orm version # 0.45.2
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── modules/licensing/
│   ├── domain/
│   │   ├── entities/License.ts          # ADD: isInGracePeriod, daysUntilExpiry getters
│   │   ├── events/LicenseEvents.ts      # ADD: LICENSE_GRACE_PERIOD_STARTED, LICENSE_EXPIRED
│   │   └── services/
│   │       └── LicenseStateMachine.ts   # NEW: state transition validation
│   ├── application/
│   │   ├── commands/
│   │   │   └── ValidateLicenseHandler.ts  # UPDATE: grace period real-time check
│   │   └── services/
│   │       └── ExpiryCalculator.ts        # NEW: exact calendar date math
│   └── infrastructure/
│       └── repositories/
│           └── LicenseRepository.ts      # UPDATE: findExpiringLicenses, updateStatus queries
├── modules/billing/
│   └── application/handlers/
│       └── OrderCompletedHandler.ts      # UPDATE: exact calendar math in resolvePlanDetails
├── jobs/
│   ├── queues.ts                          # UPDATE: add subscription queue
│   └── workers/
│       └── subscription-lifecycle.ts      # NEW: daily worker (expirations, reminders, grace)
├── lib/
│   ├── emails/
│   │   ├── order-confirmation.ts          # EXISTING: pattern to follow
│   │   ├── license-expiry-reminder.ts     # NEW: countdown reminder template
│   │   ├── license-grace-period.ts        # NEW: grace period entry template
│   │   └── license-expired.ts             # NEW: final expiration template
│   ├── db/
│   │   └── schema.ts                      # UPDATE: add grace_period to enum, add license_reminders table
│   └── module-init.ts                     # UPDATE: register subscription worker
├── app/
│   ├── api/v1/license/validate/route.ts   # UPDATE: grace period response handling
│   └── (admin)/
│       ├── actions/admin-settings.ts      # UPDATE: subscription settings CRUD
│       └── admin/settings/
│           └── subscription/page.tsx      # NEW: subscription settings page
└── components/admin/
    └── SettingsOverviewCards.tsx           # UPDATE: add Subscription card
```

### Pattern 1: BullMQ Repeatable Worker Registration
**What:** Register a daily cron job using BullMQ's repeatable job API, processed by a Worker in the same Next.js process.
**When to use:** All scheduled background tasks (expiration checks, reminder emails).
**Example:**
```typescript
// src/jobs/workers/subscription-lifecycle.ts
import { Worker, Queue } from "bullmq";
import { redis } from "@/lib/redis";

const QUEUE_NAME = "subscription-lifecycle";

// Create queue (for scheduling)
const subscriptionQueue = redis
  ? new Queue(QUEUE_NAME, { connection: redis })
  : null;

// Schedule the daily repeatable job
export async function scheduleSubscriptionJob(): Promise<void> {
  if (!subscriptionQueue) {
    console.warn("[Subscription] Redis not available, skipping job scheduling");
    return;
  }

  await subscriptionQueue.add(
    "daily-subscription-check",
    { runAt: new Date().toISOString() },
    {
      repeat: { pattern: "0 2 * * *" }, // 2:00 AM UTC daily
      jobId: "subscription-daily",
      attempts: 3,
      backoff: { type: "exponential", delay: 60000 }, // 1min, 5min, 30min
    }
  );

  console.log("[Subscription] Daily job scheduled (cron: 0 2 * * *)");
}

// Worker processes the job
export function startSubscriptionWorker(): void {
  if (!redis) {
    console.warn("[Subscription] Redis not available, worker not started");
    return;
  }

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      // Process all subscription lifecycle tasks
      await processDailySubscriptionCheck();
    },
    {
      connection: redis,
      concurrency: 1, // One at a time for data consistency
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`[Subscription] Job ${job?.id} failed:`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`[Subscription] Job ${job.id} completed`);
  });
}
```
[VERIFIED: BullMQ v5.78.0 exports — Queue, Worker, Job confirmed via `require('bullmq')` inspection]

### Pattern 2: State Machine as Transition Map
**What:** Define valid license status transitions as a static map. Any transition not in the map is rejected.
**When to use:** All license status changes (worker-driven, admin-driven).
**Example:**
```typescript
// src/modules/licensing/domain/services/LicenseStateMachine.ts
type LicenseStatus = "active" | "grace_period" | "expired" | "revoked" | "suspended";

const VALID_TRANSITIONS: Record<LicenseStatus, LicenseStatus[]> = {
  active: ["grace_period", "revoked", "suspended"],
  grace_period: ["expired"],
  revoked: ["active"],
  suspended: ["active"],
  expired: ["active"],
};

export class LicenseStateMachine {
  static canTransition(from: LicenseStatus, to: LicenseStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static transition(from: LicenseStatus, to: LicenseStatus): LicenseStatus {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid license status transition: ${from} -> ${to}`);
    }
    return to;
  }

  static getValidTransitions(from: LicenseStatus): LicenseStatus[] {
    return VALID_TRANSITIONS[from] ?? [];
  }
}
```
[VERIFIED: CONTEXT.md D-23 defines exact transition map]

### Pattern 3: Exact Calendar Date Calculation
**What:** Calculate expiry dates using exact calendar math, not approximate day counts.
**When to use:** Setting `expiresAt` in `OrderCompletedHandler`, renewal date calculation.
**Example:**
```typescript
// src/modules/licensing/application/services/ExpiryCalculator.ts
export class ExpiryCalculator {
  /**
   * Calculate exact expiry date from a start date.
   * Monthly: same day next month with last-day-of-month clamping.
   * Yearly: same date next year.
   * Custom: use billingDurationMonths.
   */
  static calculateExpiry(
    startDate: Date,
    billingCycle: "monthly" | "yearly" | "custom",
    billingDurationMonths: number | null
  ): Date {
    const months = billingCycle === "monthly"
      ? 1
      : billingCycle === "yearly"
        ? 12
        : (billingDurationMonths ?? 12);

    const result = new Date(startDate);
    const targetMonth = result.getMonth() + months;
    const targetDay = startDate.getDate();

    // Set month first (this may overflow to next month if day doesn't exist)
    result.setMonth(targetMonth);

    // Last-day clamping: if the day rolled over (e.g., Jan 31 -> Mar 3),
    // clamp back to last day of target month
    if (result.getDate() !== targetDay) {
      result.setDate(0); // Last day of previous month
    }

    return result;
  }
}
```
[VERIFIED: CONTEXT.md D-14 defines exact calendar calculation with last-day clamp]

### Pattern 4: Settings Table Upsert for Subscription Config
**What:** Store subscription configuration (grace period days, reminder milestones) in the existing `settings` table using key-value pattern.
**When to use:** Admin subscription settings page, worker reads config at runtime.
**Example:**
```typescript
// Follows existing pattern in admin-settings.ts saveVATSettings()
// Keys: "grace_period_days", "reminder_milestones"
// Upsert pattern: select -> update or insert
```
[VERIFIED: Existing `admin-settings.ts` lines 115-196 show exact upsert pattern]

### Anti-Patterns to Avoid
- **Approximate expiry calculation:** Using `Date.now() + months * 30 * 24 * 60 * 60 * 1000` (current implementation in OrderCompletedHandler). This causes drift. Must use exact calendar math. [VERIFIED: codebase shows approximate calc at OrderCompletedHandler.ts:181-188]
- **Validation API writing status changes:** The validation API must only READ. Status transitions are worker-driven (D-04). Writing status in the API creates race conditions and undermines the single-writer pattern.
- **Skipping dedup on reminders:** Without the `license_reminders` table, worker retries (after failures) would send duplicate emails. The unique constraint on `(license_id, milestone)` prevents this at the DB level.
- **Grace period as a separate duration field:** Grace period is computed from `expires_at + grace_days`. Do NOT store a separate `gracePeriodEndsAt` column — it would be redundant and could drift from config changes.
- **Worker processing lifetime licenses:** Always filter `WHERE expires_at IS NOT NULL` in the worker query. Lifetime licenses have no expiry and should never appear in expiration processing.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cron scheduling | Custom setInterval/setTimeout scheduler | BullMQ repeatable jobs with `pattern` option | Persistence across restarts, built-in retry, monitoring, Redis-backed |
| Job retry logic | Manual try/catch with retry counters | BullMQ `attempts` + `backoff` job options | Exponential backoff, max attempts, dead-letter on failure |
| Email dedup | In-memory Set of sent licenses | `license_reminders` table with unique constraint | Survives process restarts, prevents duplicates even after crashes |
| State transitions | If/else chains for status checks | `LicenseStateMachine` with transition map | Clear valid transitions, easy to test, prevents invalid states |
| Date arithmetic | Manual month/day calculations with edge case handling | `ExpiryCalculator` with last-day clamping | Handles Jan 31 -> Feb 28, leap years, month boundaries |

**Key insight:** BullMQ v5.78.0 provides `Repeat` and `JobScheduler` classes for repeatable jobs. The `Queue.add()` method accepts a `repeat.pattern` option for cron-style scheduling that persists in Redis and survives process restarts.

## Common Pitfalls

### Pitfall 1: Drizzle Enum Migration for PostgreSQL
**What goes wrong:** Drizzle ORM generates a full `CREATE TYPE ... AS ENUM` replacement when adding a value to `pgEnum`. PostgreSQL does not support `ALTER TYPE ADD VALUE` directly in transactions (it requires a separate command outside transactions).
**Why it happens:** Drizzle's migration generator creates a new enum type, renames the old one, and swaps. This can fail if the old enum is in use by tables.
**How to avoid:** Generate migration with `pnpm drizzle-kit generate`, then manually verify the SQL. The migration should use `ALTER TYPE license_status ADD VALUE 'grace_period'` (PostgreSQL 12+ supports this outside transactions). Alternatively, Drizzle may generate the correct `ALTER TYPE` if using `drizzle-kit` 0.28+.
**Warning signs:** Migration fails with "cannot alter type enum because it is already in use".

### Pitfall 2: Redis Connection Sharing Between BullMQ and ioredis
**What goes wrong:** The existing `src/lib/redis.ts` creates an ioredis client with specific configuration (maxRetriesPerRequest, retryStrategy). BullMQ requires its own connection or a compatible shared one.
**Why it happens:** BullMQ's `Queue` and `Worker` accept either an `IORedis.Redis` instance or connection options. If sharing the existing client, BullMQ's internal commands may conflict with the app's Redis usage.
**How to avoid:** Pass the existing `redis` instance from `src/lib/redis.ts` to BullMQ's `connection` option. BullMQ is designed to share ioredis connections. The existing `queues.ts` already uses a connection options pattern — but the actual `redis` export from `src/lib/redis.ts` is a full ioredis client. Use `{ connection: redis }` where `redis` is the ioredis instance.
**Warning signs:** BullMQ connection errors, Redis command queue issues.

### Pitfall 3: Validation API Cache Stale Grace Period
**What goes wrong:** The validation cache (5-min TTL) could serve stale results where a license appears active but has entered grace period, or appears in grace period but has expired.
**Why it happens:** The cache stores the full validation result. If the daily worker transitions a license's status, the cache still holds the old result until TTL expires.
**How to avoid:** On every status transition in the worker, invalidate the cache for affected licenses using the existing `ValidationCache.invalidateAll()` method. This is already wired up via cache invalidation handlers (D-20) — but only for events published via `inProcessPublisher`. The worker MUST publish `LICENSE_GRACE_PERIOD_STARTED` and `LICENSE_EXPIRED` events so the cache gets invalidated. Additionally, the validation API's real-time expiry check (D-03) provides a safety net for the gap between actual expiry and worker processing.
**Warning signs:** WordPress plugin shows license as valid when it should show grace period warning.

### Pitfall 4: Worker Runs in Next.js Dev Mode Hot Reloads
**What goes wrong:** In development, Next.js hot reloads modules on file changes. Each reload re-runs `module-init.ts`, potentially creating duplicate workers.
**Why it happens:** `initializeModules()` is called from the root layout. In dev mode with fast refresh, the layout re-renders frequently.
**How to avoid:** Use the `initialized` guard pattern (already in `initializeLicensingModule`). For workers, BullMQ's Worker constructor is idempotent per queue name — but the same ioredis connection sharing ensures workers deduplicate. Also guard worker startup with a module-level `let workerStarted = false` flag.
**Warning signs:** Multiple "Subscription daily job scheduled" log entries, duplicate job processing.

### Pitfall 5: Timezone Issues in Expiry Calculation
**What goes wrong:** Expiry dates calculated in local time instead of UTC, causing off-by-one-day errors for customers in different timezones.
**Why it happens:** JavaScript `Date` constructor uses local timezone by default. `new Date("2026-07-15")` may be parsed as midnight local time, not UTC.
**How to avoid:** Always use `new Date()` for current time (UTC internally), store as `timestamp` in PostgreSQL (UTC), and compare using `new Date() > expiresAt` directly. The `ExpiryCalculator` must use UTC-consistent methods (`getUTCMonth`, `getUTCDate`) or just rely on PostgreSQL's UTC storage.
**Warning signs:** Licenses expire a day early or late depending on customer timezone.

## Code Examples

### Adding `grace_period` to Enum (schema.ts)
```typescript
// Current (schema.ts line 35-40):
export const licenseStatusEnum = pgEnum("license_status", [
  "active",
  "expired",
  "revoked",
  "suspended",
]);

// Updated:
export const licenseStatusEnum = pgEnum("license_status", [
  "active",
  "expired",
  "revoked",
  "suspended",
  "grace_period",  // ADD: D-23
]);
```
[VERIFIED: schema.ts lines 35-40, CONTEXT.md D-23]

### `license_reminders` Table Schema
```typescript
// src/lib/db/schema.ts — new table
export const licenseReminders = pgTable(
  "license_reminders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    licenseId: uuid("license_id")
      .notNull()
      .references(() => licenses.id, { onDelete: "cascade" }),
    milestone: text("milestone").notNull(), // "30", "14", "7", "3", "1", "grace_entered", "expired"
    sentAt: timestamp("sent_at").notNull().defaultNow(),
  },
  (table) => [
    unique("license_reminders_license_id_milestone_unique").on(
      table.licenseId,
      table.milestone
    ),
    index("license_reminders_license_id_idx").on(table.licenseId),
  ]
);
```
[VERIFIED: CONTEXT.md specifics section defines the table structure]

### Worker Main Processing Loop
```typescript
// src/jobs/workers/subscription-lifecycle.ts — core processing
async function processDailySubscriptionCheck(): Promise<void> {
  const now = new Date();
  const settings = await getSubscriptionSettings();
  const milestones = settings.reminderMilestones; // [30, 14, 7, 3, 1]
  const gracePeriodDays = settings.gracePeriodDays; // 7

  // 1. Find all subscription licenses with expires_at not null
  const expiringLicenses = await findExpiringLicenses(now, milestones);

  for (const license of expiringLicenses) {
    try {
      // 2. Check if expired -> transition to grace_period or expired
      if (license.expiresAt <= now) {
        const gracePeriodEnd = new Date(
          license.expiresAt.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000
        );

        if (license.status === "active" && now < gracePeriodEnd) {
          // Active past expiry, within grace window -> transition to grace_period
          await transitionLicenseStatus(license.id, "active", "grace_period");
          await sendGracePeriodEmail(license, gracePeriodEnd);
          await recordReminder(license.id, "grace_entered");
        } else if (
          license.status === "grace_period" ||
          (license.status === "active" && now >= gracePeriodEnd)
        ) {
          // Past grace period -> expired
          await transitionLicenseStatus(license.id, license.status, "expired");
          await sendExpiredEmail(license);
          await recordReminder(license.id, "expired");
        }
      } else {
        // 3. Not yet expired -> check reminder milestones
        const daysUntilExpiry = Math.ceil(
          (license.expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
        );

        for (const milestone of milestones) {
          if (daysUntilExpiry <= milestone) {
            const alreadySent = await hasReminderBeenSent(
              license.id,
              String(milestone)
            );
            if (!alreadySent) {
              await sendReminderEmail(license, milestone, daysUntilExpiry);
              await recordReminder(license.id, String(milestone));
            }
          }
        }
      }
    } catch (err) {
      console.error(
        `[Subscription] Error processing license ${license.id}:`,
        err
      );
      // D-13: Continue on partial failure
    }
  }
}
```
[VERIFIED: CONTEXT.md D-08, D-09, D-13, D-21, D-22 define the processing pattern]

### Validation API Grace Period Check
```typescript
// Update ValidateLicenseHandler.ts — step 6-7 replacement
// Current (lines 91-95):
// if (license.status !== "active") return INVALID;
// if (license.expiresAt && new Date() > license.expiresAt) return INVALID;

// Updated:
if (license.status === "revoked" || license.status === "suspended") {
  return INVALID;
}

// Real-time expiry check (D-03)
if (license.expiresAt && new Date() > license.expiresAt) {
  if (license.status === "grace_period") {
    // Already in grace period — check if grace period is still valid
    const graceDays = await getGracePeriodDays(); // from settings
    const graceEnd = new Date(
      license.expiresAt.getTime() + graceDays * 24 * 60 * 60 * 1000
    );
    if (new Date() > graceEnd) {
      return INVALID; // Past grace period
    }
    // In grace period — return valid with grace_period_expires_at
    const graceResult: ValidateResult = {
      valid: true,
      licenseId: license.id,
      plan: license.plan,
      expiresAt: license.expiresAt,
      maxActivations: license.maxActivations,
      currentActivations: license.currentActivations,
    };
    // Cache with shorter TTL during grace period
    await ValidationCache.set(key.value, domain, JSON.stringify(graceResult), 60); // 1 min TTL
    return { ...graceResult, grace_period_expires_at: graceEnd };
  }

  // Active but past expires_at (worker hasn't run yet — safety net D-03)
  if (license.status === "active") {
    const graceDays = await getGracePeriodDays();
    const graceEnd = new Date(
      license.expiresAt.getTime() + graceDays * 24 * 60 * 60 * 1000
    );
    if (new Date() <= graceEnd) {
      // Within grace window, worker hasn't transitioned yet
      const graceResult: ValidateResult = {
        valid: true,
        licenseId: license.id,
        plan: license.plan,
        expiresAt: license.expiresAt,
        maxActivations: license.maxActivations,
        currentActivations: license.currentActivations,
      };
      await ValidationCache.set(key.value, domain, JSON.stringify(graceResult), 60);
      return { ...graceResult, grace_period_expires_at: graceEnd };
    }
  }

  return INVALID; // Expired and past grace period
}
```
[VERIFIED: CONTEXT.md D-02, D-03, D-04 define the validation API behavior]

### Update OrderCompletedHandler.resolvePlanDetails()
```typescript
// Current approximate calculation (lines 177-189):
const expiresAt = plan.licenseType === "lifetime"
  ? null
  : new Date(Date.now() + (plan.billingDurationMonths ?? 12) * 30 * 24 * 60 * 60 * 1000);

// Updated with exact calendar math:
const expiresAt = plan.licenseType === "lifetime"
  ? null
  : ExpiryCalculator.calculateExpiry(
      new Date(),
      plan.billingCycle ?? "yearly",
      plan.billingDurationMonths
    );
```
[VERIFIED: CONTEXT.md D-14, D-17; current code at OrderCompletedHandler.ts:177-189]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Approximate 30-day months | Exact calendar math with last-day clamping | Phase 18 (this phase) | Prevents expiry drift for month-boundary purchases |
| No grace period | Configurable 7-30 day grace period | Phase 18 | Prevents service disruption during renewal |
| Worker not implemented | BullMQ daily worker with repeatable jobs | Phase 18 | First worker in codebase, establishes pattern |
| Single email template | 3 templates (reminder, grace, expired) | Phase 18 | Context-appropriate customer communication |

**Deprecated/outdated:**
- `queues.ts` connection pattern: Currently uses conditional `connectionOptions` that only works when `REDIS_URL` is set. Should use the `redis` export from `src/lib/redis.ts` directly for BullMQ connection. [ASSUMED — based on code review]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | BullMQ v5.78.0 `Queue.add()` with `repeat.pattern` creates persistent cron jobs in Redis | Architecture Patterns | Worker scheduling fails, need different API |
| A2 | BullMQ Worker accepts existing ioredis instance via `{ connection: redis }` | Common Pitfalls | Worker cannot connect to Redis |
| A3 | Drizzle `drizzle-kit generate` will produce correct `ALTER TYPE ADD VALUE` SQL for PostgreSQL enum changes | Common Pitfalls | Manual migration SQL needed |
| A4 | `ValidationCache.set()` accepts an optional TTL parameter for shorter cache during grace period | Code Examples | Need to modify ValidationCache interface |
| A5 | The `settings` table `value` column (text type) is sufficient for storing comma-separated milestone days | Standard Stack | Need additional column or table |
| A6 | Resend API can handle sending ~500 emails in sequence within a single worker run without rate limiting | Architecture | Need batch sending or queue-based email dispatch |

## Open Questions

1. **ValidationCache TTL parameter**
   - What we know: `ValidationCache.set()` exists in `src/modules/licensing/infrastructure/adapters/ValidationCache.ts`. The existing pattern at `ValidateLicenseHandler.ts:111` passes a JSON string but no explicit TTL.
   - What's unclear: Whether `ValidationCache.set()` supports a custom TTL parameter for grace period entries.
   - Recommendation: Check `ValidationCache.ts` implementation. If it delegates to `cacheSet('license', ...)` which uses a default 300s TTL, we need to either add a TTL parameter or use `kvSet` directly for grace period entries.

2. **Redis availability in production**
   - What we know: `.env.local` has `REDIS_URL=redis://localhost:6381`. The `queues.ts` has a conditional pattern where queues are null if Redis is unavailable.
   - What's unclear: Whether production deployment has Redis running and accessible.
   - Recommendation: Follow existing pattern — graceful degradation when Redis is unavailable. Worker functions should check `redis` availability before scheduling/processing.

3. **Drizzle migration for enum value addition**
   - What we know: Drizzle ORM uses PostgreSQL `pgEnum`. Adding a value requires `ALTER TYPE ... ADD VALUE`. Drizzle-kit generates migrations.
   - What's unclear: Whether `drizzle-kit generate` produces the correct migration SQL for enum value addition in PostgreSQL 14+.
   - Recommendation: Run `pnpm drizzle-kit generate` after schema change and manually inspect the generated SQL. PostgreSQL 12+ supports `ALTER TYPE ADD VALUE` outside transactions.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Redis | BullMQ queue/worker | Conditional | ioredis (installed) | Worker not started, jobs not scheduled |
| PostgreSQL | Schema changes, data queries | Yes | via DATABASE_URL | -- |
| Resend API | Email delivery | Configured | RESEND_API_KEY env var | Emails fail silently (logged) |
| pnpm | Package management | Yes | lockfile present | -- |

**Missing dependencies with no fallback:**
- None — all dependencies installed. Redis is conditional (worker degrades gracefully).

**Missing dependencies with fallback:**
- Redis: If not available, worker and queues are not created. Daily checks won't run. This is the existing pattern in `queues.ts`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed — Wave 0 required |
| Config file | None — needs creation |
| Quick run command | N/A — requires setup |
| Full suite command | N/A — requires setup |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LSTAT-01 | License status enum includes grace_period | unit | Vitest | Wave 0 |
| LSTAT-01 | State machine rejects invalid transitions | unit | Vitest | Wave 0 |
| LSTAT-02 | Subscription licenses get expires_at in UTC | unit | Vitest | Wave 0 |
| LSTAT-03 | Grace period validation returns valid with grace_period_expires_at | unit | Vitest | Wave 0 |
| LSTAT-03 | Past grace period returns invalid | unit | Vitest | Wave 0 |
| LSTAT-04 | Lifetime licenses (null expires_at) skip worker processing | unit | Vitest | Wave 0 |
| LSTAT-07 | Reminder emails sent at correct milestones | unit | Vitest | Wave 0 |
| LSTAT-07 | Reminder dedup prevents duplicate sends | unit | Vitest | Wave 0 |
| JOB-01 | BullMQ worker processes expiration checks | integration | Vitest | Wave 0 |
| JOB-02 | Worker sends reminder emails based on expiration | unit | Vitest | Wave 0 |
| JOB-04 | Job retry with exponential backoff | integration | Vitest | Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm vitest run --reporter=verbose`
- **Per wave merge:** `pnpm vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- configure Vitest for Next.js + TypeScript
- [ ] `pnpm add -D vitest @testing-library/react` -- install test framework
- [ ] `tests/modules/licensing/domain/LicenseStateMachine.test.ts` -- covers LSTAT-01 state transitions
- [ ] `tests/modules/licensing/application/ExpiryCalculator.test.ts` -- covers LSTAT-02, D-14 calendar math
- [ ] `tests/modules/licensing/application/ValidateLicenseHandler.test.ts` -- covers LSTAT-03 grace period validation
- [ ] `tests/jobs/subscription-lifecycle.test.ts` -- covers JOB-01, JOB-02, JOB-04
- [ ] `tests/lib/emails/license-reminder.test.ts` -- covers email template rendering

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Better Auth (existing) for admin actions |
| V3 Session Management | yes | Better Auth session (existing) |
| V4 Access Control | yes | Admin role check on settings endpoints |
| V5 Input Validation | yes | Settings validation (grace period 7-30, milestone format) |
| V6 Cryptography | no | No new cryptographic operations |

### Known Threat Patterns for Subscription/Licensing Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Grace period bypass (customer modifies local clock) | Tampering | Server-side timestamp comparison in validation API |
| Email reminder enumeration (predicting license IDs) | Information Disclosure | UUID license IDs (non-sequential), rate limiting on API |
| Settings manipulation (non-admin changes grace period) | Elevation of Privilege | Admin role guard on settings actions |
| Worker replay (duplicate status transitions) | Tampering | State machine rejects invalid transitions; idempotent operations |
| Redis connection hijacking | Tampering | Redis auth via password (REDIS_PASSWORD env var) |

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/lib/db/schema.ts`, `src/modules/licensing/`, `src/jobs/queues.ts`, `src/lib/redis.ts`, `src/lib/emails/order-confirmation.ts`, `src/lib/module-init.ts`, `src/shared/infrastructure/eventBus/EventBus.ts`, `src/app/api/v1/license/validate/route.ts`, `src/modules/billing/application/handlers/OrderCompletedHandler.ts`, `src/app/(admin)/actions/admin-settings.ts`
- CONTEXT.md: All decisions D-01 through D-29 verified against codebase
- REQUIREMENTS.md: LSTAT-01 through LSTAT-07, JOB-01, JOB-02, JOB-04

### Secondary (MEDIUM confidence)
- BullMQ v5.78.0 package exports verified via `require('bullmq')` — confirms Queue, Worker, Job, Repeat classes available
- npm registry: bullmq 5.78.0, drizzle-orm 0.45.2, resend 6.12.4 version verification

### Tertiary (LOW confidence)
- [ASSUMED] BullMQ `Queue.add()` repeatable job API signature — based on training knowledge of BullMQ v5.x API, not verified against current docs (web search rate limited)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries installed and verified in codebase
- Architecture: HIGH - existing patterns well-documented in codebase, CONTEXT.md decisions map to concrete files
- Pitfalls: MEDIUM - PostgreSQL enum migration behavior depends on Drizzle-kit version; BullMQ connection sharing needs runtime verification

**Research date:** 2026-06-03
**Valid until:** 2026-07-03 (stable - all core dependencies installed, no new packages needed)
