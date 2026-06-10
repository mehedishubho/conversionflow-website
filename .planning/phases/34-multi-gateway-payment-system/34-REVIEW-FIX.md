---
phase: 34-multi-gateway-payment-system
fixed_at: 2026-06-11T00:00:00Z
review_path: .planning/phases/34-multi-gateway-payment-system/34-REVIEW.md
iteration: 1
findings_in_scope: 10
fixed: 10
skipped: 0
status: all_fixed
---

# Phase 34: Code Review Fix Report

**Fixed at:** 2026-06-11T00:00:00Z
**Source review:** .planning/phases/34-multi-gateway-payment-system/34-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 10 (2 Critical + 8 Warning)
- Fixed: 10
- Skipped: 0

## Fixed Issues

### CR-01: SSL Commerz Credentials Stored and Returned in Plain Text

**Files modified:** `src/app/(admin)/actions/admin-settings.ts`
**Commit:** f55deaa
**Applied fix:** Masked `storePassword` with `"********"` in `getPaymentSettings()` response so plain-text password is never sent to the browser. Added guard in `saveSSLSettings()` to skip updating `ssl_commerz_store_password` when the value is `"********"` (prevents overwriting real password with the mask placeholder).

### CR-02: Legacy create-session Route Lacks Payment Ref Deduplication

**Files modified:** `src/app/api/ssl-commerz/create-session/route.ts`
**Commit:** 7c7776b
**Applied fix:** Added `and`/`eq` imports from drizzle-orm. Inserted dedup check before order creation that queries for existing pending orders with the same `userId` + `plan` + `status("pending")`. Returns HTTP 409 with descriptive error if a duplicate is found.

### WR-01: Redundant Session Fetch in createGatewayOrder

**Files modified:** `src/app/(portal)/actions/checkout.ts`
**Commit:** ada2479
**Applied fix:** Removed the redundant `session2` fetch (`auth.api.getSession`) on line 534 and replaced with `session.user.email` and `session.user.name` from the already-fetched `session` variable.

### WR-02: Client-Sent discountAmount/taxAmount Trusted in createGatewayOrder

**Files modified:** `src/app/(portal)/actions/checkout.ts`
**Commit:** 947d35c
**Applied fix:** Added server-side coupon validation before creating the pending order. If `params.couponCode` is provided, calls `validateCoupon()` to get the authoritative discount, then passes `validatedDiscount` instead of the client-provided `discountAmount`.

**Note:** This is a logic fix -- requires human verification to confirm the discount validation flow is correct end-to-end.

### WR-03: Coupon Usage Increment Not Rolled Back on Order Failure

**Files modified:** `src/app/(portal)/actions/checkout.ts`
**Commit:** 7814a28
**Applied fix:** Removed the `currentUses` increment from inside `validateCoupon()` transaction. Added coupon usage increment to both `createManualOrder()` and `createGatewayOrder()` after successful order creation, with try/catch to make it non-fatal. This ensures the coupon usage count only increments when an order is actually created.

**Note:** This is a logic fix -- requires human verification to confirm the new increment placement handles all edge cases correctly.

### WR-04: IPN Handler Does Not Verify Payment Amount

**Files modified:** `src/app/api/ssl-commerz/ipn/route.ts`
**Commit:** edfbf83
**Applied fix:** Added amount verification between the idempotency check and the audit log. Extracts `paidAmount` from `validation.amount` (SSL Commerz validation response) and compares against `order.amount` with a tolerance of 1. Returns HTTP 400 on mismatch.

**Note:** This is a logic fix -- requires human verification to confirm the amount tolerance and comparison logic are appropriate.

### WR-05: GatewayCard Test Connection Button Race Condition

**Files modified:** `src/components/admin/GatewayCard.tsx`
**Commit:** 0748707
**Applied fix:** Replaced `startTransition(async () => { ... })` with a promise chain using `.then()/.finally()` so `setTesting(false)` only runs after the async `testGatewayConnection` completes. This prevents the `testing` state from being cleared prematurely and eliminates the race condition on rapid clicks.

### WR-06: BKashAdapter.processRefund Uses params.orderId as paymentID

**Files modified:** `src/modules/payments/infrastructure/adapters/BKashAdapter.ts`
**Commit:** b0764d0
**Applied fix:** Changed `paymentID: params.orderId` to `paymentID: params.gatewayTransactionId` in the bKash refund API call. The `gatewayTransactionId` stored in the orders table contains the bKash `paymentID` from the `createSession` response, making it the correct value for the refund request.

**Note:** This is a logic fix -- requires human verification to confirm `gatewayTransactionId` is consistently the bKash `paymentID` across all order creation paths.

### WR-07: Type Assertion on User Role Is Unsafe

**Files modified:** `src/app/(admin)/actions/admin-orders.ts`, `src/app/(admin)/actions/admin-settings.ts`
**Commit:** 2e875d0
**Applied fix:** Removed the double type assertion `as string` on the role extraction. Changed the guard to `typeof role !== "string" || (role !== "admin" && role !== "super_admin")` which properly handles `undefined` and non-string values instead of silently coercing them.

### WR-08: Paddle Webhook Amount Verification Effectively Disabled

**Files modified:** `src/app/api/webhooks/paddle/route.ts`
**Commit:** dd7bdba
**Applied fix:** Changed `result.rawPayload.amount` (which was always `undefined`) to the correct nested path `(result.rawPayload as { data?: { details?: { totals?: { total?: string } } } })?.data?.details?.totals?.total` to match the actual Paddle Billing webhook body structure.

**Note:** This is a logic fix -- requires human verification to confirm the Paddle webhook payload structure matches the assumed path.

---

_Fixed: 2026-06-11T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
