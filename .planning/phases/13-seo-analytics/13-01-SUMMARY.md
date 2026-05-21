---
phase: 13-seo-analytics
plan: 01
subsystem: database, api
tags: [drizzle, postgres, server-actions, seo, analytics, ga4]

# Dependency graph
requires:
  - phase: 12-advanced-seo
    provides: existing admin-seo.ts server actions, schema.ts DB tables
provides:
  - seo_404_errors DB table with unique URL constraint and hit count aggregation
  - get404Errors server action for admin analytics dashboard
  - getSitemapHealth server action for sitemap health reporting
  - log404Error public server action with upsert and HTML sanitization
  - getGa4Summary with configurable DateRange parameter (7d/30d/90d/year)
  - 404 error logging integration in not-found page
affects: [13-02, 13-03]

# Tech tracking
tech-stack:
  added: []
  patterns: [drizzle onConflictDoUpdate upsert, public server action without auth guard, date range switch pattern]

key-files:
  created: []
  modified:
    - src/lib/db/schema.ts
    - src/app/(admin)/actions/admin-seo.ts
    - src/app/(admin)/actions/admin-tracking-v2.ts
    - src/app/[locale]/not-found.tsx

key-decisions:
  - "log404Error is public (no requireAdmin) since it's called from the public not-found page"
  - "getGa4Summary defaults to 7d range preserving backward compatibility with existing callers"
  - "HTML tag stripping via regex sanitization on url/referrer inputs per threat model T-13-01"

patterns-established:
  - "Public server action pattern: no auth guard + input sanitization + try/catch returning safe defaults"
  - "Upsert pattern: onConflictDoUpdate with sql expression for hit count increment"

requirements-completed: [ANLT-01, ANLT-05, ANLT-06]

# Metrics
duration: 3min
completed: 2026-05-21
---

# Phase 13 Plan 01: SEO Analytics Backend Summary

**DB table for 404 error tracking with upsert aggregation, admin server actions for 404/sitemap health data, and GA4 date range support for analytics dashboard**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-21T18:38:06Z
- **Completed:** 2026-05-21T18:40:45Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- seo_404_errors table with unique URL constraint enabling efficient upsert-based hit counting
- Three new server actions: get404Errors, getSitemapHealth, log404Error with proper auth guards and error handling
- GA4 analytics extended with configurable date range (7d/30d/90d/year) while maintaining backward compatibility
- 404 page automatically logs errors to database without blocking page rendering

## Task Commits

Each task was committed atomically:

1. **Task 1: Add seo_404_errors table to schema** - `b6d91fb` (feat)
2. **Task 2: Add analytics server actions, extend GA4 with date range, integrate 404 logging** - `2002614` (feat)

## Files Created/Modified
- `src/lib/db/schema.ts` - Added seo404Errors table with unique URL constraint and last_seen_at index
- `src/app/(admin)/actions/admin-seo.ts` - Added get404Errors, getSitemapHealth, log404Error server actions
- `src/app/(admin)/actions/admin-tracking-v2.ts` - Extended getGa4Summary with DateRange parameter
- `src/app/[locale]/not-found.tsx` - Added 404 error logging via log404Error server action

## Decisions Made
- log404Error intentionally has no requireAdmin() guard since it runs on the public not-found page (threat model T-13-04: accepted)
- getGa4Summary defaults to "7d" range so existing callers from Phase 11 continue working without changes
- HTML tag stripping regex `/<[^>]*>/g` applied to both url and referrer inputs per threat model T-13-01

## Deviations from Plan

None - plan executed exactly as written.

Note: `drizzle-kit push` could not run in the worktree environment (no DB connection). The schema definition is correct and the push must be executed in the deployment environment.

## Issues Encountered
- `drizzle-kit push` requires database connection which is unavailable in the worktree. Schema definition verified correct; push deferred to deployment.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All backend data access layer ready for Plan 02 (Analytics Overview UI) and Plan 03 (Keyword/CTR/Health UI)
- DB migration needed: run `npx drizzle-kit push` in deployment environment to create seo_404_errors table

---
*Phase: 13-seo-analytics*
*Completed: 2026-05-21*

## Self-Check: PASSED

All 5 files verified present. Both commit hashes (b6d91fb, 2002614) verified in git log.
