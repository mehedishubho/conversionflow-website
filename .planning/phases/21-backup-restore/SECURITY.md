# SECURITY.md -- Phase 21: Backup & Restore System

**Audit Date:** 2026-06-04
**Auditor:** GSD Security Auditor (automated)
**ASVS Level:** 1

## Threat Verification Summary

| Threat ID | Category | Component | Disposition | Status | Evidence |
|-----------|----------|-----------|-------------|--------|----------|
| T-21-01 | Tampering | BackupService.createBackup() | mitigate | CLOSED | `src/lib/backup/BackupService.ts:92` -- execFileSync with array args `[process.env.DATABASE_URL!, "-f", filePath]`, no shell string concatenation. DATABASE_URL sourced from process.env only. |
| T-21-02 | Information disclosure | Error messages / RestoreStatus endpoint | mitigate/accept | CLOSED | Accept: Error messages logged server-side only, return values scoped to server action callers. Mitigate: `src/app/api/admin/backup/restore/status/route.ts:8-16` requires admin auth (session + role check). All server actions in `src/app/(admin)/actions/admin-backup.ts` call requireAdmin(). |
| T-21-03 | Tampering | Download route | mitigate | CLOSED | `src/app/api/admin/backup/[id]/download/route.ts:26` -- `getBackupById(id)` queries DB for file path. Lines 35, 42 use `backup.filePath` from DB record, never user-supplied paths. Admin auth enforced at lines 14-22. |
| T-21-04 | Spoofing | proxy.ts maintenance check / BackupDashboard | mitigate/accept | CLOSED | Mitigate: `src/proxy.ts:173-185` reads `maintenance_mode` from settings table DB query, not from URL params or cookies. Accept: BackupDashboard auth handled by server actions layer (trusted admin UI). |
| T-21-05 | Denial of Service | RestoreOrchestrator.restoreBackup() | mitigate | CLOSED | `src/lib/backup/RestoreOrchestrator.ts`: Pre-restore backup mandatory (lines 107-117). Auto-rollback on failure (lines 197-222). Concurrent restore prevention via Redis status check (lines 88-95). Maintenance mode set at line 124, always cleared on failure (line 226). |
| T-21-06 | Information disclosure | Cloud credential storage | mitigate | CLOSED | `src/components/admin/CloudSettingsForm.tsx`: Secret Key `type="password"` (line 131), Client Secret `type="password"` (line 156), Refresh Token `type="password"` (line 163). Server-side storage via `src/app/(admin)/actions/admin-backup.ts:309-380` saveCloudSettings() to settings table. |

## Accepted Risks Log

| Threat ID | Risk Accepted | Justification |
|-----------|---------------|---------------|
| T-21-02 (partial) | Error messages returned via server actions | Error messages are logged server-side. Return values flow to admin-only server action callers. No raw errors exposed to unauthenticated users. |
| T-21-04 (partial) | BackupDashboard trusted as admin UI | Auth is enforced at the server action layer via requireAdmin(). The admin UI component is not a trust boundary. |

## Unregistered Flags

No "## Threat Flags" sections found in any Phase 21 SUMMARY files. No unregistered flags to report.

## Threat Model Source Files

- `.planning/phases/21-backup-restore/21-01-PLAN.md` (T-21-01, T-21-02)
- `.planning/phases/21-backup-restore/21-02-PLAN.md` (T-21-02, T-21-04, T-21-05)
- `.planning/phases/21-backup-restore/21-03-PLAN.md` (T-21-02, T-21-03)
- `.planning/phases/21-backup-restore/21-04-PLAN.md` (T-21-04)
- `.planning/phases/21-backup-restore/21-05-PLAN.md` (T-21-06)

## Implementation Files Verified

- `src/lib/backup/BackupService.ts`
- `src/lib/backup/RestoreOrchestrator.ts`
- `src/app/api/admin/backup/[id]/download/route.ts`
- `src/app/api/admin/backup/restore/status/route.ts`
- `src/app/(admin)/actions/admin-backup.ts`
- `src/proxy.ts`
- `src/components/admin/CloudSettingsForm.tsx`
