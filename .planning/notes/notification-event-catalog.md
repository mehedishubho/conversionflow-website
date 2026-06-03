# Notification Event Catalog & Template Matrix

> **Status:** Design complete — ready for implementation
> **Created:** 2026-06-02
> **Depends on:** Phase 14 event bus (✓ shipped), existing `notifications` table (✓ shipped), Resend email (✓ shipping)

---

## 1. Event Catalog

All events follow the `BaseEvent` interface from `src/shared/infrastructure/eventBus/types.ts`.

### Event Type Naming Convention

```
{Domain}.{Entity}.{Action}
```

Examples: `Order.Payment.Completed`, `License.Activation.Created`, `Ticket.Status.Changed`

### Priority Levels

| Priority | Meaning | Delivery Requirement |
|----------|---------|---------------------|
| **immediate** | Time-sensitive, user waiting | Send within 30 seconds |
| **soon** | Important but not urgent | Send within 5 minutes |
| **digest** | Informational, can batch | Aggregate hourly or daily |

---

### 1.1 Order Events

| Event Type | Source | Priority | Email | In-App | WhatsApp |
|------------|--------|----------|-------|--------|----------|
| `Order.Created` | billing | immediate | ✅ | ✅ admin | ✅ admin |
| `Order.Payment.Completed` | billing | immediate | ✅ customer | ✅ both | ✅ customer |
| `Order.Payment.Failed` | billing | immediate | ✅ customer | ✅ customer | ✅ customer |
| `Order.Payment.Refunded` | billing | soon | ✅ customer | ✅ both | ✅ customer |
| `Order.Payment.Verified` | billing | immediate | ✅ customer | ✅ both | — |
| `Order.Cancelled` | billing | soon | ✅ customer | ✅ both | — |

**Event Payloads:**

```typescript
// Order.Created
interface OrderCreatedPayload {
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  planName: string;
  amount: number;
  currency: string; // "BDT" | "USD"
  paymentMethod: string; // "ssl_commerce" | "bkash" | "nagad" | "bank_transfer"
  status: "pending" | "completed";
}

// Order.Payment.Completed (payment confirmed, license generated)
interface OrderPaymentCompletedPayload {
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  planName: string;
  amount: number;
  currency: string;
  licenseKey: string; // freshly generated
  productDownloadUrl: string;
}

// Order.Payment.Failed
interface OrderPaymentFailedPayload {
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  planName: string;
  amount: number;
  currency: string;
  failureReason: string;
  retryUrl: string;
}

// Order.Payment.Refunded
interface OrderPaymentRefundedPayload {
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  planName: string;
  refundAmount: number;
  currency: string;
  refundReason: string;
  licenseRevoked: boolean;
}
```

---

### 1.2 License Events

| Event Type | Source | Priority | Email | In-App | WhatsApp |
|------------|--------|----------|-------|--------|----------|
| `License.Generated` | licensing | immediate | ✅ customer | ✅ both | ✅ customer |
| `License.Activation.Created` | licensing | soon | ✅ customer | ✅ both | — |
| `License.Activation.Deactivated` | licensing | soon | — | ✅ customer | — |
| `License.Activation.LimitReached` | licensing | immediate | ✅ customer | ✅ both | ✅ customer |
| `License.Status.Suspended` | licensing | immediate | ✅ customer | ✅ both | ✅ customer |
| `License.Status.Revoked` | licensing | immediate | ✅ customer | ✅ both | ✅ customer |
| `License.Expiry.Warning30d` | licensing | digest | ✅ customer | ✅ customer | — |
| `License.Expiry.Warning7d` | licensing | soon | ✅ customer | ✅ customer | ✅ customer |
| `License.Expiry.Warning3d` | licensing | soon | ✅ customer | ✅ customer | ✅ customer |
| `License.Expiry.Warning1d` | licensing | immediate | ✅ customer | ✅ customer | ✅ customer |
| `License.Expiry.Expired` | licensing | immediate | ✅ customer | ✅ both | ✅ customer |
| `License.Transfer.Requested` | licensing | immediate | ✅ both | ✅ both | — |
| `License.Transfer.Completed` | licensing | immediate | ✅ both | ✅ both | — |

**Event Payloads:**

```typescript
// License.Generated
interface LicenseGeneratedPayload {
  licenseId: string;
  licenseKey: string;
  userId: string;
  userEmail: string;
  userName: string;
  product: string;
  planName: string;
  expiresAt: Date | null; // null = lifetime
  maxActivations: number;
}

// License.Activation.Created
interface LicenseActivationCreatedPayload {
  licenseId: string;
  licenseKey: string;
  userId: string;
  userEmail: string;
  domain: string;
  activationCount: number;
  maxActivations: number;
  activatedAt: Date;
}

// License.Activation.LimitReached
interface LicenseActivationLimitReachedPayload {
  licenseId: string;
  licenseKey: string;
  userId: string;
  userEmail: string;
  product: string;
  currentActivations: number;
  maxActivations: number;
  upgradeUrl: string;
}

// License.Expiry.Warning*
interface LicenseExpiryWarningPayload {
  licenseId: string;
  licenseKey: string;
  userId: string;
  userEmail: string;
  userName: string;
  product: string;
  planName: string;
  daysRemaining: number; // 30, 7, 3, 1
  expiresAt: Date;
  renewalUrl: string;
}

// License.Expiry.Expired
interface LicenseExpiredPayload {
  licenseId: string;
  licenseKey: string;
  userId: string;
  userEmail: string;
  userName: string;
  product: string;
  planName: string;
  expiredAt: Date;
  gracePeriodEnds: Date | null; // 7-30 days
  renewalUrl: string;
}

// License.Transfer.*
interface LicenseTransferPayload {
  licenseId: string;
  licenseKey: string;
  fromUserId: string;
  fromUserEmail: string;
  toUserId: string;
  toUserEmail: string;
  product: string;
  transferCode: string;
}
```

---

### 1.3 Ticket / Support Events

| Event Type | Source | Priority | Email | In-App | WhatsApp |
|------------|--------|----------|-------|--------|----------|
| `Ticket.Created` | support | soon | ✅ admin | ✅ both | — |
| `Ticket.Reply.Customer` | support | soon | ✅ admin | ✅ admin | — |
| `Ticket.Reply.Agent` | support | soon | ✅ customer | ✅ customer | — |
| `Ticket.Status.Changed` | support | soon | ✅ customer | ✅ customer | — |
| `Ticket.Resolved` | support | soon | ✅ customer | ✅ customer | — |

**Event Payloads:**

```typescript
// Ticket.Created
interface TicketCreatedPayload {
  ticketId: string;
  ticketNumber: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  subject: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
}

// Ticket.Reply.Customer (customer replied)
interface TicketReplyCustomerPayload {
  ticketId: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  subject: string;
  replyPreview: string; // first 200 chars
  adminDashboardUrl: string;
}

// Ticket.Reply.Agent (agent replied)
interface TicketReplyAgentPayload {
  ticketId: string;
  ticketNumber: string;
  customerId: string;
  customerEmail: string;
  agentName: string;
  subject: string;
  replyPreview: string;
  ticketUrl: string;
}

// Ticket.Status.Changed
interface TicketStatusChangedPayload {
  ticketId: string;
  ticketNumber: string;
  customerId: string;
  customerEmail: string;
  oldStatus: string;
  newStatus: string; // "open" | "in_progress" | "waiting" | "resolved" | "closed"
  changedBy: string;
  ticketUrl: string;
}
```

---

### 1.4 System Events

| Event Type | Source | Priority | Email | In-App | WhatsApp |
|------------|--------|----------|-------|--------|----------|
| `System.Security.LoginNewDevice` | auth | immediate | ✅ user | ✅ user | — |
| `System.Security.PasswordChanged` | auth | immediate | ✅ user | ✅ user | — |
| `System.Security.SuspiciousActivation` | licensing | immediate | ✅ admin | ✅ admin | ✅ admin |
| `System.Blog.Published` | content | digest | — | ✅ all | — |
| `System.Maintenance.Scheduled` | system | soon | ✅ all | ✅ all | — |
| `System.Plugin.UpdateAvailable` | products | digest | ✅ customer | ✅ customer | — |

**Event Payloads:**

```typescript
// System.Security.LoginNewDevice
interface LoginNewDevicePayload {
  userId: string;
  userEmail: string;
  deviceInfo: string;
  ipAddress: string;
  location: string;
  timestamp: Date;
}

// System.Security.SuspiciousActivation
interface SuspiciousActivationPayload {
  licenseId: string;
  licenseKey: string;
  domain: string;
  reason: string; // "rapid_activations" | "geo_anomaly" | "multiple_domains_short_time"
  activationCount: number;
  timeWindow: string;
  adminDashboardUrl: string;
}

// System.Blog.Published
interface BlogPublishedPayload {
  postId: string;
  title: string;
  excerpt: string;
  slug: string;
  authorName: string;
}

// System.Plugin.UpdateAvailable
interface PluginUpdateAvailablePayload {
  productId: string;
  productName: string;
  version: string;
  changelogUrl: string;
  downloadUrl: string;
  userId: string;
  userEmail: string;
}
```

---

## 2. In-App Notification Type Mapping

The existing `notifications` table uses a `type` text field. The `NotificationDropdown` component maps these types to icons. Here's the expanded type system:

### Notification Types (for `notifications.type` column)

| Type | Icon | Color | Events |
|------|------|-------|--------|
| `license` | Key | brand/blue | License.Generated, License.Activation.*, License.Expiry.*, License.Transfer.*, License.Status.* |
| `billing` | CreditCard | success/green | Order.Created, Order.Payment.*, Order.Cancelled |
| `support` | MessageSquare | warning/amber | Ticket.Created, Ticket.Reply.*, Ticket.Status.*, Ticket.Resolved |
| `security` | ShieldAlert | error/red | System.Security.* |
| `system` | Info | gray | System.Blog.Published, System.Maintenance.*, System.Plugin.UpdateAvailable |
| `affiliate` | Users | accent/blue | (Future: Phase 8 Affiliate events) |

### Notification Data JSONB Schema

The `notifications.data` JSONB field should contain:

```typescript
interface NotificationData {
  // Deep link — clicking notification navigates here
  entityUrl?: string;

  // Event type that triggered this notification
  eventType?: string;

  // Related entity IDs for filtering
  entityType?: "order" | "license" | "ticket" | "user" | "system";
  entityId?: string;

  // For batch/grouped notifications
  groupedCount?: number;

  // Action-specific data
  actions?: Array<{
    label: string;
    url: string;
    variant: "primary" | "secondary";
  }>;
}
```

---

## 3. Email Template Specifications

### 3.1 Template Architecture

**Approach:** Continue with current Resend + inline HTML pattern (matches existing `order-confirmation.ts`). No React Email dependency needed — the volume is low and the current approach works.

**Shared Layout Components:**
Every email shares a common structure defined in a `createEmailLayout()` helper:

```
┌─────────────────────────────────┐
│  ConversionFlow Header (blue)   │  ← Reusable header component
├─────────────────────────────────┤
│                                 │
│  [Email-specific content]       │  ← Template body
│                                 │
├─────────────────────────────────┤
│  Footer (support link)          │  ← Reusable footer component
└─────────────────────────────────┘
```

### 3.2 Template Catalog

| # | Template Name | Event(s) | Recipient | Key Content |
|---|--------------|----------|-----------|-------------|
| E1 | Order Confirmation | `Order.Payment.Completed` | Customer | Order #, plan, amount, license key, download link |
| E2 | Order Pending Verification | `Order.Created` (pending) | Customer | Order #, plan, amount, "We're verifying your bKash/Nagad payment" |
| E3 | Payment Failed | `Order.Payment.Failed` | Customer | Order #, reason, retry button |
| E4 | Payment Refunded | `Order.Payment.Refunded` | Customer | Order #, refund amount, reason, license status |
| E5 | License Delivered | `License.Generated` | Customer | License key (highlighted), product name, activation instructions, plan details |
| E6 | License Activation Confirmed | `License.Activation.Created` | Customer | Domain activated, activation count, remaining slots |
| E7 | License Expiry Warning | `License.Expiry.Warning*` | Customer | Days remaining, product name, renewal button, expires date |
| E8 | License Expired | `License.Expiry.Expired` | Customer | Expired notice, grace period info, renewal button |
| E9 | License Suspended/Revoked | `License.Status.Suspended/Revoked` | Customer | Reason, contact support link, affected product |
| E10 | Activation Limit Reached | `License.Activation.LimitReached` | Customer | Current/max activations, upgrade CTA |
| E11 | License Transfer Initiated | `License.Transfer.Requested` | Both parties | Transfer details, confirmation link |
| E12 | License Transfer Complete | `License.Transfer.Completed` | Both parties | New owner info, old owner confirmation |
| E13 | Ticket Created (Admin) | `Ticket.Created` | Admin | Customer name, subject, priority badge, link |
| E14 | Ticket Reply (Agent → Customer) | `Ticket.Reply.Agent` | Customer | Agent name, reply preview, link to ticket |
| E15 | Ticket Reply (Customer → Admin) | `Ticket.Reply.Customer` | Admin | Customer name, reply preview, link |
| E16 | Ticket Resolved | `Ticket.Resolved` | Customer | Resolution summary, feedback link |
| E17 | Login from New Device | `System.Security.LoginNewDevice` | User | Device info, IP, location, "Was this you?" |
| E18 | Password Changed | `System.Security.PasswordChanged` | User | Timestamp, "If you didn't do this, contact support" |
| E19 | Suspicious Activation (Admin) | `System.Security.SuspiciousActivation` | Admin | License key, domain, reason, review link |
| E20 | Plugin Update Available | `System.Plugin.UpdateAvailable` | Customer | Version, changelog link, download button |
| E21 | New Order Alert (Admin) | `Order.Created` | Admin | Customer info, plan, amount, payment method |

**Existing templates to keep as-is:**
- Password Reset (`reset-password.ts`) — auth flow, not event-driven
- Email Verification (`verification.ts`) — auth flow, not event-driven

### 3.3 Email Design Specifications

**Consistent branding (matches existing `order-confirmation.ts`):**
- Font: DM Sans, sans-serif fallback
- Max width: 600px
- Header: `#0047FF` (accent blue) background, white text
- Body text: `#3B4480`
- Headings: `#1a1a2e`
- Success: `#12b76a` (green)
- Warning: `#f79009` (amber)
- Error: `#ef4444` (red)
- Border radius: 8-12px
- CTA button: blue pill (`#0047FF`, white text, border-radius 10px)

**BD-specific considerations:**
- Amount formatting: `৳` for BDT, use `en-BD` locale
- Payment method names: bKash, Nagad, SSL Commerz, Bank Transfer
- Support email: `support@conversionflow.com`
- Footer: "ConversionFlow by Devsroom"

---

## 4. WhatsApp Message Formats

### 4.1 Channel Strategy

WhatsApp is used for **high-priority, concise** notifications only. Messages go through the WhatsApp Business API.

**Send WhatsApp when:**
- Payment completed (customer gets license key immediately)
- License expiring within 7 days
- License expired
- Suspicious activation detected (admin)
- License activation limit reached

**Do NOT send WhatsApp for:**
- Informational updates (blog posts, maintenance)
- Low-priority warnings (30-day expiry)
- Ticket replies (email is sufficient)

### 4.2 Message Templates

**W1 — Payment Completed + License Key**
```
✅ অর্ডার কনফার্ম!
ConversionFlow - {planName}
Amount: ৳{amount} ({paymentMethod})

License Key:
`{licenseKey}`

Activate: {appUrl}/dashboard/licenses

— ConversionFlow by Devsroom
```

**W2 — License Expiring Soon (7d/3d/1d)**
```
⏰ আপনার লাইসেন্স {days} দিনের মধ্যে শেষ হবে!

{productName} - {planName}
Expiry: {expiryDate}

Renew now: {renewalUrl}

— ConversionFlow by Devsroom
```

**W3 — License Expired**
```
❌ আপনার লাইসেন্স শেষ হয়ে গেছে

{productName} - {planName}
Grace period: {graceDays} days remaining

Renew now: {renewalUrl}

— ConversionFlow by Devsroom
```

**W4 — Activation Limit Reached**
```
⚠️ Activation limit reached!

{productName}: {current}/{max} activations used.

Upgrade your plan:
{upgradeUrl}

— ConversionFlow by Devsroom
```

**W5 — Suspicious Activation (Admin)**
```
🚨 Suspicious license activity detected!

License: {licenseKey}
Domain: {domain}
Reason: {reason}
Activations: {count} in {timeWindow}

Review: {adminUrl}

— ConversionFlow Admin
```

**W6 — License Suspended/Revoked**
```
⛔ আপনার লাইসেন্স {status}

{productName} - {planName}
Reason: {reason}

Contact support: {supportUrl}

— ConversionFlow by Devsroom
```

### 4.3 BD-Specific WhatsApp Notes

- Use Bengali (বাংলা) for customer messages, English for admin messages
- Keep messages under 160 chars for readability
- bKash/Nagad payment names in Bengali: বিকাশ, নগদ
- Always include a direct link (deep link to dashboard)
- WhatsApp Business API requires pre-approved templates — register these during implementation

---

## 5. Event → Notification Handler Architecture

### 5.1 Notification Service Interface

```typescript
interface NotificationService {
  // Route an event to all applicable channels
  send(event: BaseEvent): Promise<void>;

  // Send to a single channel
  sendEmail(templateId: string, to: string, params: Record<string, unknown>): Promise<void>;
  sendInApp(userId: string, type: NotificationType, title: string, message: string, data?: NotificationData): Promise<void>;
  sendWhatsApp(to: string, templateId: string, params: Record<string, unknown>): Promise<void>;
}
```

### 5.2 Event Handler Registration

Using the existing `EventRegistry` from Phase 14:

```typescript
// src/modules/billing/infrastructure/notification-handlers.ts
import { EventRegistry } from "@/shared/infrastructure/eventBus/registry";
import { NotificationService } from "@/shared/infrastructure/notifications/NotificationService";

export function registerBillingNotificationHandlers(
  registry: EventRegistry,
  notifications: NotificationService
) {
  registry.subscribe("Order.Payment.Completed", async (event) => {
    const payload = event.payload as OrderPaymentCompletedPayload;

    // Parallel channel delivery
    await Promise.allSettled([
      notifications.sendEmail("order-confirmation", payload.userEmail, payload),
      notifications.sendInApp(payload.userId, "billing", "Order Confirmed", `Your order #${payload.orderNumber} is confirmed.`, {
        entityUrl: "/dashboard/licenses",
        eventType: event.type,
        entityType: "order",
        entityId: payload.orderId,
      }),
      notifications.sendWhatsApp(payload.userPhone, "payment-completed", payload),
    ]);
  });

  // ... more handlers
}
```

### 5.3 Channel Routing Map (Implementation Reference)

A centralized routing config that maps event types to channels:

```typescript
// src/shared/infrastructure/notifications/channel-routing.ts
type ChannelRouting = {
  email?: { template: string; recipient: "customer" | "admin" | "both" };
  inApp?: { type: NotificationType; recipient: "customer" | "admin" | "both" };
  whatsapp?: { template: string; recipient: "customer" | "admin" };
};

export const CHANNEL_ROUTING: Record<string, ChannelRouting> = {
  "Order.Payment.Completed": {
    email: { template: "order-confirmation", recipient: "customer" },
    inApp: { type: "billing", recipient: "both" },
    whatsapp: { template: "payment-completed", recipient: "customer" },
  },
  "License.Expiry.Warning7d": {
    email: { template: "license-expiry-warning", recipient: "customer" },
    inApp: { type: "license", recipient: "customer" },
    whatsapp: { template: "license-expiring", recipient: "customer" },
  },
  // ... complete routing from the tables above
};
```

---

## 6. Summary Statistics

| Category | Count |
|----------|-------|
| **Total Event Types** | 28 |
| Order Events | 6 |
| License Events | 13 |
| Ticket Events | 5 |
| System Events | 6 |
| **Email Templates** | 21 (new) + 2 (existing auth) |
| **WhatsApp Templates** | 6 |
| **In-App Types** | 6 (`license`, `billing`, `support`, `security`, `system`, `affiliate`) |

---

## 7. Implementation Priority

### Phase 1 — Core Transactional (with v3.0 Phase 14/15/16)
These must ship alongside the licensing core:

| Priority | Templates | Why |
|----------|-----------|-----|
| P0 | E1, E2, E5 | Order confirmation & license delivery — customers must receive licenses |
| P0 | W1 | WhatsApp license delivery — BD market expects instant |
| P1 | E7, E8, W2, W3 | Expiry warnings — drives renewals |

### Phase 2 — Support & Operations (with Phase 17/18)
| Priority | Templates | Why |
|----------|-----------|-----|
| P2 | E13-E16 | Ticket notifications — support quality |
| P2 | E17-E19, W5 | Security alerts — fraud prevention |

### Phase 3 — Engagement (post-MVP)
| Priority | Templates | Why |
|----------|-----------|-----|
| P3 | E20 | Plugin updates — product engagement |
| P3 | E3, E4, E9, E10, E11, E12 | Edge case notifications |
| P3 | W4, W6 | WhatsApp edge cases |

---

*This document serves as the single source of truth for the notification system design. Implementation should reference this catalog when building event handlers in each bounded context.*
