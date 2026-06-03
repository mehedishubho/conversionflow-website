---
title: Design notification templates and trigger events
date: 2026-05-20
priority: high
---

## Task

Before building the notification engine, map out the complete event → template → channel matrix.

### Deliverables

1. **Event catalog** — List every trigger event with: name, source (order/license/ticket/system), priority (immediate vs digest), channels (email/in-app/whatsapp)
2. **Email templates** — Design HTML email templates for each transactional event. Consider using React Email for maintainability.
3. **WhatsApp message formats** — Concise BD-formatted messages for order updates and license delivery
4. **In-app notification types** — Map to the existing `notifications` table type field

### Key Events to Cover
- Order: created, confirmed, payment_failed, refunded
- License: generated, delivered, expiring_soon (7d, 3d, 1d), expired
- Ticket: created, reply_received, status_changed, resolved
- System: blog_published, security_alert
