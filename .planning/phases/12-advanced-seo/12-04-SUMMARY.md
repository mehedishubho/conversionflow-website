---
phase: 12-advanced-seo
plan: 04
subsystem: seo
tags: [performance, core-web-vitals, cdn, cache-control, nextjs]

# Dependency graph
requires:
  - phase: 12-01
    provides: "PERFORMANCE_SEO_KEYS slice in seo-keys.ts, admin-seo.ts actions, SEO settings infrastructure"
provides:
  - "PerformanceSeoForm component with 3 config toggles, CDN URL, cache settings"
  - "CoreWebVitalsCards component with 5 placeholder CWV metric cards"
  - "Performance SEO settings page at /admin/settings/seo/performance"
affects: [12-05, admin-seo-settings]

# Tech tracking
tech-stack:
  added: []
  patterns: [self-contained-client-form, placeholder-cwv-cards, url-validation-on-save]

key-files:
  created:
    - src/components/admin/seo/PerformanceSeoForm.tsx
    - src/components/admin/seo/CoreWebVitalsCards.tsx
  modified:
    - src/app/(admin)/admin/settings/seo/performance/page.tsx

key-decisions:
  - "PerformanceSeoForm is self-contained client component loading data via useEffect on mount (no initialData prop)"
  - "CDN URL validated with URL constructor on save to prevent malicious URL injection (T-12-11)"
  - "Cache settings stored as JSON string with maxAge and staleWhileRevalidate fields"
  - "CWV cards use gray placeholder styling for values (-- text) to indicate no live data"

patterns-established:
  - "Self-contained form pattern: client component loads own data via getSeoSettings in useEffect, no props needed"
  - "URL validation on save: new URL() constructor check before persisting CDN URLs"

requirements-completed: [PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06]

# Metrics
duration: 7min
completed: 2026-05-21
---

# Phase 12 Plan 04: Performance SEO Summary

**Performance SEO settings page with Critical CSS/JS defer/minification toggles, CDN URL with validation, cache-control config, and 5 placeholder Core Web Vitals metric cards**

## Performance

- **Duration:** 7 min
- **Started:** 2026-05-21T04:08:39Z
- **Completed:** 2026-05-21T04:16:03Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Performance optimization toggles (Critical CSS, JS defer, minification) saving config flags to settings table
- CDN URL input with URL format validation on save (mitigates T-12-11 spoofing threat)
- Cache-Control settings (max-age, stale-while-revalidate) stored as JSON in settings table
- 5 Core Web Vitals metric cards (LCP, CLS, INP, TTFB, Overall Score) with placeholder "--" values
- Info banner explaining PageSpeed Insights API connection needed for real monitoring data

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Performance SEO keys and build PerformanceSeoForm component** - `c1c0b40` (feat)
2. **Task 2: Build CoreWebVitalsCards and wire the Performance SEO page** - `3d91a77` (feat)

## Files Created/Modified
- `src/components/admin/seo/PerformanceSeoForm.tsx` - Self-contained client form with 3 toggle switches, CDN URL input, 2 cache inputs, and save button
- `src/components/admin/seo/CoreWebVitalsCards.tsx` - 5 CWV metric cards with placeholder values and PageSpeed Insights API info banner
- `src/app/(admin)/admin/settings/seo/performance/page.tsx` - Performance SEO settings page rendering CWV cards and form (replaced placeholder)

## Decisions Made
- PerformanceSeoForm is self-contained (loads data in useEffect) rather than receiving initialData as prop -- follows plan specification for "no props, self-contained"
- CDN URL validated using `new URL()` constructor before save -- empty string allowed (means no CDN), but non-empty must be valid http/https URL
- Cache settings serialized as JSON string `{ maxAge: "3600", staleWhileRevalidate: "86400" }` in single settings key `seo_perf_cache_settings`
- CWV cards use gray-300/gray-600 text for "--" values to visually indicate placeholder state vs real data

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing build failure (`platformPricing` export missing from `@/data/pricing`) prevents full `pnpm build` verification. This is an out-of-scope issue unrelated to Plan 12-04 changes. Logged to `deferred-items.md`.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Performance SEO page fully functional with config-only toggles and CWV placeholder cards
- CWV cards ready for future PageSpeed Insights API integration (Plan 12-05 or later)
- All performance keys persisted via existing admin-seo.ts actions with audit logging

## Self-Check: PASSED

- FOUND: src/components/admin/seo/PerformanceSeoForm.tsx
- FOUND: src/components/admin/seo/CoreWebVitalsCards.tsx
- FOUND: src/app/(admin)/admin/settings/seo/performance/page.tsx
- FOUND: c1c0b40 (Task 1 commit)
- FOUND: 3d91a77 (Task 2 commit)

---
*Phase: 12-advanced-seo*
*Completed: 2026-05-21*
