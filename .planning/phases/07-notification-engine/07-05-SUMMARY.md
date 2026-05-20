---
phase: 07-notification-engine
plan: 05
subsystem: ui
tags: [notifications, preferences, polling, matrix-ui, server-actions, drizzle]

# Dependency graph
requires:
  - phase: 07-01
    provides: notificationPreferences table, NOTIFICATION_CATEGORIES/NOTIFICATION_CHANNELS constants, preference lookup function
  - phase: 07-04
    provides: Admin notification context support in NotificationDropdown, admin notification actions
provides:
  - Per-category per-channel notification preferences matrix UI replacing simple toggle list
  - getUserNotificationPreferences and updateNotificationPreferences server actions with validation
  - 60-second polling in notification bell with useRef-based flicker prevention
  - New event type icons (order, ticket, system) in notification dropdown
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [preference-matrix-pattern, polling-with-flicker-prevention, upsert-preference-pattern]

key-files:
  created: []
  modified:
    - src/components/portal/NotificationPreferences.tsx
    - src/app/(portal)/actions/account.ts
    - src/components/header/NotificationDropdown.tsx

key-decisions:
  - "getNotificationIcon uses baseType = type.split('.')[0] to match both bare and dotted event type strings"
  - "updateNotificationPreferences uses validate-then-upsert pattern with per-row existence check"
  - "Polling compares notification IDs via JSON.stringify to detect actual data changes before setState"

patterns-established:
  - "Preference matrix pattern: table with category rows x channel columns, each cell a toggle switch wired to server actions"
  - "Polling flicker prevention: useRef tracks previous data, compare IDs before setState to avoid unnecessary re-renders"
  - "Upsert preference pattern: SELECT to check existence, then UPDATE or INSERT based on result"

requirements-completed: [NOTIF-07, NOTIF-03]

# Metrics
duration: 6min
completed: 2026-05-20
---

# Phase 07 Plan 05: User Notification Preferences and Polling Summary

**Per-category per-channel preference matrix with DB-backed server actions, 60-second notification bell polling with flicker prevention, and event catalog icon routing**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-20T05:22:17Z
- **Completed:** 2026-05-20T05:28:14Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments
- NotificationPreferences.tsx rewritten from simple toggle list to per-category x per-channel matrix table with 4 categories (Orders, Licenses, Support, System) and 3 channels (Email, In-App, WhatsApp)
- Server actions getUserNotificationPreferences and updateNotificationPreferences added to account.ts with catalog validation (T-07-14) and session-based user scoping (T-07-13)
- Notification bell polls every 60 seconds using setInterval with cleanup, and useRef-based comparison prevents UI flicker when data hasn't changed
- getNotificationIcon now routes by base type (e.g., "order.created" matches "order") with new ShoppingCart and Globe icons for order and system events

## Task Commits

Each task was committed atomically:

1. **Task 1: Preference matrix + polling + server actions** - `2610fae` (feat)

## Files Created/Modified
- `src/app/(portal)/actions/account.ts` - Added getUserNotificationPreferences (queries notificationPreferences table, builds full matrix with defaults) and updateNotificationPreferences (validates against catalogs, upserts rows)
- `src/components/portal/NotificationPreferences.tsx` - Replaced simple toggle list with category x channel matrix table, loads from server action on mount, saves flattened array back
- `src/components/header/NotificationDropdown.tsx` - Added useRef import and refs for prevData/prevCount, added 60s polling interval with cleanup, added base type matching in getNotificationIcon with ShoppingCart/Globe icons for order/system events

## Decisions Made
- Base type matching in getNotificationIcon: `type.split(".")[0]` handles both legacy bare types ("license", "billing") and new dotted types ("order.created", "ticket.reply_received") without breaking existing behavior
- Upsert pattern for preferences: SELECT first to check existence, then UPDATE or INSERT. This avoids relying on ON CONFLICT which may not be available across all Drizzle configurations
- Flicker prevention uses JSON.stringify of notification ID arrays rather than deep comparison, which is fast enough for typical notification counts (under 50)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Build fails at page data collection due to missing DATABASE_URL env var in worktree (pre-existing, documented in prior plan summaries). TypeScript compilation passes cleanly with zero errors in all modified files.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- User notification preferences fully wired with DB storage and matrix UI
- Notification bell polls every 60 seconds for near-real-time updates
- All 5 notification engine plans (01-05) are complete

---
*Phase: 07-notification-engine*
*Completed: 2026-05-20*

## Self-Check: PASSED

All 3 files verified present. Commit 2610fae verified in git log.
