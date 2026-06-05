---
phase: 17-notification-engine
plan: 01
subsystem: infra
tags: [email, nodemailer, resend, adapter-pattern, notifications, schema, drizzle]

# Dependency graph
requires:
  - phase: v2.0-phases
    provides: "Existing email templates (src/lib/emails/), settings table, admin SMTP settings"
provides:
  - "Unified EmailSender interface with ResendEmailAdapter and NodemailerEmailAdapter"
  - "Notification domain types (Channel, NotificationCategory, DeliveryStatus, NotificationPreferences)"
  - "notification_deliveries table schema with indexes"
  - "notificationPreferences JSONB column on user table"
  - "All 10 email templates migrated from direct Resend to unified sender"
affects: [17-notification-engine]

# Tech tracking
tech-stack:
  added: [nodemailer@8.0.10, resend@6.12.3]
  patterns: [adapter-pattern, unified-email-sender, jsonb-preferences]

key-files:
  created:
    - src/modules/notifications/domain/types.ts
    - src/modules/notifications/infrastructure/adapters/EmailSender.ts
    - src/modules/notifications/infrastructure/adapters/ResendEmailAdapter.ts
    - src/modules/notifications/infrastructure/adapters/NodemailerEmailAdapter.ts
  modified:
    - src/lib/emails/order-confirmation.ts
    - src/lib/emails/license-expired.ts
    - src/lib/emails/license-expiry-reminder.ts
    - src/lib/emails/license-grace-period.ts
    - src/lib/emails/reset-password.ts
    - src/lib/emails/api-token-notification.ts
    - src/lib/emails/transfer-initiated.ts
    - src/lib/emails/transfer-completed.ts
    - src/lib/emails/transfer-received.ts
    - src/lib/emails/verification.ts
    - src/lib/db/schema.ts

key-decisions:
  - "Adapter pattern for email: ResendEmailAdapter wraps existing SDK, NodemailerEmailAdapter wraps nodemailer for SMTP"
  - "getEmailSender() factory reads email_provider from settings table to select adapter at runtime"
  - "NodemailerEmailAdapter caches SMTP transport at class level for reuse across sends"
  - "api-token-notification.ts preserves try/catch pattern for bulk send resilience"

patterns-established:
  - "EmailSender interface: send({ to, subject, html, from? }) => Promise<{ messageId, error? }>"
  - "Adapter selection: getEmailSender() reads settings table, returns appropriate adapter"
  - "Template migration: Replace resend.emails.send() with sender.send() + error check"

requirements-completed: [NOTIF-02]

# Metrics
duration: 5min
completed: 2026-06-06
---

# Phase 17 Plan 01: Notification Foundation Summary

**Unified EmailSender adapter pattern with Resend/SMTP switching, notification_deliveries table, and notificationPreferences JSONB column**

## Performance

- **Duration:** 5 min
- **Started:** 2026-06-05T21:48:21Z
- **Completed:** 2026-06-05T21:53:01Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Created unified EmailSender interface with two adapters (Resend, Nodemailer) selected by admin setting
- Migrated all 10 email templates from direct Resend SDK calls to unified sender
- Added notification_deliveries table with delivery status tracking per channel
- Added notificationPreferences JSONB column to user table with sensible defaults

## Task Commits

Each task was committed atomically:

1. **Task 1: Create domain types, EmailSender interface, and email adapters** - `8dd3593` (feat)
2. **Task 2: Migrate 10 email templates to unified sender + add schema tables** - `dae9207` (feat)

## Files Created/Modified
- `src/modules/notifications/domain/types.ts` - Notification domain types (Channel, NotificationCategory, DeliveryStatus, NotificationPreferences)
- `src/modules/notifications/infrastructure/adapters/EmailSender.ts` - Unified EmailSender interface and getEmailSender() factory
- `src/modules/notifications/infrastructure/adapters/ResendEmailAdapter.ts` - Resend SDK adapter implementing EmailSender
- `src/modules/notifications/infrastructure/adapters/NodemailerEmailAdapter.ts` - SMTP adapter with cached transport implementing EmailSender
- `src/lib/emails/order-confirmation.ts` - Migrated to unified sender
- `src/lib/emails/license-expired.ts` - Migrated to unified sender
- `src/lib/emails/license-expiry-reminder.ts` - Migrated to unified sender
- `src/lib/emails/license-grace-period.ts` - Migrated to unified sender
- `src/lib/emails/reset-password.ts` - Migrated to unified sender
- `src/lib/emails/api-token-notification.ts` - Migrated to unified sender (preserves try/catch)
- `src/lib/emails/transfer-initiated.ts` - Migrated to unified sender
- `src/lib/emails/transfer-completed.ts` - Migrated to unified sender
- `src/lib/emails/transfer-received.ts` - Migrated to unified sender
- `src/lib/emails/verification.ts` - Migrated to unified sender
- `src/lib/db/schema.ts` - Added deliveryStatusEnum, notificationChannelEnum, notificationDeliveries table, notificationPreferences JSONB column, notificationDeliveriesRelations

## Decisions Made
- NodemailerEmailAdapter caches SMTP transport at class level (not per-send) to prevent connection pool exhaustion
- api-token-notification.ts preserves its existing try/catch pattern since it's used for bulk sends where individual failures should not halt the batch
- All other 9 templates throw on send failure for immediate error visibility

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- EmailSender abstraction ready for BullMQ email worker (Plan 02)
- notification_deliveries table ready for delivery tracking in workers
- notificationPreferences JSONB ready for NotificationPreferences UI wiring
- Domain types ready for EventCatalog and NotificationService

---
*Phase: 17-notification-engine*
*Completed: 2026-06-06*

## Self-Check: PASSED

All 15 files verified present. Both task commits (8dd3593, dae9207) verified in git log.
