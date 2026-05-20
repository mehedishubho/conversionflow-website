---
phase: 11-tracking-pixels-social-seo
plan: 02
subsystem: tracking-pixels
tags: [social, open-graph, meta-pixel, conversions-api, facebook, twitter, linkedin, advanced-matching, event-tracking]

# Dependency graph
requires:
  - phase: 11-01
    provides: [tracking-keys-registry, admin-tracking-v2-actions, SOCIAL_KEYS, META_PIXEL_KEYS]
provides:
  - social-preview-simulator-with-mobile-desktop-toggle
  - social-form-with-7-fields-and-reactive-preview
  - meta-pixel-form-with-full-capi-management
  - advanced-matching-toggle-with-field-selection
  - standard-event-checkboxes-with-select-all
  - connection-status-testing-via-graph-api
  - session-scoped-event-log-panel
  - empty-state-warning-banners
affects: [seo-overview-page, tracking-scripts, locale-layout]

# Tech tracking
tech-stack:
  added: [SocialPreviewSimulator.tsx, SocialForm.tsx, MetaPixelForm.tsx]
  patterns: [reactive-preview-from-controlled-inputs, side-by-side-social-cards, session-event-buffer]

key-files:
  created:
    - src/components/admin/seo/SocialPreviewSimulator.tsx
    - src/components/admin/seo/SocialForm.tsx
    - src/components/admin/seo/MetaPixelForm.tsx
  modified:
    - src/app/(admin)/admin/settings/seo/social/page.tsx
    - src/app/(admin)/admin/settings/seo/meta-pixel/page.tsx

key-decisions:
  - "Social preview uses 3 separate card components (Facebook, Twitter, LinkedIn) rendered side-by-side in responsive grid"
  - "Mobile/desktop toggle controls card max-width and font sizing for realistic preview"
  - "Graph API token stored as transient field (_graph_api_token) not persisted to settings DB"
  - "Event log uses module-level array buffer (last 50 entries) -- session-scoped, not persisted"

patterns-established:
  - "SocialPreviewSimulator pattern: side-by-side platform cards with mobile/desktop toggle"
  - "Meta pixel form pattern: empty state warning banner + connection status + event log panel"
  - "JSON field handling: parseJsonSetting helper for events/matching_fields stored as JSON strings"

requirements-completed: [SOCL-01, SOCL-02, SOCL-03, SOCL-04, SOCL-05, META-01, META-02, META-03, META-04, META-05, META-06]

# Metrics
duration: 4min
completed: 2026-05-21
---

# Phase 11 Plan 02: Open Graph & Social + Meta Pixel & CAPI Summary

**Social/OG page with 3-platform side-by-side preview simulator (Facebook, Twitter/X, LinkedIn) and Meta Pixel & CAPI management with full event tracking, advanced matching, connection testing, and session-scoped event log**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-20T19:19:42Z
- **Completed:** 2026-05-20T19:24:10Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Built SocialPreviewSimulator with realistic Facebook, Twitter/X, LinkedIn share card previews, mobile/desktop toggle, and actual image loading with placeholder fallbacks
- Created SocialForm with 7 social fields (FB App ID, share title/desc/image, Twitter handle/card type, LinkedIn image) with reactive preview that updates as fields change
- Built MetaPixelForm with full CAPI management: pixel ID, CAPI token, dataset ID, test event code, Graph API token, advanced matching with field checkboxes, 6 standard event checkboxes with select all/deselect all, event deduplication toggle, Send Test Event button, live connection status testing, and session-scoped event log panel
- Implemented empty state warning banner per D-11 when pixel ID is not configured
- Both server pages load initial data via getTrackingSettings with proper key slices

## Task Commits

Each task was committed atomically:

1. **Task 1: Social/OG settings page with SocialPreviewSimulator** - `00638e1` (feat)
2. **Task 2: Meta Pixel & CAPI management page** - `1cd43ef` (feat)

## Files Created/Modified
- `src/components/admin/seo/SocialPreviewSimulator.tsx` - Side-by-side social share preview cards (Facebook, Twitter/X, LinkedIn) with mobile/desktop toggle and image loading
- `src/components/admin/seo/SocialForm.tsx` - Social OG settings form with 7 fields and reactive preview
- `src/components/admin/seo/MetaPixelForm.tsx` - Full CAPI management form with pixel config, advanced matching, event tracking, connection status, event log
- `src/app/(admin)/admin/settings/seo/social/page.tsx` - Server page replacing placeholder, loads SOCIAL_KEYS data
- `src/app/(admin)/admin/settings/seo/meta-pixel/page.tsx` - Server page replacing placeholder, loads META_PIXEL_KEYS data

## Decisions Made
- Social preview uses 3 separate card sub-components (FacebookPreviewCard, TwitterPreviewCard, LinkedInPreviewCard) rendered in a responsive grid (3 cols on lg, 1 on mobile)
- Twitter card type toggle changes preview between large landscape image (summary_large_image) and compact thumbnail layout (summary)
- Graph API token stored as transient _graph_api_token field in component state -- not persisted to settings DB since it is only for admin connection testing
- Event log uses module-level array buffer capped at 50 entries -- session-scoped, not persisted to database
- LinkedIn image override falls back to default share image when not provided

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing build errors in blog module (missing @/components/ui/avatar) and platform-comparison page (platformPricing export) are unrelated to this plan. All Task 1 and Task 2 files pass TypeScript compilation cleanly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Social/OG and Meta Pixel pages are fully functional and ready for admin use
- Plan 11-03 (TikTok) can follow the same MetaPixelForm pattern for TikTok pixel + Events API + Advanced Matching
- Plan 11-04 (Google) can use the GA4 summary action already created in admin-tracking-v2.ts
- Event log panel in MetaPixelForm is self-contained; Plan 11-05 may extract it to a shared EventLogPanel component

---
*Phase: 11-tracking-pixels-social-seo*
*Completed: 2026-05-21*

## Self-Check: PASSED

- All 5 created/modified files verified present on disk
- Both task commits (00638e1, 1cd43ef) found in git log
- TypeScript compilation passes for all Task 1 and Task 2 files
