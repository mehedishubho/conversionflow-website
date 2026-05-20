---
phase: 11-tracking-pixels-social-seo
plan: 04
subsystem: admin-seo
tags: [schema, json-ld, structured-data, organization, product, article, faq, howto, review]

# Dependency graph
requires:
  - phase: 11-01
    provides: "tracking-keys.ts (SCHEMA_KEYS), admin-tracking-v2.ts (getTrackingSettings, saveTrackingSettings)"
provides:
  - "SchemaForm component with per-schema-type forms, JSON-LD preview, Google Rich Results Test links"
  - "Enhanced seo.ts with getSchemaSettings and override support on all 4 schema functions"
  - "Schema page at /admin/settings/seo/schema"
affects: [seo, structured-data, json-ld, schema-markup]

# Tech tracking
tech-stack:
  added: []
  patterns: "schema-override-merge-pattern, collapsible-section-with-enable-toggle, reactive-jsonld-preview"

key-files:
  created:
    - src/components/admin/seo/SchemaForm.tsx
  modified:
    - src/lib/seo.ts
    - src/app/(admin)/admin/settings/seo/schema/page.tsx

key-decisions:
  - "Schema overrides stored as flattened JSON string in seo_schema_overrides key, parsed at runtime"
  - "Global schemas (Organization, WebSite, Breadcrumb) default enabled; Content schemas default disabled"
  - "Each schema section uses collapsible card with enable/disable switch and reactive JSON-LD preview"
  - "FAQ and HowTo use JSON textarea for complex data entry; Article uses select for article type"

patterns-established:
  - "Schema override pattern: optional overrides param on schema functions merges with siteConfig defaults"
  - "Collapsible schema section: SchemaSection component with toggle switch, chevron expand, JSON-LD preview"

requirements-completed: [SCHM-01, SCHM-02, SCHM-03, SCHM-04, SCHM-05]

# Metrics
duration: 5min
completed: 2026-05-21
---

# Phase 11 Plan 04: Schema Markup Summary

**Per-schema-type forms (8 types) with DB override support, reactive JSON-LD preview, auto-generation toggle, and Google Rich Results Test validation links**

## Performance

- **Duration:** 5 min
- **Started:** 2026-05-20T19:39:02Z
- **Completed:** 2026-05-20T19:44:02Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

### Task 1: Enhance seo.ts with schema override support

- All 4 schema functions (`organizationSchema`, `websiteSchema`, `productSchema`, `breadcrumbSchema`) now accept optional `overrides` parameter
- Added `getSchemaSettings()` async function reading 3 schema keys from DB (`seo_schema_auto_generate`, `seo_schema_types_enabled`, `seo_schema_overrides`)
- Exported `SchemaSettings` interface for use by SchemaForm component
- Added `parseSameAs` helper for flexible comma-separated or JSON array sameAs links
- Backwards compatible: all overrides parameters are optional, existing behavior preserved

### Task 2: Build SchemaForm component and schema page

- Created SchemaForm client component with auto-generate toggle (SCHM-05)
- 3 global schema sections (Organization, WebSite, Breadcrumb) with toggle, override fields, JSON-LD preview (SCHM-01)
- 5 content schema sections (Product, Article, FAQ, HowTo, Review) with toggle, fields, JSON-LD preview (SCHM-02)
- Read-only JSON-LD preview updates reactively as form fields change (SCHM-03)
- Google Rich Results Test validation link per schema section (SCHM-04)
- Article schema with type select dropdown (Article/NewsArticle/BlogPosting)
- FAQ and HowTo schemas with JSON textarea for complex data entry
- Schema page loads SCHEMA_KEYS data and renders SchemaForm

## Task Commits

Each task was committed atomically:

1. **Task 1: Enhance seo.ts to read schema overrides from DB** - `f38fe40` (feat)
2. **Task 2: Build SchemaForm component and schema page** - `60e85ac` (feat)

## Files Created/Modified

- `src/lib/seo.ts` - Enhanced all 4 schema functions with optional overrides, added getSchemaSettings() and SchemaSettings export
- `src/components/admin/seo/SchemaForm.tsx` - Full schema markup admin form with 8 schema types, collapsible sections, JSON-LD preview
- `src/app/(admin)/admin/settings/seo/schema/page.tsx` - Server page loading SCHEMA_KEYS data and rendering SchemaForm

## Decisions Made

- Schema overrides stored as flattened JSON string in `seo_schema_overrides` key (e.g., `{"org_name": "Custom Name", "product_low_price": "29"}`), parsed at runtime by SchemaForm
- Global schemas (Organization, WebSite, Breadcrumb) default enabled; Content schemas (Product, Article, FAQ, HowTo, Review) default disabled
- FAQ and HowTo use JSON textarea for complex nested data since standard fields would be unwieldy
- Article type uses select dropdown rather than text input to prevent typos
- SchemaSection is an internal component (not exported) since it is specific to SchemaForm

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- TypeScript strict mode flagged `as const` arrays where not all items had optional properties (`multiline`, `hasJsonTextarea`, etc.). Fixed by replacing `as const` with explicit typed interfaces (`GlobalSchemaDef`, `ContentSchemaDef`, `SchemaFieldDef`).
- Optional `jsonTextareaKey` property required IIFE guard to narrow type inside JSX callback context.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Schema markup page is fully functional with all 8 schema types
- Plan 11-05 (SEO overview redesign) can reference the SchemaForm as the 9th card in SeoOverviewCards
- All Phase 11 plans (01-04) are complete

---
*Phase: 11-tracking-pixels-social-seo*
*Completed: 2026-05-21*

## Self-Check: PASSED

- All 3 created/modified files verified present on disk
- Both task commits (f38fe40, 60e85ac) found in git log
- TypeScript compilation passes for all files (zero errors in SchemaForm, schema page, seo.ts)
