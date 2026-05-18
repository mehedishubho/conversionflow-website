# Phase 6: Webhooks, Background Jobs, and License Intelligence - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 06-webhooks-jobs
**Areas discussed:** License Intelligence Dashboard, Piracy Detection, Domain Tracking, Webhook/Sync Errors, Job Scheduling, Webhook Architecture, API Contract, License Detail Scope

---

## License Intelligence Dashboard

### Layout

| Option | Description | Selected |
|--------|-------------|----------|
| KPI cards + chart + table | Follows Phase 5 pattern. KPI cards at top, plan distribution chart, detailed table with filters. | ✓ |
| Table-only with filters | Skip cards/chart. Just a data-dense table with all metrics. | |
| Tabbed views | Separate tabs for Overview, By Plan, By Status. | |

**User's choice:** KPI cards + chart + table
**Notes:** Follows the established admin dashboard pattern from Phase 5.

### Metrics

| Option | Description | Selected |
|--------|-------------|----------|
| Status counts | Total, active, expired, revoked counts. | ✓ |
| Renewal rate by plan | % of licenses renewed before expiry, broken down by plan. | ✓ |
| Expiring soon count | Licenses expiring in 7/30 day windows. | ✓ |
| Activation rate | % of licenses activated vs purchased but unused. | ✓ |

**User's choice:** All four selected.

---

## Piracy Detection & Flagging

### Triggers

| Option | Description | Selected |
|--------|-------------|----------|
| Activation count exceeds plan limit | More domains than max_activations allows. | ✓ |
| Rapid domain activation burst | Multiple domains activated in short window (e.g., 5+ in 1 hour). | ✓ |
| Geographic anomaly detection | Activations from countries/IPs not matching customer profile. | ✓ |
| Cross-site activation match | Same key active on multiple unrelated sites. | ✓ |

**User's choice:** All four triggers selected.

### Action

| Option | Description | Selected |
|--------|-------------|----------|
| Review queue + manual action | Admin reviews flagged licenses, dismisses or takes action (suspend/revoke). | ✓ |
| Auto-suspend + admin review | System auto-suspends, admin reviews after fact. | |
| Flag only, no dedicated queue | Yellow badge on table, no dedicated review section. | |

**User's choice:** Review queue + manual action

---

## Domain Tracking

### Display

| Option | Description | Selected |
|--------|-------------|----------|
| Drill-down detail page | Click license row opens dedicated page with full domain list + metadata. | ✓ |
| Expandable table rows | Domains shown as expandable rows within licenses table. | |
| Inline domain badges | Small badges/tags in table cell (e.g., 'shop1.com +2 more'). | |

**User's choice:** Drill-down detail page

### Data

| Option | Description | Selected |
|--------|-------------|----------|
| Domain URL + activation timestamps | Which domain, when first seen, last checked. | ✓ |
| Multisite flag | Primary vs subsite flag for WordPress multisite. | ✓ |
| Geo/IP data per activation | Country/IP of activation origin. | ✓ |
| Last verification check | When central API last verified domain as active. | ✓ |

**User's choice:** All four selected.

---

## Webhook & Sync Error Handling

### Error Surfacing

| Option | Description | Selected |
|--------|-------------|----------|
| Licenses page filter + retry | Sync Failures tab on existing licenses page with retry buttons. | ✓ |
| Dedicated sync status page | Separate /admin/sync-status page with all operations. | |
| Notification-based only | Sync errors as admin notifications in dropdown. | |

**User's choice:** Licenses page filter + retry

### Webhook Events

| Option | Description | Selected |
|--------|-------------|----------|
| license.created | New license created on central API. | ✓ |
| license.updated | License details changed (status, plan, activation). | ✓ |
| license.expired | License expired naturally. | ✓ |
| license.payment_refunded | Payment refunded on central side. | ✓ |

**User's choice:** All four events.

---

## Job Scheduling

| Option | Description | Selected |
|--------|-------------|----------|
| BullMQ repeatable job | Uses existing Redis + BullMQ setup. No extra infrastructure. | ✓ |
| In-process cron (node-cron) | Simpler but dies with server process. | |
| External scheduler + API endpoint | Decoupled but adds external dependency. | |

**User's choice:** BullMQ repeatable job

---

## Webhook Processing Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Single route + dispatch | /api/webhooks/license validates HMAC, dispatches to event handlers. | ✓ |
| Separate routes per event | Multiple URL endpoints, one per event type. | |
| Queue-based processing | Validate then enqueue to BullMQ, worker processes async. | |

**User's choice:** Single route + dispatch

---

## Central API Webhook Contract

| Option | Description | Selected |
|--------|-------------|----------|
| Define expected contract, adjust later | TypeScript interfaces for expected payload. Adjust when API docs available. | ✓ |
| Log raw payloads first, validate later | Flexible handler that logs raw payloads before adding validation. | |

**User's choice:** Define expected contract, adjust later

---

## License Detail Page Scope

| Option | Description | Selected |
|--------|-------------|----------|
| License-only view | Domain tracking, activation history, sync status, piracy flags, license metadata. | ✓ |
| Customer + license combined | Adds customer profile, order history, support tickets. | |

**User's choice:** License-only view

---

## Claude's Discretion

- Exact KPI card styling and chart library choice
- Piracy flag severity levels and badge colors
- Domain tracking table column layout
- Webhook HMAC implementation details
- BullMQ repeatable job configuration
- Sync retry logic and error detail formatting
- License detail page component structure
- Plan distribution chart type

## Deferred Ideas

- Automated piracy enforcement (auto-suspend on detection)
- Real-time webhook monitoring dashboard
- License renewal flow through the platform
- Customer-facing domain management
- Webhook delivery retry from central API side
- Historical piracy trend charts
- Email notifications to customers about license expiry
