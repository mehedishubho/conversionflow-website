# Phase 15: Products Bounded Context - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin can create and manage products with versions and plans, defining pricing (dual currency), activation limits, licensing rules (lifetime or subscription), and feature flags — serving as the foundation for license generation in Phase 16.

This phase builds the **Products bounded context** within `src/modules/products/` using the DDD layers established in Phase 14, plus admin UI pages for CRUD management.

**In scope:**
- Database schema: `products`, `product_versions`, `product_plans` tables
- Domain entities: Product, ProductVersion, ProductPlan
- Application layer: CQRS commands and queries for products, versions, plans
- Infrastructure: Drizzle repository implementations using BaseRepository
- Admin UI: Product list, product detail with versions/plans management
- Data migration: Replace hardcoded `pricing.ts` and `checkout/page.tsx` with database-driven data

**NOT in scope (later phases):**
- License generation (Phase 16)
- Checkout refactoring (Phase 17)
- Subscription billing logic (Phase 18)
- Analytics dashboards (Phase 19)
</domain>

<decisions>
## Implementation Decisions

### Product Structure
- **D-01:** Multi-product schema from day one — products table supports multiple products even though ConversionFlow is the only product currently. Schema is designed for extensibility without future migrations.
- **D-02:** Standard SaaS hierarchy: Product → Plans + Versions. Each product has multiple plans (pricing tiers) and multiple versions (releases). Plans and versions belong to a product via foreign key.

### Plan Pricing & Licensing Model
- **D-03:** Dual currency pricing — each plan stores both BDT and USD prices. Customer sees BDT by default (BD market) with USD toggle. Money value object from Phase 14 handles currency validation.
- **D-04:** Plans support both license types: `lifetime` (no expiration, null `billingCycle`) and `subscription` (recurring with `billingCycle`: monthly, yearly, custom duration). Admin selects per plan. Current tiers: Starter=1yr subscription, Professional=2yr subscription, Agency=lifetime.
- **D-05:** Per-plan activation limits — each plan has a `maxActivations` integer field. 0 or NULL means unlimited. Current values: Starter=1, Professional=3, Agency=0 (unlimited).

### Version Management
- **D-06:** Full version tracking — each version record has: semver string (`version`), download URL (`downloadUrl`), changelog text (`changelog`), release date (`releasedAt`), and status enum (`stable`, `beta`, `draft`). Admin can manage full version lifecycle.

### Feature Flags
- **D-07:** Named feature flags via JSONB — each plan has a `features` JSONB field containing named boolean flags (e.g., `{"priority_support": true, "white_label": false, "auto_updates": true}`). Admin toggles flags per plan. Extensible without schema changes.

### Claude's Discretion
- Exact database column types and constraints (researcher decides based on Drizzle patterns)
- Domain entity class structure within the DDD layers
- Admin UI component choices (table vs card layout, form design)
- How to seed the initial ConversionFlow product with its 3 plans
- Event types to emit from this bounded context

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Database & Schema
- `src/lib/db/schema.ts` — Existing Drizzle schema (orders, licenses, downloads tables with `productId`/`plan` text fields that will relate to new tables)
- `drizzle.config.ts` — Drizzle migration configuration

### Phase 14 Infrastructure (MUST use)
- `src/shared/infrastructure/repositories/BaseRepository.ts` — Base CRUD repository with query builder (extends for Product, Version, Plan repositories)
- `src/shared/infrastructure/repositories/types.ts` — IRepository, IMapper interfaces
- `src/shared/domain/valueObjects/Money.ts` — Dual currency value object for plan pricing
- `src/shared/infrastructure/eventBus/types.ts` — BaseEvent interface for domain events

### Existing Product/Plan References (must replace with DB-driven data)
- `src/data/pricing.ts` — Hardcoded marketing site pricing (3 tiers: Starter, Professional, Agency)
- `src/app/(portal)/dashboard/checkout/page.tsx` — Hardcoded planPrices map (lines 17-21: starter=2150, professional=3000, agency=8000)

### Admin UI Patterns (follow existing conventions)
- `src/app/(admin)/admin/orders/page.tsx` — Standard admin page pattern (auth check, data fetch, PageBreadcrumb + ComponentCard)
- `src/app/(admin)/admin/settings/layout.tsx` — Nested routing pattern (for product detail → versions/plans sub-pages)
- `src/components/dashboard/DashboardShell.tsx` — Admin shell with sidebar navigation
- `src/data/dashboard-nav.ts` — Admin navigation (needs Products entry added)

### DDD Module Structure (follow Phase 14 pattern)
- `src/modules/products/domain/index.ts` — Current stub barrel export
- `src/modules/products/application/index.ts` — Current stub barrel export
- `src/modules/products/infrastructure/index.ts` — Current stub barrel export

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BaseRepository` — Provides findById, findAll (with QueryBuilder), create, update, delete, exists, transaction support. Create ProductRepository, VersionRepository, PlanRepository by extending it.
- `Money` value object — Already validates BDT/USD, handles arithmetic. Use for plan price fields.
- `ComponentCard`, `PageBreadcrumb`, admin tables — Established admin UI components in `src/components/`.
- `AdminShell` + `DashboardShell` — Layout wrapper with sidebar. Just add Products nav item.

### Established Patterns
- Admin page pattern: server component → auth/role check → data fetch via server action → render with ComponentCard
- Server actions in `src/app/(admin)/actions/` — named `admin-{resource}.ts` with `requireAdmin()` guard
- Database: Drizzle ORM with `db` from `@/lib/db`, schema imports from `@/lib/db/schema`
- Navigation: `adminNavItems` array in `src/data/dashboard-nav.ts`

### Integration Points
- `orders.productId` and `licenses.productId` — Currently text fields. After Phase 15, these should reference the products table (foreign key migration in Phase 20, not now)
- `src/data/pricing.ts` — Marketing site pricing data. Phase 15 creates the DB equivalent; marketing site can fetch from DB or keep static for SEO.
- `src/app/(portal)/dashboard/checkout/page.tsx` — Hardcoded plan prices. Will need to fetch from product_plans table instead.
- Admin sidebar nav — Add "Products" entry to `adminNavItems` in `dashboard-nav.ts`

</code_context>

<specifics>
## Specific Ideas

- Current ConversionFlow product should be seeded with 3 existing plans to match `pricing.ts`: Starter ($18 USD / ৳2150 BDT, 1yr, 1 activation), Professional ($28 USD / ৳3000 BDT, 2yr, 3 activations), Agency ($75 USD / ৳8000 BDT, lifetime, unlimited activations)
- Admin UI should follow the Settings nested routing pattern: `/admin/products` (list), `/admin/products/[id]` (detail with tabs for versions and plans)
- Product slug should be auto-generated from name (e.g., "ConversionFlow" → "conversionflow")

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 15-products-context*
*Context gathered: 2026-06-02*
