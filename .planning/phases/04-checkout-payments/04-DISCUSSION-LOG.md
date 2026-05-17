# Phase 4: Checkout and Payments - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 04-checkout-payments
**Areas discussed:** Checkout Flow & Entry Points, Manual BD Payment Flow, SSL Commerce & Auto-Payment Flow, Invoices & Tax/VAT, Checkout Page Layout, Payment Success UX, Admin Payment Config, Error & Edge Cases

---

## Round 1: Core Flow Decisions

### Checkout Flow & Entry Points

| Option | Description | Selected |
|--------|-------------|----------|
| Login Required | Customer must login before checkout. Marketing Buy Now redirects to login then checkout | ✓ |
| Guest Checkout Allowed | Anyone can start checkout, create account during payment | |

**User's choice:** Login Required
**Notes:** Simpler flow, fewer edge cases, phone number already collected at registration.

| Option | Description | Selected |
|--------|-------------|----------|
| 2-Step: Plan then Checkout | Pricing page (step 1) then Checkout page (step 2) with payment method + coupon + summary | ✓ |
| Single Page Checkout | All options on one page | |
| Multi-Step Wizard | Plan, Payment method, Details, Review | |

**User's choice:** 2-Step (Plan then Checkout)
**Notes:** Clean flow with pricing page as plan selector, checkout page handles everything else.

| Option | Description | Selected |
|--------|-------------|----------|
| Portal Route | /dashboard/checkout?plan=X within portal shell | ✓ |
| Standalone Route | /checkout?plan=X outside portal shell | |

**User's choice:** Portal Route
**Notes:** Portal sidebar and header visible, feels like part of the portal experience.

---

### Manual BD Payment Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Transaction ID Submit | Customer sends money, enters transaction ID. Order stays pending until admin verifies. | ✓ |
| Transaction ID + Screenshot | Same plus screenshot upload as proof | |
| Auto-Verify + Admin Confirm | System auto-verifies via bKash/Nagad API if available | |

**User's choice:** Transaction ID Submit
**Notes:** No screenshot needed. Simple transaction ID stored in paymentRef column.

| Option | Description | Selected |
|--------|-------------|----------|
| Admin Orders Page | /admin/orders showing pending orders. Click verify/reject. | ✓ |
| Notification-Driven Verification | Admin gets email/notification, clicks to verify | |

**User's choice:** Admin Orders Page
**Notes:** Dedicated page at /admin/orders with pending orders list and verify/reject actions.

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed Payment Numbers | Standard numbers from env vars/settings | |
| Configurable Payment Accounts | Admin configures multiple payment numbers per method | ✓ |

**User's choice:** Configurable Payment Accounts
**Notes:** Admin can set up multiple numbers/accounts per payment method from settings page.

---

### SSL Commerce and Auto-Payment Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Hosted Payment Page | SSL Commerz standard: create session, redirect, callback | ✓ |
| EasyCheckout Popup | Embedded popup on site | |

**User's choice:** Hosted Payment Page
**Notes:** Standard integration, minimal PCI scope.

| Option | Description | Selected |
|--------|-------------|----------|
| Immediate + Retry | POST to central API immediately, retry on failure | ✓ |
| Background Job Async | Queue BullMQ job, customer sees success immediately | |

**User's choice:** Immediate + Retry
**Notes:** Immediate central API call. On failure, mark pending_sync and retry later.

| Option | Description | Selected |
|--------|-------------|----------|
| Mark Pending + Retry | Order completed, license pending_sync, retry every 15 min | ✓ |
| Separate Sync Queue | Separate sync_queue table tracks sync status | |

**User's choice:** Mark Pending + Retry
**Notes:** Phase 6 adds the scheduled retry job. Phase 4 stores the sync status.

---

### Invoices and Tax/VAT

| Option | Description | Selected |
|--------|-------------|----------|
| 15% VAT Added | Standard BD 15% on digital services | |
| VAT Included in Price | Prices already include VAT | |
| Skip Tax for Now | No tax, add later | |

**User's choice:** Configurable VAT (inclusive/exclusive)
**Notes:** Admin can set VAT rate and mode (inclusive or exclusive) from admin settings.

| Option | Description | Selected |
|--------|-------------|----------|
| HTML View + PDF Download | Invoice page with PDF via react-pdf/renderer | ✓ |
| HTML View Only | No PDF | |
| Auto-Email PDF | Generate and email PDF automatically | |

**User's choice:** HTML View + PDF Download
**Notes:** react-pdf/renderer for server-side PDF generation.

| Option | Description | Selected |
|--------|-------------|----------|
| Checkout Page Input | Coupon input on checkout page with apply button | ✓ |
| URL Parameter + Manual | Coupon via URL param or manual input | |

**User's choice:** Checkout Page Input
**Notes:** Input field on checkout page below order summary.

---

## Round 2: Additional Details

### Checkout Page Layout

| Option | Description | Selected |
|--------|-------------|----------|
| 2-Column | Left: order summary. Right: payment methods + coupon. | ✓ |
| Single Column Stacked | Summary on top, methods below | |

**User's choice:** 2-Column Layout

### Payment Method Display

| Option | Description | Selected |
|--------|-------------|----------|
| Card Grid Selection | Clickable cards with branded icons/colors | ✓ |
| Dropdown Selection | Select dropdown for payment methods | |

**User's choice:** Card Grid Selection

### Payment Success UX

| Option | Description | Selected |
|--------|-------------|----------|
| Success Page | /dashboard/checkout/success with confirmation details | ✓ |
| Success Modal | Modal on checkout page | |

**User's choice:** Success Page

### Admin Payment Config

| Option | Description | Selected |
|--------|-------------|----------|
| Admin Settings Page | /admin/settings with payment configuration section | ✓ |
| Environment Variables | Env vars for payment account numbers | |

**User's choice:** Admin Settings Page

### VAT Configuration

| Option | Description | Selected |
|--------|-------------|----------|
| DB Config + Env Default | Admin settings, env var as default | |
| Env Vars Only | VAT rate/mode in env vars | |

**User's choice:** Admin settings (via DB)

### PDF Library

| Option | Description | Selected |
|--------|-------------|----------|
| react-pdf/renderer | React-based PDF generation, lighter | ✓ |
| Puppeteer/Playwright | HTML to PDF via headless Chrome | |
| Defer PDF | HTML only for now | |

**User's choice:** react-pdf/renderer

---

### Error and Edge Cases

| Option | Description | Selected |
|--------|-------------|----------|
| Server-Side Dedup | Dedup on payment_ref column, admin checks transaction ID | ✓ |
| Resumable Checkout | Resubmit Payment button on pending orders | |

**User's choice:** Server-Side Dedup

### Refunds

| Option | Description | Selected |
|--------|-------------|----------|
| Admin-Initiated Refund | Admin marks order as refunded from /admin/orders | ✓ |
| Customer Refund Request | Customer requests, admin approves | |

**User's choice:** Admin-Initiated Refund

### Confirmation Email

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, Confirmation Email | Via Resend, includes order details + license key | ✓ |
| No Email | Portal only | |

**User's choice:** Confirmation Email

---

## Claude's Discretion

- SSL Commerce API integration details (session creation, validation, IPN handler)
- Checkout page component structure and state management
- Payment method card styling and icon choices
- Coupon validation logic and error messages
- Invoice PDF template design
- Confirmation email template design
- Admin orders page layout and filtering
- Admin payment settings form design
- Order number format
- Success page content
- VAT calculation precision
- Central API request/response mapping
- Resumable checkout for interrupted sessions

## Deferred Ideas

- Auto-verification of bKash/Nagad payments via their APIs
- Customer refund request flow
- Payment screenshot upload
- Subscription/recurring billing
- Multiple currency support beyond BDT
- License renewal/upgrade flow
- WhatsApp-based order confirmation
- Webhook handlers for central API events (Phase 6)
- Scheduled fallback sync job (Phase 6)
