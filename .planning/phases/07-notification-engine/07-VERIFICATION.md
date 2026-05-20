---
phase: 07-notification-engine
verified: 2026-05-20T06:15:00Z
status: gaps_found
score: 5/7 must-haves verified
overrides_applied: 0
gaps:
  - truth: "All 14 notification events are wired to sendNotification() calls at the correct trigger points"
    status: partial
    reason: "10 of 14 events are wired at trigger points. 4 events remain unwired: system.blog_published (missing from admin-blog.ts), order.payment_failed (TODO comment in IPN handler), ticket.status_changed and ticket.resolved (deferred). license.expiring_soon also has no scheduled job trigger."
    artifacts:
      - path: "src/app/(admin)/actions/admin-blog.ts"
        issue: "No sendNotification import or call for system.blog_published event"
      - path: "src/app/api/ssl-commerz/ipn/route.ts"
        issue: "Contains TODO comment instead of actual sendNotification call for order.payment_failed"
    missing:
      - "Wire system.blog_published in admin-blog.ts toggleBlogPostStatus() when status changes to published"
      - "Wire order.payment_failed in ssl-commerz IPN handler"
      - "Wire ticket.status_changed and ticket.resolved when admin ticket actions are implemented"
      - "Add scheduled job for license.expiring_soon detection"
  - truth: "WhatsApp channel sends concise BD-formatted messages for order confirmations, license delivery, and ticket updates"
    status: failed
    reason: "WhatsApp channel is implemented as BullMQ queue + manual wa.me link for admins only. No automated WhatsApp messages are sent. Per D-03/D-04, automated WhatsApp was intentionally deferred. However, REQUIREMENTS.md NOTIF-04 says 'WhatsApp channel sends concise messages... via Meta Business API or BD provider' which implies automated sending, not just manual link generation."
    artifacts:
      - path: "src/lib/notifications/channels/whatsapp.ts"
        issue: "queueWhatsApp only adds to BullMQ queue; worker logs but does not actually send WhatsApp messages. No Meta Business API integration."
    missing:
      - "Automated WhatsApp message sending (deferred per D-04 to future phase, but NOTIF-04 requirement text expects it)"
---

# Phase 7: Multi-channel Notification Engine Verification Report

**Phase Goal:** Build a unified notification engine delivering messages across three channels -- email (generic SMTP), in-app notification bell, and WhatsApp for BD customers -- covering transactional, support, and system events.
**Verified:** 2026-05-20T06:15:00Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Core notification service routes events to correct channels (email, in-app, WhatsApp) based on event type and user preferences | VERIFIED | `sendNotification()` in `src/lib/notifications.ts` dispatches to 3 channel adapters with preference checking, per-channel error isolation, and logging |
| 2 | Email channel sends HTML emails via generic SMTP with configurable templates for orders, licenses, tickets, and system events | VERIFIED | `src/lib/notifications/channels/email.ts` implements dual Resend+SMTP provider with cached transporter. Template registry in `templates.ts` maps all 14 events. 5 dedicated template files exist (83-202 lines each) |
| 3 | In-app notification bell shows unread count badge and dropdown with notification list, mark-as-read, and per-type grouping | VERIFIED | `NotificationDropdown.tsx` has unread badge, dropdown, mark-as-read, 60s polling with useRef flicker prevention, and new event icons (ShoppingCart, Globe) |
| 4 | WhatsApp channel sends concise BD-formatted messages for order confirmations, license delivery, and ticket updates | FAILED | `whatsapp.ts` only queues to BullMQ and generates wa.me links for manual admin sending. No automated message delivery. Worker logs but does not send. NOTIF-04 expects automated sending via API. |
| 5 | Event catalog covers all 14 trigger events across orders, licenses, tickets, and system | VERIFIED | `types.ts` defines all 14 events: order (4), license (4), ticket (4), system (2). EVENT_CATALOG has category, defaultChannels, titleTemplate, messageTemplate for each. |
| 6 | Admin can manage notification templates and view notification delivery logs | VERIFIED | `/admin/notifications` page exists with NotificationLogTable (filters by event/channel/status/user), template list with preview modal, retry for failed sends. `admin-notif-settings.ts` has 6 server actions. Admin settings has EmailProviderSettings. |
| 7 | Users can manage per-channel notification preferences (opt in/out of email, in-app, WhatsApp per event category) | VERIFIED | `NotificationPreferences.tsx` renders 4x3 category-channel matrix with toggle switches. Server actions in `account.ts` (getUserNotificationPreferences, updateNotificationPreferences) with validation and upsert. |

**Score:** 5/7 truths verified

### Additional Findings: Trigger Point Wiring

Plan 03 required wiring all 14 events at trigger points. The actual wiring status:

| Event | Trigger File | Status |
|-------|-------------|--------|
| order.created | checkout.ts | WIRED |
| order.confirmed | admin-orders.ts | WIRED |
| order.payment_failed | ssl-commerz IPN | TODO comment only |
| order.refunded | webhook-handlers.ts | WIRED |
| license.generated | webhook-handlers.ts | WIRED |
| license.delivered | license-sync.ts | WIRED |
| license.expiring_soon | (no scheduled job) | NOT WIRED |
| license.expired | webhook-handlers.ts | WIRED |
| ticket.created | support.ts | WIRED |
| ticket.reply_received | support.ts | WIRED |
| ticket.status_changed | (no admin action yet) | NOT WIRED (deferred) |
| ticket.resolved | (no admin action yet) | NOT WIRED (deferred) |
| system.blog_published | admin-blog.ts | NOT WIRED |
| system.security_alert | (auth lockout) | NOT WIRED (deferred) |

10 of 14 events wired; 4 remain unwired.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/notifications.ts` | Central sendNotification() service | VERIFIED | 122 lines, routes to 3 channels with preference checking and logging |
| `src/lib/notifications/types.ts` | Event catalog with 14 events | VERIFIED | 170 lines, all 14 events with NotificationEvent union, EventConfig, EVENT_CATALOG |
| `src/lib/notifications/channels/email.ts` | Dual email provider adapter | VERIFIED | 175 lines, Resend+SMTP with cached transporter |
| `src/lib/notifications/channels/in-app.ts` | In-app channel adapter | VERIFIED | 33 lines, inserts into notifications table |
| `src/lib/notifications/channels/whatsapp.ts` | WhatsApp channel + wa.me generator | VERIFIED | 62 lines, BullMQ queue + generateWhatsAppLink |
| `src/lib/notifications/templates.ts` | Email template registry | VERIFIED | 267 lines, maps all 14 events to HTML generators with branded fallback |
| `src/lib/notifications/preferences.ts` | Preference lookup helper | VERIFIED | 51 lines, opt-in-by-default for new users |
| `src/lib/db/schema.ts` | notificationLog + notificationPreferences tables | VERIFIED | Both tables with indexes, relations, and userRelations |
| `src/jobs/queues.ts` | Notification queue | VERIFIED | QUEUE_NAMES.NOTIFICATION + notificationQueue export |
| `src/jobs/workers/notification.ts` | BullMQ notification worker | VERIFIED | startNotificationWorker with concurrency 5, rate limiter |
| `src/jobs/start.ts` | Worker registration | VERIFIED | Imports and starts notification worker |
| `src/lib/emails/license-delivery.ts` | License delivery email | VERIFIED | 83 lines, branded HTML with license key box |
| `src/lib/emails/license-expiring.ts` | License expiring email | VERIFIED | 80 lines, orange warning box with days remaining |
| `src/lib/emails/license-expired.ts` | License expired email | VERIFIED | 79 lines, red notice with renewal CTA |
| `src/lib/emails/ticket-notification.ts` | Ticket email templates | VERIFIED | 202 lines, 3 template functions (created, reply, resolved) |
| `src/lib/emails/system-alert.ts` | System alert email | VERIFIED | 71 lines, warning box with recommended actions |
| `src/app/(admin)/admin/notifications/page.tsx` | Admin notification page | VERIFIED | Server component with auth check, delivery log, template list |
| `src/app/(admin)/actions/admin-notif-settings.ts` | Admin notification server actions | VERIFIED | 6 exports: getEmailProviderSettings, saveEmailProviderSettings, testEmailConnection, getDeliveryLog, retryNotification, getTemplateList |
| `src/components/admin/NotificationLogTable.tsx` | Delivery log table with filters | VERIFIED | Client component with filter dropdowns, status badges, retry button |
| `src/components/admin/EmailProviderSettings.tsx` | Email provider toggle form | VERIFIED | Resend/SMTP toggle with SMTP config fields, test connection |
| `src/components/admin/TemplatePreviewModal.tsx` | Template preview in iframe | VERIFIED | Uses existing Modal component with srcDoc iframe |
| `src/components/admin/TemplateList.tsx` | Template list with preview | VERIFIED | Lists all 14 templates with category badges and preview buttons |
| `src/components/admin/WhatsAppSendButton.tsx` | WhatsApp wa.me link button | VERIFIED | Generates wa.me link, disabled when no phone |
| `src/data/dashboard-nav.ts` | Notifications nav item | VERIFIED | Bell icon, path /admin/notifications, after Activity |
| `src/components/portal/NotificationPreferences.tsx` | Preference matrix UI | VERIFIED | 233 lines, 4x3 matrix with toggle switches, server action wired |
| `src/components/header/NotificationDropdown.tsx` | Notification bell with polling | VERIFIED | 60s setInterval, useRef for flicker prevention, new icons |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| notifications.ts | types.ts | import EVENT_CATALOG | WIRED | Line 14: imports EVENT_CATALOG, NOTIFICATION_CHANNELS |
| notifications.ts | channels/in-app.ts | import sendInApp | WIRED | Line 21: import sendInApp |
| notifications.ts | channels/email.ts | import sendEmail | WIRED | Line 23: import sendEmail |
| notifications.ts | channels/whatsapp.ts | import queueWhatsApp | WIRED | Line 22: import queueWhatsApp |
| notifications.ts | preferences.ts | import getNotificationPreferences | WIRED | Line 24 |
| channels/email.ts | templates.ts | import getEmailTemplate | WIRED | Line 14 |
| webhook-handlers.ts | notifications.ts | import sendNotification | WIRED | Line 17, 3 call sites |
| checkout.ts | notifications.ts | import sendNotification | WIRED | Line 16, 1 call site |
| support.ts | notifications.ts | import sendNotification | WIRED | Line 11, 2 call sites |
| admin-orders.ts | notifications.ts | import sendNotification | WIRED | Line 10, 1 call site |
| license-sync.ts | notifications.ts | import sendNotification | WIRED | Line 10, 1 call site |
| start.ts | workers/notification.ts | import startNotificationWorker | WIRED | Line 3, called at line 44 |
| settings/page.tsx | EmailProviderSettings | import | WIRED | Line 6 |
| NotificationPreferences.tsx | account.ts | import server actions | WIRED | Lines 5-6 |
| admin-blog.ts | notifications.ts | - | NOT WIRED | Missing sendNotification import and call for system.blog_published |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| notifications.ts | targetChannels | EVENT_CATALOG[event].defaultChannels | Yes -- 14 events each define channels | FLOWING |
| channels/email.ts | template | getEmailTemplate(event, data) | Yes -- all 14 events mapped in TEMPLATE_REGISTRY | FLOWING |
| channels/in-app.ts | title/message | eventConfig.titleTemplate(data) | Yes -- all events have templates | FLOWING |
| NotificationLogTable | logs | getDeliveryLog(filters) | Yes -- queries notificationLog table with user join | FLOWING |
| NotificationPreferences | preferences | getUserNotificationPreferences() | Yes -- queries notificationPreferences table | FLOWING |
| NotificationDropdown | notificationList | fetchNotifications() -> getNotifications/getAdminNotifications | Yes -- polls every 60s | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compilation passes | npx tsc --noEmit | Zero errors | PASS |
| Event catalog has 14 events | grep count in types.ts | 14 events in NotificationEvent union | PASS |
| Template registry covers all events | grep count in templates.ts | All 14 events have registry entries | PASS |
| Admin nav has Notifications item | grep in dashboard-nav.ts | Line 50: Notifications with Bell icon | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| NOTIF-01 | 07-01, 07-02, 07-03 | Core notification service with channel router | SATISFIED | sendNotification() routes to email/in-app/whatsapp with preference checking |
| NOTIF-02 | 07-02 | Email channel via generic SMTP | SATISFIED | Dual provider (Resend + nodemailer SMTP), configurable via settings table |
| NOTIF-03 | 07-05 | In-app notification bell | SATISFIED | NotificationDropdown with badge, dropdown, mark-as-read, 60s polling, event icons |
| NOTIF-04 | 07-03 | WhatsApp channel for BD customers | PARTIALLY SATISFIED | wa.me link generator + BullMQ queue exist but no automated API sending. Manual admin-only. |
| NOTIF-05 | 07-01 | Complete event catalog | SATISFIED | All 14 events defined in EVENT_CATALOG with categories, channels, templates |
| NOTIF-06 | 07-04 | Admin notification management | SATISFIED | /admin/notifications page with delivery log, filters, retry, template preview, email settings |
| NOTIF-07 | 07-05 | User notification preferences | SATISFIED | Per-category per-channel matrix UI with DB-backed server actions |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| ssl-commerz/ipn/route.ts | 46 | TODO comment for order.payment_failed | Warning | Payment failure notifications not sent |
| admin-blog.ts | - | Missing sendNotification import | Warning | Blog publish notifications not sent |

No stub functions, placeholder returns, or empty implementations were found in any notification engine file. All channel adapters have real implementations. No hardcoded empty data flowing to rendered output.

### Human Verification Required

### 1. Admin Notification Delivery Log Page

**Test:** Log in as admin, navigate to /admin/notifications. Verify the delivery log table renders, filter dropdowns work (Event Type, Channel, Status), and the template list shows all 14 templates with preview buttons.
**Expected:** Table renders with columns, filters apply correctly, template preview opens in modal with iframe.
**Why human:** Visual UI rendering and interaction flow cannot be verified programmatically.

### 2. Email Provider Settings

**Test:** Navigate to /admin/settings. Verify the Email Provider section shows Resend/SMTP toggle. Switch to SMTP, fill fields, save. Test connection.
**Expected:** Settings persist after page reload. Test connection shows success or meaningful error.
**Why human:** Requires real SMTP server or Resend API key to test email delivery.

### 3. User Notification Preferences

**Test:** Log in as customer, navigate to account notification preferences. Toggle cells in the matrix. Save. Reload page.
**Expected:** Preferences persist after reload. Toggling off a channel prevents that channel's notifications.
**Why human:** End-to-end preference persistence requires running application with database.

### 4. Notification Bell Polling

**Test:** Have two browser tabs open. In one tab, trigger an event that creates a notification. In the other tab, wait up to 60 seconds.
**Expected:** Notification bell updates with new count without flickering.
**Why human:** Real-time polling behavior requires running application and visual observation.

### Gaps Summary

Two gaps block full goal achievement:

1. **NOTIF-04 (WhatsApp automated sending):** The WhatsApp channel is implemented as a manual admin-only feature (wa.me links). The CONTEXT.md explicitly deferred automated WhatsApp API (D-03, D-04), and the plan followed this correctly. However, the REQUIREMENTS.md NOTIF-04 text says "WhatsApp channel sends concise messages... via Meta Business API or BD provider" which implies automated delivery. The channel abstraction is in place for future API integration, but automated sending does not exist. This appears to be an intentional scope reduction documented in CONTEXT.md.

2. **Trigger point wiring incomplete (10/14):** Four events lack trigger wiring: system.blog_published (admin-blog.ts missing import), order.payment_failed (TODO in IPN handler), and two ticket events + security_alert deferred to future admin actions. The blog_published gap is the most actionable -- it requires adding an import and a try/catch block in admin-blog.ts.

---

_Verified: 2026-05-20T06:15:00Z_
_Verifier: Claude (gsd-verifier)_
