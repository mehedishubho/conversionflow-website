# Phase 5: Admin BI Dashboard - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin operators can view real-time business intelligence — revenue KPIs, sales charts, invoice management with filters and payment reminders, user management with detail pages and role/ban controls, activity feed from audit logs, data export as CSV, and admin-scoped notifications in the existing dropdown. The /admin/sales page merges into the dashboard overview.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Overview Layout
- **D-01:** Cards + Chart + Tables layout — top row of 4 KPI metric cards, full-width adaptive revenue chart below, then recent activity feed + recent orders table side by side at bottom
- **D-02:** 4 core KPIs: Total Revenue, MRR, Active Customers, Total Orders — shown as metric cards with up/down trend arrows
- **D-03:** Trend indicators show percentage change vs previous month (e.g., "+12.5% vs last month")
- **D-04:** MRR calculated as sum of all completed orders in the current calendar month (not license-based, since ConversionFlow uses one-time purchases)
- **D-05:** Bottom section: left side = recent activity feed (last 15-20 events from audit_logs), right side = recent orders table (last 5-10 orders)
- **D-06:** Merge /admin/sales into /admin/dashboard — redirect /admin/sales to /admin/dashboard. One unified executive overview page
- **D-07:** Preset date range selector on the dashboard: Last 7 days / Last 30 days / Last 90 days / This Year. Applies to both KPI trends and the revenue chart

### Revenue Charts
- **D-08:** Single adaptive chart on the dashboard overview — chart type switches based on selected range: daily bars for 7d, weekly area for 30d, monthly bars for 90d, yearly area for 12m
- **D-09:** Use existing ApexCharts installation — adapt the reference chart component pattern (dynamic import, ssr: false) from `src/components/charts/` and `src/components/ecommerce/StatisticsChart.tsx`

### User Management
- **D-10:** Dedicated user detail page at /admin/users/[id] — shows profile info, order history, license status, and action buttons (role change, ban/unban)
- **D-11:** Users list page (/admin/users) gets a "View" link on each row that navigates to the detail page
- **D-12:** Role assignment via dropdown on user detail page — can set customer/admin/support_staff/super_admin
- **D-13:** Ban/activate toggle on user detail page with optional ban reason field

### Invoice Management
- **D-14:** Add status filter tabs above the invoice table: All / Paid (completed) / Pending / Failed
- **D-15:** "Mark as Paid" button for pending orders — changes status to completed and triggers license creation + confirmation email (reuse verifyOrder logic)
- **D-16:** "Send Reminder" button for pending orders — emails the customer about their pending payment. Needs a payment reminder email template

### Data Export
- **D-17:** CSV export only, client-side generation using Blob + download. No server-side processing needed
- **D-18:** "Export CSV" button above each data table (orders, invoices, users). Exports currently filtered/visible data
- **D-19:** No Excel or PDF export — CSV covers the use case without adding dependencies

### Activity Feed
- **D-20:** Dedicated /admin/activity page with full pagination, filters by event type (order, license, refund, ticket, user), and date range filtering
- **D-21:** Mini activity feed on the dashboard overview — last 15-20 events from audit_logs, no pagination, chronological with icon + description + timestamp

### Admin Notifications
- **D-22:** Extend the existing NotificationDropdown component in the header — add admin-scoped notification queries (failed payments, expiring licenses, new signups, support tickets)
- **D-23:** Admin notification types: payment_failed, license_expiring, new_signup, new_ticket, fraud_alert — stored in the existing notifications table with admin-targeted userId or a special admin role flag

### Claude's Discretion
- Exact SQL query structure for aggregate KPI calculations
- ApexCharts configuration details (colors, tooltip formatting, axis labels)
- Activity feed icon mapping and description formatting
- CSV utility function implementation (column headers, date formatting, escaping)
- Admin notification query filtering logic
- How to handle the /admin/licenses page (nav item exists but no page — decide scope)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database & Schema
- `src/lib/db/schema.ts` — Orders, users, licenses, notifications, audit_logs, settings table definitions with enums
- `src/lib/audit.ts` — createAuditLog() function, the foundation for the activity feed

### Chart Components (reference patterns)
- `src/components/charts/line/LineChartOne.tsx` — ApexCharts area/line chart pattern with dynamic import
- `src/components/charts/bar/BarChartOne.tsx` — ApexCharts bar chart pattern with dynamic import
- `src/components/ecommerce/StatisticsChart.tsx` — Chart with date range picker (flatpickr), dual series, tab switching
- `src/components/ecommerce/MonthlySalesChart.tsx` — Bar chart with dropdown menu pattern

### Admin Actions (existing patterns to extend)
- `src/app/(admin)/actions/admin-orders.ts` — verifyOrder, rejectOrder, issueRefund patterns with requireAdmin guard
- `src/app/(admin)/actions/admin-settings.ts` — savePaymentAccount, getPaymentSettings patterns

### Admin Pages (existing to enhance/replace)
- `src/app/(admin)/admin/dashboard/page.tsx` — Current placeholder to replace
- `src/app/(admin)/admin/sales/page.tsx` — Current sales page to merge into dashboard
- `src/app/(admin)/admin/users/page.tsx` — Current read-only users table to enhance
- `src/app/(admin)/admin/invoices/page.tsx` — Current invoice listing to enhance
- `src/app/(admin)/admin/orders/page.tsx` — Order management (reference, not changing)

### Notification Infrastructure
- `src/app/(portal)/actions/notifications.ts` — getNotifications, markNotificationRead patterns (customer-scoped, need admin equivalent)
- `src/components/header/NotificationDropdown.tsx` — Existing notification UI component to extend for admin

### Email Infrastructure
- `src/lib/email.ts` — Email sending utility (for payment reminder emails)
- `src/lib/invoices.tsx` — Invoice PDF generation (reference for email template pattern)

### Navigation
- `src/data/dashboard-nav.ts` — Admin nav items (update if merging sales or adding new pages)

### UI Components
- `src/components/ui/table/` — Table, TableHeader, TableBody, TableRow, TableCell primitives
- `src/components/ui/badge/Badge.tsx` — Status badge component
- `src/components/ui/button/Button.tsx` — Button component
- `src/components/ui/modal/` — Modal component
- `src/components/form/Select.tsx` — Dropdown select component
- `src/components/common/ComponentCard.tsx` — Card wrapper used throughout admin pages
- `src/components/common/PageBreadCrumb.tsx` — Breadcrumb component

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **ApexCharts** (`apexcharts@^5.12.0`, `react-apexcharts@^2.1.0`): Fully installed with 5 reference chart components using `dynamic(() => import("react-apexcharts"), { ssr: false })` pattern
- **StatisticsChart**: Has flatpickr date range integration — can be adapted for preset range selector
- **auditLogs table + createAuditLog()**: Fully operational audit system capturing actor, action, target, details, IP, timestamp
- **NotificationDropdown**: Complete notification UI with real-time unread count, mark-all-as-read, icon mapping by type
- **Invoice PDF generation**: `@react-pdf/renderer` already installed for PDF downloads
- **Email utility**: `src/lib/email.ts` exists for sending transactional emails

### Established Patterns
- **requireAdmin()** guard: All admin server actions use this pattern from `admin-orders.ts`
- **Server Components by default**: Admin pages are server components, action handlers are client components
- **useTransition + router.refresh()**: Client components use this for optimistic updates after server actions
- **ComponentCard wrapper**: All admin page sections use `ComponentCard` with title/desc props
- **PageBreadcrumb**: Every page starts with breadcrumb navigation
- **Table primitives**: Consistent table layout with TableHeader, TableBody, TableRow, TableCell

### Integration Points
- `/admin/dashboard` — Replace placeholder with real dashboard
- `/admin/sales` — Merge into dashboard, add redirect
- `/admin/users` — Add View link, create detail page at /admin/users/[id]
- `/admin/invoices` — Add filter tabs, mark as paid, send reminder actions
- `/admin/activity` — New page for full activity feed
- `/admin/licenses` — Nav item exists but no page file (decide scope)
- `NotificationDropdown` — Extend with admin-scoped queries
- `dashboard-nav.ts` — Update nav if structure changes

</code_context>

<specifics>
## Specific Ideas

- The dashboard overview should feel like an executive summary — at a glance, the admin knows revenue health, recent activity, and pending items
- Activity feed events should have clear icon differentiation (shopping cart for orders, key for licenses, alert for failures, etc.)
- The user detail page should show a holistic view: profile + their orders + their licenses + their activity, not just a form
- CSV export should use BDT currency formatting and BD date format consistent with the rest of the admin UI

</specifics>

<deferred>
## Deferred Ideas

- Excel and PDF export formats — CSV covers the current need; can add formats later if requested
- Real-time polling for activity feed — the dedicated page with manual refresh is sufficient for now
- Separate /admin/analytics page with multiple chart types — single adaptive chart on overview is cleaner
- CLV and ARR KPI metrics — 4 core KPIs are focused; can add more metrics in a future iteration
- Dedicated /admin/notifications center page — extending the dropdown covers the need without a new page

</deferred>

---

*Phase: 05-admin-dashboard*
*Context gathered: 2026-05-18*
