# Phase 7: Multi-channel Notification Engine - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a unified notification engine that delivers messages across three channels — email (Resend primary + SMTP fallback), in-app notification bell (existing infrastructure), and WhatsApp (manual admin sending now, automated API later). Covers transactional (orders, licenses, payments), support (tickets, replies), and system events (blog, security). Includes delivery tracking, per-category per-channel user preferences, and admin management.

</domain>

<decisions>
## Implementation Decisions

### Email Provider
- **D-01:** Dual provider — Resend as primary (already in use with 4 templates), generic SMTP as configurable fallback via admin settings. Admin can switch provider or configure SMTP host/port/auth.
- **D-02:** All new notification email templates follow the existing HTML string pattern in `src/lib/emails/`. No React Email or DB-stored templates.

### WhatsApp Channel
- **D-03:** Start with manual admin-only WhatsApp sending. Admin clicks "Send via WhatsApp" on a notification/order to trigger a WhatsApp message (pre-filled template, sent manually). No automated WhatsApp API integration in this phase.
- **D-04:** Automated WhatsApp API (Meta Business API or BD provider) deferred to a future phase/seed. Current phase prepares the channel abstraction so WhatsApp automation can be plugged in later.

### Event Trigger Architecture
- **D-05:** Hybrid trigger model — in-app notifications and emails fire synchronously via central service function. WhatsApp and bulk/digest notifications go through BullMQ queue for async processing.
- **D-06:** Central `src/lib/notifications.ts` service with `sendNotification(userId, event, data, channels)` as the single entry point. All trigger points (server actions, webhook handlers, jobs) call this function.

### Notification Preferences
- **D-07:** Per-category, per-channel matrix for users. Categories: orders, licenses, tickets, system. Channels: email, in-app, WhatsApp. Users toggle each cell on/off.
- **D-08:** Existing `NotificationPreferences.tsx` component (currently no-op) gets wired up with real DB storage. Needs a `notification_preferences` table or JSONB field on user settings.
- **D-09:** Admin manages notification templates in a separate admin page. View template list, preview HTML, but edits require code changes (no WYSIWYG editor).

### Delivery Tracking
- **D-10:** Full `notification_log` table tracking every send attempt: userId, event, channel, status (sent/failed), error message, timestamps. Separate from existing `notifications` table.
- **D-11:** Admin page to view delivery logs with filters (by user, event type, channel, status). Retry button for failed sends.

### In-App Real-time Updates
- **D-12:** Polling approach — notification bell polls via server action every 30-60 seconds for unread count and new notifications. No SSE/WebSocket in this phase.

### Event Catalog
- **D-13:** Full event catalog covering:
  - Order: created, confirmed, payment_failed, refunded
  - License: generated, delivered, expiring_soon (7d, 3d, 1d), expired
  - Ticket: created, reply_received, status_changed, resolved
  - System: blog_published, security_alert
- **D-14:** Each event has default channels defined. User preferences can override. Admin notification types extend existing `ADMIN_NOTIFICATION_TYPES` array.

### Folded Todos
- **design-notification-templates.md** — Pre-build task for event/template/channel matrix. This discussion has resolved the matrix: events cataloged (D-13), channels decided (email/in-app/manual-WhatsApp), templates as HTML strings (D-02). The todo's deliverables are covered by this context.

### Claude's Discretion
- Exact notification_log schema columns and indexes
- Polling interval (30s vs 60s)
- Notification preference storage (separate table vs JSONB on user)
- Admin delivery log page layout and filter UI
- How manual WhatsApp sending works in admin UI (button placement, pre-filled template format)
- Which existing server actions get notification triggers wired in this phase vs deferred
- SMTP configuration fields in admin settings (host, port, user, pass, from address)
- Notification template HTML design (follow existing ConversionFlow email branding)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Planning
- `.planning/ROADMAP.md` — Phase 7 goal, requirements (NOTIF-01 through NOTIF-07), success criteria
- `.planning/REQUIREMENTS.md` — NOTIF-01 through NOTIF-07 acceptance criteria
- `.planning/notes/notification-system-decisions.md` — Exploration decisions on channels, events, open questions
- `.planning/seeds/notification-engine.md` — Architecture sketch, key components, dependencies
- `.planning/todos/pending/design-notification-templates.md` — Event/template/channel matrix (covered by this context)

### Existing Code to Study
- `src/lib/emails/order-confirmation.ts` — Existing email template pattern (HTML string + Resend)
- `src/lib/emails/payment-reminder.ts` — Another email template example
- `src/app/(portal)/actions/notifications.ts` — Portal notification actions (get, mark read)
- `src/app/(admin)/actions/admin-notifications.ts` — Admin notification actions + `createAdminNotification()`
- `src/components/header/NotificationDropdown.tsx` — Existing in-app notification bell component
- `src/components/portal/NotificationPreferences.tsx` — Current no-op preferences component
- `src/lib/db/schema.ts` — `notifications` table schema (lines ~239-248)
- `src/jobs/queues.ts` — Existing BullMQ queue infrastructure for async channel
- `src/lib/redis.ts` — Redis connection config

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `NotificationDropdown` — Full in-app notification bell with badge, dropdown, mark-read, type icons. Works for both portal and admin contexts. Extend with polling.
- `notifications` table — DB table with id, userId, type, title, message, data (jsonb), read, createdAt. Already has relations defined.
- `createAdminNotification()` — Function in admin-notifications.ts that inserts a notification row. Pattern to follow for central service.
- `Resend` email client — Already configured with API key. 4 email templates exist as reference patterns.
- `BullMQ` queues — Queue infrastructure in `src/jobs/queues.ts` with Redis connection. Ready for async notification jobs.
- `NotificationPreferences.tsx` — UI component shell exists, just needs wiring to real data.

### Established Patterns
- Server actions with `"use server"` + auth session check via `auth.api.getSession()`
- Admin guard via role check (`role !== "admin" && role !== "super_admin"`)
- Audit logging via `createAuditLog()` for all admin mutations
- HTML email templates as inline strings with ConversionFlow branding (blue header, DM Sans font)

### Integration Points
- Server actions that handle orders, licenses, tickets, blog posts — all need notification triggers added
- Webhook handlers in `src/lib/webhook-handlers.ts` — license events should trigger notifications
- Background jobs in `src/jobs/` — license sync could trigger expiring_soon notifications
- Admin settings page — needs SMTP config fields alongside existing tracking/payment settings

</code_context>

<specifics>
## Specific Ideas

- Dual email provider means admin settings page gets an "Email Provider" section: toggle between Resend (API key) and SMTP (host/port/user/pass/from). Default is Resend.
- Manual WhatsApp approach: admin sees a notification or order detail, clicks "Send WhatsApp" button, a pre-filled message template opens (could be a wa.me link or copied text). Not automated — admin sends manually from their phone/business WhatsApp.
- Notification preferences matrix: rows are event categories (orders, licenses, tickets, system), columns are channels (email, in-app, WhatsApp). Checkboxes in each cell.

</specifics>

<deferred>
## Deferred Ideas

- Automated WhatsApp API integration (Meta Business API or BD provider like Twilio/MessageBird) — deferred to future phase. Channel abstraction in this phase should make it plug-and-play later.
- WebSocket/SSE for real-time notification delivery — deferred. Polling is sufficient for now.
- React Email components or DB-stored template editor — deferred. HTML string templates follow proven existing pattern.
- Digest/summary notifications (daily/weekly email digest) — not in this phase's scope.

</deferred>

---

*Phase: 07-notification-engine*
*Context gathered: 2026-05-20*
