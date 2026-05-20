---
phase: 11-tracking-pixels-social-seo
plan: 05
subsystem: admin-seo
tags: [empty-state, event-log, shared-components, migration-cleanup, tracking]

# Dependency graph
requires:
  - phase: 11-02
    provides: "MetaPixelForm with inline event log and empty state banner"
  - phase: 11-03
    provides: "TikTokForm and GoogleTrackingForm with inline event log and empty state banner"
  - phase: 11-04
    provides: "SchemaForm completing all Phase 11 form pages"
provides:
  - "Reusable EmptyStateWarning component with scroll-to-field CTA"
  - "Shared EventLogPanel with window-based custom event system (logTrackingEvent)"
  - "Zero references to deprecated TrackingSettingsForm"
affects: [tracking-forms, admin-seo, event-logging]

# Tech tracking
tech-stack:
  added: [EmptyStateWarning.tsx, EventLogPanel.tsx]
  patterns: "window-based-custom-event-system, shared-empty-state-banner, platform-filtered-event-log"

key-files:
  created:
    - src/components/admin/seo/EmptyStateWarning.tsx
    - src/components/admin/seo/EventLogPanel.tsx
  modified:
    - src/components/admin/seo/MetaPixelForm.tsx
    - src/components/admin/seo/TikTokForm.tsx
    - src/components/admin/seo/GoogleTrackingForm.tsx
  deleted:
    - src/components/admin/TrackingSettingsForm.tsx

key-decisions:
  - "EventLogPanel uses window.__cf_tracking_events buffer + cf-tracking-event custom event for cross-component event sharing"
  - "EmptyStateWarning uses button with scrollIntoView instead of anchor link for more reliable scroll behavior"
  - "EventLogPanel filters events by platform prop so each page shows only its relevant events"
  - "logTrackingEvent exported as standalone function callable from any client component"

patterns-established:
  - "Shared warning banner: EmptyStateWarning with platformName, targetId, isConfigured props"
  - "Window-based event buffer: module-level array on window with CustomEvent dispatch for reactivity"

requirements-completed: [D-08, D-11]

# Metrics
duration: 6min
completed: 2026-05-21
---

# Phase 11 Plan 05: Migration Cleanup & Empty States Summary

**Extracted shared EmptyStateWarning (amber banner with scroll-to-field) and EventLogPanel (window-based custom event system) components, replaced inline implementations across 3 tracking forms, and deleted deprecated TrackingSettingsForm**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-20T19:46:05Z
- **Completed:** 2026-05-20T19:52:21Z
- **Tasks:** 2
- **Files modified:** 6 (4 created/modified, 1 deleted)

## Accomplishments

### Task 1: EmptyStateWarning shared component

- Created reusable `EmptyStateWarning` component with amber warning banner, AlertTriangle icon, and "Configure Now" button that scrolls to the target input field
- Replaced inline empty state banners in MetaPixelForm, TikTokForm, and GoogleTrackingForm with `<EmptyStateWarning>` usage
- Updated input wrapper IDs to match scroll targets: `meta-pixel-id`, `tiktok-pixel-id`, `google-analytics-id`

### Task 2: EventLogPanel shared component + deprecated file deletion

- Created `EventLogPanel` with window-based custom event system: `window.__cf_tracking_events` buffer + `cf-tracking-event` CustomEvent dispatch
- Exported `logTrackingEvent` function for cross-component event logging with FIFO buffer capped at 50 events
- Replaced inline event log sections (LogEntry type, eventBuffer, pushEvent, state variables, JSX) in all 3 tracking forms
- EventLogPanel filters events by `platform` prop so each page shows only its relevant events
- Added help text: "Session-scoped diagnostics. Events are not persisted and will be lost on page refresh."
- Deleted deprecated `TrackingSettingsForm.tsx` with zero remaining references confirmed

## Task Commits

Each task was committed atomically:

1. **Task 1: EmptyStateWarning shared component** - `fb0a818` (feat)
2. **Task 2: EventLogPanel + TrackingSettingsForm deletion** - `2c628bf` (feat)

## Files Created/Modified

- `src/components/admin/seo/EmptyStateWarning.tsx` - Reusable amber warning banner with scroll-to-field CTA (D-11)
- `src/components/admin/seo/EventLogPanel.tsx` - Shared session-scoped event log with window-based custom event system (D-08)
- `src/components/admin/seo/MetaPixelForm.tsx` - Replaced inline empty state + event log with shared components
- `src/components/admin/seo/TikTokForm.tsx` - Replaced inline empty state + event log with shared components
- `src/components/admin/seo/GoogleTrackingForm.tsx` - Replaced inline empty state + event log with shared components
- `src/components/admin/TrackingSettingsForm.tsx` - Deleted (deprecated, zero references)

## Decisions Made

- EventLogPanel uses `window.__cf_tracking_events` as shared buffer with `CustomEvent` dispatch pattern rather than React context, because tracking events can originate from non-React code (TrackingScripts) and the buffer needs to persist across component re-mounts
- EmptyStateWarning uses `button` with `scrollIntoView` instead of `<a href="#id">` for more reliable cross-browser smooth scrolling
- EventLogPanel filters by `platform` prop rather than showing all events, keeping each tracking page focused on its own events
- `logTrackingEvent` is a standalone exported function (not a hook) so it can be called from any client component without wrapping in a provider

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All Phase 11 plans (01-05) are complete
- D-05 migration complete: TrackingSettingsForm deleted, zero references to deprecated files
- D-08 (event logging) and D-11 (empty state warnings) fully implemented as shared components
- All 3 tracking pages use consistent EmptyStateWarning and EventLogPanel components
- Phase 11 is complete and ready for verification/transition

---
*Phase: 11-tracking-pixels-social-seo*
*Completed: 2026-05-21*

## Self-Check: PASSED

- All 5 created/modified files verified present on disk
- Deleted file TrackingSettingsForm.tsx confirmed absent
- Both task commits (fb0a818, 2c628bf) found in git log
- Zero grep results for "TrackingSettingsForm" in src/
- Zero grep results for "admin-tracking" (old import) in src/
- No build errors from any Task 1 or Task 2 files
