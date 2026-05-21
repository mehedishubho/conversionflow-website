# Deferred Items

## Pre-existing Build Failure (Out of Scope)

**Issue:** `platformPricing` export missing from `@/data/pricing` -- referenced by `src/app/[locale]/platform-comparison/page.tsx` and multiple blog admin files.
**Impact:** `pnpm build` fails with `Export platformPricing doesn't exist in target module`.
**Scope:** Pre-existing issue, not introduced by Plan 12-04 changes.
**Action:** Deferred. Not fixed during Plan 12-04 execution per scope boundary rules.
