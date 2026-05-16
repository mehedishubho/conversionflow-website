---
phase: 06-interactive-features
plan: 02
subsystem: ui
tags: [pricing, currency-toggle, whatsapp, checkout, react-state]

requires:
  - phase: 05-data-layer
    provides: pricing.ts and support.ts data files with structured tier data
provides:
  - USD/BDT currency toggle on pricing page with prominence swap
  - Linked Buy Now buttons pointing to placeholder checkout URLs
  - WhatsApp bKash/Nagad payment notes on each pricing card
  - PricingGrid client component for interactive pricing
affects: [pricing-page, support-page, checkout]

tech-stack:
  added: []
  patterns: [client-component-extraction, currency-state-toggle, external-link-buttons]

key-files:
  created:
    - src/components/sections/PricingGrid.tsx
  modified:
    - src/data/pricing.ts
    - src/data/support.ts
    - src/app/pricing/page.tsx

key-decisions:
  - "PricingGrid extracted as client component; pricing page remains server component for metadata"
  - "Currency toggle uses useState with USD default; prominence swaps between p-price and p-bdt"
  - "WhatsApp phone number (8801721328992) hardcoded in PricingGrid for wa.me links per D-12"

patterns-established:
  - "Server component page imports client component for interactive sections"
  - "Currency toggle pattern: useState swap between two display formats"

requirements-completed: [PRIC-02, PRIC-06]

duration: 12min
completed: 2026-05-12
---

# Phase 6 Plan 02: Currency Toggle and Buy Buttons Summary

**USD/BDT currency toggle with prominence swap, linked checkout buttons, and WhatsApp bKash/Nagad payment notes on pricing page**

## Performance

- **Duration:** 12 min
- **Started:** 2026-05-12T04:18:46Z
- **Completed:** 2026-05-12T04:30:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added checkoutUrl and whatsappMessage fields to pricing data with placeholder URLs
- Updated WhatsApp support channel with real wa.me link
- Created PricingGrid client component with USD/BDT currency toggle
- Converted Buy Now buttons from inert spans to external checkout links
- Added WhatsApp BD payment note below each pricing card

## Task Commits

Each task was committed atomically:

1. **Task 1: Update pricing and support data files** - `be89b9e` (feat)
2. **Task 2: Create PricingGrid with currency toggle** - `0b51724` (feat)

## Files Created/Modified
- `src/data/pricing.ts` - Added checkoutUrl and whatsappMessage fields to PricingTier interface and all 3 tiers
- `src/data/support.ts` - Changed WhatsApp channel href from "#" to "https://wa.me/8801721328992"
- `src/components/sections/PricingGrid.tsx` - New client component with currency toggle, linked buy buttons, and WhatsApp notes
- `src/app/pricing/page.tsx` - Refactored to server component importing PricingGrid; removed inline pricing grid

## Decisions Made
- PricingGrid extracted as a client component while the pricing page stays a server component for SEO metadata
- WhatsApp phone number (8801721328992) is hardcoded in PricingGrid for wa.me links, consistent with support data
- Currency toggle defaults to USD; toggling swaps which price appears large (p-price) vs small (p-bdt)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Restored missing baseline files from 06-01 branch**
- **Found during:** Pre-task setup (worktree missing Phase 2-4 components)
- **Issue:** Worktree was created from commit dfd3ddd which was missing HeroSection, TrustBar, ThemeProvider, BDSection, CTASection, HowItWorks, ScrollReveal, VideoSection, utils.ts, and other files lost during Phase 5 worktree merges
- **Fix:** Cherry-picked baseline commit 76d7a81 from the 06-01 agent branch, then wrote HeroSection.tsx, TrustBar.tsx, and useCountUp.ts from the 06-01 branch
- **Files modified:** 12 files restored/created
- **Verification:** pnpm build passes with all 8 routes generating static pages
- **Committed in:** e3239cd and e707f9b (baseline restore commits)

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Baseline restore was necessary to get the worktree into a buildable state. No scope creep beyond plan objectives.

## Issues Encountered
- Initial support.ts edit collapsed two objects into one due to overly broad old_string match; fixed by restoring the Documentation channel object structure
- Windows build occasionally fails with access violation (0xC0000005); retry resolves it

## Next Phase Readiness
- Pricing page is now fully interactive with currency toggle and buy button links
- Ready for 06-03 (contact form wiring) to complete the support page interactivity
- Checkout URLs are placeholders -- developer must provide real URLs before production

## Self-Check: PASSED

All 5 files verified present. All 5 commits verified in git log. Build passes cleanly.

---
*Phase: 06-interactive-features*
*Completed: 2026-05-12*
