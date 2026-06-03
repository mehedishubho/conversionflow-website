---
phase: 20-migration-cleanup
plan: 02
subsystem: database, infra
tags: [migration, cli, pg_dump, license-keys, api-tokens, email, drizzle]

requires:
  - phase: 16-licensing-core
    provides: LicenseKeyGenerator, ApiTokenGenerator domain services
  - phase: 15-products-context
    provides: products, productPlans tables for FK validation
provides:
  - "Migration CLI script with dry-run, backup, data transforms, verification"
  - "API token notification email template for customer communication"

affects: [20-migration-cleanup, deployment, operations]

tech-stack:
  added: []
  patterns: [migration-cli, dry-run-mode, pg_dump-backup, batched-email-send, atomic-fk-validation]

key-files:
  created:
    - scripts/migrate-phase20.ts
  modified:
    - src/lib/emails/api-token-notification.ts

key-decisions:
  - "D-02: Dedicated migration CLI script with verification before schema changes"
  - "D-04: FK validation wrapped in single PostgreSQL transaction for atomicity"
  - "D-07: All license keys regenerated to CF-XXXX format via LicenseKeyGenerator"
  - "D-09: --dry-run flag outputs report without writing to database"
  - "D-10: pg_dump backup created before any data changes"
  - "D-11: phase20_migration_complete flag written to settings table on success"
  - "D-12: Timestamped log file for audit trail"

patterns-established:
  - "Migration CLI pattern: dry-run flag, backup, data transforms, completion flag"
  - "Batched email send: 50 emails per batch with 2-second pause between batches"
  - "Atomic FK validation: single transaction wrapping all referential integrity checks"

requirements-completed: [ARCH-09, ARCH-10]

duration: 5min
completed: 2026-06-04
---

# Phase 20 Plan 02: Migration Script and Email Template Summary

**Migration CLI script with dry-run, pg_dump backup, license key regeneration, API token backfill, FK validation, and customer notification email template**

## Performance

- **Duration:** 5 min
- **Started:** 2026-06-03T20:42:12Z
- **Completed:** 2026-06-03T20:47:39Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created comprehensive migration CLI script supporting all 10 decisions (D-02 through D-12)
- API token notification email template follows existing Resend pattern with token display and security warning
- Migration script handles all data transforms before schema push: key regeneration, token backfill, FK validation, completion flag
- Atomic FK validation in PostgreSQL transaction prevents partial migration state

## Task Commits

Each task was committed atomically:

1. **Task 1: Create API token notification email template** - Pre-existing in base commit (no changes needed, file already matches spec)
2. **Task 2: Create migration CLI script** - `3dc2034` (feat)

**Base sync commit:** `ff1421a` (chore: sync worktree to feature branch base)

## Files Created/Modified
- `scripts/migrate-phase20.ts` - Migration CLI script with dry-run, backup, key regeneration, token backfill, FK validation, email notifications, audit logging
- `src/lib/emails/api-token-notification.ts` - Email template for API token backfill notification (pre-existing, verified against spec)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Worktree branch base was incorrect**
- **Found during:** Initial setup
- **Issue:** Worktree was branched from an older commit (2643d85) instead of the target fc0c8eb
- **Fix:** Used `git checkout fc0c8eb -- .` to restore correct file state, then committed sync
- **Files modified:** All files (sync commit ff1421a)
- **Commit:** ff1421a

**2. [Rule 3 - Blocking] Task 1 email template already existed**
- **Found during:** Task 1 execution
- **Issue:** The api-token-notification.ts file already existed in the base commit fc0c8eb with correct content
- **Fix:** Verified all acceptance criteria pass against existing file, no changes needed
- **Files modified:** None

## Pre-existing Build Issues (Out of Scope)

- Missing `nodemailer` dependency in `admin-notif-settings.ts`
- Missing tiptap editor dependencies in `TiptapEditor.tsx`
- TypeScript esModuleInterop warnings for `fs`, `path`, `crypto` default imports (pre-existing pattern)
- These are unrelated to this plan's changes and should be addressed separately

## Threat Surface

No new threat surface introduced beyond what was documented in the plan's threat model. The migration script operates at the same trust boundaries (DB access, email service, filesystem).

## Self-Check: PASSED

- `scripts/migrate-phase20.ts` exists: VERIFIED
- `src/lib/emails/api-token-notification.ts` exists: VERIFIED
- Commit `3dc2034` exists: VERIFIED
- Commit `ff1421a` exists: VERIFIED
