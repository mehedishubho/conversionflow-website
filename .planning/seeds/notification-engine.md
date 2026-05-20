---
title: Multi-channel Notification Engine
trigger_condition: Ready to build next major feature after blog + tracking system
planted_date: 2026-05-20
---

## Vision

Build a unified notification engine that delivers messages across three channels:
- **Email** via generic SMTP (no vendor lock-in)
- **In-app** notification bell using existing `notifications` table
- **WhatsApp** for BD customers

## Architecture Sketch

```
Trigger Event → Notification Service → Channel Router
                                        ├── Email (SMTP + template)
                                        ├── In-App (DB insert + optional push)
                                        └── WhatsApp (Meta API or BD provider)
```

## Key Components

1. **`src/lib/notifications.ts`** — Core service: `sendNotification(userId, event, data, channels)`
2. **`src/lib/email.ts`** — SMTP transport config + template rendering
3. **`src/lib/whatsapp.ts`** — WhatsApp Business API client
4. **`src/components/portal/NotificationBell.tsx`** — In-app notification dropdown
5. **`src/app/(admin)/actions/admin-notifications.ts`** — Admin notification management (already exists, extend it)
6. **Email templates directory** — `src/emails/` with React Email components

## Dependencies
- `nodemailer` for SMTP
- `@react-email/*` for email templates (optional)
- WhatsApp provider SDK (TBD based on BD market)

## Estimated Scope
- Medium-large feature, likely its own GSD phase
- Touches: orders, licenses, tickets, blog, customer portal, admin

## Related
- See notification-system-decisions note for exploration decisions
- See design-notification-templates todo for pre-build design task
