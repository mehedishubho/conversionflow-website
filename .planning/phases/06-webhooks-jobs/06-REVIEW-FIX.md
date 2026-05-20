---
phase: 06-webhooks-jobs
fixed_at: 2026-05-19T05:07:45Z
review_path: .planning/phases/06-webhooks-jobs/06-REVIEW.md
iteration: 1
findings_in_scope: 6
fixed: 6
skipped: 0
status: all_fixed
---

# Phase 06: Code Review Fix Report

**Fixed at:** 2026-05-19T05:07:45Z
**Source review:** .planning/phases/06-webhooks-jobs/06-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 6
- Fixed: 6
- Skipped: 0

## Fixed Issues

### WR-01: Extract shared Redis connection config

**Files modified:** `src/jobs/redis.ts` (new), `src/jobs/queues.ts`, `src/jobs/workers/license-sync.ts`
**Commit:** 2d956e0
**Applied fix:** Created `src/jobs/redis.ts` with shared `redisConnection` constant. Updated both `queues.ts` and `license-sync.ts` to import from the shared file, eliminating duplicate host/port configuration.

### WR-02: Filter getFlaggedLicenses to active/suspended only

**Files modified:** `src/app/(admin)/actions/admin-licenses.ts`
**Commit:** 3844556
**Applied fix:** Added `inArray` import from drizzle-orm. Added `.where(inArray(licenses.status, ["active", "suspended"]))` filter to the initial query, excluding expired/revoked licenses that are not piracy candidates.

### WR-03: Remove unused `not` import

**Files modified:** `src/jobs/workers/license-sync.ts`
**Commit:** 2d956e0 (combined with WR-01)
**Applied fix:** Removed `not` from the drizzle-orm import line. The only where clauses in the file use `eq`, `isNull`, and `and`.

### WR-04: Convert dynamic imports to static imports

**Files modified:** `src/lib/piracy-detection.ts`
**Commit:** 43cb63f (combined with WR-05)
**Applied fix:** Replaced `await import("@/lib/db/schema")` and `await import("drizzle-orm")` inside `checkCrossSiteMatch` with static top-level imports. Removed the unused `not` import that was also in the dynamic import.

### WR-05: Skip same-user licenses in cross-site match

**Files modified:** `src/lib/piracy-detection.ts`, `src/app/(admin)/actions/admin-licenses.ts`
**Commit:** 43cb63f
**Applied fix:** Added optional `currentUserId` parameter to `checkCrossSiteMatch`. Added a `continue` guard to skip licenses belonging to the same user, preventing false-positive piracy flags for multi-license users. Updated both call sites (`getLicenseDetail` and `getFlaggedLicenses`) to pass the userId.

### WR-06: Remove unused kpiCards array

**Files modified:** `src/components/admin/LicenseIntelligenceKPIs.tsx`
**Commit:** d163363
**Applied fix:** Removed the unused `kpiCards` configuration array (35 lines of dead code). The component renders KPI cards as hardcoded JSX and never referenced this array.

---

_Fixed: 2026-05-19T05:07:45Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
