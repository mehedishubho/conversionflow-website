# Phase 3: Customer Portal - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Build all customer-facing portal pages inside the existing `(portal)/` route group. Customers can view their dashboard overview, manage licenses, view billing/invoices, download plugin files, submit and track support tickets, manage notifications, and edit account settings — all within the PortalShell sidebar layout established in Phase 2. Real Drizzle queries against existing tables. Port TailAdmin components from `backenddashboard/` for cards, tables, badges, modals, and breadcrumbs.

</domain>

<decisions>
## Implementation Decisions

### Data Flow Strategy
- **D-01:** Real DB queries — server components with Drizzle ORM directly query the database. No API route layer. Show empty states (zero counts + welcome message) when no data exists. No mock/placeholder data.

### Dashboard Overview Design
- **D-02:** Cards + Table layout — metric cards at top (EcommerceMetrics-style), recent activity table below. Port from `backenddashboard/src/components/EcommerceMetrics.tsx`.
- **D-03:** Four metric cards with icons: active licenses, licenses expiring soon, recent downloads, open tickets. Use ComponentCard pattern from backenddashboard.
- **D-04:** Empty state shows zeros in all cards + welcome message for new users. No "no data" placeholder text.

### License Management UX
- **D-05:** Table with row actions for license list — each row has view details and copy key actions. Port Table component from backenddashboard.
- **D-06:** License key displayed masked with copy button — show partial key (e.g., `CF-****-****-ABCD`), click to copy full key to clipboard.
- **D-07:** Slide-in panel or modal for license detail view — shows full key, activation domains, status, expiry date, plan details.
- **D-08:** Activation domains shown as a list with current/max activation count. Status badges (active/expired/revoked/suspended) using Badge component.

### Page Layout Approach
- **D-09:** Port TailAdmin components: EcommerceMetrics, ComponentCard, PageBreadCrumb, Table, Badge, Modal from `backenddashboard/`. Adapt to ConversionFlow design system (dashboard.css tokens).
- **D-10:** Breadcrumbs on every portal page using PageBreadCrumb pattern from TailAdmin. Shows current page context within portal hierarchy.
- **D-11:** Billing section uses invoice table with status badges (paid/pending/failed/refunded). Payment method column shows bKash/Nagad/Rocket/Bank/SSL Commerce with icons or labels.

### Support Tickets UX
- **D-12:** Ticket list as a table with status badges (open/in_progress/resolved/closed) and priority indicators (low/medium/high/urgent).
- **D-13:** Ticket detail page uses chat-style thread layout — messages from customer and support staff in conversation bubbles, newest at bottom with auto-scroll.
- **D-14:** Create ticket via modal form — subject, priority selector, description textarea, file attachment area. No separate create-ticket page.
- **D-15:** File uploads stored on server filesystem with metadata in attachments JSONB column. No third-party file storage.

### Downloads Page Design
- **D-16:** Featured card for latest version at top (prominent, with download button). Version history table below with all previous versions.
- **D-17:** Expandable changelog per version entry — click to expand/collapse changelog details inline. No separate changelog page.

### Notifications Behavior
- **D-18:** Notification bell dropdown (in AppHeader) populated with real data from notifications table via Drizzle query. Replaces Phase 2 placeholder bell.
- **D-19:** All 4 notification types: license events (activation/expiry), billing events (payment/refund), support events (ticket reply/status change), system events (maintenance/updates). Notification type stored in notifications.type column.
- **D-20:** Click notification to mark as read + navigate to related entity. "Mark all as read" button in dropdown. Unread count badge on bell icon.

### Account Settings Page
- **D-21:** All sections on one page: Profile (name, email, phone), Password (current + new + confirm), Preferences (notification toggles). No tab navigation — sections stacked vertically.
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Planning
- `.planning/ROADMAP.md` — Phase 3 goal, requirements (PORT-01 through PORT-06), success criteria
- `.planning/REQUIREMENTS.md` — PORT-01 through PORT-06 acceptance criteria
- `.planning/PROJECT.md` — Constraints, key decisions, out of scope items
- `.planning/phases/01-foundation/01-CONTEXT.md` — Phase 1 decisions (schema, auth, routes)
- `.planning/phases/02-homepage/02-CONTEXT.md` — Phase 2 decisions (dashboard shell, sidebar, header)

### Dashboard Template (Port Source)
- `backenddashboard/src/components/EcommerceMetrics.tsx` — Metric cards layout for dashboard overview
- `backenddashboard/src/components/PageBreadCrumb.tsx` — Breadcrumb component
- `backenddashboard/src/components/ComponentCard.tsx` — Card wrapper for metrics
- `backenddashboard/src/components/Tables` — Table components for lists (licenses, tickets, invoices)
- `backenddashboard/src/components/Badge` — Status badges
- `backenddashboard/src/components/Modal` — Modal/dialog component

### Existing Source Files
- `src/lib/db/schema.ts` — Full 8-table schema (orders, licenses, downloads, tickets, ticketMessages, notifications)
- `src/data/dashboard-nav.ts` — Customer nav items config (Dashboard, Licenses, Billing, Downloads, Support, Account)
- `src/components/dashboard/PortalShell.tsx` — Portal shell wrapper with customerNavItems
- `src/components/dashboard/AdminShell.tsx` — Admin shell wrapper with adminNavItems
- `src/components/dashboard/AppSidebar.tsx` — Sidebar with navItems prop, expand/collapse states
- `src/components/dashboard/AppHeader.tsx` — Header with notification bell, user dropdown, theme toggle
- `src/lib/auth-client.ts` — Auth client (useSession, signOut)
- `src/styles/dashboard.css` — Dashboard design tokens and utility classes
- `src/app/(portal)/layout.tsx` — Portal layout with PortalShell

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **PortalShell** (`src/components/dashboard/PortalShell.tsx`): Already wraps AppSidebar + AppHeader + content area — just need portal pages to render inside it
- **AppHeader** (`src/components/dashboard/AppHeader.tsx`): Notification bell exists as placeholder — Phase 3 wires it to real data
- **DashboardShell** parameterized by navItems — portal pages inherit sidebar + header automatically
- **cn() utility** (`src/lib/utils.ts`): clsx + tailwind-merge for conditional classes
- **dashboard.css** (`src/styles/dashboard.css`): Full design token system with light/dark, brand colors, shadows, scrollbar utilities

### Database Schema (Ready to Query)
- **licenses**: licenseKey, status (active/expired/revoked/suspended), activationDomains (jsonb), maxActivations, currentActivations, expiresAt, productId, plan
- **orders**: status (pending/completed/failed/refunded), paymentMethod (bkash/nagad/rocket/bank_transfer/ssl_commerce), amount, currency (BDT), couponCode
- **tickets**: subject, description, status (open/in_progress/resolved/closed), priority (low/medium/high/urgent), assignedTo, attachments (jsonb)
- **ticketMessages**: ticketId, message, attachments (jsonb), senderId
- **notifications**: type, title, message, data (jsonb), read (boolean)
- **downloads**: productId, version, fileName, downloadToken, expiresAt

### Established Patterns
- Server components by default, `"use client"` only for interactivity
- Drizzle ORM for DB queries — `src/lib/db/schema.ts` has all table definitions
- SessionUser type cast for Better Auth additionalFields (role) in client components
- TailwindCSS v4 CSS-first config — dashboard.css tokens for all dashboard styling
- Route group isolation: `(portal)/` already exists with working layout

### Integration Points
- `(portal)/dashboard/page.tsx` — Dashboard overview page (new)
- `(portal)/licenses/page.tsx` — License list page (new)
- `(portal)/licenses/[id]/page.tsx` — License detail page (new)
- `(portal)/billing/page.tsx` — Billing/invoices page (new)
- `(portal)/downloads/page.tsx` — Downloads page (new)
- `(portal)/support/page.tsx` — Support ticket list page (new)
- `(portal)/support/[id]/page.tsx` — Ticket detail/conversation page (new)
- `(portal)/account/page.tsx` — Account settings page (new)
- AppHeader notification bell — wire to notifications table query

</code_context>

<specifics>
## Specific Ideas

- Dashboard overview cards should use the same brand-500 accent color for icon backgrounds, matching TailAdmin EcommerceMetrics style
- License key masking: show first 3 and last 4 characters (e.g., `CF-****-****-ABCD`)
- Ticket priority colors: low=green, medium=orange, high=red, urgent=brand-500 with pulse animation
- Invoice status badges: paid=green, pending=orange, failed=red, refunded=muted/gray
- Downloads featured card should show version number, release date, and file size
- Notification types map to icons: license=Key, billing=CreditCard, support=MessageSquare, system=Info
- Account page password section uses confirm-delete-style pattern: must enter current password to change

</specifics>

<deferred>
## Deferred Ideas

- License key regeneration — deferred to Phase 4 (checkout), requires central API integration
- Invoice PDF download — deferred to Phase 4 (checkout), requires invoice generation
- File upload size limits and virus scanning — deferred, basic validation in Phase 3
- Ticket merge/assign — admin-only features deferred to Phase 5
- Notification email delivery — deferred to Phase 6 (background jobs)
- License renewal/upgrade flow — deferred to Phase 4 (checkout)
- Bulk notification actions (delete, filter by type) — deferred, can add later
- Account avatar upload — deferred, initials-based for now

</deferred>

---

*Phase: 03-customer-portal*
*Context gathered: 2026-05-16*
