# Phase 21: Backup & Restore System - Research

**Researched:** 2026-06-04
**Domain:** Database backup/restore, BullMQ scheduled jobs, cloud storage integration, admin dashboard
**Confidence:** HIGH

## Summary

Phase 21 builds a complete backup and restore system for the ConversionFlow PostgreSQL database, exposed entirely through the admin dashboard. The system uses `pg_dump` for creating plain SQL backups and `psql` for restoring them, with BullMQ repeatable jobs for automated scheduling. The codebase already contains a working `pg_dump` pattern in `scripts/migrate-phase20.ts` (lines 111-139) using `execFileSync` with cross-platform binary detection, which should be directly adapted for the backup service.

The project's existing BullMQ worker pattern (`subscription-lifecycle.ts`, `analytics-aggregation.ts`) provides a proven template for the backup worker. Both workers follow an identical structure: a `process*()` function, a `schedule*Job()` export for repeatable job registration, and a `start*Worker()` export for worker startup, all wired into `module-init.ts`. The backup queue needs to be added to `queues.ts` alongside the 5 existing queues.

For metadata storage, the project uses a `settings` table with a key-value schema for all configuration. Backup metadata (file list, status tracking) needs a dedicated `backups` table in the schema since the key-value pattern is not appropriate for list-based data with multiple records.

**Primary recommendation:** Create a new `backups` table for metadata, a `BackupService` class encapsulating pg_dump/psql logic adapted from `migrate-phase20.ts`, a BullMQ backup worker following the `subscription-lifecycle.ts` pattern, and a `backups/` directory for local storage. Cloud upload (S3/Google Drive) is optional and configured via settings keys.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Backups stored on local filesystem in `backups/` directory as the primary storage. Every backup is saved locally first, then optionally uploaded to a configured cloud destination.
- **D-02:** Admin configures ONE cloud destination at a time (S3-compatible, Google Drive, or Cloudflare R2). Can switch providers by changing config. Not simultaneous multi-destination.
- **D-03:** Backup format is plain SQL (.sql) via `pg_dump`. Human-readable, inspectable, compatible with standard `psql` restore. File naming: `backup-{YYYYMMDD-HHmmss}-{type}.sql` where type is `manual` or `scheduled`.
- **D-04:** Google Drive integration uses OAuth 2.0 with refresh token. Admin creates Google Cloud project, enables Drive API, goes through consent flow once. System stores refresh token for ongoing uploads. Backup files upload to a single folder specified by folder ID in settings.
- **D-05:** Restore flow: (1) Auto-create pre-restore backup of current state, (2) Show confirmation dialog with backup filename and timestamp, (3) Enable maintenance mode via settings flag, (4) Run `psql` restore, (5) Disable maintenance mode on completion. Admin never loses current state.
- **D-06:** Restore progress displayed via status page with live polling. Status stages: Creating pre-restore backup -> Enabling maintenance mode -> Dropping tables -> Restoring data -> Verifying -> Complete. UI polls a status endpoint during restore.
- **D-07:** Maintenance mode uses a `maintenance_mode` flag in the `settings` table. Proxy.ts (or layout) checks this flag and shows a "Site under maintenance" page for all non-admin routes. Admin routes remain accessible for monitoring. Flag auto-removed when restore completes or fails.
- **D-08:** If restore fails mid-way, automatically rollback to the pre-restore backup. System always has a safety net. Admin sees error details and gets a notification. App returns to pre-restore state.
- **D-09:** Preset interval options: Disabled, Every 6 hours, Daily (default), Weekly, Monthly. Simple dropdown in settings -- no custom cron syntax. Maps to BullMQ repeatable job patterns internally.
- **D-10:** Retention policy: keep last N backups (default: 10). Admin can configure N (options: 5, 10, 15, 20, or custom). Oldest backups auto-deleted when limit exceeded during rotation. Rotation runs after each backup completes.
- **D-11:** Backup settings located at Admin Settings > Backup category (alongside Payment, SMTP, SEO in SettingsShell.tsx navigation). Follows existing settings sub-page pattern.
- **D-12:** /admin/backup page layout: KPI summary cards at top (total backups, last backup time, next scheduled, total disk usage) + full-width data table below listing all backups.
- **D-13:** Data table columns: Filename, Date & Time, Size, Type (Manual/Scheduled), Status (Completed/Failed/In Progress), Actions (Download, Restore, Delete). 6 columns.
- **D-14:** Table filtering: Search bar (search by filename) + Type filter dropdown (All/Manual/Scheduled) + Status filter dropdown (All/Completed/Failed). Table sorting: sortable by Date, Size, or Type column headers. Default sort: newest first.
- **D-15:** Backup type is always full database dump. No selective table dumps. All data is interconnected in the SaaS platform.
- **D-16:** Empty state: illustration/icon + "No backups yet" message + prominent "Create your first backup" button + "Set up automatic backups" prompt. Guides admin to take action.
- **D-17:** Actions per row: Download (downloads .sql file via API route), Restore (triggers restore flow with D-05 safety), Delete (removes backup file from local + cloud + metadata). No separate "Cloud Upload" button -- cloud upload is automatic if configured.

### Claude's Discretion
- Exact backup metadata storage (settings table keys vs new `backups` table)
- pg_dump/psql command construction and error handling details
- Google Drive OAuth flow implementation (callback route, token storage)
- S3 upload library choice and error retry logic
- Maintenance mode page design for end users
- Restore status endpoint polling interval
- Backup file size calculation and display formatting
- Confirmation dialog UI design for restore
- Cloud credential storage security (encryption at rest)
- Pre-restore backup naming convention
- How BullMQ repeatable jobs map to preset intervals internally

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| D-01 | Backups stored locally in `backups/` directory, optional cloud upload | BackupService with local-first storage pattern |
| D-02 | One cloud destination at a time (S3, Google Drive, or R2) | Settings-based provider config with dynamic S3 client |
| D-03 | Plain SQL format via pg_dump, file naming convention | Adapted from migrate-phase20.ts execFileSync pattern |
| D-04 | Google Drive OAuth 2.0 with refresh token | googleapis package with OAuth2 client |
| D-05 | Restore flow with pre-restore backup and maintenance mode | Multi-step restore orchestrator with state machine |
| D-06 | Restore progress via status page with live polling | Redis key for restore state, polling endpoint |
| D-07 | Maintenance mode via settings flag checked by proxy.ts | Settings table flag + proxy.ts guard |
| D-08 | Auto-rollback on restore failure | Pre-restore backup as safety net |
| D-09 | Preset interval options mapped to BullMQ cron patterns | BullMQ repeatable jobs with cron patterns |
| D-10 | Configurable retention policy with auto-rotation | Post-backup rotation runner |
| D-11 | Backup settings at /admin/settings/backup | SettingsShell.tsx nav pattern |
| D-12 | Backup dashboard with KPI cards + data table | Admin page pattern from webhooks/dashboard pages |
| D-13 | 6-column data table for backup list | Table component pattern from existing admin tables |
| D-14 | Filtering and sorting for backup table | Client-side filtering/sorting pattern |
| D-15 | Full database dumps only | pg_dump without table filters |
| D-16 | Empty state with call-to-action | Existing empty state patterns |
| D-17 | Download, Restore, Delete actions per row | API route for download, server actions for delete/restore |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| bullmq | 5.76.8 (installed) | Backup job scheduling and queue management | Already installed, 2 existing workers in codebase [VERIFIED: package.json] |
| ioredis | 5.10.1 (installed) | Redis connection for BullMQ and restore status | Already installed, shared Redis instance [VERIFIED: package.json] |
| drizzle-orm | 0.45.2 (installed) | Schema definition and queries for backups table | Project ORM standard [VERIFIED: package.json] |
| @aws-sdk/client-s3 | 3.1061.0 (latest) | S3/R2/compatible cloud upload | AWS official SDK, supports S3-compatible endpoints [VERIFIED: npm registry] |
| googleapis | 173.0.0 (latest) | Google Drive API v3 file upload | Official Google API client, handles OAuth2 refresh automatically [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @aws-sdk/lib-storage | (included with client-s3) | Multipart upload for large backups | When backup files exceed 5MB |
| child_process (Node built-in) | - | execFileSync for pg_dump/psql | All backup/restore operations |
| fs (Node built-in) | - | File operations, directory management | Local backup file management |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @aws-sdk/client-s3 | minio-js | AWS SDK is more standard, better docs, supports R2 natively |
| googleapis | google-drive-picker + fetch | googleapis handles auth, refresh tokens, and resumable uploads natively |
| execFileSync (sync) | execFile (async) | Sync blocks event loop but is simpler for BullMQ workers; use async for server actions |

**Installation:**
```bash
pnpm add @aws-sdk/client-s3 googleapis
```

**Version verification:**
- bullmq: 5.76.8 installed [VERIFIED: package.json]
- @aws-sdk/client-s3: 3.1061.0 latest [VERIFIED: npm registry 2026-06-04]
- googleapis: 173.0.0 latest [VERIFIED: npm registry 2026-06-04]

## Architecture Patterns

### Recommended Project Structure
```
src/
├── jobs/
│   ├── queues.ts                           # ADD: backupQueue
│   └── workers/
│       └── backup-worker.ts                # NEW: scheduleBackupJob() + startBackupWorker()
├── lib/
│   ├── backup/
│   │   ├── BackupService.ts                # NEW: pg_dump/psql operations
│   │   ├── BackupRotation.ts               # NEW: retention policy enforcement
│   │   ├── CloudUploader.ts                # NEW: S3/Google Drive upload logic
│   │   └── RestoreOrchestrator.ts           # NEW: multi-step restore state machine
│   └── module-init.ts                      # MODIFY: add backup worker registration
├── lib/db/
│   └── schema.ts                           # MODIFY: add backups table
├── app/
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── backup/
│   │   │   │   └── page.tsx                # NEW: backup dashboard
│   │   │   └── settings/
│   │   │       └── backup/
│   │   │           └── page.tsx            # NEW: backup settings page
│   │   └── actions/
│   │       └── admin-backup.ts             # NEW: backup server actions
│   └── api/
│       └── admin/
│           └── backup/
│               ├── [id]/
│               │   └── download/
│               │       └── route.ts        # NEW: file download API route
│               └── restore/
│                   └── status/
│                       └── route.ts        # NEW: restore status polling endpoint
├── components/
│   └── admin/
│       ├── BackupDashboard.tsx             # NEW: KPI cards + table
│       ├── BackupTable.tsx                 # NEW: data table with filters
│       ├── BackupSettingsForm.tsx          # NEW: settings form
│       ├── RestoreDialog.tsx              # NEW: confirmation + progress dialog
│       └── CloudSettingsForm.tsx           # NEW: cloud provider config
├── data/
│   └── dashboard-nav.ts                    # MODIFY: add Backup nav item
└── components/admin/
    └── SettingsShell.tsx                   # MODIFY: add Backup to SETTINGS_NAV
```

### Pattern 1: BullMQ Backup Worker (follows subscription-lifecycle.ts)
**What:** Repeatable BullMQ job for scheduled backups with a single-concurrency worker
**When to use:** All scheduled backup operations
**Example:**
```typescript
// Source: Adapted from src/jobs/workers/subscription-lifecycle.ts (VERIFIED: codebase)

const QUEUE_NAME = "backup";

let workerStarted = false;

async function processScheduledBackup(): Promise<void> {
  const backupService = new BackupService();
  const result = await backupService.createBackup("scheduled");

  if (result.success) {
    // Run rotation after each backup
    const rotator = new BackupRotation();
    await rotator.enforceRetention();
  }
}

export async function scheduleBackupJob(): Promise<void> {
  if (!backupQueue) return;

  const interval = await getBackupInterval(); // from settings
  if (interval === "disabled") {
    await backupQueue.removeRepeatableByKey("backup-scheduled:::0 2 * * *");
    return;
  }

  const cronPattern = intervalToCron(interval);

  await backupQueue.add(
    "backup-scheduled",
    { runAt: new Date().toISOString() },
    {
      repeat: { pattern: cronPattern },
      jobId: "backup-scheduled",
      attempts: 3,
      backoff: { type: "exponential", delay: 60000 },
    },
  );
}

export function startBackupWorker(): void {
  if (workerStarted) return;
  if (!redis) return;

  const worker = new Worker(
    QUEUE_NAME,
    async () => { await processScheduledBackup(); },
    { connection: redis, concurrency: 1 },
  );

  worker.on("failed", (job, err) => {
    console.error(`[Backup] Job ${job?.id} failed:`, err.message);
  });
  worker.on("completed", (job) => {
    console.log(`[Backup] Job ${job?.id} completed`);
  });

  workerStarted = true;
}
```

### Pattern 2: pg_dump via execFileSync (adapted from migrate-phase20.ts)
**What:** Synchronous pg_dump execution with cross-platform binary detection
**When to use:** Creating backups from both server actions and BullMQ workers
**Example:**
```typescript
// Source: scripts/migrate-phase20.ts lines 111-139 (VERIFIED: codebase)

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

function createBackup(outputPath: string): void {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not configured");

  fs.mkdirSync("backups", { recursive: true });

  execFileSync("pg_dump", [dbUrl, "-f", outputPath], {
    stdio: "pipe",
    timeout: 300000, // 5 minute timeout for large databases
  });
}
```

### Pattern 3: Restore Status via Redis Key
**What:** Store restore progress state in Redis for polling by the admin UI
**When to use:** During database restore operations
**Example:**
```typescript
// Restore state stored in Redis with 10-minute TTL
interface RestoreStatus {
  stage: "pre_backup" | "maintenance" | "dropping" | "restoring" | "verifying" | "complete" | "failed";
  backupId: string;
  startedAt: string;
  error?: string;
}

// Write status
await kvSet("restore:status", JSON.stringify(status), 600); // 10 min TTL

// Read status (polling endpoint)
const status = await kvGet("restore:status");
```

### Pattern 4: Admin Settings Page (follows existing pattern)
**What:** Settings sub-page with form, using SettingsShell wrapper and admin-settings action pattern
**When to use:** /admin/settings/backup page
**Example:**
```typescript
// Source: src/app/(admin)/admin/settings/subscription/page.tsx (VERIFIED: codebase)

export const dynamic = "force-dynamic";

export default async function BackupSettingsPage() {
  const settings = await getBackupSettings();
  return (
    <div>
      <PageBreadcrumb pageTitle="Backup Settings" basePath="/admin/settings" />
      <BackupSettingsForm initialData={settings} />
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Using execFileSync in server actions for long-running pg_dump:** This blocks the Next.js server. Use `execFile` (async) for manual backup triggers from the admin UI, or offload to a BullMQ job. [ASSUMED]
- **Storing backup metadata in the settings key-value table:** Settings is for single-value config. Backup records are a list with multiple fields -- use a dedicated `backups` table.
- **Running psql restore without dropping existing tables first:** If tables still exist, restore will fail with duplicate key errors. Must drop tables or use `--clean` flag.
- **Passing DATABASE_URL as pg_dump CLI argument:** The URL may contain special characters. Use environment variable approach or pass individual connection parameters. The migrate-phase20.ts pattern passes the full URL as a single argument which works for postgres:// URLs. [VERIFIED: codebase]
- **Not handling pg_dump binary availability:** The dev machine (Windows) does not have pg_dump on PATH. The system must detect and gracefully report missing binaries.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cron scheduling | Custom cron parser or setInterval | BullMQ repeatable jobs with cron patterns | BullMQ handles persistence, retry, deduplication, and distributed locking [VERIFIED: codebase] |
| OAuth 2.0 token refresh | Manual token exchange logic | googleapis OAuth2 client | Handles refresh token exchange, expiry, and retry automatically [VERIFIED: googleapis docs] |
| S3 multipart upload | Manual chunked upload | @aws-sdk/lib-storage Upload class | Handles chunking, retry, and progress for files >5MB [CITED: AWS SDK docs] |
| File download response | Custom stream handling | Next.js Response with Content-Disposition | Proven pattern from invoice PDF download route [VERIFIED: codebase] |
| Backup metadata storage | JSON files or settings keys | PostgreSQL `backups` table with Drizzle ORM | Atomic queries, filtering, sorting, relationships [VERIFIED: codebase] |
| Maintenance mode flag | File-based lock | Settings table key-value | Consistent with all other config, checked by proxy.ts DB query [VERIFIED: codebase] |

**Key insight:** The codebase has established patterns for every subsystem this phase touches -- BullMQ workers, admin settings, server actions, file downloads, and proxy guards. The planner should copy these patterns rather than invent new approaches.

## Common Pitfalls

### Pitfall 1: pg_dump/psql Not Available on Dev Machine
**What goes wrong:** Developer tests backup creation and it fails silently or throws an unhelpful error.
**Why it happens:** pg_dump and psql are PostgreSQL client tools that may not be on the system PATH, especially on Windows dev machines.
**How to avoid:** Check binary availability before attempting backup (as migrate-phase20.ts does). Return clear error message: "pg_dump is not installed or not on PATH. Install PostgreSQL client tools." Store the availability check result and show it in the backup dashboard.
**Warning signs:** Backup creation returns generic "Internal error" without specific binary info.

### Pitfall 2: Restore Blocks the Next.js Event Loop
**What goes wrong:** Running `execFileSync` for psql restore (potentially minutes) blocks all request processing, making the restore status polling endpoint unreachable.
**Why it happens:** execFileSync is synchronous -- it freezes the Node.js event loop until completion.
**How to avoid:** Use `execFile` (async) for restore operations. Run restore as a BullMQ job or a spawned child process. The restore status polling endpoint must remain responsive during restore.
**Warning signs:** Admin UI status polling times out during restore.

### Pitfall 3: Restore Fails Due to Active Connections
**What goes wrong:** `psql` restore fails because other connections are holding locks or the database has active sessions.
**Why it happens:** The Next.js app itself maintains a connection pool. Drizzle ORM's postgres.js driver keeps connections open.
**How to avoid:** Before restoring, the restore orchestrator should terminate non-essential connections. Use `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()` to kill other connections. The maintenance mode flag ensures no user traffic is creating new queries during restore.
**Warning signs:** Restore fails with "database is being accessed by other users" error.

### Pitfall 4: BullMQ Repeatable Job Not Updating When Settings Change
**What goes wrong:** Admin changes backup interval from Daily to Weekly, but the old Daily job keeps running.
**Why it happens:** BullMQ repeatable jobs are created once and persist in Redis. Changing the cron pattern requires removing the old job and creating a new one.
**How to avoid:** The `saveBackupSettings` action must call `removeRepeatableByKey` on the old pattern before scheduling the new one. Store the current pattern in Redis so the old key can be identified for removal.
**Warning signs:** Multiple backup jobs running after settings changes.

### Pitfall 5: Backup File Size Displayed Incorrectly
**What goes wrong:** File size shows 0 bytes or negative values.
**Why it happens:** `fs.statSync` may be called before pg_dump finishes writing, or the file path is incorrect on Windows (backslash issues).
**How to avoid:** Only record file size after pg_dump completes successfully. Use `path.resolve()` for all file paths. Store size in the database record at backup creation time rather than reading from disk on every page load.
**Warning signs:** Backup list shows 0 B for all entries.

### Pitfall 6: Cloud Credentials Stored in Plaintext in Settings Table
**What goes wrong:** S3 secret keys and Google OAuth tokens are stored as plain text in the `settings` table, visible in any database query tool.
**Why it happens:** Settings table stores all values as plain text.
**How to avoid:** Encrypt cloud credentials before storing in settings. Use a server-side encryption key (env var `BACKUP_ENCRYPTION_KEY`) with Node.js `crypto.createCipheriv`. Decrypt only when needed for upload. Mark this as Claude's discretion per D-04 and CONTEXT.md.
**Warning signs:** Cloud settings form shows raw secret keys in the database.

### Pitfall 7: Restore Creates Pre-Backup But Runs Out of Disk Space
**What goes wrong:** During restore flow, the pre-restore backup fills the disk, and then the restore itself fails, leaving the system in an unrecoverable state.
**Why it happens:** Two full database dumps may exceed available disk space on the server.
**How to avoid:** Check available disk space before creating the pre-restore backup. If disk space is less than 2x the estimated backup size, warn the admin and refuse to proceed. Use `fs.statfsSync` (Linux) or `child_process.execSync('df -k .')` to check available space.
**Warning signs:** Pre-restore backup succeeds but restore fails with ENOSPC error.

## Code Examples

### Database Schema: backups table
```typescript
// Source: Adapted from existing schema patterns (VERIFIED: src/lib/db/schema.ts)

export const backupStatusEnum = pgEnum("backup_status", [
  "in_progress",
  "completed",
  "failed",
]);

export const backupTypeEnum = pgEnum("backup_type", [
  "manual",
  "scheduled",
  "pre_restore",
]);

export const backups = pgTable(
  "backups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    filename: text("filename").notNull(),
    filePath: text("file_path").notNull(),
    fileSizeBytes: integer("file_size_bytes").default(0),
    type: backupTypeEnum("type").notNull().default("manual"),
    status: backupStatusEnum("status").notNull().default("in_progress"),
    triggeredBy: text("triggered_by"), // userId for manual, "system" for scheduled
    cloudUploaded: boolean("cloud_uploaded").default(false),
    cloudProvider: text("cloud_provider"), // "s3", "gdrive", "r2"
    cloudPath: text("cloud_path"), // remote path/object key
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("backups_status_idx").on(table.status),
    index("backups_type_idx").on(table.type),
    index("backups_created_at_idx").on(table.createdAt),
  ],
);
```

### Interval-to-Cron Mapping
```typescript
// Source: BullMQ repeatable job pattern (VERIFIED: codebase subscription-lifecycle.ts)

function intervalToCron(interval: string): string {
  switch (interval) {
    case "every_6_hours": return "0 */6 * * *";
    case "daily": return "0 2 * * *";       // 2:00 AM UTC (after analytics at 1 AM)
    case "weekly": return "0 3 * * 0";      // Sunday 3:00 AM UTC
    case "monthly": return "0 4 1 * *";     // 1st of month 4:00 AM UTC
    default: return "0 2 * * *";            // default: daily
  }
}
```

### File Download API Route Pattern
```typescript
// Source: Adapted from src/app/api/invoices/[id]/pdf/route.ts (VERIFIED: codebase)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Look up backup record from DB, get filePath
  // ... db query ...

  if (!fs.existsSync(backup.filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(backup.filePath);

  return new Response(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": "application/sql",
      "Content-Disposition": `attachment; filename="${backup.filename}"`,
    },
  });
}
```

### Proxy.ts Maintenance Mode Guard
```typescript
// Source: To be added to src/proxy.ts (VERIFIED: existing proxy.ts structure)

// In the proxy function, after static/api/_next check:

// Maintenance mode check (non-admin, non-API routes only)
if (nonMarketingRoute && !isAdminRoute(pathname)) {
  try {
    const maintenanceRow = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "maintenance_mode"))
      .limit(1);

    if (maintenanceRow.length > 0 && maintenanceRow[0].value === "true") {
      // Show maintenance page
      return NextResponse.rewrite(new URL("/maintenance", request.url));
    }
  } catch {
    // DB unavailability gracefully falls through
  }
}
```

### S3 Upload with @aws-sdk/client-s3
```typescript
// Source: AWS SDK v3 pattern (CITED: AWS SDK docs)

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

async function uploadToS3(
  filePath: string,
  fileName: string,
  config: { endpoint: string; accessKey: string; secretKey: string; bucket: string }
): Promise<string> {
  const client = new S3Client({
    endpoint: config.endpoint, // works with R2, MinIO, etc.
    region: "auto",
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
  });

  const fileContent = fs.readFileSync(filePath);

  await client.send(new PutObjectCommand({
    Bucket: config.bucket,
    Key: `backups/${fileName}`,
    Body: fileContent,
    ContentType: "application/sql",
  }));

  return `backups/${fileName}`;
}
```

### Google Drive Upload with OAuth Refresh Token
```typescript
// Source: Google Drive API v3 pattern (CITED: Google Drive API docs)

import { google } from "googleapis";
import fs from "fs";

async function uploadToGoogleDrive(
  filePath: string,
  fileName: string,
  config: { clientId: string; clientSecret: string; refreshToken: string; folderId: string }
): Promise<string> {
  const auth = new google.auth.OAuth2(config.clientId, config.clientSecret);
  auth.setCredentials({ refresh_token: config.refreshToken });

  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [config.folderId],
    },
    media: {
      mimeType: "application/sql",
      body: fs.createReadStream(filePath),
    },
  });

  return res.data.id ?? "";
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom pg_dump wrappers | execFileSync with DATABASE_URL | Already in codebase | Proven pattern exists in migrate-phase20.ts |
| cron + shell scripts | BullMQ repeatable jobs | v2.0 Phase 6 | All scheduling goes through BullMQ now |
| Env vars for all config | Settings table for admin-configurable values | v2.1 Phase 9 | Backup settings should use settings table |
| middleware.ts | proxy.ts | Project convention | Maintenance mode guard goes in proxy.ts |

**Deprecated/outdated:**
- Using `middleware.ts`: Project convention is `proxy.ts` (VERIFIED: AGENTS.md)
- Using `npm` or `yarn`: Project convention is `pnpm` only (VERIFIED: AGENTS.md)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `execFile` (async) is preferred over `execFileSync` (sync) for backup operations triggered from server actions to avoid blocking the event loop | Architecture Patterns | If wrong, sync calls in server actions could cause timeouts but would still work for small databases |
| A2 | `psql` can restore a plain SQL dump produced by `pg_dump` with `--clean` flag to drop existing objects before creating new ones | Restore Operations | If wrong, alternative approach would be to explicitly drop tables before running psql |
| A3 | `pg_stat_activity` can be used to terminate active connections before restore without breaking the Drizzle connection pool permanently | Pitfall 3 | If wrong, the app may need a full restart after restore |
| A4 | The `backups/` directory should be created at project root (same level as `src/`), consistent with migrate-phase20.ts pattern | File Storage | If wrong, directory location just needs adjustment |
| A5 | The maintenance page at `/maintenance` can be a simple static page served by Next.js without authentication | Proxy Guard | If wrong, may need to handle it differently in proxy.ts |

## Open Questions

1. **Should manual backups run synchronously in the server action or be offloaded to a BullMQ job?**
   - What we know: Server actions should be fast. pg_dump can take seconds to minutes depending on database size.
   - What's unclear: Whether the admin expects immediate feedback or is okay with "backup started" notification.
   - Recommendation: Offload to a BullMQ job even for manual backups. The server action creates a "pending" backup record, queues the job, and returns immediately. The admin UI shows "In Progress" status and polls for completion. This matches the established async pattern.

2. **How should restore handle the Drizzle ORM connection pool during database restore?**
   - What we know: Drizzle uses postgres.js which maintains a connection pool. During restore, all tables are dropped and recreated.
   - What's unclear: Whether the connection pool survives a full database restore, or if the app needs a hard restart.
   - Recommendation: After restore completes, gracefully terminate and reconnect the pool. This may require a process restart (`process.exit(0)` with a process manager like PM2) or a manual reconnection step.

3. **What is the maximum expected database size for backup operations?**
   - What we know: This is a self-hosted SaaS platform for Bangladeshi WooCommerce store owners. Early-stage data is likely small (MB range).
   - What's unclear: Whether backup times could grow to minutes or hours.
   - Recommendation: Design for 5-minute timeout initially, configurable via settings. Show progress indication for manual backups.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL (pg_dump) | Backup creation | NOT on PATH (Windows dev) | -- | Install PostgreSQL client tools for dev; check at runtime in production |
| PostgreSQL (psql) | Restore operations | NOT on PATH (Windows dev) | -- | Install PostgreSQL client tools for dev; check at runtime in production |
| Redis | BullMQ backup queue | Available (env configured) | -- | BullMQ queues degrade gracefully when Redis unavailable |
| Node.js | Runtime | Available | -- | -- |
| pnpm | Package management | Available | -- | -- |
| DATABASE_URL | Database connection | Configured | -- | -- |
| REDIS_URL | Queue connection | Configured | -- | In-memory fallback for dev |

**Missing dependencies with no fallback:**
- pg_dump binary: Required for backup creation. Must be installed on the production server. The system should detect availability and show a clear status in the admin dashboard. Dev machines without pg_dump cannot test backup creation but can test the UI.

**Missing dependencies with fallback:**
- psql binary: Required for restore. Same detection approach as pg_dump.
- Redis: Falls back to in-memory store (existing pattern in redis.ts), but BullMQ jobs will not run. Manual backups via server actions would still work (with async execFile).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No test framework installed |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| D-01 | Local backup file creation in backups/ directory | manual-only (requires pg_dump) | N/A | No |
| D-03 | File naming convention backup-{timestamp}-{type}.sql | unit | N/A | No |
| D-05 | Restore flow with pre-restore backup | manual-only (requires psql) | N/A | No |
| D-06 | Restore status polling via Redis key | integration | N/A | No |
| D-07 | Maintenance mode blocks non-admin routes | integration | N/A | No |
| D-09 | Cron pattern mapping for preset intervals | unit | N/A | No |
| D-10 | Retention policy removes oldest backups | unit | N/A | No |
| D-12 | Backup dashboard displays KPI cards and data table | manual-only (UI) | N/A | No |

### Sampling Rate
- **Per task commit:** Manual verification via dev server
- **Per wave merge:** Full manual verification of backup/restore flow
- **Phase gate:** All 7 success criteria manually verified

### Wave 0 Gaps
- No test framework installed in this project. Testing is manual-only per project convention.
- No automated tests exist for any existing phase functionality.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Better Auth session check, requireAdmin() guard on all actions |
| V3 Session Management | yes | Better Auth session validation in API routes |
| V4 Access Control | yes | requireAdmin() role check in all backup server actions and API routes |
| V5 Input Validation | yes | zod validation for settings inputs, file path validation for download |
| V6 Cryptography | partial | Cloud credential encryption at rest (Claude's discretion) |

### Known Threat Patterns for Backup & Restore Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal in file download | Tampering | Validate backup ID against database record, never accept file paths from user input |
| Command injection via pg_dump args | Tampering | Use execFileSync with array args (not shell string), validate DATABASE_URL from env |
| Unauthorized backup download | Information disclosure | requireAdmin() in download API route, session check |
| Cloud credential exposure | Information disclosure | Encrypt credentials in settings table, never send to client |
| Restore DOS (repeated restores) | Denial of Service | Maintenance mode prevents concurrent restores, rate limit restore trigger |
| Backup file access via URL guessing | Spoofing | Use UUID-based backup IDs, never expose file paths in URLs |

## Sources

### Primary (HIGH confidence)
- Codebase: `src/jobs/queues.ts` -- Queue definitions, Redis connection pattern
- Codebase: `src/jobs/workers/subscription-lifecycle.ts` -- Worker template with repeatable job scheduling
- Codebase: `src/jobs/workers/analytics-aggregation.ts` -- Second worker template for consistency
- Codebase: `scripts/migrate-phase20.ts` -- pg_dump execFileSync pattern with cross-platform detection
- Codebase: `src/lib/module-init.ts` -- Worker registration pattern at startup
- Codebase: `src/lib/db/schema.ts` -- Drizzle ORM schema patterns, table and enum definitions
- Codebase: `src/app/(admin)/actions/admin-settings.ts` -- Server action pattern with requireAdmin()
- Codebase: `src/components/admin/SettingsShell.tsx` -- Settings navigation structure
- Codebase: `src/data/dashboard-nav.ts` -- Admin sidebar navigation items
- Codebase: `src/app/api/invoices/[id]/pdf/route.ts` -- File download API route pattern
- Codebase: `src/proxy.ts` -- Middleware/proxy structure for maintenance mode integration
- Codebase: `src/lib/redis.ts` -- Redis connection and kvGet/kvSet helpers for restore status

### Secondary (MEDIUM confidence)
- BullMQ documentation (docs.bullmq.io) -- Repeatable jobs API, cron patterns
- @aws-sdk/client-s3 npm registry -- Version 3.1061.0, PutObjectCommand API
- googleapis npm registry -- Version 173.0.0, OAuth2 and Drive API

### Tertiary (LOW confidence)
- pg_restore --clean flag behavior with plain SQL dumps: assumed to work with psql on .sql files produced by pg_dump [ASSUMED]
- Google OAuth refresh token long-term stability: assumed to work indefinitely if used periodically [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed or verified via npm registry. Existing codebase patterns are proven across multiple phases.
- Architecture: HIGH - Every pattern (BullMQ worker, admin settings, server actions, proxy guard) exists in the codebase and is well-documented.
- Pitfalls: HIGH - Derived from actual codebase analysis (e.g., Windows dev machine without pg_dump) and well-known PostgreSQL operational concerns.

**Research date:** 2026-06-04
**Valid until:** 2026-07-04 (stable -- core libraries are mature, patterns are established in codebase)
