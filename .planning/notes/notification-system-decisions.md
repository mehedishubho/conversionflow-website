---
title: Multi-channel Notification System Decisions
date: 2026-05-20
context: Exploration session on what to build next for ConversionFlow
---

## Decisions

- **Channels:** Email (SMTP) + in-app notification bell + WhatsApp for BD customers
- **Email provider:** Generic SMTP — no vendor lock-in, self-hosted or any relay
- **Event scope:** Full coverage — both transactional (orders, licenses, payments) and support (tickets, replies)

## Trigger Events Identified

### Transaction
- Order created / status changed (pending → completed → failed)
- License key generated and delivered
- Payment received / refund processed
- Renewal reminder (license expiring soon)

### Support
- Ticket created / status changed
- Ticket reply (both customer → admin and admin → customer)
- Ticket resolved / closed

### System
- New blog post published (optional subscription)
- Account security events (password change, 2FA enabled)

## Existing Infrastructure
- `notifications` table already in DB (id, userId, type, title, message, data, read, createdAt)
- Audit logs already track all admin actions
- WhatsApp already used as support channel (BD phone number exists)

## Open Questions
- WhatsApp API: use Meta Business API or a BD-specific provider like MessageBird?
- Email template system: React Email components or plain HTML templates?
- Should in-app notifications support real-time via WebSocket/polling or just on page load?
