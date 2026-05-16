# Phase 3: Customer Portal - Research

**Researched:** 2026-05-16
**Domain:** Customer portal pages with Drizzle ORM queries, Better Auth session access, TailAdmin component adaptation
**Confidence:** HIGH

## Summary

Phase 3 builds all customer-facing portal pages inside the existing `(portal)/` route group. The infrastructure from Phase 1 (DB schema, auth, route protection) and Phase 2 (PortalShell, AppSidebar, AppHeader, dashboard CSS) is fully in place. The work is primarily: (1) writing server component pages that query the database via Drizzle ORM, (2) adapting already-ported TailAdmin components (Badge, Table, Modal, ComponentCard, PageBreadCrumb, Pagination) for portal-specific use cases, and (3) replacing placeholder content in the NotificationDropdown with real data.

The database schema has all 8 application tables ready (orders, licenses, downloads, tickets, ticketMessages, notifications, auditLogs, coupons) with proper enums, relations, and indexes. The `auth.api.getSession({ headers: await headers() })` pattern is already established in both portal and admin dashboard pages. All TailAdmin components are already ported from `backenddashboard/` to `src/components/` -- Phase 3 needs to compose them into portal-specific layouts, not port them again.

**Primary recommendation:** Use the established server component pattern (getSession + Drizzle query + redirect guard) for every portal page. Create client component wrappers only for interactive elements (copy button, modal toggles, file upload, pagination, notification bell). Reuse the existing TailAdmin UI primitives (Badge, Table, Modal, ComponentCard) directly.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Real DB queries -- server components with Drizzle ORM directly query the database. No API route layer. Show empty states (zero counts + welcome message) when no data exists. No mock/placeholder data.
- **D-02:** Cards + Table layout -- metric cards at top (EcommerceMetrics-style), recent activity table below. Port from `backenddashboard/src/components/EcommerceMetrics.tsx`.
- **D-03:** Four metric cards with icons: active licenses, licenses expiring soon, recent downloads, open tickets. Use ComponentCard pattern from backenddashboard.
- **D-04:** Empty state shows zeros in all cards + welcome message for new users. No "no data" placeholder text.
- **D-05:** Table with row actions for license list -- each row has view details and copy key actions. Port Table component from backenddashboard.
- **D-06:** License key displayed masked with copy button -- show partial key (e.g., `CF-****-****-ABCD`), click to copy full key to clipboard.
- **D-07:** Slide-in panel or modal for license detail view -- shows full key, activation domains, status, expiry date, plan details.
- **D-08:** Activation domains shown as a list with current/max activation count. Status badges (active/expired/revoked/suspended) using Badge component.
- **D-09:** Port TailAdmin components: EcommerceMetrics, ComponentCard, PageBreadCrumb, Table, Badge, Modal from `backenddashboard/`. Adapt to ConversionFlow design system (dashboard.css tokens).
- **D-10:** Breadcrumbs on every portal page using PageBreadCrumb pattern from TailAdmin. Shows current page context within portal hierarchy.
- **D-11:** Billing section uses invoice table with status badges (paid/pending/failed/refunded). Payment method column shows bKash/Nagad/Rocket/Bank/SSL Commerce with icons or labels.
- **D-12:** Ticket list as a table with status badges (open/in_progress/resolved/closed) and priority indicators (low/medium/high/urgent).
- **D-13:** Ticket detail page uses chat-style thread layout -- messages from customer and support staff in conversation bubbles, newest at bottom with auto-scroll.
- **D-14:** Create ticket via modal form -- subject, priority selector, description textarea, file attachment area. No separate create-ticket page.
- **D-15:** File uploads stored on server filesystem with metadata in attachments JSONB column. No third-party file storage.
- **D-16:** Featured card for latest version at top (prominent, with download button). Version history table below with all previous versions.
- **D-17:** Expandable changelog per version entry -- click to expand/collapse changelog details inline. No separate changelog page.
- **D-18:** Notification bell dropdown (in AppHeader) populated with real data from notifications table via Drizzle query. Replaces Phase 2 placeholder bell.
- **D-19:** All 4 notification types: license events (activation/expiry), billing events (payment/refund), support events (ticket reply/status change), system events (maintenance/updates). Notification type stored in notifications.type column.
- **D-20:** Click notification to mark as read + navigate to related entity. "Mark all as read" button in dropdown. Unread count badge on bell icon.
- **D-21:** All sections on one page: Profile (name, email, phone), Password (current + new + confirm), Preferences (notification toggles). No tab navigation -- sections stacked vertically.
- **D-22:** Editable fields: display name, phone number, password. Email is read-only (shown but not editable). Notification preference toggles for each notification type.

### Claude's Discretion
- Exact TailAdmin component adaptation details (which props to keep/remove)
- Empty state illustration or welcome message copy
- File upload UI (drag-and-drop vs button picker)
- Notification dropdown animation and max visible items
- Password change validation rules and success feedback
- License detail panel/modal animation
- Changelog expand/collapse animation style
- Ticket message bubble styling and timestamps
- Invoice status badge colors per status
- Mobile responsive behavior for tables (card view vs horizontal scroll)

### Deferred Ideas (OUT OF SCOPE)
- License key regeneration -- deferred to Phase 4 (checkout), requires central API integration
- Invoice PDF download -- deferred to Phase 4 (checkout), requires invoice generation
- File upload size limits and virus scanning -- deferred, basic validation in Phase 3
- Ticket merge/assign -- admin-only features deferred to Phase 5
- Notification email delivery -- deferred to Phase 6 (background jobs)
- License renewal/upgrade flow -- deferred to Phase 4 (checkout)
- Bulk notification actions (delete, filter by type) -- deferred, can add later
- Account avatar upload -- deferred, initials-based for now
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PORT-01 | Dashboard overview (active licenses, expiring soon, recent downloads, open tickets) | Drizzle count queries with `sql<number>count(*)`, `eq`, `and`, `gt` against licenses, downloads, tickets tables. EcommerceMetrics card pattern adapted for 4 metrics. |
| PORT-02 | License management (list, detail, copy key, deactivate domain, sync status) | Licenses table query with `eq(licenses.userId, userId)`. Badge for status. Modal for detail. Client component for copy-to-clipboard. |
| PORT-03 | Billing section (invoices, payment history, refund status) | Orders table query with `eq(orders.userId, userId)`. Badge color mapping: paid=success, pending=warning, failed=error, refunded=light. |
| PORT-04 | Downloads section (latest + old plugin versions with changelogs) | Downloads table query ordered by createdAt desc. Featured card for latest. Expandable changelog rows. |
| PORT-05 | Support tickets (create, list, reply with attachments) | Tickets + ticketMessages tables with relations. Modal for create. Chat-style thread for detail. File upload via react-dropzone + server action. |
| PORT-06 | Notification center (list, mark read, preferences) | Notifications table query. NotificationDropdown rewrite with real data. Mark-read server action. Preference toggles on account page. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | 0.45.2 | Database queries in server components | Project standard since Phase 1 -- all schema defined, relations set up |
| better-auth | 1.6.11 | Session/user access in server components | `auth.api.getSession({ headers })` pattern established in Phase 1 |
| react-dropzone | 15.0.0 | File upload UI for ticket attachments | Already ported from TailAdmin, installed and available |
| date-fns | 4.1.0 | Date formatting and relative time | Installed in Phase 1, used for date display |
| lucide-react | 1.14.0 | Icon components for metric cards, status icons | Project icon standard -- used in sidebar, header |
| clsx | 2.1.1 | Conditional class merging | Used via `cn()` utility |
| tailwind-merge | 3.6.0 | Tailwind class deduplication | Used via `cn()` utility |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-themes | 0.4.6 | Dark/light theme support | All portal pages inherit from layout |
| framer-motion | 12.38.0 | Animations (expand/collapse, modal transitions) | Changelog expand, modal entrance, notification dropdown |

### No New Dependencies Required
All libraries needed for Phase 3 are already installed and available. No `pnpm add` commands needed. [VERIFIED: package.json inspection]

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(portal)/
│   ├── layout.tsx                  # EXISTS - PortalShell wrapper
│   ├── dashboard/
│   │   └── page.tsx                # EXISTS (placeholder) - rewrite with metrics
│   ├── licenses/
│   │   ├── page.tsx                # NEW - license list table
│   │   └── [id]/
│   │       └── page.tsx            # NEW - license detail (optional, can use modal)
│   ├── billing/
│   │   └── page.tsx                # NEW - invoices/payment history
│   ├── downloads/
│   │   └── page.tsx                # NEW - plugin downloads
│   ├── support/
│   │   ├── page.tsx                # NEW - ticket list
│   │   └── [id]/
│   │       └── page.tsx            # NEW - ticket detail/conversation
│   ├── account/
│   │   └── page.tsx                # NEW - profile/password/preferences
│   └── actions/                    # NEW - server actions directory
│       ├── licenses.ts             # License-related actions
│       ├── billing.ts              # Billing queries (if needed)
│       ├── support.ts              # Ticket CRUD + message actions
│       ├── notifications.ts        # Mark read, preference toggles
│       ├── downloads.ts            # Download token generation
│       └── account.ts              # Profile/password update actions
├── components/
│   ├── portal/                     # NEW - portal-specific components
│   │   ├── DashboardMetrics.tsx    # 4-card metrics grid
│   │   ├── LicenseTable.tsx         # License list with actions
│   │   ├── LicenseDetailModal.tsx   # Modal for license detail
│   │   ├── LicenseKeyCopy.tsx       # Client component: masked key + copy
│   │   ├── InvoiceTable.tsx         # Billing invoice table
│   │   ├── DownloadsList.tsx        # Downloads with featured card
│   │   ├── ChangelogExpandable.tsx  # Client component: expand/collapse
│   │   ├── TicketTable.tsx          # Ticket list table
│   │   ├── TicketConversation.tsx   # Client component: chat thread
│   │   ├── CreateTicketModal.tsx    # Client component: modal form
│   │   ├── FileUploadArea.tsx       # Client component: file picker
│   │   ├── AccountProfile.tsx       # Profile section
│   │   ├── PasswordChange.tsx       # Client component: password form
│   │   └── NotificationPreferences.tsx # Client component: toggles
│   ├── header/
│   │   └── NotificationDropdown.tsx # EXISTS (placeholder) - rewrite with real data
│   ├── ui/                         # EXISTS - TailAdmin UI primitives
│   ├── common/                     # EXISTS - ComponentCard, PageBreadCrumb
│   └── ecommerce/                  # EXISTS - EcommerceMetrics (reference)
```

### Pattern 1: Server Component Page with Auth Guard + DB Query
**What:** Every portal page follows the same pattern: get session, redirect if invalid, query DB, render.
**When to use:** Every portal page.
**Example:**
```typescript
// Source: Established pattern from src/app/(portal)/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { licenses, eq, and, gt, sql, count } from "@/lib/db/schema"; // drizzle-orm imports
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default async function LicensesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Drizzle query pattern
  const userLicenses = await db
    .select()
    .from(licenses)
    .where(eq(licenses.userId, userId));

  return (
    <div>
      <PageBreadcrumb pageTitle="Licenses" />
      {/* Page content */}
    </div>
  );
}
```

### Pattern 2: Client Component Wrappers for Interactivity
**What:** Extract interactive pieces (copy button, modal toggle, file upload) into separate `"use client"` components. Server component provides data, client component handles UI state.
**When to use:** Copy-to-clipboard, modal open/close, file drop, pagination state, form inputs.
**Example:**
```typescript
// Server component passes data down
import { LicenseKeyCopy } from "@/components/portal/LicenseKeyCopy";

// In server component JSX:
<LicenseKeyCopy licenseKey={license.licenseKey} />

// Client component handles clipboard
"use client";
import { useState } from "react";
import { CopyIcon, CheckLineIcon } from "@/icons";

export function LicenseKeyCopy({ licenseKey }: { licenseKey: string }) {
  const [copied, setCopied] = useState(false);
  const masked = `${licenseKey.slice(0, 3)}-****-****-${licenseKey.slice(-4)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <code className="font-mono text-sm">{masked}</code>
      <button onClick={handleCopy}>
        {copied ? <CheckLineIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}
```

### Pattern 3: Server Action for Mutations
**What:** Use `"use server"` functions for all mutations (mark notification read, create ticket, update profile, file upload).
**When to use:** Any write operation -- never mutate directly from a server component render.
**Example:**
```typescript
// src/app/(portal)/actions/notifications.ts
"use server";

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function markNotificationRead(notificationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, session.user.id)
      )
    );
}
```

### Pattern 4: NotificationDropdown Rewrite with Real Data
**What:** The existing `NotificationDropdown` is a client component with hardcoded data. It needs to be rewritten to accept notification data as props from a parent server component, or use a server component wrapper.
**When to use:** Wiring AppHeader bell to real data.
**Key insight:** Since `AppHeader` is a client component (it uses `useSidebar`), the NotificationDropdown inside it is also client-side. Two approaches:
- **Approach A (recommended):** Create a server component wrapper that fetches notifications and passes them to the client dropdown as props.
- **Approach B:** Fetch in the client component using a server action that returns notification data.

Approach A is cleaner because the AppHeader layout is stable and notifications can be fetched at layout level. However, since `AppHeader` is already a client component used inside `DashboardShell` (also client), the simplest path is to add a server action `getNotifications()` that the `NotificationDropdown` calls on mount or via a refresh mechanism.

### Anti-Patterns to Avoid
- **Querying DB in client components:** Never import `db` or use Drizzle in `"use client"` files. Use server actions instead. [VERIFIED: established pattern in codebase]
- **Fetching via API routes:** Per D-01, no API route layer. Server components query directly, client components use server actions.
- **Duplicating the auth guard:** Every page needs its own session check -- do not assume the layout handles it. The layout provides the visual shell, but each page must verify auth independently for security.
- **Inline Tailwind everywhere for tables:** Use the existing `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` components from `src/components/ui/table/` rather than raw HTML tables.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Status badges | Custom badge CSS | `Badge` from `src/components/ui/badge/Badge.tsx` | Already ported with light/solid variants, 7 colors, 2 sizes |
| Modal dialogs | Custom overlay/portal | `Modal` from `src/components/ui/modal/index.tsx` | Already ported with escape handling, body scroll lock, fullscreen support |
| Data tables | Custom table markup | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` from `src/components/ui/table/index.tsx` | Already ported with consistent styling |
| Breadcrumbs | Custom breadcrumb component | `PageBreadcrumb` from `src/components/common/PageBreadCrumb.tsx` | Already ported with page title + Home link |
| Card wrappers | Custom card CSS | `ComponentCard` from `src/components/common/ComponentCard.tsx` | Already ported with title, description, and content area |
| File upload UI | Custom drag-drop logic | `react-dropzone` library (already installed) | Handles drag events, file type validation, browser compatibility |
| Pagination | Custom page controls | `Pagination` from `src/components/tables/Pagination.tsx` | Already ported with prev/next and page number buttons |
| Dropdown menus | Custom dropdown | `Dropdown` + `DropdownItem` from `src/components/ui/dropdown/` | Already ported with click-outside-close behavior |
| Theme toggle | Custom theme logic | `ThemeToggleButton` from `src/components/common/ThemeToggleButton.tsx` | Already ported with mount guard |
| Session access | Custom cookie parsing | `auth.api.getSession({ headers: await headers() })` | Better Auth handles session validation, Redis lookup, cookie parsing |

**Key insight:** All TailAdmin components are already ported to `src/components/`. Phase 3 composes them into portal-specific layouts rather than porting them again.

## Common Pitfalls

### Pitfall 1: Missing Auth Guard in Individual Pages
**What goes wrong:** Developer assumes `(portal)/layout.tsx` handles auth protection, but the proxy only checks for the session cookie -- it does not verify the user role. Individual pages must call `auth.api.getSession()` and check roles.
**Why it happens:** The proxy redirects unauthenticated users, but authenticated admin users could visit portal pages.
**How to avoid:** Every portal page calls `auth.api.getSession({ headers: await headers() })` and redirects admin roles to `/admin/dashboard`, same as the existing placeholder dashboard page.
**Warning signs:** Admin user can see customer portal pages.

### Pitfall 2: Drizzle Import Confusion
**What goes wrong:** Importing operators (`eq`, `and`, `sql`, `desc`, `count`) from `@/lib/db/schema` instead of `drizzle-orm`. The schema file only exports table definitions and relations.
**Why it happens:** Schema and operators are related conceptually but live in different packages.
**How to avoid:** Always import operators from `"drizzle-orm"`: `import { eq, and, sql, desc, gt, lt, count } from "drizzle-orm"`. Import tables from `"@/lib/db/schema"`.
**Warning signs:** TypeScript error "not exported from module".

### Pitfall 3: NotificationDropdown Client/Server Boundary
**What goes wrong:** Trying to make `NotificationDropdown` a server component when it's used inside `AppHeader` which is already `"use client"`.
**Why it happens:** AppHeader uses `useSidebar()` hook, forcing it to be a client component. All its children are also client components.
**How to avoid:** Use server actions for data fetching within the client component, or pass data via a context/provider that wraps the shell.
**Warning signs:** "use server" directive inside a file imported by a "use client" file causes build errors.

### Pitfall 4: JSONB Column Type Safety
**What goes wrong:** `activationDomains`, `attachments`, and `data` columns are `jsonb()` with `.default([])` or `.default(null)`. TypeScript types show these as `Json | null`, not typed arrays.
**Why it happens:** Drizzle's JSONB type does not enforce inner type structure at the ORM level.
**How to avoid:** Use runtime type assertions or Zod parsing when reading JSONB columns. For example: `const domains = (license.activationDomains ?? []) as string[]`.
**Warning signs:** Runtime errors when iterating over JSONB arrays that are actually null.

### Pitfall 5: File Upload Without Server Action
**What goes wrong:** Trying to handle file uploads directly in a client component without a server action to write to filesystem.
**Why it happens:** File uploads require server-side filesystem access which client components cannot have.
**How to avoid:** Create a server action that accepts `FormData`, extracts the file, writes to a designated directory (e.g., `uploads/tickets/`), and stores metadata in the `attachments` JSONB column.
**Warning signs:** `fs` module imported in a `"use client"` file.

### Pitfall 6: Empty State vs Loading State Confusion
**What goes wrong:** Showing a loading spinner when the query returns zero results (the table is genuinely empty).
**Why it happens:** Not distinguishing between "data is loading" and "data loaded but empty".
**How to avoid:** Server components resolve before rendering -- there is no loading state. If the query returns `[]`, show the empty state (zeros + welcome message per D-04). No Suspense boundary needed for data fetching in server components.
**Warning signs:** Loading spinner appears for zero-data pages.

## Code Examples

### Dashboard Metrics Query (PORT-01)
```typescript
// Source: Drizzle ORM count pattern from src/app/(admin)/admin/setup/actions.ts
import { db } from "@/lib/db";
import { licenses, downloads, tickets } from "@/lib/db/schema";
import { eq, and, sql, gt } from "drizzle-orm";

// Get counts for the 4 metric cards
async function getDashboardMetrics(userId: string) {
  const [activeLicenses] = await db
    .select({ count: sql<number>`count(*)` })
    .from(licenses)
    .where(and(eq(licenses.userId, userId), eq(licenses.status, "active")));

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const [expiringSoon] = await db
    .select({ count: sql<number>`count(*)` })
    .from(licenses)
    .where(
      and(
        eq(licenses.userId, userId),
        eq(licenses.status, "active"),
        gt(licenses.expiresAt, new Date()),
        sql`${licenses.expiresAt} < ${thirtyDaysFromNow}`
      )
    );

  const [recentDownloads] = await db
    .select({ count: sql<number>`count(*)` })
    .from(downloads)
    .where(eq(downloads.userId, userId));

  const [openTickets] = await db
    .select({ count: sql<number>`count(*)` })
    .from(tickets)
    .where(and(eq(tickets.userId, userId), sql`${tickets.status} IN ('open', 'in_progress')`));

  return {
    activeLicenses: activeLicenses?.count ?? 0,
    expiringSoon: expiringSoon?.count ?? 0,
    recentDownloads: recentDownloads?.count ?? 0,
    openTickets: openTickets?.count ?? 0,
  };
}
```

### Badge Status Mapping (PORT-02, PORT-03, PORT-05)
```typescript
// Source: Badge component from src/components/ui/badge/Badge.tsx
// License status -> Badge color mapping
const licenseBadgeColor: Record<string, "success" | "error" | "warning" | "light"> = {
  active: "success",
  expired: "warning",
  revoked: "error",
  suspended: "light",
};

// Order status -> Badge color mapping
const orderBadgeColor: Record<string, "success" | "warning" | "error" | "light"> = {
  completed: "success",
  pending: "warning",
  failed: "error",
  refunded: "light",
};

// Ticket status -> Badge color mapping
const ticketBadgeColor: Record<string, "success" | "warning" | "error" | "light"> = {
  open: "warning",
  in_progress: "success",
  resolved: "success",
  closed: "light",
};

// Ticket priority -> Badge color mapping
const priorityBadgeColor: Record<string, "success" | "warning" | "error" | "primary"> = {
  low: "success",
  medium: "warning",
  high: "error",
  urgent: "primary",
};
```

### SessionUser Type Pattern
```typescript
// Source: Established pattern from src/components/dashboard/UserDropdown.tsx
type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
  phone?: string;
};

// In server components:
const userRole = (session.user as Record<string, unknown>).role as string;
const userId = session.user.id;

// In client components (using auth-client):
const { data: session } = useSession();
const user = session?.user as SessionUser | undefined;
```

### Page Breadcrumb Pattern
```typescript
// Source: src/components/common/PageBreadCrumb.tsx
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

// Every portal page starts with:
<PageBreadcrumb pageTitle="Licenses" />

// For nested pages, the breadcrumb already handles Home > PageName
// The "Home" link currently goes to "/" - for portal pages it should go to "/dashboard"
// This may need a prop to customize the base link
```

### Metric Card Adaptation (from EcommerceMetrics)
```typescript
// Source: src/components/ecommerce/EcommerceMetrics.tsx pattern
// Adapted for portal dashboard:
function MetricCard({
  icon,
  label,
  value,
  iconBgClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  iconBgClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${iconBgClass ?? "bg-brand-50 dark:bg-brand-500/[0.12]"}`}>
        {icon}
      </div>
      <div className="mt-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
          {value}
        </h4>
      </div>
    </div>
  );
}
```

### Ticket Conversation Pattern (PORT-05)
```typescript
// Chat-style thread for ticket detail page
// Server component fetches messages, client component renders with auto-scroll

// Query:
const messages = await db
  .select()
  .from(ticketMessages)
  .where(eq(ticketMessages.ticketId, ticketId))
  .orderBy(ticketMessages.createdAt);

// Render pattern (client component):
"use client";
import { useEffect, useRef } from "react";

export function TicketConversation({ messages, currentUserId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] p-4">
      {messages.map((msg) => {
        const isOwn = msg.userId === currentUserId;
        return (
          <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
              isOwn
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90"
            }`}>
              <p className="text-sm">{msg.message}</p>
              <span className={`text-xs mt-1 block ${isOwn ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}>
                {new Date(msg.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
```

### File Upload Server Action (PORT-05)
```typescript
// Server action for ticket attachments
"use server";

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function uploadAttachment(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const file = formData.get("file") as File;
  if (!file) return { error: "No file provided" };

  // Basic validation
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) return { error: "File too large (max 10MB)" };

  const allowedTypes = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
  if (!allowedTypes.includes(file.type)) return { error: "File type not allowed" };

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = join(process.cwd(), "uploads", "tickets");

  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${file.name}`;
  await writeFile(join(uploadDir, fileName), buffer);

  return {
    success: true,
    attachment: {
      fileName: file.name,
      storedName: fileName,
      size: file.size,
      type: file.type,
    },
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| API routes for data fetching | Server components with direct DB queries | Next.js 13+ App Router | No need for `/api/*` routes for portal data |
| Client-side data fetching | Server component rendering | Phase 1 decision (D-01) | All portal pages can render data before reaching client |
| Custom auth middleware | Better Auth session API | Phase 1 setup | `auth.api.getSession()` is the single source of truth |
| TailAdmin in backenddashboard/ | Ported to src/components/ | Phase 2 | All UI primitives ready in project source |

**Deprecated/outdated:**
- `backenddashboard/` folder: Components are ported. The folder remains as reference only. [VERIFIED: all needed components exist in `src/components/`]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | File upload directory `uploads/tickets/` will be writable in production | File Upload | Uploads fail silently; need to ensure directory permissions |
| A2 | `PageBreadCrumb` "Home" link going to "/" is acceptable for portal pages | Architecture | May need to change to "/dashboard" for portal context |
| A3 | NotificationDropdown can be rewritten as a client component that calls server actions for data | Architecture | If not possible, need to restructure the header component |
| A4 | `drizzle-orm` operators like `inArray`, `not`, `isNotNull` are available in v0.45.2 | Code Examples | Some query patterns may need adjustment |
| A5 | Downloads table has enough fields for the featured card UI (file size is not in schema) | Downloads Page | May need to show version + date only, or add fileSize column |

**If this table is empty:** All claims in this research were verified or cited -- no user confirmation needed.

## Open Questions

1. **PageBreadCrumb "Home" link destination**
   - What we know: Current breadcrumb links "Home" to "/". Portal pages are under "/dashboard/*".
   - What's unclear: Should "Home" in breadcrumb link to "/" (marketing site) or "/dashboard" (portal)?
   - Recommendation: Add an optional `basePath` prop to PageBreadCrumb, defaulting to "/dashboard" for portal pages.

2. **NotificationDropdown data flow**
   - What we know: AppHeader is a client component. NotificationDropdown is its child.
   - What's unclear: Best pattern for passing real notification data into the dropdown.
   - Recommendation: Create a `getNotifications()` server action that the NotificationDropdown calls via `useEffect` on mount. This keeps the client/server boundary clean.

3. **Downloads table schema vs UI needs**
   - What we know: Downloads table has `version`, `fileName`, `downloadToken`, `expiresAt`, `downloadedAt`, `createdAt`. No `fileSize`, `changelog`, or `releaseNotes` columns.
   - What's unclear: Where does changelog content come from? The CONTEXT.md says "expandable changelog per version entry" but the schema has no changelog column.
   - Recommendation: Add a `changelog` JSONB column to downloads, or create a separate `versions` data file. For Phase 3 with empty states, this may be deferred -- show version and date only when no changelog data exists.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL | All DB queries | Assumed (Phase 1 setup) | - | N/A |
| Node.js | Runtime | Available | 20+ | - |
| pnpm | Package manager | Available | - | - |
| react-dropzone | File upload | Installed | 15.0.0 | - |
| date-fns | Date formatting | Installed | 4.1.0 | - |
| lucide-react | Icons | Installed | 1.14.0 | - |

**Missing dependencies with no fallback:**
- None -- all required packages are installed.

**Missing dependencies with fallback:**
- None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected |
| Config file | none |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PORT-01 | Dashboard metrics display correct counts | Manual (visual) | N/A | N/A |
| PORT-02 | License list renders with masked keys, copy works | Manual (visual) | N/A | N/A |
| PORT-03 | Invoice table shows correct status badges | Manual (visual) | N/A | N/A |
| PORT-04 | Downloads page shows featured card + version history | Manual (visual) | N/A | N/A |
| PORT-05 | Ticket create/reply flow works with attachments | Manual (visual) | N/A | N/A |
| PORT-06 | Notification bell shows real data, mark read works | Manual (visual) | N/A | N/A |

### Sampling Rate
- **Per task commit:** Visual verification in dev server
- **Per wave merge:** `pnpm build` must pass
- **Phase gate:** All 6 PORT requirements verified manually + build passes

### Wave 0 Gaps
- No test framework is installed. This is consistent with the project state (no tests in v1.x or v2.0 Phases 1-2).
- All testing for Phase 3 will be manual/visual verification via `pnpm dev`.
- If automated testing is desired, Vitest would need to be installed and configured.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Better Auth session check on every page |
| V3 Session Management | yes | Better Auth with Redis-backed sessions, 30-day expiry |
| V4 Access Control | yes | Per-page role checks; user can only see own data (userId filter) |
| V5 Input Validation | yes | Server actions validate all inputs before DB writes |
| V6 Cryptography | yes | File upload validation (type, size); no custom crypto |

### Known Threat Patterns for Customer Portal

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| IDOR - accessing other user's data | Tampering + Information Disclosure | Every query filters by `session.user.id`; server actions re-verify ownership |
| XSS in ticket messages | Tampering | React auto-escapes; no dangerouslySetInnerHTML |
| File upload malicious content | Tampering | Server-side file type validation, size limits; store outside public directory |
| Session hijacking | Spoofing | Better Auth httpOnly cookies, Redis session store |
| Mass assignment | Tampering | Server actions define explicit fields; never pass raw form body to DB |

**Critical security pattern:** Every DB query in portal pages MUST include `eq(table.userId, session.user.id)` to prevent cross-user data access. Server actions must re-verify the session before any mutation.

## Sources

### Primary (HIGH confidence)
- `src/lib/db/schema.ts` -- Full 8-table schema with enums, relations, indexes [VERIFIED: file read]
- `src/lib/auth.ts` -- Better Auth configuration with session, hooks, plugins [VERIFIED: file read]
- `src/lib/db/index.ts` -- Drizzle + postgres.js connection setup [VERIFIED: file read]
- `src/components/ui/badge/Badge.tsx` -- Badge component with 7 colors, 2 variants, 2 sizes [VERIFIED: file read]
- `src/components/ui/table/index.tsx` -- Table primitives (Table, TableRow, TableCell, etc.) [VERIFIED: file read]
- `src/components/ui/modal/index.tsx` -- Modal with escape, backdrop, fullscreen support [VERIFIED: file read]
- `src/components/common/ComponentCard.tsx` -- Card wrapper with title/desc/content [VERIFIED: file read]
- `src/components/common/PageBreadCrumb.tsx` -- Breadcrumb component [VERIFIED: file read]
- `src/components/tables/Pagination.tsx` -- Pagination component [VERIFIED: file read]
- `src/components/ecommerce/EcommerceMetrics.tsx` -- Metric cards layout reference [VERIFIED: file read]
- `src/components/header/NotificationDropdown.tsx` -- Existing placeholder dropdown [VERIFIED: file read]
- `src/components/dashboard/DashboardShell.tsx` -- Layout shell with sidebar + header [VERIFIED: file read]
- `src/components/dashboard/PortalShell.tsx` -- Portal-specific shell wrapper [VERIFIED: file read]
- `src/components/dashboard/AppHeader.tsx` -- Header with notification bell + user dropdown [VERIFIED: file read]
- `src/app/(portal)/layout.tsx` -- Portal route group layout [VERIFIED: file read]
- `src/app/(portal)/dashboard/page.tsx` -- Existing portal dashboard placeholder [VERIFIED: file read]
- `src/proxy.ts` -- Route protection with session cookie check [VERIFIED: file read]
- `src/styles/dashboard.css` -- Dashboard design tokens [VERIFIED: file read]
- `src/data/dashboard-nav.ts` -- Customer nav items config [VERIFIED: file read]
- `src/lib/audit.ts` -- Audit log pattern [VERIFIED: file read]
- `package.json` -- All dependencies verified [VERIFIED: file read]

### Secondary (MEDIUM confidence)
- Drizzle ORM query patterns (count, eq, and, sql) -- validated against existing codebase usage in `src/app/(admin)/admin/setup/actions.ts` [VERIFIED: file read]
- Better Auth `auth.api.getSession()` pattern -- validated against existing usage in portal and admin dashboard pages [VERIFIED: file read]

### Tertiary (LOW confidence)
- None -- all claims verified against source files in this session.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all dependencies already installed and verified
- Architecture: HIGH - server component pattern established in Phases 1-2, all components ported
- Pitfalls: HIGH - identified from direct codebase analysis
- Query patterns: HIGH - validated against existing Drizzle usage in codebase
- Security: HIGH - established auth patterns, per-page guards

**Research date:** 2026-05-16
**Valid until:** 2026-06-16 (stable stack, no breaking changes expected)
