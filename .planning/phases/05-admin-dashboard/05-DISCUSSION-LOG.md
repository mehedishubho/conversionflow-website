# Phase 5: Admin BI Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 05-admin-dashboard
**Areas discussed:** Dashboard overview layout, Revenue charts & filtering, User & invoice management, Data export & activity feed, Admin notifications

---

## Dashboard Overview Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Cards + Chart + Tables | Top row of 4-6 KPI metric cards, full-width revenue chart, recent activity + recent orders side by side | ✓ |
| Chart-heavy with inline metrics | 2-3 charts stacked with small metric badges in headers | |
| Metrics-only with separate analytics | Key numbers in large cards with trend arrows, charts on separate page | |

**User's choice:** Cards + Chart + Tables
**Notes:** Classic BI dashboard layout. Top row KPIs, chart below, activity + orders at bottom.

### KPI Metrics

| Option | Description | Selected |
|--------|-------------|----------|
| 4 core KPIs | Total Revenue, MRR, Active Customers, Total Orders | ✓ |
| 6 KPIs (adds ARR + CLV) | Adds ARR and customer lifetime value | |
| 6 operational KPIs | Total Revenue, Pending, Completed, Refund Rate, Active Licenses, Failed Payments | |

**User's choice:** 4 core KPIs
**Notes:** Clean and focused. MRR = current month completed orders sum.

### Trend Indicators

| Option | Description | Selected |
|--------|-------------|----------|
| vs previous month | Percentage change vs last month with up/down arrows | ✓ |
| vs same period last year | YoY comparison | |
| No trends on cards | Raw numbers only, trends in charts | |

**User's choice:** vs previous month

### Bottom Section

| Option | Description | Selected |
|--------|-------------|----------|
| Activity + Recent orders | Left: activity feed (15-20 events). Right: recent orders table (5-10) | ✓ |
| Recent orders + Top plans | Orders table + plan breakdown chart | |
| Full-width orders only | Single table spanning bottom | |

**User's choice:** Activity + Recent orders

### MRR Calculation

| Option | Description | Selected |
|--------|-------------|----------|
| Current month revenue | Sum of completed orders in current calendar month | ✓ |
| Active license-based | Revenue from active licenses only | |

**User's choice:** Current month revenue
**Notes:** Since ConversionFlow uses one-time purchases (not subscriptions), MRR is approximate.

### Sales Page Merge

| Option | Description | Selected |
|--------|-------------|----------|
| Merge into dashboard | Redirect /admin/sales to /admin/dashboard | ✓ |
| Keep separate sales page | Separate page with detailed table + filters | |

**User's choice:** Merge into dashboard

### Date Range

| Option | Description | Selected |
|--------|-------------|----------|
| Preset ranges | Dropdown: 7d / 30d / 90d / This Year | ✓ |
| Custom date range picker | Calendar popup with start/end | |

**User's choice:** Preset ranges

---

## Revenue Charts

| Option | Description | Selected |
|--------|-------------|----------|
| Single adaptive chart | Chart type switches based on range (daily bars 7d, weekly area 30d, etc.) | ✓ |
| Revenue trend + Plan breakdown | Area chart + donut chart for plan distribution | |
| Separate analytics page | Multiple charts on dedicated /admin/analytics page | |

**User's choice:** Single adaptive chart
**Notes:** Use existing ApexCharts with reference component patterns.

---

## User Management

| Option | Description | Selected |
|--------|-------------|----------|
| Inline actions on table | Action buttons directly on each row | |
| Detail page per user | /admin/users/[id] with profile, orders, licenses, actions | ✓ |
| Modal/slide-in detail panel | Slide-in panel or modal with user info | |

**User's choice:** Detail page per user
**Notes:** Holistic view — profile + orders + licenses + activity.

## Invoice Management

| Option | Description | Selected |
|--------|-------------|----------|
| Filter tabs + mark as paid | Status filters + mark paid button | |
| Filters + mark paid + send reminders | Adds email reminder button for pending orders | ✓ |
| Status filters only | Just filter tabs, actions on Orders page | |

**User's choice:** Filters + mark paid + send reminders
**Notes:** Needs payment reminder email template. Mark as paid reuses verifyOrder logic.

---

## Data Export

| Option | Description | Selected |
|--------|-------------|----------|
| CSV only, client-side | Blob + download, no server dependencies | ✓ |
| CSV + Excel | Adds xlsx library dependency | |
| CSV + PDF | Server-side PDF generation | |

**User's choice:** CSV only, client-side
**Notes:** BDT currency formatting, BD date format.

## Activity Feed

| Option | Description | Selected |
|--------|-------------|----------|
| Simple feed on dashboard | Last 15-20 events from audit_logs on overview | |
| Dedicated page + dashboard mini-feed | /admin/activity with pagination + filters + mini-feed on overview | ✓ |
| Real-time with polling | 30s refresh polling on dashboard | |

**User's choice:** Dedicated page + dashboard mini-feed
**Notes:** Filters by event type (order, license, refund, ticket, user), date range.

---

## Admin Notifications

| Option | Description | Selected |
|--------|-------------|----------|
| Extend existing dropdown | Admin-scoped queries in NotificationDropdown | ✓ |
| Dedicated notification center page | Separate /admin/notifications page with full history | |

**User's choice:** Extend existing dropdown
**Notes:** Types: payment_failed, license_expiring, new_signup, new_ticket, fraud_alert.

---

## Claude's Discretion

- Exact SQL query structure for aggregate KPI calculations
- ApexCharts configuration details (colors, tooltip formatting, axis labels)
- Activity feed icon mapping and description formatting
- CSV utility function implementation
- Admin notification query filtering logic
- /admin/licenses page scope

## Deferred Ideas

- Excel and PDF export formats
- Real-time polling for activity feed
- Separate /admin/analytics page with multiple chart types
- CLV and ARR KPI metrics
- Dedicated /admin/notifications center page
