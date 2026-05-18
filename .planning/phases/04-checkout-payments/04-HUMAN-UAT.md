---
phase: 04-checkout-payments
status: pending_human_uat
created: 2026-05-17
items: 6
automated_score: 6/6
---

# Phase 4 Human UAT

All 6 automated verification checks passed. The following 6 items need hands-on browser testing.

## Items

### 1. Complete Checkout Flow

**Steps:**
1. Navigate to `/pricing`
2. Click "Get Starter" / "Get Professional" / "Get Agency"
3. Verify redirect to `/dashboard/checkout?plan=X`
4. Confirm 2-column layout: order summary left, payment right
5. Verify 5 payment method cards render with brand colors
6. Verify coupon input is visible

**Pass:** Page renders with all interactive elements, correct plan name and price.

---

### 2. SSL Commerce Payment Redirect

**Steps:**
1. On checkout page, select "SSL Commerce" payment method
2. Click "Pay with SSL Commerce" button
3. Verify redirect to external SSL Commerz hosted payment page

**Pass:** External gateway page loads (requires sandbox credentials).

---

### 3. Manual Payment Flow

**Steps:**
1. Activate a manual payment method in `/admin/settings` (e.g., bKash)
2. Return to checkout, select bKash
3. Verify payment instructions display with account details
4. Enter a transaction ID (min 4 chars)
5. Click Submit

**Pass:** Creates pending order, redirects to success page showing "Payment Submitted" message.

---

### 4. Admin Order Verification

**Steps:**
1. Create a manual order as a customer (test #3 above)
2. Log in as admin
3. Navigate to `/admin/orders`
4. Find the pending order
5. Click "Verify & Confirm"

**Pass:** Order status changes to completed, license key created, confirmation email sent.

---

### 5. Invoice View and PDF Download

**Steps:**
1. Navigate to `/dashboard/billing/[id]` for a completed order
2. Review the HTML invoice layout
3. Click "Download PDF"
4. Open the downloaded PDF

**Pass:** Invoice renders with company info, customer info, line items, VAT, discount, total. PDF matches HTML.

---

### 6. Coupon Code Validation

**Steps:**
1. On checkout page, enter valid coupon: `LAUNCH20`
2. Verify discount appears in order summary
3. Remove coupon, enter an invalid/expired code
4. Verify error message displays

**Pass:** Valid coupon shows green discount line with recalculated total. Invalid coupons show specific error messages.

---

## Result

| # | Test | Status |
|---|------|--------|
| 1 | Complete Checkout Flow | PENDING |
| 2 | SSL Commerce Redirect | PENDING |
| 3 | Manual Payment Flow | PENDING |
| 4 | Admin Order Verification | PENDING |
| 5 | Invoice View and PDF | PENDING |
| 6 | Coupon Validation | PENDING |
