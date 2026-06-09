# Phase 17: Multi-channel Notification Engine - Context

**Gathered:** 2026-06-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a unified notification engine delivering messages across email and in-app channels. The engine routes domain events (order completed, license generated, license expiring, etc.) to the correct channels based on user preferences, tracks delivery status per channel, and extends the existing in-app notification infrastructure with polling-based updates and a proper preferences persistence layer.

This phase activates the **Notification system** by:
1. Building a `NotificationService` that listens to domain events and routes them through channels
2. Creating a unified email sender abstraction (Nodemailer + Resend adapter) that respects admin SMTP settings
3. Adding per-channel delivery tracking via a `notification_deliveries` table
4. Persisting user notification preferences (currently a no-op UI)
5. Adding 30s polling to the existing `NotificationDropdown` for near-real-time updates
6. Wiring existing BullMQ `notificationQueue` and `emailQueue` for async processing

**In scope:**
- `NotificationService` — event-driven service that receives domain events, looks up user preferences, and dispatches to channels
- Code-based event catalog — TypeScript map defining event → channels + template + category
- Unified email sender — Nodemailer adapter + Resend adapter, selected by admin setting
- Per-channel delivery tracking — `notification_deliveries` table with status per channel (email, in_app)
- User preference persistence — `notificationPreferences` JSONB column on `user` table, wired to existing `NotificationPreferences` component
- 30s polling in `NotificationDropdown` — `setInterval` that re-fetches unread count + notifications
- BullMQ workers for `emailQueue` and `notificationQueue` — consume jobs and process asynchronously
- Core transactional events (~6-8): order confirmation, license key delivery, license expiry reminder, license grace period, password reset, API token notification, transfer events

**NOT in scope (later phases / deferred):**
- WhatsApp channel integration — deferred to Phase 17.1
- Full event catalog expansion (support tickets, blog posts, security events) — expand after core works
- DB-driven admin-configurable routing — future enhancement
- React Email component rewrite — future consideration
- SSE/WebSocket real-time push — can upgrade from polling later
- Admin template editor with live preview — code-based templates only for now
- SMS channel — not planned for BD market

</domain>

<decisions>
## Implementation Decisions

### Email Provider Abstraction
- **D-01:** Build a unified email sender with adapter pattern. Two adapters: `ResendEmailAdapter` (wraps existing Resend SDK) and `NodemailerEmailAdapter` (uses `nodemailer` for generic SMTP). The adapter is selected based on the admin's provider setting in the `site_settings` table (already managed by `/admin/settings/smtp` page).
- **D-02:** Existing 10 email templates in `src/lib/emails/` keep their HTML structure. Only the final `resend.emails.send()` call gets replaced with the unified sender. Templates stay as TypeScript functions returning HTML strings — no React Email.
- **D-03:** Add `nodemailer` as a dependency. Resend stays as optional — admin can choose either provider. Both adapters implement a common `EmailSender` interface: `send(to, subject, html, options?)`.

### In-App Notifications (Enhancement)
- **D-04:** Add 30-second polling to the existing `NotificationDropdown` component. Use `setInterval` in the existing `useEffect` to re-fetch notifications and unread count every 30 seconds. Clean up interval on unmount. No SSE or WebSocket at this stage.
- **D-05:** The existing notification types (license, billing, support, system) are sufficient for Phase 17. New events map to these existing categories. No new categories needed.

### Notification Preferences Persistence
- **D-06:** Add a `notificationPreferences` JSONB column to the existing `user` table. Default value: `{ license: true, billing: true, support: true, system: true, channels: { email: true, in_app: true } }`. The existing `NotificationPreferences` component's Save button is wired to a server action that updates this column.
- **D-07:** Per-channel toggle (email on/off, in-app on/off) is added to the preferences UI alongside the existing category toggles. Users can control both WHAT they get notified about AND through which channel.

### Event Catalog and Routing
- **D-08:** Code-based event catalog in `src/modules/notifications/` (new module). TypeScript map that defines: event name → `{ channels: Channel[], template: string, category: NotificationCategory }`. Type-safe, version-controlled, no admin UI for editing.
- **D-09:** Core transactional events only (~6-8): `order.completed`, `license.generated`, `license.expiring`, `license.grace_period`, `license.expired`, `password.reset`, `api_token.created`, `transfer.initiated`, `transfer.completed`, `transfer.received`. These map to the existing email templates already in `src/lib/emails/`.
- **D-10:** The `NotificationService` receives domain events (via EventBus from Phase 14), looks up the user's notification preferences from the `user` table, checks the event catalog for applicable channels, and dispatches to each channel. If a user has disabled a channel for a category, that channel is skipped.

### Delivery Tracking
- **D-11:** New `notification_deliveries` table with columns: `id` (uuid), `notificationId` (ref to notifications), `channel` (email | in_app), `status` (pending | sent | delivered | failed), `providerId` (external ID from email provider, nullable), `error` (text, nullable), `attempts` (integer, default 1), `createdAt`, `updatedAt`. Each notification gets one delivery row per channel.
- **D-12:** Failed deliveries are logged with error details. No automatic retry in Phase 17 — the BullMQ queue provides basic retry (3 attempts with backoff), but no manual retry UI. Admin can view delivery status in the existing `/admin/notifications` page (extend with delivery status column).

### Async Processing
- **D-13:** Wire existing `emailQueue` and `notificationQueue` BullMQ queues. Domain events publish to `notificationQueue`. The notification worker processes events: creates in-app notification → dispatches email job to `emailQueue`. Email worker sends via the unified adapter. Both workers live in `src/jobs/workers/`.
- **D-14:** BullMQ retry policy: 3 attempts with exponential backoff (1s, 5s, 30s). After 3 failures, delivery is marked as `failed` with the last error. No dead letter queue in Phase 17.

### Claude's Discretion
- Exact `NotificationService` class structure (single service vs separate handlers per event type)
- Worker file organization and registration
- NotificationDropdown polling implementation details (debounce on tab focus, pause when tab hidden)
- Email adapter error handling and logging
- How to wire the event catalog to existing domain events (subscribe to specific event types from licensing/billing modules)
- Migration strategy for adding `notificationPreferences` column with sensible defaults
- Admin delivery log UI design within existing NotificationsTable

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Notification Infrastructure (MUST use/extend)
- `src/lib/db/schema.ts` §notifications — `notifications` table schema (id, userId, type, title, message, data, read, createdAt)
- `src/components/header/NotificationDropdown.tsx` — Existing in-app notification bell UI (polling to be added here)
- `src/components/portal/NotificationPreferences.tsx` — Preferences toggle UI (Save button to be wired)
- `src/app/(portal)/actions/notifications.ts` — Portal notification server actions (getNotifications, markNotificationRead, markAllNotificationsRead)
- `src/app/(admin)/actions/admin-notifications.ts` — Admin notification actions (sendNotification, broadcastNotification, deleteNotification)
- `src/components/admin/NotificationsTable.tsx` — Admin notification table (to be extended with delivery status)
- `src/app/(admin)/admin/notifications/page.tsx` — Admin notifications page

### Email Infrastructure (MUST integrate)
- `src/lib/emails/` — 10 existing email templates (order-confirmation, license-expired, license-expiry-reminder, license-grace-period, reset-password, api-token-notification, transfer-*) — HTML templates to be adapted to unified sender
- `src/components/admin/EmailProviderSettings.tsx` — Admin SMTP/Resend settings component
- `src/app/(admin)/admin/settings/smtp/page.tsx` — SMTP settings page
- `src/app/(admin)/actions/admin-notif-settings.ts` — Email provider settings actions

### Event Bus Infrastructure (from Phase 14, MUST use)
- `src/shared/infrastructure/eventBus/EventBus.ts` — EventBus factory, publisher/subscriber facades
- `src/shared/infrastructure/eventBus/types.ts` — BaseEvent interface
- `src/shared/infrastructure/eventBus/EventEmitterBus.ts` — In-process event bus
- `src/shared/infrastructure/eventBus/RedisPubSubBus.ts` — Redis pub/sub event bus

### BullMQ Queue Infrastructure (MUST use)
- `src/jobs/queues.ts` — Queue definitions including `emailQueue`, `notificationQueue`
- `src/lib/redis.ts` — Redis connection helpers

### Domain Events (MUST subscribe to)
- `src/modules/licensing/domain/events/LicenseEvents.ts` — LicenseCreated, LicenseRevoked events
- `src/modules/billing/domain/events/OrderEvents.ts` (if exists from Phase 17 billing) — OrderCompleted event
- `src/modules/products/domain/events/ProductEvents.ts` — Event pattern reference

### User Schema (MUST extend)
- `src/lib/db/schema.ts` §user — User table (needs `notificationPreferences` JSONB column added)

### Project-Level Specs
- `.planning/notes/notification-system-decisions.md` — User's original exploration session decisions on notification channels and event scope
- `.planning/REQUIREMENTS.md` §LSTAT-06 — License status changes trigger audit log entries and customer notifications
- `.planning/REQUIREMENTS.md` §LSTAT-07 — Background job checks for expiring licenses and sends reminder emails

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`NotificationDropdown`** (`src/components/header/NotificationDropdown.tsx`) — Fully functional bell icon with unread badge and dropdown. Just needs polling `setInterval` added to the existing `useEffect`.
- **`NotificationPreferences`** (`src/components/portal/NotificationPreferences.tsx`) — Toggle UI with 4 categories. Save button exists but is a no-op. Wire to server action.
- **Email templates** (`src/lib/emails/`) — 10 templates with well-structured HTML (ConversionFlow branded, BD-formatted currency). Only the send call needs to change from direct Resend to unified adapter.
- **`EventBus`** (`src/shared/infrastructure/eventBus/`) — Full pub/sub system with in-process and Redis variants. `NotificationService` subscribes via this.
- **BullMQ queues** (`src/jobs/queues.ts`) — `emailQueue` and `notificationQueue` already defined. Just need workers.
- **Admin SMTP settings** (`EmailProviderSettings.tsx` + `admin-notif-settings.ts`) — Full CRUD for provider config. The unified sender reads from this.
- **Audit log** (`src/lib/audit.ts`) — Already tracks notification.sent, notification.broadcast actions. Extend with delivery status events.

### Established Patterns
- **DDD module layering** — `domain/` (events), `application/` (services), `infrastructure/` (repositories, adapters). New `notifications` module follows this.
- **Server action pattern** — `"use server"` files in `src/app/(portal)/actions/` and `src/app/(admin)/actions/`. Notification actions follow this pattern.
- **Admin page pattern** — `requireAdmin()` guard + `PageBreadcrumb` + `ComponentCard` + table component. Admin delivery log follows this.
- **BullMQ worker pattern** — Queue definitions in `src/jobs/queues.ts`. Workers in `src/jobs/workers/` (to be created).

### Integration Points
- **`src/modules/notifications/`** — New module to create: `domain/events/`, `application/services/NotificationService.ts`, `application/catalog/EventCatalog.ts`, `infrastructure/adapters/EmailAdapter.ts`, `infrastructure/adapters/NodemailerAdapter.ts`, `infrastructure/adapters/ResendAdapter.ts`
- **`src/jobs/workers/`** — New workers: `email.worker.ts`, `notification.worker.ts`
- **User table migration** — Add `notificationPreferences` JSONB column with default
- **`notification_deliveries` table** — New table for per-channel delivery tracking
- **`NotificationDropdown`** — Add `setInterval` to existing `useEffect`
- **`NotificationPreferences`** — Wire Save button to server action updating `user.notificationPreferences`
- **`NotificationsTable`** — Extend with delivery status column

</code_context>

<specifics>
## Specific Ideas

- The `NotificationService` should be a single class that: (1) subscribes to domain events via EventBus, (2) looks up user preferences, (3) checks event catalog for applicable channels, (4) creates in-app notification row in DB, (5) dispatches email job to `emailQueue`, (6) creates delivery tracking rows for each channel.
- The event catalog should be a simple TypeScript `Map` or object — not a database table. Something like: `const EVENT_CATALOG = { 'order.completed': { channels: ['email', 'in_app'], template: 'order-confirmation', category: 'billing' } }`.
- For the polling in NotificationDropdown, consider using `document.visibilityState` to pause polling when the tab is hidden and resume when visible. Saves unnecessary requests.
- The existing email templates already have beautiful BD-branded HTML (ConversionFlow blue header, DM Sans font, BDT currency formatting). Keep this design language — only change the send mechanism.
- The unified email adapter interface should be minimal: `interface EmailSender { send(params: { to: string; subject: string; html: string; from?: string }): Promise<{ messageId: string; error?: string }> }`. Both adapters implement this.
- When a notification is created via the `NotificationService`, it should also create a `notification_deliveries` row for each applicable channel with status `pending`. Workers update to `sent`/`failed` after processing.

</specifics>

<deferred>
## Deferred Ideas

- **WhatsApp channel integration** — Phase 17.1. Architecture (event catalog, delivery tracking, channel dispatch) is designed to make adding WhatsApp straightforward when ready.
- **Full event catalog expansion** — Support ticket events, blog post notifications, account security events, system maintenance alerts. Expand after core transactional events are stable.
- **DB-driven admin-configurable routing** — Let admins add/modify event-to-channel routing from dashboard. Current code-based catalog is simpler and sufficient for now.
- **React Email component system** — Rewrite templates as React components for type-safe props and browser preview. Current inline HTML works fine for 10 templates.
- **SSE/WebSocket real-time push** — Upgrade from 30s polling when real-time becomes a priority. Redis pub/sub infrastructure already supports this.
- **SMS channel** — Not planned for BD market. WhatsApp is the preferred mobile channel.
- **Admin template editor with live preview** — Code-based templates only. If admin needs to customize copy, they edit the TS files and deploy.
- **Notification batching/digest** — Send a daily/weekly digest email instead of individual notifications. Future enhancement.
- **Push notifications (browser/mobile)** — Not in scope for this SaaS platform.

</deferred>

---

*Phase: 17-notification-engine*
*Context gathered: 2026-06-06*
