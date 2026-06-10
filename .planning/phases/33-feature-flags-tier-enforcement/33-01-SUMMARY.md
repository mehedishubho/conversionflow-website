---
phase: 33-feature-flags-tier-enforcement
plan: 01
subsystem: database, api
tags: [feature-flags, typescript, drizzle, jsonb, platform-nesting]

# Dependency graph
requires:
  - phase: 32-v4-milestone
    provides: "productPlans.features JSONB field, seed data with flat features"
provides:
  - "Feature catalog (FEATURE_CATALOG) as single source of truth for valid feature keys"
  - "Platform type (Platform) and PLATFORMS array for 4 fixed platforms"
  - "FeatureMatrix type: Record<string, Record<Platform, boolean>>"
  - "resolveFeaturesForPlatform utility for flat extraction from nested matrix"
  - "isValidFeatureKey validation helper for admin actions"
  - "Updated schema with nested per-platform features type"
  - "Migrated seed data from flat to nested format"
affects: [33-02, 33-03, 33-04, validate-endpoint, status-endpoint, admin-plan-form, portal-license-detail]

# Tech tracking
tech-stack:
  added: []
  patterns: [nested-per-platform-feature-matrix, catalog-based-feature-keys, resolveFeaturesForPlatform-filter]

key-files:
  created:
    - src/lib/config/feature-catalog.ts
  modified:
    - src/lib/db/schema.ts
    - src/lib/db/seed-products.ts
    - src/modules/products/domain/entities/ProductPlan.ts
    - src/modules/products/infrastructure/repositories/mappers/ProductPlanMapper.ts
    - src/app/(admin)/actions/admin-products.ts
    - src/components/admin/PlanForm.tsx
    - src/components/admin/ProductPlansTable.tsx
    - src/modules/licensing/application/commands/LicenseStatusHandler.ts

key-decisions:
  - "Fixed 4 platforms (wordpress, laravel, shopify, nextjs) as Platform union type"
  - "Feature catalog is code-defined, version-controlled, not user-modifiable at runtime"
  - "beta_channel included in catalog for Phase 32 deferred beta update filtering"
  - "resolveFeaturesForPlatform returns empty object for null/undefined features (safe default)"
  - "Cascading type fixes applied to all consumers of productPlans.features"

patterns-established:
  - "Feature catalog pattern: FEATURE_CATALOG array as single source of truth, VALID_FEATURE_KEYS Set for fast lookup"
  - "Nested feature matrix: Record<string, Record<string, boolean>> with per-platform boolean map"
  - "resolveFeaturesForPlatform: extracts flat boolean map from nested matrix for a given platform"

requirements-completed: [FF-01, FF-04]

# Metrics
duration: 8min
completed: 2026-06-10
---

# Phase 33 Plan 01: Feature Catalog & Schema Summary

**Feature catalog with 13 feature keys, Platform type for 4 fixed platforms, nested per-platform feature matrix schema type, and migrated seed data from flat to nested format**

## Performance

- **Duration:** 8 min
- **Started:** 2026-06-10T11:48:30Z
- **Completed:** 2026-06-10T11:56:43Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Created feature-catalog.ts as single source of truth for all valid feature keys with Platform type, PLATFORMS array, FEATURE_CATALOG (13 entries), FeatureMatrix type, resolveFeaturesForPlatform utility, and isValidFeatureKey helper
- Updated schema.ts productPlans.features from flat Record<string, boolean> to nested Record<string, Record<string, boolean>>
- Migrated all 3 seed plans (Starter, Professional, Agency) from flat to nested per-platform format with WordPress=true, others=false
- Fixed all cascading TypeScript type errors across 8 consumer files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create feature catalog and update schema type** - `3bba36b` (feat)
2. **Task 2: Migrate seed data from flat to nested per-platform format** - `9d0e067` (feat)

## Files Created/Modified
- `src/lib/config/feature-catalog.ts` - Feature catalog, Platform type, PLATFORMS array, FEATURE_CATALOG, FeatureMatrix, resolveFeaturesForPlatform, isValidFeatureKey
- `src/lib/db/schema.ts` - Updated productPlans.features to nested Record<string, Record<string, boolean>>
- `src/lib/db/seed-products.ts` - All 3 plans migrated from flat to nested per-platform format
- `src/modules/products/domain/entities/ProductPlan.ts` - Updated features type and validation invariant for nested structure
- `src/modules/products/infrastructure/repositories/mappers/ProductPlanMapper.ts` - Updated cast for nested features type
- `src/app/(admin)/actions/admin-products.ts` - Updated createPlan and updatePlan feature validation for nested format
- `src/components/admin/PlanForm.tsx` - Updated PlanData interface, useState type, toggle logic for nested features
- `src/components/admin/ProductPlansTable.tsx` - Updated PlanRow interface and formatFeatures for nested structure
- `src/modules/licensing/application/commands/LicenseStatusHandler.ts` - Updated LicenseStatusResult interface and cast for nested features
- `src/app/(admin)/admin/products/[id]/plans/[planId]/edit/page.tsx` - Updated type cast
- `src/app/(admin)/admin/products/[id]/plans/page.tsx` - Updated type cast

## Decisions Made
- Used resolveFeaturesForPlatform utility function to extract flat boolean map from nested matrix, enabling D-06 (SDKs get platform-filtered features)
- Kept LicenseStatusHandler returning nested features (plan 02 will add platform filtering when the status endpoint gets the platform parameter)
- PlanForm toggle toggles wordpress platform as the default (current data is wordpress-only)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed cascading TypeScript type errors from schema change**
- **Found during:** Task 1 (schema type update)
- **Issue:** Changing schema.ts features type from Record<string, boolean> to Record<string, Record<string, boolean>> caused 5 TypeScript errors in consumer files
- **Fix:** Updated all consumer files: admin-products.ts (2 locations), PlanForm.tsx (3 locations), ProductPlansTable.tsx (2 locations), ProductPlan.ts (2 locations - type + invariant), ProductPlanMapper.ts, LicenseStatusHandler.ts (2 locations), 2 admin page files
- **Files modified:** 8 files
- **Verification:** npx tsc --noEmit exits with code 0
- **Committed in:** 3bba36b (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking type mismatch)
**Impact on plan:** Necessary fix. The schema type change must propagate to all consumers for compilation. No scope creep - all changes are type-only adjustments.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Feature catalog is ready for consumption by Plan 02 (validate/status endpoint platform filtering)
- Plan 03 can build the admin UI checkbox grid using FEATURE_CATALOG and Platform types
- Plan 04 can use resolveFeaturesForPlatform for portal feature checklist
- beta_channel feature key is catalogued and ready for update check integration

---
*Phase: 33-feature-flags-tier-enforcement*
*Completed: 2026-06-10*

## Self-Check: PASSED

All files verified:
- FOUND: src/lib/config/feature-catalog.ts
- FOUND: src/lib/db/schema.ts
- FOUND: src/lib/db/seed-products.ts
- FOUND: 33-01-SUMMARY.md

All commits verified:
- FOUND: 3bba36b (Task 1)
- FOUND: 9d0e067 (Task 2)
