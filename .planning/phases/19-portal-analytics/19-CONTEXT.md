# Phase 19: Portal & Analytics Enhancements - Context

**Gathered:** 2026-06-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Enhance the admin dashboard with a dedicated License Analytics page (KPI cards, trend charts, activation geo-table) powered by a BullMQ pre-aggregation worker, add a customer-facing license transfer system (code-based ownership transfer with audit trail and admin-configurable limits), enrich activation IPs with geo data, and extend the customer portal with subscription visibility and transfer history.

This phase extends the existing Licensing Bounded Context (`src/modules/licensing/`) and creates the Analytics module (`src/modules/analytics/`) using DDD layers from Phase 14.

**In scope:**
- Separate admin License Analytics page at `/admin/licenses/analytics/` with 6 KPI cards + 2 ApexCharts
- BullMQ analytics aggregation worker (daily snapshot to `license_analytics_cache` table)
- Geo-IP enrichment worker using local MMDB lookup on `license_activations` IPs
- Customer-facing license transfer system: generate code → share → recipient claims
- Transfer code: `CF-XFER-XXXXXX` format, 48-hour expiry
- All domain activations cleared on transfer (recipient starts fresh)
- Only active licenses eligible for transfer; recipient must have existing account
- Default 1 transfer/month per license, admin-configurable via settings
- 3-email transfer notification flow (initiated, completed, received)
- Transfer history section inline on customer license detail page
- Customer subscription visibility: expiry date, days remaining, status badge, Renew CTA
- Audit logging for all transfer operations (using existing `src/lib/audit.ts`)

**NOT in scope (later phases):**
- Renewal checkout flow (customer pays to extend license) — future phase
- Removing `src/lib/central-api.ts` and `centralOrderId`/`centralLicenseId`/`centralUserId` fields — Phase 20
- Real-time analytics with live updates (DEFER-03, post-MVP)
- Advanced reporting with scheduled PDF exports (DEFER-05, post-MVP)

</domain>

<decisions>
## Implementation Decisions

### Analytics Dashboard Integration
- **D-01:** Separate License Analytics page at `/admin/licenses/analytics/` — not merged into existing `/admin/analytics/`. Keeps license metrics focused and separate from revenue/sales analytics. Add nav link in admin sidebar under Licenses section.
- **D-02:** 6 KPI cards: Total Licenses, Active, Expired, Revoked, Grace Period count, Activation Rate %. Covers ANLT-01 and ANLT-05.
- **D-03:** 2 charts below KPI cards with date range selector (7d/30d/90d/year): (1) License trend — stacked area chart showing active/expired/revoked/grace_period over time, (2) Product breakdown — bar chart showing license distribution by product and plan. Both use ApexCharts following existing `RevenueChart.tsx` pattern.
- **D-04:** Activation geo-data displayed as a simple table (Country, Activations, % of Total). No map visualization. Data sourced from geo-IP enrichment of `license_activations` IPs.

### Analytics Aggregation Strategy
- **D-05:** Pre-aggregated cache table (`license_analytics_cache`). BullMQ worker runs daily (e.g. 1 AM UTC) and writes current snapshot: total/active/expired/revoked/grace_period counts, product breakdown (licenses per product/plan), activation rate. Dashboard reads from cache for instant load.
- **D-06:** Worker computes daily snapshots only — current counts and breakdown. Time-series trend data for charts queried from `licenses` table directly using `created_at` filtering (no pre-computed time series rows needed at 500-store scale).

### Geo-IP Enrichment
- **D-07:** Local MMDB lookup for geo-IP enrichment. Worker downloads free IP-to-country database (e.g. MaxMind GeoLite2 or DB-IP Lite), batch processes un-enriched IPs from `license_activations`, stores `country_code` in a new `geo` JSONB column on `license_activations`. No external API dependency after DB is downloaded.
- **D-08:** Enrichment runs as part of the daily analytics aggregation worker (or as a separate step in the same job). Processes IPs with NULL `geo` column.

### License Transfer System
- **D-09:** Transfer code sharing flow: customer clicks "Transfer" on license detail → system generates `CF-XFER-XXXXXX` code → customer shares code via WhatsApp/email → recipient enters code on their license page → license ownership changes. Works well for BD customers who communicate via WhatsApp.
- **D-10:** Transfer code valid for 48 hours. Customer can generate a new one if expired. Short enough to prevent abuse, long enough for async communication.
- **D-11:** All existing domain activations are cleared on transfer. Recipient starts fresh with zero activations. Clean break — old owner's sites stop using the license immediately.
- **D-12:** Only active licenses are eligible for transfer. Expired, revoked, suspended, and grace_period licenses cannot be transferred.
- **D-13:** Recipient must have an existing registered account. No guest or pending registration transfers.
- **D-14:** Default limit: 1 transfer per license per month. Admin-configurable via settings table (key: `max_transfers_per_month`). Covers XFER-04.
- **D-15:** Transfer operations logged in audit trail using existing `src/lib/audit.ts`. Each transfer creates entries for both sender and recipient with timestamp, actor, and transfer code. Covers XFER-03.

### Transfer Notifications
- **D-16:** 3-email transfer notification flow using existing Resend infrastructure:
  1. Transfer initiated → sent to original owner with confirmation and transfer code reminder
  2. Transfer completed → sent to original owner confirming ownership change
  3. License received → sent to new owner with license details and next steps

### Customer Portal Enhancements
- **D-17:** Transfer history displayed inline on the existing license detail page (`/dashboard/licenses/[id]/`) as a "Transfer History" section at the bottom. Shows initiated and received transfers with date, recipient/sender, status. No separate page needed.
- **D-18:** Customer subscription visibility added to license detail page: expiry date, days remaining, status badge (active/grace_period/expired), and a "Renew" CTA button. Renew CTA links to pricing page for now (actual renewal checkout is a future phase). Subscription licenses show all details; lifetime licenses show "Lifetime" badge with no expiry.

### Claude's Discretion
- Exact `license_analytics_cache` table schema (columns, types, indexing)
- Exact `license_transfers` table schema (columns for tracking transfer state, codes, timestamps)
- Transfer code generation format specifics (exact character set, length)
- Analytics worker implementation details (chunk processing, error handling)
- MMDB file download/storage strategy (bundled vs runtime download, update frequency)
- Email template design for all 3 transfer notification emails
- Transfer code input UI component design on recipient side
- Renew CTA button styling and link target
- Internal structure of transfer service (single service vs command handlers)
- How to surface "transfer limit reached" to the customer
- Analytics cache invalidation strategy when licenses change status between worker runs

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-Level Specs
- `.planning/REQUIREMENTS.md` §"Analytics Dashboard (ANLT)" — ANLT-01 through ANLT-05 (license analytics, revenue, product performance, customer growth, activation stats)
- `.planning/REQUIREMENTS.md` §"License Transfer System (XFER)" — XFER-01 through XFER-04 (transfer ownership, domain swap, audit trail, admin config)
- `.planning/REQUIREMENTS.md` §"Background Jobs (JOBS)" — JOB-03 (analytics aggregation worker)
- `.planning/REQUIREMENTS.md` §"Deferred (Post-MVP)" — DEFER-03 (real-time analytics), DEFER-05 (PDF exports)
- `.planning/PROJECT.md` §"Key Decisions" — Self-contained licensing, Modular Monolith + DDD, Service Layer, Repository Pattern

### Roadmap
- `.planning/ROADMAP.md` §"Phase 19: Portal & Analytics Enhancements" — Success criteria 1-6, dependency on Phase 16 + 18

### Phase 14 Infrastructure (MUST use)
- `src/shared/infrastructure/eventBus/EventBus.ts` — EventBus for transfer events
- `src/shared/infrastructure/repositories/BaseRepository.ts` — Base CRUD repository for new repositories
- `src/shared/infrastructure/repositories/types.ts` — IRepository, IMapper interfaces

### Phase 16 Licensing (MUST extend)
- `src/modules/licensing/domain/entities/License.ts` — License entity with status, activations, expiresAt
- `src/modules/licensing/domain/events/LicenseEvents.ts` — Domain events pattern (add LicenseTransferred event)
- `src/modules/licensing/infrastructure/repositories/LicenseRepository.ts` — License data access
- `src/lib/db/schema.ts` — `licenses` table, `license_activations` table, `licenseStatusEnum`

### Phase 18 Subscription (MUST integrate)
- `src/jobs/workers/subscription-lifecycle.ts` — BullMQ worker pattern (follow for analytics worker)
- `src/jobs/queues.ts` — Queue definitions (add analytics aggregation queue)
- `src/modules/licensing/application/services/ExpiryCalculator.ts` — Expiry logic for subscription visibility
- `src/app/(admin)/admin/settings/` — Settings patterns for transfer limits

### Existing Admin Analytics (MUST follow patterns)
- `src/app/(admin)/admin/analytics/page.tsx` — Analytics page pattern
- `src/app/(admin)/actions/analytics-dashboard.ts` — Analytics data fetching pattern
- `src/components/admin/analytics/AnalyticsDashboardClient.tsx` — Client component pattern
- `src/components/admin/RevenueChart.tsx` — ApexCharts implementation pattern
- `src/components/admin/DashboardKPIs.tsx` — KPI card pattern
- `src/components/admin/DateRangeSelector.tsx` — Date range selector component

### Existing Admin License Management (MUST extend)
- `src/app/(admin)/admin/licenses/page.tsx` — Admin licenses page
- `src/app/(admin)/actions/admin-licenses.ts` — License server actions
- `src/components/admin/LicensesTable.tsx` — License table with actions

### Existing Customer Portal (MUST extend)
- `src/app/(portal)/dashboard/licenses/page.tsx` — Customer license list
- `src/app/(portal)/dashboard/licenses/[id]/page.tsx` — Customer license detail (add transfer + subscription sections)

### Existing Infrastructure (MUST use)
- `src/lib/audit.ts` — Audit log system for transfer operations
- `src/lib/redis.ts` — Redis connection for BullMQ
- `src/lib/emails/` — Email template patterns (Resend)
- `src/app/(admin)/actions/admin-settings.ts` — Settings upsert pattern for transfer limits

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **ApexCharts** (react-apexcharts v2.1.0) — Already installed and used in admin analytics. License trend and product breakdown charts use same library.
- **`DashboardKPIs.tsx`** — KPI card component pattern with icon, value, trend indicator. Replicate for 6 license KPI cards.
- **`DateRangeSelector.tsx`** — Reusable date range selector (7d/30d/90d/year). Use on license analytics page.
- **`RevenueChart.tsx`** — ApexCharts implementation with dynamic import (`ssr: false`). Follow pattern for license trend chart.
- **BullMQ worker pattern** (`src/jobs/workers/subscription-lifecycle.ts`) — Complete worker implementation with repeatable jobs, retry logic, Redis connection. Follow for analytics aggregation worker.
- **`audit()` function** (`src/lib/audit.ts`) — Already tracks license events. Add `license.transferred` action.
- **`ComponentCard`, `PageBreadcrumb`** — Admin UI components for page layout.
- **`Badge` component** — Status badges. Use for license status, transfer status.
- **Email system** (Resend) — Pattern in `src/lib/emails/order-confirmation.ts`. Follow for transfer notification emails.

### Established Patterns
- **DDD module layering** — `domain/` (entities, events), `application/` (services, commands), `infrastructure/` (repositories, mappers). Phase 19 follows for analytics module.
- **Admin page pattern** — Server component → `requireAdmin()` → data fetch → render with ComponentCard + PageBreadcrumb. Follow for `/admin/licenses/analytics/`.
- **Customer portal page pattern** — Server component → auth check → data fetch with user-scoped WHERE → render.
- **Server actions** — `src/app/(admin)/actions/admin-{resource}.ts` with `requireAdmin()` guard.
- **Settings storage** — Key-value in `settings` table, upsert via `admin-settings.ts`.
- **BullMQ scheduling** — Repeatable jobs with cron pattern, persisted in Redis, auto-restart.

### Integration Points
- **`/admin/licenses/analytics/`** — New page for license analytics dashboard
- **`/dashboard/licenses/[id]/`** — Extend with transfer section and subscription visibility
- **`license_activations` table** — Add `geo` JSONB column for geo-IP enrichment
- **`settings` table** — Add `max_transfers_per_month` key for transfer limits
- **`license_transfers` table** — New table for tracking transfer state
- **`license_analytics_cache` table** — New table for pre-aggregated analytics snapshots
- **`src/jobs/queues.ts`** — Add analytics aggregation queue
- **`src/jobs/workers/`** — Add analytics aggregation worker
- **`src/lib/audit.ts`** — Add `license.transferred` action type
- **`src/lib/emails/`** — Add 3 transfer notification email templates
- **Admin sidebar** — Add "Analytics" link under Licenses section
- **EventBus** — Publish `LicenseTransferred` event for audit and future integrations

</code_context>

<specifics>
## Specific Ideas

- Transfer code format: `CF-XFER-` + 6 alphanumeric characters (same charset as license keys). Uppercase, no ambiguous chars. Example: `CF-XFER-A3K9M2`.
- Analytics worker schedule: daily at 1:00 AM UTC (`0 1 * * *`) — runs 1 hour before subscription worker at 2 AM.
- Geo-IP MMDB: Use MaxMind GeoLite2 Country (free, requires account) or DB-IP Lite (no account needed). Download to `data/geoip/` directory, update monthly. Worker checks for un-enriched IPs and batch processes.
- License analytics KPI card values sourced from `license_analytics_cache` table. Chart data sourced from direct SQL queries on `licenses` table with `created_at` range filter.
- Product breakdown chart: horizontal bar chart with products on Y-axis, license count on X-axis, stacked by plan (Starter/Professional/Agency).
- Transfer flow state machine: `pending` (code generated) → `completed` (recipient claimed) or `expired` (48h passed). Store in `license_transfers` table.
- Transfer audit entries: `action: "license.transferred"`, `details: { fromUserId, toUserId, transferCode, licenseId }`.
- Customer portal Renew CTA: Button labeled "Renew License" → links to `/pricing` page (existing marketing site pricing page). Future phase replaces with direct renewal checkout.
- Lifetime license display: Show "Lifetime License" badge (green, no expiry). No days remaining, no Renew CTA.

</specifics>

<deferred>
## Deferred Ideas

- **Renewal checkout flow** — Future phase (customer-facing payment to extend license). Phase 19 only adds the Renew CTA button that links to pricing.
- **Real-time analytics dashboard** (DEFER-03) — Post-MVP. Phase 19 uses daily pre-aggregated snapshots.
- **Advanced reporting with PDF exports** (DEFER-05) — Post-MVP.
- **Transfer between different products** — Phase 19 only transfers same license to new owner. Product downgrade/upgrade via transfer is future.
- **Bulk transfer operations** — Admin-initiated bulk transfers for business acquisitions. Future.
- **Transfer cooldown period** — Could add a cooldown (e.g. 7 days between transfers) but monthly limit covers this adequately.
- **Outbound webhook delivery** — Schema exists (`webhooks`, `webhookDeliveries` tables) but no dispatcher. Future phase.
- **In-app notifications for transfer events** — Email-only for Phase 19. In-app notifications are a future enhancement.

None — discussion stayed within phase scope

</deferred>

---

*Phase: 19-portal-analytics*
*Context gathered: 2026-06-03*
