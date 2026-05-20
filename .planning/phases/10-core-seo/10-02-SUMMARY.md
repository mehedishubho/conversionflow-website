---
phase: 10-core-seo
plan: 02
subsystem: seo
tags: [seo, serp-preview, seo-score, general-settings, url-formatting, character-counters]

# Dependency graph
requires:
  - phase: 10-core-seo
    plan: 01
    provides: "admin-seo.ts server actions, GENERAL_SEO_KEYS, getSeoScore, saveSeoSettings"
provides:
  - "GeneralSeoForm component with 10 General SEO fields including URL formatting toggles"
  - "SerpPreview Google-style SERP preview component"
  - "SeoScore progress bar component with color thresholds"
  - "General SEO settings page at /admin/settings/seo/general"
affects: [10-03, 10-04, seo-general-page]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Character count badges with color coding for meta title/description", "SEO score progress bar with red/yellow/green thresholds"]

key-files:
  created:
    - src/components/admin/seo/SerpPreview.tsx
    - src/components/admin/seo/SeoScore.tsx
    - src/components/admin/seo/GeneralSeoForm.tsx
  modified:
    - src/app/(admin)/admin/settings/seo/general/page.tsx

key-decisions:
  - "SerpPreview uses Google-only snippet per D-02 (blue title, green URL, gray description)"
  - "SeoScore reads all 25 SEO keys via getSeoScore for overall completeness metric per D-06"
  - "Character count badges use optimal/acceptable/too-long color coding (green/yellow/red)"
  - "URL formatting toggles (lowercase URLs, trailing slash) in separate URL & Auto Settings card per GSEO-03"

patterns-established:
  - "SEO form section pattern: ComponentCard wrappers for logical grouping (score, SERP, fields, toggles)"
  - "Character counter pattern: inline badge next to label with charBadgeColor helper function"

requirements-completed: [GSEO-01, GSEO-02, GSEO-03, GSEO-04, GSEO-05, GSEO-06, GSEO-07]

# Metrics
duration: 3min
completed: 2026-05-20
---

# Phase 10 Plan 02: General SEO Settings Page Summary

**General SEO settings page with full form (10 fields), Google SERP preview with character counters, SEO completeness score, and URL formatting toggles (lowercase URLs, trailing slash)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-20T13:57:28Z
- **Completed:** 2026-05-20T14:00:44Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created SerpPreview component with Google-style preview (blue title, green URL, gray description) and truncation at 60/160 chars
- Created SeoScore component with progress bar using red (<50%), yellow (50-79%), green (>=80%) thresholds
- Created GeneralSeoForm with all 10 General SEO settings fields, character count badges for meta title and description, SERP preview integration, SEO score display, and 3 toggle switches
- Replaced placeholder General SEO page with server component that loads settings from DB via getSeoSettings

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SerpPreview, SeoScore, and GeneralSeoForm components** - `42acffd` (feat)
2. **Task 2: Replace General SEO placeholder page** - `74e19f6` (feat)

## Files Created/Modified

- `src/components/admin/seo/SerpPreview.tsx` - Google-style SERP preview with favicon placeholder, truncated title/description, configurable URL
- `src/components/admin/seo/SeoScore.tsx` - Progress bar component with filled/total/percentage props and color-coded thresholds
- `src/components/admin/seo/GeneralSeoForm.tsx` - Full General SEO form with 10 fields, character counters, SERP preview, SEO score, URL toggles; saves via saveSeoSettings server action
- `src/app/(admin)/admin/settings/seo/general/page.tsx` - Server component page replacing Phase 9 placeholder; loads data via getSeoSettings and renders GeneralSeoForm

## Decisions Made

- SERP preview uses Google-only snippet per D-02 -- no mobile/news/tab variants
- SEO score reads all 25 keys via getSeoScore for cross-sub-section completeness metric per D-06
- Character count badge uses charBadgeColor helper with optimal (green), acceptable (yellow), too-long/short (red) ranges
- URL formatting toggles placed in separate "URL & Auto Settings" ComponentCard per GSEO-03
- Meta description uses plain HTML textarea styled to match InputField appearance (multi-line input needed)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- GeneralSeoForm ready for Plans 03-04 to reference pattern (component card grouping, toggle handling)
- SERP preview and SEO score components reusable in other SEO sub-sections
- admin-seo.ts server actions fully integrated with all form save/score operations

---
*Phase: 10-core-seo*
*Completed: 2026-05-20*

## Self-Check: PASSED

- FOUND: src/components/admin/seo/SerpPreview.tsx
- FOUND: src/components/admin/seo/SeoScore.tsx
- FOUND: src/components/admin/seo/GeneralSeoForm.tsx
- FOUND: src/app/(admin)/admin/settings/seo/general/page.tsx
- FOUND: commit 42acffd (Task 1)
- FOUND: commit 74e19f6 (Task 2)
