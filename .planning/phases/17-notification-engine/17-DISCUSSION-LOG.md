# Phase 17: Multi-channel Notification Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-06
**Phase:** 17-notification-engine
**Areas discussed:** WhatsApp Channel, Email Strategy, Real-time Delivery, Preferences & Routing

---

## WhatsApp Channel

| Option | Description | Selected |
|--------|-------------|----------|
| Meta Business API | Official WhatsApp Business API. Free for transactional messages. Requires Meta verification. | |
| MessageBird/Twilio | Third-party unified messaging API. Per-message cost. Faster setup. | |
| UltraMsg / BD-focused | Unofficial WhatsApp API. Cheap but risk of account ban. | |
| Defer WhatsApp | Skip WhatsApp channel — ship email + in-app first. Add as Phase 17.1. | ✓ |

**User's choice:** Defer WhatsApp
**Notes:** Ship email + in-app first. Architecture designed to make adding WhatsApp straightforward later.

---

## Email Provider

| Option | Description | Selected |
|--------|-------------|----------|
| Nodemailer abstraction | Unified email sender with Resend + Nodemailer adapters. Respects admin SMTP settings. | ✓ |
| Keep Resend-only | Minimal change — keep Resend SDK. SMTP support deferred. | |
| React Email + Nodemailer | Rewrite templates as React components. More work, new dependency. | |

**User's choice:** Nodemailer abstraction
**Notes:** Admin already has a Resend/SMTP toggle in the UI — this makes it actually work.

## Template Management

| Option | Description | Selected |
|--------|-------------|----------|
| Code-based templates | Templates in src/lib/emails/ as TypeScript files. Admin gets read-only preview. | ✓ |
| DB-stored editable templates | Templates in database. Admin can edit. Risk of broken HTML. | |

**User's choice:** Code-based templates
**Notes:** Simpler, version-controlled, no risk of admin breaking HTML.

---

## Real-time Delivery

| Option | Description | Selected |
|--------|-------------|----------|
| Polling every 30s | setInterval re-fetch in NotificationDropdown. Simple, no new infrastructure. | ✓ |
| Server-Sent Events | True push via SSE. Uses Redis pub/sub. More complex. | |
| On page load only | Keep current behavior. Feels stale for SaaS. | |

**User's choice:** Polling every 30s
**Notes:** Good enough for BD SaaS. Can upgrade to SSE later.

## Delivery Tracking

| Option | Description | Selected |
|--------|-------------|----------|
| Per-channel tracking | notification_deliveries table with status per channel. Important for debugging. | ✓ |
| Simple log only | Just audit_logs. Hard to debug delivery issues. | |

**User's choice:** Per-channel tracking
**Notes:** Admin needs to answer "why didn't I get the email?" questions.

---

## Preferences Storage

| Option | Description | Selected |
|--------|-------------|----------|
| User table JSON column | notificationPreferences JSONB on user table. Simple, one query. | ✓ |
| Separate table | Normalized notification_preferences table. More complex. | |

**User's choice:** User table JSON column
**Notes:** Matches the existing 4-category toggle UI.

## Event Catalog

| Option | Description | Selected |
|--------|-------------|----------|
| Code-based catalog | TypeScript map in src/modules/notifications/. Type-safe, version-controlled. | ✓ |
| DB-driven catalog | Database table. Admin configurable. More complex. | |

**User's choice:** Code-based catalog
**Notes:** Simple, type-safe. Can add DB-driven later if needed.

## Scope Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Core transactional only | ~6-8 events matching existing email templates. Ship fast. | ✓ |
| Full catalog | ~15-20 events. More comprehensive but slower. | |

**User's choice:** Core transactional only
**Notes:** Start with events that already have templates. Expand after core is stable.

---

## Claude's Discretion

- NotificationDropdown polling implementation details (visibility API, pause when hidden)
- Worker file organization and registration
- Email adapter error handling specifics
- Admin delivery log UI design

## Deferred Ideas

- WhatsApp channel integration — Phase 17.1
- Full event catalog expansion (support, blog, security events) — expand later
- DB-driven admin-configurable routing — future enhancement
- React Email component system — future consideration
- SSE/WebSocket real-time push — can upgrade from polling later
- SMS channel — not planned for BD market
- Admin template editor — code-based only
- Notification batching/digest — future enhancement
- Push notifications (browser/mobile) — not in scope
