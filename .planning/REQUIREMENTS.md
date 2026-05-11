# Requirements: WooBooster Website

**Defined:** 2026-05-11
**Core Value:** A polished, high-performance marketing website that converts WooCommerce store owners into WooBooster customers through clear presentation of features, pricing, and trust signals.

## v1 Requirements

### Foundation

- [ ] **FOUND-01**: Application builds and runs without errors (`pnpm build` succeeds)
- [ ] **FOUND-02**: `cn()` utility function exists at `src/lib/utils.ts` using clsx + tailwind-merge
- [ ] **FOUND-03**: Footer component exists at `src/components/layout/Footer.tsx` matching design reference
- [ ] **FOUND-04**: Button CSS classes (`btn`, `btn-primary`, `btn-outline`) are defined in `globals.css`
- [ ] **FOUND-05**: CSS typo fixed: `height-[34px]` → `h-[34px]` in Navbar
- [ ] **FOUND-06**: Navbar renders a skeleton placeholder before mount instead of `null` (no layout shift)

### Homepage

- [ ] **HOME-01**: Hero section displays with headline, subheadline, and primary CTA button
- [ ] **HOME-02**: Features preview section shows top product capabilities with icons
- [ ] **HOME-03**: Social proof section displays trust signals (testimonials, stats, or logos)
- [ ] **HOME-04**: Call-to-action section at bottom with conversion-focused messaging
- [ ] **HOME-05**: All sections match visual design from `woobooster-v2.html`

### Features Page

- [ ] **FEAT-01**: Features page exists at `/features` route
- [ ] **FEAT-02**: Page displays detailed feature descriptions with visual examples
- [ ] **FEAT-03**: Features are organized into logical categories
- [ ] **FEAT-04**: Page uses consistent design tokens and matches site design language

### Pricing Page

- [ ] **PRIC-01**: Pricing page exists at `/pricing` route
- [ ] **PRIC-02**: Pricing tiers are displayed with features included in each tier
- [ ] **PRIC-03**: Feature comparison table shows differences between tiers
- [ ] **PRIC-04**: Each tier has a clear CTA button
- [ ] **PRIC-05**: Trust signals present (money-back guarantee, support SLA)

### Changelog Page

- [ ] **CHNG-01**: Changelog page exists at `/changelog` route
- [ ] **CHNG-02**: Version entries are displayed with dates and change descriptions
- [ ] **CHNG-03**: Changes are categorized (new features, improvements, bug fixes)

### Support Page

- [ ] **SUPP-01**: Support page exists at `/support` route
- [ ] **SUPP-02**: FAQ section addresses common questions
- [ ] **SUPP-03**: Contact information or support channel links are provided

### Navigation & Layout

- [ ] **NAV-01**: All navigation links (Home, Features, Pricing, Changelog, Support) resolve to actual pages
- [ ] **NAV-02**: Footer contains navigation links, legal info, and brand elements
- [ ] **NAV-03**: Mobile menu works correctly with all navigation links
- [ ] **NAV-04**: Active page is highlighted in navigation

### SEO & Metadata

- [ ] **SEO-01**: Each page has unique title and meta description
- [ ] **SEO-02**: Open Graph tags present for social media sharing
- [ ] **SEO-03**: Custom 404 page exists with navigation back to home
- [ ] **SEO-04**: Custom favicon replaces default Next.js icon

### Dark Mode

- [ ] **THEME-01**: All pages render correctly in both light and dark mode
- [ ] **THEME-02**: Theme toggle in Navbar switches between light and dark
- [ ] **THEME-03**: Theme preference persists across page navigation

## v2 Requirements

### Enhanced Features

- **ENHV-01**: Scroll-triggered animations on section entry (Framer Motion)
- **ENHV-02**: Interactive product demo or screenshot gallery
- **ENHV-03**: Customer testimonials carousel
- **ENHV-04**: Blog/content section for SEO
- **ENHV-05**: Newsletter signup form

### Performance

- **PERF-01**: Lighthouse score > 90 on all metrics
- **PERF-02**: Image optimization with next/image for all visual assets
- **PERF-03**: Font weight audit — remove unused weights

### Quality

- **QUAL-01**: Unit tests for utility functions (cn, etc.)
- **QUAL-02**: Component tests for Navbar, Footer, ThemeProvider
- **QUAL-03**: E2E tests for navigation and theme switching
- **QUAL-04**: CI/CD pipeline with automated testing

## Out of Scope

| Feature | Reason |
|---------|--------|
| User authentication | Public marketing site, no user accounts needed |
| E-commerce/cart | Product is WooCommerce; site is marketing only |
| CMS integration | Content hardcoded for v1; defer to v2 |
| Backend API | Static marketing site, no server-side data needed |
| Mobile app | Web-first, mobile-responsive is sufficient |
| Live chat widget | Adds third-party JS; support page is sufficient |
| Real-time features | Static content, no real-time needs |
| Blog engine | Defer to v2; focus on core marketing pages first |
| A/B testing | Premature; need traffic first |
| Analytics dashboard | Use Vercel Analytics or similar; not custom-built |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| FOUND-06 | Phase 1 | Pending |
| HOME-01 | Phase 2 | Pending |
| HOME-02 | Phase 2 | Pending |
| HOME-03 | Phase 2 | Pending |
| HOME-04 | Phase 2 | Pending |
| HOME-05 | Phase 2 | Pending |
| FEAT-01 | Phase 3 | Pending |
| FEAT-02 | Phase 3 | Pending |
| FEAT-03 | Phase 3 | Pending |
| FEAT-04 | Phase 3 | Pending |
| PRIC-01 | Phase 3 | Pending |
| PRIC-02 | Phase 3 | Pending |
| PRIC-03 | Phase 3 | Pending |
| PRIC-04 | Phase 3 | Pending |
| PRIC-05 | Phase 3 | Pending |
| CHNG-01 | Phase 3 | Pending |
| CHNG-02 | Phase 3 | Pending |
| CHNG-03 | Phase 3 | Pending |
| SUPP-01 | Phase 3 | Pending |
| SUPP-02 | Phase 3 | Pending |
| SUPP-03 | Phase 3 | Pending |
| NAV-01 | Phase 3 | Pending |
| NAV-02 | Phase 1 | Pending |
| NAV-03 | Phase 3 | Pending |
| NAV-04 | Phase 3 | Pending |
| SEO-01 | Phase 4 | Pending |
| SEO-02 | Phase 4 | Pending |
| SEO-03 | Phase 4 | Pending |
| SEO-04 | Phase 4 | Pending |
| THEME-01 | Phase 3 | Pending |
| THEME-02 | Phase 3 | Pending |
| THEME-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-11*
*Last updated: 2026-05-11 after initial definition*
