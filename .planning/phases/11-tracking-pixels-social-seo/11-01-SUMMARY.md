---
phase: 11-tracking-pixels-social-seo
plan: 01
subsystem: tracking-pixels
tags: [foundation, tracking, seo-overview, tiktok, server-actions]
dependency_graph:
  requires: []
  provides: [tracking-keys-registry, admin-tracking-v2-actions, seo-overview-cards, tracking-scripts-integration]
  affects: [seo-overview-page, locale-layout, tracking-scripts, tracking-reader]
tech_stack:
  added: [tracking-keys.ts, admin-tracking-v2.ts, SeoOverviewCards.tsx]
  patterns: [key-registry-with-slice-groups, server-actions-with-requireAdmin, ga4-service-account-jwt]
key_files:
  created:
    - src/lib/tracking-keys.ts
    - src/app/(admin)/actions/admin-tracking-v2.ts
    - src/components/admin/seo/SeoOverviewCards.tsx
  modified:
    - src/app/(admin)/admin/settings/seo/page.tsx
    - src/components/layout/TrackingScripts.tsx
    - src/lib/tracking.ts
    - src/app/[locale]/layout.tsx
    - src/components/admin/TrackingSettingsForm.tsx
  deleted:
    - src/app/(admin)/actions/admin-tracking.ts
decisions:
  - "30 tracking keys organized into 5 slice groups matching SEO sub-sections"
  - "GA4 summary uses service account JWT with Web Crypto API for edge runtime compatibility"
  - "Meta test event sends Purchase event to Graph API v21.0 with BDT currency"
  - "SEO overview replaced with card grid -- 9 cards with completion status dots"
  - "TrackingScripts integrated into locale layout with production-only guard"
metrics:
  duration: 7min
  completed: "2026-05-21"
  tasks: 3
  files: 8
---

# Phase 11 Plan 01: Tracking Foundation & SEO Overview Redesign Summary

Tracking key registry with 30 keys across 5 slice groups, server actions with GA4/Meta API integration, SEO overview card grid, TrackingScripts with TikTok pixel wired into locale layout, and migration cleanup of old admin-tracking.ts.

## Tasks Completed

### Task 1: Create tracking-keys.ts and admin-tracking-v2.ts server actions
- **Commit:** 9e15dd9
- **Files:** `src/lib/tracking-keys.ts`, `src/app/(admin)/actions/admin-tracking-v2.ts`
- tracking-keys.ts exports TRACKING_KEYS (30 keys) with 5 slice groups: SOCIAL_KEYS, META_PIXEL_KEYS, TIKTOK_KEYS, GOOGLE_KEYS, SCHEMA_KEYS
- admin-tracking-v2.ts exports getTrackingSettings, saveTrackingSettings, sendMetaTestEvent, getGa4Summary
- GA4 summary uses service account JWT authentication with 5-minute module-level cache
- Meta test event sends Purchase event to Graph API v21.0
- All keys validated against TRACKING_KEYS before DB write

### Task 2: Redesign SEO overview page with SeoOverviewCards + integrate TrackingScripts into layout
- **Commit:** abf18fc
- **Files:** `src/components/admin/seo/SeoOverviewCards.tsx`, `src/app/(admin)/admin/settings/seo/page.tsx`, `src/components/layout/TrackingScripts.tsx`, `src/lib/tracking.ts`, `src/app/[locale]/layout.tsx`
- SeoOverviewCards renders 9-card responsive grid (3/2/1 columns) with completion status dots
- SEO overview page loads both tracking and SEO settings, passes combined data to cards
- TrackingScripts extended with TikTok pixel (ttq.load + ttq.page)
- tracking.ts expanded to use all 30 TRACKING_KEYS from registry
- TrackingScripts integrated into [locale]/layout.tsx with production guard, settings read server-side

### Task 3: Delete old admin-tracking.ts references and clean up imports
- **Commit:** d59a0a9
- **Files:** `src/app/(admin)/actions/admin-tracking.ts` (deleted), `src/components/admin/TrackingSettingsForm.tsx`
- Old admin-tracking.ts deleted
- TrackingSettingsForm import migrated to admin-tracking-v2 with TrackingSettingsData type
- Zero remaining references to old admin-tracking.ts in codebase

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- All 8 created/modified files exist on disk
- Deleted file admin-tracking.ts confirmed absent
- All 3 commits (9e15dd9, abf18fc, d59a0a9) found in git log
