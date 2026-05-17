# Phase 5: Admin BI Dashboard - Research

**Researched:** 2026-05-18
**Domain:** Admin Business Intelligence Dashboard (Next.js 16, Drizzle ORM, ApexCharts)
**Confidence:** HIGH

## Summary

This phase transforms the minimal admin pages (placeholder dashboard, basic sales KPIs, read-only users, basic invoice list) into a full business intelligence dashboard with revenue charts, user management, invoice actions, activity feeds, CSV export, and admin notifications. The codebase already has all infrastructure needed: ApexCharts with reference chart components, Drizzle ORM with PostgreSQL for aggregate queries, an operational audit log system for the activity feed, Resend for transactional emails, and established admin page patterns (requireAdmin guards, ComponentCard wrappers, Table primitives).

The primary technical challenge is building efficient SQL aggregate queries for KPI metrics with date-range filtering, and adapting the existing ApexCharts pattern to support dynamic chart types (bar vs. area) based on selected date range. All other requirements are straightforward extensions of existing patterns.

**Primary recommendation:** Extend the established admin page patterns (server component + client action handlers + requireAdmin guard) for all pages. Build KPI queries using Drizzle's `sql` template for aggregates, adapt the existing `ChartTab` + `ReactApexChart` dynamic import pattern for the adaptive revenue chart, and create admin-scoped notification actions parallel to the existing customer-scoped ones.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Cards + Chart + Tables layout -- top row of 4 KPI metric cards, full-width adaptive revenue chart below, then recent activity feed + recent orders table side by side at bottom
- **D-02:** 4 core KPIs: Total Revenue, MRR, Active Customers, Total Orders -- shown as metric cards with up/down trend arrows
- **D-03:** Trend indicators show percentage change vs previous month (e.g., "+12.5% vs last month")
- **D-04:** MRR calculated as sum of all completed orders in the current calendar month (not license-based, since ConversionFlow uses one-time purchases)
- **D-05:** Bottom section: left side = recent activity feed (last 15-20 events from audit_logs), right side = recent orders table (last 5-10 orders)
- **D-06:** Merge /admin/sales into /admin/dashboard -- redirect /admin/sales to /admin/dashboard. One unified executive overview page
- **D-07:** Preset date range selector on the dashboard: Last 7 days / Last 30 days / Last 90 days / This Year. Applies to both KPI trends and the revenue chart
- **D-08:** Single adaptive chart on the dashboard overview -- chart type switches based on selected range: daily bars for 7d, weekly area for 30d, monthly bars for 90d, yearly area for 12m
- **D-09:** Use existing ApexCharts installation -- adapt the reference chart component pattern (dynamic import, ssr: false) from `src/components/charts/` and `src/components/ecommerce/StatisticsChart.tsx`
- **D-10:** Dedicated user detail page at /admin/users/[id] -- shows profile info, order history, license status, and action buttons (role change, ban/unban)
- **D-11:** Users list page (/admin/users) gets a "View" link on each row that navigates to the detail page
- **D-12:** Role assignment via dropdown on user detail page -- can set customer/admin/support_staff/super_admin
- **D-13:** Ban/activate toggle on user detail page with optional ban reason field
- **D-14:** Add status filter tabs above the invoice table: All / Paid (completed) / Pending / Failed
- **D-15:** "Mark as Paid" button for pending orders -- changes status to completed and triggers license creation + confirmation email (reuse verifyOrder logic)
- **D-16:** "Send Reminder" button for pending orders -- emails the customer about their pending payment. Needs a payment reminder email template
- **D-17:** CSV export only, client-side generation using Blob + download. No server-side processing needed
- **D-18:** "Export CSV" button above each data table (orders, invoices, users). Exports currently filtered/visible data
- **D-19:** No Excel or PDF export -- CSV covers the use case without adding dependencies
- **D-20:** Dedicated /admin/activity page with full pagination, filters by event type (order, license, refund, ticket, user), and date range filtering
- **D-21:** Mini activity feed on the dashboard overview -- last 15-20 events from audit_logs, no pagination, chronological with icon + description + timestamp
- **D-22:** Extend the existing NotificationDropdown component in the header -- add admin-scoped notification queries (failed payments, expiring licenses, new signups, support tickets)
- **D-23:** Admin notification types: payment_failed, license_expiring, new_signup, new_ticket, fraud_alert -- stored in the existing notifications table with admin-targeted userId or a special admin role flag

### Claude's Discretion
- Exact SQL query structure for aggregate KPI calculations
- ApexCharts configuration details (colors, tooltip formatting, axis labels)
- Activity feed icon mapping and description formatting
- CSV utility function implementation (column headers, date formatting, escaping)
- Admin notification query filtering logic
- How to handle the /admin/licenses page (nav item exists but no page -- decide scope)

### Deferred Ideas (OUT OF SCOPE)
- Excel and PDF export formats -- CSV covers the current need; can add formats later if requested
- Real-time polling for activity feed -- the dedicated page with manual refresh is sufficient for now
- Separate /admin/analytics page with multiple chart types -- single adaptive chart on overview is cleaner
- CLV and ARR KPI metrics -- 4 core KPIs are focused; can add more metrics in a future iteration
- Dedicated /admin/notifications center page -- extending the dropdown covers the need without a new page
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMN-01 | Executive overview (total revenue, MRR, ARR, active customers, CLV, CAC with trend indicators) | D-02 locks 4 KPIs (Revenue, MRR, Customers, Orders); D-03 locks vs-previous-month trends; D-04 locks MRR definition. Drizzle `sql` template with `COALESCE(SUM())`, `COUNT(*)` patterns verified in existing codebase. |
| ADMN-02 | Sales performance (total sales, conversion rate, refund rate, average order value) | Merged into dashboard overview per D-06. Existing sales page at `/admin/sales` has 4 basic KPIs -- extend with trend calculations. |
| ADMN-03 | User growth tracking (daily/weekly/monthly signups, activation rate) | User table has `createdAt` timestamp. Drizzle `gte`/`lte` operators available for date-range filtering. Group by date truncation via `sql` template. |
| ADMN-04 | Revenue trend charts (daily/weekly/monthly/yearly via ApexCharts with date range selector) | D-08 locks adaptive chart (bar/area by range). ApexCharts 5.12.0 installed with `react-apexcharts` 2.1.0. Reference chart components with dynamic import pattern verified. |
| ADMN-05 | Invoice management (list/filter by status, mark paid, send reminders) | D-14 locks filter tabs. D-15 reuses `verifyOrder` from `admin-orders.ts`. D-16 needs new email template. Existing invoice page is basic completed-orders list. |
| ADMN-06 | User management (list, detail, role assignment, ban/activate) | D-10 locks detail page at `/admin/users/[id]`. D-12 locks role dropdown. D-13 locks ban toggle. User table has `role`, `banned`, `banReason` columns. |
| ADMN-07 | Activity feed (real-time chronological events) | D-20 locks dedicated page. D-21 locks mini-feed on dashboard. `auditLogs` table + `createAuditLog()` fully operational. AuditAction type covers all event types. |
| ADMN-08 | Date range + product/plan/channel filters across all BI widgets | D-07 locks preset ranges (7d/30d/90d/year). Drizzle `gte`/`lte`/`between`/`and` operators available. Server component receives searchParams for initial range. |
| ADMN-09 | Data export (CSV, Excel, PDF) for all report types | D-17/D-18/D-19 lock CSV-only client-side Blob+download. No new dependencies needed. |
| ADMN-10 | Admin notifications (failed payment alerts, expiring licenses, churn alerts, fraud alerts) | D-22 extends existing NotificationDropdown. D-23 locks notification types. Existing notifications table with userId/type/data columns. Admin-scoped query actions needed. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| apexcharts | 5.12.0 | Revenue chart rendering | Already installed, reference chart components exist in codebase [VERIFIED: pnpm list] |
| react-apexcharts | 2.1.0 | React wrapper for ApexCharts | Already installed, used in 5 reference components with dynamic import pattern [VERIFIED: pnpm list] |
| drizzle-orm | 0.45.2 | SQL query builder for KPI aggregates, date-range filtering | Already installed, all existing admin pages use it [VERIFIED: pnpm list] |
| date-fns | 4.1.0 | Date formatting, relative time ("2 hours ago") | Already installed, used in NotificationDropdown [VERIFIED: pnpm list] |
| lucide-react | 1.14.0 | Icons for KPI cards, activity feed, action buttons | Already installed, used throughout dashboard [VERIFIED: pnpm list] |
| resend | 6.12.3 | Transactional email for payment reminders | Already installed, used in order-confirmation email [VERIFIED: pnpm list] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| flatpickr | 4.6.13 | Date range picker on StatisticsChart reference | Reference only -- using preset buttons per D-07 |
| @react-pdf/renderer | 4.5.1 | Invoice PDF generation | Already installed for invoice downloads [VERIFIED: pnpm list] |

### No New Dependencies Needed
All requirements can be met with existing installed packages. No new npm packages are required for this phase.

**Installation:**
```bash
# No new packages needed -- all dependencies already installed
pnpm install  # only if regenerating lockfile
```

**Version verification:**
```
apexcharts@5.12.0 (latest: 5.12.0 -- current)
react-apexcharts@2.1.0 (installed)
drizzle-orm@0.45.2 (installed)
date-fns@4.1.0 (installed)
lucide-react@1.14.0 (installed)
resend@6.12.3 (installed)
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(admin)/
│   ├── actions/
│   │   ├── admin-orders.ts          # EXISTING - extend with markAsPaid
│   │   ├── admin-dashboard.ts       # NEW - KPI queries, chart data, activity feed queries
│   │   ├── admin-users.ts           # NEW - role change, ban/activate actions
│   │   ├── admin-notifications.ts   # NEW - admin-scoped notification queries
│   │   └── admin-export.ts          # NEW - could be client-side only, or server data fetch
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx             # REPLACE - full BI dashboard
│   │   ├── sales/
│   │   │   └── page.tsx             # REPLACE - redirect to /admin/dashboard
│   │   ├── users/
│   │   │   ├── page.tsx             # ENHANCE - add View link
│   │   │   └── [id]/
│   │   │       └── page.tsx         # NEW - user detail page
│   │   ├── invoices/
│   │   │   └── page.tsx             # ENHANCE - filter tabs, mark paid, send reminder
│   │   ├── activity/
│   │   │   └── page.tsx             # NEW - full activity feed
│   │   └── ...
│   └── layout.tsx                   # UNCHANGED
├── components/
│   ├── admin/
│   │   ├── OrdersTable.tsx          # EXISTING - reference pattern
│   │   ├── DashboardKPIs.tsx        # NEW - 4 KPI metric cards
│   │   ├── RevenueChart.tsx         # NEW - adaptive ApexCharts component
│   │   ├── ActivityFeed.tsx         # NEW - mini feed for dashboard
│   │   ├── RecentOrdersTable.tsx    # NEW - compact recent orders
│   │   ├── UserDetailClient.tsx     # NEW - client actions for user detail page
│   │   ├── InvoiceActions.tsx       # NEW - client component for filter + mark paid + reminder
│   │   └── ActivityFeedFull.tsx     # NEW - full activity page with pagination/filters
│   ├── charts/                      # EXISTING - reference patterns
│   ├── header/
│   │   └── NotificationDropdown.tsx # ENHANCE - add admin-scoped queries
│   └── ...
├── lib/
│   ├── emails/
│   │   ├── order-confirmation.ts    # EXISTING - reference pattern
│   │   └── payment-reminder.ts      # NEW - payment reminder email template
│   ├── utils/
│   │   └── csv-export.ts            # NEW - client-side CSV Blob utility
│   └── ...
└── data/
    └── dashboard-nav.ts             # UPDATE - merge Sales into Overview, add Activity
```

### Pattern 1: Admin Server Component Page + Client Action Handlers
**What:** Pages are server components that fetch data and render. Interactive elements (buttons, filters, modals) live in client component wrappers that call server actions.
**When to use:** Every admin page in this phase.
**Example:**
```typescript
// Pattern from src/app/(admin)/admin/orders/page.tsx [VERIFIED: codebase]
// Server component page
export default async function AdminOrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const userRole = (session.user as Record<string, unknown>).role as string;
  if (userRole !== "admin" && userRole !== "super_admin") redirect("/admin/dashboard");

  const orderRows = await db.select({...}).from(orders).orderBy(desc(orders.createdAt));
  return (
    <div>
      <PageBreadcrumb pageTitle="Orders" basePath="/admin/dashboard" />
      <ComponentCard title="Order Management" desc="...">
        <OrdersTable orders={orderRows} onVerify={verifyOrder} ... />
      </ComponentCard>
    </div>
  );
}

// Client component action pattern from OrdersTable.tsx [VERIFIED: codebase]
"use client";
const router = useRouter();
const [isPending, startTransition] = useTransition();

const handleVerify = (orderId: string) => {
  startTransition(async () => {
    const result = await onVerify(orderId);
    if (result.error) { setActionError(result.error); }
    else { router.refresh(); }
  });
};
```

### Pattern 2: Drizzle SQL Aggregates for KPI Metrics
**What:** Use Drizzle's `sql` template tag for aggregate functions (`COALESCE(SUM())`, `COUNT(*)`) with date-range filtering via `gte`/`lte`.
**When to use:** All KPI calculations, revenue chart data queries.
**Example:**
```typescript
// Pattern from src/app/(admin)/admin/sales/page.tsx [VERIFIED: codebase]
const [totalRevenue] = await db
  .select({ total: sql<number>`COALESCE(SUM(${orders.amount}), 0)` })
  .from(orders)
  .where(eq(orders.status, "completed"));

// Date-range filtered KPI (for trend calculations) [ASSUMED]
// Drizzle operators gte/lte/and/between confirmed available [VERIFIED: node require check]
import { eq, and, gte, lte, sql } from "drizzle-orm";

const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

const [monthlyRevenue] = await db
  .select({ total: sql<number>`COALESCE(SUM(${orders.amount}), 0)` })
  .from(orders)
  .where(and(
    eq(orders.status, "completed"),
    gte(orders.createdAt, startOfMonth),
    lte(orders.createdAt, endOfMonth)
  ));
```

### Pattern 3: ApexCharts Dynamic Import with Adaptive Type
**What:** Use Next.js `dynamic()` with `ssr: false` for ApexCharts, and switch chart type based on date range selection.
**When to use:** Revenue chart on dashboard overview.
**Example:**
```typescript
// Pattern from src/components/charts/line/LineChartOne.tsx [VERIFIED: codebase]
"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Adaptive: switch between 'bar' and 'area' based on date range
export default function RevenueChart({ data, range }: Props) {
  const chartType = range === "7d" || range === "90d" ? "bar" : "area";
  const options: ApexOptions = {
    chart: { type: chartType, toolbar: { show: false } },
    colors: ["#465FFF"],
    // ... rest of config adapted from LineChartOne/BarChartOne reference patterns
  };
  return <ReactApexChart options={options} series={data} type={chartType} height={310} />;
}
```

### Pattern 4: Client-Side CSV Export via Blob
**What:** Generate CSV from table data in the browser, create a Blob URL, and trigger download. No server-side processing.
**When to use:** Export buttons on all data tables per D-17/D-18.
**Example:**
```typescript
// Client-side CSV utility [ASSUMED -- standard browser API pattern]
function exportCSV(columns: string[], rows: string[][], filename: string) {
  const csvContent = [
    columns.join(","),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
```

### Anti-Patterns to Avoid
- **Fetching all audit logs in memory and filtering client-side:** Use server-side WHERE clauses with date filters and pagination. The audit_logs table can grow large.
- **Calculating trends with two separate round-trip queries per KPI:** Batch period queries into a single server action that returns both current and previous period values together to minimize DB round-trips.
- **Using ApexCharts without dynamic import:** Will cause SSR errors. Always use `dynamic(() => import("react-apexcharts"), { ssr: false })`.
- **Inline auth checks on every page:** Extract a shared `requireAdmin()` helper (already exists in `admin-orders.ts`) and reuse across all admin server actions.
- **Treating "Mark as Paid" as a simple status update:** Must reuse `verifyOrder` logic per D-15 which also handles license creation + central API sync + confirmation email.
- **Creating a separate notification system for admins:** Use the existing `notifications` table with a convention for targeting admins (e.g., userId of the admin user, or a sentinel value).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date formatting / relative time | Custom date formatting functions | `date-fns` (already installed, v4.1.0) | Used in NotificationDropdown (`formatDistanceToNow`). Handles i18n, edge cases. |
| CSV generation | Custom CSV string builder with manual escaping | Simple utility with RFC 4180 quoting (Blob+download) | Edge cases: commas in values, quotes, newlines. BOM prefix for Excel compatibility. |
| Chart rendering | Canvas/SVG chart from scratch | ApexCharts (already installed) | 5 reference components exist. Handles tooltips, responsive sizing, dark mode, animations. |
| Auth/permission checks | Per-page role check logic | `requireAdmin()` from `admin-orders.ts` | Already extracts session + role check + redirect. Consistent pattern across all admin actions. |
| Email templates | Building email HTML from scratch per template | Copy pattern from `order-confirmation.ts` | Same Resend client, same ConversionFlow branding, same layout structure. |
| SQL aggregate queries | Fetching all rows and computing in JS | Drizzle `sql` template with `COALESCE`, `SUM`, `COUNT`, `GROUP BY` | PostgreSQL is optimized for this. Prevents memory issues with large datasets. |

**Key insight:** This phase is primarily about data aggregation queries and UI composition. Every infrastructure piece (charts, email, auth, DB, audit logging) is already in place. The work is connecting them into a cohesive dashboard.

## Common Pitfalls

### Pitfall 1: ApexCharts SSR Error
**What goes wrong:** Importing `react-apexcharts` directly in a component causes "window is not defined" errors during server-side rendering.
**Why it happens:** ApexCharts depends on browser APIs (window, document) and cannot run on the server.
**How to avoid:** Always use `dynamic(() => import("react-apexcharts"), { ssr: false })`. This pattern is already established in 5 reference chart components. [VERIFIED: codebase -- LineChartOne.tsx, BarChartOne.tsx, StatisticsChart.tsx]
**Warning signs:** Build fails with ReferenceError about `window` or `document`.

### Pitfall 2: Date Range Mismatch Between KPI Cards and Chart
**What goes wrong:** KPI cards show data for one period while the chart shows data for a different period, making the dashboard inconsistent.
**Why it happens:** KPI cards and chart component fetch data independently with different date range parameters.
**How to avoid:** Pass the selected date range as a prop to all components from the parent server component. Use Next.js searchParams so the range is in the URL and all components read the same value.
**Warning signs:** Revenue KPI says 50,000 BDT but chart total shows 35,000 BDT for the "same" period.

### Pitfall 3: MRR Calculation Not Matching D-04 Definition
**What goes wrong:** MRR is calculated using license data or subscription logic instead of "sum of completed orders in current calendar month."
**Why it happens:** "MRR" traditionally means Monthly Recurring Revenue from subscriptions, but D-04 explicitly defines it as completed orders this month.
**How to avoid:** MRR query must filter by `status = 'completed'` AND `createdAt` within current calendar month. No license or subscription tables involved.
**Warning signs:** MRR value doesn't match sum of completed orders for the current month.

### Pitfall 4: Trend Percentage Division by Zero
**What goes wrong:** Previous period had zero revenue/orders, causing `Infinity` or `NaN` in the trend percentage display.
**Why it happens:** `(current - previous) / previous * 100` when previous is 0.
**How to avoid:** Guard clause: if previous period value is 0, show "+100%" if current > 0, or "N/A" if both are 0.
**Warning signs:** KPI cards showing "Infinity%" or "NaN%" in the trend indicator.

### Pitfall 5: Activity Feed Not Showing User-Friendly Descriptions
**What goes wrong:** Raw audit log actions like "order.status_changed" are displayed to the admin instead of "Order #ABC123 marked as completed."
**Why it happens:** Audit logs store machine-readable action strings, not human descriptions.
**How to avoid:** Build an `actionToDescription` mapper that uses the `action`, `targetType`, `targetId`, and `details` fields to generate human-readable descriptions. Map `order.status_changed` with `{ from: "pending", to: "completed" }` to "Order verified and confirmed."
**Warning signs:** Activity feed showing raw strings like "user.registered" with no context.

### Pitfall 6: "Mark as Paid" Not Triggering Full Order Lifecycle
**What goes wrong:** Invoice "Mark as Paid" only updates the order status but doesn't create a license or send confirmation email.
**Why it happens:** D-15 explicitly requires reusing `verifyOrder` logic, which handles central API sync, license creation, and confirmation email.
**How to avoid:** The "Mark as Paid" server action must call or replicate the full `verifyOrder` flow from `admin-orders.ts`, not just update the status field.
**Warning signs:** Orders marked as paid but no license created, or no confirmation email sent.

### Pitfall 7: NotificationDropdown Admin Context Collision
**What goes wrong:** Admin users see their personal customer notifications instead of admin-specific alerts (or vice versa).
**Why it happens:** NotificationDropdown currently queries by `session.user.id`. Admin users need both personal and admin-scoped notifications.
**How to avoid:** When in admin context (detected by route or role), the dropdown should query admin-targeted notifications. Options: (a) store admin notifications with the admin user's ID and a type prefix, (b) add a `scope` column to notifications, or (c) use a dedicated admin notification query that filters by type. D-23 suggests using admin-targeted userId or role flag.
**Warning signs:** Admin dashboard shows no notifications, or shows customer billing notifications instead of admin alerts.

### Pitfall 8: CSV Export Not Handling BDT Currency Properly
**What goes wrong:** CSV shows "50000" instead of "50,000 BDT" or uses wrong number formatting.
**Why it happens:** Raw integer amounts from the database without formatting.
**How to avoid:** Use the same `formatBDT` helper already defined in sales and invoices pages. Add BOM prefix (`﻿`) for Excel UTF-8 compatibility. D-17 specifies client-side generation with Blob+download.
**Warning signs:** CSV opens with garbled characters in Excel, or amounts show as raw integers.

## Code Examples

### KPI Query with Trend Calculation
```typescript
// Server action for dashboard KPIs [PATTERN: adapted from sales/page.tsx]
// Uses Drizzle sql template for aggregates [VERIFIED: Drizzle operators gte/lte/and available]
"use server";
import { db } from "@/lib/db";
import { orders, user } from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export async function getDashboardKPIs(range: "7d" | "30d" | "90d" | "year") {
  const now = new Date();
  const { start, prevStart } = getDateRange(range, now);

  // Current period revenue
  const [currentRevenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(${orders.amount}), 0)` })
    .from(orders)
    .where(and(eq(orders.status, "completed"), gte(orders.createdAt, start), lte(orders.createdAt, now)));

  // Previous period revenue (for trend)
  const [prevRevenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(${orders.amount}), 0)` })
    .from(orders)
    .where(and(eq(orders.status, "completed"), gte(orders.createdAt, prevStart), lte(orders.createdAt, start)));

  const revenueTrend = prevRevenue.total > 0
    ? ((currentRevenue.total - prevRevenue.total) / prevRevenue.total * 100).toFixed(1)
    : currentRevenue.total > 0 ? "+100" : "0";

  // MRR: completed orders in current calendar month (per D-04)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [mrr] = await db
    .select({ total: sql<number>`COALESCE(SUM(${orders.amount}), 0)` })
    .from(orders)
    .where(and(eq(orders.status, "completed"), gte(orders.createdAt, monthStart)));

  // Active customers (users with at least one completed order)
  const [activeCustomers] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${orders.userId})` })
    .from(orders)
    .where(eq(orders.status, "completed"));

  // Total orders in period
  const [totalOrders] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(and(gte(orders.createdAt, start), lte(orders.createdAt, now)));

  return {
    totalRevenue: currentRevenue.total,
    revenueTrend: Number(revenueTrend),
    mrr: mrr.total,
    activeCustomers: activeCustomers.count,
    totalOrders: totalOrders.count,
  };
}
```

### Adaptive Revenue Chart Component
```typescript
// Adapted from LineChartOne.tsx and BarChartOne.tsx patterns [VERIFIED: codebase]
"use client";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface RevenueChartProps {
  categories: string[];     // e.g. ["Mon", "Tue", ...] or ["Jan", "Feb", ...]
  values: number[];
  range: "7d" | "30d" | "90d" | "year";
}

export default function RevenueChart({ categories, values, range }: RevenueChartProps) {
  // D-08: daily bars for 7d, weekly area for 30d, monthly bars for 90d, yearly area for 12m
  const isBar = range === "7d" || range === "90d";
  const chartType = isBar ? "bar" : "area";

  const options: ApexOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "DM Sans, sans-serif",  // Match project body font
      type: chartType,
      toolbar: { show: false },
      height: 310,
    },
    plotOptions: isBar ? {
      bar: { borderRadius: 5, columnWidth: "50%" }
    } : undefined,
    stroke: isBar ? { show: true, width: 3, colors: ["transparent"] } : { curve: "smooth", width: 2 },
    fill: isBar ? { opacity: 1 } : { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
    xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (val: number) => val.toLocaleString("en-BD"),
      },
    },
    dataLabels: { enabled: false },
    grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    tooltip: { y: { formatter: (val: number) => `${val.toLocaleString("en-BD")} BDT` } },
  };

  const series = [{ name: "Revenue", data: values }];

  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div className="min-w-[600px] xl:min-w-full">
        <ReactApexChart options={options} series={series} type={chartType} height={310} />
      </div>
    </div>
  );
}
```

### Revenue Chart Data Query (Server Action)
```typescript
// Server action to generate chart data grouped by time period
// Uses PostgreSQL date_trunc via Drizzle sql template [ASSUMED -- standard PostgreSQL function]
"use server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

export async function getRevenueChartData(range: "7d" | "30d" | "90d" | "year") {
  const now = new Date();
  const { start } = getDateRange(range, now);

  // PostgreSQL date_trunc for grouping: 'day', 'week', 'month', 'month'
  const truncMap = { "7d": "day", "30d": "week", "90d": "month", "year": "month" };
  const truncUnit = truncMap[range];

  const rows = await db
    .select({
      period: sql<string>`date_trunc('${sql.raw(truncUnit)}', ${orders.createdAt})`,
      total: sql<number>`COALESCE(SUM(${orders.amount}), 0)`,
    })
    .from(orders)
    .where(and(eq(orders.status, "completed"), gte(orders.createdAt, start), lte(orders.createdAt, now)))
    .groupBy(sql`date_trunc('${sql.raw(truncUnit)}', ${orders.createdAt})`)
    .orderBy(sql`date_trunc('${sql.raw(truncUnit)}', ${orders.createdAt})`);

  return {
    categories: rows.map(r => formatDateLabel(r.period, range)),
    values: rows.map(r => r.total),
  };
}
```

### CSV Export Utility
```typescript
// Client-side CSV export [PATTERN: standard Blob+download browser API]
// BOM prefix for Excel UTF-8 compatibility [ASSUMED: standard practice]

interface CSVColumn {
  header: string;
  accessor: (row: Record<string, unknown>) => string;
}

export function exportToCSV(
  columns: CSVColumn[],
  rows: Record<string, unknown>[],
  filename: string
) {
  const headerRow = columns.map(c => `"${c.header}"`).join(",");
  const dataRows = rows.map(row =>
    columns.map(c => {
      const val = String(c.accessor(row) ?? "");
      return `"${val.replace(/"/g, '""')}"`;
    }).join(",")
  );

  // BOM prefix for Excel UTF-8 compatibility
  const csv = "﻿" + [headerRow, ...dataRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### Activity Feed Description Mapper
```typescript
// Maps audit log actions to human-readable descriptions
// Uses action + details fields from auditLogs table [VERIFIED: schema.ts]
import {
  ShoppingCart, Key, AlertTriangle, UserPlus, MessageSquare,
  ShieldBan, UserCheck, RefreshCw
} from "lucide-react";

const actionConfig: Record<string, { description: (d: Record<string, unknown>) => string; icon: typeof ShoppingCart; color: string }> = {
  "order.created": {
    description: (d) => `New order placed`,
    icon: ShoppingCart,
    color: "text-brand-500",
  },
  "order.status_changed": {
    description: (d) => `Order ${d.to === "completed" ? "verified" : d.to}`,
    icon: RefreshCw,
    color: "text-success-500",
  },
  "license.created": {
    description: (d) => `License key generated`,
    icon: Key,
    color: "text-brand-500",
  },
  "user.registered": {
    description: () => `New user signed up`,
    icon: UserPlus,
    color: "text-success-500",
  },
  "ticket.created": {
    description: () => `New support ticket opened`,
    icon: MessageSquare,
    color: "text-warning-500",
  },
  "user.banned": {
    description: (d) => `User banned${d.reason ? `: ${d.reason}` : ""}`,
    icon: ShieldBan,
    color: "text-error-500",
  },
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| flatpickr for date range | Preset button selector (7d/30d/90d/year) | D-07 decision | Simpler UX, no date picker library needed for initial implementation |
| Separate /admin/sales page | Merged into /admin/dashboard | D-06 decision | Single unified executive overview page, simpler nav |
| Client-side date filtering | Server-side date-range via searchParams | This phase | Better performance, URL-sharable dashboard state |
| Excel/PDF export | CSV-only client-side Blob export | D-17/D-19 decision | Zero new dependencies, covers admin export needs |

**Deprecated/outdated:**
- StatisticsChart's flatpickr integration: Reference only, not using flatpickr for the dashboard chart per D-07 preset buttons.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | PostgreSQL `date_trunc` function works with Drizzle `sql` template for time-based grouping | Code Examples (Revenue Chart Data Query) | If `sql.raw()` causes issues with Drizzle, use a simpler approach: generate date buckets in JS and query each individually, or use raw SQL |
| A2 | BOM prefix `﻿` ensures Excel opens CSV with correct UTF-8 encoding | Code Examples (CSV Export) | If BD characters (taka symbol) appear garbled, add explicit charset handling |
| A3 | Admin notifications can be targeted by storing the admin user's ID in the `userId` column of the notifications table (no schema change needed) | Architecture Patterns | If a "broadcast to all admins" pattern is needed, may require a `scope` column or a sentinel `admin-role` value |
| A4 | `requireAdmin()` from `admin-orders.ts` can be extracted to a shared location and reused across all admin actions | Architecture Patterns | If extraction breaks import paths, duplicate the pattern (current pages already duplicate inline auth checks) |
| A5 | Revenue chart data query with `sql.raw(truncUnit)` for dynamic date_trunc is safe from SQL injection since the value comes from a hardcoded map, not user input | Code Examples | Low risk -- truncMap values are hardcoded strings "day"/"week"/"month" |

**If this table is empty:** Not applicable -- 5 assumptions identified above.

## Open Questions

1. **How should /admin/licenses page be handled?**
   - What we know: Nav item exists in `dashboard-nav.ts` pointing to `/admin/licenses`, but no page file exists. Licenses table is fully defined in schema with relations.
   - What's unclear: Should this phase create a basic licenses listing page (since the nav item already exists and users will click it), or leave it as a 404?
   - Recommendation: Create a minimal read-only licenses listing page to avoid dead nav links. The full license intelligence features (LINT-01/02/03) are Phase 6 scope.

2. **Should the dashboard date range be URL-driven via searchParams or client-side state?**
   - What we know: Server component pages receive searchParams. Client components can use useState for range selection and re-fetch data.
   - What's unclear: The optimal pattern for making date range changes trigger data refresh.
   - Recommendation: Use searchParams (`?range=30d`) as the source of truth. The range selector is a client component that uses `router.push()` to update the URL, and the server component reads searchParams to query the correct data. This makes the dashboard URL-shareable and consistent.

3. **Should admin notifications be created proactively (by background jobs) or reactively (queried from existing data)?**
   - What we know: D-22 says extend NotificationDropdown with admin-scoped queries. BullMQ is installed for background jobs. The notifications table has type/data columns.
   - What's unclear: Whether to create notification records when events happen (proactive) or query audit_logs/orders for admin-relevant items (reactive).
   - Recommendation: Proactive -- create notification records in the notifications table when relevant events occur (order.failed, license.expiring, new user registered, new ticket created). This aligns with D-23's list of admin notification types and the existing notification infrastructure. Add notification creation calls to existing server actions (verifyOrder failure, user registration, ticket creation).

## Environment Availability

> This phase depends on PostgreSQL and the existing dev environment.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL | All KPI queries, dashboard data | Needs verification | -- | Cannot fallback -- hard dependency |
| Node.js | Build + dev server | Yes | v24.15.0 | -- |
| pnpm | Package management | Yes | 10.33.2 | -- |
| ApexCharts | Revenue chart | Yes (installed) | 5.12.0 | -- |
| Resend API | Payment reminder emails | Needs API key | 6.12.3 | Graceful error handling if key missing |

**Missing dependencies with no fallback:**
- PostgreSQL must be running and accessible via DATABASE_URL. The dev environment has been using it through all previous phases.

**Missing dependencies with fallback:**
- Resend API key: If RESEND_API_KEY is not set, email sending will fail gracefully (order confirmation emails already use try/catch around resend calls).

## Validation Architecture

> nyquist_validation is enabled per config.json workflow settings.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | None -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMN-01 | KPI metric cards display correct values | manual-only | -- | N/A |
| ADMN-02 | Sales metrics render with trends | manual-only | -- | N/A |
| ADMN-03 | User growth data shows correct counts | manual-only | -- | N/A |
| ADMN-04 | Revenue chart renders with correct type per range | manual-only | -- | N/A |
| ADMN-05 | Invoice filter tabs work, mark as paid triggers full flow | manual-only | -- | N/A |
| ADMN-06 | User detail page shows data, role/ban actions work | manual-only | -- | N/A |
| ADMN-07 | Activity feed displays audit events with descriptions | manual-only | -- | N/A |
| ADMN-08 | Date range selector filters all dashboard widgets | manual-only | -- | N/A |
| ADMN-09 | CSV export downloads file with correct data | manual-only | -- | N/A |
| ADMN-10 | Admin notifications appear in NotificationDropdown | manual-only | -- | N/A |

**Justification for manual-only:** No test framework is installed in this project. All 67 v1 requirements and 31 v2 requirements (through Phase 4) have been validated manually. The project relies on TypeScript strict mode, ESLint, and manual UAT for quality assurance.

### Sampling Rate
- **Per task commit:** Visual check in dev server (`pnpm dev`)
- **Per wave merge:** Full page walkthrough in browser
- **Phase gate:** Complete admin dashboard UAT covering all 10 ADMN requirements

### Wave 0 Gaps
- No test framework installation planned -- project convention is manual validation
- No test infrastructure needed for this phase

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Better Auth session + requireAdmin() guard on all admin actions |
| V3 Session Management | yes | Better Auth managed sessions |
| V4 Access Control | yes | requireAdmin() in every server action, role check in every page |
| V5 Input Validation | yes | TypeScript strict mode, server action input validation |
| V6 Cryptography | no | No cryptographic operations in this phase |

### Known Threat Patterns for Admin Dashboard (Next.js + Drizzle)

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized admin access | Tampering + Elevation | requireAdmin() guard on all pages and server actions [VERIFIED: codebase pattern] |
| SQL injection in date range | Tampering | Drizzle parameterized queries prevent injection. `sql.raw()` only used with hardcoded values from truncMap, never user input. |
| CSV injection via exported data | Tampering | CSV values are quoted and escaped. BOM prefix for clean rendering. |
| IDOR on user detail page | Information Disclosure | requireAdmin() guard + verify user exists before rendering |
| Mass assignment on role change | Tampering | Validate role value against allowed enum before DB update |
| Notification data leakage | Information Disclosure | Admin notification queries scoped to admin-targeted records only |

## Sources

### Primary (HIGH confidence)
- Codebase examination: schema.ts, admin-orders.ts, sales/page.tsx, invoices/page.tsx, users/page.tsx, dashboard/page.tsx, chart components, NotificationDropdown.tsx, notification actions, order-confirmation.ts, dashboard-nav.ts, package.json, OrdersTable.tsx
- Drizzle ORM operator verification: `and, between, eq, gt, gte, lt, lte, or, asc, desc, avg, count, sum, sql` -- confirmed available via runtime check [VERIFIED]
- ApexCharts + react-apexcharts versions: 5.12.0 / 2.1.0 [VERIFIED: pnpm list]

### Secondary (MEDIUM confidence)
- PostgreSQL `date_trunc` for time-based grouping: standard PostgreSQL function, widely documented [CITED: PostgreSQL docs]
- BOM prefix `﻿` for Excel CSV UTF-8 compatibility: standard practice [CITED: RFC 4180 / W3C]

### Tertiary (LOW confidence)
- None -- all claims verified against codebase or documented APIs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and verified in codebase
- Architecture: HIGH -- follows established patterns from existing admin pages
- Pitfalls: HIGH -- based on observed codebase patterns and ApexCharts known behavior
- SQL queries: MEDIUM -- Drizzle patterns verified, but date_trunc with sql.raw() needs runtime testing
- CSV export: MEDIUM -- standard browser API pattern, BOM handling is well-known but BD-specific formatting untested

**Research date:** 2026-05-18
**Valid until:** 2026-06-18 (stable -- no fast-moving dependencies)
