# Phase 7: Multi-channel Notification Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-20
**Phase:** 07-notification-engine
**Areas discussed:** Email provider, WhatsApp channel, Event trigger architecture, Notification preferences, Delivery tracking, Real-time updates, Template system

---

## Email Provider

| Option | Description | Selected |
|--------|-------------|----------|
| Keep Resend | Already working, 4 templates exist, good deliverability | |
| Switch to SMTP | Full control, no vendor lock-in, but rewrite 4 templates | |
| Dual (Resend + SMTP fallback) | Resend primary, SMTP configurable fallback | ✓ |

**User's choice:** Dual (Resend + SMTP fallback)
**Notes:** Maximum flexibility. Resend as default, SMTP as admin-configurable option.

---

## WhatsApp Channel

| Option | Description | Selected |
|--------|-------------|----------|
| Meta Business API | Official, requires Business Manager approval | |
| BD provider (Twilio/MessageBird) | Easier setup, vendor dependency | |
| Manual + API later | Admin sends manually, add automation later | ✓ |

**User's choice:** Manual + API later
**Notes:** Pragmatic approach. Start with admin-triggered manual WhatsApp sending. Prepare channel abstraction for future API integration.

---

## Event Trigger Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Central service function | Single `sendNotification()` function, synchronous | |
| Queue-based (BullMQ) | All notifications through queue, async | |
| Hybrid (sync + queue) | Sync for in-app+email, queue for WhatsApp+bulk | ✓ |

**User's choice:** Hybrid (sync + queue)
**Notes:** In-app and email fire immediately (synchronous). WhatsApp and bulk go through BullMQ queue.

---

## Notification Preferences

| Option | Description | Selected |
|--------|-------------|----------|
| Per-category, per-channel matrix | Rows=categories, columns=channels, toggle each cell | ✓ |
| Per-channel on/off only | Simple toggle per channel | |
| Combined user+admin page | All-in-one management experience | |

**User's choice:** Per-category, per-channel matrix
**Notes:** Categories: orders, licenses, tickets, system. Channels: email, in-app, WhatsApp. Matrix UI with checkboxes.

---

## Delivery Tracking

| Option | Description | Selected |
|--------|-------------|----------|
| Full delivery log table + admin page | New table, admin UI with filters/retry | ✓ |
| Audit log only (lighter) | Log to existing audit_logs, no dedicated UI | |

**User's choice:** Full delivery log table + admin page
**Notes:** `notification_log` table with userId, event, channel, status, error, timestamps. Admin page with filters and retry.

---

## In-App Real-time Updates

| Option | Description | Selected |
|--------|-------------|----------|
| Polling (30-60s) | Simple, works with existing architecture | ✓ |
| SSE (Server-Sent Events) | Live updates, more complex infrastructure | |
| On page load only | Simplest, existing behavior | |

**User's choice:** Polling (30-60s)
**Notes:** Notification bell polls server action every 30-60 seconds. No new infrastructure needed.

---

## Template System Design

| Option | Description | Selected |
|--------|-------------|----------|
| HTML string templates (like existing) | Follow existing pattern in src/lib/emails/ | ✓ |
| React Email components | Component-based, type-safe, adds dependency | |
| DB-stored + admin editor | Maximum flexibility, complex to build | |

**User's choice:** HTML string templates (like existing)
**Notes:** Follow the proven pattern already in `src/lib/emails/order-confirmation.ts`. No new dependencies.

---

## Claude's Discretion

- Exact notification_log schema columns and indexes
- Polling interval (30s vs 60s)
- Notification preference storage approach
- Admin delivery log page layout
- Manual WhatsApp UI details
- Which server actions get triggers wired first
- SMTP config fields
- Email template HTML design

## Deferred Ideas

- Automated WhatsApp API (Meta Business API or BD provider)
- WebSocket/SSE for real-time delivery
- React Email components or DB template editor
- Digest/summary notifications (daily/weekly)
