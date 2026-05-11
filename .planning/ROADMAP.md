# Roadmap: WooBooster Website

## Overview

Transform the WooBooster website from an early Next.js scaffold with build-breaking issues into a fully functional, polished marketing site. The journey starts by fixing foundation issues (missing components, broken imports), ports the complete HTML design reference into React components, builds out all planned route pages, and finishes with SEO, performance optimization, and quality assurance.

## Phases

- [ ] **Phase 1: Foundation** - Fix build errors, create missing utilities and components
- [ ] **Phase 2: Homepage** - Port hero and content sections from HTML design reference
- [ ] **Phase 3: Content Pages** - Build Features, Pricing, Changelog, and Support pages
- [ ] **Phase 4: Polish** - SEO, 404 page, animations, performance, brand assets

## Phase Details

### Phase 1: Foundation
**Goal**: Get the project building and running without errors. Establish the component and utility foundation that all subsequent phases depend on.
**Depends on**: Nothing (first phase)
**Requirements**: [FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, NAV-02]
**Success Criteria** (what must be TRUE):
  1. `pnpm build` completes without errors
  2. `pnpm dev` starts and all existing pages render correctly
  3. Footer component renders with design token styling matching the design reference
  4. Buttons in Navbar are styled correctly (not unstyled text links)
  5. Navbar renders without layout shift on page load
**Plans**: 3 plans

Plans:
- [ ] 01-01: Create `src/lib/utils.ts` with `cn()` function and fix CSS typo in Navbar (`height-[34px]` → `h-[34px]`)
- [ ] 01-02: Create `src/components/layout/Footer.tsx` porting design from `woobooster-v2.html` and add button CSS classes to `globals.css`
- [ ] 01-03: Fix Navbar hydration flash (render skeleton before mount) and verify full build succeeds

### Phase 2: Homepage
**Goal**: Port the homepage content from the HTML design reference into Next.js components. The homepage should display the hero section, features preview, social proof, and call-to-action.
**Depends on**: Phase 1
**Requirements**: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05]
**Success Criteria** (what must be TRUE):
  1. Homepage displays hero section with headline, subheadline, and CTA
  2. Features preview section shows product capabilities with icons
  3. Social proof or trust signals section is visible
  4. Bottom CTA section drives conversion
  5. Visual design matches `woobooster-v2.html` reference
**Plans**: 3 plans

Plans:
- [ ] 02-01: Create hero section component and features preview section, porting from `woobooster-v2.html`
- [ ] 02-02: Create social proof section and CTA section components
- [ ] 02-03: Compose all sections in `src/app/page.tsx`, ensure responsive layout and dark/light mode

### Phase 3: Content Pages
**Goal**: Build all four planned content pages (Features, Pricing, Changelog, Support) with proper navigation. Every nav link should resolve to a real page.
**Depends on**: Phase 2
**Requirements**: [FEAT-01, FEAT-02, FEAT-03, FEAT-04, PRIC-01, PRIC-02, PRIC-03, PRIC-04, PRIC-05, CHNG-01, CHNG-02, CHNG-03, SUPP-01, SUPP-02, SUPP-03, NAV-01, NAV-03, NAV-04, THEME-01, THEME-02, THEME-03]
**Success Criteria** (what must be TRUE):
  1. All five navigation links (Home, Features, Pricing, Changelog, Support) resolve to real pages
  2. Features page displays categorized product capabilities
  3. Pricing page shows tiers with feature comparison and CTAs
  4. Changelog page lists version history with categorized changes
  5. Support page provides FAQ and contact information
  6. All pages render correctly in both light and dark mode
  7. Mobile menu works correctly with all navigation links
**Plans**: 4 plans

Plans:
- [ ] 03-01: Create Features page (`/features`) with categorized feature showcase
- [ ] 03-02: Create Pricing page (`/pricing`) with tiers, comparison table, and trust signals
- [ ] 03-03: Create Changelog page (`/changelog`) and Support page (`/support`)
- [ ] 03-04: Verify all navigation works end-to-end, test dark/light mode on all pages, test mobile menu

### Phase 4: Polish
**Goal**: Add SEO metadata, custom 404 page, scroll animations, and brand assets. Optimize performance and ensure the site is production-ready.
**Depends on**: Phase 3
**Requirements**: [SEO-01, SEO-02, SEO-03, SEO-04]
**Success Criteria** (what must be TRUE):
  1. Each page has unique title and meta description
  2. Open Graph tags render correctly when shared on social media
  3. Custom 404 page displays with navigation back to home
  4. Custom favicon replaces default Next.js icon
  5. Lighthouse performance score > 80
**Plans**: 3 plans

Plans:
- [ ] 04-01: Add SEO metadata exports to all pages (title, description, OG tags) and create custom favicon
- [ ] 04-02: Create custom 404 page (`not-found.tsx`) and add scroll-triggered animations to sections
- [ ] 04-03: Performance audit — optimize fonts, images, and bundle size; verify Lighthouse scores

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. Homepage | 0/3 | Not started | - |
| 3. Content Pages | 0/4 | Not started | - |
| 4. Polish | 0/3 | Not started | - |
