# Phase 17: Multi-channel Notification Engine - Research

**Researched:** 2026-06-06
**Domain:** Notification engine, email adapters, BullMQ workers, event-driven routing
**Confidence:** HIGH

## Summary

This phase builds a unified notification engine on top of substantial existing infrastructure. The project already has: a working EventBus with in-process and Redis pub/sub modes, BullMQ queue definitions (`emailQueue`, `notificationQueue`) with a dedicated `bullRedis` connection, 10 production-ready email templates using the Resend SDK, a `NotificationDropdown` component with fetch-on-load behavior, a `NotificationPreferences` component with a no-op Save button, an admin SMTP settings page that stores `email_provider`, `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, and `smtp_from` in the `settings` table, and domain events for Licensing (`LICENSE_EVENTS`), Billing (`ORDER_EVENTS`), and Products (`PRODUCT_EVENTS`).

The core work is wiring, not building from scratch. The `NotificationService` subscribes to domain events via the EventBus, consults a code-based event catalog to determine which channels to dispatch to, checks user preferences from a new JSONB column on the `user` table, creates in-app notification rows and delivery tracking rows, and enqueues email jobs. BullMQ workers process these jobs. The `NotificationDropdown` gets a 30s polling interval. The `NotificationPreferences` Save button gets wired to a server action. The 10 email templates switch from direct `resend.emails.send()` to a unified `EmailSender` interface with `ResendEmailAdapter` and `NodemailerEmailAdapter`.

**Primary recommendation:** Follow the existing worker pattern from `subscription-lifecycle.ts` and `backup-worker.ts` exactly. Create the `NotificationService` as a single class that subscribes to event types via `inProcessSubscriber`. Use the existing `settings` table lookup pattern from `admin-notif-settings.ts` to select the email adapter at runtime.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Unified email sender with adapter pattern. `ResendEmailAdapter` wraps existing Resend SDK. `NodemailerEmailAdapter` uses `nodemailer` for generic SMTP. Adapter selected by admin's `email_provider` setting in `settings` table.
- **D-02:** Existing 10 email templates in `src/lib/emails/` keep their HTML structure. Only the final `resend.emails.send()` call gets replaced with the unified sender.
- **D-03:** `nodemailer` already installed (v8.0.10). Both adapters implement common `EmailSender` interface: `send(to, subject, html, options?)`.
- **D-04:** 30-second polling in existing `NotificationDropdown`. `setInterval` in existing `useEffect`. Clean up on unmount. No SSE/WebSocket.
- **D-05:** Existing notification types (license, billing, support, system) are sufficient. No new categories.
- **D-06:** `notificationPreferences` JSONB column on existing `user` table. Default: `{ license: true, billing: true, support: true, system: true, channels: { email: true, in_app: true } }`. Wire `NotificationPreferences` Save button to server action.
- **D-07:** Per-channel toggle (email on/off, in-app on/off) added to preferences UI alongside category toggles.
- **D-08:** Code-based event catalog in `src/modules/notifications/`. TypeScript map: event name to `{ channels, template, category }`. Type-safe, version-controlled.
- **D-09:** Core transactional events only (~6-8): `order.completed`, `license.generated`, `license.expiring`, `license.grace_period`, `license.expired`, `password.reset`, `api_token.created`, `transfer.*`.
- **D-10:** `NotificationService` receives domain events via EventBus, looks up user preferences, checks event catalog, dispatches to channels. Skip channel if user disabled it for that category.
- **D-11:** New `notification_deliveries` table with: `id` (uuid), `notificationId`, `channel` (email|in_app), `status` (pending|sent|delivered|failed), `providerId` (nullable), `error` (nullable), `attempts` (int, default 1), `createdAt`, `updatedAt`.
- **D-12:** Failed deliveries logged with error. BullMQ retry: 3 attempts with exponential backoff (1s, 5s, 30s). No manual retry UI.
- **D-13:** Wire existing `emailQueue` and `notificationQueue`. Domain events publish to `notificationQueue`. Notification worker creates in-app notification + dispatches email job. Email worker sends via unified adapter.
- **D-14:** BullMQ retry: 3 attempts, exponential backoff (1s, 5s, 30s). After 3 failures, mark delivery `failed` with last error.

### Claude's Discretion
- Exact `NotificationService` class structure (single service vs separate handlers per event type)
- Worker file organization and registration
- NotificationDropdown polling implementation details (debounce on tab focus, pause when tab hidden)
- Email adapter error handling and logging
- How to wire event catalog to existing domain events
- Migration strategy for adding `notificationPreferences` column with defaults
- Admin delivery log UI design within existing `NotificationsTable`

### Deferred Ideas (OUT OF SCOPE)
- WhatsApp channel integration (Phase 17.1)
- Full event catalog expansion (support tickets, blog posts, security events)
- DB-driven admin-configurable routing
- React Email component rewrite
- SSE/WebSocket real-time push
- Admin template editor with live preview
- SMS channel
- Notification batching/digest
- Push notifications (browser/mobile)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NOTIF-01 | Core notification service routes events to correct channels based on event type and user preferences | NotificationService subscribes to EventBus, consults event catalog, checks user JSONB preferences |
| NOTIF-02 | Email channel sends HTML emails via generic SMTP with configurable templates | Unified EmailSender interface with NodemailerAdapter + ResendAdapter, selected by admin setting |
| NOTIF-03 | In-app notification bell shows unread count badge and dropdown with notification list | Existing NotificationDropdown already works; 30s polling via setInterval adds near-real-time |
| NOTIF-04 | Event catalog covers all trigger events | Code-based TypeScript map in `src/modules/notifications/` with ~6-8 core transactional events |
| NOTIF-05 | Admin can manage notification templates and view delivery logs | Extend existing NotificationsTable with delivery status column; code-based templates (no admin editor) |
| NOTIF-06 | Users can manage per-channel notification preferences | Wire existing NotificationPreferences Save button to server action updating user.notificationPreferences JSONB |
| NOTIF-07 | Delivery tracking per channel | New notification_deliveries table with per-channel status rows |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| bullmq | 5.76.8 (installed) | Job queue for async notification/email processing | Already in use for subscription-lifecycle, backup workers; queues already defined |
| nodemailer | 8.0.10 (installed) | SMTP email transport adapter | Already installed; used in `admin-notif-settings.ts` for SMTP testing; adapter pattern wraps it |
| resend | 6.12.3 (installed) | Email API transport adapter | Already in use across 10 email templates; adapter pattern wraps it |
| drizzle-orm | 0.45.2 (installed) | Database ORM for schema + queries | Project standard; JSONB column support via `jsonb()` with `.$type<T>()` |
| ioredis | (installed) | Redis client for BullMQ + EventBus | Project standard; `bullRedis` connection already configured in `src/lib/redis.ts` |
| nanoid | (installed) | Event ID generation | Already used in all domain event factories |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | (installed) | Date formatting in NotificationDropdown | Already used for `formatDistanceToNow` in notification timestamps |
| lucide-react | (installed) | Icons for notification type badges | Already used in NotificationDropdown |

### No New Dependencies Required
All packages needed for this phase are already installed. No `pnpm add` required.

**Version verification:**
```
nodemailer: 8.0.10 (installed, latest: 8.0.10) [VERIFIED: pnpm list]
bullmq: 5.76.8 (installed, latest: 5.78.0) [VERIFIED: pnpm list]
resend: 6.12.3 (installed, latest: 6.12.4) [VERIFIED: pnpm list]
drizzle-orm: 0.45.2 (installed, latest: 0.45.2) [VERIFIED: pnpm list]
drizzle-kit: 0.31.10 (installed, latest: 0.31.10) [VERIFIED: pnpm list]
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── modules/notifications/              # New module
│   ├── domain/
│   │   └── types.ts                    # Channel, NotificationCategory, DeliveryStatus types
│   ├── application/
│   │   ├── services/
│   │   │   └── NotificationService.ts  # Event-driven routing service
│   │   └── catalog/
│   │       └── EventCatalog.ts         # Code-based event → channel/template/category map
│   └── infrastructure/
│       └── adapters/
│           ├── EmailSender.ts          # Interface definition
│           ├── ResendEmailAdapter.ts   # Wraps existing Resend SDK
│           └── NodemailerEmailAdapter.ts # Wraps nodemailer for SMTP
├── jobs/
│   ├── queues.ts                       # Existing (emailQueue, notificationQueue)
│   └── workers/
│       ├── email.worker.ts             # NEW: processes emailQueue jobs
│       └── notification.worker.ts      # NEW: processes notificationQueue jobs
├── lib/
│   ├── emails/                         # Existing 10 templates (modify send calls)
│   ├── db/schema.ts                    # Add notification_deliveries table + user JSONB column
│   └── redis.ts                        # Existing (bullRedis connection)
└── components/
    ├── header/NotificationDropdown.tsx  # Add 30s polling
    ├── portal/NotificationPreferences.tsx # Wire Save button + add channel toggles
    └── admin/NotificationsTable.tsx      # Add delivery status column
```

### Pattern 1: Email Adapter (Strategy Pattern)
**What:** Unified `EmailSender` interface with two implementations selected at runtime based on admin settings.
**When to use:** Every email send operation goes through this adapter.
**Example:**
```typescript
// src/modules/notifications/infrastructure/adapters/EmailSender.ts
export interface EmailSender {
  send(params: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<{ messageId: string; error?: string }>;
}

// src/modules/notifications/infrastructure/adapters/NodemailerEmailAdapter.ts
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class NodemailerEmailAdapter implements EmailSender {
  async send(params: {
    to: string; subject: string; html: string; from?: string;
  }): Promise<{ messageId: string; error?: string }> {
    // Read SMTP settings from settings table (same pattern as admin-notif-settings.ts)
    const [hostRow, portRow, userRow, passRow, fromRow] = await Promise.all([
      db.select().from(settings).where(eq(settings.key, "smtp_host")).limit(1),
      db.select().from(settings).where(eq(settings.key, "smtp_port")).limit(1),
      db.select().from(settings).where(eq(settings.key, "smtp_user")).limit(1),
      db.select().from(settings).where(eq(settings.key, "smtp_pass")).limit(1),
      db.select().from(settings).where(eq(settings.key, "smtp_from")).limit(1),
    ]);

    const transport = nodemailer.createTransport({
      host: hostRow[0]?.value,
      port: parseInt(portRow[0]?.value ?? "587", 10),
      secure: parseInt(portRow[0]?.value ?? "587", 10) === 465,
      auth: {
        user: userRow[0]?.value,
        pass: passRow[0]?.value,
      },
    });

    const result = await transport.sendMail({
      from: params.from || fromRow[0]?.value || "noreply@conversionflow.com",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    transport.close();
    return { messageId: result.messageId };
  }
}

// src/modules/notifications/infrastructure/adapters/ResendEmailAdapter.ts
import { Resend } from "resend";

export class ResendEmailAdapter implements EmailSender {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async send(params: {
    to: string; subject: string; html: string; from?: string;
  }): Promise<{ messageId: string; error?: string }> {
    const { data, error } = await this.resend.emails.send({
      from: params.from || process.env.EMAIL_FROM || "noreply@conversionflow.com",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      return { messageId: "", error: error.message };
    }
    return { messageId: data?.id ?? "" };
  }
}
```
[Source: Verified from existing codebase patterns in `src/app/(admin)/actions/admin-notif-settings.ts` and `src/lib/emails/order-confirmation.ts`]

### Pattern 2: BullMQ Worker (Existing Pattern)
**What:** Follow the exact pattern from `subscription-lifecycle.ts` and `backup-worker.ts`.
**When to use:** For `notification.worker.ts` and `email.worker.ts`.
**Example:**
```typescript
// src/jobs/workers/email.worker.ts
import { Worker } from "bullmq";
import { bullRedis } from "@/lib/redis";
import { emailQueue } from "@/jobs/queues";

const QUEUE_NAME = "email";
let workerStarted = false;

export function startEmailWorker(): void {
  if (workerStarted) return;
  if (!bullRedis) {
    console.warn("[Email] Redis not available, worker not started");
    return;
  }

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { to, subject, html, from, deliveryId } = job.data;
      // 1. Get email adapter based on settings
      // 2. Send email
      // 3. Update notification_deliveries status
    },
    {
      connection: bullRedis,
      concurrency: 5,
      limiter: { max: 10, duration: 1000 }, // 10 emails/sec rate limit
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`[Email] Job ${job?.id} failed:`, err.message);
  });

  worker.on("completed", (job) => {
    console.log(`[Email] Job ${job?.id} completed`);
  });

  workerStarted = true;
  console.log("[Email] Worker started");
}
```
[Source: Verified from `src/jobs/workers/subscription-lifecycle.ts` and `src/jobs/workers/backup-worker.ts`]

### Pattern 3: Event Catalog (Code-based Map)
**What:** TypeScript const object mapping event types to routing config.
**When to use:** When `NotificationService` needs to know which channels and template to use for an event.
**Example:**
```typescript
// src/modules/notifications/application/catalog/EventCatalog.ts
import type { NotificationCategory, Channel } from "../../domain/types";

export interface EventCatalogEntry {
  channels: Channel[];
  template: string;        // maps to function name in src/lib/emails/
  category: NotificationCategory;
  title: string;           // default title for in-app notification
}

export const EVENT_CATALOG: Record<string, EventCatalogEntry> = {
  "order.completed": {
    channels: ["email", "in_app"],
    template: "sendOrderConfirmationEmail",
    category: "billing",
    title: "Order Confirmed",
  },
  "license.created": {
    channels: ["email", "in_app"],
    template: "sendOrderConfirmationEmail", // reuse (has licenseKey param)
    category: "license",
    title: "License Key Generated",
  },
  "license.expiring": {
    channels: ["email", "in_app"],
    template: "sendLicenseExpiryReminderEmail",
    category: "license",
    title: "License Expiring Soon",
  },
  // ... more events
};
```
[Source: Verified from existing event types in `src/modules/licensing/domain/events/LicenseEvents.ts` and `src/modules/billing/domain/events/OrderEvents.ts`]

### Pattern 4: Polling with Visibility API
**What:** 30s `setInterval` in `NotificationDropdown` that pauses when tab is hidden.
**When to use:** Adding polling to the existing `useEffect` in `NotificationDropdown.tsx`.
**Example:**
```typescript
// Inside NotificationDropdown.tsx useEffect
useEffect(() => {
  fetchNotifications();

  const POLL_INTERVAL = 30_000; // 30 seconds

  const intervalId = setInterval(() => {
    if (document.visibilityState === "visible") {
      fetchNotifications();
    }
  }, POLL_INTERVAL);

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      fetchNotifications(); // Immediate refresh on tab focus
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    clearInterval(intervalId);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [fetchNotifications]);
```
[Source: ASSUMED - standard browser API pattern]

### Pattern 5: NotificationService EventBus Subscription
**What:** Single service class subscribes to all relevant event types on startup.
**When to use:** One-time initialization, likely in the worker startup or a module initializer.
**Example:**
```typescript
// src/modules/notifications/application/services/NotificationService.ts
import { inProcessSubscriber } from "@/shared/infrastructure/eventBus/EventBus";
import { EVENT_CATALOG } from "../catalog/EventCatalog";
import type { BaseEvent } from "@/shared/infrastructure/eventBus/types";

export class NotificationService {
  constructor(
    private db: typeof import("@/lib/db").db,
    private queue: typeof import("@/jobs/queues").notificationQueue,
  ) {}

  initialize(): void {
    for (const eventType of Object.keys(EVENT_CATALOG)) {
      inProcessSubscriber.subscribe(eventType, this.handleEvent.bind(this));
    }
  }

  private async handleEvent(event: BaseEvent): Promise<void> {
    const entry = EVENT_CATALOG[event.type];
    if (!entry) return;

    const payload = event.payload as { userId: string; [key: string]: unknown };
    // 1. Look up user preferences
    // 2. For each channel in entry.channels, check if enabled
    // 3. Create in-app notification row if channel enabled
    // 4. Create notification_deliveries rows (one per channel)
    // 5. Enqueue email job if email channel enabled
  }
}
```
[Source: Verified from existing EventBus subscriber pattern in `src/shared/infrastructure/eventBus/EventBus.ts`]

### Anti-Patterns to Avoid
- **Creating a new Redis connection for workers:** Must use the existing `bullRedis` from `src/lib/redis.ts` which has `maxRetriesPerRequest: null` as BullMQ requires. [VERIFIED: src/lib/redis.ts line 212-228]
- **Reading email settings on every send call for Nodemailer:** While unavoidable per D-01, cache the SMTP transport for the lifetime of a worker process instead of creating a new transport per email. Nodemailer transports are designed to be reused.
- **Subscribing to events inside the worker process:** The in-process EventBus subscriptions happen in the web server process (where events are published). Workers receive jobs from BullMQ queues, not from the EventBus directly. The NotificationService subscribes to EventBus in the web process, then enqueues jobs to BullMQ.
- **Modifying email template HTML:** Per D-02, only the `resend.emails.send()` call changes. Template HTML remains identical.
- **Adding a new `notification_type` enum:** The existing `notifications.type` column is `text`, not an enum. The 4 existing categories (license, billing, support, system) are sufficient per D-05.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Email sending abstraction | Custom email wrapper per template | Unified `EmailSender` interface with adapter pattern | Two providers (Resend + SMTP) must be swappable without touching templates |
| Job retry logic | Custom retry with setTimeout | BullMQ built-in `attempts` + `backoff` config | BullMQ handles retry, dead-letter, and job state persistence |
| Event routing | If/else chain in every event handler | `EventCatalog` map + `NotificationService` dispatch | Single source of truth for event → channel mapping; easily extensible |
| DB migrations | Manual SQL files | `drizzle-kit generate` + `drizzle-kit migrate` | Project uses Drizzle migrations; schema changes go through `schema.ts` + kit |
| Queue definitions | New queue instances | Existing `emailQueue` and `notificationQueue` from `src/jobs/queues.ts` | Already defined with proper Redis connection handling |

**Key insight:** This phase is primarily wiring existing infrastructure together. The EventBus, BullMQ queues, Redis connections, email templates, notification UI components, admin settings, and domain events are all in place. The new code is: (1) NotificationService class, (2) EventCatalog map, (3) EmailSender adapters, (4) two BullMQ workers, (5) notification_deliveries table, (6) user JSONB column, and (7) small UI modifications to wire Save button and add polling.

## Common Pitfalls

### Pitfall 1: EventBus Process Boundary Confusion
**What goes wrong:** Subscribing to EventBus in a BullMQ worker process. Events published in the web server process won't be received by worker-process subscribers unless using Redis pub/sub.
**Why it happens:** The in-process EventBus uses Node.js EventEmitter, which is process-scoped. `inProcessSubscriber` only receives events published in the same process.
**How to avoid:** `NotificationService` subscribes to events via `inProcessSubscriber` in the web server process (where domain events are published). It then enqueues BullMQ jobs. Workers only process BullMQ jobs, never subscribe to EventBus directly. For cross-process, use `crossProcessSubscriber` which uses Redis pub/sub.
**Warning signs:** Events are published but notification jobs never appear in the queue.

### Pitfall 2: Nodemailer Transport Leaking
**What goes wrong:** Creating a new `nodemailer.createTransport()` per email send. Each creates a new SMTP connection pool that isn't closed, leading to connection exhaustion.
**Why it happens:** SMTP connections are expensive; transports should be reused.
**How to avoid:** Cache the transport instance. Create once, reuse across sends. Close on worker shutdown. The existing `admin-notif-settings.ts` creates and closes per test -- that's fine for testing but wrong for production workers.
**Warning signs:** "connection refused" errors after sending many emails, or SMTP rate limiting.

### Pitfall 3: JSONB Default Value Migration
**What goes wrong:** Adding a JSONB column with a complex default value can fail on PostgreSQL if the default expression isn't properly escaped.
**Why it happens:** PostgreSQL requires single quotes for JSON string defaults in DDL.
**How to avoid:** Use Drizzle's `.default()` with a properly typed JSON object. Generate migration with `drizzle-kit generate` and inspect the SQL before applying. The default should be: `'{ "license": true, "billing": true, "support": true, "system": true, "channels": { "email": true, "in_app": true } }'::jsonb`.
**Warning signs:** Migration fails with "invalid input syntax for type json".

### Pitfall 4: Race Condition in Notification Creation
**What goes wrong:** Event handler creates notification row and delivery rows in separate operations without a transaction. If the process crashes between them, you get an orphaned notification with no delivery tracking.
**Why it happens:** Not wrapping related inserts in a DB transaction.
**How to avoid:** Use Drizzle's `db.transaction()` to wrap the notification insert + delivery inserts in a single atomic operation.
**Warning signs:** Notifications with no matching delivery rows; delivery counts don't match notification counts.

### Pitfall 5: Polling Without Visibility Check
**What goes wrong:** 30-second interval fires even when browser tab is hidden, wasting server resources and battery.
**Why it happens:** `setInterval` doesn't respect tab visibility by default.
**How to avoid:** Check `document.visibilityState === "visible"` before fetching. Also add a `visibilitychange` listener to immediately refresh when tab becomes visible (so user doesn't wait up to 30s to see new notifications after switching tabs).
**Warning signs:** DevTools Network tab shows polling requests even when tab is in background.

### Pitfall 6: Queue Name Mismatch
**What goes wrong:** Worker listens on wrong queue name. The existing `queues.ts` uses `QUEUE_NAMES.EMAIL = "email"` and `QUEUE_NAMES.NOTIFICATION = "notification"`. Workers must use these exact names.
**Why it happens:** Hardcoding queue names instead of importing from `queues.ts`.
**How to avoid:** Import `QUEUE_NAMES` from `src/jobs/queues.ts` and use the constants.
**Warning signs:** Worker starts but never picks up jobs; jobs pile up in wrong queue.

## Code Examples

### Email Template Migration (Before/After)
```typescript
// BEFORE (src/lib/emails/order-confirmation.ts - current):
const resend = new Resend(process.env.RESEND_API_KEY);
// ... HTML generation ...
await resend.emails.send({
  from: process.env.EMAIL_FROM || "noreply@conversionflow.com",
  to,
  subject: "Order Confirmation - ConversionFlow",
  html,
});

// AFTER (modified to use unified sender):
import { getEmailSender } from "@/modules/notifications/infrastructure/adapters/EmailSender";

// ... HTML generation stays identical ...
const sender = await getEmailSender(); // Returns Resend or Nodemailer adapter based on settings
const result = await sender.send({
  to,
  subject: "Order Confirmation - ConversionFlow",
  html,
  from: process.env.EMAIL_FROM || "noreply@conversionflow.com",
});
```
[Source: Verified from `src/lib/emails/order-confirmation.ts` lines 1-154]

### notification_deliveries Table Schema (Drizzle)
```typescript
// Add to src/lib/db/schema.ts

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "sent",
  "delivered",
  "failed",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "email",
  "in_app",
]);

export const notificationDeliveries = pgTable(
  "notification_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    notificationId: uuid("notification_id")
      .notNull()
      .references(() => notifications.id, { onDelete: "cascade" }),
    channel: notificationChannelEnum("channel").notNull(),
    status: deliveryStatusEnum("status").notNull().default("pending"),
    providerId: text("provider_id"),
    error: text("error"),
    attempts: integer("attempts").default(1).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("notification_deliveries_notification_id_idx").on(table.notificationId),
    index("notification_deliveries_status_idx").on(table.status),
    index("notification_deliveries_channel_idx").on(table.channel),
  ]
);
```
[Source: Verified from existing schema patterns in `src/lib/db/schema.ts` (lines 1-839)]

### User Table JSONB Column Addition
```typescript
// Modify existing user table in src/lib/db/schema.ts
export const user = pgTable("user", {
  // ... existing columns ...
  notificationPreferences: jsonb("notification_preferences")
    .$type<{
      license: boolean;
      billing: boolean;
      support: boolean;
      system: boolean;
      channels: { email: boolean; in_app: boolean };
    }>()
    .default({
      license: true,
      billing: true,
      support: true,
      system: true,
      channels: { email: true, in_app: true },
    }),
});
```
[Source: Verified from existing JSONB usage patterns in `src/lib/db/schema.ts` (e.g., `licenses.activationDomains`, `tickets.attachments`)]

### Preferences Server Action
```typescript
// src/app/(portal)/actions/notification-preferences.ts
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function saveNotificationPreferences(preferences: {
  license: boolean;
  billing: boolean;
  support: boolean;
  system: boolean;
  channels: { email: boolean; in_app: boolean };
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  await db
    .update(user)
    .set({ notificationPreferences: preferences })
    .where(eq(user.id, session.user.id));

  return { success: true };
}

export async function getNotificationPreferences() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const [row] = await db
    .select({ notificationPreferences: user.notificationPreferences })
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  return row?.notificationPreferences ?? {
    license: true, billing: true, support: true, system: true,
    channels: { email: true, in_app: true },
  };
}
```
[Source: Verified from existing server action patterns in `src/app/(portal)/actions/notifications.ts`]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Direct Resend SDK calls in templates | Unified EmailSender interface with adapter pattern | This phase | Templates become provider-agnostic |
| No delivery tracking | notification_deliveries table per channel | This phase | Admin can see email send status |
| Fetch-on-load notifications | 30s polling with visibility API | This phase | Near-real-time notification updates |
| No-op preferences Save button | Wired to server action updating JSONB column | This phase | User preferences actually persist |
| No async processing for notifications | BullMQ workers for email + notification queues | This phase | Non-blocking event processing |

**Deprecated/outdated:**
- Direct `resend.emails.send()` in template files: Replace with `EmailSender.send()` calls
- No retry on email failures: BullMQ provides 3-attempt exponential backoff

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | NotificationService should subscribe via `inProcessSubscriber` in the web server process (not workers) | Architecture Patterns | If wrong, events won't reach the notification pipeline; need `crossProcessSubscriber` instead |
| A2 | Nodemailer transport should be cached per worker lifecycle, not created per send | Don't Hand-Roll | If wrong, SMTP connection pool exhaustion under load |
| A3 | The `settings` table keys (`email_provider`, `smtp_host`, etc.) are the single source of truth for email config | Architecture Patterns | If admin changes settings format, adapter lookup breaks |
| A4 | Drizzle's `jsonb().$type<T>().default(obj)` generates correct PostgreSQL default with JSON casting | Common Pitfalls | If wrong, migration fails; need to edit generated SQL |
| A5 | BullMQ `Worker` constructor queue name must match exactly with `Queue` constructor queue name | Common Pitfalls | If wrong, jobs never processed |

**If this table is empty:** All claims in this research were verified or cited.

## Open Questions

1. **Where does NotificationService.initialize() get called?**
   - What we know: The EventBus subscriptions need to happen in the web server process, likely during app startup or in an instrumentation file.
   - What's unclear: Next.js 16 doesn't have a standard "on server start" hook. The subscription could go in `instrumentation.ts` (if Node.js runtime), or in a layout server component, or in the proxy.ts.
   - Recommendation: Use Next.js `instrumentation.ts` file (supported since Next.js 13) to initialize the NotificationService on server startup. This is Claude's discretion per CONTEXT.md.

2. **Should existing email template functions be modified in-place or wrapped?**
   - What we know: D-02 says only the send call changes. The templates are in `src/lib/emails/`.
   - What's unclear: Whether to modify each template file's send call to use the adapter, or create wrapper functions that call the template (for HTML) + adapter (for sending).
   - Recommendation: Modify each template's send call in-place. The HTML generation logic stays. Replace `resend.emails.send(...)` with `sender.send(...)`. Minimal change, maximum clarity.

3. **How to handle the notificationQueue vs in-process routing?**
   - What we know: D-13 says domain events publish to `notificationQueue`. But the EventBus is in-process.
   - What's unclear: Does the EventBus handler enqueue to `notificationQueue` (BullMQ), or does the NotificationService handle events directly?
   - Recommendation: NotificationService subscribes to EventBus events and handles them directly (creates DB rows, enqueues email jobs to `emailQueue`). The `notificationQueue` is for jobs that need the full notification pipeline (e.g., from admin broadcast, from external triggers). Two entry points, same processing logic.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL | Database layer | Needs check | -- | -- |
| Redis | BullMQ + EventBus | Needs check | -- | In-memory fallback exists for cache, but BullMQ requires Redis |
| Node.js | Runtime | Yes | -- | -- |
| pnpm | Package manager | Yes | -- | -- |
| drizzle-kit | DB migrations | Yes | 0.31.10 | -- |
| nodemailer | SMTP email | Yes | 8.0.10 | -- |
| resend | API email | Yes | 6.12.3 | -- |
| bullmq | Job queues | Yes | 5.76.8 | -- |
| ioredis | Redis client | Yes | -- | -- |

**Missing dependencies with no fallback:**
- None -- all packages are already installed.

**Missing dependencies with fallback:**
- Redis: If not running, BullMQ workers won't start (graceful warning logged). EventBus falls back to in-process only. Email sending would need to happen synchronously as fallback (or be skipped).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No test framework installed |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NOTIF-01 | NotificationService routes events to correct channels | unit | N/A | No - Wave 0 |
| NOTIF-02 | Email adapters send via correct provider | unit | N/A | No - Wave 0 |
| NOTIF-03 | Polling refreshes notification list | manual | N/A | N/A |
| NOTIF-04 | Event catalog maps all defined events | unit | N/A | No - Wave 0 |
| NOTIF-05 | Admin delivery log shows status | integration | N/A | No - Wave 0 |
| NOTIF-06 | Preferences persist to user JSONB column | integration | N/A | No - Wave 0 |
| NOTIF-07 | Delivery rows created per channel | unit | N/A | No - Wave 0 |

### Sampling Rate
- **Per task commit:** Visual verification in dev environment
- **Per wave merge:** Manual end-to-end test: trigger event, verify notification appears in dropdown, verify email sent
- **Phase gate:** All 7 requirements verified manually

### Wave 0 Gaps
- [ ] No test framework installed -- project has no `vitest`, `jest`, or `pytest`
- [ ] `tests/` directory does not exist in project root
- [ ] Consider adding `vitest` as dev dependency for unit testing the NotificationService and EventCatalog
- Note: This project has historically operated without tests. Adding a test framework may be out of scope for this phase. Manual verification is the established pattern.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Better Auth session validation in server actions (existing pattern) |
| V3 Session Management | yes | Better Auth session used in all notification actions |
| V4 Access Control | yes | `requireAdmin()` guard on admin actions; user-scoped queries with `eq(notifications.userId, session.user.id)` |
| V5 Input Validation | yes | Drizzle ORM parameterized queries; type-safe JSONB preferences |
| V6 Cryptography | no | No cryptographic operations in this phase |

### Known Threat Patterns for Notification Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized preference modification | Tampering | Server action validates session + user ownership before update |
| Notification data exposure | Information Disclosure | User-scoped queries (`WHERE userId = session.user.id`); admin guard on delivery logs |
| Email header injection | Tampering | Nodemailer handles header sanitization; Resend SDK sanitizes inputs |
| SMTP credential exposure | Information Disclosure | `smtp_pass` never returned to client (verified in `admin-notif-settings.ts` line 65: "Never return smtp_pass to client") |
| Notification spam / flooding | Denial of Service | Rate limiting via BullMQ concurrency; event catalog limits which events trigger notifications |
| XSS via notification content | Tampering | React auto-escapes in NotificationDropdown; HTML email templates use `escapeHtml()` for user data (verified in `api-token-notification.ts`) |

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/lib/db/schema.ts` -- verified table structures, JSONB patterns, enum definitions, relation definitions
- Codebase analysis: `src/shared/infrastructure/eventBus/` -- verified EventBus, EventEmitterBus, RedisPubSubBus, types, registry
- Codebase analysis: `src/jobs/` -- verified queue definitions, worker patterns (subscription-lifecycle, backup-worker)
- Codebase analysis: `src/lib/emails/` -- verified 10 email templates all follow identical Resend SDK pattern
- Codebase analysis: `src/lib/redis.ts` -- verified `bullRedis` connection with `maxRetriesPerRequest: null`
- Codebase analysis: `src/app/(admin)/actions/admin-notif-settings.ts` -- verified SMTP settings CRUD pattern, nodemailer import
- Codebase analysis: `src/modules/licensing/domain/events/LicenseEvents.ts` -- verified event type constants and factory pattern
- Codebase analysis: `src/modules/billing/domain/events/OrderEvents.ts` -- verified ORDER_EVENTS and payload interface
- pnpm registry: Verified installed versions of nodemailer (8.0.10), bullmq (5.76.8), resend (6.12.3), drizzle-orm (0.45.2)

### Secondary (MEDIUM confidence)
- Existing worker patterns (`subscription-lifecycle.ts`) -- heavily analyzed for reuse as template
- Admin notifications actions (`admin-notifications.ts`) -- verified existing CRUD patterns for notifications
- Portal notification actions (`notifications.ts`) -- verified existing query patterns

### Tertiary (LOW confidence)
- Visibility API polling pattern -- standard browser API, not verified against specific browser compatibility for BD market
- `instrumentation.ts` for Next.js startup hooks -- ASSUMED based on Next.js 13+ documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all packages verified installed, versions confirmed
- Architecture: HIGH - existing patterns are well-established and documented in codebase
- Pitfalls: HIGH - identified from direct codebase analysis (EventBus process boundaries, BullMQ queue naming, JSONB defaults)

**Research date:** 2026-06-06
**Valid until:** 2026-07-06 (stable - no fast-moving dependencies)
