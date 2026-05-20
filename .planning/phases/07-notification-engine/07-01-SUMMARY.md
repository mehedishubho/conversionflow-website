---
phase: 07-notification-engine
plan: 01
subsystem: infra
tags: [notifications, bullmq, drizzle, postgres, event-catalog]

# Dependency graph
requires:
  - phase: 06-webhooks-jobs
    provides: BullMQ queue infrastructure, Redis connection, worker pattern
  - phase: 01-foundation
    provides: Database schema, Drizzle ORM, notifications table
provides:
  - notification_log and notification_preferences DB tables with indexes
  - EVENT_CATALOG with 14 typed notification events across 4 categories
  - Central sendNotification() service with channel routing and preference checking
  - In-app channel adapter writing to existing notifications table
  - WhatsApp channel adapter with BullMQ async queuing
  - Notification preference lookup with opt-in-by-default
  - BullMQ notification worker registered in jobs infrastructure
affects: [07-02, 07-03, 07-04, 07-05]

# Tech tracking
tech-stack:
  added: []
  patterns: [event-catalog-pattern, channel-adapter-pattern, per-channel-error-isolation]

key-files:
  created:
    - src/lib/notifications/types.ts
    - src/lib/notifications/channels/in-app.ts
    - src/lib/notifications/channels/whatsapp.ts
    - src/lib/notifications/preferences.ts
    - src/lib/notifications.ts
    - src/jobs/workers/notification.ts
  modified:
    - src/lib/db/schema.ts
    - src/jobs/start.ts

key-decisions:
  - "Email channel logged as 'queued' placeholder until Plan 02 wires the adapter"
  - "Event catalog uses template functions for title/message to support dynamic data"
  - "Preferences default to true (opt-in) for all channels when no DB rows exist"

patterns-established:
  - "Event catalog pattern: Record<NotificationEvent, EventConfig> as single source of truth for all notification metadata"
  - "Channel adapter pattern: each channel is an independent module imported by central sendNotification()"
  - "Per-channel error isolation: try/catch per channel, one failure does not prevent other channels from sending"

requirements-completed: [NOTIF-01, NOTIF-05]

# Metrics
duration: 4min
completed: 2026-05-20
---

# Phase 07 Plan 01: Notification Engine Foundation Summary

**Typed event catalog with 14 events, central sendNotification() dispatcher routing to in-app/WhatsApp channels via BullMQ, and notification_log/preferences tables for delivery tracking**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-20T04:25:13Z
- **Completed:** 2026-05-20T04:29:13Z
- **Tasks:** 1
- **Files modified:** 8

## Accomplishments
- notification_log and notification_preferences tables added to Drizzle schema with proper indexes, unique constraints, and relations
- EVENT_CATALOG defines all 14 notification events (4 order, 4 license, 4 ticket, 2 system) with category, default channels, and template functions
- Central sendNotification() validates events against catalog, checks user preferences, dispatches to channel adapters with per-channel error isolation, and logs every attempt
- BullMQ notification queue (already in queues.ts) now has a dedicated worker following the license-sync pattern

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema tables + Event catalog + Channel adapters + Central service** - `3a0a9e1` (feat)

## Files Created/Modified
- `src/lib/db/schema.ts` - Added notificationLog and notificationPreferences tables with indexes, relations, and userRelations updates
- `src/lib/notifications/types.ts` - NotificationEvent union type (14 events), NotificationCategory, NotificationChannel, EventConfig interface, EVENT_CATALOG constant
- `src/lib/notifications/channels/in-app.ts` - In-app channel adapter inserting into existing notifications table
- `src/lib/notifications/channels/whatsapp.ts` - WhatsApp channel adapter queuing via BullMQ with graceful Redis degradation
- `src/lib/notifications/preferences.ts` - Preference lookup with opt-in-by-default for new users
- `src/lib/notifications.ts` - Central sendNotification() dispatcher with preference checking, channel routing, and per-channel logging
- `src/jobs/workers/notification.ts` - BullMQ notification worker with concurrency 5, rate limiter, graceful degradation
- `src/jobs/start.ts` - Registers and starts notification worker alongside license sync

## Decisions Made
- Email channel placeholder: logged as "queued" with a comment marking it for Plan 02 wiring (avoids silent drops)
- Template functions in EVENT_CATALOG accept `Record<string, unknown>` and use nullish coalescing for missing data fields (robust against partial data)
- Notification worker processes "whatsapp-send" job names; actual WhatsApp API delivery is manual per D-03 research

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Build fails at page data collection due to missing DATABASE_URL env var in worktree (pre-existing, not related to changes). TypeScript compilation (`tsc --noEmit`) passes cleanly with zero errors.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Notification engine core is ready for Plan 02 (email channel adapter with Nodemailer/SMTP)
- sendNotification() is importable from `@/lib/notifications` for trigger point integration in Plans 03-04
- notificationQueue and notificationWorker are registered but only active when Redis is available

---
*Phase: 07-notification-engine*
*Completed: 2026-05-20*

## Self-Check: PASSED

All 9 files verified present. Commit 3a0a9e1 verified in git log.
