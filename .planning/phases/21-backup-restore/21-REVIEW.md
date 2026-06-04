---
phase: 21-backup-restore
reviewed: 2026-06-04T12:00:00Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - src/app/(admin)/actions/admin-backup.ts
  - src/app/(admin)/admin/backup/page.tsx
  - src/app/(admin)/admin/settings/backup/page.tsx
  - src/app/(marketing)/maintenance/page.tsx
  - src/app/api/admin/backup/[id]/download/route.ts
  - src/app/api/admin/backup/restore/status/route.ts
  - src/components/admin/BackupDashboard.tsx
  - src/components/admin/BackupSettingsForm.tsx
  - src/components/admin/BackupTable.tsx
  - src/components/admin/CloudSettingsForm.tsx
  - src/components/admin/RestoreDialog.tsx
  - src/components/admin/SettingsShell.tsx
  - src/data/dashboard-nav.ts
  - src/jobs/queues.ts
  - src/jobs/workers/backup-worker.ts
  - src/lib/backup/BackupRotation.ts
  - src/lib/backup/BackupService.ts
  - src/lib/backup/RestoreOrchestrator.ts
  - src/lib/db/schema.ts
  - src/lib/module-init.ts
  - src/proxy.ts
findings:
  critical: 2
  warning: 5
  info: 5
  total: 12
status: issues_found
---

# Phase 21: Code Review Report

**Reviewed:** 2026-06-04T12:00:00Z
**Depth:** standard
**Files Reviewed:** 21
**Status:** issues_found

## Summary

Reviewed the complete Backup & Restore System implementation across 21 files. The system includes database backup creation via `pg_dump`, restore orchestration with auto-rollback, scheduled backups via BullMQ, cloud storage configuration, and a maintenance mode gate.

Two critical security issues were found: the `pg_dump` command receives the full `DATABASE_URL` (which may contain credentials) as a CLI argument visible in process listings, and the maintenance mode bypass allows admins to access the application during a restore when the database may be in an inconsistent state. Five warnings include dead code in the query builder, hardcoded directory status, missing input validation on cloud settings, duplicate audit log entries on deletion, and potential connection configuration mismatch between queue and worker.

## Critical Issues

### CR-01: DATABASE_URL credentials exposed via command-line arguments

**File:** `src/lib/backup/BackupService.ts:92`
**Issue:** `execFileSync("pg_dump", [process.env.DATABASE_URL!, "-f", filePath])` passes the full database connection string (which typically contains username and password) as a CLI argument. On Linux systems, any user on the machine can see these arguments via `ps aux` or `/proc/<pid>/cmdline` while the backup is running. The same issue exists in `RestoreOrchestrator.ts:136` and `RestoreOrchestrator.ts:163` where `psql` receives the DATABASE_URL directly.
**Fix:**
```typescript
// Use environment variable or stdin to pass the connection string
// Option 1: Use the PGDATABASE/PGHOST/PGUSER/PGPASSWORD env vars
execFileSync("pg_dump", ["-f", filePath], {
  stdio: "pipe",
  timeout: 300000,
  env: {
    ...process.env,
    PGDATABASE: parsedUrl.path,
    PGHOST: parsedUrl.hostname,
    PGPORT: parsedUrl.port,
    PGUSER: parsedUrl.username,
    PGPASSWORD: parsedUrl.password,
  },
});

// Option 2: Pipe via stdin (pg_dump does not support this for connection strings,
// but you can use the service file approach)
```

### CR-02: Maintenance mode does not block admin routes during restore

**File:** `src/proxy.ts:172-186`
**Issue:** The maintenance mode check explicitly excludes admin routes with `!adminRoute`, meaning admin users can continue accessing the application during an active database restore. While the restore is in progress (between dropping tables and completing the restore), the database is in an inconsistent state. Admin requests during this window could read partial data, trigger errors, or cause data corruption. The proxy should block all routes (including admin) during maintenance mode, with only the restore status API endpoint exempted.
**Fix:**
```typescript
// In proxy.ts, remove the adminRoute exclusion:
if (nonMarketingRoute) {
  try {
    const maintenanceRow = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "maintenance_mode"))
      .limit(1);

    if (maintenanceRow.length > 0 && maintenanceRow[0].value === "true") {
      // Allow only the restore status API through
      if (!pathname.startsWith("/api/admin/backup/restore")) {
        return NextResponse.rewrite(new URL("/maintenance", request.url));
      }
    }
  } catch {
    // DB unavailability gracefully falls through
  }
}
```

## Warnings

### WR-01: Dead code -- unused `conditions` array in getBackups

**File:** `src/lib/backup/BackupService.ts:187-195`
**Issue:** A `conditions` array is declared and populated with filter conditions (lines 187-195), but it is never used. The actual filtering is applied via separate `query.where()` calls on lines 200-207. This is dead code that suggests a refactor was partially completed and could mislead future developers.
**Fix:** Remove the unused `conditions` array (lines 187-195).

### WR-02: Hardcoded "Writable" status for backups directory

**File:** `src/components/admin/BackupSettingsForm.tsx:233-235`
**Issue:** The "backups/ directory" row always shows a green "Writable" badge regardless of whether the directory actually exists and is writable. This gives operators false confidence. Unlike `pg_dump` and `psql` which are dynamically checked via `checkBinaryAvailability()`, the directory writability is never verified.
**Fix:** Add a server-side check for directory writability (e.g., in `getBackupDashboardData`) and pass the result through as a prop to the settings form, similar to how `binaryAvailability` works.

### WR-03: Missing input validation on saveCloudSettings provider value

**File:** `src/app/(admin)/actions/admin-backup.ts:309-380`
**Issue:** `saveCloudSettings` accepts a `provider` string and writes it to the database without validating it against a known list of providers (`none`, `s3`, `gdrive`, `r2`). A malformed or malicious provider value would be stored. The `saveBackupSettings` action properly validates its `interval` parameter, but `saveCloudSettings` has no analogous validation.
**Fix:**
```typescript
const VALID_CLOUD_PROVIDERS = ["none", "s3", "gdrive", "r2"];

export async function saveCloudSettings(data: { ... }) {
  const { userId, role } = await requireAdmin();

  if (!VALID_CLOUD_PROVIDERS.includes(data.provider)) {
    return { error: "Invalid cloud provider." };
  }
  // ... rest of the function
}
```

### WR-04: Duplicate audit log on backup deletion

**File:** `src/lib/backup/BackupService.ts:171-175` and `src/app/(admin)/actions/admin-backup.ts:113-119`
**Issue:** `BackupService.deleteBackup()` already creates an `admin.backup_deleted` audit log (line 171-175). Then `deleteBackupAction` also creates an identical audit log with the same action and target (lines 113-119). This results in duplicate audit log entries for every backup deletion.
**Fix:** Remove the audit log from one of the two locations. Prefer keeping it in the action layer (`admin-backup.ts`) and removing it from `BackupService.deleteBackup()`, since audit logging is a cross-cutting concern best handled at the action/route level.

### WR-05: Worker uses raw Redis connection instead of parsed connection options

**File:** `src/jobs/workers/backup-worker.ts:115-124`
**Issue:** The worker imports `redis` from `@/lib/redis` (an ioredis instance) and passes it as the `connection` option. However, `bullmq` expects a plain connection options object (`{ host, port, password }`), not a full ioredis instance. While bullmq does accept an ioredis instance, passing the same instance that the application uses for caching can cause issues with bullmq's connection management (e.g., bullmq may close the connection on worker shutdown). The queues in `queues.ts` use separate parsed connection options.
**Fix:**
```typescript
// Use parsed connection options similar to queues.ts, or create the connection
// in a way that's compatible with both bullmq and the app's Redis usage:
const workerConnection = process.env.REDIS_URL
  ? { connection: new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null }) }
  : null;
```

## Info

### IN-01: Backups directory path is relative to CWD

**File:** `src/lib/backup/BackupService.ts:68-74`
**Issue:** `fs.mkdirSync("backups", { recursive: true })` and `path.resolve("backups", filename)` create the backups directory relative to the current working directory. In a Next.js production deployment, the CWD may not be predictable. Consider using an absolute path derived from an environment variable or a well-known data directory.
**Fix:** Consider reading a `BACKUP_DIR` environment variable with `"backups"` as the fallback default, and resolve it to an absolute path at startup.

### IN-02: Backups table status filter missing "in_progress" option

**File:** `src/components/admin/BackupTable.tsx:171-179`
**Issue:** The status filter dropdown only includes "All Status", "Completed", and "Failed" options. There is no "In Progress" option, even though the `statusBadgeMap` handles `in_progress` status and newly created backups display with "In Progress" badges. Users cannot filter for in-progress backups.
**Fix:** Add `<option value="in_progress">In Progress</option>` to the status filter select element.

### IN-03: formatFileSize function duplicated across three files

**File:** `src/components/admin/BackupDashboard.tsx:52-58`, `src/components/admin/BackupTable.tsx:44-49`, `src/components/admin/RestoreDialog.tsx:33-38`
**Issue:** The `formatFileSize` helper function is duplicated with minor variations across three component files. This violates DRY and could drift over time.
**Fix:** Extract to a shared utility, e.g., `src/lib/utils/format.ts`, and import it where needed.

### IN-04: Refresh token and client secret cleared after save regardless of user intent

**File:** `src/components/admin/CloudSettingsForm.tsx:73-76`
**Issue:** After a successful save, the S3 secret key, Google Drive client secret, and refresh token fields are cleared to empty strings. If the user saves one field and then wants to modify another, they must re-enter the cleared values. This is a UX concern -- consider a more nuanced approach such as showing placeholder text indicating the value is stored.
**Fix:** This is a minor UX trade-off for security (preventing credential display). The current approach is acceptable but could be improved with visual indicators like "Value stored -- leave blank to keep current" shown more prominently.

### IN-05: Console logging in production code

**File:** `src/lib/backup/RestoreOrchestrator.ts:143,215,217`, `src/lib/backup/BackupRotation.ts:57`, `src/jobs/workers/backup-worker.ts:77,104,127,131,135`, `src/lib/backup/BackupService.ts` (via child_process errors)
**Issue:** Multiple `console.log`, `console.warn`, and `console.error` calls are used throughout the backup/restore system. While useful for debugging, these should ideally use a structured logger in production.
**Fix:** Consider using a consistent logging utility that can be configured for different environments (e.g., silent in production, verbose in development).

---

_Reviewed: 2026-06-04T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
