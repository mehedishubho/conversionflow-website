# Phase 17: Customer & Billing Integration - Research

**Researched:** 2026-06-03
**Domain:** DDD Billing Bounded Context, domain events, checkout refactoring, license generation orchestration
**Confidence:** HIGH

## Summary

Phase 17 replaces the external `license.devsroom.com` dependency for new orders with a local `OrderCompleted` domain event handler. The Billing Bounded Context (`src/modules/billing/`) -- currently empty stubs from Phase 14 -- will be populated with an `OrderService` that emits the event, an `OrderCompletedHandler` that orchestrates license generation via the Phase 16 `GenerateLicenseHandler`, and supporting infrastructure. Two existing consumers (the SSL Commerce IPN handler and admin verify action) will be refactored to call `BillingService.completeOrder()` instead of `importOrderToCentral()`. The checkout success page and confirmation email will be updated to display the license key and API token.

The codebase already has all the infrastructure this phase needs: EventBus with publisher/subscriber facades, EventRegistry with error isolation, BaseRepository with Drizzle ORM mapping, and the `GenerateLicenseHandler` that produces license keys and API tokens. The pattern to follow is established by Phase 15's `products` module and Phase 16's `licensing` module -- this phase simply adds the billing module following the same DDD layering.

**Primary recommendation:** Follow the exact same DDD module structure as `src/modules/products/` and `src/modules/licensing/`. Create `OrderCompleted` event using the same factory pattern as `LicenseEvents.ts`. Make `BillingService.completeOrder()` the single entry point that replaces both the IPN handler's central API block (lines 108-176) and admin verify's central API block (lines 82-156). Ensure idempotency at the `completeOrder` level by checking for an existing license on the orderId before generating.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Single domain event: `OrderCompleted`. No separate `OrderCreated`, `OrderRefunded`, or `PaymentVerified` events.
- **D-02:** Minimal payload: `{ orderId: string, userId: string }`. Handler queries DB at processing time.
- **D-03:** Synchronous processing. Handler runs in-process within the IPN or admin verify request. No BullMQ.
- **D-04:** `BillingService.completeOrder()` in `src/modules/billing/application/services/`. Marks order completed, emits `OrderCompleted`, handler generates license.
- **D-05:** Checkout server actions (`createManualOrder`, `validateCoupon`, `calculateVAT`) stay as-is. Only central API call is replaced.
- **D-06:** IPN handler and admin verify become thin delegates: validate payment -> call `completeOrder()` -> return response.
- **D-07:** License key and API token delivered via both email AND checkout success page.
- **D-08:** Success page fetches order and shows license key + API token when status is completed. "pending verification" if IPN not processed yet. No polling.
- **D-09:** Confirmation email includes both license key and API token in copy-friendly format.
- **D-10:** Immediate cutover for new orders. Remove `importOrderToCentral()` calls. No feature flag, no dual-write.
- **D-11:** `src/lib/central-api.ts` stays but is no longer imported by Phase 17 code. Phase 20 deletes it.
- **D-12:** New orders do NOT set `centralOrderId`, `centralLicenseId`, or `centralUserId`. Fields remain NULL.
- **D-13:** Remove central API inbound webhook handlers. Webhook schema/table stays for Phase 19.

### Claude's Discretion
- Exact `OrderService` class structure (single class vs separate command/query handlers)
- Event handler registration mechanism (in-module init vs centralized registry)
- Email template design for license delivery
- Success page component layout for license key + API token display
- Error handling strategy when license generation fails inside the event handler
- How to handle the IPN race condition on the success page

### Deferred Ideas (OUT OF SCOPE)
- Moving checkout server actions into Billing Context
- Full DDD rewrite of payment routes
- Feature flag system for gradual rollout
- BullMQ async processing for order completion
- Outbound webhook delivery
- Removing `src/lib/central-api.ts` and central ID fields (Phase 20)
- Refund/cancellation events (Phase 18)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LSTAT-05 | Admin can manually revoke or suspend licenses with reason | Existing `issueRefund` in admin-orders.ts already revokes licenses on refund. `OrderCompletedHandler` creates audit log entries. LSTAT-05 admin revoke/suspend is partially addressed by existing code; full implementation via licensing module commands in Phase 18. |
| LSTAT-06 | License status changes trigger audit log entries and customer notifications | `createAuditLog()` in `src/lib/audit.ts` already handles `license.status_changed` and `license.created`. `OrderCompletedHandler` will call audit for license creation + send email notification. Pattern established. |
| ARCH-06 | Remove `src/lib/central-api.ts` file (external license API client) | Phase 17 disconnects it (removes imports from IPN handler and admin-orders.ts). Phase 20 deletes the file. `src/lib/central-api.ts` is 124 lines, used only in those two files. |
| ARCH-08 | Remove webhook handlers for central license API events | No dedicated inbound webhook API routes exist for `license.devsroom.com`. The "handlers" are the `importOrderToCentral` calls in IPN handler (lines 108-176) and admin verify (lines 82-156). Removing those calls satisfies ARCH-08. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | 0.45.2 | Database queries and transactions | Project ORM, used by all repositories [VERIFIED: pnpm list] |
| nanoid | 5.1.11 | Event ID generation | Used by all domain event factories [VERIFIED: pnpm list] |
| resend | 6.12.3 | Email delivery | Already used by `sendOrderConfirmationEmail` [VERIFIED: pnpm list] |
| next | 16.2.6 | Server actions, API routes, page rendering | Framework [VERIFIED: pnpm list] |
| react | 19.2.4 | UI rendering | Framework [VERIFIED: pnpm list] |

### Supporting (Already Installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 1.14.0 | Icons (Copy, Check for copy-to-clipboard) | Success page UI [VERIFIED: pnpm list] |
| clsx | 2.1.1 | Conditional class merging | Success page UI [VERIFIED: pnpm list] |
| tailwind-merge | 3.6.0 | Tailwind class dedup via `cn()` | Success page UI [VERIFIED: pnpm list] |

### No New Packages Required

Phase 17 uses exclusively the existing infrastructure. No `npm install` needed.

## Architecture Patterns

### Recommended Project Structure (Billing Module)

```
src/modules/billing/
├── index.ts                                    # Barrel export (exists, update)
├── domain/
│   ├── index.ts                                # Domain barrel (exists, update)
│   └── events/
│       └── OrderEvents.ts                      # ORDER_EVENTS constants + createOrderEvent factory
├── application/
│   ├── index.ts                                # Application barrel (exists, update)
│   ├── services/
│   │   └── OrderService.ts                     # completeOrder() - main entry point
│   └── handlers/
│       └── OrderCompletedHandler.ts            # Orchestrates license gen, audit, email
└── infrastructure/
    ├── index.ts                                # Infrastructure barrel (exists, update)
    └── repositories/
        ├── OrderRepository.ts                  # Extends BaseRepository for orders table
        └── mappers/
            └── OrderMapper.ts                  # Maps between Order entity and DB row
```

### Pattern 1: Domain Event Definition
**What:** Event type constants + factory function following BaseEvent interface
**When to use:** For the `OrderCompleted` event
**Example:**
```typescript
// Source: established by src/modules/licensing/domain/events/LicenseEvents.ts
import type { BaseEvent } from "@/shared/infrastructure/eventBus/types";
import { nanoid } from "nanoid";

export const ORDER_EVENTS = {
  ORDER_COMPLETED: "order.completed",
} as const;

export function createOrderEvent(
  type: string,
  aggregateId: string,
  payload: unknown,
): BaseEvent {
  return {
    id: nanoid(),
    type,
    aggregateId,
    payload,
    timestamp: new Date(),
    metadata: { source: "billing-context", version: 1 },
  };
}
```

### Pattern 2: Event Handler Registration
**What:** Register handler via `eventRegistry.subscribe()` and `inProcessSubscriber`
**When to use:** At module initialization to wire `OrderCompleted` to its handler
**Example:**
```typescript
// Source: established by src/shared/infrastructure/eventBus/registry.ts
import { eventRegistry, inProcessPublisher } from "@/shared/infrastructure/eventBus/EventBus";
import { OrderCompletedHandler } from "./handlers/OrderCompletedHandler";

// Register handler - call this from billing module's init or at app startup
eventRegistry.subscribe(ORDER_EVENTS.ORDER_COMPLETED, async (event) => {
  const handler = new OrderCompletedHandler();
  await handler.handle(event);
});
```

### Pattern 3: BillingService.completeOrder() (Synchronous)
**What:** Single method that: (1) marks order completed, (2) publishes OrderCompleted event, (3) eventRegistry processes handler synchronously
**When to use:** Called by IPN handler and admin verify
**Example:**
```typescript
// Key design: uses inProcessPublisher which triggers eventRegistry handlers synchronously
// The handler runs BEFORE completeOrder() returns, so license exists in DB when response goes out
async completeOrder(orderId: string, userId: string): Promise<void> {
  // 1. Update order status in DB
  await this.orderRepo.update(orderId, { status: "completed" });

  // 2. Publish event (synchronous in-process)
  await inProcessPublisher.publish(
    createOrderEvent(ORDER_EVENTS.ORDER_COMPLETED, orderId, { orderId, userId })
  );
}
```

### Pattern 4: Idempotent License Generation
**What:** Check for existing license by orderId before calling GenerateLicenseHandler
**When to use:** Inside OrderCompletedHandler to prevent duplicate licenses on duplicate IPN
**Example:**
```typescript
// Source: CONTEXT.md D-06 (idempotency requirement)
// The IPN handler already has idempotency at the order level (line 69-71)
// This adds idempotency at the license level as a safety net
const existingLicense = await this.licenseRepo.findByOrderId(orderId);
if (existingLicense) {
  // License already generated for this order -- skip generation
  // Still proceed with audit + email if they haven't been sent
  return existingLicense;
}
```

### Anti-Patterns to Avoid

- **Querying central API from the event handler:** The entire point of this phase is removing the external dependency. The handler must only use local DB queries and `GenerateLicenseHandler`.
- **Creating the license directly in IPN/admin-verify without going through the event:** All license generation for order completion must go through the `OrderCompleted` event handler to maintain a single code path.
- **Adding BullMQ or async processing:** D-03 explicitly requires synchronous processing. The handler runs within the HTTP request lifecycle.
- **Setting `centralOrderId` / `centralLicenseId` / `centralUserId` for new orders:** D-12 explicitly leaves these NULL. The new `GenerateLicenseHandler` from Phase 16 does not produce these values.
- **Refactoring checkout server actions:** D-05 explicitly scopes this phase to replacing the central API call only. `createManualOrder`, `validateCoupon`, `calculateVAT` remain untouched.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| License key generation | Custom key gen in billing handler | `GenerateLicenseHandler.execute()` | Already implements CF-XXXX format, uniqueness check, API token, LicenseCreated event |
| Event publishing | Custom event dispatch | `inProcessPublisher.publish()` + `eventRegistry` | Already supports sync execution, error isolation, wildcard handlers |
| DB operations on orders | Raw SQL in service | `BaseRepository<Order>` + `OrderMapper` | Already provides CRUD, transactions, query builder |
| Audit logging | Custom log table inserts | `createAuditLog()` from `@/lib/audit` | Already wraps try/catch, never breaks main flow, standardized format |
| Email sending | Custom email template + send | `sendOrderConfirmationEmail()` (extend params) | Already has Resend client, HTML template, formatting helpers |

**Key insight:** Phase 17 is primarily a wiring/orchestration phase. The heavy lifting (license key crypto, API token hashing, event bus, repository base, email) is already built by Phases 14-16. This phase connects the pieces.

## Runtime State Inventory

> This is a refactoring/integration phase -- replacing central API calls with local processing.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `orders.centralOrderId` (nullable text) -- new orders will leave this NULL | Code edit: `completeOrder()` does not write to this field |
| Stored data | `licenses.centralLicenseId` (nullable text) -- new licenses will leave this NULL | Code edit: `GenerateLicenseHandler` already omits this |
| Stored data | `user.centralUserId` (nullable text) -- new users/orders will leave this NULL | Code edit: `completeOrder()` does not update this field |
| Live service config | `license.devsroom.com` is an external service -- no local config to change | None: just stop calling it |
| OS-registered state | None -- verified by checking src/app/api/ routes | None |
| Secrets/env vars | `CENTRAL_API_KEY` env var -- stays in .env for Phase 20 cleanup | None: Phase 17 just stops reading it |
| Build artifacts | None -- no compiled binaries or installed packages reference central-api | None |

**Nothing found in categories:** OS-registered state, build artifacts -- verified by codebase scan.

## Common Pitfalls

### Pitfall 1: IPN Race Condition on Success Page
**What goes wrong:** Customer completes SSL Commerce payment, gets redirected to `/checkout/success?order=<id>`, but the IPN callback hasn't arrived yet. The page shows "pending verification" even though payment was successful.
**Why it happens:** SSL Commerce redirect and IPN are separate HTTP requests. The redirect can arrive before the IPN processes.
**How to avoid:** D-08 says "no polling or auto-refresh" -- show "pending verification" status with manual reload. The page already has this behavior (shows status from `getOrderDetails`). Only the copy text needs updating to mention the pending state.
**Warning signs:** Support tickets from customers saying "I paid but it says pending."

### Pitfall 2: Duplicate License Generation on Duplicate IPN
**What goes wrong:** SSL Commerce sends the same IPN twice. The order-level idempotency check (line 69-71 in IPN handler) catches most cases, but if two requests arrive simultaneously before the first commits, both could pass the order check.
**How to avoid:** Add license-level idempotency in `OrderCompletedHandler`: query for existing license by `orderId` before calling `GenerateLicenseHandler`. The `licenses.licenseKey` UNIQUE constraint provides a database-level safety net, but the application-level check prevents unnecessary key generation attempts and errors.
**Warning signs:** `unique constraint violation` errors in IPN handler logs.

### Pitfall 3: Email Failure Breaking Order Completion
**What goes wrong:** Resend API is down or `RESEND_API_KEY` is misconfigured. Email send fails and the error propagates up, causing the IPN handler to return 500.
**How it happens:** The existing IPN handler already wraps email in try/catch (lines 179-200). The `OrderCompletedHandler` must do the same -- email failure must not prevent license generation or order completion.
**How to avoid:** Wrap email sending in try/catch with `console.error` only. The existing `createAuditLog()` already follows this pattern.
**Warning signs:** Orders marked completed but no confirmation email sent.

### Pitfall 4: Event Handler Not Registered Before First Use
**What goes wrong:** `OrderCompletedHandler` is defined but never subscribed to the event registry. The `OrderCompleted` event fires but nothing processes it -- no license is generated.
**Why it happens:** Phase 14's event bus requires explicit handler registration. There's no auto-discovery.
**How to avoid:** Create a registration/init function in the billing module that calls `eventRegistry.subscribe(ORDER_EVENTS.ORDER_COMPLETED, handler)`. Ensure this runs at application startup (import it from the billing module's barrel export in a file that gets loaded during initialization).
**Warning signs:** Orders complete successfully but no license records appear in the database.

### Pitfall 5: Forgetting to Remove Central API Imports
**What goes wrong:** The IPN handler or admin-orders.ts still imports from `@/lib/central-api`. The import exists but is never called, creating dead code and confusion.
**How to avoid:** After replacing the central API block with `completeOrder()`, remove the `import { importOrderToCentral, mockImportOrderToCentral }` statements from both files. Verify with ESLint or a grep for `central-api` imports.
**Warning signs:** Build succeeds but `central-api.ts` is still in the bundle.

## Code Examples

### OrderCompleted Event Definition
```typescript
// File: src/modules/billing/domain/events/OrderEvents.ts
// Pattern: Same as src/modules/licensing/domain/events/LicenseEvents.ts

import type { BaseEvent } from "@/shared/infrastructure/eventBus/types";
import { nanoid } from "nanoid";

export const ORDER_EVENTS = {
  ORDER_COMPLETED: "order.completed",
} as const;

export interface OrderCompletedPayload {
  orderId: string;
  userId: string;
}

export function createOrderEvent(
  type: string,
  aggregateId: string,
  payload: unknown,
): BaseEvent {
  return {
    id: nanoid(),
    type,
    aggregateId,
    payload,
    timestamp: new Date(),
    metadata: { source: "billing-context", version: 1 },
  };
}
```

### BillingService.completeOrder()
```typescript
// File: src/modules/billing/application/services/OrderService.ts
// Source: CONTEXT.md D-04, D-06

import { inProcessPublisher } from "@/shared/infrastructure/eventBus/EventBus";
import { ORDER_EVENTS, createOrderEvent } from "../../domain/events/OrderEvents";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class OrderService {
  /**
   * Complete an order and trigger license generation via OrderCompleted event.
   *
   * This is the single entry point replacing both:
   * - IPN handler's central API block (lines 108-176)
   * - Admin verify's central API block (lines 82-156)
   *
   * The license exists in the DB before this method returns (synchronous D-03).
   */
  async completeOrder(orderId: string, userId: string): Promise<void> {
    // 1. Mark order as completed in DB
    await db
      .update(orders)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    // 2. Emit OrderCompleted event -- handler runs synchronously in-process
    await inProcessPublisher.publish(
      createOrderEvent(ORDER_EVENTS.ORDER_COMPLETED, orderId, {
        orderId,
        userId,
      })
    );
  }
}
```

### OrderCompletedHandler (Core Orchestration)
```typescript
// File: src/modules/billing/application/handlers/OrderCompletedHandler.ts
// Source: CONTEXT.md specifics section

import type { BaseEvent } from "@/shared/infrastructure/eventBus/types";
import { GenerateLicenseHandler } from "@/modules/licensing/application/commands/GenerateLicenseHandler";
import { LicenseRepository } from "@/modules/licensing/infrastructure/repositories/LicenseRepository";
import { ProductPlanRepository } from "@/modules/products/infrastructure/repositories/ProductPlanRepository";
import { db } from "@/lib/db";
import { orders, user, productPlans, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { sendOrderConfirmationEmail } from "@/lib/emails/order-confirmation";

export class OrderCompletedHandler {
  private licenseRepo = new LicenseRepository();

  async handle(event: BaseEvent): Promise<void> {
    const { orderId, userId } = event.payload as { orderId: string; userId: string };

    // 1. Fetch order details
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) {
      console.error(`[OrderCompletedHandler] Order ${orderId} not found`);
      return;
    }

    // 2. Idempotency: check if license already exists for this order
    const existingLicenses = await db
      .select({ id: licenses.id, licenseKey: licenses.licenseKey })
      .from(licenses)
      .where(eq(licenses.orderId, orderId))
      .limit(1);

    let licenseKey: string | undefined;
    let apiToken: string | undefined;

    if (existingLicenses.length > 0) {
      // License already generated -- skip generation
      licenseKey = existingLicenses[0].licenseKey;
    } else {
      // 3. Resolve plan details for maxActivations and expiresAt
      // ... fetch product plan, compute maxActivations, compute expiresAt

      // 4. Generate license via Phase 16 handler
      const result = await GenerateLicenseHandler.execute({
        userId,
        productId: order.productId,
        plan: order.plan,
        maxActivations: resolvedMaxActivations,
        expiresAt: resolvedExpiresAt,
        orderId,
      });

      if (result.success && result.license) {
        licenseKey = result.license.licenseKey;
        apiToken = result.apiToken;

        // 5. Audit log
        await createAuditLog({
          actorId: "system",
          actorRole: "system",
          action: "license.created",
          targetType: "license",
          targetId: result.license.id,
          details: { orderId, licenseKey, source: "order_completed_event" },
        });
      } else {
        console.error(`[OrderCompletedHandler] License generation failed: ${result.error}`);
        // D-03 synchronous: we could throw here to fail the order completion
        // Or log and let admin retry later -- depends on discretion decision
      }
    }

    // 6. Send confirmation email (wrapped in try/catch per T-04-23)
    try {
      const [orderUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
      if (orderUser?.email) {
        await sendOrderConfirmationEmail({
          to: orderUser.email,
          orderNumber: orderId.slice(0, 8),
          planName: order.plan,
          amount: order.amount,
          currency: order.currency,
          paymentMethod: order.paymentMethod ?? "unknown",
          licenseKey,
          status: "completed",
          // NOTE: apiToken param needs to be added to the email function signature
        });
      }
    } catch (emailError) {
      console.error(`[OrderCompletedHandler] Email failed for order ${orderId}:`, emailError);
    }
  }
}
```

### IPN Handler Refactored (After Phase 17)
```typescript
// File: src/app/api/ssl-commerz/ipn/route.ts
// Key change: Replace lines 97-176 with completeOrder() call

// REMOVED: import { importOrderToCentral, mockImportOrderToCentral } from "@/lib/central-api";
// ADDED:
import { OrderService } from "@/modules/billing/application/services/OrderService";
import { licenses } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  // ... steps 1-6 unchanged (validation, find order, idempotency check, update status, audit log)

  // 7. Trigger license generation via Billing Context (replaces entire central API block)
  try {
    const orderService = new OrderService();
    await orderService.completeOrder(order.id, order.userId);
  } catch (error) {
    console.error(`[IPN] Order completion failed for ${order.id}:`, error);
    // Order is marked completed, but license generation failed
    // Admin can retry later
  }

  // 8. Send confirmation email (MOVED into OrderCompletedHandler)
  // The handler sends the email, so this block is REMOVED from the IPN handler

  return NextResponse.json({ ok: true });
}
```

### Success Page Update (License Key + API Token Display)
```typescript
// File: src/app/(portal)/dashboard/checkout/success/page.tsx
// Key addition: fetch license data and display copy-friendly blocks

// Add to OrderDetails type:
type OrderDetails = {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  status: string;
  discountAmount: number | null;
  taxAmount: number | null;
  createdAt: Date;
  licenseKey?: string | null;   // NEW
  apiToken?: string | null;     // NEW
};

// Add license display block when isCompleted && licenseKey:
// <div className="rounded-lg bg-green-50 border-2 border-green-200 px-6 py-4 text-center">
//   <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Your License Key</p>
//   <p className="font-mono text-lg font-semibold">{licenseKey}</p>
//   <button onClick={copyToClipboard}>Copy</button>
// </div>
// <div className="rounded-lg bg-amber-50 border-2 border-amber-200 px-6 py-4 text-center">
//   <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
//     Save this API token -- it won't be shown again
//   </p>
//   <p className="font-mono text-lg font-semibold">{apiToken}</p>
//   <button onClick={copyToClipboard}>Copy</button>
// </div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `importOrderToCentral()` HTTP call | Local `GenerateLicenseHandler` + domain events | Phase 16-17 | License exists in DB before response returns, no network dependency |
| Central API mock in dev | Real local generation in all environments | Phase 16 | Same code path in dev and prod, no mock fallback needed |
| Direct DB inserts in IPN handler | Repository pattern with mapper | Phase 14-17 | Type-safe, testable, consistent entity mapping |
| Inline license creation in multiple places | Single `GenerateLicenseHandler` entry point | Phase 16 | One code path for all license generation |

**Deprecated/outdated:**
- `importOrderToCentral()` and `mockImportOrderToCentral()`: Being disconnected in Phase 17, deleted in Phase 20.
- Direct `db.insert(licenses).values(...)` in IPN/admin-verify: Replaced by `GenerateLicenseHandler.execute()` which handles key gen, token hashing, and event publishing.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `inProcessPublisher.publish()` triggers `eventRegistry` handlers synchronously in the same call stack | Architecture Patterns | If events are truly async (fire-and-forget), the license won't exist when IPN returns, breaking D-03. Verification: `EventEmitterBus` uses Node.js `EventEmitter.emit()` which IS synchronous. The `inProcessPublisher` wraps the result in `Promise.resolve()` but the handler still runs synchronously. |
| A2 | `getOrderDetails()` in checkout.ts can be extended to also return license key and API token for the order | Architecture Patterns | If the function cannot be modified (e.g., it returns a raw DB row), the success page would need a separate query. Verification: `getOrderDetails` does a raw `db.select().from(orders)` -- it can be extended with a JOIN to licenses, or a separate call. |
| A3 | The `OrderCompleted` event handler needs to resolve `maxActivations` and `expiresAt` from the `productPlans` table, not from the order's `plan` field directly | Architecture Patterns | The order stores `plan` as a string (e.g., "Starter"), and the `productPlans` table has `maxActivations` and `licenseType`/`billingDurationMonths`. The handler must do a lookup. This is correct per Phase 15's plan entity design. |
| A4 | No inbound webhook API routes exist for `license.devsroom.com` -- only the `importOrderToCentral` calls in IPN handler and admin-orders.ts | Phase Requirements | If there are undiscovered webhook routes, ARCH-08 won't be fully satisfied. Verification: Grep for `webhook` in `src/app/api/` found no webhook routes; the webhook admin pages are CRUD for outbound webhooks only. |

## Open Questions

1. **Handler registration timing**
   - What we know: `eventRegistry` is a singleton, handlers need explicit `subscribe()` calls.
   - What's unclear: Where should the `OrderCompletedHandler` registration happen? Options: (a) in `src/modules/billing/index.ts` barrel export as a side effect, (b) in a dedicated `registerHandlers()` function called from app initialization, (c) lazy registration on first `completeOrder()` call.
   - Recommendation: Option (b) -- explicit `registerBillingHandlers()` function exported from the billing module barrel. The app's startup code (or layout.tsx) calls it once. This is Claude's discretion per CONTEXT.md.

2. **License generation failure strategy**
   - What we know: D-03 says synchronous processing. If `GenerateLicenseHandler` fails, the order is already marked "completed" in DB.
   - What's unclear: Should the error propagate (causing IPN to return 500, which SSL Commerce might retry) or be swallowed (order completed but no license, admin must manually retry)?
   - Recommendation: Throw the error for IPN (SSL Commerce will retry the IPN, and the idempotency check will skip the already-completed order status check but the handler's license-level idempotency will handle retry). For admin verify, return a user-facing error. This is Claude's discretion.

3. **API token delivery in email**
   - What we know: The current `sendOrderConfirmationEmail()` signature has `licenseKey?: string` but no `apiToken` parameter.
   - What's unclear: Whether to add `apiToken` to the existing function or create a separate email template.
   - Recommendation: Add `apiToken?: string` to the existing `OrderConfirmationParams` interface. Update the HTML template to show the API token in a distinct visual block with a warning callout. This is Claude's discretion.

## Environment Availability

> Step 2.6: This phase depends on PostgreSQL and Redis (for the event bus cross-process mode), plus the Resend email service.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL | OrderRepository, LicenseRepository | Assumed (production) | -- | -- |
| Redis | EventBus (cross-process mode) | Assumed (production) | -- | Phase 17 uses `inProcessEventBus` (no Redis needed for sync mode) |
| Resend API | Confirmation email | Assumed (production) | 6.12.3 | try/catch wrapping prevents email failure from blocking |
| Node.js | Runtime | Yes | -- | -- |
| pnpm | Package management | Yes | -- | -- |

**Missing dependencies with no fallback:** None identified -- all infrastructure is already in place from Phases 14-16.

**Missing dependencies with fallback:** Redis not needed for Phase 17's synchronous processing (uses `inProcessEventBus`).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- no test framework installed |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LSTAT-05 | Admin revoke/suspend creates audit log | manual-only | N/A | N/A |
| LSTAT-06 | License creation triggers audit + email | manual-only | N/A | N/A |
| ARCH-06 | central-api.ts no longer imported by IPN/admin-orders | manual-only | `grep -r "central-api" src/app/` | N/A |
| ARCH-08 | No central API calls in IPN/admin-verify flow | manual-only | `grep "importOrderToCentral" src/` | N/A |

### Sampling Rate
- **Per task commit:** Manual verification of changed files
- **Per wave merge:** Manual end-to-end test of checkout flow
- **Phase gate:** Full manual verification of both IPN and admin-verify paths

### Wave 0 Gaps
- [ ] No test framework is installed. This project has no test infrastructure (`__tests__/`, `*.test.*`, `vitest.config.*`, `jest.config.*`).
- [ ] Consider whether Phase 17 should establish basic test infrastructure (vitest) for the billing module.
- [ ] At minimum, add a grep/smoke test to verify `central-api` imports are removed.

*If no test infrastructure is established: All validation is manual. Planner should include explicit verification steps in tasks.*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAdmin()` guard on admin verify, `auth.api.getSession()` on portal |
| V3 Session Management | yes | Better Auth session management (unchanged) |
| V4 Access Control | yes | Admin-only verify, user-scoped order queries |
| V5 Input Validation | yes | Order ID validation, payment validation via SSL Commerce |
| V6 Cryptography | yes | `GenerateLicenseHandler` uses `crypto.randomBytes()` for keys, SHA-256 for API tokens |

### Known Threat Patterns for Billing Integration

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Duplicate IPN → duplicate license | Tampering | Idempotency at order level (existing) + license level (new) |
| License key enumeration | Information disclosure | UUID order IDs, rate limiting on API endpoints |
| Email token leakage | Information disclosure | API token shown once in email; subsequent views only in portal |
| Race condition on activation count | Tampering | Atomic DB operations in `LicenseRepository` (Phase 16) |

## Sources

### Primary (HIGH confidence)
- Codebase: `src/modules/licensing/domain/events/LicenseEvents.ts` -- event pattern template
- Codebase: `src/modules/products/infrastructure/repositories/ProductRepository.ts` -- repository pattern template
- Codebase: `src/shared/infrastructure/eventBus/EventBus.ts` -- EventBus publisher/subscriber facades
- Codebase: `src/shared/infrastructure/eventBus/registry.ts` -- EventRegistry with error isolation
- Codebase: `src/modules/licensing/application/commands/GenerateLicenseHandler.ts` -- license generation API
- Codebase: `src/app/api/ssl-commerz/ipn/route.ts` -- current IPN handler being refactored
- Codebase: `src/app/(admin)/actions/admin-orders.ts` -- current admin verify being refactored
- Codebase: `src/modules/billing/` -- empty stubs to populate
- Codebase: `src/lib/db/schema.ts` -- orders, licenses, products tables

### Secondary (MEDIUM confidence)
- `.planning/REQUIREMENTS.md` -- LSTAT-05, LSTAT-06, ARCH-06, ARCH-08 requirements
- `.planning/ROADMAP.md` -- Phase 17 success criteria
- `.planning/phases/17-billing-integration/17-CONTEXT.md` -- locked decisions D-01 through D-13

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all dependencies already installed, no new packages needed
- Architecture: HIGH -- following established patterns from Phases 14-16, same DDD layering
- Pitfalls: HIGH -- identified from reading actual codebase (IPN race condition, duplicate IPN, email failure)
- Event wiring: MEDIUM -- `inProcessPublisher` triggers synchronous handlers, but the exact registration timing is a discretion decision

**Research date:** 2026-06-03
**Valid until:** 2026-07-03 (stable -- no fast-moving dependencies)
