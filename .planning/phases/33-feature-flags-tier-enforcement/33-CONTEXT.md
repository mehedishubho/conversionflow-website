# Phase 33: Feature Flags & Tier Enforcement - Context

**Gathered:** 2026-06-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Add feature flag definitions per plan/tier with a platform dimension, so the validate endpoint returns what features are allowed per platform, enabling fine-grained access control across WordPress, Laravel, Shopify, and Next.js clients. Transform the existing flat Record<string, boolean> feature model into a nested per-platform structure, add a catalog-based feature management system, update the admin UI to a platform toggle matrix, and show customers their tier features in the portal.

**In scope:**
- Schema change: productPlans.features from Record<string, boolean> to Record<string, Record<string, boolean>>> (feature -> platform -> enabled)
- Fixed platform dimension: wordpress, laravel, shopify, nextjs
- Feature catalog: predefined list of valid feature keys that admin picks from (no free-form typing)
- /api/v1/license/validate returns platform-filtered features (new required platform param in request body)
- /api/v1/license/status updated to return platform-filtered features (using same platform param)
- Admin UI: replace flat feature toggles in PlanForm with checkbox grid (rows=features, columns=platforms)
- Customer portal: feature checklist on license detail page showing enabled/locked features for their product platform
- beta_channel feature flag - enables beta version access in update check (deferred from Phase 32, D-12)
- Migration of existing seed data from flat to nested structure
- Feature catalog definition (source of truth for valid feature keys)

**NOT in scope (later phases):**- Multi-gateway payments (Phase 34)
- WordPress SDK PHP client library (Phase 35)
- HMAC request signing for API endpoints (Phase 38)
- Rate limiting per platform (Phase 38)
- Runtime feature gating in admin/portal UI components (future enhancement)
- Tier comparison table in customer portal (future enhancement)
- Dynamic/configurable platform list (over-engineering for v4.0)

</domain>

<decisions>
## Implementation Decisions

### Feature Data Model
- **D-01:** All features use per-platform nesting. Every feature key maps to { wordpress: boolean, laravel: boolean, shopify: boolean, nextjs: boolean }. No hybrid or mixed types. The schema type changes from Record<string, boolean> to Record<string, Record<string, boolean>>>.
- **D-02:** Fixed 4 platforms: wordpress, laravel, shopify, nextjs. Hardcoded enum, not admin-configurable. Adding a 5th platform requires a schema/code change.
- **D-03:** Feature keys are catalog-based. Admin picks features from a predefined catalog (not free-form typing). Catalog is defined in code (config/constants file). Prevents tyoos, ensures consistency across plans.
- **D-04:** The beta_channel feature flag exists in the catalog. When enabled for a platform on a plan, the update check endpoint (Phase 32) also returns beta versions. This fulfills the Phase 32 deferred item (D-12).

### Validate Endpoint Changes
- **D-05:** /api/v1/license/validate gains a required platform field in the request body. Accepted values: wordpress, laravel, shopify, nextjs. Request is rejected if missing or invalid.
- **D-06:** Validate returns a flat features map filtered to the requesting platform. SDKs get exactly the features relevant to their platform - no nesting in the response.
- **D-07:** The ValidateResult interface and ValidateLicenseHandler are extended to include features: Record<string, boolean> | null in the success response. Features are resolved from the plan nested structure using the requested platform key.

### Status Endpoint Changes
- **D-08:** /api/v1/license/status updated similarly - accepts platform param, returns platform-filtered features. Currently returns flat features - needs to accept platform and filter the nested structure.

### Admin UI
- **D-09:** The platform toggle matrix is embedded in the existing PlanForm.tsx component (not a separate page). Replaces the current flat feature flags section.
- **D-10:** Matrix layout: checkbox grid with feature names on rows, 4 platform columns (WP, Laravel, Shopify, Next.js). Each cell is a toggle checkbox. Select all toggle per feature row for quickly enabling across all platforms.
- **D-11:** Features are populated from the catalog - admin selects which features to include in the plan and toggles per-platform. No free-form text input for feature keys.

### Customer Portal
- **D-12:** Feature checklist on the license detail page (src/app/(portal)/dashboard/licenses/[id]/page.tsx). Shows below the activations section. Green checkmarks for enabled, gray/locked for disabled features.
- **D-13:** Features are filtered to the customer product platform. Each product maps to one platform. Portal resolves platform from the product associated with the license.
- **D-14:** No tier comparison table or upgrade prompt in this phase. Just the checklist.

### Claude Discretion
- TypeScript type definitions for nested features structure (PlatformFeatures, FeatureMatrix, etc.)
- Feature catalog source file location and format (likely src/lib/config/feature-catalog.ts)
- Exact feature catalog entries and display names
- Migration strategy for existing seed data from flat to nested
- How the update check endpoint (Phase 32) reads the beta_channel flag
- Whether /api/v1/license/status requires platform as required or optional
- Exact checkbox grid component implementation details
- How portal resolves product-to-platform mapping (product slug vs new field)
- Error response format for invalid/missing platform parameter
- Cache invalidation strategy when plan features change

</decisions>
<Canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- .planning/REQUIREMENTS.md FF-01 through FF-05
- .planning/PROJECT.md Key Decisions
- .planning/ROADMAP.md Phase 33 - Success criteria 1-5

### Prior Phase Context (MUST read)
- .planning/phases/32-v4-milestone/32-CONTEXT.md - Update delivery, beta channel deferral, status endpoint, productPlans.features JSONB
- .planning/phases/16-licensing-core/16-CONTEXT.md - API contracts, validation cache, rate limiting, module structure
- .planning/phases/15-products-context/15-CONTEXT.md - Product/plans/versions schema, admin UI patterns

### Existing Schema
- src/lib/db/schema.ts lines 598-629 - productPlans.features JSONB
- src/lib/db/schema.ts lines 565-589 - productVersions table (beta channel)
- src/lib/db/seed-products.ts lines 58-112 - Existing flat seed data

### API Endpoints
- src/app/api/v1/license/validate/route.ts - Add platform param + features to response
- src/app/api/v1/license/status/route.ts - Already returns features, add platform filter
- src/modules/licensing/application/commands/ValidateLicenseHandler.ts - Extend ValidateResult
- src/modules/licensing/application/commands/LicenseStatusHandler.ts - Already has features field

### Admin UI
- src/components/admin/PlanForm.tsx lines 53-84, 334-394 - Replace with checkbox grid
- src/components/admin/ProductPlansTable.tsx lines 54-63 - Update formatFeatures()
- src/app/(admin)/actions/admin-products.ts lines 452-710 - Update validation

### Customer Portal
- src/app/(portal)/dashboard/licenses/[id]/page.tsx lines 110-193 - Add feature checklist
- src/components/portal/LicenseDetailPanel.tsx lines 115-193 - Extend panel

### Update Delivery Integration
- src/app/api/v1/update/check/route.ts - Beta channel flag integration
- src/modules/update/application/commands/UpdateCheckHandler.ts - Beta filtering

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- ValidateLicenseHandler - Full validation flow with cache, grace period. Extends response for platform-filtered features.
- LicenseStatusHandler - Already returns features. Phase 33 changes type and adds platform filtering.
- PlanForm.tsx - Has feature flag UI. Replace flat section with checkbox grid.
- RateLimiter/ValidationCache - Same infrastructure, no new caching needed.
- Seed data - 3 plans with flat features. Must migrate to nested.
- admin-products.ts - Already validates features. Update for nested.

### Established Patterns
- API route: POST handler, rate limit, parse body, validate input, call handler, return JSON
- INVALID_RESPONSE: Same error shape. Add MISSING_PLATFORM/INVALID_PLATFORM codes.
- Admin form: Client component, useState, server action submission, toast
- DDD layering: Handlers in application/commands/, repositories in infrastructure/repositories/

### Integration Points
- productPlans.features JSONB - Type change, Drizgle + TypeScript update, data migration
- ValidateResult interface - Add features field, populated from nested structure
- LicenseStatusResult - Change type handling for nested + platform filter
- PlanForm.tsx - Replace lines 334-394 with checkbox grid
- productVersions + update check - Beta channel flag
- Portal license detail - Add checklist below activations

</code_context>

<specifics>
## Specific Ideas

- Feature catalog: src/lib/config/feature-catalog.ts with key, label, description, category
- Catalog defines known features. Missing features treated as disabled on all platforms.
- Seed migration: flat -> nested. v3.0 features were WordPress-only (wordpress=original, others=false).
- Platform validation against fixed enum. INVALID_PLATFORM error code.
- Select-all-platforms toggle per feature row in checkbox grid.
- Product-to-platform: explicit platform field on products table. Cleaner than slug convention.

</specifics>

<deferred>
## Deferred Ideas

- Dynamic/configurable platform list - Over-engineering for v4.0
- Tier comparison table in portal - Future enhancement
- Runtime feature gating - Consumer concern for SDKs
- Feature flag analytics - Future admin enhancement
- Feature flag change history - Existing audit log sufficient

</deferred>

---

*Phase: 33-feature-flags-tier-enforcement*
*Context gathered: 2026-06-10*
