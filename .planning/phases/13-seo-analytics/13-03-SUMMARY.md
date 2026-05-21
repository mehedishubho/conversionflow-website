---
phase: 13-seo-analytics
plan: 03
subsystem: ui, seo
tags: [react, seo, analytics, 404-errors, sitemap-health, admin-dashboard]

# Dependency graph
requires:
  - phase: 13-seo-analytics-plan-01
    provides: get404Errors and getSitemapHealth server actions, Error404 type interface
  - phase: 12-advanced-seo
    provides: CoreWebVitalsCards placeholder card pattern, Badge component
provides:
  - Errors404Table client component with real 404 data and URL search filtering
  - SitemapHealthCards with 4 status cards showing real sitemap data
  - CrawlIssuesPanel placeholder with 3 Google Search Console metric cards
affects: [13-02]

# Tech tracking
tech-stack:
  added: []
patterns: [client-side search filtering, relative time formatting, hostname extraction from referrer URLs]

key-files:
  created:
    - src/components/admin/seo/Errors404Table.tsx
    - src/components/admin/seo/SitemapHealthCards.tsx
    - src/components/admin/seo/CrawlIssuesPanel.tsx
  modified: []

key-decisions:
  - "formatRelativeTime uses pure math on Date.now() instead of date-fns to keep the bundle lightweight"
  - "Referrer display extracts hostname via new URL() with try/catch fallback for malformed URLs"
  - "SitemapHealthCards uses a const cards array with getValue functions per card to avoid repeated JSX"

patterns-established:
  - "Searchable table pattern: useState for search term, filtered array derived from props, empty state when no match"
  - "Health status cards: grid of metric cards using Badge component for boolean status indicators"

requirements-completed: [ANLT-05, ANLT-06, ANLT-07]

# Metrics
duration: 4min
completed: 2026-05-22
---

# Phase 13 Plan 03: Health Reports UI Summary

**404 error tracking table with client-side URL search, sitemap health status cards with Badge indicators, and placeholder crawl issues panel**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-21T18:44:34Z
- **Completed:** 2026-05-21T18:48:25Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Errors404Table with real-time URL search filtering, relative time display, referrer hostname extraction, and red-highlighted hit counts for frequent errors
- SitemapHealthCards with 4 status cards (Status, Total URLs, Last Generated, XML Valid) using Badge for boolean indicators
- CrawlIssuesPanel with 3 placeholder metric cards following CoreWebVitalsCards pattern and blue info banner

## Task Commits

Each task was committed atomically:

1. **Task 1: Real 404 errors table and sitemap health cards** - `2fe1df8` (feat)
2. **Task 2: Crawl issues placeholder panel and build verification** - `eea8f53` (feat)

## Files Created/Modified
- `src/components/admin/seo/Errors404Table.tsx` - Searchable 404 error table with URL search, hit count coloring, relative time, and empty states (148 lines)
- `src/components/admin/seo/SitemapHealthCards.tsx` - 4 status cards for sitemap health with Badge indicators (83 lines)
- `src/components/admin/seo/CrawlIssuesPanel.tsx` - 3 placeholder crawl issue metric cards with info banner (83 lines)

## Decisions Made
- formatRelativeTime implemented with pure date math instead of date-fns dependency to keep bundle size minimal
- Referrer hostname extraction uses try/catch around new URL() to gracefully handle malformed or non-URL referrer strings
- SitemapHealthCards uses a const cards configuration array with per-card getValue functions for cleaner rendering logic

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing build failure in `src/components/sections/RepositioningSections.tsx` (missing `featureCategories` export) blocks full `pnpm build`. This is unrelated to Plan 03 changes. TypeScript type-checking via `tsc --noEmit` confirms zero errors in all 3 new component files.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 3 health report components ready for import by SeoAnalyticsClient (Plan 02)
- Components accept the correct prop types matching get404Errors and getSitemapHealth return types from Plan 01

---
*Phase: 13-seo-analytics*
*Completed: 2026-05-22*

## Self-Check: PASSED

All 4 files verified present. Both commit hashes (2fe1df8, eea8f53) verified in git log.
