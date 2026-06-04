---
phase: 21-backup-restore
plan: 02
subsystem: infra
tags: [bullmq, backup, restore, maintenance, redis, cron, psql]

# Dependency graph
requires:
  - phase: 21-backup-restore/01
    provides: BackupService, BackupRotation, backups table schema
provides:
  - BullMQ backup worker with configurable cron scheduling
  - RestoreOrchestrator with multi-step restore and auto-rollback
  - Maintenance mode guard in proxy.ts
  - Maintenance page for end users
affects: [21-backup-restore/03, admin-backup-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: [bullmq-repeatable-cron, multi-step-restore-state-machine, maintenance-mode-proxy-guard]

key-files:
  created:
    - src/jobs/workers/backup-worker.ts
    - src/lib/backup/RestoreOrchestrator.ts
    - src/app/(marketing)/maintenance/page.tsx
  modified:
    - src/jobs/queues.ts
    - src/lib/module-init.ts
    - src/proxy.ts

key-decisions:
  - "Used execFileAsync wrapper instead of execFileSync for restore operations to avoid blocking the event loop"
  - "Maintenance mode check placed after nonMarketingRoute computation but before auth checks in proxy.ts"
  - "Restore status stored in Redis with 10-minute TTL to auto-expire stale states"

patterns-established:
  - "BullMQ worker with dynamic cron rescheduling: reads interval from settings, removes old repeatable jobs before adding new one"
  - "Multi-step restore state machine: pre_backup -> maintenance -> dropping -> restoring -> verifying -> complete/failed"
  - "Pre-restore backup as mandatory safety net with auto-rollback on any failure"

requirements-completed: [D-05, D-06, D-07, D-08, D-09]

# Metrics
duration: 7min
completed: 2026-06-04
---

# Phase 21 Plan 02: Backup Worker & Restore System Summary

**BullMQ backup worker with configurable cron scheduling, RestoreOrchestrator with multi-step state machine and auto-rollback, maintenance mode guard in proxy.ts**

## Performance

- **Duration:** 7 min
- **Started:** 2026-06-04T14:08:58Z
- **Completed:** 2026-06-04T14:16:08Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- BullMQ backup queue and worker with configurable intervals (disabled/every_6_hours/daily/weekly/monthly)
- RestoreOrchestrator with 6-step state machine and mandatory pre-restore backup
- Auto-rollback on restore failure using pre-restore backup
- Maintenance mode guard in proxy.ts blocking non-admin routes during restore
- Maintenance page for end users at /maintenance

## Task Commits

Each task was committed atomically:

1. **Task 1: Add backup queue and create backup worker** - `7d9e337` (feat)
2. **Task 2: Build RestoreOrchestrator and add maintenance mode to proxy.ts** - `4e77344` (feat)

## Files Created/Modified
- `src/jobs/queues.ts` - Added BACKUP queue name and backupQueue export
- `src/jobs/workers/backup-worker.ts` - BullMQ worker with interval-to-cron mapping, scheduled backup processing, and retention enforcement
- `src/lib/module-init.ts` - Registered backup worker and job scheduler alongside subscription worker
- `src/lib/backup/RestoreOrchestrator.ts` - Multi-step restore orchestrator with pre-restore backup, connection termination, psql restore, verification, and auto-rollback
- `src/proxy.ts` - Added settings import and maintenance_mode guard that rewrites non-admin routes to /maintenance
- `src/app/(marketing)/maintenance/page.tsx` - Simple server-rendered maintenance page for end users

## Decisions Made
- Used async `execFile` via a promisified wrapper instead of `execFileSync` for all restore operations to avoid blocking the Node.js event loop during potentially long psql operations
- Placed maintenance mode check after `nonMarketingRoute` computation but before auth checks, so admin users can still access admin routes during maintenance while portal/auth users see the maintenance page
- Restore status stored in Redis with 10-minute TTL to auto-expire stale states if process crashes mid-restore

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Pre-existing build failures (9 errors from missing @tiptap/*, nodemailer, and portal analytics dependencies) are unrelated to this plan. No backup-related build errors introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Backup worker and restore orchestrator ready for Plan 03 (admin API routes)
- Plan 03 will expose backup/restore operations through admin-only server actions and API endpoints
- Maintenance mode can be tested once Plan 03 provides the admin UI trigger

---
*Phase: 21-backup-restore*
*Completed: 2026-06-04*

## Self-Check: PASSED

- [x] src/jobs/queues.ts - FOUND
- [x] src/jobs/workers/backup-worker.ts - FOUND
- [x] src/lib/module-init.ts - FOUND
- [x] src/lib/backup/RestoreOrchestrator.ts - FOUND
- [x] src/proxy.ts - FOUND
- [x] src/app/(marketing)/maintenance/page.tsx - FOUND
- [x] Commit 7d9e337 (Task 1) - FOUND
- [x] Commit 4e77344 (Task 2) - FOUND
