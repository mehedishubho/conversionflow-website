---
phase: 04-checkout-payments
plan: 06
status: complete
completed: 2026-05-17
---

# Plan 04-06 Summary: Integration Wiring + Schema Push

## What was built

Wired end-to-end integrations connecting all prior plans and pushed database schema.

### Task 1: Update pricing URLs, wire confirmation emails, update seed script
- Updated `src/data/pricing.ts` — all 3 checkoutUrl values changed from `https://checkout.conversionflow.com/*` to `/dashboard/checkout?plan=*`
- Wired `sendOrderConfirmationEmail` into `src/app/api/ssl-commerz/ipn/route.ts` — try/catch wrapped, fires after order completion regardless of central API sync result
- Wired `sendOrderConfirmationEmail` into `src/app/(admin)/actions/admin-orders.ts` `verifyOrder()` — try/catch wrapped, fires after admin verifies manual payment
- Created `scripts/seed-phase4.ts` — standalone Phase 4 seed script for payment_accounts (5 methods), settings (vat_rate, vat_mode), and coupon (LAUNCH20)

### Task 2: Push database schema and verify full flow
- `pnpm drizzle-kit push` — schema pushed successfully, payment_accounts and settings tables created
- Ran seed-phase4.ts — populated: 2 settings rows, 5 payment_accounts rows, 1 coupon (LAUNCH20)
- Fixed `useSearchParams()` Suspense boundary errors on both `/dashboard/checkout` and `/dashboard/checkout/success` pages
- `pnpm build` passes successfully

## Commits
1. `be40edc` — feat(04-06): update pricing URLs, wire confirmation emails into payment flows
2. `9d45ddf` — feat(04-06): fix Suspense boundaries, add seed script, complete integration wiring

## Key files
- `src/data/pricing.ts` — checkoutUrl updated to internal portal routes
- `src/app/api/ssl-commerz/ipn/route.ts` — confirmation email after SSL payment
- `src/app/(admin)/actions/admin-orders.ts` — confirmation email after admin verify
- `src/app/(portal)/dashboard/checkout/page.tsx` — Suspense boundary fix
- `src/app/(portal)/dashboard/checkout/success/page.tsx` — Suspense boundary fix
- `scripts/seed-phase4.ts` — standalone Phase 4 seed script

## Deviations
- Seed script created as separate file (`scripts/seed-phase4.ts`) because the main `seed.ts` skips Phase 4 data when admin already exists
- Added Suspense boundary fixes for `useSearchParams()` — not in original plan but required for Next.js 16 build
