---
phase: 06-webhooks-jobs
plan: 03
subsystem: license-intelligence
tags: [kpi, donut-chart, tab-filter, admin-dashboard, license-management]
dependency_graph:
  requires: [db-schema, admin-auth, bullmq-queues, audit-logging]
  provides: [license-kpi-actions, kpi-cards, plan-chart, tab-filtered-table, intelligence-page]
  affects: [admin-licenses-page, dashboard-nav]
tech_stack:
  added: []
  patterns: [PostgreSQL COUNT FILTER, ApexCharts donut, tab-based client filtering, useTransition for optimistic UI]
key_files:
  created:
    - src/app/(admin)/actions/admin-licenses.ts
    - src/components/admin/LicenseIntelligenceKPIs.tsx
    - src/components/admin/LicensePlanChart.tsx
    - src/components/admin/LicenseIntelligenceClient.tsx
  modified:
    - src/app/(admin)/admin/licenses/page.tsx
    - src/data/dashboard-nav.ts
decisions:
  - Fixed LicenseRow type to use nullable number fields matching schema defaults (currentActivations, maxActivations)
  - Flagged tab shows empty state since piracy detection comes in Plan 04
metrics:
  duration: 5min
  tasks: 2
  files: 6
  completed: 2026-05-18
---

# Phase 06 Plan 03: License Intelligence Dashboard Summary

KPI cards, ApexCharts donut chart for plan distribution, and tab-filtered license management page with sync retry capability.

## Tasks Completed

### Task 1: Server actions for license KPIs, plan distribution, and sync retry
**Commit:** `1be0b76`

Created `src/app/(admin)/actions/admin-licenses.ts` with `"use server"` directive providing four server actions:
- `getLicenseKPIs()` -- Single PostgreSQL query using `COUNT(*) FILTER (WHERE ...)` for all status counts, expiring windows, and activation rate in one round trip
- `getPlanDistribution()` -- `GROUP BY plan` query for donut chart data
- `getLicenses(filter)` -- Supports "all", "flagged", and "sync_failures" filters; sync_failures finds licenses with missing central order mapping
- `retryLicenseSync(orderId)` -- Enqueues BullMQ single-retry job with exponential backoff, audit logged

### Task 2: KPI cards, plan chart, and enhanced licenses page
**Commit:** `995841f`

Created three new components and modified two existing files:
- `LicenseIntelligenceKPIs` -- 4 KPI cards (Total, Active, Expiring Soon with 7d/30d windows, Activation Rate with health badge)
- `LicensePlanChart` -- ApexCharts donut chart with dynamic import, 5 brand colors, dark mode support
- `LicenseIntelligenceClient` -- Client component with tab navigation (All/Flagged/Sync Failures), Retry Sync button with useTransition, View link per row
- Enhanced `/admin/licenses` page to compose KPIs + chart + tab-filtered table
- Updated sidebar nav with Intelligence sub-item under Licenses

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed nullable type mismatch in LicenseRow interface**
- **Found during:** Task 1 build verification
- **Issue:** `currentActivations` and `maxActivations` are nullable in schema (`.default(0)` / `.default(1)` but Drizzle infers `number | null`) but LicenseRow interface declared them as `number`
- **Fix:** Changed interface to `number | null` to match schema type inference
- **Files modified:** `src/app/(admin)/actions/admin-licenses.ts`
- **Commit:** `1be0b76`

## Threat Model Verification

All mitigations from the plan's threat model are implemented:
- T-06-10: `requireAdmin()` checks session role on every server action call
- T-06-11: `retryLicenseSync` validates admin session, audit logs the action
- T-06-12: KPI data is aggregate metrics behind admin auth, no PII exposed

## Self-Check: PASSED

- All 6 files exist on disk
- Both commits found in git log (`1be0b76`, `995841f`)
- `pnpm build` exits 0
- All acceptance criteria verified
