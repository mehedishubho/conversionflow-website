---
phase: 13-seo-analytics
plan: 02
subsystem: ui, seo
tags: [react, seo, analytics, ga4, apexcharts, admin-dashboard]

# Dependency graph
requires:
  - phase: 13-seo-analytics-plan-01
    provides: getGa4Summary with DateRange, get404Errors, getSitemapHealth server actions
  - phase: 13-seo-analytics-plan-03
    provides: Errors404Table, SitemapHealthCards, CrawlIssuesPanel components
provides:
  - SeoAnalyticsClient orchestrator with DateRangeSelector and useTransition
  - IndexedPagesCards with 4 KPI cards (pageviews, active users, sessions, 404 errors)
  - TopPagesTable with rank, path, views columns
  - TrafficOverviewChart with ApexCharts area/bar switching per D-06
  - KeywordRankingsTable placeholder with 5 "--" rows per D-01
  - CtrImpressionsChart placeholder with info banner per D-01
  - Server page fetching initial data from 3 server actions in parallel
affects: []

# Tech tracking
tech-stack:
  added: []
patterns: [server page + client orchestrator pattern, useTransition for date range refetch, ApexCharts dynamic import with ssr:false]

key-files:
  created:
    - src/components/admin/seo/SeoAnalyticsClient.tsx
    - src/components/admin/seo/IndexedPagesCards.tsx
    - src/components/admin/seo/TopPagesTable.tsx
    - src/components/admin/seo/TrafficOverviewChart.tsx
    - src/components/admin/seo/KeywordRankingsTable.tsx
    - src/components/admin/seo/CtrImpressionsChart.tsx
  modified:
    - src/app/(admin)/admin/settings/seo/analytics/page.tsx

key-decisions:
  - "Only GA4 data re-fetches on date range change; 404 errors and sitemap health are not time-series data per RESEARCH.md Pitfall 5"
  - "GA4 '--' fallback values rendered in gray text with blue info banner matching CoreWebVitalsCards pattern"
  - "404 error count shows green when zero, normal color otherwise"
  - "KeywordRankingsTable and CtrImpressionsChart use honest '--' placeholders with Search Console info banners per D-01"

patterns-established:
  - "Analytics orchestrator pattern: server page fetches initial data, client component manages range state and re-fetches only GA4 data"
  - "Placeholder section pattern: table with '--' rows + blue info banner mentioning required API integration"

requirements-completed: [ANLT-01, ANLT-02, ANLT-03, ANLT-04, ANLT-07]

# Metrics
duration: 6min
completed: 2026-05-22
---

# Phase 13 Plan 02: Analytics Overview UI Summary

**GA4-powered analytics overview with KPI cards, top pages table, traffic chart, and honest placeholder sections for keyword rankings and CTR/impressions**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-21T18:52:42Z
- **Completed:** 2026-05-21T18:58:35Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Server page fetches initial GA4, 404 errors, and sitemap health data in parallel via Promise.all
- SeoAnalyticsClient orchestrates 6 ComponentCard sections with DateRangeSelector and useTransition
- IndexedPagesCards shows 4 KPI cards with GA4 fallback "--" values in gray and blue info banner
- TopPagesTable displays ranked pages with monospace path and formatted view counts
- TrafficOverviewChart uses ApexCharts with dynamic import and area/bar type switching per date range
- KeywordRankingsTable shows 5 placeholder rows with "--" values and Search Console info banner
- CtrImpressionsChart shows centered placeholder with info banner

## Task Commits

Each task was committed atomically:

1. **Task 1: Server page, client orchestrator, and analytics overview components** - `a7fa8b8` (feat)
2. **Task 2: Placeholder sections -- keyword rankings table and CTR/impressions chart** - `26cf948` (feat)

## Files Created/Modified
- `src/app/(admin)/admin/settings/seo/analytics/page.tsx` - Server component fetching initial data from 3 server actions, rendering SeoAnalyticsClient (22 lines)
- `src/components/admin/seo/SeoAnalyticsClient.tsx` - Client orchestrator with DateRangeSelector, useTransition, and 6 ComponentCard sections (111 lines)
- `src/components/admin/seo/IndexedPagesCards.tsx` - 4 KPI cards for pageviews, active users, sessions, 404 errors with GA4 fallback (91 lines)
- `src/components/admin/seo/TopPagesTable.tsx` - Ranked pages table with path and views columns (52 lines)
- `src/components/admin/seo/TrafficOverviewChart.tsx` - ApexCharts area/bar chart with dynamic import and date range switching (97 lines)
- `src/components/admin/seo/KeywordRankingsTable.tsx` - 5 placeholder rows with "--" values and Search Console info banner (62 lines)
- `src/components/admin/seo/CtrImpressionsChart.tsx` - Placeholder chart with info banner (36 lines)

## Decisions Made
- Only GA4 data re-fetches on date range change since 404 errors and sitemap health are not time-series data (per RESEARCH.md Pitfall 5)
- GA4 "--" fallback values displayed in gray text with blue info banner matching existing CoreWebVitalsCards pattern
- 404 error count card uses green color when count is zero (positive signal), normal color otherwise
- KeywordRankingsTable and CtrImpressionsChart use honest "--" placeholders without fake data per D-01

## Deviations from Plan

None - plan executed exactly as written.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All 7 files created/modified and committed
- SeoAnalyticsClient imports all Plan 03 components (Errors404Table, SitemapHealthCards, CrawlIssuesPanel) which already exist on disk
- Analytics dashboard is complete and ready for integration testing

---
*Phase: 13-seo-analytics*
*Completed: 2026-05-22*

## Self-Check: PASSED

All 7 files verified present. Both commit hashes (a7fa8b8, 26cf948) verified in git log.
