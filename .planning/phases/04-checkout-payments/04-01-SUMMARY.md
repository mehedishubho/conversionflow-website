---
phase: 04-checkout-payments
plan: 01
subsystem: database, payments
tags: [drizzle, postgresql, server-actions, checkout, coupons, vat, payment-accounts]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "DB schema, Drizzle ORM, auth, server action patterns"
  - phase: 03-customer-portal
    provides: "Portal action patterns (support.ts), audit logging"
provides:
  - "payment_accounts table with method-specific columns (D-10, D-11)"
  - "settings key/value table (D-15)"
  - "validateCoupon server action with transactional race-safety (T-04-03)"
  - "createManualOrder server action with server-side price validation (T-04-01) and dedup check (D-21)"
  - "calculateVAT server action reading from settings table (D-15, D-16)"
  - "getPaymentAccounts server action for checkout page display (D-10)"
  - "Default seed data: VAT settings, 5 placeholder payment accounts, LAUNCH20 coupon"
affects: [04-02, 04-03, 04-04, 04-05, 04-06]

# Tech tracking
tech-stack:
  added: [nanoid]
  patterns: [server-side-price-validation, transactional-coupon-validation, payment-ref-dedup]

key-files:
  created:
    - "src/app/(portal)/actions/checkout.ts"
  modified:
    - "src/lib/db/schema.ts"
    - "src/lib/db/seed.ts"
    - ".env.example"

key-decisions:
  - "PLAN_PRICES constant in checkout.ts provides authoritative server-side price map (never trusts client amount)"
  - "validateCoupon increments currentUses within db.transaction() to prevent race condition on maxUses"
  - "Payment account placeholders seeded as inactive to prevent accidental display before admin config"

patterns-established:
  - "Server-side price validation: PLAN_PRICES lookup from plan name, reject if not found"
  - "Transactional coupon validation: select + validate + increment in single db.transaction()"
  - "Payment reference dedup: query orders.paymentRef before insert to prevent double-spending"

requirements-completed: [PAY-01, PAY-03, PAY-04]

# Metrics
duration: 4min
completed: 2026-05-17
---

# Phase 4 Plan 01: Checkout Schema and Server Actions Summary

**Payment accounts/settings tables, four checkout server actions (validateCoupon, createManualOrder, calculateVAT, getPaymentAccounts), and default seed data**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-17T06:08:13Z
- **Completed:** 2026-05-17T06:12:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- payment_accounts table with method, account details, bank fields, and active flag
- settings key/value table for VAT rates and other configuration
- validateCoupon with db.transaction() race-safety and specific UI-SPEC error messages
- createManualOrder with server-side price validation, paymentRef dedup check (D-21), and audit logging
- calculateVAT reading from settings table with exclusive/inclusive mode support
- getPaymentAccounts returning active accounts grouped by payment method
- Seed data: 15% exclusive VAT, 5 inactive placeholder payment accounts, LAUNCH20 sample coupon

## Task Commits

Each task was committed atomically:

1. **Task 1: Add payment_accounts and settings tables to schema + seed data** - `eb13795` (feat)
2. **Task 2: Create checkout server actions** - `867518a` (feat)

## Files Created/Modified
- `src/lib/db/schema.ts` - Added paymentAccounts and settings tables with all columns
- `src/lib/db/seed.ts` - Added VAT settings, placeholder payment accounts, and LAUNCH20 coupon seeding
- `.env.example` - Added SSL Commerce and Central API environment variables
- `src/app/(portal)/actions/checkout.ts` - Four server actions for checkout flow (created)

## Decisions Made
- Used PLAN_PRICES constant map in checkout.ts for authoritative server-side price lookup instead of parsing display strings from pricing.ts
- validateCoupon reserves usage within db.transaction() to prevent race conditions on maxUses (per RESEARCH Pitfall 2)
- Payment account placeholders seeded as inactive (active: false) to prevent accidental display before admin configures real accounts
- getPaymentAccounts intentionally requires no auth since it displays public payment instructions on the checkout page

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed nullable currentUses TypeScript errors in validateCoupon**
- **Found during:** Task 2 (TypeScript compilation check)
- **Issue:** `coupon.currentUses` typed as possibly null from Drizzle schema (default 0 but not .notNull()), causing TS18047 errors on comparison and arithmetic
- **Fix:** Added null coalescing (`coupon.currentUses ?? 0`) at both usage sites
- **Files modified:** src/app/(portal)/actions/checkout.ts
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** 867518a (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Trivial TypeScript fix for schema type strictness. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required at this stage.

## Next Phase Readiness
- All checkout data layer tables and server actions are ready for consumption by Plans 02-06
- Plan 02 can use getPaymentAccounts() to display payment instructions on the checkout page
- Plan 03 can use createManualOrder() and validateCoupon() for the manual payment flow
- Plan 04 can use calculateVAT() for tax computation in the checkout summary
- SSL Commerce credentials (SSL_COMMERZ_STORE_ID, SSL_COMMERZ_STORE_PASSWORD) will need real values before production

---
*Phase: 04-checkout-payments*
*Completed: 2026-05-17*

## Self-Check: PASSED

- All 4 created/modified files verified to exist on disk
- Both task commits (eb13795, 867518a) verified in git log
- TypeScript compilation passes (`npx tsc --noEmit` clean)
