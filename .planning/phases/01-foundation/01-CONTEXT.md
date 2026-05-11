# Phase 1: Foundation - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix all build-breaking issues so `pnpm build` succeeds and `pnpm dev` runs cleanly. Create the missing `cn()` utility, Footer component, and button CSS classes that all subsequent phases depend on. Fix the Navbar hydration flash and CSS typo. This phase delivers a building, running project — no new features or pages.

</domain>

<decisions>
## Implementation Decisions

### Footer Component
- **D-01:** Footer renders statically (no Framer Motion entrance animation). It's always visible at page bottom — animation adds no value here.
- **D-02:** Footer is a **server component** (no `"use client"` directive). It has no interactivity, state, or browser APIs.
- **D-03:** Internal nav links (Features, Pricing, Changelog, Support) use Next.js `<Link>` components. External company links (Devsroom, WPMHS) use real URLs from the design reference. Legal/policy links (Privacy Policy, Terms of Service, Refund Policy, License Agreement) use `#` as placeholders — these pages are out of scope for v1.
- **D-04:** Footer layout matches the HTML reference: 4-column grid (2fr brand + 1fr Product + 1fr Company + 1fr Legal) with responsive breakpoints (2-col on tablet, 1-col on mobile).

### Navbar Skeleton
- **D-05:** Navbar returns an **invisible spacer** (empty `div` matching navbar dimensions) before mount instead of `null`. This prevents layout shift without showing any unstyled content flash.
- **D-06:** The CSS typo `height-[34px]` on the logo div is fixed to `h-[34px]` (standard Tailwind height class).

### Button CSS Classes
- **D-07:** All button variants from the HTML reference are added to `globals.css` in one pass: `.btn`, `.btn-primary`, `.btn-outline`, `.btn-lg`, `.btn-xl`, `.btn-white`. This avoids returning to `globals.css` in later phases when hero/pricing sections need the larger variants.
- **D-08:** Button styles use CSS custom properties (design tokens) for colors, matching the existing token system in `globals.css`.

### Utility Function
- **D-09:** `cn()` utility at `src/lib/utils.ts` uses `clsx` + `tailwind-merge` (both already in `package.json`). Standard implementation — no customization needed.

### Agent's Discretion
- Exact padding/sizing values for the Navbar skeleton spacer — agent should match the rendered navbar height.
- Whether to add hover transition details for button CSS — follow the HTML reference closely.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Reference
- `woobooster-v2.html` — Complete HTML prototype (1247 lines). Footer section at lines 990-1025. Button CSS at lines 74-82. Footer grid CSS at lines 327-334.

### Existing Source Files
- `src/components/layout/Navbar.tsx` — Current Navbar with `cn()` import (line 9), CSS typo at line 47 (`height-[34px]`), hydration flash at line 33 (`return null`).
- `src/app/layout.tsx` — Root layout importing Footer (line 6), Navbar, ThemeProvider. Footer is already wired in.
- `src/app/globals.css` — Current CSS with design tokens, `.glass` and `.hero-mesh` utilities. Button classes need to be added.
- `src/components/layout/ThemeProvider.tsx` — Client component wrapping next-themes.

### Project Configuration
- `.planning/PROJECT.md` — Project constraints, design fidelity requirement.
- `.planning/REQUIREMENTS.md` — FOUND-01 through FOUND-06, NAV-02 acceptance criteria.
- `.planning/ROADMAP.md` — Phase 1 plans (01-01, 01-02, 01-03).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `cn()` from `clsx` + `tailwind-merge`: Both packages already installed in `package.json`. Just need to create `src/lib/utils.ts`.
- Design token system: Full light/dark theme CSS variables already defined in `globals.css` (`:root` and `.dark` selectors).
- `.glass` utility: Glassmorphism effect already available for potential Footer styling.
- `motion` from `framer-motion`: Already imported in Navbar — available if Footer needs animation (decided: not needed).

### Established Patterns
- Server components by default: `page.tsx` and `layout.tsx` have no `"use client"` directive.
- Client components marked explicitly: `Navbar.tsx` and `ThemeProvider.tsx` use `"use client"` at top.
- TailwindCSS v4 CSS-first config: All customization via `@theme` block and CSS variables in `globals.css`.
- Font system: Syne for headings, DM Sans for body, JetBrains Mono for code — loaded in `layout.tsx`.

### Integration Points
- `src/app/layout.tsx:6` — Footer import already exists (`import { Footer } from "@/components/layout/Footer"`). Just need to create the file.
- `src/components/layout/Navbar.tsx:9` — `cn()` import already exists (`import { cn } from "@/lib/utils"`). Just need to create the file.
- `src/app/globals.css` — Button classes referenced by Navbar (lines 90, 97, 140) but not yet defined.

</code_context>

<specifics>
## Specific Ideas

- Footer must match the HTML reference design exactly: brand section with logo + tagline + Bangladesh flag, Product column, Company column, Legal column, and bottom bar with copyright + credits.
- Button CSS must include the shimmer hover effect (`.btn::before` pseudo-element with gradient sweep) from the HTML reference.
- The Navbar skeleton should be invisible (not a visual skeleton with shapes) — just a transparent spacer div that occupies the same space.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-05-11*
