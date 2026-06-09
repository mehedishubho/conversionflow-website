---
status: resolved
phase: 27-customer-billing-integration
source: 17-VERIFICATION.md, src/modules/billing/**, src/app/(portal)/actions/checkout.ts, src/app/(admin)/actions/admin-orders.ts
started: 2026-06-08T12:00:00Z
updated: 2026-06-08T13:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Create Manual Order (bKash/Nagad)
expected: Customer selects a plan on checkout page, picks bKash or Nagad as payment method, enters a transaction ID (min 4 chars), submits. Order is created with "pending" status. Success page shows "Payment Submitted" message with verification notice.
result: pass

### 2. Coupon Code Validation
expected: Customer enters a valid coupon code on checkout. Discount is calculated (percentage or flat) and shown in order summary. Invalid/expired coupons show appropriate error. Coupon usage count increments.
result: pass

### 3. VAT/Tax Calculation
expected: VAT is calculated and displayed on checkout based on admin settings (rate, mode inclusive/exclusive). If VAT disabled in settings, no tax shown.
result: pass

### 4. Admin Verify Order Triggers License Generation
expected: Admin clicks "Verify" on a pending manual order. Order status changes to "completed". A license key is automatically generated and linked to the order. License appears in customer's license list.
result: pass

### 5. Checkout Success Page — Completed Order with License Key
expected: After order completion, success page shows green-bordered license key card with copy-to-clipboard button, and an amber API token notice saying token was sent to email.
result: pass

### 6. Idempotent License Generation
expected: Verifying the same order twice does NOT create a duplicate license. Second verify returns the existing license without error.
result: pass

### 7. Order Rejection
expected: Admin clicks "Reject" on a pending order with a reason. Order status changes to "failed". No license is generated.
result: pass

### 8. Refund and License Revocation
expected: Admin issues refund on a completed order. Order status changes to "refunded". Any linked license is automatically revoked. Audit log entries created for both changes.
result: pass

### 9. Confirmation Email with Credentials
expected: After order completion, confirmation email is sent containing the license key in a green-bordered block and API token in an orange-bordered block.
result: pass

### 10. Server-Side Price Validation
expected: Client-side price tampering is ignored. Server always uses the authoritative price from product_plans table, not the form-submitted amount.
result: pass

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0

## Gaps

- truth: "Admin can create and manage coupon codes via dashboard UI"
  status: resolved
  reason: "User reported: I didnt find to create a coupon from admin dashboard but coupon field is shown on checkout page"
  severity: major
  test: 2
  root_cause: "No coupon admin UI exists anywhere — no routes, no server actions, no nav entry. Only a seed coupon (LAUNCH20) and the checkout-side validateCoupon() action exist. Admin sidebar has 12 nav items but no coupon link. The coupons table schema is complete (code, type, value, min_order_amount, max_uses, current_uses, expires_at, active) but no CRUD UI was built."
  artifacts:
    - path: "src/data/dashboard-nav.ts"
      issue: "Missing coupon nav entry in adminNavItems"
    - path: "src/app/(admin)/actions/"
      issue: "No admin-coupons.ts action file exists"
    - path: "src/app/(admin)/admin/coupons/"
      issue: "No coupon admin route exists"
  missing:
    - "Create admin-coupons.ts with CRUD actions (listCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCouponActive)"
    - "Create /admin/coupons page with CouponsTable component"
    - "Add coupon nav entry to adminNavItems in dashboard-nav.ts"
    - "Optionally add couponCode/discountAmount columns to admin orders table view"

- truth: "Orders are clickable/interactive on admin orders page for verify/reject actions"
  status: resolved
  reason: "User reported: On order page no order can be clickable to do that"
  severity: major
  test: 6
  root_cause: "Working as designed but UX is confusing. Verify button only appears for pending orders. Completed orders show only a Refund button. No row click, no order detail page, no 'View Details' link. Server-side verifyOrder() explicitly rejects non-pending orders. The admin was trying to verify an already-completed order for the idempotency test — no Verify button exists for completed orders by design."
  artifacts:
    - path: "src/components/admin/OrdersTable.tsx"
      issue: "Actions column gates Verify to pending only, completed shows only Refund, failed/refunded shows 'No actions'"
    - path: "src/app/(admin)/actions/admin-orders.ts"
      issue: "verifyOrder() guards: if (order.status !== 'pending') return error"
  missing:
    - "Add 'View Details' action or clickable row to all orders regardless of status"
    - "Show a disabled 'Verified' badge on completed orders instead of hiding the action entirely"
    - "Consider adding /admin/orders/[id] detail page"

- truth: "Confirmation email contains license key and API token after order completion"
  status: resolved
  reason: "User reported: after verify the order from admin customer get this email only with title 'Order Confirmation - ConversionFlow' no license and api key"
  severity: major
  test: 9
  root_cause: "Duplicate email race condition. Both OrderCompletedHandler and NotificationService subscribe to order.completed event. OrderCompletedHandler (registered first) sends the correct email with licenseKey and apiToken. NotificationService (registered second) enqueues a SECOND email via BullMQ with undefined subject/html/from fields — the email worker receives null values. The user sees the broken second email. The correct first email may also arrive but is overshadowed by the broken one."
  artifacts:
    - path: "src/modules/notifications/application/services/NotificationService.ts"
      issue: "Subscribes to order.completed and enqueues email job without subject/html/from fields"
    - path: "src/jobs/workers/email.worker.ts"
      issue: "Destructures subject/html/from from job.data which are undefined"
    - path: "src/modules/billing/application/handlers/OrderCompletedHandler.ts"
      issue: "Already sends correct email directly — NotificationService duplicate is unnecessary"
    - path: "src/lib/module-init.ts"
      issue: "Both handlers registered on same event, both fire synchronously"
  missing:
    - "Remove 'email' from channels for order.completed in EventCatalog (change to in_app only)"
    - "Or skip email enqueuing in NotificationService for events already handled by billing handlers"
    - "Fix email worker to validate required fields before sending"

- truth: "Price changes in admin dashboard propagate to checkout in real-time"
  status: resolved
  reason: "User reported: Updated Starter plan price from 2150 to 2250 in admin dashboard but checkout still shows old 2150 price after refresh"
  severity: major
  test: 10
  root_cause: "Three unsynchronized price sources: (1) Module-level cachedPlanPrices in checkout.ts cached for process lifetime, never invalidated by admin updates. (2) Hardcoded planPrices object in checkout/page.tsx (lines 17-21). (3) Static pricingTiers in src/data/pricing.ts for marketing page. Admin updatePlan() only updates DB — no cache invalidation, no revalidatePath, no event."
  artifacts:
    - path: "src/app/(portal)/actions/checkout.ts"
      issue: "cachedPlanPrices module-level cache set once, never cleared (line 29)"
    - path: "src/app/(portal)/dashboard/checkout/page.tsx"
      issue: "Hardcoded planPrices object at lines 17-21: { starter: 2150, professional: 3000, agency: 8000 }"
    - path: "src/data/pricing.ts"
      issue: "Static pricingTiers array with hardcoded price strings"
    - path: "src/app/(admin)/actions/admin-products.ts"
      issue: "updatePlan() updates DB but does not invalidate any cache"
  missing:
    - "Export clearPlanPricesCache() from checkout.ts, call from admin plan mutations"
    - "Replace hardcoded planPrices in checkout/page.tsx with server-side price fetch"
    - "Add revalidatePath('/dashboard/checkout') after plan price changes"
    - "Marketing pricing page (lower priority): fetch from DB instead of static data"
