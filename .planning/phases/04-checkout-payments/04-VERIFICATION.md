---
phase: 04-checkout-payments
verified: 2026-05-17T22:00:00Z
status: human_needed
score: 6/6 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Complete checkout flow: navigate /pricing, click Buy Now, verify redirect to /dashboard/checkout?plan=X, select payment method, fill form, submit"
    expected: "Checkout page renders with 2-column layout, plan details, payment method grid with 5 methods, and coupon input"
    why_human: "Multi-page browser interaction with form submission and conditional rendering requires visual verification"
  - test: "SSL Commerce payment: select SSL Commerce method, click 'Pay with SSL Commerce', verify redirect to gateway page"
    expected: "Button creates session via /api/ssl-commerz/create-session and redirects to external SSL Commerz hosted payment page"
    why_human: "External payment gateway integration requires live SSL Commerz sandbox credentials and browser redirect testing"
  - test: "Manual payment: select bKash/Nagad/Rocket/Bank Transfer, verify payment instructions display, enter transaction ID, submit"
    expected: "Payment instructions show account details with click-to-copy, form accepts min 4 char transaction ID, creates pending order, redirects to success page with 'Payment Submitted' message"
    why_human: "Full form interaction flow with conditional rendering based on payment method selection"
  - test: "Admin order verification: login as admin, navigate /admin/orders, click 'Verify & Confirm' on pending order"
    expected: "Order status changes to completed, central API sync triggers, license key created, confirmation email sent"
    why_human: "Multi-role workflow crossing customer and admin sessions with server-side side effects"
  - test: "Invoice HTML view and PDF download: navigate to /dashboard/billing/[id], click 'Download PDF'"
    expected: "Invoice renders with company info, customer info, line items, VAT, discount, total, payment details. PDF downloads with matching content"
    why_human: "Visual verification of invoice layout and PDF generation quality"
  - test: "Coupon validation: enter valid coupon (LAUNCH20), expired coupon, limit-reached coupon"
    expected: "Valid coupon shows discount in order summary. Invalid coupons show specific error messages matching UI-SPEC"
    why_human: "Form interaction with multiple error states requires visual verification of messaging"
---

# Phase 4: Checkout and Payments Verification Report

**Phase Goal:** Customers can complete a purchase using Bangladesh payment methods (bKash, Nagad, Rocket, Bank Transfer) or SSL Commerce gateway, with coupon codes, tax/VAT calculation, and invoice generation. The purchase flow syncs with the central licensing API.
**Verified:** 2026-05-17T22:00:00Z
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Customer can select a plan, choose a payment method (bKash/Nagad/Rocket/Bank Transfer/SSL Commerce), and initiate checkout | VERIFIED | Checkout page reads plan from URL param (`useSearchParams`), PaymentMethodGrid renders 5 methods with brand colors (#E2136E, #F6921E, #8C3494, #1A5F9E), pricing.ts checkoutUrl points to `/dashboard/checkout?plan=X` |
| 2 | SSL Commerce gateway redirects customer to payment page and back to the site with order confirmation on success | VERIFIED | `create-session/route.ts` calls `createSSLSession()` returning GatewayPageURL; `success/route.ts` redirects to `/dashboard/checkout/success?order=X&status=completed`; IPN handler validates server-to-server |
| 3 | Manual BD payments (bKash, Nagad, Rocket, Bank Transfer) create a pending order that admin can verify and confirm | VERIFIED | `createManualOrder` inserts with status "pending"; admin `verifyOrder` updates to "completed" + syncs central API + creates license; OrdersTable has "Verify & Confirm" button for pending orders |
| 4 | Customer can apply a coupon code and see the discounted price before payment | VERIFIED | CouponInput component calls `validateCoupon` server action; `validateCoupon` uses `db.transaction()` for race safety, checks expiry/usage/minimum; discount reflected in OrderSummary with green text |
| 5 | Customer receives an invoice (HTML view + PDF download) after successful payment | VERIFIED | InvoiceHTML renders full invoice with line items/VAT/discount/total; InvoicePDF generates A4 PDF via @react-pdf/renderer; PDF route at `/api/invoices/[id]/pdf` with auth+ownership check; InvoiceTable links to `/dashboard/billing/[id]` |
| 6 | Successful payment triggers a POST to license.devsroom.com/api/orders/import and stores the central_user_id + central_license_id mapping locally | VERIFIED | IPN handler calls `importOrderToCentral()` (or `mockImportOrderToCentral` fallback); on success: updates `order.centralOrderId`, `user.centralUserId`, creates license with `centralLicenseId`; admin verify action has identical sync logic |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `src/lib/db/schema.ts` | paymentAccounts + settings tables | VERIFIED | Lines 269-293: `paymentAccounts` table with method, accountName, accountNumber, bankName, branch, routingNumber, instructions, active. `settings` table with key (PK), value, updatedAt |
| `src/app/(portal)/actions/checkout.ts` | 4 server actions (validateCoupon, createManualOrder, calculateVAT, getPaymentAccounts) | VERIFIED | 305 lines. All 4 actions exported. `validateCoupon` uses `db.transaction()`, `createManualOrder` has dedup check + PLAN_PRICES server validation, `calculateVAT` reads settings table, `getOrderDetails` added for success page |
| `.env.example` | SSL Commerce + Central API env vars | VERIFIED | SSL_COMMERZ_STORE_ID, SSL_COMMERZ_STORE_PASSWORD, SSL_COMMERZ_SANDBOX, CENTRAL_API_URL, CENTRAL_API_KEY all present |
| `src/lib/ssl-commerz.ts` | SSL Commerz API client | VERIFIED | 157 lines. `createSSLSession` POSTs to gwprocess/v4/api.php, `validateSSLPayment` GETs validationserverAPI.php. Sandbox/production URL switching |
| `src/lib/central-api.ts` | Central licensing API client | VERIFIED | 124 lines. `importOrderToCentral` with Bearer token auth, `mockImportOrderToCentral` with nanoid license keys. Imports from /api/orders/import |
| `src/app/api/ssl-commerz/create-session/route.ts` | POST handler for SSL session | VERIFIED | 151 lines. Auth check, server-side price from PLAN_PRICES_BDT, creates pending order, calls createSSLSession, returns GatewayPageURL |
| `src/app/api/ssl-commerz/ipn/route.ts` | IPN handler | VERIFIED | 210 lines. Reads form data, calls validateSSLPayment, idempotency check, marks completed, syncs central API, creates license, sends confirmation email |
| `src/app/api/ssl-commerz/success/route.ts` | Success redirect | VERIFIED | Redirects to `/dashboard/checkout/success?order=X&status=completed`. Does NOT mark completed (IPN's job) |
| `src/app/api/ssl-commerz/fail/route.ts` | Fail redirect | VERIFIED | Redirects with status=failed |
| `src/app/api/ssl-commerz/cancel/route.ts` | Cancel redirect | VERIFIED | Redirects back to checkout preserving plan selection |
| `src/components/checkout/OrderSummary.tsx` | Price breakdown card | VERIFIED | 2684 bytes. Renders plan name, base price, VAT, discount, total with dashed separator |
| `src/components/checkout/PaymentMethodGrid.tsx` | Payment method card selector | VERIFIED | 2941 bytes. 5 methods with brand colors, grid-cols-3/2, selection/hover states |
| `src/components/checkout/CouponInput.tsx` | Coupon apply/remove | VERIFIED | 3072 bytes. Apply/Remove states, loading spinner, error display |
| `src/components/checkout/ManualPaymentForm.tsx` | Transaction ID form | VERIFIED | 2263 bytes. Min 4 char validation, submit spinner |
| `src/components/checkout/PaymentInstructions.tsx` | Payment account details | VERIFIED | 4809 bytes. Account details with click-to-copy, bank fields |
| `src/app/(portal)/dashboard/checkout/page.tsx` | Checkout page | VERIFIED | 12100 bytes. useSearchParams for plan, 2-column layout, state machine for selectedMethod, calls validateCoupon/createManualOrder/create-session |
| `src/app/(portal)/dashboard/checkout/success/page.tsx` | Success page | VERIFIED | 7112 bytes. Shows order details, contextual messaging (completed vs pending), "Go to Billing" + "Go to Dashboard" CTAs |
| `src/app/(admin)/actions/admin-orders.ts` | Admin order actions | VERIFIED | 8642 bytes. `verifyOrder` (complete + central sync + license + email), `rejectOrder` (fail with reason), `issueRefund` (refund + revoke license). Admin role guard |
| `src/app/(admin)/actions/admin-settings.ts` | Admin settings actions | VERIFIED | 6561 bytes. `savePaymentAccount` (upsert), `saveVATSettings` (upsert), `getPaymentSettings`. Admin role guard |
| `src/components/admin/OrdersTable.tsx` | Admin orders table | VERIFIED | 15194 bytes. Status/method filters, action buttons per status, reject/refund modals |
| `src/components/admin/PaymentSettingsForm.tsx` | Payment settings form | VERIFIED | 13368 bytes. VAT rate/mode config, 5 method cards, active toggles, "Save All Settings" |
| `src/app/(admin)/admin/orders/page.tsx` | Admin orders page | VERIFIED | 2237 bytes. Auth + role check, orders with user join, renders OrdersTable |
| `src/app/(admin)/admin/settings/page.tsx` | Admin settings page | VERIFIED | 1506 bytes. Auth + role check, calls getPaymentSettings, renders PaymentSettingsForm |
| `src/components/invoice/InvoiceHTML.tsx` | HTML invoice component | VERIFIED | 8380 bytes. INVOICE header, Bill To + Company, line items table, VAT, discount, total, payment details, Download PDF link |
| `src/components/invoice/InvoicePDF.tsx` | PDF invoice component | VERIFIED | 7691 bytes. @react-pdf/renderer Document with A4 page, matching layout to HTML version |
| `src/lib/invoices.tsx` | PDF generation utility | VERIFIED | 440 bytes. `generateInvoicePDF` wraps `renderToBuffer(<InvoicePDF />)`, exports OrderWithUser type |
| `src/app/api/invoices/[id]/pdf/route.ts` | PDF download API route | VERIFIED | 3309 bytes. Auth check, userId ownership verification + admin override, returns application/pdf with Content-Disposition |
| `src/app/(portal)/dashboard/billing/[id]/page.tsx` | Invoice detail page | VERIFIED | 4611 bytes. Server component, auth + ownership filter, renders InvoiceHTML, shows license key card |
| `src/lib/emails/order-confirmation.ts` | Order confirmation email | VERIFIED | 5548 bytes. Resend-based, branded HTML template, conditional license key display, status-dependent messaging |
| `src/data/pricing.ts` | Updated checkoutUrl values | VERIFIED | All 3 tiers point to `/dashboard/checkout?plan=starter|professional|agency`. No checkout.conversionflow.com references |
| `src/lib/db/seed.ts` | Seed data | VERIFIED | Seeds vat_rate/vat_mode settings, 5 inactive payment account placeholders, LAUNCH20 coupon |
| `scripts/seed-phase4.ts` | Standalone Phase 4 seed | VERIFIED | Separate seed script for Phase 4 data |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| checkout/page.tsx | actions/checkout.ts | validateCoupon, calculateVAT, createManualOrder, getPaymentAccounts | WIRED | Imports all 4 actions, calls them from handlers |
| checkout/page.tsx | ssl-commerz/create-session | fetch POST | WIRED | `fetch("/api/ssl-commerz/create-session", { method: "POST" })` with JSON body |
| ipn/route.ts | ssl-commerz.ts | validateSSLPayment | WIRED | Line 6: `import { validateSSLPayment }`, called at line 42 |
| ipn/route.ts | central-api.ts | importOrderToCentral/mockImportOrderToCentral | WIRED | Lines 7-9: imports both, calls based on CENTRAL_API_KEY presence |
| ipn/route.ts | emails/order-confirmation.ts | sendOrderConfirmationEmail | WIRED | Line 11: import, called at line 187 wrapped in try/catch |
| admin-orders.ts | central-api.ts | importOrderToCentral | WIRED | Line 14: import, called in verifyOrder after marking completed |
| admin-orders.ts | emails/order-confirmation.ts | sendOrderConfirmationEmail | WIRED | Line 16: import, called in verifyOrder wrapped in try/catch |
| admin/orders/page.tsx | actions/admin-orders.ts | verifyOrder, rejectOrder, issueRefund | WIRED | Imports all 3 actions, passes to OrdersTable as props |
| admin/settings/page.tsx | actions/admin-settings.ts | getPaymentSettings | WIRED | Imports and calls getPaymentSettings for initial data |
| billing/[id]/page.tsx | InvoiceHTML.tsx | Component render | WIRED | Line 9: imports InvoiceHTML, renders at line 126 |
| invoices/[id]/pdf/route.ts | invoices.tsx | generateInvoicePDF | WIRED | Line 6: imports generateInvoicePDF, calls at line 93 |
| invoices.tsx | InvoicePDF.tsx | renderToBuffer | WIRED | Line 3: imports InvoicePDF, passes to renderToBuffer |
| InvoiceTable.tsx | billing/[id] page | Link component | WIRED | Line 115: `<Link href={"/dashboard/billing/${order.id}"}>` |
| pricing.ts | checkout page | checkoutUrl on Buy Now buttons | WIRED | checkoutUrl set to `/dashboard/checkout?plan=X` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| checkout/page.tsx | basePrice | planPrices map (starter=2150, professional=3000, agency=8000) | Yes -- hardcoded authoritative map matching server-side | FLOWING |
| checkout/page.tsx | vatInfo | calculateVAT server action -> settings table | Yes -- reads from DB settings (vat_rate, vat_mode) | FLOWING |
| checkout/page.tsx | paymentAccounts | getPaymentAccounts server action -> paymentAccounts table | Yes -- reads from DB, filtered by active=true | FLOWING |
| checkout/page.tsx | appliedCoupon | validateCoupon server action -> coupons table | Yes -- transactional query + increment | FLOWING |
| ipn/route.ts | centralResult | importOrderToCentral/mockImportOrderToCentral | Yes -- calls external API or mock fallback | FLOWING |
| billing/[id]/page.tsx | order | DB query orders+user join | Yes -- real DB query with user-scoped filter | FLOWING |
| billing/[id]/page.tsx | license | DB query licenses by orderId | Yes -- real DB query | FLOWING |
| invoices/[id]/pdf/route.ts | pdfBuffer | generateInvoicePDF -> renderToBuffer | Yes -- generates real PDF from order data | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| TypeScript compilation | `npx tsc --noEmit` | Exit code 0, no errors | PASS |
| Module export check: createManualOrder | `node -e "require('./src/app/(portal)/actions/checkout.ts')"` | N/A (server action, not importable via node) | SKIP |
| All checkout components exist | `ls src/components/checkout/` | 5 .tsx files found | PASS |
| All SSL route handlers exist | `ls src/app/api/ssl-commerz/` | 5 directories found (create-session, success, fail, cancel, ipn) | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ---------- | ----------- | ------ | -------- |
| PAY-01 | 04-01, 04-03, 04-04 | BD manual payments with admin verification workflow | SATISFIED | Manual payment form creates pending order; admin verifyOrder completes + syncs; OrdersTable has Verify & Confirm button |
| PAY-02 | 04-02, 04-03 | SSL Commerce gateway integration | SATISFIED | ssl-commerz.ts client, 5 API routes, create-session returns GatewayPageURL, IPN validates server-to-server |
| PAY-03 | 04-01, 04-03 | Coupon code system | SATISFIED | validateCoupon in db.transaction(), checks expiry/usage/min amount, UI shows discount |
| PAY-04 | 04-01, 04-04 | Tax/VAT calculation | SATISFIED | calculateVAT reads from settings table, exclusive/inclusive modes, admin settings page for configuration |
| PAY-05 | 04-05 | Invoice generation (HTML + PDF) | SATISFIED | InvoiceHTML renders full invoice, InvoicePDF via @react-pdf/renderer, PDF download route |
| PAY-06 | 04-02, 04-05, 04-06 | Complete purchase flow | SATISFIED | IPN handler: payment -> central API sync -> store mapping -> confirmation email; admin verify has identical flow |
| LIC-01 | 04-02, 04-04 | POST to license.devsroom.com/api/orders/import | SATISFIED | importOrderToCentral with Bearer token, called from IPN and admin verifyOrder |
| LIC-02 | 04-02, 04-04 | Store central_user_id + central_license_id mappings | SATISFIED | IPN/verifyOrder update order.centralOrderId, user.centralUserId, create license with centralLicenseId |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| (none found) | - | - | - | No TODO/FIXME/placeholder/stub patterns detected in any Phase 4 files |

### Human Verification Required

### 1. Complete Checkout Flow (Browser)

**Test:** Navigate to `/pricing`, click "Get Starter" / "Get Professional" / "Get Agency", verify redirect to `/dashboard/checkout?plan=X`, confirm 2-column layout renders with plan details, 5 payment method cards, coupon input.
**Expected:** Checkout page renders correctly with all interactive elements. Payment method selection shows brand-colored cards. Order summary shows plan price, VAT calculation, and total.
**Why human:** Multi-page browser interaction with form submission and conditional rendering requires visual verification.

### 2. SSL Commerce Payment Redirect

**Test:** Select SSL Commerce method on checkout page, click "Pay with SSL Commerce" button.
**Expected:** Button creates session via `/api/ssl-commerz/create-session` and redirects to external SSL Commerz hosted payment page. On success/fail/cancel, redirects back to portal success page.
**Why human:** External payment gateway integration requires live SSL Commerz sandbox credentials and browser redirect testing.

### 3. Manual Payment Flow

**Test:** Select bKash/Nagad/Rocket/Bank Transfer, verify payment instructions display account details, enter transaction ID (min 4 chars), submit.
**Expected:** Payment instructions show account details with click-to-copy functionality. Form validates min 4 char transaction ID. On submit, creates pending order and redirects to success page showing "Payment Submitted" message.
**Why human:** Full form interaction flow with conditional rendering based on payment method selection.

### 4. Admin Order Verification (Multi-Role)

**Test:** After creating a manual order as customer, log in as admin, navigate to `/admin/orders`, find the pending order, click "Verify & Confirm".
**Expected:** Order status changes to completed. Central API sync triggers. License key is created. Confirmation email is sent to customer.
**Why human:** Multi-role workflow crossing customer and admin sessions with server-side side effects (DB updates, API calls, email sending).

### 5. Invoice View and PDF Download

**Test:** Navigate to `/dashboard/billing/[id]` for a completed order. Review the HTML invoice. Click "Download PDF".
**Expected:** Invoice renders with company info (Devsroom, Dhaka, Bangladesh), customer info, line items (plan name, VAT, discount, total), and payment details. PDF download produces a matching A4 document.
**Why human:** Visual verification of invoice layout quality, PDF rendering fidelity, and data accuracy.

### 6. Coupon Code Validation States

**Test:** Enter valid coupon (LAUNCH20), expired coupon, and a coupon that has reached usage limit.
**Expected:** Valid coupon shows green discount line in order summary with real-time total recalculation. Invalid coupons show specific error messages: "Invalid coupon code", "This coupon has expired", "This coupon has reached its usage limit".
**Why human:** Form interaction with multiple error states requires visual verification of messaging and UI feedback.

### Gaps Summary

No gaps found. All 6 ROADMAP success criteria are verified at the code level:

1. **Plan selection + payment method + checkout initiation** -- Fully implemented with 2-column checkout page, 5 branded payment method cards, URL param-based plan selection
2. **SSL Commerce redirect + return** -- create-session returns GatewayPageURL, success/fail/cancel redirect handlers, IPN validates server-to-server
3. **Manual BD payments + admin verify** -- Manual methods create pending orders with transaction ID dedup; admin verify completes + syncs + creates license
4. **Coupon code system** -- Transactional validation with race safety, expiry/usage/minimum checks, real-time discount display
5. **Invoice HTML + PDF** -- Full invoice rendering with line items, VAT breakdown, payment details; @react-pdf/renderer PDF generation; authenticated download route
6. **Central API sync + mapping storage** -- IPN and admin verify both POST to license.devsroom.com, store centralOrderId/centralUserId/centralLicenseId

TypeScript compilation passes cleanly. No anti-patterns or stubs detected. All artifacts are substantive with real data flows. The phase is ready for human UAT.

---

_Verified: 2026-05-17T22:00:00Z_
_Verifier: Claude (gsd-verifier)_
