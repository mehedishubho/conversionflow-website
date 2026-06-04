---
phase: 21-backup-restore
plan: 03
subsystem: api
tags: [server-actions, api-routes, backup, admin, navigation, auth-guard]

# Dependency graph
requires:
  - phase: 21-backup-restore/01
    provides: BackupService, BackupRotation, backups table schema
  - phase: 21-backup-restore/02
    provides: RestoreOrchestrator, backup-worker scheduleBackupJob
provides:
  - Server actions for backup CRUD (create, delete, restore, list, dashboard data)
  - Server actions for backup settings (save/get interval, retention, cloud config)
  - Admin-only download API route with DB-validated file path (T-21-03)
  - Admin-only restore status polling API route (T-21-02)
  - Backups nav item in admin sidebar
  - Backup settings entry in SettingsShell
affects: [21-04, 21-05]

# Tech tracking
tech-stack:
  added: []
patterns: [requireAdmin-guard, upsertSetting-helper, fire-and-forget-retention, DB-validated-file-path, admin-only-api-route]

key-files:
  created:
    - src/app/(admin)/actions/admin-backup.ts
    - src/app/api/admin/backup/[id]/download/route.ts
    - src/app/api/admin/backup/restore/status/route.ts
  modified:
    - src/data/dashboard-nav.ts
    - src/components/admin/SettingsShell.tsx

key-decisions:
  - "Extracted upsertSetting/getSettingValue helpers to reduce code duplication across save/get actions"
  - "Restore runs asynchronously via fire-and-forget pattern, returning { started: true } immediately"
  - "Retention enforcement after manual backup runs in background (non-blocking)"

patterns-established:
  - "Server action pattern: requireAdmin() guard, service class instantiation, audit logging, error wrapping"
  - "Download route pattern: DB-validated file path lookup, fs.readFileSync with Uint8Array response"

requirements-completed: [D-01, D-02, D-10, D-11, D-17]

# Metrics
duration: 8min
completed: 2026-06-04
---

# Phase 21 Plan 03: Backup Admin Actions & API Routes Summary

**Eight server actions (create/delete/restore backups, list/dashboard data, save/get settings, save cloud settings) plus admin-only download and restore-status API routes with navigation integration**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-06-04T14:30:23Z
- **Completed:** 2026-06-04T14:38:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Created admin-backup.ts with 8 exported server actions, all protected by requireAdmin() guard
- Built download API route that validates backup ID from database before serving file (T-21-03 mitigation)
- Built restore status polling API route with admin auth check (T-21-02 mitigation)
- Added Backups nav item to admin sidebar and Backup settings entry to SettingsShell
- Extracted upsertSetting/getSettingValue helpers for cleaner settings read/write

## Task Commits

Each task was committed atomically:

1. **Task 1: Create backup server actions and API routes** - `f046847` (feat)
2. **Task 2: Add Backup navigation to admin sidebar and settings** - `b9e926d` (feat)

## Files Created/Modified
- `src/app/(admin)/actions/admin-backup.ts` - 8 server actions: createBackupAction, deleteBackupAction, restoreBackupAction, getBackupList, getBackupDashboardData, saveBackupSettings, getBackupSettings, saveCloudSettings
- `src/app/api/admin/backup/[id]/download/route.ts` - Admin-only GET handler for backup file download with DB-validated file path
- `src/app/api/admin/backup/restore/status/route.ts` - Admin-only GET handler for restore progress polling
- `src/data/dashboard-nav.ts` - Added Backups nav item with HardDrive icon
- `src/components/admin/SettingsShell.tsx` - Added Backup settings entry with Database icon

## Decisions Made
- Extracted `upsertSetting()` and `getSettingValue()` helper functions to avoid repetitive select/insert/update patterns across multiple settings actions
- Restore action uses fire-and-forget pattern (starts RestoreOrchestrator.restoreBackup in background, returns `{ started: true }` immediately) so the client can poll the status endpoint
- Retention enforcement after manual backup runs as a background promise (non-blocking) to avoid delaying the response
- Used the same upsert pattern from admin-settings.ts (select-then-update-or-insert) for consistency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Pre-existing build failures in analytics-dashboard.ts (TS1005 errors from generic syntax) are unrelated to backup code. No backup-related TypeScript errors introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Server actions and API routes ready for Plan 04 (admin backup UI components)
- Plan 04 can call createBackupAction, deleteBackupAction, restoreBackupAction from client components
- Download API route at /api/admin/backup/[id]/download ready for direct link usage
- Restore status polling at /api/admin/backup/restore/status ready for client-side polling
- Navigation entries wired so admin sidebar links to /admin/backup and settings to /admin/settings/backup

---
*Phase: 21-backup-restore*
*Completed: 2026-06-04*

## Self-Check: PASSED

| Item | Status |
|------|--------|
| src/app/(admin)/actions/admin-backup.ts | FOUND |
| src/app/api/admin/backup/[id]/download/route.ts | FOUND |
| src/app/api/admin/backup/restore/status/route.ts | FOUND |
| src/data/dashboard-nav.ts (modified) | FOUND |
| src/components/admin/SettingsShell.tsx (modified) | FOUND |
| Commit f046847 (Task 1) | FOUND |
| Commit b9e926d (Task 2) | FOUND |
