---
phase: 15-products-context
reviewed: 2026-06-02T12:00:00Z
depth: standard
files_reviewed: 24
files_reviewed_list:
  - src/lib/db/schema.ts
  - src/modules/products/domain/entities/Product.ts
  - src/modules/products/domain/entities/ProductPlan.ts
  - src/modules/products/domain/entities/ProductVersion.ts
  - src/modules/products/domain/events/ProductEvents.ts
  - src/modules/products/domain/index.ts
  - src/modules/products/infrastructure/index.ts
  - src/modules/products/infrastructure/repositories/ProductPlanRepository.ts
  - src/modules/products/infrastructure/repositories/ProductRepository.ts
  - src/modules/products/infrastructure/repositories/ProductVersionRepository.ts
  - src/modules/products/infrastructure/repositories/mappers/ProductMapper.ts
  - src/modules/products/infrastructure/repositories/mappers/ProductPlanMapper.ts
  - src/modules/products/infrastructure/repositories/mappers/ProductVersionMapper.ts
  - src/app/(admin)/actions/admin-products.ts
  - src/lib/db/seed-products.ts
  - src/app/(admin)/admin/products/page.tsx
  - src/app/(admin)/admin/products/new/page.tsx
  - src/components/admin/ProductsTable.tsx
  - src/components/admin/ProductForm.tsx
  - src/components/admin/ProductDetailShell.tsx
  - src/components/admin/ProductVersionsTable.tsx
  - src/components/admin/ProductPlansTable.tsx
  - src/components/admin/PlanForm.tsx
  - src/data/dashboard-nav.ts
findings:
  critical: 2
  warning: 5
  info: 4
  total: 11
status: issues_found
---

# Phase 15: Code Review Report

**Reviewed:** 2026-06-02T12:00:00Z
**Depth:** standard
**Files Reviewed:** 24
**Status:** issues_found

## Summary

Reviewed the Products Bounded Context implementation spanning domain entities, infrastructure repositories/mappers, server actions, admin UI components, and seed data. The code follows a clean domain-driven design with proper separation between domain entities, infrastructure, and presentation layers. However, there are two critical security issues (unvalidated status enum in server action, and a fragile enum index reference), several warnings around missing input validation and invariant enforcement gaps, and minor quality items.

## Critical Issues

### CR-01: Unvalidated version status in updateVersion allows arbitrary string injection

**File:** `src/app/(admin)/actions/admin-products.ts:219`
**Issue:** The `status` field from `formData` is cast directly to a string and written to the database without validating that it matches one of the allowed enum values (`"stable"`, `"beta"`, `"draft"`). A crafted form submission could insert any arbitrary string into the `version_status` enum column, causing a database error at best or unexpected behavior at worst. The `createVersion` action hardcodes `status: "draft"` (safe), but `updateVersion` trusts client input entirely.

**Fix:**
```typescript
if (status !== null) {
  const validStatuses = ["stable", "beta", "draft"] as const;
  if (!validStatuses.includes(status as any)) {
    return { error: "Status must be 'stable', 'beta', or 'draft'." };
  }
  updateData.status = status;
  if (status === "stable") {
    updateData.releasedAt = new Date();
  }
}
```

### CR-02: Fragile enum value lookup via array index in findLatestStable

**File:** `src/modules/products/infrastructure/repositories/ProductVersionRepository.ts:49`
**Issue:** The query uses `versionStatusEnum.enumValues[0]` to get the string `"stable"`. This relies on the enum definition order in `schema.ts` remaining unchanged. If someone reorders the `versionStatusEnum` values (e.g., alphabetically as `"beta", "draft", "stable"`), this silently queries for the wrong status. This is a correctness bug waiting to happen.

**Fix:**
```typescript
// Replace:
eq(this.table.status, versionStatusEnum.enumValues[0]) // "stable"

// With:
eq(this.table.status, "stable")
```

This is both more readable and resilient to enum reordering. The database enum enforces valid values regardless.

## Warnings

### WR-01: Subscription plan update allows clearing billing cycle without enforcing invariant

**File:** `src/app/(admin)/actions/admin-products.ts:466-503`
**Issue:** When updating a plan, if `licenseType` is not changed but `billingCycle` is explicitly cleared (empty string from form), the code sets `updateData.billingCycle = null`. However, the invariant check on lines 498-503 only validates the "lifetime" case. If a subscription plan has its billing cycle cleared without changing `licenseType`, the final state would be a subscription plan with no billing cycle -- violating the business rule enforced in `ProductPlan.validateInvariants()`. The `effectiveLicenseType` variable on line 453 is set but only used as a fallback on line 498, and since it is derived from `licenseType` (which could be null when unchanged), `finalLicenseType` would be `undefined`, skipping the subscription invariant check entirely.

**Fix:** The update action should either fetch the current plan state from the database to compute the effective license type, or add explicit validation:
```typescript
// After building updateData, before the try block:
if ("billingCycle" in updateData && updateData.billingCycle === null) {
  // billing cycle was explicitly cleared -- ensure license is not subscription
  if (finalLicenseType === "subscription") {
    return { error: "Subscription plans must have a billing cycle." };
  }
}
```

### WR-02: Server actions bypass domain entity validation layer

**File:** `src/app/(admin)/actions/admin-products.ts:47-83, 159-200, 281-399`
**Issue:** The server actions (`createProduct`, `updateProduct`, `createVersion`, `createPlan`, etc.) perform raw database inserts/updates using Drizzle ORM directly, completely bypassing the domain entities (`Product`, `ProductVersion`, `ProductPlan`) and their `validateInvariants()` methods. This means the carefully designed domain validation in the entity constructors (semver validation, billing invariant enforcement, feature flag type checking) is dead code in the actual server action flow. The actions duplicate some validation logic inline, but inconsistently -- for example, `createVersion` does not validate the semver format that `ProductVersion.validateVersion()` enforces.

**Fix:** The server actions should instantiate domain entities to leverage their built-in validation before persisting, or the inline validation in the actions should be audited to match the domain entity validation exactly. At minimum, `createVersion` should validate semver format:
```typescript
const SEMVER_PATTERN = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;
if (!SEMVER_PATTERN.test(version.trim())) {
  return { error: "Version must follow semver format (e.g., 1.2.0 or 1.2.0-beta.1)." };
}
```

### WR-03: Auth guard duplicated between server actions and page components

**File:** `src/app/(admin)/actions/admin-products.ts:15-30` and `src/app/(admin)/admin/products/page.tsx:18-29`
**Issue:** The `requireAdmin()` function in the server actions and the inline auth check in the page component are identical blocks of code. The page-level check is necessary (prevents rendering), and the action-level check is necessary (prevents direct form submission). However, the role-checking logic `(session.user as Record<string, unknown>).role as string` uses an unsafe type assertion that could mask issues if the session shape changes. A single shared auth utility would reduce duplication and centralize the role logic.

**Fix:** Extract the admin role check into a shared utility and use it in both locations. This is a code quality/maintainability concern rather than a runtime bug, but the duplicated unsafe cast is a risk.

### WR-04: ProductPlansTable uses window.location.reload() instead of router.refresh()

**File:** `src/components/admin/ProductPlansTable.tsx:97`
**Issue:** After a successful delete, the component calls `window.location.reload()` for a full page reload. In contrast, `ProductsTable.tsx` (line 72) uses `router.refresh()` which is the Next.js-appropriate way to revalidate server component data without a full page reload. The inconsistency suggests one approach is intentional and the other is a leftover. `window.location.reload()` loses client-side state and causes a visible flash.

**Fix:**
```typescript
// Replace line 97:
window.location.reload();
// With:
router.refresh();
```

### WR-05: Relative "Create" links in nested tables may resolve incorrectly

**File:** `src/components/admin/ProductVersionsTable.tsx:126-129` and `src/components/admin/ProductPlansTable.tsx:147-151`
**Issue:** Both components use relative `href` values (`href="versions/new"` and `href="plans/new"`) for their empty-state "Create" links. These links are rendered inside pages that may be at different URL depths (e.g., `/admin/products/{id}/versions`). Since they are relative, the browser resolves them relative to the current path. If the current URL is `/admin/products/abc-123/versions`, the link resolves to `/admin/products/abc-123/versions/versions/new` -- double-nesting the "versions" segment. This depends on whether Next.js `<Link>` resolves relative paths against the current URL or the route tree. In App Router, relative `<Link>` hrefs resolve against the current URL, so this is likely a bug.

**Fix:**
```typescript
// In ProductVersionsTable, replace:
href="versions/new"
// With:
href={`/admin/products/${productId}/versions/new`}

// In ProductPlansTable, replace:
href="plans/new"
// With:
href={`/admin/products/${productId}/plans/new`}
```
Note: `ProductPlansTable` receives `productId` as a prop, but `ProductVersionsTable` does not. The versions table would need `productId` added to its props to build the correct absolute URL.

## Info

### IN-01: Seed script uses console.log for production-seeded output

**File:** `src/lib/db/seed-products.ts:17-128`
**Issue:** The seed script uses `console.log` and `console.error` throughout. While this is standard for seed scripts (which are developer tooling, not production runtime code), the error handler on line 130 calls `process.exit(1)` which is correct. No issue here, just noting the pattern is appropriate for its context.

### IN-02: generateSlug helper duplicated across domain entity and server actions

**File:** `src/modules/products/domain/entities/Product.ts:91-96` and `src/app/(admin)/actions/admin-products.ts:36-41`
**Issue:** The `generateSlug` function is implemented identically in both the `Product` domain entity (as a private static method) and the server actions file (as a standalone function). Since the server actions bypass the domain entity layer (see WR-02), this duplication is a maintenance risk -- a change to slug generation in one place would need to be mirrored in the other.

**Fix:** Extract to a shared utility function (e.g., `src/lib/slugify.ts`) and import in both locations.

### IN-03: `updatePlan` action has unused `effectiveLicenseType` variable

**File:** `src/app/(admin)/actions/admin-products.ts:453`
**Issue:** Line 453 declares `const effectiveLicenseType = licenseType || undefined;` which is only used as a fallback in `finalLicenseType` on line 498. When `licenseType` is null (i.e., the field was not submitted), `effectiveLicenseType` becomes `undefined`, making `finalLicenseType` also `undefined`, which means the lifetime/subscription invariant check on line 499 is effectively dead code for the "no license type change" case. This is related to WR-01.

### IN-04: ProductMapper.toData includes `id` field but comment says it omits it

**File:** `src/modules/products/infrastructure/repositories/mappers/ProductMapper.ts:31-40`
**Issue:** The doc comment on `toData()` says "Omits id (generated by DB) and timestamps (handled by DB defaults)" but the method body includes `id: domain.id` on line 34. This is not a bug (Drizzle will use the provided id for insert if given, or generate one if empty), but the comment is misleading.

**Fix:** Either remove `id: domain.id` from the return value (if the intent is truly to let the DB generate it) or update the comment to reflect that `id` is included for update scenarios.

---

_Reviewed: 2026-06-02T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
