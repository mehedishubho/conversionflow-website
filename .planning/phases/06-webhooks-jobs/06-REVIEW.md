---
phase: 06-webhooks-jobs
reviewed: 2026-05-19T12:00:00Z
depth: standard
files_reviewed: 18
files_reviewed_list:
  - src/lib/webhook-types.ts
  - src/lib/webhook.ts
  - src/lib/webhook-handlers.ts
  - src/app/api/webhooks/license/route.ts
  - src/jobs/workers/license-sync.ts
  - src/jobs/start.ts
  - src/instrumentation.ts
  - src/app/(admin)/actions/admin-licenses.ts
  - src/lib/piracy-detection.ts
  - src/components/admin/LicenseIntelligenceKPIs.tsx
  - src/components/admin/LicensePlanChart.tsx
  - src/components/admin/LicenseIntelligenceClient.tsx
  - src/components/admin/PiracyFlagBadge.tsx
  - src/components/admin/LicenseDomainTable.tsx
  - src/components/admin/LicenseDetailActions.tsx
  - src/app/(admin)/admin/licenses/page.tsx
  - src/app/(admin)/admin/licenses/[id]/page.tsx
  - src/data/dashboard-nav.ts
findings:
  critical: 0
  warning: 6
  info: 5
  total: 11
status: issues_found
---

# Phase 06: Code Review Report

**Reviewed:** 2026-05-19T12:00:00Z
**Depth:** standard
**Files Reviewed:** 18
**Status:** issues_found

## Summary

Reviewed all 18 Phase 06 source files covering webhook processing, background jobs, piracy detection, and the admin license intelligence dashboard. The overall architecture is solid: HMAC verification uses timing-safe comparison, Drizzle ORM prevents SQL injection, admin guards are consistently applied, and audit logging covers all mutations.

Six warnings were identified. The most significant are: (1) a mismatch between the BullMQ Queue constructor in `queues.ts` and the Worker constructor in `license-sync.ts` that may cause silent connection failures in production, (2) the `getFlaggedLicenses` function loads ALL licenses into memory and runs N+1 DB queries for cross-site checks, which is a correctness/data-scalability concern, and (3) the `not` import from `drizzle-orm` in `license-sync.ts` is unused. Five info-level items cover dead code and minor improvements.

## Warnings

### WR-01: BullMQ Worker connection options shape may not match Queue

**File:** `src/jobs/workers/license-sync.ts:12` and `src/jobs/queues.ts:10-11`
**Issue:** The Queue instances in `queues.ts` are created with `{ connection: { host: "localhost", port: 6381 } }` (a nested `connection` property), while the Worker in `license-sync.ts` uses `{ host: "localhost", port: 6381 }` directly. BullMQ's `Queue` constructor accepts `(name, opts?)` where the second argument is `QueueOptions` with a `connection` field. The Worker constructor similarly expects `WorkerOptions` with a `connection` field. However, the Worker here passes `{ host, port }` as a sibling of `concurrency` and `limiter` -- this is the correct top-level position. The real concern is that in `queues.ts`, the Queue is constructed as `new Queue(name, { connection: { ... } })` which is also correct. Both use the same host/port. However, the Queue only initializes when `process.env.REDIS_URL` is truthy, while the Worker always attempts to connect. If `REDIS_URL` is not set, the Queue is `null` (jobs are never enqueued), but the Worker still starts and tries connecting to Redis at `localhost:6381`. In `start.ts` line 14, there is a guard `if (!licenseSyncQueue)` that returns early, preventing the Worker from starting when the Queue is null. This is safe. No actual bug here, but the duplicate connection config between files is fragile -- a maintenance hazard if the Redis port changes.
**Fix:** Extract the Redis connection config into a shared constant:

```typescript
// src/jobs/redis.ts
export const redisConnection = { host: "localhost", port: 6381 };
```

Then import and use in both `queues.ts` and `license-sync.ts`.

---

### WR-02: getFlaggedLicenses loads all licenses then runs N+1 DB queries

**File:** `src/app/(admin)/actions/admin-licenses.ts:462-517`
**Issue:** `getFlaggedLicenses()` fetches ALL licenses from the database (no WHERE clause filtering by status) into memory, then iterates each one calling `checkCrossSiteMatch()` which itself queries all active licenses from the database. This creates an N+1 query pattern where for N total licenses, there are N+1 database queries. With even moderate data, this will be slow and memory-intensive. Additionally, the `evaluatePiracyTriggers` is called for every license including expired/revoked ones that are unlikely to be piracy candidates.
**Fix:** Filter to only active/suspended licenses in the initial query, and consider batching the cross-site check:

```typescript
// Filter to licenses that could plausibly have piracy issues
.from(licenses)
.where(
  inArray(licenses.status, ["active", "suspended"])
)
```

For the cross-site N+1, consider building a single domain-to-license map from one query rather than querying per-license.

---

### WR-03: Unused import `not` in license-sync worker

**File:** `src/jobs/workers/license-sync.ts:4`
**Issue:** `not` is imported from `drizzle-orm` but never used in the file. The only `where` clauses use `eq`, `isNull`, and `and`. This is dead code that suggests a planned filter was removed or never implemented.
**Fix:** Remove the unused import:

```typescript
import { eq, isNull, and } from "drizzle-orm";
```

---

### WR-04: Dynamic imports inside checkCrossSiteMatch run on every invocation

**File:** `src/lib/piracy-detection.ts:114-115`
**Issue:** `checkCrossSiteMatch` uses dynamic `await import()` for `@/lib/db/schema` and `drizzle-orm` on every call. These are statically resolvable modules, so the dynamic import adds unnecessary overhead per invocation. This function is called once per license in `getFlaggedLicenses` and once in `getLicenseDetail`, meaning these imports execute repeatedly.
**Fix:** Convert to static imports at the top of the file:

```typescript
import { licenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
```

---

### WR-05: checkCrossSiteMatch queries all active licenses but only filters by status, not by userId

**File:** `src/lib/piracy-detection.ts:117-124`
**Issue:** The cross-site match query fetches all active licenses and filters the current license out in JavaScript. Per the D-04 design, cross-site means "same key on unrelated sites" (different userId). But the current code checks if domains overlap across ANY two different license IDs, even if they belong to the same user. A single user with multiple licenses for different products could have the same domain legitimately. This will produce false-positive piracy flags.
**Fix:** Either filter by different userId in the JavaScript comparison, or add a userId check:

```typescript
// In the loop at line 130, also check userId differs
for (const license of otherLicenses) {
  if (license.id === currentLicenseId) continue;

  // Skip if same user -- legitimate multi-license scenario
  // (requires adding userId to the select query)
  if (license.userId === currentUserId) continue;
  ...
}
```

---

### WR-06: kpiCards array defined but never used in LicenseIntelligenceKPIs

**File:** `src/components/admin/LicenseIntelligenceKPIs.tsx:15-49`
**Issue:** A `kpiCards` configuration array is defined at module scope with `key`, `label`, `icon`, `getValue`, and `getBadge` properties, but the component renders KPI cards as hardcoded JSX (lines 53-144) without referencing this array. The `getValue` for "expiring" returns `() => null` which also suggests the data-driven approach was abandoned mid-implementation. This dead code increases bundle size and creates confusion about the intended rendering approach.
**Fix:** Either remove the unused `kpiCards` array, or refactor the component to use it for rendering (which would be the cleaner approach).

## Info

### IN-01: dashboard-nav.ts "All Licenses" and "Intelligence" both point to same path

**File:** `src/data/dashboard-nav.ts:42-45`
**Issue:** Both subItems under "Licenses" navigate to `/admin/licenses`. The "Intelligence" subItem should presumably point to a different view or anchor, but currently duplicates the same route.
**Fix:** Either remove the subItems if they serve no navigational purpose, or point "Intelligence" to a distinct route like `/admin/licenses?view=intelligence`.

---

### IN-02: LicensePlanChart dark mode detection is a one-time snapshot

**File:** `src/components/admin/LicensePlanChart.tsx:19-21`
**Issue:** `isDark` is computed once when the component renders by checking `document.documentElement.classList`. If the user toggles the theme while the chart is visible, the chart legend colors will not update until a full re-render is triggered by other means.
**Fix:** Use the `useTheme` hook from `next-themes` to reactively track theme changes, or use CSS variables for legend colors.

---

### IN-03: syncError always "Missing central order mapping" regardless of actual cause

**File:** `src/app/(admin)/actions/admin-licenses.ts:184`
**Issue:** The `syncError` message for sync failure licenses is hardcoded to "Missing central order mapping" regardless of why the sync actually failed. The order might have failed for other reasons (central API timeout, invalid payload, etc.). This message may be misleading to admins.
**Fix:** Store the actual sync error in the database (e.g., a `syncError` column on the orders table) or derive a more accurate message.

---

### IN-04: Duplicate admin auth check between page and server action

**File:** `src/app/(admin)/admin/licenses/page.tsx:19-30` and `src/app/(admin)/admin/licenses/[id]/page.tsx:32-43`
**Issue:** Both page components manually verify the session and role, then call server actions that also call `requireAdmin()`. This means every page load triggers two session lookups. This is not a bug (defense in depth is valid), but it is redundant work.
**Fix:** This is acceptable as defense-in-depth. No action required, but be aware that removing the page-level check would halve session lookups.

---

### IN-05: Piracy flag dismissal is audit-only, no persistent state change

**File:** `src/app/(admin)/actions/admin-licenses.ts:358-375`
**Issue:** `dismissPiracyFlag` only writes an audit log entry. When the license detail page is reloaded, `evaluatePiracyTriggers` re-evaluates from live data and the same flags reappear. This means dismissal is effectively invisible to the user -- the flag comes back on next page load. The comment says "flag is re-evaluated on next page load from live data" which is intentional per D-05, but the user experience of dismissing a flag and seeing it return is potentially confusing.
**Fix:** If this is intentional (per D-05 "manual review" approach), document it clearly in the UI. Otherwise, consider storing dismissed flags in the database and filtering them out during re-evaluation.

---

_Reviewed: 2026-05-19T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
