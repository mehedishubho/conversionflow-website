---
phase: 34-multi-gateway-payment-system
plan: 01
subsystem: payments
tags: [payment-gateway, abstraction, drizzle, aes-256-gcm, ddd, strategy-pattern]

# Dependency graph
requires:
  - phase: 24-licensing-engine
    provides: "Billing OrderService.completeOrder() convergence point"
  - phase: 17-billing-integration
    provides: "OrderEvents pattern, event bus infrastructure"
provides:
  - "IPaymentGateway interface with 7 methods for all gateway adapters"
  - "GatewayRegistry singleton for adapter registration and lookup"
  - "PaymentService orchestrating order creation and gateway sessions"
  - "AES-256-GCM encryption utility for gateway credential storage"
  - "GatewayConfigRepository with encrypted config CRUD"
  - "payment_gateways and payment_webhook_events database tables"
  - "Extended orders table with gatewayId, gatewayTransactionId columns"
  - "paymentMethod text column migration from pgEnum"
  - "initializePaymentsModule() wiring in module-init"
affects: [34-02-ssl-commerz-adapter, 34-03-paddle-adapter, 34-04-bkash-adapter, checkout, admin-settings]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Strategy pattern via IPaymentGateway interface for multi-gateway support"
    - "Singleton registry (GatewayRegistry) for adapter lookup by gatewayId"
    - "AES-256-GCM authenticated encryption for credential storage at rest"
    - "Encrypted JSONB config in payment_gateways table"
    - "Text-based paymentMethod (D-36) replacing pgEnum for flexibility"

key-files:
  created:
    - src/modules/payments/domain/IPaymentGateway.ts
    - src/modules/payments/domain/PaymentError.ts
    - src/modules/payments/domain/events/PaymentEvents.ts
    - src/modules/payments/domain/value-objects/GatewayConfig.ts
    - src/modules/payments/domain/value-objects/PaymentSession.ts
    - src/modules/payments/infrastructure/crypto.ts
    - src/modules/payments/infrastructure/repositories/GatewayConfigRepository.ts
    - src/modules/payments/infrastructure/index.ts
    - src/modules/payments/application/GatewayRegistry.ts
    - src/modules/payments/application/PaymentService.ts
    - src/modules/payments/application/index.ts
    - src/modules/payments/index.ts
  modified:
    - src/lib/db/schema.ts
    - src/lib/module-init.ts
    - src/components/admin/OrdersTable.tsx
    - src/components/invoice/InvoiceHTML.tsx
    - src/components/portal/InvoiceTable.tsx

key-decisions:
  - "IPaymentGateway defines 7 methods: createSession, verifyPayment, handleWebhook, processRefund, getPaymentStatus, validateConfig, getRequiredConfigFields"
  - "GatewayRegistry is singleton with Map<string, IPaymentGateway> keyed by gatewayId"
  - "PaymentService.completePaymentFromWebhook() converges on OrderService.completeOrder() for all flows"
  - "AES-256-GCM encryption format: iv:tag:ciphertext (base64) stored in payment_gateways.config JSONB"
  - "paymentMethod changed from pgEnum to text to support any gateway-defined method ID"

patterns-established:
  - "Gateway adapter pattern: implement IPaymentGateway, register in GatewayRegistry via module-init"
  - "Config encryption pattern: encrypt on write, decrypt on read via GatewayConfigRepository"
  - "Unified order lifecycle: pending order created first, completed via webhook or admin verify"

requirements-completed: [PAY-01]

# Metrics
duration: 7min
completed: 2026-06-10
---

# Phase 34 Plan 01: Payment Gateway Abstraction Layer Summary

**IPaymentGateway interface with 7 lifecycle methods, GatewayRegistry singleton, PaymentService orchestrator, AES-256-GCM crypto utility, and database schema for payment_gateways/payment_webhook_events tables**

## Performance

- **Duration:** 7 min
- **Started:** 2026-06-10T17:16:47Z
- **Completed:** 2026-06-10T17:23:54Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Complete payments bounded context with DDD layering (domain, application, infrastructure)
- IPaymentGateway interface defines the contract all 3 gateway adapters (SSL Commerz, Paddle, bKash) implement
- AES-256-GCM encryption utility secures gateway credentials at rest in payment_gateways.config
- Database schema extended with payment_gateways, payment_webhook_events tables and orders table gateway columns
- paymentMethod migrated from pgEnum to text type enabling flexible gateway-defined method IDs
- initializePaymentsModule() wired into module-init.ts for startup registration

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema, domain types, crypto, and repository** - `ba84799` (feat)
2. **Task 2: GatewayRegistry, PaymentService, module init wiring** - `9a77978` (feat)

## Files Created/Modified
- `src/modules/payments/domain/IPaymentGateway.ts` - IPaymentGateway interface with 7 methods, all param/result types
- `src/modules/payments/domain/PaymentError.ts` - Typed error categories (NETWORK_ERROR, INVALID_CONFIG, PAYMENT_FAILED, etc.)
- `src/modules/payments/domain/events/PaymentEvents.ts` - PAYMENT_COMPLETED/FAILED/REFUNDED/WEBHOOK_RECEIVED events
- `src/modules/payments/domain/value-objects/GatewayConfig.ts` - Gateway config value object with GatewayStatus type
- `src/modules/payments/domain/value-objects/PaymentSession.ts` - Payment session value object extending CreateSessionResult
- `src/modules/payments/infrastructure/crypto.ts` - AES-256-GCM encryptConfig/decryptConfig utilities
- `src/modules/payments/infrastructure/repositories/GatewayConfigRepository.ts` - CRUD for payment_gateways table with auto encrypt/decrypt
- `src/modules/payments/infrastructure/index.ts` - Infrastructure barrel exports
- `src/modules/payments/application/GatewayRegistry.ts` - Singleton registry with register/get/getForCurrency/getAll
- `src/modules/payments/application/PaymentService.ts` - Orchestrates createPendingOrder, initiatePayment, completePaymentFromWebhook, refundPayment, testConnection
- `src/modules/payments/application/index.ts` - Application barrel exports
- `src/modules/payments/index.ts` - Module init + public API re-exports
- `src/lib/db/schema.ts` - Added gatewayStatusEnum, paymentGateways table, paymentWebhookEvents table; changed orders.paymentMethod and paymentAccounts.method to text; added gatewayId/gatewayTransactionId to orders
- `src/lib/module-init.ts` - Added initializePaymentsModule() import and call
- `src/components/admin/OrdersTable.tsx` - Updated paymentMethod type from enum union to string | null
- `src/components/invoice/InvoiceHTML.tsx` - Updated OrderWithUser.paymentMethod type to string | null
- `src/components/portal/InvoiceTable.tsx` - Updated OrderRow.paymentMethod type to string | null

## Decisions Made
- IPaymentGateway includes 7 methods covering full lifecycle: session creation, payment verification, webhook handling, refund, status query, config validation, and config field definitions
- GatewayRegistry uses singleton pattern to ensure single source of truth for adapter registration
- PaymentService.completePaymentFromWebhook() is the single convergence point calling OrderService.completeOrder() for all gateway flows (D-41)
- AES-256-GCM was chosen for authenticated encryption (integrity + confidentiality) over AES-CBC
- paymentMethodEnum definition kept with DEPRECATED comment for Drizzle migration compatibility
- GatewayConfigRepository encrypts on save, decrypts on read - callers never handle raw encrypted data
- Drizzle push deferred from worktree (no DB access) to be run from main directory by orchestrator

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Fixed paymentMethod type errors in 3 component files**
- **Found during:** Task 1 (schema change from pgEnum to text)
- **Issue:** Changing orders.paymentMethod from paymentMethodEnum to text() caused TypeScript errors in OrdersTable.tsx, InvoiceHTML.tsx, and InvoiceTable.tsx where the type was explicitly typed as the enum union
- **Fix:** Updated all 3 files to use `string | null` instead of the hardcoded enum union type
- **Files modified:** src/components/admin/OrdersTable.tsx, src/components/invoice/InvoiceHTML.tsx, src/components/portal/InvoiceTable.tsx
- **Verification:** `npx tsc --noEmit` passes with no paymentMethod-related errors
- **Committed in:** ba84799 (part of Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical type compatibility)
**Impact on plan:** Necessary fix for schema migration correctness. No scope creep.

## Issues Encountered
- `pnpm exec tsc --noEmit` failed because tsc is not directly available via pnpm exec on this system; used `npx tsc --noEmit` instead
- Drizzle push (`npx drizzle-kit push`) failed due to missing DATABASE_URL in worktree environment; this is expected for parallel worktree execution and will be run from the main directory

## User Setup Required
None - no external service configuration required for this plan.

## Next Phase Readiness
- Payments module foundation is complete and ready for adapter implementations (Plans 02/03/04)
- SSL Commerz adapter can now be built implementing IPaymentGateway
- Paddle adapter can now be built implementing IPaymentGateway
- bKash adapter can now be built implementing IPaymentGateway
- Drizzle push must be run from main directory to create new tables in database
- ENCRYPTION_KEY env var must be set before gateway configs can be saved

---
*Phase: 34-multi-gateway-payment-system*
*Completed: 2026-06-10*

## Self-Check: PASSED

All 13 created/modified files verified present. Both commits (ba84799, 9a77978) verified in git log. TypeScript compilation passes with zero errors in payments module.
