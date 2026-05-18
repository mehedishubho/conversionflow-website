---
phase: 06-webhooks-jobs
plan: 02
subsystem: infra
tags: [bullmq, background-jobs, redis, scheduler, instrumentation]

# Dependency graph
requires:
  - phase: 04-checkout-payments
    provides: "Central API client (importOrderToCentral), orders/licenses schema, IPN handler sync pattern"
  - phase: 06-webhooks-jobs/01
    provides: "BullMQ queues (licenseSyncQueue), webhook infrastructure"
provides:
  - "BullMQ worker for license-sync queue (full_sync and single_retry handlers)"
  - "15-minute repeatable job scheduler via upsertJobScheduler"
  - "Next.js instrumentation hook to auto-start jobs on server boot"
  - "Graceful Redis degradation (no crash when unavailable)"
affects: [admin-dashboard, license-intelligence]

# Tech tracking
tech-stack:
  added: []
  patterns: ["BullMQ upsertJobScheduler for repeatable jobs", "Next.js instrumentation.ts for startup hooks", "Worker with concurrency limiter"]

key-files:
  created:
    - src/jobs/workers/license-sync.ts
    - src/jobs/start.ts
    - src/instrumentation.ts
  modified: []

key-decisions:
  - "Duplicate license check before insert in full_sync to avoid unique constraint violation on re-runs"
  - "Audit log uses truncated license key (8 chars) per T-06-09 threat model"

patterns-established:
  - "Worker pattern: separate file in src/jobs/workers/ with exported start function and Redis catch guard"
  - "Job init pattern: src/jobs/start.ts registers schedulers and starts workers behind null guard"
  - "Instrumentation pattern: dynamic import() inside register() with NEXT_RUNTIME guard"

requirements-completed: [LIC-04]

# Metrics
duration: 6min
completed: 2026-05-18
---

# Phase 06 Plan 02: Background Jobs Summary

**BullMQ license sync worker with 15-minute repeatable scheduler and Next.js instrumentation hook for auto-start on server boot**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-18T16:08:43Z
- **Completed:** 2026-05-18T16:14:48Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- BullMQ worker processes full_sync and single_retry job types from the license-sync queue
- 15-minute repeatable job registered via `upsertJobScheduler` (BullMQ 5.76.8 API)
- Next.js instrumentation hook auto-starts jobs on server boot with Edge runtime guard
- Graceful degradation when Redis is unavailable (null guard on licenseSyncQueue, try/catch on worker start)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create BullMQ license sync worker and job scheduler** - `c80a085` (feat)
2. **Task 2: Create Next.js instrumentation hook to start jobs on boot** - `c09f659` (feat)

## Files Created/Modified
- `src/jobs/workers/license-sync.ts` - BullMQ Worker for license-sync queue with full_sync (batch pending orders) and single_retry (targeted order) handlers, follows IPN handler central API sync pattern
- `src/jobs/start.ts` - Job initialization: registers 15-min repeatable scheduler via upsertJobScheduler and starts worker, with Redis null guard
- `src/instrumentation.ts` - Next.js instrumentation hook that dynamically imports startJobs() on Node.js runtime startup

## Decisions Made
- Added duplicate license check before insert in syncOrderToCentral to prevent unique constraint violations when the 15-minute job re-processes orders that were partially synced
- Audit log truncates license key to first 8 characters per T-06-09 threat model (never log full keys)
- Worker wrapped in try/catch at the startLicenseSyncWorker level to catch Redis connection failures gracefully

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Initial build attempt hit stale `.next` cache causing ENOENT on pages-manifest.json. Resolved by cleaning `.next` directory and rebuilding.

## User Setup Required
None - no external service configuration required. Jobs auto-start when the server boots with Redis available.

## Next Phase Readiness
- Background job infrastructure complete, ready for Plan 06-03 (webhook handlers enhancement) and Plan 06-04 (license intelligence dashboard)
- The worker and scheduler are production-ready but require Redis running on localhost:6381 for operation
- When Redis is not available, the system gracefully skips job registration with a warning log

## Self-Check: PASSED

All 3 files verified to exist. Both commit hashes (c80a085, c09f659) verified in git log.

---
*Phase: 06-webhooks-jobs*
*Completed: 2026-05-18*
