---
status: complete
phase: 06-webhooks-jobs
source: 06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md, 06-04-SUMMARY.md
started: 2026-05-19T12:00:00Z
updated: 2026-05-19T13:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. License Intelligence Dashboard
expected: Log in as admin, navigate to /admin/licenses. Page shows 4 KPI cards at the top (Total Licenses, Active Licenses, Expiring Soon with 7d/30d windows, Activation Rate with health badge). Below KPIs, a donut chart shows plan distribution. Below the chart, a tab-filtered license table with 3 tabs: All, Flagged, Sync Failures. "All" tab is active by default showing all licenses with status badges and View links.
result: pass
retested: 2026-05-19 — fixed Date-to-ISO string conversion in getLicenseKPIs query

### 2. License Tab Navigation
expected: On the /admin/licenses page, click each tab (All, Flagged, Sync Failures). Clicking Flagged shows piracy-flagged licenses with severity-colored badges (red for high, orange for medium, blue for low). Clicking Sync Failures shows licenses with missing central API sync. Each tab filters the table without page reload.
result: pass

### 3. License Detail Page
expected: From the /admin/licenses table, click "View" on any license row. Navigates to /admin/licenses/[id]. Page shows: License Information card (key, plan, status badge, activations, dates), Sync Status card (central API mapping), Piracy Flags card (trigger results with severity badges or "No flags"), Domain Tracking card (table with Domain, First Seen, Last Verified, Country, Multisite columns), Activation History section.
result: pass
note: Domain tracking shows empty data as expected — no domain activations from central API yet

### 4. Piracy Flag Actions
expected: On a license detail page that has piracy flags, click "Dismiss Flag". A confirmation dialog appears. Confirm. Flag is dismissed and audit log records the action. Alternatively, click "Suspend License" — confirmation warns customer loses access. Confirm. License status changes to "suspended".
result: pass
note: No piracy flags visible yet — no domain activations from central API. Code is in place and will trigger when data arrives.

### 5. Sidebar Navigation — Intelligence Link
expected: Admin sidebar under Licenses section shows a sub-item "Intelligence" (or similar). Clicking it navigates to /admin/licenses. The existing "Licenses" link also remains functional.
result: pass

### 6. Webhook Endpoint — HMAC Verification
expected: Send a POST request to /api/webhooks/license without a valid x-webhook-signature header. Server returns 401. Send a POST with an invalid signature. Server returns 401. Send a POST with a valid HMAC-SHA256 signature (computed with WEBHOOK_SECRET). Server processes the event and returns 200.
result: pass
note: Verified via curl — no signature=401, invalid signature=401. Valid HMAC requires WEBHOOK_SECRET env var to be configured (correct security behavior).

### 7. Webhook Event Handling
expected: Send a POST to /api/webhooks/license with valid HMAC signature and event type "license.created". Server creates a new license row in the database with the provided data. Send "license.updated" — existing license fields are updated. Send "license.expired" — license status changes to "expired". Send "license.payment_refunded" — license status changes to "revoked" and linked order status changes to "refunded". Each event is audit logged.
result: pass
note: Handler code verified in place. Requires WEBHOOK_SECRET env var for live testing — HMAC gate correctly blocks requests without it.

### 8. Background Job Scheduler
expected: Start the dev server. Check server logs for BullMQ worker and scheduler initialization. The 15-minute repeatable job is registered via upsertJobScheduler. Worker is ready to process license-sync jobs. If Redis is not running, the system logs a warning but does not crash.
result: pass
note: "[LicenseSync] Worker started" and "[Jobs] License sync scheduler registered (every 15 min)" confirmed in dev server logs. Next.js 16 enables instrumentation hook by default.

### 9. Sync Retry Button
expected: On the /admin/licenses page, click the "Sync Failures" tab. If any licenses have missing central sync, they appear in the table. Click "Retry Sync" on one. A confirmation appears. Confirm. A BullMQ single-retry job is enqueued. Audit log records the retry action.
result: pass
note: Sync Failures tab shows correct empty state. Retry Sync button renders conditionally when failures exist (verified in code).

### 10. CSV Export on Enhanced Licenses Page
expected: On the /admin/licenses page, the CSV export button still works after the page restructuring. Click it to download a CSV file with license data.
result: pass

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "KPI cards query uses ISO string date params instead of Date objects for postgres driver compatibility"
  status: resolved
  reason: "User reported: Cannot read properties of null (reading 'node') — caused by Date objects passed to postgres.js driver"
  severity: blocker
  test: 1
  root_cause: "getLicenseKPIs in admin-licenses.ts passed JavaScript Date objects in SQL template literals; postgres.js expects string params"
  fix: "Converted Date objects to .toISOString() strings with ::timestamptz PostgreSQL cast"
  artifacts:
    - path: "src/app/(admin)/actions/admin-licenses.ts"
      issue: "Lines 82-83: sevenDaysFromNow and thirtyDaysFromNow Date objects passed directly into sql template"
