# Phase 6: Webhooks, Background Jobs, and License Intelligence - Context

**Gathered:** 2026-05-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Sync with the central licensing API (license.devsroom.com) via webhooks and scheduled fallback jobs. Build an admin license intelligence dashboard with domain tracking and piracy detection. Handle webhook events (created, updated, expired, payment-refunded) with HMAC verification. Background jobs handle async sync without blocking user-facing responses.

</domain>

<decisions>
## Implementation Decisions

### License Intelligence Dashboard
- **D-01:** KPI cards + chart + table layout — follows the Phase 5 admin dashboard pattern. KPI summary cards at top, plan distribution chart, then detailed licenses table with filters below.
- **D-02:** Dashboard highlights four metric types: status counts (total/active/expired/revoked), renewal rate by plan, expiring soon count (7/30 day windows), and activation rate (activated vs unused).
- **D-03:** Lives as a dedicated admin page (likely `/admin/licenses/intelligence` or enhancement of existing `/admin/licenses` page).

### Piracy Detection & Flagging
- **D-04:** Four piracy trigger patterns: (1) activation count exceeds plan limit, (2) rapid domain activation burst (multiple domains in short window), (3) geographic anomaly detection (activation from unexpected countries/IPs), (4) cross-site activation match (same key on unrelated sites).
- **D-05:** Review queue + manual action approach. Admin sees flagged licenses in a dedicated filter/section, can dismiss the flag or take action (suspend/revoke) with a reason. No auto-action.

### Domain Tracking
- **D-06:** Drill-down detail page for domain tracking. Clicking a license row opens a dedicated page showing full domain list with activation metadata.
- **D-07:** Track and display: domain URL + activation timestamps, multisite flag (primary vs subsite), geo/IP data per activation, and last verification check date.
- **D-08:** License detail page is license-only view — no customer context. Shows domain tracking table, activation history, sync status, piracy flags, and license metadata.

### Webhook & Sync Error Handling
- **D-09:** Sync failures surfaced as a "Sync Failures" filter/tab on the existing licenses page. Shows licenses stuck in pending_sync with error details. Admin can retry individually or bulk retry.
- **D-10:** All four webhook events handled: `license.created`, `license.updated`, `license.expired`, `license.payment_refunded`.

### Job Scheduling
- **D-11:** 15-minute sync job uses BullMQ repeatable job. Fits existing queue pattern in `src/jobs/queues.ts` with Redis connection. No additional infrastructure needed.

### Webhook Processing Architecture
- **D-12:** Single POST route at `/api/webhooks/license` that validates HMAC, parses event type, then dispatches to event-specific handler functions.
- **D-13:** Define expected webhook payload contract as TypeScript interfaces. Adjust when central API documentation is available.

### Claude's Discretion
- Exact KPI card styling and chart library choice
- Piracy flag severity levels and badge colors
- Domain tracking table column layout
- Webhook HMAC implementation details (timing-safe comparison, secret rotation)
- BullMQ repeatable job configuration (retry attempts, backoff)
- Sync retry logic and error detail formatting
- License detail page component structure
- Plan distribution chart type (bar, pie, donut)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Planning
- `.planning/ROADMAP.md` — Phase 6 goal, requirements (LIC-03, LIC-04, LIC-05, LINT-01, LINT-02, LINT-03), success criteria
- `.planning/REQUIREMENTS.md` — LIC-03 through LIC-05, LINT-01 through LINT-03 acceptance criteria
- `.planning/PROJECT.md` — Constraints (pnpm only, Next.js 16, proxy.ts, TailwindCSS v4 CSS-first), central licensing rule

### Prior Phase Context
- `.planning/phases/04-checkout-payments/04-CONTEXT.md` — Phase 4 decisions (central API integration pattern, pending_sync status, D-13/D-14 on failed sync handling, webhook route stub)
- `.planning/phases/05-admin-dashboard/05-UAT.md` — Phase 5 UAT results (licenses page already built with table, badges, CSV export)

### Database Schema
- `src/lib/db/schema.ts` — Full schema: licenses table (activationDomains jsonb, currentActivations, maxActivations, status enum, centralLicenseId), orders table (centralOrderId, status), user table (centralUserId)

### Existing Infrastructure
- `src/jobs/queues.ts` — BullMQ queue setup with Redis connection: emailQueue, licenseSyncQueue, notificationQueue already configured
- `src/lib/central-api.ts` — Central API client with importOrderToCentral (production) and mockImportOrderToCentral (dev fallback)
- `src/app/(admin)/admin/licenses/page.tsx` — Existing admin licenses page with table, status badges, CSV export
- `src/styles/dashboard.css` — Dashboard styling tokens including Badge color utilities (success/error/warning/blue-light)

### Auth & Security
- `src/lib/auth.ts` — Better Auth server instance
- `src/lib/audit.ts` — Audit logging for admin actions
- `src/app/(admin)/actions/admin-users.ts` — requireAdmin() guard pattern with role check

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **BullMQ queues** (`src/jobs/queues.ts`): `licenseSyncQueue` already created with Redis connection. Ready for repeatable job registration and worker processing.
- **Central API client** (`src/lib/central-api.ts`): Production client with Bearer token auth + mock fallback. Pattern for HTTP calls to license.devsroom.com.
- **Admin licenses page** (`src/app/(admin)/admin/licenses/page.tsx`): Server component with license listing, status badges, CSV export. Can be extended with intelligence view.
- **LicensesCSVExportButton** (`src/components/admin/LicensesCSVExportButton.tsx`): Client wrapper pattern for CSV export — reusable.
- **Badge component** (`src/components/ui/badge/Badge.tsx`): Supports success/warning/error/light colors. Already used for license status.
- **ComponentCard, PageBreadCrumb** — Reusable card wrapper and breadcrumb for admin pages.
- **Admin notification system** — Already handles admin-scoped notifications with types. Can be extended for sync failure alerts.

### Established Patterns
- Server components by default, `"use client"` only for interactivity
- Drizzle ORM for DB queries — parameterized, type-safe
- Server actions at `(admin)/actions/` for mutations with requireAdmin guard
- Admin pages under `(admin)/admin/` with sidebar navigation
- `src/styles/dashboard.css` — separate CSS for dashboard routes, TailwindCSS v4 with `@theme` blocks
- Audit logging via `createAuditLog()` for all admin mutations

### Integration Points
- `src/app/api/webhooks/license/route.ts` — New webhook handler route (identified in Phase 4 CONTEXT.md)
- `src/jobs/workers/` — New directory for BullMQ job processors (license sync worker, webhook retry worker)
- `src/app/(admin)/admin/licenses/` — Extend with intelligence sub-page or detail page
- `src/app/(admin)/admin/licenses/[id]/page.tsx` — New license detail page for domain tracking
- `src/app/(admin)/actions/admin-licenses.ts` — New server actions for piracy review, sync retry, license detail queries

</code_context>

<specifics>
## Specific Ideas

- Piracy flags should use warning badges (yellow/orange) with severity indicator — admin can immediately scan the licenses table for issues
- Expiring soon KPI should show 7-day and 30-day windows separately so admin can prioritize outreach
- Domain tracking table on detail page should show domain URL, first seen date, last verified date, geo/IP, multisite flag, and an activation status indicator (active/inactive)
- Sync failure filter on licenses page should show error message from the last sync attempt and a "Retry" button
- Webhook HMAC verification should use timing-safe comparison to prevent timing attacks

</specifics>

<deferred>
## Deferred Ideas

- Automated piracy enforcement (auto-suspend on detection) — deferred, manual review is safer for now
- Real-time webhook monitoring dashboard — deferred, filter on licenses page is sufficient
- License renewal flow through the platform — deferred, central API handles renewals
- Customer-facing domain management — deferred, admin-only for now
- Webhook delivery retry from central API side — deferred, that's the central API's responsibility
- Historical piracy trend charts — deferred, might add in future if needed
- Email notifications to customers about license expiry — deferred to future phase

</deferred>

---

*Phase: 06-webhooks-jobs*
*Context gathered: 2026-05-18*
