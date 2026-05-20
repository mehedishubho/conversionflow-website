---
phase: 07-notification-engine
plan: 02
subsystem: infra
tags: [notifications, email, resend, nodemailer, smtp, templates, dual-provider]

# Dependency graph
requires:
  - phase: 07-01
    provides: Central sendNotification() service, NotificationEvent types, EVENT_CATALOG, channel adapter pattern
provides:
  - Dual email provider adapter (Resend primary + SMTP fallback) with cached transporter
  - Email template registry mapping all 14 notification events to HTML generators
  - 5 new email template files following ConversionFlow branding
  - Wired email channel into central sendNotification() dispatcher
affects: [07-03, 07-04, 07-05]

# Tech tracking
tech-stack:
  added: [nodemailer, @types/nodemailer]
  patterns: [dual-email-provider-pattern, template-registry-pattern, cached-transporter-pattern]

key-files:
  created:
    - src/lib/notifications/channels/email.ts
    - src/lib/notifications/templates.ts
    - src/lib/emails/license-delivery.ts
    - src/lib/emails/license-expiring.ts
    - src/lib/emails/license-expired.ts
    - src/lib/emails/ticket-notification.ts
    - src/lib/emails/system-alert.ts
  modified:
    - src/lib/notifications.ts
    - package.json

key-decisions:
  - "SMTP transporter cached with config fingerprint to prevent memory leak per RESEARCH Pitfall 4"
  - "Template registry uses Partial<Record<NotificationEvent, Generator>> so not every event needs a dedicated template file"
  - "Order events use inline branded HTML in registry (no separate file), while license/ticket/system events have dedicated template files"

patterns-established:
  - "Dual provider pattern: read email_provider from settings table, route to Resend or SMTP accordingly"
  - "Template registry pattern: TEMPLATE_REGISTRY maps events to (data) => { subject, html } generators with generic fallback"
  - "Cached transporter pattern: SMTP nodemailer transporter cached globally, invalidated when config fingerprint changes"

requirements-completed: [NOTIF-02, NOTIF-01]

# Metrics
duration: 8min
completed: 2026-05-20
---

# Phase 07 Plan 02: Email Channel and Templates Summary

**Dual email provider adapter (Resend + nodemailer SMTP) with cached transporter, template registry covering all 14 events, and 5 new branded HTML email templates wired into sendNotification()**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-20T04:36:26Z
- **Completed:** 2026-05-20T04:44:27Z
- **Tasks:** 1
- **Files modified:** 10

## Accomplishments
- Email channel adapter supports Resend (primary, default) and SMTP (fallback) with admin-switchable provider via settings table
- SMTP transporter cached with config fingerprint to prevent memory leaks; transporter recreated only when host/port/user changes
- Template registry maps all 14 notification events to HTML generators, with a generic branded fallback for unregistered events
- 5 new email template files (license delivery, expiring, expired, ticket notification with 3 variants, system alert) following exact ConversionFlow branding
- Central sendNotification() now routes email channel through the dual provider adapter, replacing the Plan 01 "queued" placeholder

## Task Commits

Each task was committed atomically:

1. **Task 1: Dual email provider + notification templates + wire into service** - `22c0c20` (feat)

## Files Created/Modified
- `src/lib/notifications/channels/email.ts` - Dual email provider adapter with Resend + SMTP, cached transporter, settings lookup
- `src/lib/notifications/templates.ts` - Email template registry mapping events to HTML generators with branded fallback
- `src/lib/emails/license-delivery.ts` - License key delivery email with green key display box
- `src/lib/emails/license-expiring.ts` - License expiring soon email with orange days-remaining warning
- `src/lib/emails/license-expired.ts` - License expired email with red notice and renewal CTA
- `src/lib/emails/ticket-notification.ts` - Three ticket templates: created, reply received, resolved
- `src/lib/emails/system-alert.ts` - Security alert email with warning box and recommended actions
- `src/lib/notifications.ts` - Added sendEmail import, replaced email placeholder with actual sendEmail() call
- `package.json` - Added nodemailer + @types/nodemailer dependencies

## Decisions Made
- SMTP transporter cached globally with config fingerprint invalidation: avoids creating a new transporter per email send (prevents memory leak from RESEARCH Pitfall 4)
- Order event templates use inline branded HTML within the registry rather than separate template files: order confirmation already exists as a standalone file, and the new order event variants are simple enough to remain inline
- Template registry uses Partial<Record<NotificationEvent, Generator>> so events without dedicated templates fall back to a generic branded email rather than failing

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Build fails at page data collection due to missing DATABASE_URL env var in worktree (pre-existing, not related to changes). TypeScript compilation passes cleanly with zero errors in all new/modified files.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Email channel fully operational, ready for trigger point integration in Plans 03-04
- sendNotification() now dispatches to in-app, email, and WhatsApp channels
- SMTP provider requires admin to configure smtp_host, smtp_port, smtp_user, smtp_pass in settings table before use
- Resend provider works immediately with RESEND_API_KEY env var

---
*Phase: 07-notification-engine*
*Completed: 2026-05-20*

## Self-Check: PASSED

All 10 files verified present. Commit 22c0c20 verified in git log.
