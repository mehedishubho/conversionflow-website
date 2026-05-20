# Phase 7: Multi-channel Notification Engine - Research

**Researched:** 2026-05-20
**Domain:** Notification service architecture, multi-channel delivery (email/in-app/WhatsApp), event-driven messaging
**Confidence:** HIGH

## Summary

This phase builds a unified notification engine on top of extensive existing infrastructure: a `notifications` table with Drizzle relations, a fully functional `NotificationDropdown` component (bell + badge + mark-read), 4 existing Resend email templates using HTML string patterns, a BullMQ queue system with Redis-backed workers, and both portal and admin notification server actions. The work is primarily integration and extension -- not greenfield.

The core deliverable is a central `sendNotification(userId, event, data, channels)` service function that acts as a single entry point for all notification triggers across the application. This function will route to email (Resend primary + nodemailer SMTP fallback), in-app (DB insert into existing table), and WhatsApp (manual admin-only via wa.me links or copied text). A new `notification_log` table tracks every delivery attempt. User preferences are stored as a per-category per-channel matrix, likely in a new `notification_preferences` table. The existing no-op `NotificationPreferences.tsx` component gets wired to real storage.

**Primary recommendation:** Build the central `src/lib/notifications.ts` service first, then extend channel providers (email adapter with dual provider, in-app adapter using existing DB), then wire trigger points into existing server actions and webhook handlers, then add the admin delivery log page and user preferences UI.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Dual provider -- Resend as primary (already in use with 4 templates), generic SMTP as configurable fallback via admin settings. Admin can switch provider or configure SMTP host/port/auth.
- **D-02:** All new notification email templates follow the existing HTML string pattern in `src/lib/emails/`. No React Email or DB-stored templates.
- **D-03:** Start with manual admin-only WhatsApp sending. Admin clicks "Send via WhatsApp" on a notification/order to trigger a WhatsApp message (pre-filled template, sent manually). No automated WhatsApp API integration in this phase.
- **D-04:** Automated WhatsApp API (Meta Business API or BD provider) deferred to a future phase/seed. Current phase prepares the channel abstraction so WhatsApp automation can be plugged in later.
- **D-05:** Hybrid trigger model -- in-app notifications and emails fire synchronously via central service function. WhatsApp and bulk/digest notifications go through BullMQ queue for async processing.
- **D-06:** Central `src/lib/notifications.ts` service with `sendNotification(userId, event, data, channels)` as the single entry point. All trigger points (server actions, webhook handlers, jobs) call this function.
- **D-07:** Per-category, per-channel matrix for users. Categories: orders, licenses, tickets, system. Channels: email, in-app, WhatsApp. Users toggle each cell on/off.
- **D-08:** Existing `NotificationPreferences.tsx` component (currently no-op) gets wired up with real DB storage. Needs a `notification_preferences` table or JSONB field on user settings.
- **D-09:** Admin manages notification templates in a separate admin page. View template list, preview HTML, but edits require code changes (no WYSIWYG editor).
- **D-10:** Full `notification_log` table tracking every send attempt: userId, event, channel, status (sent/failed), error message, timestamps. Separate from existing `notifications` table.
- **D-11:** Admin page to view delivery logs with filters (by user, event type, channel, status). Retry button for failed sends.
- **D-12:** Polling approach -- notification bell polls via server action every 30-60 seconds for unread count and new notifications. No SSE/WebSocket in this phase.
- **D-13:** Full event catalog covering:
  - Order: created, confirmed, payment_failed, refunded
  - License: generated, delivered, expiring_soon (7d, 3d, 1d), expired
  - Ticket: created, reply_received, status_changed, resolved
  - System: blog_published, security_alert
- **D-14:** Each event has default channels defined. User preferences can override. Admin notification types extend existing `ADMIN_NOTIFICATION_TYPES` array.

### Claude's Discretion
- Exact notification_log schema columns and indexes
- Polling interval (30s vs 60s)
- Notification preference storage (separate table vs JSONB on user)
- Admin delivery log page layout and filter UI
- How manual WhatsApp sending works in admin UI (button placement, pre-filled template format)
- Which existing server actions get notification triggers wired in this phase vs deferred
- SMTP configuration fields in admin settings (host, port, user, pass, from address)
- Notification template HTML design (follow existing ConversionFlow email branding)

### Deferred Ideas (OUT OF SCOPE)
- Automated WhatsApp API integration (Meta Business API or BD provider like Twilio/MessageBird) -- deferred to future phase. Channel abstraction in this phase should make it plug-and-play later.
- WebSocket/SSE for real-time notification delivery -- deferred. Polling is sufficient for now.
- React Email components or DB-stored template editor -- deferred. HTML string templates follow proven existing pattern.
- Digest/summary notifications (daily/weekly email digest) -- not in this phase's scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NOTIF-01 | Core notification service with channel router -- `sendNotification(userId, event, data, channels)` dispatches to email, in-app, and/or WhatsApp | Central service architecture in Standard Stack; channel adapter pattern in Architecture Patterns; existing `createAdminNotification()` pattern to extend |
| NOTIF-02 | Email channel via generic SMTP -- configurable transport, HTML templates for transactional/support/system events, no vendor lock-in | Dual provider (Resend + nodemailer) in Standard Stack; existing HTML string template pattern verified in codebase; settings table upsert pattern for SMTP config |
| NOTIF-03 | In-app notification bell -- unread count badge, dropdown with notification list, mark-as-read, per-type grouping, extends existing notifications table | Existing `NotificationDropdown.tsx` fully functional with badge/dropdown/mark-read; existing `notifications` table with Drizzle relations; polling approach per D-12 |
| NOTIF-04 | WhatsApp channel for BD customers -- concise messages for order confirmations, license delivery, ticket updates via Meta Business API or BD provider | Manual admin-only sending per D-03; wa.me link pattern in Architecture Patterns; channel abstraction for future API automation per D-04 |
| NOTIF-05 | Complete event catalog -- order (created/confirmed/payment_failed/refunded), license (generated/delivered/expiring_soon/expired), ticket (created/reply/status_changed/resolved), system (blog_published/security_alert) | Event catalog with default channels defined in Architecture Patterns; trigger points mapped in Integration Points section |
| NOTIF-06 | Admin notification management -- view delivery logs, manage templates, test notifications | `notification_log` table schema in Don't Hand-Roll; admin delivery log page layout in Discretion items; retry mechanism for failed sends |
| NOTIF-07 | User notification preferences -- per-channel opt-in/out per event category | Per-category per-channel matrix per D-07; existing `NotificationPreferences.tsx` to wire up; preference storage recommendation in Architecture Patterns |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| resend | 6.12.3 (installed) | Primary email sending API | Already in use with 4 templates, project-wide pattern established [VERIFIED: installed in package.json] |
| nodemailer | 8.0.7 (latest) | SMTP fallback email transport | Industry-standard SMTP client, zero vendor lock-in, most downloaded email library for Node.js [VERIFIED: npm registry] |
| bullmq | 5.76.8 (installed) | Async job queue for WhatsApp/bulk channels | Already in use for license-sync, established pattern in `src/jobs/` [VERIFIED: installed in package.json] |
| ioredis | 5.10.1 (installed) | Redis client for BullMQ | Already configured, used for sessions and queues [VERIFIED: installed in package.json] |
| drizzle-orm | 0.45.2 (installed) | Database queries for notifications tables | Project-wide ORM, existing schema pattern [VERIFIED: installed in package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/nodemailer | latest | TypeScript types for nodemailer | Dev dependency -- nodemailer ships basic types but `@types/nodemailer` provides complete `SMTPTransport.Options` typing |
| date-fns | 4.1.0 (installed) | Time formatting in notifications | Already used in NotificationDropdown for relative timestamps [VERIFIED: installed in package.json] |
| lucide-react | 1.14.0 (installed) | Icons for new notification types | Already used throughout UI, add icons for new event types [VERIFIED: installed in package.json] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nodemailer | @react-email + resend-only | React Email requires component build system, adds complexity. CONTEXT.md locked HTML strings (D-02). nodemailer gives SMTP freedom. |
| nodemailer | amazon-ses-sdk | AWS lock-in, BD team may use any SMTP relay. nodemailer works with any SMTP including SES. |
| Separate preference table | JSONB column on user table | JSONB is simpler schema, but querying/validating individual preferences is harder. Separate table is cleaner per-entity. |

**Installation:**
```bash
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

**Version verification:**
- resend: 6.12.3 (installed, latest on registry)
- nodemailer: 8.0.7 (latest on registry, 2025-06 publish)
- bullmq: 5.76.8 (installed, latest 5.76.10)
- drizzle-orm: 0.45.2 (installed)

## Project Constraints (from CLAUDE.md)

- **Package Manager**: pnpm only -- never npm, yarn, or bun
- **Framework**: Next.js 16 with App Router, TypeScript strict mode
- **Components**: Server components by default; client components only when needed (`"use client"`)
- **Styling**: TailwindCSS v4 CSS-first config -- no tailwind.config.js file
- **Proxy**: Use `proxy.ts` instead of `middleware.ts`
- **Server Actions**: `"use server"` with auth session check via `auth.api.getSession()`
- **Admin Guard**: `role !== "admin" && role !== "super_admin"` pattern
- **Audit Logging**: `createAuditLog()` for all admin mutations
- **Path Alias**: `@/*` maps to `./src/*`
- **Deployment**: Self-hosted (not Vercel)

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── notifications.ts          # Central notification service (NEW)
│   ├── notifications/
│   │   ├── types.ts              # Event catalog, channel types, preference types (NEW)
│   │   ├── channels/
│   │   │   ├── email.ts          # Email channel adapter: Resend + SMTP (NEW)
│   │   │   ├── in-app.ts         # In-app channel adapter: DB insert (NEW)
│   │   │   └── whatsapp.ts       # WhatsApp channel adapter: manual link gen (NEW)
│   │   ├── templates.ts          # HTML email template registry (NEW)
│   │   └── preferences.ts        # User preference read/write helpers (NEW)
│   ├── emails/                   # Existing email templates (EXTEND with new templates)
│   │   ├── order-confirmation.ts # EXISTS
│   │   ├── payment-reminder.ts   # EXISTS
│   │   ├── verification.ts       # EXISTS
│   │   ├── reset-password.ts     # EXISTS
│   │   ├── license-delivery.ts   # NEW
│   │   ├── ticket-notification.ts # NEW
│   │   └── system-alert.ts       # NEW
│   ├── db/
│   │   └── schema.ts             # EXTEND with notification_log, notification_preferences tables
│   └── audit.ts                  # EXISTS
├── jobs/
│   ├── queues.ts                 # EXTEND with notification queue
│   ├── workers/
│   │   ├── license-sync.ts       # EXISTS
│   │   └── notification.ts       # NEW: async notification worker
│   └── start.ts                  # EXTEND to register notification worker
├── app/
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── notifications/    # NEW: admin notification management page
│   │   │   │   └── page.tsx      # NEW: delivery logs, template preview, test send
│   │   │   └── settings/
│   │   │       └── page.tsx      # EXTEND: add EmailProviderSettings section
│   │   └── actions/
│   │       ├── admin-notifications.ts    # EXTEND with new types, delivery log actions
│   │       ├── admin-notif-settings.ts   # NEW: SMTP config + email provider actions
│   │       └── admin-orders.ts           # EXTEND: add notification triggers
│   ├── (portal)/
│   │   └── actions/
│   │       ├── notifications.ts          # EXTEND: add polling action
│   │       ├── support.ts                # EXTEND: add notification triggers
│   │       ├── account.ts                # EXTEND: wire updateNotificationPreferences
│   │       └── checkout.ts               # EXTEND: add notification triggers
│   └── api/
│       └── webhooks/
│           └── license/route.ts          # EXTEND: add notification triggers
├── components/
│   ├── header/
│   │   └── NotificationDropdown.tsx      # EXTEND: add polling interval
│   ├── portal/
│   │   └── NotificationPreferences.tsx   # EXTEND: wire to real DB, per-channel matrix
│   └── admin/
│       ├── EmailProviderSettings.tsx      # NEW: SMTP/Resend toggle config form
│       └── NotificationLogTable.tsx       # NEW: delivery log with filters
└── instrumentation.ts                     # EXISTS -- jobs started here
```

### Pattern 1: Central Notification Service
**What:** Single `sendNotification()` function that all trigger points call. Routes to channel adapters based on event config and user preferences.
**When to use:** Every place that needs to send a notification -- server actions, webhook handlers, background jobs.
**Example:**
```typescript
// Source: [ASSUMED] based on CONTEXT.md D-06, follows existing createAdminNotification pattern
import { sendEmail } from "./notifications/channels/email";
import { sendInApp } from "./notifications/channels/in-app";
import { queueWhatsApp } from "./notifications/channels/whatsapp";
import { getNotificationPreferences } from "./notifications/preferences";
import { EVENT_CATALOG, type NotificationEvent, type NotificationChannel } from "./notifications/types";

export async function sendNotification(
  userId: string,
  event: NotificationEvent,
  data: Record<string, unknown>,
  channels?: NotificationChannel[]
): Promise<void> {
  const eventConfig = EVENT_CATALOG[event];
  const targetChannels = channels ?? eventConfig.defaultChannels;

  // Check user preferences -- skip channels user has opted out of
  const preferences = await getNotificationPreferences(userId, eventConfig.category);
  const activeChannels = targetChannels.filter(ch => preferences[ch] !== false);

  for (const channel of activeChannels) {
    try {
      switch (channel) {
        case "email":
          await sendEmail(userId, event, data);
          break;
        case "in_app":
          await sendInApp(userId, event, data);
          break;
        case "whatsapp":
          await queueWhatsApp(userId, event, data); // async via BullMQ
          break;
      }
      await logNotification({ userId, event, channel, status: "sent" });
    } catch (error) {
      await logNotification({
        userId, event, channel, status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
```

### Pattern 2: Dual Email Provider Adapter
**What:** Abstraction over Resend (primary) and nodemailer (SMTP fallback). Admin configures via settings table.
**When to use:** Every email send in the notification service.
**Example:**
```typescript
// Source: [ASSUMED] based on CONTEXT.md D-01, follows existing resend pattern in src/lib/emails/
import { Resend } from "resend";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

async function getActiveProvider(): Promise<"resend" | "smtp"> {
  const [row] = await db.select().from(settings).where(eq(settings.key, "email_provider")).limit(1);
  return (row?.value as "resend" | "smtp") ?? "resend";
}

export async function sendViaEmail(to: string, subject: string, html: string): Promise<void> {
  const provider = await getActiveProvider();

  if (provider === "smtp") {
    // Read SMTP config from settings table
    const [hostRow] = await db.select().from(settings).where(eq(settings.key, "smtp_host")).limit(1);
    const [portRow] = await db.select().from(settings).where(eq(settings.key, "smtp_port")).limit(1);
    const [userRow] = await db.select().from(settings).where(eq(settings.key, "smtp_user")).limit(1);
    const [passRow] = await db.select().from(settings).where(eq(settings.key, "smtp_pass")).limit(1);

    const transporter = nodemailer.createTransport({
      host: hostRow?.value ?? "",
      port: Number(portRow?.value ?? 587),
      secure: Number(portRow?.value ?? 587) === 465,
      auth: { user: userRow?.value ?? "", pass: passRow?.value ?? "" },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? "noreply@salesconversionflow.com",
      to,
      subject,
      html,
    });
  } else {
    // Resend (existing pattern)
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "noreply@salesconversionflow.com",
      to,
      subject,
      html,
    });
  }
}
```

### Pattern 3: Event Catalog with Default Channels
**What:** Typed event catalog defining each notification event, its category, default channels, and template.
**When to use:** Referenced by `sendNotification()` to determine routing and by admin UI to show available events.
**Example:**
```typescript
// Source: [ASSUMED] based on CONTEXT.md D-13, D-14
export type NotificationEvent =
  // Order events
  | "order.created" | "order.confirmed" | "order.payment_failed" | "order.refunded"
  // License events
  | "license.generated" | "license.delivered" | "license.expiring_soon" | "license.expired"
  // Ticket events
  | "ticket.created" | "ticket.reply_received" | "ticket.status_changed" | "ticket.resolved"
  // System events
  | "system.blog_published" | "system.security_alert";

export type NotificationCategory = "orders" | "licenses" | "tickets" | "system";
export type NotificationChannel = "email" | "in_app" | "whatsapp";

export const EVENT_CATALOG: Record<NotificationEvent, {
  category: NotificationCategory;
  defaultChannels: NotificationChannel[];
  titleTemplate: (data: Record<string, unknown>) => string;
  messageTemplate: (data: Record<string, unknown>) => string;
}> = {
  "order.created": {
    category: "orders",
    defaultChannels: ["email", "in_app"],
    titleTemplate: (d) => `Order #${d.orderNumber} Created`,
    messageTemplate: (d) => `Your order for ${d.planName} has been received.`,
  },
  // ... all events defined
};
```

### Pattern 4: Manual WhatsApp via wa.me Link
**What:** Admin clicks "Send WhatsApp" button, opens wa.me link with pre-filled message text. No API integration.
**When to use:** When admin wants to manually notify a BD customer via WhatsApp.
**Example:**
```typescript
// Source: [ASSUMED] based on CONTEXT.md D-03
// In admin UI component -- generates a clickable link
function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  // BD numbers: strip leading 0, add +880
  const formattedPhone = cleanPhone.startsWith("0")
    ? `+880${cleanPhone.slice(1)}`
    : cleanPhone;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone.replace("+", "")}?text=${encodedMessage}`;
}
```

### Pattern 5: Notification Preference Storage (Recommended: Separate Table)
**What:** New `notification_preferences` table with one row per user-category-channel combination.
**When to use:** Reading/writing user notification preferences.
**Rationale over JSONB:** Queryable, indexable, easy to filter by category or channel. Avoids JSON parsing overhead. Follows relational model already used in schema.ts.
**Example:**
```typescript
// Source: [ASSUMED] based on CONTEXT.md D-07, D-08
// In schema.ts
export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    category: text("category").notNull(), // "orders" | "licenses" | "tickets" | "system"
    channel: text("channel").notNull(),   // "email" | "in_app" | "whatsapp"
    enabled: boolean("enabled").default(true),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    unique("notif_prefs_user_cat_ch_unique").on(t.userId, t.category, t.channel),
    index("notif_prefs_user_idx").on(t.userId),
  ]
);
```

### Anti-Patterns to Avoid
- **Inline notification logic in server actions:** Each action should call `sendNotification()`, not build its own email/in-app logic. Scattered notification code is the #1 source of missed notifications and duplicated templates. [CITED: project experience from STATE.md accumulated context]
- **Creating a new Resend instance per email file:** The existing 4 email templates each create `new Resend()`. For the notification service, centralize the email adapter so there's one shared provider instance. [VERIFIED: existing pattern in src/lib/emails/*.ts]
- **Storing full notification content in the log table:** The `notification_log` table tracks delivery metadata (status, channel, error), not full message content. Content lives in the `notifications` table for in-app and is transient for email/WhatsApp. [ASSUMED]
- **Polling too frequently:** 30-second polling on every page load can generate significant server load with many concurrent users. Start with 60-second interval, reduce only if UX requires it. [ASSUMED]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SMTP email sending | Custom SMTP socket or fetch-based email API | nodemailer | Handles TLS, connection pooling, auth, attachments, retry logic. 15+ years of edge case handling. [CITED: nodemailer.com] |
| Email provider switching | Custom abstraction layer from scratch | Simple adapter function with settings lookup | Settings table already has upsert pattern (see admin-settings.ts SSL config). Reuse it. [VERIFIED: src/app/(admin)/actions/admin-settings.ts] |
| Notification preferences | JSONB parsing/validating custom structure | Separate relational table with unique constraint | Drizzle handles the SQL, unique constraint prevents duplicates, easy to query by category/channel. [VERIFIED: schema.ts pattern] |
| Background job processing | setTimeout/setInterval or custom queue | BullMQ (already installed) | Existing pattern in `src/jobs/`, handles retries, dead-letter, concurrency. [VERIFIED: src/jobs/queues.ts] |
| Time-relative formatting | Custom "2 minutes ago" logic | date-fns `formatDistanceToNow()` (already in use) | Already imported in NotificationDropdown.tsx. [VERIFIED: src/components/header/NotificationDropdown.tsx line 19] |

**Key insight:** This project already has 80% of the infrastructure. The notifications table, the dropdown UI, the email templates, the BullMQ queues, the settings key-value store, and the server action patterns all exist. The work is integration, not invention.

## Common Pitfalls

### Pitfall 1: Circular Notification Loops
**What goes wrong:** An admin action (e.g., marking order paid) triggers a notification, which itself triggers another action, creating an infinite loop.
**Why it happens:** Server actions that modify state and also send notifications can re-enter.
**How to avoid:** `sendNotification()` must only INSERT into DB and send email -- never call server actions that modify business state. Keep it a pure side-effect function. [ASSUMED]
**Warning signs:** Stack overflow errors, duplicate notifications, rapidly growing audit logs.

### Pitfall 2: Notification Spam on Bulk Operations
**What goes wrong:** Admin does a bulk license sync or mass order update, generating hundreds of notifications per second.
**Why it happens:** No rate limiting or batching in the notification service.
**How to avoid:** For bulk operations, use BullMQ queue with rate lim (same pattern as license-sync worker with `limiter: { max: 5, duration: 1000 }`). The central service should detect when called from a batch context and queue instead of sending synchronously. [VERIFIED: src/jobs/workers/license-sync.ts uses BullMQ limiter]
**Warning signs:** Resend rate limit errors (429), SMTP connection exhaustion, slow page response during sync.

### Pitfall 3: Resend vs SMTP Config Drift
**What goes wrong:** Admin switches to SMTP but SMTP credentials are wrong. All emails silently fail.
**Why it happens:** No health check or test-send mechanism when saving SMTP config.
**How to avoid:** Add a "Test Connection" button on admin email settings that calls `transporter.verify()` for SMTP or sends a test email via Resend. Show success/error in real-time. [ASSUMED]
**Warning signs:** `notification_log` table fills with "failed" status, no complaints from users about missing emails.

### Pitfall 4: Nodemailer Transporter Memory Leak
**What goes wrong:** Creating a new nodemailer `createTransport()` for every email send leaks connections.
**Why it happens:** nodemailer creates a connection pool that stays open. If you create a new one each call, pools accumulate.
**How to avoid:** Cache the transporter instance (same pattern as Redis/DB singletons in this project). Check if SMTP config changed before reusing cached instance. [CITED: nodemailer.com documentation]
**Warning signs:** Rising memory usage, "too many connections" SMTP errors.

### Pitfall 5: Missing User Email/Phone for Notifications
**What goes wrong:** `sendNotification()` tries to email a user but their email is unverified or tries WhatsApp but phone is missing.
**Why it happens:** The `user` table has `email` and `phone` columns but no guarantee they are populated or verified.
**How to avoid:** Channel adapters must gracefully handle missing contact info. Log as "skipped" (not "failed") in notification_log. Skip silently -- don't throw errors that would prevent other channels from sending. [VERIFIED: user table schema has `emailVerified` boolean and `phone` with `.notNull()`]
**Warning signs:** Notification logs showing "failed" for email when user exists but has no verified email.

### Pitfall 6: Notification Bell Flickering with Polling
**What goes wrong:** Polling every 30-60s causes the notification badge to briefly show "0" then "5" as the component re-renders during fetch.
**Why it happens:** `useEffect` fetch clears state before new data arrives.
**How to avoid:** Don't clear existing notification state during poll. Only update if new data differs. Use optimistic updates pattern already present in NotificationDropdown.tsx. [VERIFIED: existing component uses local state + fetchNotifications pattern]
**Warning signs:** Badge count flickering, notification list jumping.

## Code Examples

### Existing Pattern: Email Template (HTML String)
```typescript
// Source: [VERIFIED: src/lib/emails/order-confirmation.ts]
// This is the EXACT pattern all new notification email templates must follow.
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(params: OrderConfirmationParams) {
  const { to, orderNumber, planName, amount, currency, paymentMethod, licenseKey, status } = params;
  const html = `
    <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background: #0047FF; padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0;">ConversionFlow</h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 4px 0 0 0;">by Devsroom</p>
      </div>
      <!-- body content -->
    </div>
  `;
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@salesconversionflow.com",
    to,
    subject: "Order Confirmation - ConversionFlow",
    html,
  });
}
```

### Existing Pattern: Admin Notification Server Action
```typescript
// Source: [VERIFIED: src/app/(admin)/actions/admin-notifications.ts]
// This is the EXACT pattern for creating in-app notifications.
export async function createAdminNotification(params: {
  adminUserId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}) {
  if (!ADMIN_NOTIFICATION_TYPES.includes(params.type)) {
    return { error: "Invalid notification type." };
  }
  await db.insert(notifications).values({
    userId: params.adminUserId,
    type: params.type,
    title: params.title,
    message: params.message,
    data: params.data ?? null,
    read: false,
  });
  return { success: true };
}
```

### Existing Pattern: Settings Upsert (for SMTP config)
```typescript
// Source: [VERIFIED: src/app/(admin)/actions/admin-settings.ts]
// This is the EXACT upsert pattern for storing SMTP config in the settings table.
const existing = await db.select().from(settings).where(eq(settings.key, entry.key)).limit(1);
if (existing.length > 0) {
  await db.update(settings).set({ value: entry.value, updatedAt: new Date() }).where(eq(settings.key, entry.key));
} else {
  await db.insert(settings).values({ key: entry.key, value: entry.value });
}
```

### Existing Pattern: BullMQ Worker Registration
```typescript
// Source: [VERIFIED: src/jobs/start.ts, src/jobs/queues.ts, src/jobs/workers/license-sync.ts]
// This is the EXACT pattern for adding a new queue + worker.

// In queues.ts:
export const notificationQueue = connectionOptions
  ? new Queue("notification", connectionOptions)
  : null;

// In workers/notification.ts:
export function startNotificationWorker(): Worker | undefined {
  const worker = new Worker("notification", async (job: Job) => {
    // Process notification job
  }, { connection: redisConnection, concurrency: 5, limiter: { max: 10, duration: 1000 } });
  return worker;
}

// In start.ts:
import { notificationQueue } from "@/jobs/queues";
import { startNotificationWorker } from "@/jobs/workers/notification";
if (notificationQueue) {
  startNotificationWorker();
}
```

## Integration Points: Where to Wire Notification Triggers

Based on codebase analysis, these are the exact files where `sendNotification()` should be called:

| Trigger Event | File | Function | When |
|---------------|------|----------|------|
| `order.created` | `src/app/(portal)/actions/checkout.ts` | `createOrder()` | After successful order insert |
| `order.confirmed` | `src/app/(admin)/actions/admin-orders.ts` | `verifyOrder()` | After central API sync completes |
| `order.payment_failed` | `src/app/api/ssl-commerz/ipn/route.ts` | IPN handler | When payment validation fails |
| `order.refunded` | `src/lib/webhook-handlers.ts` | `handlePaymentRefunded()` | After license revoked + order refunded |
| `license.generated` | `src/lib/webhook-handlers.ts` | `handleLicenseCreated()` | After license insert |
| `license.delivered` | `src/jobs/workers/license-sync.ts` | `syncOrderToCentral()` | After central API returns license key |
| `license.expiring_soon` | `src/jobs/workers/notification.ts` (NEW) | Scheduled job | Cron checks expiring licenses |
| `license.expired` | `src/lib/webhook-handlers.ts` | `handleLicenseExpired()` | After status set to expired |
| `ticket.created` | `src/app/(portal)/actions/support.ts` | `createTicket()` | After ticket insert |
| `ticket.reply_received` | `src/app/(portal)/actions/support.ts` | `replyToTicket()` | After message insert (notify admin) |
| `ticket.status_changed` | Admin ticket action | Status update handler | After status update (notify customer) |
| `ticket.resolved` | Admin ticket action | Resolution handler | After ticket resolved (notify customer) |
| `system.blog_published` | `src/app/(admin)/actions/admin-blog.ts` | Blog publish action | After blog post status set to published |
| `system.security_alert` | `src/lib/auth.ts` | Account lockout plugin | When account gets locked |

[VERIFIED: all files confirmed to exist in codebase via glob and read]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Resend-only email | Dual provider (Resend + SMTP) | This phase | Admin can switch to any SMTP relay, no vendor lock-in |
| Hardcoded notification types | Event catalog with typed enum | This phase | Type-safe event routing, easy to add new events |
| No notification tracking | notification_log table with status per channel | This phase | Delivery audit trail, retry capability |
| Simple on/off preferences | Per-category per-channel matrix | This phase | Granular control for users |
| On-page-load notifications | Polling-based notification bell | This phase | Near-real-time updates without WebSocket complexity |

**Deprecated/outdated:**
- The existing `ADMIN_NOTIFICATION_TYPES` array (hardcoded string array) will be superseded by the typed event catalog but should remain for backward compatibility with existing notification rows.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | nodemailer works in Next.js serverless (Vercel/standalone) without native compilation issues | Standard Stack | May need `@nestjs/mailer` or different SMTP library if native deps fail |
| A2 | wa.me links are the best manual WhatsApp approach (vs. copied text) | Architecture Patterns | Some BD users may prefer desktop WhatsApp Web; wa.me works for both mobile and desktop |
| A3 | 60-second polling interval is acceptable for notification bell UX | Architecture Patterns | Admin/users may expect real-time; can be reduced to 30s if needed |
| A4 | Settings table key-value pattern (used for SSL, VAT) is appropriate for SMTP credentials | Architecture Patterns | If encryption needed for password, may need a separate secrets mechanism |
| A5 | Separate `notification_preferences` table is better than JSONB on user table | Architecture Patterns | JSONB could be simpler if preference structure is simple and rarely queried independently |
| A6 | Resend API error response format is `{ data, error }` as shown in docs | Standard Stack | Existing code does not destructure error -- pattern needs verification |
| A7 | `smtp_pass` stored in plain text in settings table is acceptable for this project | Security Domain | May need encryption at rest for production; acceptable for dev/staging |

## Open Questions (RESOLVED)

1. **SMTP credential storage security** — RESOLVED: Follow existing pattern (plain text in settings table) for consistency. Add encryption later if compliance requires it.

2. **Notification template count** — RESOLVED: CONTEXT D-02 decided HTML string templates per existing pattern. Plans create 10 templates total (license-delivery, license-expiring, license-expired, ticket-created, ticket-reply, ticket-resolved, order-confirmed, payment-failed, order-refunded, security-alert).

3. **Admin notification routing** — RESOLVED: System-wide events notify ALL admins. Action-specific events only log. Matches existing `ADMIN_NOTIFICATION_TYPES` pattern.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL | notification_log, notification_preferences tables | available | Running on localhost:5434 | -- |
| Redis | BullMQ notification queue | available | localhost:6381 | In-memory fallback (existing pattern) |
| Resend API | Primary email provider | configured | API key in .env | SMTP fallback via admin settings |
| Node.js | Runtime | available | -- | -- |
| pnpm | Package manager | available | -- | -- |
| drizzle-kit | DB migrations | available | 0.31.10 | -- |

**Missing dependencies with no fallback:**
- nodemailer (needs `pnpm add nodemailer`) -- blocking for SMTP fallback feature
- @types/nodemailer (needs `pnpm add -D @types/nodemailer`) -- blocking for TypeScript compilation

**Missing dependencies with fallback:**
- None identified. All external dependencies are either installed or have a clear installation path.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed -- Wave 0 required |
| Config file | None -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NOTIF-01 | sendNotification routes to correct channels | unit | N/A | Wave 0 |
| NOTIF-02 | Email sends via Resend and SMTP | unit | N/A | Wave 0 |
| NOTIF-03 | In-app notification creates DB row | unit | N/A | Wave 0 |
| NOTIF-04 | WhatsApp generates wa.me link | unit | N/A | Wave 0 |
| NOTIF-05 | Event catalog covers all events | unit | N/A | Wave 0 |
| NOTIF-06 | Delivery log records send attempts | unit | N/A | Wave 0 |
| NOTIF-07 | User preferences stored and respected | unit | N/A | Wave 0 |

### Sampling Rate
- **Per task commit:** Manual verification (no test runner)
- **Per wave merge:** Manual verification
- **Phase gate:** Full manual verification before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] No test framework installed -- vitest recommended (lightweight, ESM-native, used by Better Auth)
- [ ] No test config file
- [ ] No test files exist in project
- [ ] Consider: `pnpm add -D vitest` + `vitest.config.ts` + test scripts in package.json

Note: This project has operated without tests for 6 completed phases. The planner should evaluate whether adding test infrastructure in this phase is worth the scope increase vs. continuing with manual verification.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (indirectly) | Better Auth handles auth; notifications verify userId ownership |
| V4 Access Control | yes | Admin role check on all admin notification actions (existing pattern) |
| V5 Input Validation | yes | Validate event types against catalog enum; validate channel against allowed values |
| V6 Cryptography | partial | SMTP password stored in settings table -- plain text currently (same as SSL Commerce creds) |
| V8 Data Protection | yes | notification_log may contain PII (email addresses, phone numbers) in error messages |

### Known Threat Patterns for Notification System

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Notification injection (XSS in title/message) | Tampering | Sanitize notification content before DB insert; React auto-escapes in JSX |
| Unauthorized notification preference modification | Spoofing | Server action validates userId matches session user (existing pattern in account.ts) |
| Notification spam (rate abuse) | Denial of Service | BullMQ rate lim for async channels; central service logs all attempts |
| SMTP credential exposure | Information Disclosure | Settings table values not exposed via API; admin page masks password field |
| IDOR on notification preferences | Elevation of Privilege | Query filters by session.user.id (existing pattern per T-03-01 in STATE.md) |

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/lib/emails/*.ts` (4 email templates), `src/lib/db/schema.ts` (notifications table), `src/components/header/NotificationDropdown.tsx` (283-line component), `src/jobs/` (queue infrastructure), `src/app/(admin)/actions/admin-settings.ts` (settings upsert pattern)
- [resend.com/docs/send-with-nodejs](https://resend.com/docs/send-with-nodejs) - Resend Node.js SDK API verified
- npm registry: resend@6.12.3, nodemailer@8.0.7, bullmq@5.76.10 versions verified

### Secondary (MEDIUM confidence)
- [nodemailer.com](https://nodemailer.com/) - SMTP transport configuration patterns
- [CONTEXT.md](.planning/phases/07-notification-engine/07-CONTEXT.md) - User decisions on architecture

### Tertiary (LOW confidence)
- wa.me link format for manual WhatsApp -- standard WhatsApp URL scheme, widely documented

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries verified in codebase or npm registry
- Architecture: HIGH - extensive existing infrastructure analyzed, patterns verified in codebase
- Pitfalls: MEDIUM - based on domain knowledge of notification systems and project patterns
- Integration points: HIGH - every file path verified to exist in codebase

**Research date:** 2026-05-20
**Valid until:** 2026-06-20 (stable stack, unlikely to change)
