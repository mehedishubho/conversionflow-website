---
phase: 05-data-layer
plan: 02
subsystem: data
tags: [data-extraction, pricing, changelog, faq, dual-currency, typescript-interfaces]

# Dependency graph
requires:
  - phase: 03-content-pages
    provides: Inline pricing/changelog/FAQ data in page components
provides:
  - "src/data/pricing.ts with PricingTier interface and dual-currency fields (priceUSD/priceBDT)"
  - "src/data/changelog.ts with ChangelogEntry interface and ChangeType union"
  - "src/data/faq.ts with FAQItem interface"
  - "Consumer files updated to import from @/data/"
affects: [06-interactive-features, 09-internationalization]

# Tech tracking
tech-stack:
  added: []
  patterns: [co-located-type-exports, dual-currency-pricing-fields, data-presentation-separation]

key-files:
  created:
    - src/data/pricing.ts
    - src/data/changelog.ts
    - src/data/faq.ts
    - src/app/pricing/page.tsx
    - src/app/changelog/page.tsx
    - src/components/sections/FAQAccordion.tsx
  modified: []

key-decisions:
  - "Renamed price/bdt fields to priceUSD/priceBDT in pricing data for Phase 6 currency toggle support (D-04)"
  - "Kept tagLabels in changelog page component as presentation logic per D-03 separation principle"
  - "Used literal union types instead of as const for buttonStyle and ChangeType fields"

patterns-established:
  - "Data file pattern: co-located interface + typed export const, no as const assertions"
  - "Consumer import pattern: import { data } from '@/data/filename'"
  - "Presentation logic stays in components; pure data goes to src/data/"

requirements-completed: [DATA-01, DATA-02, DATA-05, CHLOG-03]

# Metrics
duration: 2min
completed: 2026-05-11
---

# Phase 5 Plan 02: Core Data Extraction Summary

**Extracted pricing (with dual-currency priceUSD/priceBDT), changelog, and FAQ data into typed TypeScript data files with co-located interfaces**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-11T20:43:00Z
- **Completed:** 2026-05-11T20:45:06Z
- **Tasks:** 1
- **Files modified:** 6

## Accomplishments
- Created 3 data files (pricing.ts, changelog.ts, faq.ts) with TypeScript interfaces and typed exports
- Updated pricing page with dual-currency field names (priceUSD/priceBDT) for Phase 6 currency toggle
- Kept tagLabels in changelog component as presentation logic (per D-03 data/presentation separation)
- Build passes cleanly with all routes generating as static pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Create pricing.ts, changelog.ts, faq.ts and update consumers** - `51f9705` (feat)

## Files Created/Modified
- `src/data/pricing.ts` - PricingFeature and PricingTier interfaces, pricingTiers export with dual-currency fields
- `src/data/changelog.ts` - ChangeType union, ChangelogChange and ChangelogEntry interfaces, changelogEntries export
- `src/data/faq.ts` - FAQItem interface, faqItems export with 5 FAQ entries
- `src/app/pricing/page.tsx` - Imports pricingTiers from @/data/pricing, uses tier.priceUSD and tier.priceBDT
- `src/app/changelog/page.tsx` - Imports changelogEntries from @/data/changelog, keeps tagLabels inline
- `src/components/sections/FAQAccordion.tsx` - Imports faqItems from @/data/faq

## Decisions Made
- Used `priceUSD` and `priceBDT` field names (renamed from `price` and `bdt`) to support Phase 6 currency toggle (D-04)
- Used literal union types (`"btn-primary" | "btn-outline"`, `"new" | "imp" | "fix"`) instead of `as const` per plan specification
- tagLabels kept in changelog page component since it maps data types to CSS classes and display labels (presentation logic, not data)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all files created cleanly on first attempt, build passed without errors.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Pricing data uses dual-currency fields ready for Phase 6 currency toggle
- Data files structured for easy i18n extraction in Phase 9
- All three data files follow consistent pattern (interface + typed export) for remaining 05-03 and 05-04 plans

## Self-Check: PASSED

All 7 files verified present. Commit 51f9705 verified in git log.

---
*Phase: 05-data-layer*
*Completed: 2026-05-11*
