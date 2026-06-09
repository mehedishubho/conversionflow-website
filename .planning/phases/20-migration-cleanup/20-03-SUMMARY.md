---
phase: 20-migration-cleanup
plan: 03
subsystem: [ui, infra]
tags: [admin-settings, license-engine, status-card, env-cleanup, central-api-removal]

# Dependency graph
requires:
  - phase: 20-migration-cleanup (plans 01, 02)
    provides: "Central API code removal, migration script, email template"
provides:
  - "Local License Engine status card in Payment Settings UI"
  - "getLicenseEngineStatus server action for license stats"
  - "Verified deletion of orphaned central-api.ts"
  - "Confirmed env var deprecation warning in layout.tsx"
  - "Confirmed nanoid dependency still required (used by event system)"
affects: [payment-settings, admin-dashboard, licensing-status]

# Tech tracking
tech-stack:
  added: []
  patterns: [license-engine-status-card, server-action-parallel-fetch]

key-files:
  created: []
  modified:
    - src/app/(admin)/actions/admin-settings.ts
    - src/app/(admin)/admin/settings/payment/page.tsx
    - src/components/admin/PaymentSettingsForm.tsx
  deleted:
    - src/lib/central-api.ts

key-decisions:
  - "D-14: Replaced Central API status card with Local License Engine status card showing Active indicator, total/active license counts, and migration completion badge"
  - "D-17: Verified env var deprecation warning already in layout.tsx (done in plan 20-01)"
  - "D-18: Confirmed nanoid cannot be removed -- still used by 4 modules (event IDs, API token generation)"

patterns-established:
  - "License Engine status card: server action queries license counts + migration flag, passed through page to client component"
  - "Parallel data fetching: Promise.all for independent server action calls in page components"

requirements-completed: [ARCH-07]

# Metrics
duration: 4min
completed: 2026-06-03
---

# Phase 20 Plan 03: UI Replacement Summary

**Local License Engine status card added to Payment Settings with active indicator, license counts, and migration status; orphaned central-api.ts deleted; env var cleanup verified**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-03T20:55:24Z
- **Completed:** 2026-06-03T20:59:20Z
- **Tasks:** 2
- **Files modified:** 3 created/modified, 1 deleted

## Accomplishments
- Deleted orphaned `src/lib/central-api.ts` (125 lines, zero imports) -- completes Central API code removal
- Added `getLicenseEngineStatus` server action querying license table counts and migration completion flag
- Added Local License Engine status card to Payment Settings with green Active indicator, total/active license counts, and migration completion badge
- Verified env var deprecation warning already in `layout.tsx` (CENTRAL_API_URL/CENTRAL_API_KEY)
- Confirmed `nanoid` dependency is still actively used by 4 modules -- not removed

## Task Commits

Each task was committed atomically:

1. **Task 1: Delete orphaned central-api.ts** - `58d99da` (feat)

**Plan metadata:** `58d99da` (feat: Local License Engine status card and central-api.ts deletion)

## Files Created/Modified
- `src/lib/central-api.ts` - DELETED (orphaned Central API client, zero imports)
- `src/app/(admin)/actions/admin-settings.ts` - Added `getLicenseEngineStatus` server action with parallel queries for total licenses, active licenses, and migration completion flag
- `src/app/(admin)/admin/settings/payment/page.tsx` - Added `getLicenseEngineStatus` call with `Promise.all` parallel fetch, passed `licenseEngine` prop to form
- `src/components/admin/PaymentSettingsForm.tsx` - Added `licenseEngine` to props interface; added Local License Engine status card with Active pulse indicator, license count grid, and migration badge

## Decisions Made
- **License Engine card data source:** Queries `licenses` table directly via `sql<number>count(*)::int` for total/active counts, and `settings` table for `phase20_migration_complete` flag. Simple live query approach (per D-14 Claude's discretion).
- **Card placement:** Added between VAT Configuration and Payment Method cards in PaymentSettingsForm, using existing ComponentCard layout pattern.
- **nanoid retention:** Confirmed 4 active imports remain (ProductEvents, OrderEvents, LicenseEvents, ApiTokenGenerator) -- dependency must stay.

## Deviations from Plan

None - all changes align with CONTEXT decisions D-13, D-14, D-17, D-18 and the ROADMAP plan description.

## Issues Encountered
- Build (`pnpm build`) fails due to pre-existing missing dependencies (`nodemailer`, tiptap editor packages) -- out of scope, not caused by this plan's changes. TypeScript type-checking of modified files shows zero errors.
- Worktree branch base mismatch required `git checkout 47775f3 -- .` to restore correct file state before execution.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 20 (Migration & External API Removal) is now complete at the plan level
- All 3 plans (20-01 code cleanup, 20-02 migration script, 20-03 UI replacement) have been executed
- The migration CLI script (`scripts/migrate-phase20.ts`) is ready to run against the database
- After running the migration script and `drizzle-kit push`, the Phase 20 data migration will be complete

---
*Phase: 20-migration-cleanup*
*Completed: 2026-06-03*

## Self-Check: PASSED

| Item | Status |
|------|--------|
| `.planning/phases/20-migration-cleanup/20-03-SUMMARY.md` | FOUND |
| `src/app/(admin)/actions/admin-settings.ts` | FOUND |
| `src/app/(admin)/admin/settings/payment/page.tsx` | FOUND |
| `src/components/admin/PaymentSettingsForm.tsx` | FOUND |
| `src/lib/central-api.ts` | CONFIRMED DELETED |
| Commit `58d99da` | FOUND |
