---
phase: 11-tracking-pixels-social-seo
plan: 03
subsystem: admin-seo
tags: [tiktok, google-analytics, gtg, google-ads, tracking, admin-forms]

requires:
  - phase: 11-01
    provides: "tracking-keys.ts (TIKTOK_KEYS, GOOGLE_KEYS), admin-tracking-v2.ts (getTrackingSettings, saveTrackingSettings, getGa4Summary)"
provides:
  - "TikTokForm component with pixel config, advanced matching, event selection, connection tester"
  - "GoogleTrackingForm component with GA4, GTM, Google Ads, GA summary cards, connection tester"
  - "Server pages for /admin/settings/seo/tiktok and /admin/settings/seo/google"
affects: [tracking-pixels, admin-seo, seo-overview]

tech-stack:
  added: []
  patterns: "client-form-with-server-initialData, ga4-summary-cards-with-fallback, gtm-toggle-derived-from-id"

key-files:
  created:
    - src/components/admin/seo/TikTokForm.tsx
    - src/components/admin/seo/GoogleTrackingForm.tsx
  modified:
    - src/app/(admin)/admin/settings/seo/tiktok/page.tsx
    - src/app/(admin)/admin/settings/seo/google/page.tsx

key-decisions:
  - "TikTok connection tester uses pixel ID format validation (starts with C, alphanumeric) plus Events API health check POST"
  - "GTM enable/disable implemented as toggle that sets/clears container ID -- no separate enable key needed per D-12"
  - "GA summary cards show graceful fallback with env var instructions when GA4_PROPERTY_ID not configured"
  - "TikTok advanced matching uses 5 fields (email, phone, name, city, country) per D-04"

patterns-established:
  - "GA summary cards: metric cards in responsive grid with loading state, fallback when API unavailable"
  - "GTM toggle pattern: Switch toggles visibility of container ID field; clearing ID effectively disables GTM"

requirements-completed: [TIKT-01, TIKT-02, TIKT-03, GOOG-01, GOOG-02, GOOG-03, GOOG-04, GOOG-05]

duration: 4min
completed: 2026-05-21
---

# Phase 11 Plan 03: TikTok + Google Analytics & Ads Summary

**TikTok and Google tracking admin pages with pixel config, advanced matching, GA summary cards, and connection testers**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-21T19:27:02Z
- **Completed:** 2026-05-21T19:31:02Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

### Task 1: TikTok tracking page

- Created `TikTokForm.tsx` client component with full TikTok tracking configuration
- Pixel ID and Events API token inputs with connection tester
- Advanced matching toggle with 5 field checkboxes (email, phone, name, city, country)
- Standard event checkboxes (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Lead) with select/deselect all
- Server-side tracking toggle for Events API
- Empty state warning banner when pixel ID not configured
- Connection status indicator with pixel ID format validation and Events API health check
- Session-scoped event log panel
- Server page fetches TIKTOK_KEYS data and passes to form

### Task 2: Google Analytics & Ads page

- Created `GoogleTrackingForm.tsx` client component with full Google tracking configuration
- GA summary cards (Active Users, Pageviews, Sessions, Top Pages) via `getGa4Summary` server action
- Graceful fallback when GA4 env vars not configured (shows setup instructions)
- GA4 Measurement ID with connection tester (format validation)
- GTM Container ID with enable/disable toggle (D-12: toggle sets/clears ID)
- Google Ads Conversion ID and Label fields
- Server-side tracking and enhanced ecommerce toggles
- Empty state warning banner when GA4 ID not configured
- Session-scoped event log panel
- Server page fetches GOOGLE_KEYS data and passes to form

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

| Stub | File | Description |
|------|------|-------------|
| GA summary fallback | GoogleTrackingForm.tsx | When GA4 env vars not set, shows "--" values and env var instructions. Will resolve when operator configures GA4 service account credentials. |

## Threat Flags

No new threat surfaces introduced. All forms use existing `requireAdmin()` server action guard. GA summary uses server-side service account auth only.

## Self-Check

Commit verification follows below.
