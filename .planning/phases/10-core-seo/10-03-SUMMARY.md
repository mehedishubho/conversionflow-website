---
phase: 10-core-seo
plan: 03
subsystem: seo
tags: [seo, verification, sitemaps, expand-collapse, db-aware, auto-regeneration]

# Dependency graph
requires:
  - phase: 10-core-seo
    plan: 01
    provides: "admin-seo.ts server actions, VERIFICATION_SEO_KEYS, SITEMAP_SEO_KEYS, getSeoSettings, saveSeoSettings"
provides:
  - "VerificationForm with 5 expand/collapse engine cards and status dots (per D-08)"
  - "SitemapForm with master toggle, 4 content type toggles, auto-regeneration toggle (per SITM-03)"
  - "DB-aware sitemap.ts reading settings with try/catch static fallback"
  - "Verification settings page at /admin/settings/seo/verification"
  - "Sitemap settings page at /admin/settings/seo/sitemaps"
affects: [10-04, seo-verification-page, seo-sitemaps-page, dynamic-sitemap]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Expand/collapse card pattern with status dots for verification engines", "DB-aware route handler with try/catch fallback to static behavior", "Auto-regeneration via revalidate export control"]

key-files:
  created:
    - src/components/admin/seo/VerificationForm.tsx
    - src/components/admin/seo/SitemapForm.tsx
  modified:
    - src/app/(admin)/admin/settings/seo/verification/page.tsx
    - src/app/(admin)/admin/settings/seo/sitemaps/page.tsx
    - src/app/sitemap.ts

key-decisions:
  - "VerificationForm uses expand/collapse per engine with status dots (green checkmark/gray circle) per D-08"
  - "SitemapForm groups toggles into 4 ComponentCards: master config, content types, regeneration settings, status"
  - "sitemap.ts reads DB with try/catch fallback -- static behavior preserved when no DB rows exist"
  - "Auto-regeneration controlled via revalidate export (0 when ON, 3600 when OFF) per SITM-03"
  - "Exclude patterns use simple string matching (startsWith) to prevent regex injection per T-10-06"

patterns-established:
  - "Expand/collapse card pattern: button header with status dot + chevron, conditional expanded content with input + meta tag ref + copy button"
  - "DB-aware route handler pattern: try/catch DB read at function top, fallback to static defaults on failure"
  - "Settings-driven revalidation: export const revalidate controlled by DB setting value"

requirements-completed: [VERF-01, VERF-02, VERF-03, VERF-04, VERF-05, SITM-01, SITM-02, SITM-03, SITM-04, SITM-05]

# Metrics
duration: 4min
completed: 2026-05-20
---

# Phase 10 Plan 03: Verification & Sitemap Management Summary

**Search verification with 5 expandable engine cards showing status dots (per D-08), plus sitemap management with 4 content type toggles, auto-regeneration toggle (per SITM-03), and DB-aware sitemap.ts with static fallback**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-20T14:03:25Z
- **Completed:** 2026-05-20T14:07:21Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Created VerificationForm with 5 search engine expand/collapse cards showing green checkmark dots for configured engines, gray dots for unconfigured, with copy-to-clipboard buttons and meta tag references
- Created SitemapForm with master enable toggle, 4 content type toggles, auto-regeneration toggle with hint text, exclude patterns textarea, frequency selector, and manual regeneration button
- Enhanced sitemap.ts to read DB settings with try/catch fallback, conditionally include/exclude content types, filter by exclude patterns, and control caching via auto-regeneration setting
- Replaced both verification and sitemap placeholder pages with real server component pages loading data via getSeoSettings

## Task Commits

Each task was committed atomically:

1. **Task 1: Create VerificationForm with expand/collapse cards and update verification page** - `8a21fb4` (feat)
2. **Task 2: Create SitemapForm with auto-regeneration toggle, update sitemap page and sitemap.ts** - `c4b2b16` (feat)

## Files Created/Modified

- `src/components/admin/seo/VerificationForm.tsx` - 5 expandable engine cards with status dots, input fields, meta tag references, copy buttons, per D-08 spec
- `src/components/admin/seo/SitemapForm.tsx` - Sitemap config form with master toggle, content types, auto-regeneration, excludes, frequency, status card
- `src/app/(admin)/admin/settings/seo/verification/page.tsx` - Server component replacing placeholder, loads data via getSeoSettings
- `src/app/(admin)/admin/settings/seo/sitemaps/page.tsx` - Server component replacing placeholder, loads data via getSeoSettings
- `src/app/sitemap.ts` - Enhanced with DB settings read, conditional content type inclusion, exclude pattern filtering, auto-regeneration caching control

## Decisions Made

- VerificationForm uses a Set<string> for expandedEngines state tracking which cards are open
- Copy-to-clipboard uses navigator.clipboard.writeText with 2-second "Copied!" feedback
- SitemapForm groups settings into 4 ComponentCards for logical separation
- sitemap.ts module-level revalidateSeconds variable set before export to control caching behavior
- Exclude patterns parsed by newlines, filtered with simple string startsWith matching (prevents regex injection per T-10-06)
- Landing pages toggle present but no dynamic generation yet (placeholder for future data source)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- VerificationForm ready for Plan 04 to reference pattern (expand/collapse cards, status dots)
- SitemapForm fully functional with auto-regeneration controlling sitemap.ts caching behavior
- sitemap.ts DB integration complete; Plan 04 (Robots.txt) follows same DB-aware route handler pattern
- All verification keys and sitemap keys integrated with admin-seo.ts server actions

---
*Phase: 10-core-seo*
*Completed: 2026-05-20*

## Self-Check: PASSED

- FOUND: src/components/admin/seo/VerificationForm.tsx
- FOUND: src/components/admin/seo/SitemapForm.tsx
- FOUND: src/app/(admin)/admin/settings/seo/verification/page.tsx
- FOUND: src/app/(admin)/admin/settings/seo/sitemaps/page.tsx
- FOUND: src/app/sitemap.ts
- FOUND: commit 8a21fb4 (Task 1)
- FOUND: commit c4b2b16 (Task 2)
