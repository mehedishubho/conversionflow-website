# Phase 10: Polish and Enhancements - Context

**Gathered:** 2026-05-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Premium visual polish: typography cleanup, ScrollReveal consolidation, responsive audit with container widening, and consistent animation coverage across all pages. Custom cursor is already implemented and requires no changes.

</domain>

<decisions>
## Implementation Decisions

### Typography
- **D-01:** Remove Syne font entirely. Standardize on DM_Sans for all text (headings and body).
- **D-02:** Remove `--font-syne` from `@theme` block in `globals.css` and any `.font-syne` utility classes.
- **D-03:** Heading classes (`.sec-title`, `.bc-title`, `.step-t`, etc.) should use `font-family: var(--font-dm-sans)` with appropriate weights (700-800). No synthetic bold.
- **D-04:** ROADMAP success criteria "Syne font renders weight 900" is reinterpreted as "headings render with DM_Sans at correct weights without synthetic bold."

### ScrollReveal Consolidation
- **D-05:** Keep `src/components/layout/ScrollReveal.tsx` (whileInView pattern). Delete `src/components/sections/ScrollReveal.tsx` (useInView hook duplicate).
- **D-06:** Remove legacy CSS classes from `globals.css`: `.sr`, `.sr.vis`, `.sr-d1` through `.sr-d4`.
- **D-07:** Update any imports referencing `sections/ScrollReveal` to use `layout/ScrollReveal` instead.

### Animation Coverage
- **D-08:** Wrap all below-the-fold sections across ALL pages (Features, Pricing, Changelog, Support, Blog, Docs, Legal) with the `ScrollReveal` component for consistent fade-up on scroll.
- **D-09:** Keep existing `PageTransition` component as-is (fade/slide on route change). No enhancement needed.
- **D-10:** Verify `PageTransition` works correctly with locale routes (`/en/*`, `/bn/*`).

### Responsive Design
- **D-11:** Audit all pages at existing breakpoints: 960px (tablet) and 640px (mobile). Fix layout issues found.
- **D-12:** Widen container max-width from 1160px to 1280px in `globals.css`.
- **D-13:** No new breakpoints added. Existing 960px/640px breakpoints are sufficient.

### Custom Cursor
- **D-14:** No changes needed. Custom cursor is already implemented with Framer Motion spring physics in `src/components/layout/CustomCursor.tsx`.

### Agent's Discretion
- Exact DM_Sans weight values for heading classes (700 vs 800)
- Which specific sections on each page need ScrollReveal wrapping
- Minor responsive fixes discovered during audit
- Whether to consolidate `cn` imports after deleting `sections/ScrollReveal.tsx`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Reference
- `woobooster-v2.html` — Original HTML design reference for visual parity (typography, layout, responsive behavior)

### Requirements
- `.planning/REQUIREMENTS.md` — FOUND-03 (Syne font → now DM_Sans), FOUND-05 (responsive), FOUND-08 (custom cursor), FOUND-09 (animations)

### Roadmap
- `.planning/ROADMAP.md` — Phase 10 success criteria (reinterpreted for DM_Sans)

### Existing Code (must read before implementing)
- `src/app/globals.css` — Design tokens, responsive breakpoints (960px/640px), legacy `.sr` classes to remove, container to widen
- `src/app/[locale]/layout.tsx` — Font configuration, currently imports DM_Sans, Noto_Sans_Bengali, JetBrains_Mono (no Syne)
- `src/components/layout/ScrollReveal.tsx` — Keep this implementation (whileInView pattern)
- `src/components/sections/ScrollReveal.tsx` — Delete this duplicate
- `src/components/layout/CustomCursor.tsx` — Already implemented, no changes
- `src/components/layout/PageTransition.tsx` — Keep as-is, verify locale route compatibility

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/layout/ScrollReveal.tsx` — whileInView fade-up component, use across all pages
- `src/components/layout/StaggerReveal.tsx` + `StaggerItem` — Staggered children animation, available for sections that benefit from it
- `src/components/layout/PageTransition.tsx` — Route change animation, already in use
- `src/components/layout/CustomCursor.tsx` — Spring-physics cursor, complete

### Established Patterns
- Server components by default; client components only for interactivity
- Framer Motion for all animations (no CSS animation mixing)
- CSS `@media` queries for custom class responsive behavior (not Tailwind responsive prefixes)
- Tailwind responsive prefixes (`md:`, `sm:`, `lg:`) used in component JSX

### Integration Points
- `src/app/[locale]/layout.tsx` — Main layout wrapping all pages (fonts, providers, navbar, footer, cursor)
- `src/app/[locale]/page.tsx` — Homepage, sections already wrapped with ScrollReveal
- `src/app/[locale]/features/page.tsx` — Features page, needs ScrollReveal audit
- `src/app/[locale]/pricing/page.tsx` — Pricing page, needs ScrollReveal audit
- `src/app/[locale]/changelog/page.tsx` — Changelog page, needs ScrollReveal audit
- `src/app/[locale]/support/page.tsx` — Support page, needs ScrollReveal audit
- `src/app/[locale]/blog/page.tsx` — Blog page, needs ScrollReveal audit
- `src/app/[locale]/docs/` — Docs pages, needs ScrollReveal audit

</code_context>

<specifics>
## Specific Ideas

- Container widening to 1280px should be applied to the `.container` class in globals.css
- Heading font weights should feel bold and distinctive even without Syne — use DM_Sans weight 700 or 800
- ScrollReveal should use consistent parameters across all pages: `yOffset={32}`, `duration={0.65}`, `ease=[0.22, 1, 0.36, 1]`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 10-polish-and-enhancements*
*Context gathered: 2026-05-14*
