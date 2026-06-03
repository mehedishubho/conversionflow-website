# Phase 18: Subscription & Status Management - Context

**Gathered:** 2026-06-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Manage the full subscription lifecycle — license expiration tracking, grace periods, renewal reminder emails, and lifetime license support. Introduces BullMQ background workers for the first time, adds `grace_period` to the license status enum, and creates the daily expiration check job that handles both status transitions and reminder emails.

This phase populates the `src/modules/licensing/` bounded context with subscription lifecycle services and creates the first BullMQ workers in `src/jobs/`.

**In scope:**
- Add `grace_period` to `licenseStatusEnum` in schema
- License status transition service (active → grace_period → expired, plus revoke/suspend)
- Strict state machine enforcing valid transitions only
- Grace period logic: admin-configurable length, stored in settings table
- Validation API update: real-time check for grace period status, return `valid: true` with `grace_period_expires_at` during grace period
- BullMQ worker: single combined daily job (expiration checks, reminders, status transitions)
- Reminder emails at 30, 14, 7, 3, 1 days before expiration (single template, variable urgency)
- Grace period entry notification email (separate template)
- Final expiration notification email (separate template)
- Reminder dedup tracking in database (`license_reminders` table)
- Exact calendar date calculation for expiry (same day next month, last-day clamp)
- Grace period = fixed days after `expires_at` timestamp
- `expiresAt` set at license creation time based on plan's `billingCycle`
- Lifetime licenses: `expiresAt = NULL`, worker skips them
- Update `OrderCompletedHandler` to set `expiresAt` using exact calendar math
- Admin settings UI for configuring grace period days and reminder milestones
- Domain events published on status transitions (LICENSE_GRACE_PERIOD_STARTED, LICENSE_EXPIRED)
- Domain activations preserved on expiry (not auto-deactivated)

**NOT in scope (later phases):**
- Renewal checkout flow (customer pays to extend license) — future phase
- Customer self-renewal — Phase 19
- In-app notifications in customer portal — Phase 19
- Admin dashboard for viewing/managing subscription statuses — Phase 19
- License transfer system — Phase 19
- Analytics for subscription metrics — Phase 19
- Removing central API dependencies — Phase 20

</domain>

<decisions>
## Implementation Decisions

### Grace Period Design
- **D-01:** Grace period length is admin-configurable via the settings table (alongside VAT rate and other configs). Default: 7 days. Admin can adjust between 7-30 days.
- **D-02:** During grace period, the validation API (`/api/v1/license/validate`) returns `valid: true` with an extra `grace_period_expires_at` field. The WordPress plugin continues working normally but knows expiration is imminent.
- **D-03:** Validation API performs real-time expiry check — compares `expires_at` timestamp against current time on every validation request. This prevents the 24-hour stale-status window between actual expiry and daily worker processing. The worker still handles DB status transitions and emails; the API adds a safety net.
- **D-04:** Status transitions are worker-driven. The daily BullMQ job finds licenses past their `expires_at`, transitions `active → grace_period` (if within grace window) or `grace_period → expired`. The validation API never writes status changes — it only reads current status.
- **D-05:** Grace period starts from the exact `expires_at` timestamp. Grace period end = `expires_at + grace_days`. Fixed day count, simple and predictable.
- **D-06:** Customer gets a notification email when their license enters grace period. This is separate from pre-expiration reminders.
- **D-07:** Admin revocation and suspension bypass grace period — always immediate. Grace period only applies to natural expiration transitions.

### Background Job Architecture
- **D-08:** Single combined daily worker handles all subscription lifecycle tasks: find expiring licenses, send reminders, process grace period entry, handle final expiration. No dispatcher/specialized workers split.
- **D-09:** Worker processes all licenses in one query + loop. No chunking or batching. Current scale (500 stores) doesn't require it. Add batching later if scale grows.
- **D-10:** BullMQ workers run in the same Next.js process via module initialization. Workers registered in `module-init.ts`. No separate deployment.
- **D-11:** Use BullMQ's built-in repeatable jobs for scheduling. Cron-style, persisted in Redis, survives restarts.
- **D-12:** Job failures use auto-retry with exponential backoff (1 min, 5 min, 30 min). Max 3 attempts. After max retries, job fails and logs error.
- **D-13:** Continue on partial failure — if sending a reminder email fails for one license, log the error but continue processing other licenses. Status transitions still happen. Next day's run retries the email (dedup table prevents duplicate sends).

### Expiry Calculation
- **D-14:** Exact calendar dates for subscription expiry. Monthly = same day next month with last-day-of-month clamping (Jan 31 → Feb 28/29, Apr 30, Jun 30). Yearly = same date next year.
- **D-15:** When admin renews a license, new `expires_at` is calculated from the renewal date (fresh start), NOT from the old expiry date. Noted for Phase 19's renewal checkout.
- **D-16:** Lifetime licenses have `expiresAt = NULL`. Daily worker skips all NULL `expires_at` licenses. No expiration tracking, no reminders, no grace period.
- **D-17:** `expiresAt` set at license creation time by `OrderCompletedHandler`. Handler reads plan's `licenseType` and `billingCycle`: subscription = calculated using exact calendar math. Requires update to existing handler's `resolvePlanDetails()`.

### Reminder Flow
- **D-18:** Phase 18 sends reminders via email only. No in-app notifications in the customer portal. In-app notifications deferred to Phase 19.
- **D-19:** Single email template for countdown reminders (30, 14, 7, 3, 1 days). Variable urgency: subject line and body tone changes based on milestone ("30 days" = informational, "1 day" = urgent).
- **D-20:** Grace period entry and final expiration get their own separate email templates — they're state transitions, not countdown reminders.
- **D-21:** Reminder dedup tracked in database (`license_reminders` table). Worker checks if reminder already sent for this milestone. Prevents duplicate emails.
- **D-22:** One combined daily worker: checks expiring licenses (30/14/7/3/1 days), sends reminders, processes grace period entry, handles final expiration. Single job, multiple responsibilities.

### State Management
- **D-23:** Strict state machine for license status transitions. Only valid transitions allowed:
  - `active → grace_period` (worker, natural expiry)
  - `active → revoked` (admin action)
  - `active → suspended` (admin action)
  - `grace_period → expired` (worker, grace period ended)
  - `revoked → active` (admin restore)
  - `suspended → active` (admin restore)
  - `expired → active` (admin renewal/restore)
  - Invalid transitions throw errors.
- **D-24:** Domain activations are preserved when a license expires. Not auto-deactivated. If admin renews/reactivates, activations are immediately valid again — zero customer downtime.
- **D-25:** Config changes (grace period days, reminder milestones) apply immediately to all licenses. The next worker run re-evaluates all licenses against current settings. No per-license config snapshots.

### Admin Settings
- **D-26:** Phase 18 includes admin UI for configuring subscription settings. A new section on the existing admin settings page with:
  - Grace period days (7-30, default 7)
  - Reminder milestones (comma-separated days, default "30,14,7,3,1")
- **D-27:** Settings stored in the existing `settings` table using key-value pattern (same as VAT rate settings).

### Domain Events
- **D-28:** Worker publishes `LICENSE_GRACE_PERIOD_STARTED` and `LICENSE_EXPIRED` events via the in-process event bus. Other modules can subscribe (audit logging, future analytics).
- **D-29:** Events use `inProcessPublisher` (synchronous, same pattern as `OrderCompleted`). Event handler failures log errors but don't block the worker.

### Claude's Discretion
- Exact `license_reminders` table schema vs JSONB column choice
- Worker registration pattern (new `initializeSubscriptionModule()` vs inline in existing)
- Reminder email template design, content, and subject lines
- Grace period notification email subject and body
- Expiration notification email subject and body
- How to surface failed jobs to admin
- Exact exponential backoff intervals
- State machine implementation pattern (enum map, transition validation function, etc.)
- Admin settings UI layout (form fields, validation, save pattern)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-Level Specs
- `.planning/REQUIREMENTS.md` §"License Status & Subscriptions (LSTAT)" — LSTAT-01 through LSTAT-07
- `.planning/REQUIREMENTS.md` §"Background Jobs (JOBS)" — JOB-01, JOB-02, JOB-04
- `.planning/ROADMAP.md` §"Phase 18: Subscription & Status Management" — Success criteria 1-5

### Phase 17 Integration (MUST update)
- `src/modules/billing/application/handlers/OrderCompletedHandler.ts` — Update `resolvePlanDetails()` to use exact calendar date math for subscription expiry
- `src/lib/module-init.ts` — Add worker registration for subscription module

### Phase 16 Licensing (MUST extend)
- `src/lib/db/schema.ts` — `licenseStatusEnum`: add `grace_period`. `licenses` table: `expiresAt` already nullable. Add `license_reminders` table.
- `src/lib/db/schema.ts` — `productPlans` table: `licenseType` and `billingCycle` fields
- `src/modules/licensing/domain/entities/License.ts` — Add `isInGracePeriod`, `daysUntilExpiry` getters
- `src/modules/licensing/domain/events/LicenseEvents.ts` — Add `LICENSE_EXPIRED`, `LICENSE_GRACE_PERIOD_STARTED`
- `src/app/api/v1/license/validate/route.ts` — Update response for grace period, add real-time expiry check

### Existing Infrastructure
- `src/jobs/queues.ts` — BullMQ queue structure, add subscription/reminder queue
- `src/lib/redis.ts` — Redis connection, BullMQ uses same instance
- `src/lib/emails/order-confirmation.ts` — Email pattern (Resend), create reminder templates
- `src/shared/infrastructure/eventBus/EventBus.ts` — Event bus for status change events
- `src/app/(admin)/actions/admin-settings.ts` — Admin settings upsert pattern for grace period config

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **BullMQ v5.76.8** — Installed, queue structure in `src/jobs/queues.ts`, no workers yet
- **Redis connection** (`src/lib/redis.ts`) — ioredis client, BullMQ uses same instance
- **Email system** (Resend) — Pattern in `src/lib/emails/order-confirmation.ts`
- **Event bus** — In-process and cross-process available, `inProcessPublisher` for sync events
- **License entity** — Has `expiresAt`, `status`, `isExpired`, `hasExpiry` getters
- **Settings table** — Key-value pattern with upsert in `admin-settings.ts`
- **OrderCompletedHandler** — Already calculates `expiresAt` in `resolvePlanDetails()` (approximate), needs update to exact calendar math

### Established Patterns
- **Module initialization** — `registerBillingHandlers()` in `module-init.ts`
- **Event publishing** — `inProcessPublisher.publish()` in handlers
- **Admin settings** — Settings table for configurable values, upsert pattern
- **DDD module layering** — domain/application/infrastructure
- **Email templates** — Resend with inline CSS, consistent structure

### Integration Points
- `src/lib/db/schema.ts` — Add `grace_period` to enum, add `license_reminders` table
- `src/modules/billing/application/handlers/OrderCompletedHandler.ts` — Update `resolvePlanDetails()` to exact calendar math
- `src/jobs/` — Create worker file(s) for subscription lifecycle
- `src/lib/emails/` — Create reminder/grace/expired email templates (3 templates total)
- `src/app/api/v1/license/validate/route.ts` — Add real-time expiry check + grace period response
- `src/app/(admin)/` — Add subscription settings section to admin settings page
- `src/modules/licensing/domain/events/LicenseEvents.ts` — Add new event types
- `src/modules/licensing/domain/entities/License.ts` — Add new getters

</code_context>

<specifics>
## Specific Ideas

- Daily worker runs at 2:00 AM UTC (`0 2 * * *`) — low-traffic hour
- `license_reminders` table: `license_id`, `milestone` (30, 14, 7, 3, 1, grace_entered, expired), `sent_at`. Unique constraint on `(license_id, milestone)`
- Grace period notification subject: "Your ConversionFlow License is in Grace Period — Renew Now"
- Final expiration subject: "Your ConversionFlow License Has Expired"
- OrderCompletedHandler update: replace `now + (billingDurationMonths * 30)` with exact calendar date calculation (same day next month with last-day clamp)
- Validation API update: if `expires_at < now` and `status === "active"`, return `valid: true` with `grace_period_expires_at: expires_at + grace_days`. If past grace period, return `valid: false`.
- State machine valid transitions map:
  ```
  active → grace_period, revoked, suspended
  grace_period → expired
  revoked → active
  suspended → active
  expired → active
  ```
- Admin settings: add "Subscription" section with grace_period_days (number input, 7-30) and reminder_milestones (text input or multi-select)
- Email templates: 3 files — `license-expiry-reminder.ts` (countdown), `license-grace-period.ts` (grace entry), `license-expired.ts` (final expiration)
- Event payloads: `{ licenseId, previousStatus, newStatus, expiresAt, gracePeriodEndsAt }`

</specifics>

<deferred>
## Deferred Ideas

- **Renewal checkout flow** — Future phase (customer-facing payment to extend license)
- **Customer self-renewal** — Phase 19
- **In-app notifications** — Phase 19 (Portal & Analytics Enhancements)
- **Auto-renewal** — Far future
- **Subscription analytics** — Phase 19
- **Admin dashboard for subscriptions** — Phase 19
- **Failed job admin UI** — Future operational improvement
- **Worker batch/chunk processing** — If scale grows beyond current 500 stores
- **Renewal from old expiry date (stacking)** — Customer preferred fresh start from renewal date
- **Cross-process event publishing** — In-process sufficient for single-worker architecture

</deferred>

---

*Phase: 18-subscription-status*
*Context gathered: 2026-06-03*
