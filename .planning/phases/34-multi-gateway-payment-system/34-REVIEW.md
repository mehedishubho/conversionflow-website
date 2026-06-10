---
phase: 34-multi-gateway-payment-system
reviewed: 2026-06-11T00:00:00Z
depth: standard
files_reviewed: 40
files_reviewed_list:
  - src/app/(admin)/actions/admin-orders.ts
  - src/app/(admin)/actions/admin-settings.ts
  - src/app/(portal)/actions/checkout.ts
  - src/app/(portal)/dashboard/billing/page.tsx
  - src/app/(portal)/dashboard/checkout/page.tsx
  - src/app/(portal)/dashboard/checkout/success/page.tsx
  - src/app/api/ssl-commerz/cancel/route.ts
  - src/app/api/ssl-commerz/create-session/route.ts
  - src/app/api/ssl-commerz/fail/route.ts
  - src/app/api/ssl-commerz/ipn/route.ts
  - src/app/api/ssl-commerz/success/route.ts
  - src/app/api/webhooks/bkash/route.ts
  - src/app/api/webhooks/paddle/route.ts
  - src/app/api/webhooks/sslcommerz/route.ts
  - src/components/admin/GatewayCard.tsx
  - src/components/admin/OrdersTable.tsx
  - src/components/admin/PaymentSettingsForm.tsx
  - src/components/admin/WebhookEventLog.tsx
  - src/components/checkout/BKashAPIForm.tsx
  - src/components/checkout/CurrencyToggle.tsx
  - src/components/checkout/GatewaySelector.tsx
  - src/components/checkout/PaddleRedirectButton.tsx
  - src/components/checkout/SSLCommerzForm.tsx
  - src/lib/db/schema.ts
  - src/lib/module-init.ts
  - src/lib/ssl-commerz.ts
  - src/modules/payments/application/GatewayRegistry.ts
  - src/modules/payments/application/PaymentService.ts
  - src/modules/payments/application/index.ts
  - src/modules/payments/domain/IPaymentGateway.ts
  - src/modules/payments/domain/PaymentError.ts
  - src/modules/payments/domain/events/PaymentEvents.ts
  - src/modules/payments/domain/value-objects/GatewayConfig.ts
  - src/modules/payments/domain/value-objects/PaymentSession.ts
  - src/modules/payments/index.ts
  - src/modules/payments/infrastructure/adapters/BKashAdapter.ts
  - src/modules/payments/infrastructure/adapters/PaddleAdapter.ts
  - src/modules/payments/infrastructure/adapters/SSLCommerzAdapter.ts
  - src/modules/payments/infrastructure/crypto.ts
  - src/modules/payments/infrastructure/index.ts
  - src/modules/payments/infrastructure/repositories/GatewayConfigRepository.ts
findings:
  critical: 2
  warning: 8
  info: 5
  total: 15
status: issues_found
---

# Phase 34: Code Review Report

**Reviewed:** 2026-06-11T00:00:00Z
**Depth:** standard
**Files Reviewed:** 40
**Status:** issues_found

## Summary

Reviewed the multi-gateway payment system implementing SSL Commerz, Paddle, and bKash adapters with a clean domain-driven architecture (IPaymentGateway strategy pattern, GatewayRegistry singleton, PaymentService orchestrator). The domain layer is well-structured with proper separation of concerns. Two critical security issues were found: SSL Commerz store credentials exposed in plain text via the settings table and reflected to the admin UI, and the legacy create-session route lacks payment reference deduplication. Several warnings include redundant session fetches, client-amount trust in gateway checkout, and a race condition in coupon usage validation.

## Critical Issues

### CR-01: SSL Commerz Credentials Stored and Returned in Plain Text

**File:** `src/app/(admin)/actions/admin-settings.ts:232-254`
**Issue:** The `getPaymentSettings()` server action reads `ssl_commerz_store_id` and `ssl_commerz_store_password` directly from the `settings` table and returns the plain-text `storePassword` to the client component. While the new Phase 34 gateway system uses AES-256-GCM encryption via `payment_gateways.config`, the legacy settings table stores credentials unencrypted and exposes them to the browser. Any logged-in admin can view the store password in the network response. Additionally, the `saveSSLSettings()` function (line 262-304) saves the password as plain text to the settings table.

**Fix:**
```typescript
// In getPaymentSettings(), mask the password before returning:
const sslDbPassword = sslPasswordRow[0]?.value ?? "";
// ...
sslCommerz: {
  storeId: sslDbStoreId,
  storePassword: sslDbPassword ? "********" : "", // Mask in response
  // ... rest unchanged
},

// In saveSSLSettings(), only update password if a non-masked value is provided:
const valueToSave = entry.key === "ssl_commerz_store_password" && entry.value === "********"
  ? undefined // Don't overwrite with mask
  : entry.value;
```

### CR-02: Legacy create-session Route Lacks Payment Ref Deduplication

**File:** `src/app/api/ssl-commerz/create-session/route.ts:78-99`
**Issue:** The deprecated `create-session` route creates a pending order without checking for duplicate `paymentRef` values (the dedup check at `checkout.ts:276-283` is only in `createManualOrder`). While this route is marked `@deprecated`, it is still functional and can be called by clients that haven't migrated. If a user submits the same payment twice (double-click, retry), duplicate orders are created without dedup protection.

**Fix:**
```typescript
// Add dedup check before inserting the order, similar to createManualOrder:
const existingOrder = await db
  .select({ id: orders.id })
  .from(orders)
  .where(eq(orders.userId, user.id))
  .where(eq(orders.plan, plan))
  .where(eq(orders.status, "pending"))
  .limit(1);
if (existingOrder.length > 0) {
  return NextResponse.json(
    { error: "A pending order already exists for this plan. Please complete or cancel it first." },
    { status: 409 }
  );
}
```

## Warnings

### WR-01: Redundant Session Fetch in createGatewayOrder

**File:** `src/app/(portal)/actions/checkout.ts:534`
**Issue:** `createGatewayOrder()` fetches the user session a second time (`session2`) on line 534 to get `userEmail` and `userName`, even though the first session was already fetched on line 461. This is a redundant database/API call. The first `session` object already contains `session.user.email` and `session.user.name`.

**Fix:**
```typescript
// Remove line 534 and use the existing session variable:
const userEmail = session.user.email ?? "";
const userName = session.user.name ?? "";
```

### WR-02: Client-Sent discountAmount/taxAmount Trusted in createGatewayOrder

**File:** `src/app/(portal)/actions/checkout.ts:527-531`
**Issue:** The `createGatewayOrder` server action receives `discountAmount` and `taxAmount` from the client and passes them directly into `createPendingOrder` without server-side validation. While the base `amount` is resolved server-side from the plan price, the discount and tax amounts could be manipulated by a modified client to set `discountAmount` equal to the full price (resulting in a zero-amount order after discount). The `createManualOrder` function at line 288-289 has the same pattern but re-computes the authoritative amount server-side, so the discount/tax only affect record-keeping. However, `createGatewayOrder` also stores these values without validation.

**Fix:**
```typescript
// Validate discountAmount against server-side coupon validation:
let validatedDiscount = 0;
if (params.couponCode) {
  const couponResult = await validateCoupon(params.couponCode, amount);
  if ("success" in couponResult && couponResult.success) {
    validatedDiscount = couponResult.discount;
  }
}
// Use validatedDiscount instead of client-provided discountAmount
```

### WR-03: Coupon Usage Increment Not Rolled Back on Order Failure

**File:** `src/app/(portal)/actions/checkout.ts:209-213`
**Issue:** The `validateCoupon` function increments `currentUses` inside a transaction, but if the subsequent order creation fails (network error, DB error), the coupon usage count is permanently incremented even though no order was placed. The coupon usage count should only increment after the order is successfully created, or be decremented on failure.

**Fix:**
```typescript
// Option A: Move the increment outside the transaction, after order creation succeeds.
// Option B: Wrap both coupon validation + order creation in a single transaction.
// Option C: Add a decrementCouponUsage() function called in the catch block.
```

### WR-04: IPN Handler Does Not Verify Payment Amount

**File:** `src/app/api/ssl-commerz/ipn/route.ts:19-109`
**Issue:** The legacy IPN handler validates the payment status via `validateSSLPayment(valId)` but does not verify that the paid amount matches the order amount. The newer `sslcommerz` webhook handler at `src/app/api/webhooks/sslcommerz/route.ts:79-91` correctly performs amount verification, but this legacy handler does not. A malicious actor could potentially craft an IPN with a different amount for a valid transaction.

**Fix:**
```typescript
// After line 65 (idempotency check), add amount verification:
const paidAmount = parseFloat(validation.amount) || 0;
if (paidAmount > 0 && Math.abs(paidAmount - order.amount) > 1) {
  console.error(`[IPN] Amount mismatch: order=${order.amount}, paid=${paidAmount}`);
  return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
}
```

### WR-05: GatewayCard Test Connection Button Race Condition

**File:** `src/components/admin/GatewayCard.tsx:93-99`
**Issue:** The `handleTestConnection` function sets `setTesting(true)` before `startTransition`, but sets `setTesting(false)` inside the transition callback. Since `startTransition` batches state updates, the `testing` state might not be synchronized with the actual async operation. If the user clicks "Test Connection" rapidly, multiple concurrent requests could fire. The `setTesting(false)` inside `startTransition` runs before the async `testGatewayConnection` completes because `startTransition` does not await the inner async function.

**Fix:**
```typescript
const handleTestConnection = () => {
  setTesting(true);
  setTestResult(null);
  testGatewayConnection(gateway.gatewayId)
    .then((result) => {
      setTestResult(result);
    })
    .finally(() => {
      setTesting(false);
    });
};
```

### WR-06: BKashAdapter.processRefund Uses params.orderId as paymentID

**File:** `src/modules/payments/infrastructure/adapters/BKashAdapter.ts:464`
**Issue:** In `processRefund()`, the bKash refund API call sends `paymentID: params.orderId`. However, `params.orderId` is the internal order UUID, not the bKash `paymentID`. The bKash refund API requires the original `paymentID` from the `createSession` response. This would cause all bKash refund requests to fail in production.

**Fix:**
```typescript
// The RefundParams interface should carry the bKash paymentID separately,
// or the caller should pass the gateway's paymentID as gatewayTransactionId.
// Fix: use a separate lookup or change the contract:
body: JSON.stringify({
  paymentID: params.gatewayTransactionId, // This might be the trxID, not paymentID
  amount: params.amount.toString(),
  trxID: params.gatewayTransactionId,
  // ...
}),
// Best fix: store the bKash paymentID in the orders table alongside gatewayTransactionId
// so it can be retrieved for refunds.
```

### WR-07: Type Assertion on User Role Is Unsafe

**File:** `src/app/(admin)/actions/admin-orders.ts:25` and `src/app/(admin)/actions/admin-settings.ts:28`
**Issue:** Both files use `const role = (session.user as Record<string, unknown>).role as string;` which is a double type assertion. If the `session.user` object does not have a `role` property (e.g., the auth library doesn't include it, or the DB column is missing), this evaluates to `undefined` cast as `string`, which would then pass the `!== "admin"` check and redirect to `/dashboard` rather than showing a proper error. This is a defense-in-depth concern for authorization.

**Fix:**
```typescript
const role = (session.user as Record<string, unknown>).role;
if (typeof role !== "string" || (role !== "admin" && role !== "super_admin")) {
  redirect("/dashboard");
}
```

### WR-08: Paddle Webhook Amount Verification Effectively Disabled

**File:** `src/app/api/webhooks/paddle/route.ts:71-72`
**Issue:** The amount verification accesses `result.rawPayload.amount` via `parseFloat(String(result.rawPayload.amount))`, but the Paddle webhook body structure uses `data.details.totals.total` (as seen in PaddleAdapter's type definitions). The `rawPayload` is the full webhook body, so `rawPayload.amount` would be `undefined`, making `paidAmount` always `0`, which means the amount check is effectively disabled (`paidAmount > 0` is always false).

**Fix:**
```typescript
// Access the amount from the correct nested path in Paddle webhook body:
const paidAmount = parseFloat(
  String(
    (result.rawPayload as { data?: { details?: { totals?: { total?: string } } } })
      ?.data?.details?.totals?.total ?? "0"
  )
) || 0;
```

## Info

### IN-01: Deprecated create-session Route Still Functional

**File:** `src/app/api/ssl-commerz/create-session/route.ts:1-4`
**Issue:** The route is marked `@deprecated` with a comment but remains fully functional and accessible via POST to `/api/ssl-commerz/create-session`. There is no runtime warning or log emitted when it is called. Consider adding a `console.warn` at the top of the handler, or disabling the route entirely if all clients have migrated.

**Fix:** Add a deprecation log at the start of the handler:
```typescript
console.warn("[Deprecated] /api/ssl-commerz/create-session called. Use PaymentService via checkout actions instead.");
```

### IN-02: Duplicated Plan Price Constants

**File:** `src/app/(portal)/actions/checkout.ts:27-31` and `src/app/api/ssl-commerz/create-session/route.ts:22-26`
**Issue:** `FALLBACK_PRICES` and `PLAN_PRICES_BDT` define the same hardcoded plan prices in two different files. If plan prices change, both must be updated. The `getPlanPrices()` function already handles DB lookup with fallback, making `PLAN_PRICES_BDT` in the deprecated route redundant.

**Fix:** Have the deprecated route call `getPlanPrices()` from the checkout actions module instead of maintaining its own constant.

### IN-03: GatewayRegistry Called at Module Scope in PaymentSettingsForm

**File:** `src/components/admin/PaymentSettingsForm.tsx:258-259`
**Issue:** `GatewayRegistry.getInstance()` and `registry.getAll()` are called at the component's render scope (line 258-259), meaning they execute on every render. While the singleton pattern makes this cheap, it would be cleaner to compute this once (e.g., via `useMemo` or `useState`).

**Fix:**
```typescript
const registry = useMemo(() => GatewayRegistry.getInstance(), []);
const allAdapters = useMemo(() => registry.getAll(), [registry]);
```

### IN-04: Module-Level console.log in Payments Module Init

**File:** `src/modules/payments/index.ts:35`
**Issue:** `console.log("[Payments] SSLCommerzAdapter + PaddleAdapter + BKashAdapter registered")` fires on every server render that calls `initializeModules()`. This is noisy in production logs.

**Fix:** Remove or downgrade to `console.debug`, or gate behind a `process.env.NODE_ENV === "development"` check.

### IN-05: Unused tier Variable in create-session Route

**File:** `src/app/api/ssl-commerz/create-session/route.ts:63-69`
**Issue:** The `tier` variable is fetched from `pricingTiers` on line 63 and used only for a null check, but its actual data (like `tier.price`) is never used. The authoritative price comes from `PLAN_PRICES_BDT`. The `pricingTiers` import and lookup serve no functional purpose beyond the existence check.

**Fix:** Remove the `pricingTiers` import and the tier lookup, or use it to validate the plan name:
```typescript
// Simplify: just check PLAN_PRICES_BDT[plan] which already validates existence
if (!plan || !PLAN_PRICES_BDT[plan]) {
  return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
}
```

---

_Reviewed: 2026-06-11T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
