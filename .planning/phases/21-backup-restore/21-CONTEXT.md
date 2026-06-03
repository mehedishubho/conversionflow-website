# Phase 21: Backup & Restore System - Context

**Gathered:** 2026-06-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a complete backup and restore system accessible from the admin dashboard. Admin can create on-demand full database backups, configure scheduled automatic backups, restore from any backup with safety guards, and manage backup lifecycle (download, delete, rotation). System uses pg_dump for backups, BullMQ for scheduled jobs, and supports optional cloud upload to S3/Google Drive/R2.

**In scope:**
- Backup creation: full pg_dump backups via admin UI or scheduled BullMQ jobs
- Backup storage: local filesystem + optional cloud upload (one configurable destination: S3, Google Drive, or R2)
- Backup restore: one-click restore with auto pre-restore backup, maintenance mode, and auto-rollback on failure
- Backup rotation: configurable retention (keep last N backups, default 10)
- Scheduled backups: preset intervals (Disabled, Every 6 hours, Daily, Weekly, Monthly) via BullMQ repeatable jobs
- Admin UI: /admin/backup page with summary cards + data table, settings at /admin/settings/backup
- Cloud integration: Google Drive via OAuth 2.0 with refresh token, S3-compatible via access/secret keys
- Maintenance mode: settings flag checked by proxy, blocks non-admin routes during restore
- Audit logging: all backup/restore/rotation operations logged via existing audit system
- File download: API route for downloading backup .sql files

**NOT in scope (later phases):**
- Incremental/differential backups
- Selective table dumps
- Backup encryption at rest
- Multiple simultaneous cloud destinations
- Backup verification/validation (testing restore automatically)
- Custom cron expression scheduling

</domain>

<decisions>
## Implementation Decisions

### Backup Storage & Location
- **D-01:** Backups stored on local filesystem in `backups/` directory as the primary storage. Every backup is saved locally first, then optionally uploaded to a configured cloud destination.
- **D-02:** Admin configures ONE cloud destination at a time (S3-compatible, Google Drive, or Cloudflare R2). Can switch providers by changing config. Not simultaneous multi-destination.
- **D-03:** Backup format is plain SQL (.sql) via `pg_dump`. Human-readable, inspectable, compatible with standard `psql` restore. File naming: `backup-{YYYYMMDD-HHmmss}-{type}.sql` where type is `manual` or `scheduled`.
- **D-04:** Google Drive integration uses OAuth 2.0 with refresh token. Admin creates Google Cloud project, enables Drive API, goes through consent flow once. System stores refresh token for ongoing uploads. Backup files upload to a single folder specified by folder ID in settings.

### Restore UX & Safety
- **D-05:** Restore flow: (1) Auto-create pre-restore backup of current state, (2) Show confirmation dialog with backup filename and timestamp, (3) Enable maintenance mode via settings flag, (4) Run `psql` restore, (5) Disable maintenance mode on completion. Admin never loses current state.
- **D-06:** Restore progress displayed via status page with live polling. Status stages: Creating pre-restore backup → Enabling maintenance mode → Dropping tables → Restoring data → Verifying → Complete. UI polls a status endpoint during restore.
- **D-07:** Maintenance mode uses a `maintenance_mode` flag in the `settings` table. Proxy.ts (or layout) checks this flag and shows a "Site under maintenance" page for all non-admin routes. Admin routes remain accessible for monitoring. Flag auto-removed when restore completes or fails.
- **D-08:** If restore fails mid-way, automatically rollback to the pre-restore backup. System always has a safety net. Admin sees error details and gets a notification. App returns to pre-restore state.

### Scheduled Backup Configuration
- **D-09:** Preset interval options: Disabled, Every 6 hours, Daily (default), Weekly, Monthly. Simple dropdown in settings — no custom cron syntax. Maps to BullMQ repeatable job patterns internally.
- **D-10:** Retention policy: keep last N backups (default: 10). Admin can configure N (options: 5, 10, 15, 20, or custom). Oldest backups auto-deleted when limit exceeded during rotation. Rotation runs after each backup completes.
- **D-11:** Backup settings located at Admin Settings > Backup category (alongside Payment, SMTP, SEO in SettingsShell.tsx navigation). Follows existing settings sub-page pattern.

### Backup Dashboard UI
- **D-12:** /admin/backup page layout: KPI summary cards at top (total backups, last backup time, next scheduled, total disk usage) + full-width data table below listing all backups.
- **D-13:** Data table columns: Filename, Date & Time, Size, Type (Manual/Scheduled), Status (Completed/Failed/In Progress), Actions (Download, Restore, Delete). 6 columns.
- **D-14:** Table filtering: Search bar (search by filename) + Type filter dropdown (All/Manual/Scheduled) + Status filter dropdown (All/Completed/Failed). Table sorting: sortable by Date, Size, or Type column headers. Default sort: newest first.
- **D-15:** Backup type is always full database dump. No selective table dumps. All data is interconnected in the SaaS platform.
- **D-16:** Empty state: illustration/icon + "No backups yet" message + prominent "Create your first backup" button + "Set up automatic backups" prompt. Guides admin to take action.
- **D-17:** Actions per row: Download (downloads .sql file via API route), Restore (triggers restore flow with D-05 safety), Delete (removes backup file from local + cloud + metadata). No separate "Cloud Upload" button — cloud upload is automatic if configured.

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-Level Specs
- `.planning/ROADMAP.md` §"Phase 21: Backup & Restore System" — Success criteria 1-7, dependency on Phase 20
- `.planning/PROJECT.md` §"Key Decisions" — Self-contained licensing, self-hosted deployment constraint

### Prior Phase Context (MUST read for integration points)
- `.planning/phases/20-migration-cleanup/20-CONTEXT.md` — D-10: pg_dump backup pattern in migrate-phase20.ts, `backups/` directory, `execFileSync` pattern
- `.planning/phases/19-portal-analytics/19-CONTEXT.md` — BullMQ worker patterns, analytics aggregation job structure
- `.planning/phases/18-subscription-status/18-CONTEXT.md` — BullMQ scheduling with cron patterns, Redis queue management

### Existing Infrastructure (MUST use)
- `src/jobs/queues.ts` — Queue definitions, Redis connection pattern, add `backupQueue`
- `src/jobs/workers/subscription-lifecycle.ts` — Worker pattern: `schedule{Job}Job()` + `start{Job}Worker()` + process function
- `src/jobs/workers/analytics-aggregation.ts` — Second worker example for pattern consistency
- `src/lib/module-init.ts` — Worker registration at startup (`initializeModules()`)
- `src/lib/db/schema.ts` — `settings` table schema (key-value), add backup-related settings
- `src/app/(admin)/actions/admin-settings.ts` — Settings CRUD pattern with `requireAdmin()` + validation + audit log
- `src/lib/audit.ts` — `createAuditLog()` function, `AuditLogEntry` interface
- `src/data/dashboard-nav.ts` — `adminNavItems` array, add Backup nav item
- `src/components/admin/SettingsShell.tsx` — Settings sub-navigation, `SETTINGS_NAV` array
- `scripts/migrate-phase20.ts` — pg_dump backup pattern: availability check, directory creation, `execFileSync`, cross-platform support

### API Patterns
- `src/app/api/invoices/[id]/pdf/route.ts` — File download pattern (Response with Uint8Array, Content-Disposition header)
- `src/app/(admin)/actions/admin-settings.ts` — Server action pattern with `requireAdmin()` guard

### Cloud Integration References
- Google Drive API v3 — File upload with OAuth 2.0 refresh token
- S3-compatible API — Standard putObject with access/secret credentials

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`scripts/migrate-phase20.ts`** — Exact pg_dump pattern: cross-platform detection, `execFileSync`, timestamped filenames, directory creation. Copy this approach directly.
- **`src/jobs/queues.ts`** — Add `backupQueue` to existing queue definitions. Uses `REDIS_URL` env var.
- **`src/jobs/workers/subscription-lifecycle.ts`** — Worker template: export `scheduleBackupJob()` and `startBackupWorker()`, register in module-init.
- **`src/lib/module-init.ts`** — `initializeModules()` function — add backup worker startup here.
- **`src/lib/audit.ts`** — `createAuditLog()` with flexible action strings (e.g., `admin.backup_created`, `admin.backup_restored`).
- **`src/components/admin/SettingsShell.tsx`** — Settings sub-nav with `SETTINGS_NAV` array. Add Backup entry.
- **`src/data/dashboard-nav.ts`** — `adminNavItems` — add `{ name: "Backups", icon: HardDrive, path: "/admin/backups" }`.
- **`src/app/api/invoices/[id]/pdf/route.ts`** — File download pattern with auth check.

### Established Patterns
- **Server actions** — `src/app/(admin)/actions/admin-*.ts` with `requireAdmin()` guard, try-catch, audit logging
- **Admin pages** — `src/app/(admin)/admin/*/page.tsx` with `export const dynamic = "force-dynamic"`, session check, role check
- **Settings storage** — Key-value in `settings` table, upsert via `admin-settings.ts`
- **BullMQ jobs** — Repeatable jobs with cron patterns, single-concurrency workers, error/completed event handlers
- **File downloads** — API route returning `Response` with `Content-Disposition: attachment` header

### Integration Points
- **`src/data/dashboard-nav.ts`** — Add Backup nav item to admin sidebar
- **`src/components/admin/SettingsShell.tsx`** — Add Backup to settings sub-navigation
- **`src/jobs/queues.ts`** — Add backup queue
- **`src/lib/module-init.ts`** — Register backup worker at startup
- **`src/lib/db/schema.ts`** — Potentially add `backups` table for metadata, or use `settings` table
- **`backups/` directory** — Local filesystem storage for backup files
- **Proxy/Layout** — Check `maintenance_mode` setting flag for maintenance page

</code_context>

<specifics>
## Specific Ideas

- Backup file naming: `backup-20260604-143022-manual.sql` or `backup-20260604-143022-scheduled.sql` — includes date, time, and trigger type.
- Summary cards: (1) Total Backups count with icon, (2) Last Backup timestamp with status indicator, (3) Next Scheduled Backup time, (4) Total Disk Usage with size. Four cards in a grid matching existing admin dashboard KPI pattern.
- Restore confirmation dialog: "Restore database from backup-20260604-143022-manual.sql (12.4 MB)? A backup of the current database will be created first." with Cancel and Restore buttons. Restore button is red/destructive styled.
- Maintenance mode user-facing page: Simple centered message "ConversionFlow is currently undergoing maintenance. We'll be back shortly." with the site logo. No login/admin links exposed to regular users.
- Google Drive settings: Client ID, Client Secret, Refresh Token (obtained via OAuth flow), Folder ID. S3 settings: Endpoint URL, Access Key, Secret Key, Bucket Name. Admin selects provider type in a dropdown, relevant fields appear.
- Rotation runs after each backup completes: query all backups sorted by date, if count > retention limit, delete oldest ones (local file + cloud file + metadata). Log each deletion in audit trail.
- Restore status polling: client polls `/api/admin/backup/restore/status` every 2 seconds. Status endpoint reads current restore state from Redis key or settings table. Status stages map to UI step indicators.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 21-backup-restore*
*Context gathered: 2026-06-04*
