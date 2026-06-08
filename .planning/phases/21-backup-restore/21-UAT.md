---
status: complete
phase: 21-backup-restore
source: 21-01-SUMMARY.md, 21-02-SUMMARY.md, 21-03-SUMMARY.md, 21-04-SUMMARY.md, 21-05-SUMMARY.md
started: 2026-06-08T18:10:00Z
updated: 2026-06-08T18:20:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Backup Dashboard Page
expected: Navigate to /admin/backup. Page loads with 4 KPI cards (Total Backups, Last Backup, Next Scheduled, Disk Usage), a data table, and either backup rows or an empty state with "No backups yet" heading and Create First Backup button.
result: pass

### 2. Backup Sidebar Navigation
expected: In the admin sidebar, a "Backups" nav item with a HardDrive icon is visible. Clicking it navigates to /admin/backup.
result: pass

### 3. Create Manual Backup
expected: Click the "Create Backup" or "Create First Backup" button. A new backup row appears in the table with status "in_progress", then transitions to "completed" after processing. The KPI cards update (Total Backups increments, Last Backup shows recent timestamp).
result: issue
reported: "currently selected local and when I hit created backup nothing happen"
severity: major

### 4. Backup Table Filtering & Sorting
expected: In the backup table, the search input filters rows by text. The Type dropdown filters by backup type. The Status dropdown filters by status. Clicking column headers (Date, Size, Type) toggles sort direction.
result: blocked
blocked_by: prior-phase
reason: "Depends on test 3 — no backup data to filter/sort"

### 5. Download Backup File
expected: Click the download action on a completed backup row. A SQL file downloads to your machine.
result: blocked
blocked_by: prior-phase
reason: "Depends on test 3 — no backup available to download"

### 6. Restore Flow with Progress
expected: Click "Restore" on a backup row. A confirmation dialog appears showing the backup details and a warning. Click confirm. The dialog shows a progress view with step indicators (Pre-backup → Maintenance → Drop → Restore → Verify → Complete). Steps highlight as they progress. On completion, a success message appears.
result: blocked
blocked_by: prior-phase
reason: "Depends on test 3 — no backup available to restore"

### 7. Maintenance Mode During Restore
expected: While a restore is in progress, open an incognito/private window (non-admin). Non-admin pages should show the maintenance page with a maintenance message. Admin pages remain accessible.
result: blocked
blocked_by: prior-phase
reason: "Depends on test 6 — restore cannot be triggered without backup"

### 8. Delete Backup with Confirmation
expected: Click the delete action on a backup row. A confirmation dialog appears with Cancel and Delete buttons. Click Delete — the backup is removed from the table and the KPI cards update.
result: blocked
blocked_by: prior-phase
reason: "Depends on test 3 — no backup available to delete"

### 9. Backup Settings Page
expected: Navigate to /admin/settings/backup. The page shows three sections: Schedule Configuration (interval dropdown), Retention Policy (preset + custom), and System Requirements (pg_dump/psql availability badges, directory writable status). A Cloud Settings section appears below with a provider dropdown.
result: pass

### 10. Schedule & Retention Configuration
expected: On the backup settings page, change the schedule interval (e.g., from Disabled to Daily) and click Save. Reload the page — the setting persists. Change the retention count (try a preset like 15, and try Custom with a value like 7). Save and reload — both settings persist.
result: pass

## Summary

total: 10
passed: 4
issues: 1
pending: 0
skipped: 0
blocked: 5

## Gaps

- truth: "Clicking Create Backup creates a new backup row that transitions from in_progress to completed"
  status: failed
  reason: "User reported: currently selected local and when I hit created backup nothing happen"
  severity: major
  test: 3
  artifacts: []
  missing: []
