# Phase 4: Checkout and Payments - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the complete checkout and payment system: customers select a plan, choose a Bangladesh payment method (bKash, Nagad, Rocket, Bank Transfer, SSL Commerce), complete payment, and receive their license. Manual BD payments require admin verification. SSL Commerce handles automated card/mobile banking payments. Coupons, configurable VAT, invoice generation (HTML + PDF), and central licensing API sync are all in scope. Admin gets order management and payment configuration pages.

</domain>

<decisions>
## Implementation Decisions

### Checkout Flow & Entry Points
- **D-01:** Login required before checkout. Marketing site "Buy Now" buttons redirect to login if not authenticated, then to `/dashboard/checkout?plan=X`. No guest checkout.
- **D-02:** 2-step checkout flow: Step 1 is the marketing/pricing page (plan selection), Step 2 is the checkout page at `/dashboard/checkout?plan=X` with payment method selection, coupon input, order summary, and pay/submit button.
- **D-03:** Checkout page lives at `/dashboard/checkout` within the portal route group — portal sidebar and header visible during checkout.

### Checkout Page Design
- **D-04:** 2-column layout: left column shows order summary card (plan name, base price, VAT, coupon discount, total), right column shows payment method selection, coupon input, and action button.
- **D-05:** Payment methods displayed as a card grid with branded icons/colors (bKash pink, Nagad orange, Rocket purple, SSL Commerce blue, Bank Transfer). Customer clicks a card to select, then sees method-specific instructions and submit button.
- **D-06:** Coupon input field on checkout page, below order summary. Apply button validates code against coupons table and shows discount in real-time. Invalid/expired coupons show inline error message.

### Manual BD Payment Flow
- **D-07:** For bKash/Nagad/Rocket/Bank Transfer: customer sees payment instructions (account number, amount, reference) → sends money externally → returns to checkout page and enters transaction ID in a text field → submits → order created as "pending".
- **D-08:** Transaction ID stored in orders.paymentRef column. No screenshot upload required. Admin verifies by checking transaction ID against their payment account.
- **D-09:** Admin verifies manual payments from a new `/admin/orders` page showing pending orders with transaction details. Admin clicks "Verify & Confirm" to mark as completed, or "Reject" with a reason.

### Payment Account Configuration
- **D-10:** Admin configures payment account details (bKash numbers, Nagad numbers, Rocket numbers, bank account details) from an admin settings page. Stored in a new `payment_accounts` table or `settings` table.
- **D-11:** Each payment method can have multiple configurable fields: account name, account number, instructions text, and active/inactive toggle. This lets admin update numbers without code changes.

### SSL Commerce Integration
- **D-12:** SSL Commerce hosted payment page integration: create session via their API → redirect customer to SSL Commerce hosted page → customer pays → SSL redirects back with success/fail/cancel → IPN callback for async confirmation.
- **D-13:** After SSL Commerce payment succeeds: immediately POST to `license.devsroom.com/api/orders/import` with order and customer data. If central API responds successfully, order marked "completed" with central mapping stored. If central API fails, order marked "completed" but license flagged as "pending_sync".
- **D-14:** Failed central API sync: order stays "completed" but license shows "pending_sync". A scheduled retry job (Phase 6 foundation) attempts every 15 minutes. Admin dashboard shows sync failures.

### Tax/VAT
- **D-15:** Admin-configurable VAT via admin settings. Two modes: "inclusive" (VAT built into displayed price) or "exclusive" (VAT added on top). Default: 15% exclusive. Rate and mode stored in admin settings.
- **D-16:** Checkout page shows VAT breakdown in order summary: subtotal, VAT amount, discount, total. Tax amount stored in orders.taxAmount column.

### Invoice Generation
- **D-17:** HTML invoice view on the billing page (already partially built with InvoiceTable). Individual order detail page at `/dashboard/billing/[id]` shows full invoice with line items, VAT breakdown, payment details, and company info.
- **D-18:** PDF download via `@react-pdf/renderer` — server-side PDF generation from React components. Download button on invoice page. Consistent styling with HTML view.
- **D-19:** Confirmation email sent after successful payment via Resend (already configured). Email includes order details, license key (if generated), and download link.

### Refunds
- **D-20:** Admin-initiated refund from `/admin/orders`. Admin marks order as "refunded" with optional reason. For SSL Commerce, admin processes refund through their merchant dashboard. For manual payments, admin handles externally.

### Error Handling
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Planning
- `.planning/ROADMAP.md` — Phase 4 goal, requirements (PAY-01 through PAY-06, LIC-01, LIC-02), success criteria
- `.planning/REQUIREMENTS.md` — PAY-01 through PAY-06, LIC-01, LIC-02 acceptance criteria
- `.planning/PROJECT.md` — Constraints (pnpm only, Next.js 16, proxy.ts, TailwindCSS v4 CSS-first), key decisions, central licensing rule
- `.planning/STATE.md` — Current progress, accumulated decisions, blockers/concerns

### Prior Phase Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Phase 1 decisions (schema, auth, routes, phone field for payments)
- `.planning/phases/02-homepage/02-CONTEXT.md` — Phase 2 decisions (dashboard shell, sidebar, header)
- `.planning/phases/03-customer-portal/03-CONTEXT.md` — Phase 3 decisions (portal pages, InvoiceTable, billing page)

### Database Schema
- `src/lib/db/schema.ts` — Full schema: orders table (paymentMethod enum, couponCode, discountAmount, taxAmount, centralOrderId), coupons table (percentage/flat, usage limits, expiry), licenses table (orderId FK, centralLicenseId), user table (phone, centralUserId)

### Existing Components to Reuse/Extend
- `src/components/portal/InvoiceTable.tsx` — Order display with payment method mapping and status badges
- `src/app/(portal)/dashboard/billing/page.tsx` — Billing page with order history query pattern
- `src/data/pricing.ts` — 3 pricing tiers (Starter $18/yr, Professional $28/2yr, Agency $75/lifetime) with USD/BDT prices
- `src/components/sections/PricingGrid.tsx` — Marketing site pricing cards (update checkoutUrl to portal checkout)
- `src/components/common/ComponentCard.tsx` — Card wrapper for checkout sections
- `src/components/common/PageBreadCrumb.tsx` — Breadcrumb navigation
- `src/components/ui/badge/Badge.tsx` — Status badges for orders
- `src/components/ui/table/` — Table components for admin orders page
- `src/components/form/` — Form components (InputField, Select, etc.) from TailAdmin

### Dashboard Template
- `backenddashboard/src/components/ecommerce/` — Ecommerce metrics and order components for reference
- `backenddashboard/src/components/tables/` — Table patterns for admin order management

### Auth & Email
- `src/lib/auth.ts` — Better Auth server instance (session access for user info)
- `src/lib/auth-client.ts` — Auth client (useSession, signOut)
- `src/lib/emails/` — Email template patterns (extend for order confirmation)
- `src/lib/audit.ts` — Audit logging for admin actions

### Environment & Config
- `.env.example` — Current env vars (DATABASE_URL, REDIS_URL, BETTER_AUTH_SECRET, RESEND_API_KEY)
- `docker-compose.yml` — PostgreSQL 17 (port 5434), Redis (port 6381)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **InvoiceTable** (`src/components/portal/InvoiceTable.tsx`): Already maps payment methods to display names (bKash, Nagad, Rocket, Bank Transfer, SSL Commerce) and shows status badges (completed, pending, failed, refunded)
- **Pricing data** (`src/data/pricing.ts`): 3 tiers with USD/BDT prices, checkoutUrl, and WhatsApp message text
- **PricingGrid** (`src/components/sections/PricingGrid.tsx`): Marketing site pricing — needs checkoutUrl updated from external to internal portal route
- **ComponentCard, PageBreadCrumb, Badge, Table** — All reusable for checkout and admin pages
- **Form components** (`src/components/form/`): InputField, Select, TextArea, FileInput, DropZone from TailAdmin — ready for checkout form
- **Email templates** (`src/lib/emails/`): Pattern for Resend-based transactional emails — extend for order confirmation
- **Resend** (`RESEND_API_KEY`): Already configured and sending auth emails
- **Audit logging** (`src/lib/audit.ts`): Pattern for logging admin mutations — use for order verification, refund actions

### Database Schema (Ready to Use)
- **orders**: All columns present — id (UUID), userId, centralOrderId, productId, plan, amount (integer, BDT), currency, paymentMethod (enum), paymentRef, status (enum), couponCode, discountAmount, taxAmount, timestamps
- **coupons**: code (unique), type (percentage/flat), value (integer), minOrderAmount, maxUses, currentUses, expiresAt, active
- **licenses**: orderId FK, centralLicenseId — ready for linking purchase to license
- **user**: phone (for payment verification), centralUserId (for central API mapping)

### Established Patterns
- Server components by default, `"use client"` only for interactivity
- Drizzle ORM for DB queries — `src/lib/db/schema.ts` has all table definitions
- Server actions at `(portal)/actions/` for mutations
- Portal pages under `(portal)/dashboard/` (not `(portal)/` directly — route collision fix from Phase 3)
- Admin pages under `(admin)/admin/`
- SessionUser type cast for Better Auth additionalFields (role)
- TailwindCSS v4 CSS-first — dashboard.css tokens for dashboard styling

### Integration Points
- `(portal)/dashboard/checkout/page.tsx` — New checkout page
- `(portal)/dashboard/checkout/success/page.tsx` — New success page
- `(portal)/dashboard/billing/[id]/page.tsx` — New invoice detail page
- `(admin)/admin/orders/page.tsx` — New admin orders management page
- `(admin)/admin/settings/page.tsx` — New admin settings page (or extend existing)
- `src/app/api/ssl-commerz/` — New API routes for SSL Commerce session creation and IPN handler
- `src/app/api/webhooks/license/` — New webhook route for central API callbacks (Phase 6, but route can be stubbed)
- `src/data/pricing.ts` — Update checkoutUrl values to point to `/dashboard/checkout?plan=X`
- `src/components/sections/PricingGrid.tsx` — Update Buy Now links

</code_context>

<specifics>
## Specific Ideas

- Payment method cards should use brand colors: bKash (#E2136E pink), Nagad (#F6921E orange), Rocket (#8C3494 purple), SSL Commerce (#1A5F9E blue), Bank Transfer (gray)
- Order summary should show: plan name, base price, coupon discount (if applied), VAT amount, total — similar to a receipt
- Manual payment instructions should include: payment number, exact amount to send, a reference note (like order ID prefix) for the customer to include
- Success page should show: order confirmation number, plan details, payment status (completed for SSL Commerce, pending for manual), and next steps
- Admin orders page should have filters: by status (pending/completed/failed/refunded), by payment method, date range
- Invoice PDF should include: ConversionFlow logo, company info, invoice number, date, customer info, line items, VAT breakdown, total, payment method

</specifics>

<deferred>
## Deferred Ideas

- Auto-verification of bKash/Nagad payments via their APIs — deferred, manual verification sufficient for now
- Customer refund request flow — deferred, admin-initiated is simpler
- Payment screenshot upload — deferred, transaction ID is sufficient
- Subscription/recurring billing — deferred, all plans are one-time payments currently
- Multiple currency support beyond BDT — deferred, all transactions in BDT
- Payment retry for failed SSL Commerce transactions — customer can start a new checkout
- Partial payment handling — deferred, all-or-nothing payments only
- License renewal/upgrade flow through checkout — deferred to future phase
- WhatsApp-based order confirmation — deferred, email is sufficient
- Order notes/comments between admin and customer — deferred, support tickets handle this
- Webhook handlers for central API events (license-created/updated/expired) — deferred to Phase 6
- Scheduled fallback sync job — deferred to Phase 6 (but Phase 4 stores the sync status)

</deferred>

---

*Phase: 04-checkout-payments*
*Context gathered: 2026-05-17*
