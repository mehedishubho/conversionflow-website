---
phase: 05-data-layer
plan: 03
subsystem: data
tags: [typescript, data-extraction, features, testimonials, support]

requires:
  - phase: 01-foundation
    provides: Component structure, layout, globals.css, design tokens
  - phase: 02-homepage
    provides: FeaturesBento section, Testimonials section
  - phase: 03-content-pages
    provides: Features page, Support page
provides:
  - "src/data/features.ts — FeatureModule interface + featureModules export supporting bento summary and detail row fields"
  - "src/data/testimonials.ts — Testimonial interface + testimonials export"
  - "src/data/support.ts — SupportChannel interface + supportChannels export"
  - "Data-driven rendering in FeaturesBento, Features page, Testimonials, and Support page via .map() loops"
affects: [06-interactive-features, 09-internationalization]

tech-stack:
  added: []
  patterns: ["Co-located interface + data export pattern", "Data-driven component rendering via .map()", "Optional extended fields on shared interface for dual-use data files"]

key-files:
  created:
    - src/data/features.ts
    - src/data/testimonials.ts
    - src/data/support.ts
  modified:
    - src/components/sections/FeaturesBento.tsx
    - src/components/sections/Testimonials.tsx
    - src/app/features/page.tsx
    - src/app/support/page.tsx

key-decisions:
  - "Single features.ts file serves both homepage bento and features page detail rows via optional fields — avoids data drift"
  - "Smart quotes removed from testimonial data; component handles quote wrapping via &quot; entities"
  - "Courier sync visual components (courier cards, flow diagram) kept inline as decorative UI chrome per RESEARCH Pitfall 5"
  - "Feature tabs kept inline (decorative, no filtering JS)"
  - "Support page uses mailto: check to determine <a> vs <Link> for channel actions"

patterns-established:
  - "Unified data file with optional extended fields for components needing different detail levels"
  - "mailto: detection pattern for conditional a/Link rendering"

requirements-completed: [DATA-03, DATA-04, DATA-06]

duration: 8min
completed: 2026-05-11
---

# Phase 5 Plan 03: Feature, Testimonial, and Support Data Extraction Summary

**Extracted feature modules, testimonials, and support channels to typed data files with data-driven rendering in all consumer components**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-11T20:50:17Z
- **Completed:** 2026-05-11T20:58:24Z
- **Tasks:** 2
- **Files modified:** 7 (3 created, 4 modified)

## Accomplishments
- Created unified features.ts data file serving both homepage bento grid and features page detail rows
- Extracted testimonials and support channel data to dedicated typed data files
- Converted all 4 consumer components from hardcoded inline JSX to data-driven .map() rendering
- Features page tracking panel and fraud box now use data-driven loops from features.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Create features.ts data file with unified module structure** - `1759c10` (feat)
2. **Task 2: Create testimonials.ts and support.ts, update consumers** - `f5c22be` (feat)

## Files Created/Modified

- `src/data/features.ts` - FeatureModule interface with optional detail fields (eyebrow, detailDescription, checks, trackingPlatforms, fraudOrders, fraudStats) + featureModules export with all 6 modules
- `src/data/testimonials.ts` - Testimonial interface with avatarColor literal union + testimonials export with 3 testimonials
- `src/data/support.ts` - SupportChannel interface + supportChannels export with 3 channels
- `src/components/sections/FeaturesBento.tsx` - Replaced 6 hardcoded bento cards with featureModules.map() loop
- `src/components/sections/Testimonials.tsx` - Replaced 3 hardcoded testimonial cards with testimonials.map() loop
- `src/app/features/page.tsx` - Replaced 3 inline feat-row blocks with data-driven loop over detailModules, tracking panel uses trackingPlatforms array, fraud box uses fraudOrders/fraudStats arrays
- `src/app/support/page.tsx` - Replaced 3 hardcoded support cards with supportChannels.map() loop, mailto: check for a vs Link

## Decisions Made

- **Single features.ts for bento + detail**: Using optional fields (eyebrow, detailDescription, etc.) on a shared interface avoids maintaining two separate feature data files that could drift out of sync. Components consume the fields they need.
- **Smart quotes removed from data**: The original Testimonials component used `&quot;` HTML entities for quote rendering. Data stores raw text without quotes; component wraps with `&quot;{t.quote}&quot;`.
- **Courier sync visual chrome inline**: Per RESEARCH Pitfall 5, the courier cards and flow diagram in the features page are decorative/illustrative UI chrome, not translatable content. Kept inline in the JSX.
- **mailto: detection for support links**: Email channel uses `<a href="mailto:...">` while other channels use `<Link href={...}>`, determined by checking `ch.href.startsWith("mailto:")`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Smart quotes in testimonials.ts caused TypeScript build failure**
- **Found during:** Task 2 (build verification)
- **Issue:** Unicode smart/curly quotes in testimonial data strings were interpreted as string delimiters by TypeScript, causing parse error: `Type error: ',' expected.`
- **Fix:** Removed smart quotes from testimonial data. The component already handles quote wrapping with `&quot;{t.quote}&quot;` HTML entities.
- **Files modified:** src/data/testimonials.ts
- **Verification:** pnpm build passes with exit code 0
- **Committed in:** f5c22be (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor fix for character encoding issue. No scope creep.

## Issues Encountered

None beyond the smart quotes fix documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 3 data files (features.ts, testimonials.ts, support.ts) created and integrated
- Combined with 05-01 (navigation.ts) and 05-02 (pricing.ts, changelog.ts, faq.ts), all 7 planned data files for the data layer are accounted for
- i18n extraction (Phase 9) can directly consume these typed data files for translation
- All consumer components use data-driven rendering patterns ready for translated content injection

## Self-Check: PASSED

All 7 source files and 1 summary file verified present. Both task commits (1759c10, f5c22be) confirmed in git log.

---
*Phase: 05-data-layer*
*Completed: 2026-05-11*
