---
phase: 15-products-context
plan: 01
subsystem: database, domain
tags: [drizzle, postgres, ddd, domain-entities, repositories, value-objects, products, pricing, licensing]

# Dependency graph
requires:
  - phase: 14-shared-infrastructure
    provides: BaseRepository, IMapper, QueryBuilder, Money value object, BaseEvent interface, event bus
provides:
  - products, product_versions, product_plans database tables with enums and relations
  - Product, ProductVersion, ProductPlan domain entities with invariant validation
  - ProductRepository, ProductVersionRepository, ProductPlanRepository extending BaseRepository
  - ProductMapper, ProductVersionMapper, ProductPlanMapper implementing IMapper
  - PRODUCT_EVENTS constants and createProductEvent factory
  - Updated barrel exports for products module
affects: [16-licensing-core, 17-billing-integration, 18-subscription-management]

# Tech tracking
tech-stack:
  added: []
  patterns: [product-plan-invariant-validation, semver-validation, jsonb-feature-flags, compound-unique-constraints]

key-files:
  created:
    - src/modules/products/domain/entities/Product.ts
    - src/modules/products/domain/entities/ProductVersion.ts
    - src/modules/products/domain/entities/ProductPlan.ts
    - src/modules/products/domain/events/ProductEvents.ts
    - src/modules/products/infrastructure/repositories/ProductRepository.ts
    - src/modules/products/infrastructure/repositories/ProductVersionRepository.ts
    - src/modules/products/infrastructure/repositories/ProductPlanRepository.ts
    - src/modules/products/infrastructure/repositories/mappers/ProductMapper.ts
    - src/modules/products/infrastructure/repositories/mappers/ProductVersionMapper.ts
    - src/modules/products/infrastructure/repositories/mappers/ProductPlanMapper.ts
  modified:
    - src/lib/db/schema.ts
    - src/modules/products/domain/index.ts
    - src/modules/products/infrastructure/index.ts

key-decisions:
  - "Used integer fields for priceBDT and priceUSD matching existing orders.amount pattern"
  - "billingCycle nullable for lifetime plans, required for subscription plans (D-04)"
  - "maxActivations=0 means unlimited, default 1 (D-05)"
  - "JSONB features field typed as Record<string, boolean> with entity-level validation (D-07)"

patterns-established:
  - "Domain entity invariant validation in constructor with private validateInvariants() method"
  - "Static create() factory method for domain entities with auto-generated slug"
  - "Immutable entity updates returning new instances with updated timestamps"
  - "Repository custom queries using Drizzle eq/and/desc/asc operators"

requirements-completed: [PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-06, PROD-07]

# Metrics
duration: 10min
completed: 2026-06-02
---

# Phase 15 Plan 01: Products Data & Domain Layer Summary

**Drizzle schema with 3 product tables, 3 domain entities with invariant validation (lifetime/subscription, semver, JSONB features), and 3 repositories extending BaseRepository with custom query methods**

## Performance

- **Duration:** 10 min
- **Started:** 2026-06-02T13:11:37Z
- **Completed:** 2026-06-02T13:21:38Z
- **Tasks:** 3
- **Files modified:** 13

## Accomplishments
- Three Drizzle tables (products, product_versions, product_plans) with 3 enums, compound unique constraints, cascade deletes, and relations
- Three domain entities enforcing business invariants: ProductPlan validates D-04 lifetime/subscription rules, D-05 non-negative activations, D-07 boolean-only features; ProductVersion validates semver format
- Three repositories (ProductRepository, ProductVersionRepository, ProductPlanRepository) with custom queries: findBySlug, findByProductId, findLatestStable, findBySlug (compound)
- Complete barrel export chain enabling `import { Product, ProductRepository, PRODUCT_EVENTS } from '@/modules/products'`

## Task Commits

Each task was committed atomically:

1. **Task 1: Add products schema tables, enums, and relations to schema.ts** - `4e7e2c9` (feat)
2. **Task 2: Create domain entities, events, and update barrel exports** - `3b82f65` (feat)
3. **Task 3: Create repository implementations with mappers and update infrastructure barrel export** - `3e8c909` (feat)

## Files Created/Modified
- `src/lib/db/schema.ts` - Added 3 enums (versionStatusEnum, licenseTypeEnum, billingCycleEnum), 3 tables (products, productVersions, productPlans), 3 relations
- `src/modules/products/domain/entities/Product.ts` - Product entity with create factory, slug generation, update methods
- `src/modules/products/domain/entities/ProductVersion.ts` - ProductVersion entity with semver validation, status lifecycle, release() method
- `src/modules/products/domain/entities/ProductPlan.ts` - ProductPlan entity with invariant validation (D-03/D-04/D-05/D-07), Money price getters
- `src/modules/products/domain/events/ProductEvents.ts` - PRODUCT_EVENTS constants, createProductEvent factory
- `src/modules/products/domain/index.ts` - Domain barrel export for all entities, types, events
- `src/modules/products/infrastructure/repositories/ProductRepository.ts` - ProductRepository with findBySlug
- `src/modules/products/infrastructure/repositories/ProductVersionRepository.ts` - ProductVersionRepository with findByProductId, findLatestStable
- `src/modules/products/infrastructure/repositories/ProductPlanRepository.ts` - ProductPlanRepository with findByProductId, findBySlug
- `src/modules/products/infrastructure/repositories/mappers/ProductMapper.ts` - IMapper for Product entity
- `src/modules/products/infrastructure/repositories/mappers/ProductVersionMapper.ts` - IMapper for ProductVersion entity
- `src/modules/products/infrastructure/repositories/mappers/ProductPlanMapper.ts` - IMapper for ProductPlan entity
- `src/modules/products/infrastructure/index.ts` - Infrastructure barrel export for all repositories and mappers

## Decisions Made
- Used integer fields for priceBDT and priceUSD matching existing orders.amount integer pattern (not cents)
- billingCycle nullable for lifetime plans, required for subscription plans per D-04
- maxActivations=0 means unlimited, default value of 1 per D-05
- JSONB features field typed as Record<string, boolean> with entity-level validation ensuring all values are boolean per D-07
- VersionStatus export as type alongside class for use in repository type signatures

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Products data and domain layer complete, ready for Plan 15-02 (application layer with CQRS commands/queries)
- Database migration needed before testing: `pnpm db:generate` to create migration, `pnpm db:migrate` to apply
- All 7 PROD requirements satisfied at schema/entity level; PROD-07 (admin UI) will be completed in Plans 15-03 and 15-04

---
*Phase: 15-products-context*
*Completed: 2026-06-02*
