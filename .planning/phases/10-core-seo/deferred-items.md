# Deferred Items (Out of Scope)

## Pre-existing build errors (not caused by 10-05 changes)

1. `src/app/[locale]/platform-comparison/page.tsx:2` - Imports `platformPricing` from `@/data/pricing` but export doesn't exist (should be `pricingTiers`)
2. `src/app/(admin)/admin/blog/[id]/edit/page.tsx:8` - Module not found (blog admin)
3. `src/app/(admin)/admin/blog/categories/page.tsx:7` - Module not found (blog admin)
4. `src/app/(admin)/admin/blog/new/page.tsx:7` - Module not found (blog admin)
5. `src/app/(admin)/admin/blog/page.tsx:8` - Module not found (blog admin)
6. `src/components/admin/blog/BlogCategoryManager.tsx:4` - Module not found (blog admin)
7. `src/components/admin/blog/BlogPostForm.tsx:7` - Module not found (blog admin)
8. `src/components/admin/blog/BlogPostTable.tsx:5` - Module not found (blog admin)

These are all in unrelated subsystems (blog admin, platform comparison) and were present before 10-05 changes.
