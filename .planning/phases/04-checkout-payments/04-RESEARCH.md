# Phase 4: Checkout and Payments - Research

**Researched:** 2026-05-17
**Domain:** Payment gateway integration (SSL Commerz), BD manual payments, checkout UX, invoice generation, central licensing API
**Confidence:** HIGH

## Summary

Phase 4 builds the complete checkout and payment system for ConversionFlow. Customers select a pricing plan, choose a Bangladesh payment method (bKash, Nagad, Rocket, Bank Transfer, or SSL Commerce), complete payment, and receive their license. Manual BD payments (bKash/Nagad/Rocket/Bank Transfer) require admin verification via transaction ID. SSL Commerce provides automated card/mobile banking payments via their hosted payment page API v4. The system needs two new database tables (`payment_accounts` for admin-configurable payment details, `settings` for VAT and general config), three new npm packages (`@react-pdf/renderer` for PDF invoices, `sslcommerz` or direct API calls for gateway, `zod` for input validation), and four new environment variables (SSL Commerce credentials + central API credentials).

The database schema already has `orders`, `coupons`, and `licenses` tables with all required columns. Existing server action patterns from support tickets, audit logging, and Resend email patterns are all directly reusable. The `InvoiceTable` component already maps payment methods and status badges. The pricing data already has BDT amounts for all three tiers.

**Primary recommendation:** Use SSL Commerz API v4 directly via fetch (the `sslcommerz` npm package is 4+ years unmaintained). Build checkout as a client component with URL query param for plan selection. Server actions handle order creation, coupon validation, and SSL session initialization. Admin verification is a simple status update flow.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Login required before checkout. Marketing site "Buy Now" buttons redirect to login if not authenticated, then to `/dashboard/checkout?plan=X`. No guest checkout.
- **D-02:** 2-step checkout flow: Step 1 is the marketing/pricing page (plan selection), Step 2 is the checkout page at `/dashboard/checkout?plan=X` with payment method selection, coupon input, order summary, and pay/submit button.
- **D-03:** Checkout page lives at `/dashboard/checkout` within the portal route group -- portal sidebar and header visible during checkout.
- **D-04:** 2-column layout: left column shows order summary card (plan name, base price, VAT, coupon discount, total), right column shows payment method selection, coupon input, and action button.
- **D-05:** Payment methods displayed as a card grid with branded icons/colors (bKash pink, Nagad orange, Rocket purple, SSL Commerce blue, Bank Transfer). Customer clicks a card to select, then sees method-specific instructions and submit button.
- **D-06:** Coupon input field on checkout page, below order summary. Apply button validates code against coupons table and shows discount in real-time. Invalid/expired coupons show inline error message.
- **D-07:** For bKash/Nagad/Rocket/Bank Transfer: customer sees payment instructions (account number, amount, reference) -> sends money externally -> returns to checkout page and enters transaction ID in a text field -> submits -> order created as "pending".
- **D-08:** Transaction ID stored in orders.paymentRef column. No screenshot upload required. Admin verifies by checking transaction ID against their payment account.
- **D-09:** Admin verifies manual payments from a new `/admin/orders` page showing pending orders with transaction details. Admin clicks "Verify & Confirm" to mark as completed, or "Reject" with a reason.
- **D-10:** Admin configures payment account details (bKash numbers, Nagad numbers, Rocket numbers, bank account details) from an admin settings page. Stored in a new `payment_accounts` table or `settings` table.
- **D-11:** Each payment method can have multiple configurable fields: account name, account number, instructions text, and active/inactive toggle. This lets admin update numbers without code changes.
- **D-12:** SSL Commerce hosted payment page integration: create session via their API -> redirect customer to SSL Commerce hosted page -> customer pays -> SSL redirects back with success/fail/cancel -> IPN callback for async confirmation.
- **D-13:** After SSL Commerce payment succeeds: immediately POST to `license.devsroom.com/api/orders/import` with order and customer data. If central API responds successfully, order marked "completed" with central mapping stored. If central API fails, order marked "completed" but license flagged as "pending_sync".
- **D-14:** Failed central API sync: order stays "completed" but license shows "pending_sync". A scheduled retry job (Phase 6 foundation) attempts every 15 minutes. Admin dashboard shows sync failures.
- **D-15:** Admin-configurable VAT via admin settings. Two modes: "inclusive" (VAT built into displayed price) or "exclusive" (VAT added on top). Default: 15% exclusive. Rate and mode stored in admin settings.
- **D-16:** Checkout page shows VAT breakdown in order summary: subtotal, VAT amount, discount, total. Tax amount stored in orders.taxAmount column.
- **D-17:** HTML invoice view on the billing page (already partially built with InvoiceTable). Individual order detail page at `/dashboard/billing/[id]` shows full invoice with line items, VAT breakdown, payment details, and company info.
- **D-18:** PDF download via `@react-pdf/renderer` -- server-side PDF generation from React components. Download button on invoice page. Consistent styling with HTML view.
- **D-19:** Confirmation email sent after successful payment via Resend (already configured). Email includes order details, license key (if generated), and download link.
- **D-20:** Admin-initiated refund from `/admin/orders`. Admin marks order as "refunded" with optional reason. For SSL Commerce, admin processes refund through their merchant dashboard. For manual payments, admin handles externally.
- **D-21:** Server-side dedup on `payment_ref` column to prevent duplicate payments. Same transaction ID can't be used twice.
- **D-22:** If customer closes browser during SSL Commerce redirect, they can return to billing page and see order status. Pending orders show "Complete Payment" button for manual methods, "Check Status" for SSL Commerce.

### Claude's Discretion
- Exact SSL Commerce API integration details (session creation, validation, IPN handler)
- Checkout page component structure and state management
- Payment method card styling and icon choices
- Coupon validation logic and error messages
- Invoice PDF template design (layout, branding, typography)
- Confirmation email template design
- Admin orders page layout and filtering
- Admin payment settings page form design
- Order number format (sequential vs UUID-based)
- Success page animation and content
- VAT calculation precision (rounding rules)
- Central API request/response schema mapping
- Resumable checkout for interrupted sessions

### Deferred Ideas (OUT OF SCOPE)
- Auto-verification of bKash/Nagad payments via their APIs -- deferred, manual verification sufficient for now
- Customer refund request flow -- deferred, admin-initiated is simpler
- Payment screenshot upload -- deferred, transaction ID is sufficient
- Subscription/recurring billing -- deferred, all plans are one-time payments currently
- Multiple currency support beyond BDT -- deferred, all transactions in BDT
- Payment retry for failed SSL Commerce transactions -- customer can start a new checkout
- Partial payment handling -- deferred, all-or-nothing payments only
- License renewal/upgrade flow through checkout -- deferred to future phase
- WhatsApp-based order confirmation -- deferred, email is sufficient
- Order notes/comments between admin and customer -- deferred, support tickets handle this
- Webhook handlers for central API events (license-created/updated/expired) -- deferred to Phase 6
- Scheduled fallback sync job -- deferred to Phase 6 (but Phase 4 stores the sync status)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAY-01 | BD manual payments (bKash, Nagad, Rocket, Bank Transfer) with admin verification workflow | Manual payment flow: customer enters txId -> order created as "pending" -> admin verifies from /admin/orders. paymentMethodEnum already has all 4 methods. Server action pattern from support.ts is directly reusable. |
| PAY-02 | SSL Commerce gateway integration (session creation, redirect, IPN handler, validation) | SSL Commerz API v4: POST to gwprocess/v4/api.php for session, IPN callback to listener, GET validator for validation. Sandbox at sandbox.sslcommerz.com. Custom metadata via value_a/value_d. |
| PAY-03 | Coupon code system (percentage/flat, usage limits, expiry) | `coupons` table already exists with code, type (percentage/flat enum), value, minOrderAmount, maxUses, currentUses, expiresAt, active columns. Validate + increment pattern needed. |
| PAY-04 | Tax/VAT calculation with configurable rates | New `settings` table needed for VAT rate/mode. Two modes: inclusive (built into price) or exclusive (added on top). Default 15% exclusive. orders.taxAmount column already exists. |
| PAY-05 | Invoice generation (HTML view + PDF download) | HTML invoice at /dashboard/billing/[id]. PDF via @react-pdf/renderer v4.5.1 (server-side). InvoiceTable component already maps payment methods and status badges. |
| PAY-06 | Complete purchase flow: payment -> central API -> store mapping -> confirmation | POST to license.devsroom.com/api/orders/import on completion. Store centralOrderId in orders, centralLicenseId in licenses. New env vars: CENTRAL_API_URL, CENTRAL_API_KEY. |
| LIC-01 | POST to license.devsroom.com/api/orders/import on purchase completion | Central API integration. Fetch-based POST with API key auth. Store response mapping. Handle failure with "pending_sync" flag. |
| LIC-02 | Store central_user_id + central_license_id mappings locally | orders.centralOrderId and licenses.centralLicenseId columns already exist in schema. user.centralUserId column already exists. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @react-pdf/renderer | 4.5.1 | Server-side PDF invoice generation | Only React-based PDF renderer; renders PDF from React components on server. Active maintenance (published April 2026). [VERIFIED: npm registry] |
| zod | 4.4.3 | Input validation for checkout forms, coupon codes, order data | Industry standard schema validation for TypeScript. Already in node_modules as transitive dep. [VERIFIED: npm registry] |
| resend | 6.12.3 | Order confirmation emails | Already installed and configured for auth emails. Same pattern extends to order emails. [VERIFIED: package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| nanoid | 5.1.11 | Human-readable order numbers | Generate short unique order IDs like "CF-XXXXXX" for customer-facing display [VERIFIED: package.json] |
| date-fns | 4.1.0 | Date formatting on invoices | Already installed. Use for invoice date formatting. [VERIFIED: package.json] |
| drizzle-orm | 0.45.2 | Database queries for orders, coupons, settings | Already installed. Standard query pattern established. [VERIFIED: package.json] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @react-pdf/renderer | pdfkit | pdfkit is lower-level (imperative API), @react-pdf/renderer lets us use React components which matches project patterns. Tradeoff: @react-pdf/renderer bundles are larger (~2MB) but DX is much better. |
| sslcommerz npm (v1.7.0) | Direct fetch to SSL Commerz API v4 | sslcommerz package unmaintained since June 2021 (4+ years). Direct API calls are more reliable, give full control, and match project's fetch-based patterns. [VERIFIED: npm registry publish date 2021-06-29] |

**Installation:**
```bash
pnpm add @react-pdf/renderer zod
```

**Version verification:**
```
@react-pdf/renderer: 4.5.1 (published 2026-04-15)
zod: 4.4.3 (already in node_modules as transitive dep)
sslcommerz: NOT installing -- using direct API calls instead
resend: 6.12.3 (already installed)
nanoid: 5.1.11 (already installed)
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (portal)/
│   │   └── dashboard/
│   │       ├── checkout/
│   │       │   ├── page.tsx              # Checkout page (client component)
│   │       │   └── success/
│   │       │       └── page.tsx          # Payment success page
│   │       └── billing/
│   │           └── [id]/
│   │               └── page.tsx          # Invoice detail page
│   ├── (admin)/
│   │   └── admin/
│   │       ├── orders/
│   │       │   └── page.tsx              # Admin order management
│   │       └── settings/
│   │           └── page.tsx              # Admin payment + VAT settings
│   └── api/
│       └── ssl-commerz/
│           ├── create-session/
│           │   └── route.ts              # POST: create SSL session
│           ├── success/
│           │   └── route.ts              # GET: SSL success redirect
│           ├── fail/
│           │   └── route.ts              # GET: SSL fail redirect
│           ├── cancel/
│           │   └── route.ts              # GET: SSL cancel redirect
│           └── ipn/
│               └── route.ts              # POST: SSL IPN callback
├── components/
│   ├── checkout/
│   │   ├── OrderSummary.tsx              # Left column: plan, price, VAT, discount, total
│   │   ├── PaymentMethodGrid.tsx         # Right column: payment method card selector
│   │   ├── CouponInput.tsx               # Coupon code input + apply button
│   │   ├── ManualPaymentForm.tsx         # Transaction ID input for manual methods
│   │   └── PaymentInstructions.tsx       # Show payment account details for manual methods
│   ├── invoice/
│   │   ├── InvoicePDF.tsx                # @react-pdf/renderer document component
│   │   └── InvoiceHTML.tsx               # HTML invoice for browser view
│   └── admin/
│       ├── OrdersTable.tsx               # Admin orders list with filters
│       └── PaymentSettingsForm.tsx       # Admin payment account config form
├── lib/
│   ├── ssl-commerz.ts                    # SSL Commerz API client (direct fetch)
│   ├── central-api.ts                    # Central licensing API client
│   └── invoices.ts                       # PDF generation utility
├── data/
│   └── pricing.ts                        # UPDATE: checkoutUrl -> /dashboard/checkout?plan=X
└── app/(portal)/actions/
    ├── checkout.ts                       # Server actions: createOrder, validateCoupon, createSSLSession
    └── admin-orders.ts                   # Server actions: verifyOrder, rejectOrder, issueRefund
```

### Pattern 1: Checkout Page (Client Component with Server Actions)
**What:** Checkout page is a client component that reads `plan` from URL search params, fetches plan details from pricing data, and manages payment method selection state. Server actions handle coupon validation, order creation, and SSL session initialization.
**When to use:** Any page with interactive form state (payment method selection, coupon application, dynamic total calculation).
**Example:**
```typescript
// src/app/(portal)/dashboard/checkout/page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { pricingTiers } from "@/data/pricing";
import { validateCoupon, createManualOrder, initSSLSession } from "../actions/checkout";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan"); // "starter" | "professional" | "agency"
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  // ... render 2-column layout
}
```

### Pattern 2: Server Actions for Checkout Mutations
**What:** Server actions handle all mutations: coupon validation, order creation, SSL session creation. Each action authenticates the user, validates input with zod, performs DB operation, and returns typed result.
**When to use:** Every checkout mutation.
**Example:**
```typescript
// src/app/(portal)/actions/checkout.ts
"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders, coupons } from "@/lib/db/schema";
import { eq, and, gt, lt } from "drizzle-orm";
import { z } from "zod";

const createOrderSchema = z.object({
  plan: z.string(),
  paymentMethod: z.enum(["bkash", "nagad", "rocket", "bank_transfer", "ssl_commerz"]),
  paymentRef: z.string().optional(),
  couponCode: z.string().optional(),
  amount: z.number().int().positive(),
  taxAmount: z.number().int().min(0),
  discountAmount: z.number().int().min(0),
});

export async function createManualOrder(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const raw = {
    plan: formData.get("plan") as string,
    paymentMethod: formData.get("paymentMethod") as string,
    paymentRef: formData.get("paymentRef") as string,
    couponCode: formData.get("couponCode") as string,
    amount: Number(formData.get("amount")),
    taxAmount: Number(formData.get("taxAmount")),
    discountAmount: Number(formData.get("discountAmount")),
  };

  const parsed = createOrderSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid input" };

  // Dedup check (D-21)
  if (raw.paymentRef) {
    const existing = await db.select().from(orders)
      .where(eq(orders.paymentRef, raw.paymentRef));
    if (existing.length > 0) return { error: "Transaction ID already used" };
  }

  const [order] = await db.insert(orders).values({
    userId: session.user.id,
    productId: `conversionflow-${parsed.data.plan.toLowerCase()}`,
    plan: parsed.data.plan,
    amount: parsed.data.amount,
    paymentMethod: parsed.data.paymentMethod,
    paymentRef: parsed.data.paymentRef || null,
    couponCode: parsed.data.couponCode || null,
    discountAmount: parsed.data.discountAmount,
    taxAmount: parsed.data.taxAmount,
    status: "pending",
  }).returning();

  return { success: true, orderId: order.id };
}
```

### Pattern 3: SSL Commerz API Client (Direct Fetch)
**What:** A utility module that wraps SSL Commerz API v4 endpoints using fetch. Handles session creation, payment validation, and IPN verification.
**When to use:** All SSL Commerce interactions.
**Example:**
```typescript
// src/lib/ssl-commerz.ts
// SSL Commerz API v4 - Hosted Payment Page
// Docs: https://developer.sslcommerz.com/

const IS_SANDBOX = process.env.SSL_COMMERZ_SANDBOX === "true";
const BASE_URL = IS_SANDBOX
  ? "https://sandbox.sslcommerz.com"
  : "https://securepay.sslcommerz.com";

interface SSLSessionParams {
  totalAmount: number;      // Amount in BDT (integer)
  currency: "BDT";
  tranId: string;           // Unique transaction ID (our order ID)
  successUrl: string;
  failUrl: string;
  cancelUrl: string;
  ipnUrl: string;
  productName: string;
  productCategory: string;
  cusName: string;
  cusEmail: string;
  cusPhone: string;
  cusAdd1: string;
  cusCity: string;
  cusCountry: "Bangladesh";
  valueA?: string;          // Custom: orderId
  valueB?: string;          // Custom: userId
  valueC?: string;          // Custom: plan
  valueD?: string;          // Custom: couponCode
}

export async function createSSLSession(params: SSLSessionParams) {
  const response = await fetch(`${BASE_URL}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      store_id: process.env.SSL_COMMERZ_STORE_ID!,
      store_passwd: process.env.SSL_COMMERZ_STORE_PASSWORD!,
      ...Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ),
    }),
  });
  return response.json(); // { status: "SUCCESS", sessionkey: "...", GatewayPageURL: "...", ... }
}

export async function validateSSLPayment(valId: string) {
  const response = await fetch(
    `${BASE_URL}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${process.env.SSL_COMMERZ_STORE_ID}&store_passwd=${process.env.SSL_COMMERZ_STORE_PASSWORD}&v=1&format=json`
  );
  return response.json(); // { status: "VALID", ... }
}
```

### Pattern 4: Central Licensing API Client
**What:** Fetch-based client for POST to license.devsroom.com/api/orders/import. Handles auth with API key header.
**When to use:** After order payment completes (SSL Commerce auto or manual admin verify).
**Example:**
```typescript
// src/lib/central-api.ts
// Central Licensing API at license.devsroom.com

const CENTRAL_API_URL = process.env.CENTRAL_API_URL || "https://license.devsroom.com";
const CENTRAL_API_KEY = process.env.CENTRAL_API_KEY;

interface ImportOrderPayload {
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  productId: string;
  plan: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentRef: string | null;
}

interface ImportOrderResponse {
  success: boolean;
  centralOrderId: string;
  centralUserId: string;
  centralLicenseId: string;
  licenseKey: string;
}

export async function importOrderToCentral(payload: ImportOrderPayload): Promise<{
  success: boolean;
  data?: ImportOrderResponse;
  error?: string;
}> {
  try {
    const response = await fetch(`${CENTRAL_API_URL}/api/orders/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CENTRAL_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return { success: false, error: `Central API ${response.status}` };
    }

    const data: ImportOrderResponse = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
```

### Pattern 5: PDF Invoice Generation
**What:** Server-side PDF generation using @react-pdf/renderer. Create a React component describing the invoice layout, render to buffer, and serve as download.
**When to use:** Invoice PDF download endpoint.
**Example:**
```typescript
// src/lib/invoices.ts
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoice/InvoicePDF";

export async function generateInvoicePDF(order: OrderWithUser) {
  const pdfBuffer = await renderToBuffer(
    <InvoicePDF order={order} />
  );
  return pdfBuffer;
}

// Usage in route handler or server action:
// const buffer = await generateInvoicePDF(order);
// Return as Response with Content-Disposition: attachment
```

### Anti-Patterns to Avoid
- **Using sslcommerz npm package:** Unmaintained since 2021. Use direct fetch to SSL Commerz API v4 instead. [VERIFIED: npm registry last publish 2021-06-29]
- **Client-side payment logic:** Never trust client-side price calculations. Always verify plan price, coupon validity, and compute VAT/totals server-side in the server action before creating the order.
- **Generating license keys locally:** Per v2.0 project decision, all licensing is central. Never generate keys locally -- always POST to central API.
- **Storing raw amounts as floats:** orders.amount is integer (BDT in paisa/cents equivalent or just integer taka). Be consistent. Current schema uses integer -- keep it integer.
- **Missing paymentRef dedup (D-21):** Always check for existing paymentRef before creating order. Server-side unique constraint is the safety net.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF generation | Custom PDF builder with pdfkit primitives | @react-pdf/renderer v4.5.1 | React component model matches project patterns. pdfkit requires imperative layout math. |
| Input validation | Manual type checking in server actions | zod v4.4.3 | Schema validation with TypeScript inference. Handles edge cases (coercion, optional, enums). |
| SSL Commerz integration | Custom HMAC/crypto verification | Direct API calls with store_id/store_passwd auth | SSL Commerz API v4 handles crypto on their end. We just validate responses. |
| Payment method display | Hardcoded payment method names | paymentMethodMap from InvoiceTable.tsx | Already exists with all 5 methods mapped to display names. |
| Order ID formatting | UUID for customer-facing display | nanoid-based prefix like "CF-" + 8 chars | UUIDs are unfriendly for customers. Short codes are easier to reference in support. |

**Key insight:** The SSL Commerz API is well-documented and straightforward. The main complexity is not the API itself but the flow: session creation -> redirect -> callback handling -> validation -> central API sync. Each step needs error handling and idempotency.

## Common Pitfalls

### Pitfall 1: SSL Commerz Amount Mismatch
**What goes wrong:** The amount sent to SSL Commerz session creation doesn't match the amount stored in the order.
**Why it happens:** VAT/coupon calculated client-side, then different values sent to SSL vs DB.
**How to avoid:** Compute the final amount ONCE in the server action. Pass that single amount to both SSL session creation and DB insert.
**Warning signs:** Order shows different total than what customer was charged.

### Pitfall 2: Race Condition on Coupon Usage
**What goes wrong:** Two customers apply the same coupon simultaneously, both get the discount, but the coupon's maxUses is exceeded.
**Why it happens:** Check-then-increment without transaction locking.
**How to avoid:** Use a Drizzle transaction: read coupon, validate, increment currentUses, all within `db.transaction()`. Add a database-level check constraint or handle the race in application code.
**Warning signs:** currentUses > maxUses in coupons table.

### Pitfall 3: Missing SSL Commerz IPN Handler
**What goes wrong:** Customer pays successfully but the redirect fails (browser closes, network issue). Order stays "pending" forever.
**Why it happens:** Relying only on the success/fail redirect URLs, not implementing the IPN callback.
**How to avoid:** Always implement the IPN handler at `/api/ssl-commerz/ipn`. SSL Commerz retries IPN delivery. This is the source of truth, not the redirect.
**Warning signs:** Orders stuck in "pending" despite successful payment.

### Pitfall 4: VAT Calculation Rounding
**What goes wrong:** Integer rounding causes 1-2 taka discrepancy between displayed total and stored amount.
**Why it happens:** VAT percentage on integer amounts produces fractional results.
**How to avoid:** Round VAT to nearest integer using `Math.round()` consistently. Store the rounded amount. Document the rounding rule.
**Warning signs:** Customer sees 3,450 on checkout but order stores 3,449 or 3,451.

### Pitfall 5: Central API Failure Leaves Orphaned Order
**What goes wrong:** Payment succeeds but central API sync fails. Customer has paid but has no license.
**Why it happens:** Network issues, central API downtime, incorrect credentials.
**How to avoid:** Store `centralOrderId` and `centralLicenseId` as nullable. Mark order as "completed" but license status as "pending_sync" (D-13, D-14). Phase 6 adds the retry job.
**Warning signs:** Orders with completed status but null centralOrderId.

### Pitfall 6: payment_accounts Table Missing at Checkout Time
**What goes wrong:** Customer reaches checkout but payment instructions show empty fields because admin hasn't configured payment accounts yet.
**Why it happens:** New table with no seed data.
**How to avoid:** Seed default payment accounts in the seed script. Show a fallback message on checkout if no account configured for a method. Admin setup flow should include payment configuration.
**Warning signs:** Empty payment instructions on checkout page.

## Code Examples

### Coupon Validation Server Action
```typescript
// Pattern: Transactional coupon validation with usage increment
"use server";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq, and, gt, lt, sql } from "drizzle-orm";

export async function validateCoupon(code: string, orderAmount: number) {
  const result = await db.transaction(async (tx) => {
    const [coupon] = await tx.select().from(coupons)
      .where(and(
        eq(coupons.code, code),
        eq(coupons.active, true),
      ));

    if (!coupon) return { error: "Invalid coupon code" };
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
      return { error: "Coupon has expired" };
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses)
      return { error: "Coupon usage limit reached" };
    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount)
      return { error: `Minimum order amount is ${coupon.minOrderAmount} BDT` };

    const discount = coupon.type === "percentage"
      ? Math.round(orderAmount * coupon.value / 100)
      : coupon.value;

    return {
      success: true,
      discount: Math.min(discount, orderAmount), // Never discount more than order total
      type: coupon.type,
      value: coupon.value,
    };
  });
  return result;
}
```

### Invoice PDF Component Structure
```typescript
// src/components/invoice/InvoicePDF.tsx
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10 },
  header: { fontSize: 20, marginBottom: 20 },
  // ...
});

export function InvoicePDF({ order }: { order: OrderWithUser }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Invoice</Text>
        <View>
          <Text>Order: {order.id.slice(0, 8)}</Text>
          <Text>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
          <Text>Customer: {order.user.name}</Text>
        </View>
        {/* Line items, VAT breakdown, total */}
      </Page>
    </Document>
  );
}
```

### SSL Commerz IPN Handler
```typescript
// src/app/api/ssl-commerz/ipn/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { validateSSLPayment } from "@/lib/ssl-commerz";
import { importOrderToCentral } from "@/lib/central-api";

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const valId = data.get("val_id") as string;
  const tranId = data.get("tran_id") as string;  // Our order ID
  const status = data.get("status") as string;

  // Validate with SSL Commerz server
  const validation = await validateSSLPayment(valId);
  if (validation.status !== "VALID") {
    return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
  }

  // Update order status
  const [order] = await db.update(orders)
    .set({ status: "completed", paymentRef: validation.bank_tran_id })
    .where(eq(orders.id, tranId))
    .returning();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Sync to central API
  const centralResult = await importOrderToCentral({ /* ... */ });
  if (centralResult.success && centralResult.data) {
    await db.update(orders)
      .set({ centralOrderId: centralResult.data.centralOrderId })
      .where(eq(orders.id, order.id));
    // Create license record with centralLicenseId
  }
  // If central fails, order stays "completed" but no centralOrderId -- pending_sync

  return NextResponse.json({ ok: true });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| sslcommerz npm v1.7.0 | Direct API calls to SSL Commerz v4 | Package last updated 2021-06 | npm wrapper unmaintained; direct API is more reliable and gives full control |
| @react-pdf/renderer v3 | @react-pdf/renderer v4.5.1 | v4 released 2024+ | Better server-side rendering, improved font handling |
| Manual amount validation | Zod schema validation | zod v4 (2025-2026) | Type-safe validation with inference, better error messages |
| UUID order IDs | nanoid-based short codes | - | Better UX for customer-facing order references |

**Deprecated/outdated:**
- `sslcommerz` npm package: Last published June 2021. No updates for 4+ years. Use direct SSL Commerz API v4 calls instead.

## Database Changes Required

### New Tables

Two tables need to be added to `src/lib/db/schema.ts`:

**1. `payment_accounts` table (for D-10, D-11)**
```typescript
export const paymentAccounts = pgTable("payment_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  method: paymentMethodEnum("method").notNull(),
  accountName: text("account_name").notNull(),      // e.g., "DevSroom bKash"
  accountNumber: text("account_number").notNull(),   // e.g., "01712345678"
  instructions: text("instructions"),                 // Custom instructions text
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});
```

**2. `settings` table (for D-15 VAT config, general admin settings)**
```typescript
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),          // e.g., "vat_rate", "vat_mode", "company_name"
  value: text("value").notNull(),          // JSON string for complex values
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});
```

### Schema Migration Required

After adding tables to schema.ts:
```bash
pnpm db:generate   # Generate migration
pnpm db:migrate    # Apply migration
```

### Seed Data Needed

Add to `src/lib/db/seed.ts`:
- Default VAT settings: `vat_rate` = "15", `vat_mode` = "exclusive"
- Default payment accounts for each method (placeholder values)
- Sample coupon codes for testing

## Environment Variables Required

Add to `.env.example` and `.env.local`:

```env
# SSL Commerce (Sandbox for development)
SSL_COMMERZ_STORE_ID=your_store_id
SSL_COMMERZ_STORE_PASSWORD=your_store_password
SSL_COMMERZ_SANDBOX=true

# Central Licensing API
CENTRAL_API_URL=https://license.devsroom.com
CENTRAL_API_KEY=your_central_api_key
```

## Existing Assets to Reuse

| Asset | Location | What to Reuse |
|-------|----------|---------------|
| InvoiceTable | `src/components/portal/InvoiceTable.tsx` | Payment method display map, status badge map, order row type |
| Billing page pattern | `src/app/(portal)/dashboard/billing/page.tsx` | Auth check, role redirect, DB query pattern |
| Server action pattern | `src/app/(portal)/actions/support.ts` | Auth check, form data extraction, enum validation, DB insert |
| Audit logging | `src/lib/audit.ts` | `createAuditLog()` with "order.created", "order.status_changed" actions |
| Email pattern | `src/lib/emails/verification.ts` | Resend `resend.emails.send()` with HTML template |
| ComponentCard | `src/components/common/ComponentCard.tsx` | Card wrapper for checkout sections |
| PageBreadCrumb | `src/components/common/PageBreadCrumb.tsx` | Breadcrumb for checkout/invoice pages |
| Badge | `src/components/ui/badge/Badge.tsx` | Status badges for admin orders |
| Table components | `src/components/ui/table/` | Table structure for admin orders list |
| Form components | `src/components/form/` | InputField, Select for admin settings forms |
| Dashboard layout | `src/app/(portal)/layout.tsx` | Portal sidebar/header wrap for checkout page |
| Pricing data | `src/data/pricing.ts` | Plan names, prices (needs checkoutUrl update) |
| PricingGrid | `src/components/sections/PricingGrid.tsx` | Buy Now buttons (needs URL update to internal route) |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Central API accepts POST to `/api/orders/import` with Bearer token auth and returns `{ centralOrderId, centralUserId, centralLicenseId, licenseKey }` | Pattern 4, PAY-06, LIC-01 | API contract may differ -- planner should stub the client with a TODO to confirm with central API team |
| A2 | SSL Commerz sandbox credentials will be provided before integration testing | Environment Variables | Blocked testing -- use mock mode as fallback |
| A3 | @react-pdf/renderer `renderToBuffer` works in Next.js server components / route handlers without issue | Pattern 5 | May need Node.js canvas polyfill or special webpack config -- planner should verify in first implementation task |
| A4 | VAT applies to the full order amount (not after discount) | D-15, D-16 | Tax calculation may need to be VAT on (amount - discount) instead -- planner should confirm with user |
| A5 | All prices in schema are in integer BDT taka (not paisa/cents) | PAY-04 | If amounts are in paisa, display logic needs /100 everywhere |
| A6 | Central API is not yet available (listed as blocker in STATE.md) | LIC-01, LIC-02 | Integration testing will need to be deferred or use mocks until central API is live |

**Confidence in assumptions:** A1-A3 need confirmation during implementation. A4-A5 need business clarification. A6 is explicitly flagged in STATE.md.

## Open Questions

1. **Central API contract**
   - What we know: It lives at license.devsroom.com, accepts order imports, returns license data
   - What's unclear: Exact request/response schema, auth method, error codes
   - Recommendation: Build a typed client with assumptions, mark all fields as needing verification. Use mock mode for development.

2. **VAT application order**
   - What we know: Two modes (inclusive/exclusive), 15% default
   - What's unclear: Does VAT apply before or after coupon discount? (Standard: VAT on discounted amount)
   - Recommendation: Apply VAT after discount. Clarify in first admin settings implementation.

3. **SSL Commerce sandbox availability**
   - What we know: Sandbox at sandbox.sslcommerz.com, needs store_id and store_passwd
   - What's unclear: Whether sandbox credentials are already obtained
   - Recommendation: Add sandbox mode flag. Support mock mode for development without credentials.

4. **Order number format**
   - What we know: UUID is unfriendly for customers. nanoid is installed.
   - What's unclear: Exact format preferences
   - Recommendation: Use "CF-" prefix + 8-char nanoid (e.g., "CF-a1B2c3D4"). Store in orders.id (UUID) separately from display ID.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL | Order storage, coupons, settings | Yes | 17 (port 5434) | -- |
| Redis | Session cache (optional) | Yes | (port 6381) | In-memory Map fallback |
| Node.js | Runtime | Yes | -- | -- |
| pnpm | Package manager | Yes | -- | -- |
| SSL Commerz API | Payment gateway | Needs credentials | -- | Mock mode for dev |
| Central Licensing API | License sync | Not yet available | -- | Mock mode for dev |
| Resend | Order confirmation emails | Yes | 6.12.3 | -- |

**Missing dependencies with no fallback:**
- SSL Commerce credentials: Needed for payment testing. Sandbox credentials should be obtained before integration testing. Development can proceed with mock mode.
- Central API availability: Listed as blocker in STATE.md. Development proceeds with stub/mock; integration testing deferred.

**Missing dependencies with fallback:**
- SSL Commerz sandbox: Can use a mock SSL client that returns success responses during development.
- Central API: Can use a mock client that returns dummy license keys during development.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- Wave 0 install needed |
| Config file | None -- Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` (after install) |
| Full suite command | `npx vitest run` (after install) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAY-01 | Manual order created with status "pending" | unit | `npx vitest run tests/checkout/` | No -- Wave 0 |
| PAY-02 | SSL session creation returns GatewayPageURL | unit | `npx vitest run tests/ssl-commerz/` | No -- Wave 0 |
| PAY-03 | Coupon validation: valid, expired, limit reached, below minimum | unit | `npx vitest run tests/coupons/` | No -- Wave 0 |
| PAY-04 | VAT calculation: exclusive mode, inclusive mode, rounding | unit | `npx vitest run tests/vat/` | No -- Wave 0 |
| PAY-05 | PDF invoice generated without error | unit | `npx vitest run tests/invoice/` | No -- Wave 0 |
| PAY-06 | Central API sync on order completion | unit | `npx vitest run tests/central-api/` | No -- Wave 0 |
| LIC-01 | POST to central API with correct payload | unit | `npx vitest run tests/central-api/` | No -- Wave 0 |
| LIC-02 | centralOrderId + centralLicenseId stored locally | unit | `npx vitest run tests/central-api/` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] Test framework install: `pnpm add -D vitest @testing-library/react`
- [ ] `vitest.config.ts` -- configure path aliases, environment
- [ ] `tests/checkout/create-order.test.ts` -- covers PAY-01
- [ ] `tests/ssl-commerz/session.test.ts` -- covers PAY-02
- [ ] `tests/coupons/validate.test.ts` -- covers PAY-03
- [ ] `tests/vat/calculate.test.ts` -- covers PAY-04
- [ ] `tests/invoice/pdf.test.ts` -- covers PAY-05
- [ ] `tests/central-api/sync.test.ts` -- covers PAY-06, LIC-01, LIC-02

*(Note: Previous phases completed without test infrastructure. Planner should evaluate whether installing vitest now is in scope or whether manual verification through UAT is sufficient, consistent with prior phases.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Better Auth session check in all server actions |
| V3 Session Management | yes | Better Auth + Redis sessions |
| V4 Access Control | yes | Role-based: customer can only create orders for themselves; admin-only for verify/reject/refund |
| V5 Input Validation | yes | zod schemas for all form inputs (plan, paymentMethod, couponCode, transactionId, amounts) |
| V6 Cryptography | yes | SSL Commerz API uses HTTPS + verify_sign; env vars for secrets |
| V9 Communication Security | yes | HTTPS for SSL Commerz API and central API calls |

### Known Threat Patterns for Payment Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Price manipulation (client sends wrong amount) | Tampering | Server-side price computation from plan data, never trust client amount |
| Duplicate payment (same transaction ID used twice) | Tampering | Server-side dedup on paymentRef (D-21); unique constraint in DB |
| Coupon abuse (reuse expired/exhausted coupons) | Tampering | Transactional coupon validation with currentUses check |
| IDOR on orders (view other user's order) | Information Disclosure | Filter by session.user.id in all portal queries (established Phase 3 pattern) |
| Admin action spoofing | Elevation of Privilege | Role check in admin server actions; audit log all admin mutations |
| SSL Commerz callback forgery | Tampering | Validate via server-to-server call (val_id -> SSL validation API), never trust redirect data alone |
| CSRF on checkout server actions | Tampering | Next.js server actions have built-in CSRF protection via Origin header check |

## Sources

### Primary (HIGH confidence)
- npm registry -- package version verification for @react-pdf/renderer (4.5.1), zod (4.4.3), sslcommerz (1.7.0, last publish 2021-06-29), resend (6.12.3), nanoid (5.1.11)
- SSL Commerz API v4 documentation (developer.sslcommerz.com) -- session creation, IPN, validation endpoints, parameter reference
- `src/lib/db/schema.ts` -- verified all existing tables, columns, enums, relations
- `src/lib/audit.ts` -- verified AuditAction type includes order/license actions
- `src/data/pricing.ts` -- verified 3 tiers with BDT prices, checkoutUrl needs update

### Secondary (MEDIUM confidence)
- `src/app/(portal)/actions/support.ts` -- server action pattern for reuse
- `src/lib/emails/verification.ts` -- Resend email pattern for reuse
- `src/components/portal/InvoiceTable.tsx` -- payment method map, status badge map for reuse

### Tertiary (LOW confidence)
- Central Licensing API contract (A1) -- assumed based on CONTEXT.md description; not verified against actual API

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions verified against npm registry, packages chosen are well-established
- Architecture: HIGH - follows established project patterns from Phases 1-3, SSL Commerz API documented
- Pitfalls: HIGH - common payment integration issues well-documented in developer community
- SSL Commerz integration: MEDIUM - API documented but not tested against live/sandbox endpoint
- Central API: LOW - contract assumed, not verified against live service

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (30 days -- stable stack, SSL Commerz API is mature)
