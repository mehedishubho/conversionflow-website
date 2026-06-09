---
phase: 27-billing-integration
plan: FIX
subsystem: [billing, admin-ui, notifications]
tags: [coupon-admin, price-cache, event-catalog, order-detail, server-actions, audit-log]

# Dependency graph
requires:
  - phase: 27-billing-integration
    provides: UAT findings identifying 4 gaps in billing integration
provides:
  - Coupon CRUD admin UI at /admin/coupons with full lifecycle management
  - Price cache invalidation synchronized between admin plan mutations and checkout
  - Duplicate email prevention on order completion (EventCatalog fix)
  - Order detail page with customer and license info at /admin/orders/[id]
  - View Details link on all order rows regardless of status
affects: [billing, admin-dashboard, notifications, checkout]

# Tech tracking
tech-stack:
  added: []
  patterns: [clearPlanPricesCache-for-cross-module-invalidation, event-catalog-channel-filtering]

key-files:
  created:
    - src/app/(admin)/actions/admin-coupons.ts
    - src/app/(admin)/admin/coupons/page.tsx
    - src/app/(admin)/admin/coupons/new/page.tsx
    - src/app/(admin)/admin/coupons/new/CouponCreateForm.tsx
    - src/components/admin/CouponsTable.tsx
    - src/app/(admin)/admin/orders/[id]/page.tsx
  modified:
    - src/modules/notifications/application/catalog/EventCatalog.ts
    - src/modules/notifications/application/services/NotificationService.ts
    - src/app/(portal)/actions/checkout.ts
    - src/app/(portal)/dashboard/checkout/page.tsx
    - src/app/(admin)/actions/admin-products.ts
    - src/data/dashboard-nav.ts
    - src/components/admin/OrdersTable.tsx

key-decisions:
  - "Removed email channel from order.completed EventCatalog entry -- billing OrderCompletedHandler already sends the correct fully-populated email; NotificationService would send a broken duplicate with undefined fields"
  - "Used module-level cache invalidation (clearPlanPricesCache) over Redis pub/sub for price sync -- simpler, O(1) cost, only triggered on rare admin plan mutations"
  - "Dynamic price fetch in checkout page via getCheckoutPrices server action instead of hardcoded planPrices object"
  - "Created CouponCreateForm as separate client component for form state management, following ProductForm pattern"

patterns-established:
  - "Cross-module cache invalidation: admin mutations call clearPlanPricesCache() + revalidatePath() to keep checkout in sync"
  - "EventCatalog channel design: events whose emails are handled by domain handlers should use in_app channel only to avoid duplicate sends"

requirements-completed: [LSTAT-05, LSTAT-06, ARCH-06, ARCH-08]

# Metrics
duration: 7min
completed: 2026-06-07
---

# Phase 27 FIX: Billing Integration UAT Gaps Summary

**Fixed 4 UAT gaps: duplicate email prevention via EventCatalog channel fix, cross-module price cache invalidation, full coupon admin CRUD, and interactive order rows with detail page**

## Performance

- **Duration:** 7 min
- **Started:** 2026-06-07T19:11:04Z
- **Completed:** 2026-06-07T19:17:50Z
- **Tasks:** 4
- **Files modified:** 13 (6 created, 7 modified)

## Accomplishments
- Eliminated duplicate email on order completion by removing "email" from EventCatalog and adding defensive comment in NotificationService
- Synchronized admin plan price changes to checkout via clearPlanPricesCache() export called in create/update/deletePlan
- Built complete coupon admin CRUD: list, create, toggle active, delete -- with validation, audit logging, and admin sidebar nav entry
- Made all order rows interactive with View Details link, added Verified badge for completed orders, and created order detail page showing customer and license info

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix duplicate email race condition** - `32e1a44` (fix)
2. **Task 2: Fix stale price cache after admin plan updates** - `6dc9906` (fix)
3. **Task 3: Create Coupon Admin UI** - `c2b40dc` (feat)
4. **Task 4: Add View Details to all orders and order detail page** - `cc3ba0e` (feat)

## Files Created/Modified
- `src/modules/notifications/application/catalog/EventCatalog.ts` - Changed order.completed channels to ["in_app"] only
- `src/modules/notifications/application/services/NotificationService.ts` - Added defensive comment explaining duplicate email design
- `src/app/(portal)/actions/checkout.ts` - Exported getPlanPrices, clearPlanPricesCache, getCheckoutPrices
- `src/app/(portal)/dashboard/checkout/page.tsx` - Replaced hardcoded planPrices with dynamic server fetch via getCheckoutPrices
- `src/app/(admin)/actions/admin-products.ts` - Added clearPlanPricesCache + revalidatePath in create/update/deletePlan
- `src/app/(admin)/actions/admin-coupons.ts` - NEW: CRUD server actions with requireAdmin guard and audit logging
- `src/app/(admin)/admin/coupons/page.tsx` - NEW: Admin coupon list page
- `src/app/(admin)/admin/coupons/new/page.tsx` - NEW: Create coupon page with server component wrapper
- `src/app/(admin)/admin/coupons/new/CouponCreateForm.tsx` - NEW: Client form component with validation
- `src/components/admin/CouponsTable.tsx` - NEW: Coupon table with toggle/delete actions and status badges
- `src/data/dashboard-nav.ts` - Added Coupons nav entry with Ticket icon
- `src/components/admin/OrdersTable.tsx` - Added View Details link for all orders, Verified badge for completed
- `src/app/(admin)/admin/orders/[id]/page.tsx` - NEW: Order detail page with customer and license info

## Decisions Made
- **EventCatalog over NotificationService edit:** Removing "email" from catalog channels is the cleanest fix since the billing handler already sends the correct email. NotificationService change is just a comment for future maintainers.
- **Module-level cache invalidation over Redis:** clearPlanPricesCache() sets a null reference -- O(1), called only on admin mutations (rare), no Redis dependency needed.
- **Separate CouponCreateForm component:** The new coupon page uses a server component wrapper importing a client form component, matching the ProductForm pattern already in the codebase.
- **Server action form pattern for coupon create:** Using form action with client-side transition for create coupon, keeping it simple without complex state management.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 4 UAT gaps closed, ready for re-test of UAT tests 2/6/9/10
- Coupon admin fully functional at /admin/coupons
- Price sync between admin and checkout working
- Order detail page provides full audit trail for admins

---
*Phase: 27-billing-integration*
*Completed: 2026-06-07*

## Self-Check: PASSED

- All 13 files verified (6 created, 7 modified)
- All 4 commits verified: 32e1a44, 6dc9906, c2b40dc, cc3ba0e
- All 10 verification checks from plan passed
