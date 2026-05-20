---
phase: 10-core-seo
plan: 01
subsystem: seo
tags: [drizzle, server-actions, seo, settings, audit-logging]

# Dependency graph
requires:
  - phase: 09-settings-foundation
    provides: Settings key-value table, admin auth pattern, audit logging
provides:
  - "admin-seo.ts server actions for all 25 SEO settings CRUD"
  - "seo.ts enhanced with DB-based SEO override fallback"
  - "Grouped key arrays for 4 SEO sub-sections (general, verification, sitemap, robots)"
  - "SEO score calculator (filled/total/percentage)"
affects: [10-02, 10-03, 10-04, marketing-site-metadata]

# Tech tracking
tech-stack:
  added: []
  patterns: ["SEO settings CRUD via admin server actions with grouped key arrays", "DB-first SEO overrides with hardcoded fallback in seo.ts"]

key-files:
  created:
    - src/app/(admin)/actions/admin-seo.ts
  modified:
    - src/lib/seo.ts

key-decisions:
  - "seo.ts reads DB overrides first, falls back to hardcoded defaults via try/catch (D-01)"
  - "createPageMetadata made async to support DB reads, same parameter signature preserved"
  - "Canonical URL and OG image read from DB; page-specific titles/descriptions kept as-is for per-page quality"

patterns-established:
  - "Grouped key arrays pattern: GENERAL_SEO_KEYS, VERIFICATION_SEO_KEYS, SITEMAP_SEO_KEYS, ROBOTS_SEO_KEYS for sub-section filtering"
  - "SEO override pattern: getCachedSeoOverrides() wraps DB read in try/catch, returns empty map on failure"

requirements-completed: [GSEO-01, GSEO-02, GSEO-03, GSEO-04, GSEO-07, VERF-01, VERF-02, VERF-03, VERF-04, VERF-05, SITM-01, SITM-02, SITM-03, SITM-05, ROBT-01, ROBT-02, ROBT-03, ROBT-04, ROBT-05]

# Metrics
duration: 4min
completed: 2026-05-20
---

# Phase 10 Plan 01: SEO Server Actions & DB Integration Summary

**Server actions for all 25 SEO settings with admin auth/audit, plus seo.ts enhanced with DB-first override fallback preserving all existing hardcoded behavior**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-20T13:44:36Z
- **Completed:** 2026-05-20T13:48:32Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created admin-seo.ts with typed get/save/score functions for all 25 SEO settings keys across 4 sub-sections
- Enhanced seo.ts with DB override reads for canonical URL and OG image, with full try/catch fallback to hardcoded values
- All existing page metadata generation preserved identically when no DB rows exist

## Task Commits

Each task was committed atomically:

1. **Task 1: Create admin-seo.ts server actions** - `a2d3456` (feat)
2. **Task 2: Enhance seo.ts with DB fallback** - `6faffda` (feat)

## Files Created/Modified
- `src/app/(admin)/actions/admin-seo.ts` - Server actions for SEO settings CRUD with admin auth guard and audit logging (25 keys in 4 groups)
- `src/lib/seo.ts` - Enhanced with getCachedSeoOverrides() for DB-first reads, async createPageMetadata, hardcoded fallback preserved

## Decisions Made
- Used grouped key arrays (GENERAL_SEO_KEYS, VERIFICATION_SEO_KEYS, etc.) for sub-section filtering instead of separate key lists per action
- createPageMetadata reads DB for canonical URL base and OG image only; page-specific titles/descriptions kept hardcoded for per-page SEO quality
- getSeoScore counts non-empty values across all 25 keys for a simple filled/total metric

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- admin-seo.ts ready for Plans 02-04 to import getSeoSettings/saveSeoSettings for their sub-section forms
- seo.ts DB integration ready; Plans 02-04 can add more override keys as needed
- Canonical URL and OG image overrides will take effect immediately when admin saves values

---
*Phase: 10-core-seo*
*Completed: 2026-05-20*

## Self-Check: PASSED

- FOUND: src/app/(admin)/actions/admin-seo.ts
- FOUND: src/lib/seo.ts
- FOUND: commit a2d3456 (Task 1)
- FOUND: commit 6faffda (Task 2)
