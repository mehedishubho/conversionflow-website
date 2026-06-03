# Phase 21: Backup & Restore System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-04
**Phase:** 21-backup-restore
**Areas discussed:** Backup storage & location, Restore UX & safety, Scheduled backup config, Backup dashboard UI

---

## Backup Storage & Location

| Option | Description | Selected |
|--------|-------------|----------|
| Local filesystem only | Backups in `backups/` directory, no cloud dependency | |
| Local + optional S3 upload | Local primary, optional S3-compatible upload | |
| S3-compatible only | No local copy, hard external dependency | |

**User's choice:** Local + configurable cloud provider (S3, Google Drive, R2) — expanded beyond presented options to include Google Drive and R2 specifically.

### Cloud Destination Count

| Option | Description | Selected |
|--------|-------------|----------|
| One destination at a time | Single set of credentials, switchable provider | ✓ |
| Multiple simultaneous destinations | Upload to all configured providers at once | |

**User's choice:** One destination at a time

### Backup File Format

| Option | Description | Selected |
|--------|-------------|----------|
| Plain SQL (.sql) | Human-readable, standard `psql` restore | ✓ |
| Custom compressed (-Fc) | Smaller files, requires `pg_restore` | |
| Configurable in settings | Admin picks format per backup | |

**User's choice:** Plain SQL (.sql)

### Google Drive Integration

| Option | Description | Selected |
|--------|-------------|----------|
| OAuth 2.0 with refresh token | Standard consent flow, persistent token | ✓ |
| Service account with key file | No browser flow, requires Workspace | |
| API key only | Limited Drive API access | |

**User's choice:** OAuth 2.0 with refresh token

### Google Drive Folder Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Single folder ID | Admin specifies one Drive folder | ✓ |
| Auto-organized folder structure | System creates date-based hierarchy | |

**User's choice:** Single folder ID

**Notes:** User specifically requested Google Drive support alongside S3/R2, with configurable cloud provider from admin settings.

---

## Restore UX & Safety

### Restore Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-backup + confirm + maintenance mode | Full safety: pre-backup, confirmation, app locked | ✓ |
| Auto-backup + confirm (no maintenance) | Safety backup but app stays live | |
| Manual maintenance mode required | Admin must lock app first | |

**User's choice:** Auto-backup + confirm + maintenance mode

### Restore Progress Display

| Option | Description | Selected |
|--------|-------------|----------|
| Status page with live polling | Real-time stage updates, polling endpoint | ✓ |
| Simple spinner overlay | Generic loading indicator | |

**User's choice:** Status page with live polling

### Maintenance Mode Implementation

| Option | Description | Selected |
|--------|-------------|----------|
| Settings flag + proxy check | `maintenance_mode` in settings, proxy blocks non-admin | ✓ |
| Banner only (no blocking) | Warning banner, no access restriction | |
| Full process shutdown | Kill Next.js process entirely | |

**User's choice:** Settings flag + proxy check

### Restore Failure Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-rollback to pre-restore backup | Automatic safety net on failure | ✓ |
| Stop + manual rollback | Admin decides next step | |
| Retry then auto-rollback | Up to 2 retries before rollback | |

**User's choice:** Auto-rollback to pre-restore backup

---

## Scheduled Backup Configuration

### Schedule Options

| Option | Description | Selected |
|--------|-------------|----------|
| Preset intervals (Disabled/6h/Daily/Weekly/Monthly) | Simple dropdown, no cron syntax | ✓ |
| Custom cron expression | Full flexibility, requires cron knowledge | |
| Presets + advanced cron option | Both modes with toggle | |

**User's choice:** Preset intervals

### Retention Policy

| Option | Description | Selected |
|--------|-------------|----------|
| Keep last N backups (default 10) | Count-based rotation, predictable disk usage | ✓ |
| Keep for N days | Time-based rotation, compliance-friendly | |
| Both options (count or days) | Admin chooses strategy | |

**User's choice:** Keep last N backups

### Retention Default

| Option | Description | Selected |
|--------|-------------|----------|
| Default: 10 | 10 days of daily backups | ✓ |
| Default: 5 | More conservative disk usage | |
| No default (must configure) | Explicit setup required | |

**User's choice:** Default: 10

### Settings Location

| Option | Description | Selected |
|--------|-------------|----------|
| Admin Settings > Backup | Centralized settings, follows existing pattern | ✓ |
| Inline on /admin/backup page | Settings panel on backup page | |

**User's choice:** Admin Settings > Backup

---

## Backup Dashboard UI

### Page Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Summary cards + data table | KPI cards on top, full table below | ✓ |
| Data table only | Minimal, no summary | |
| Card-based timeline | Visual cards per backup | |

**User's choice:** Summary cards + data table

### Backup Types

| Option | Description | Selected |
|--------|-------------|----------|
| Full database dump only | Always complete pg_dump, simplest restore | ✓ |
| Full + selective table dumps | Granular but complex restore logic | |

**User's choice:** Full database dump only

### Empty State

| Option | Description | Selected |
|--------|-------------|----------|
| Illustrated empty state + CTA | Icon + message + action buttons | ✓ |
| Simple text message | Basic "no backups" text | |

**User's choice:** Illustrated empty state + CTA

### Table Columns

| Option | Description | Selected |
|--------|-------------|----------|
| 6 columns: Filename/Date/Size/Type/Status/Actions | Complete info without clutter | ✓ |
| 5 columns (no filename) | Cleaner but loses identification | |
| 7 columns with Duration + Cloud sync | More detail, wider table | |

**User's choice:** 6 columns: Filename/Date/Size/Type/Status/Actions

### Row Actions

| Option | Description | Selected |
|--------|-------------|----------|
| 3 actions: Download/Restore/Delete | Standard CRUD, cloud upload is automatic | ✓ |
| 4 actions: + Cloud Upload | Manual re-upload option | |

**User's choice:** 3 actions: Download/Restore/Delete

### Table Filtering

| Option | Description | Selected |
|--------|-------------|----------|
| Search + Type + Status filters | Three filter controls, covers common use cases | ✓ |
| Search only | Minimal filtering | |
| Comprehensive filters (search, type, status, date range, size) | Full power, heavy UI | |

**User's choice:** Search + Type + Status filters

### Table Sorting

| Option | Description | Selected |
|--------|-------------|----------|
| Sortable by Date/Size/Type | Click column headers to sort | ✓ |
| Fixed sort (newest first) | No sorting options | |

**User's choice:** Sortable by Date/Size/Type

---

## Claude's Discretion

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

## Deferred Ideas

None — discussion stayed within phase scope
