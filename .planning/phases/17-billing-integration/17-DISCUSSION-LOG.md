# Phase 17: Customer & Billing Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-03
**Phase:** 17-billing-integration
**Areas discussed:** Order event design, Checkout refactoring scope, License delivery experience, Central API transition

---

## Order Event Design

| Option | Description | Selected |
|--------|-------------|----------|
| Single event | OrderCompleted only. Handler orchestrates license gen → audit → email. | ✓ |
| Multiple event types | OrderCreated, OrderCompleted, OrderRefunded with separate handlers. | |
| Event chain | OrderCompleted triggers secondary events (LicenseGenerated, EmailSent). | |

**User's choice:** Single event (Recommended)
**Notes:** Simplicity over flexibility. One event, one handler, one sequence.

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal payload | orderId + userId only. Handler queries DB for fresh data. | ✓ |
| Full snapshot | All order/user/product data in event payload. No DB queries needed. | |

**User's choice:** Minimal payload (Recommended)
**Notes:** Avoids stale data. Event contract stays stable even if schema changes.

| Option | Description | Selected |
|--------|-------------|----------|
| Synchronous | Runs in-process within IPN/admin request. License exists before response. | ✓ |
| Async (queued) | Goes to Redis/BullMQ queue. Decoupled but adds complexity. | |

**User's choice:** Synchronous (Recommended)
**Notes:** Phase 18 adds BullMQ for subscriptions. Phase 17 keeps it simple.

---

## Checkout Refactoring Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Extract service layer | Create BillingService.completeOrder(). Routes delegate to service. | ✓ |
| Full DDD rewrite | Move ALL order/payment logic into Billing Context. Bigger rewrite. | |
| Minimal swap | Just swap importOrderToCentral() with GenerateLicenseHandler inline. | |

**User's choice:** Extract service layer (Recommended)
**Notes:** Pragmatic middle ground. Routes stay, orchestration moves to service.

| Option | Description | Selected |
|--------|-------------|----------|
| License gen only | Just replace central API calls. Checkout actions stay as-is. | ✓ |
| Full checkout service | Move createManualOrder, validateCoupon, calculateVAT into Billing Context too. | |

**User's choice:** License gen only (Recommended)
**Notes:** Focused scope. Checkout server actions untouched. Lower risk.

---

## License Delivery Experience

| Option | Description | Selected |
|--------|-------------|----------|
| Email + success page | Both delivered everywhere. Maximum convenience. | ✓ |
| Portal only | License shown only in dashboard. More secure but less convenient. | |
| Key in email, token in portal | Split delivery. Middle ground. | |

**User's choice:** Email + success page (Recommended)
**Notes:** BD customers need immediate access regardless of payment flow.

| Option | Description | Selected |
|--------|-------------|----------|
| Show on success page | Fetch order, show license inline if processed. Pending if not. | ✓ |
| Separate notification | License delivered via separate email/notification after generation. | |

**User's choice:** Show on success page (Recommended)
**Notes:** Handles IPN race condition naturally — shows pending if IPN hasn't arrived yet.

---

## Central API Transition

| Option | Description | Selected |
|--------|-------------|----------|
| Cut over immediately | Remove central API calls. Only local generation. Clean cut. | ✓ |
| Feature flag dual-write | Flag controls which system generates. Can flip back if issues. | |
| Dual-write both systems | Generate locally AND call central API. Maximum safety. | |

**User's choice:** Cut over immediately (Recommended)
**Notes:** New orders use local generation only. Central API file stays unused until Phase 20.

| Option | Description | Selected |
|--------|-------------|----------|
| Remove handlers | Delete dead code. Webhook schema stays for Phase 19. | ✓ |
| Keep dormant | Leave handlers in place as rollback safety net. | |

**User's choice:** Remove handlers (Recommended)
**Notes:** Dead code adds confusion. Clean removal.

---

## Claude's Discretion

- OrderService class structure (single class vs command/query handlers)
- Event handler registration mechanism
- Email template design for license delivery
- Success page layout for license key + API token display
- Error handling when license generation fails in event handler
- IPN race condition handling on success page

## Deferred Ideas

None — discussion stayed within phase scope.
