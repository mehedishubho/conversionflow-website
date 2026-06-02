# Phase 17: Customer & Billing Integration - Context

**Gathered:** 2026-06-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Refactor checkout and billing to generate licenses locally via domain events when orders complete — removing the dependency on `license.devsroom.com` (`src/lib/central-api.ts`) for new orders. The Billing Bounded Context (`src/modules/billing/`) is populated with an `OrderService` that emits `OrderCompleted` events, and an event handler orchestrates license generation, audit logging, and customer email delivery.

This phase builds the **Billing Bounded Context** within `src/modules/billing/` using the DDD layers established in Phase 14. It populates the empty stubs with order lifecycle services and event handlers.

**In scope:**
- `OrderCompleted` domain event with minimal payload (orderId + userId)
- `OrderService.completeOrder()` in Billing Context — emits OrderCompleted, called by IPN handler and admin verify
- Event handler that orchestrates: query DB for order/user/product data → call `GenerateLicenseHandler` → create audit log → send confirmation email with license key + API token
- Checkout success page update to show license key + API token when order is completed
- Confirmation email update to include license key + API token
- Remove central API calls from IPN handler and admin verify — replace with `OrderService.completeOrder()`
- Remove central API inbound webhook handlers (dead code)
- `src/lib/central-api.ts` file stays (unused) — Phase 20 deletes it

**NOT in scope (later phases):**
- Moving checkout server actions (createManualOrder, validateCoupon, calculateVAT) into Billing Context
- Full DDD rewrite of checkout/payment routes
- Subscription lifecycle: expiry tracking, grace periods, renewal reminders (Phase 18)
- License analytics dashboard, transfer system (Phase 19)
- Removing `centralOrderId`/`centralLicenseId`/`centralUserId` fields and `src/lib/central-api.ts` (Phase 20)
- BullMQ background workers (Phase 18)
- Outbound webhook delivery system (Phase 19)

</domain>

<decisions>
## Implementation Decisions

### Order Event Design
- **D-01:** Single domain event: `OrderCompleted`. No separate `OrderCreated`, `OrderRefunded`, or `PaymentVerified` events. The handler orchestrates all downstream work (license generation → audit log → email) in one sequence. Simplicity over flexibility for the initial implementation.
- **D-02:** Minimal payload: `{ orderId: string, userId: string }`. The event handler queries the database for order details, user info, and product/plan data at processing time. This avoids stale data risk and keeps the event contract stable.
- **D-03:** Synchronous processing. The `OrderCompleted` event handler runs in-process within the IPN or admin verify request. The license exists in the database before the response returns. No BullMQ queue at this stage (Phase 18 adds async workers for subscriptions).

### Checkout Refactoring Scope
- **D-04:** Extract a `BillingService.completeOrder()` method in `src/modules/billing/application/services/`. This service: (1) marks the order as completed in DB, (2) emits `OrderCompleted` event via EventBus, (3) the event handler generates the license. Both the IPN handler and admin verify call this service instead of calling `importOrderToCentral()` directly.
- **D-05:** Existing checkout server actions (`createManualOrder`, `validateCoupon`, `calculateVAT` in `src/app/(portal)/actions/checkout.ts`) stay as-is. Phase 17 only replaces the central API call — it does NOT refactor the checkout UI, coupon system, VAT calculation, or SSL session creation into the Billing Context.
- **D-06:** IPN handler (`src/app/api/ssl-commerz/ipn/route.ts`) and admin verify (`src/app/(admin)/actions/admin-orders.ts`) become thin delegates: validate payment → call `BillingService.completeOrder()` → return response. The license generation orchestration moves into the Billing Context.

### License Delivery Experience
- **D-07:** License key and API token delivered via both email AND checkout success page. Maximum convenience for BD customers — no matter which flow (SSL Commerce redirect or manual payment verification), the customer gets their credentials immediately.
- **D-08:** Checkout success page (`src/app/(portal)/dashboard/checkout/success/page.tsx`) fetches the order and shows license key + API token inline when status is `completed`. If IPN hasn't processed yet (race condition), shows "pending verification" status. No polling or auto-refresh — customer can reload manually.
- **D-09:** Confirmation email includes both license key and API token in a clear, copy-friendly format. The email template should show the license key in a monospace block and the API token with a "copy this" callout. Follow existing email template patterns.

### Central API Transition
- **D-10:** Cut over immediately for new orders. Remove `importOrderToCentral()` calls from IPN handler and admin verify. Only local license generation via `GenerateLicenseHandler`. No feature flag, no dual-write.
- **D-11:** `src/lib/central-api.ts` file stays in the codebase but is no longer imported or called by Phase 17 code. Phase 20 will delete it entirely along with `centralOrderId`/`centralLicenseId`/`centralUserId` fields.
- **D-12:** New orders do NOT set `centralOrderId`, `centralLicenseId`, or `centralUserId`. These fields remain NULL for Phase 17+ orders. Existing v2.x orders retain their values untouched.
- **D-13:** Remove central API inbound webhook handlers. The webhook schema/table stays for Phase 19's outbound webhook system, but inbound handlers for `license.devsroom.com` events are deleted.

### Claude's Discretion
- Exact `OrderService` class structure (single class vs separate command/query handlers)
- Event handler registration mechanism (in-module init vs centralized registry)
- Email template design for license delivery
- Success page component layout for license key + API token display
- Error handling strategy when license generation fails inside the event handler (retry? fail the order completion?)
- How to handle the IPN race condition on the success page (simple check on load vs auto-polling)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-Level Specs
- `.planning/REQUIREMENTS.md` §"License Status & Subscriptions (LSTAT)" — LSTAT-05 (admin revoke/suspend), LSTAT-06 (audit log + notifications on status change) — Phase 17 scope
- `.planning/REQUIREMENTS.md` §"Architecture & Migration (ARCH)" — ARCH-06 (remove central-api.ts), ARCH-08 (remove central webhook handlers) — Phase 17 starts this; Phase 20 completes it
- `.planning/PROJECT.md` §"Key Decisions" — Self-contained licensing, Service Layer, Repository Pattern decisions

### Roadmap
- `.planning/ROADMAP.md` §"Phase 17: Customer & Billing Integration" — Success criteria 1-5, dependency on Phase 15 + 16

### Phase 14 Infrastructure (MUST use)
- `src/shared/infrastructure/eventBus/EventBus.ts` — EventBus factory and pre-configured instances (inProcessEventBus, crossProcessEventBus)
- `src/shared/infrastructure/eventBus/types.ts` — BaseEvent interface (OrderCompleted must implement this)
- `src/shared/infrastructure/repositories/BaseRepository.ts` — Base CRUD repository for OrderRepository
- `src/shared/infrastructure/eventBus/registry.ts` — Event handler registry with error isolation

### Phase 15 Patterns (Billing module follows same structure)
- `src/modules/products/domain/entities/Product.ts` — Entity pattern reference
- `src/modules/products/infrastructure/repositories/ProductRepository.ts` — Repository extending BaseRepository pattern
- `src/modules/products/domain/events/ProductEvents.ts` — Domain events pattern (OrderEvents follows same shape)

### Phase 16 Licensing (MUST integrate)
- `src/modules/licensing/application/commands/GenerateLicenseHandler.ts` — **CRITICAL**: This is what the OrderCompleted handler calls to generate licenses. Accepts productId, plan, userId, orderId. Returns plaintext license key + API token.
- `src/modules/licensing/domain/events/LicenseEvents.ts` — LicenseCreated, LicenseRevoked events (emitted by GenerateLicenseHandler)
- `src/modules/licensing/domain/services/LicenseKeyGenerator.ts` — Generates CF-XXXX-XXXX-XXXX-XXXX-XXXX keys

### Existing Code Being Modified
- `src/app/api/ssl-commerz/ipn/route.ts` — **IPN handler**: Lines 108-176 contain the central API sync logic being replaced. The entire block from central API call through license insert becomes a single `BillingService.completeOrder()` call.
- `src/app/(admin)/actions/admin-orders.ts` — **Admin verify**: Lines 82-156 contain the central API sync logic being replaced. Same transformation as IPN handler.
- `src/app/(portal)/dashboard/checkout/success/page.tsx` — **Success page**: Needs update to fetch and display license key + API token when order is completed.
- `src/lib/central-api.ts` — **Central API client**: Being disconnected (not deleted). File stays for Phase 20 cleanup.

### Billing Module (empty stubs to populate)
- `src/modules/billing/index.ts` — Barrel export
- `src/modules/billing/domain/index.ts` — Empty, needs OrderCompleted event
- `src/modules/billing/application/index.ts` — Empty, needs OrderService
- `src/modules/billing/infrastructure/index.ts` — Empty, needs OrderRepository

### Existing Schema (must work with)
- `src/lib/db/schema.ts` — `orders` table (lines 181-200): `centralOrderId` nullable — Phase 17 leaves it NULL for new orders
- `src/lib/db/schema.ts` — `licenses` table (lines 202-225): `centralLicenseId` nullable — Phase 17 leaves it NULL for new licenses
- `src/lib/db/schema.ts` — `user` table (lines 100-118): `centralUserId` nullable — Phase 17 doesn't set it

### Existing Infrastructure (must use)
- `src/lib/redis.ts` — Redis cache helpers for license validation cache interaction
- `src/lib/audit.ts` — Audit log system (wrapped in try/catch, never breaks main flow)
- `src/lib/ssl-commerz.ts` — SSL Commerce payment validation (unchanged by Phase 17)
- `src/app/(portal)/actions/checkout.ts` — Checkout server actions (unchanged by Phase 17)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`GenerateLicenseHandler`** (`src/modules/licensing/application/commands/GenerateLicenseHandler.ts`) — The core Phase 16 artifact. Accepts product/plan/user/order info, generates license key + API token, publishes `LicenseCreated` event. Phase 17's event handler calls this directly.
- **`EventBus`** (`src/shared/infrastructure/eventBus/EventBus.ts`) — Pre-configured `inProcessEventBus` for synchronous event publishing. `OrderCompleted` uses this.
- **`BaseRepository`** — Extend for `OrderRepository` in billing infrastructure layer.
- **`audit()` function** (`src/lib/audit.ts`) — Already tracks `order.created`, `order.status_changed`, `license.created` actions. Phase 17 continues using this pattern.
- **Admin UI components** — `ComponentCard`, `PageBreadcrumb`, existing admin page patterns for any admin-facing changes.

### Established Patterns
- **DDD module layering** — `domain/` (events, entities), `application/` (services, commands), `infrastructure/` (repositories, adapters). Phase 15's `products` module is the template for `billing`.
- **Event pattern** — `ProductEvents.ts` and `LicenseEvents.ts` define event types as constants. `OrderEvents.ts` follows the same shape.
- **Server action pattern** — `src/app/(admin)/actions/admin-{resource}.ts` with `requireAdmin()` guard. Admin verify is already in `admin-orders.ts`.
- **IPN handler pattern** — Validates payment server-to-server, marks order completed. Phase 17 changes what happens AFTER completion (local generation vs central API).

### Integration Points
- **`src/modules/billing/`** — Empty stubs from Phase 14. Phase 17 populates: `domain/events/OrderEvents.ts`, `application/services/OrderService.ts`, `application/handlers/OrderCompletedHandler.ts`, `infrastructure/repositories/OrderRepository.ts`.
- **IPN handler** (`src/app/api/ssl-commerz/ipn/route.ts`) — Replace lines 108-176 (central API sync block) with `await orderService.completeOrder(orderId, userId)`.
- **Admin verify** (`src/app/(admin)/actions/admin-orders.ts`) — Replace lines 82-156 (central API sync block) with same `orderService.completeOrder()` call.
- **Success page** (`src/app/(portal)/dashboard/checkout/success/page.tsx`) — Fetch order's associated license and display key + token.
- **Confirmation email** — Update email template to include license key + API token. The email send is already in the IPN handler; extend it with license data.

</code_context>

<specifics>
## Specific Ideas

- The `OrderCompletedHandler` should be a single class that orchestrates: (1) fetch order from DB, (2) fetch user from DB, (3) fetch product/plan details, (4) call `GenerateLicenseHandler`, (5) write audit log, (6) send confirmation email with license key + API token. All in sequence, all synchronous.
- The success page should show a "copy to clipboard" button next to both the license key and API token. BD customers often access the portal on mobile — make copying easy.
- For the email, use a distinct visual block for the API token: "⚠️ Save this API token — it won't be shown again in email." The token IS visible in the portal, but creating urgency to save it reduces support tickets.
- The `BillingService.completeOrder()` method should be idempotent — if called twice for the same order (e.g., duplicate IPN), it should detect the existing license and return it instead of generating a duplicate. Check for existing license by `orderId` before generating.
- The IPN handler already has an idempotency check at line 69-71 (returns 200 if order already completed). `BillingService.completeOrder()` should also be idempotent at the license level as a safety net.

</specifics>

<deferred>
## Deferred Ideas

- **Moving checkout server actions into Billing Context** — `createManualOrder`, `validateCoupon`, `calculateVAT` stay in `src/app/(portal)/actions/checkout.ts`. Future refactor can move them to `billing/application/services/`.
- **Full DDD rewrite of payment routes** — SSL Commerce session creation, IPN validation, and success page routing stay as Next.js API routes. Only the "what happens after completion" logic moves to the Billing Context.
- **Feature flag system for gradual rollout** — Phase 17 does immediate cutover. If gradual rollout is needed for future migrations, that pattern belongs in Phase 20.
- **BullMQ async processing for order completion** — Phase 18 introduces BullMQ for subscription jobs. Phase 17 stays synchronous. If async processing is needed later, the `OrderCompletedHandler` can be adapted to run as a worker.
- **Outbound webhook delivery** — Schema exists (`webhooks`, `webhookDeliveries` tables) but no dispatcher. Phase 19 builds this.
- **Removing `src/lib/central-api.ts`** and `centralOrderId`/`centralLicenseId`/`centralUserId` fields — explicitly Phase 20.
- **Refund/cancellation events** — `OrderRefunded` is not needed in Phase 17. If refund processing needs to trigger license revocation, that belongs in Phase 18 (Subscription & Status Management).

</deferred>

---

*Phase: 17-billing-integration*
*Context gathered: 2026-06-03*
