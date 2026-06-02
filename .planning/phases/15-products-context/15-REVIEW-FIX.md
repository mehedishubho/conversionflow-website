---
phase: 15-products-context
fixed_at: 2026-06-02T12:30:00Z
review_path: .planning/phases/15-products-context/15-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 5
skipped: 2
status: partial
---

# Phase 15: Code Review Fix Report

**Fixed at:** 2026-06-02T12:30:00Z
**Source review:** .planning/phases/15-products-context/15-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 7
- Fixed: 5
- Skipped: 2

## Fixed Issues

### CR-01: Unvalidated version status in updateVersion allows arbitrary string injection

**Files modified:** `src/app/(admin)/actions/admin-products.ts`
**Commit:** a5a2fdb
**Applied fix:** Added validation that the `status` field from formData must be one of `"stable"`, `"beta"`, or `"draft"` before writing to the database. Returns an error message if validation fails.

### CR-02: Fragile enum value lookup via array index in findLatestStable

**Files modified:** `src/modules/products/infrastructure/repositories/ProductVersionRepository.ts`
**Commit:** a141e93
**Applied fix:** Replaced `versionStatusEnum.enumValues[0]` with the literal string `"stable"`. Also removed the now-unused `versionStatusEnum` import.

### WR-01: Subscription plan update allows clearing billing cycle without enforcing invariant

**Files modified:** `src/app/(admin)/actions/admin-products.ts`
**Commit:** beb46d3
**Applied fix:** Added a subscription invariant check after the existing lifetime check: when `billingCycle` is explicitly set to `null` in `updateData` and the effective license type is `"subscription"`, the action now returns an error. **Requires human verification** -- this is a logic fix involving conditional branching on business rules.

### WR-04: ProductPlansTable uses window.location.reload() instead of router.refresh()

**Files modified:** `src/components/admin/ProductPlansTable.tsx`
**Commit:** 49bf12d
**Applied fix:** Added `useRouter` import from `next/navigation`, initialized `router` in the component, and replaced `window.location.reload()` with `router.refresh()` for consistent Next.js-appropriate revalidation without full page reload.

### WR-05: Relative "Create" links in nested tables may resolve incorrectly

**Files modified:** `src/components/admin/ProductPlansTable.tsx`, `src/components/admin/ProductVersionsTable.tsx`, `src/app/(admin)/admin/products/[id]/versions/page.tsx`, `src/app/(admin)/admin/products/[id]/plans/page.tsx`
**Commit:** 3860190, 1a70921
**Applied fix:** Replaced relative `href="plans/new"` and `href="versions/new"` with absolute paths using template literals and the `productId` prop. Added `productId` to `ProductVersionsTable` props interface and component destructuring. Updated the parent versions page to pass the new `productId` prop. Also fixed the same relative link issue in the parent plans page "Add Plan" button (same bug class, discovered during fix).

## Skipped Issues

### WR-02: Server actions bypass domain entity validation layer

**File:** `src/app/(admin)/actions/admin-products.ts:47-83, 159-200, 281-399`
**Reason:** Already partially addressed -- `createVersion` already contains semver validation (SEMVER_PATTERN check at line 174-177). The broader architectural concern (refactoring server actions to instantiate domain entities before persisting) is a significant structural change that should be planned as a dedicated task, not a review fix.
**Original issue:** Server actions perform raw database operations, bypassing domain entity `validateInvariants()` methods. The inline validation duplicates some but not all domain checks.

### WR-03: Auth guard duplicated between server actions and page components

**File:** `src/app/(admin)/actions/admin-products.ts:15-30` and `src/app/(admin)/admin/products/page.tsx:18-29`
**Reason:** Code quality/maintainability concern requiring creation of a new shared utility module and refactoring multiple consumer files. The fix is guidance-level ("extract into a shared utility") without a concrete implementation target. Better handled as a planned refactoring task.
**Original issue:** The `requireAdmin()` function and inline auth check are duplicated with identical unsafe type assertions. A shared utility would reduce duplication and centralize the role logic.

---

_Fixed: 2026-06-02T12:30:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
