# Roadmap: WooBooster Website

## Overview

Transform the WooBooster website from a working visual prototype (Phases 1-4 complete) into a fully functional, production-ready marketing site with data-driven content, interactive features, blog/documentation sections, legal pages, SEO completion, and bilingual support. Phases 1-4 established the visual design and page structure. Phases 5-10 add functionality, new content sections, and production readiness.

## Milestones

- **v1.0 Core Site** - Phases 1-4 (shipped 2026-05-11)
- **v1.1 Functional Site** - Phases 5-10 (current milestone)

## Phases

**Phase Numbering:**
- Integer phases (1-4): Completed milestone work
- Integer phases (5-10): Current milestone work

<details>
<summary>v1.0 Core Site (Phases 1-4) - SHIPPED 2026-05-11</summary>

- [x] **Phase 1: Foundation** - Fix build errors, create missing utilities and components
- [x] **Phase 2: Homepage** - Port hero and content sections from HTML design reference
- [x] **Phase 3: Content Pages** - Build Features, Pricing, Changelog, and Support pages
- [x] **Phase 4: Polish** - SEO, 404 page, animations, performance, brand assets

</details>

- [ ] **Phase 5: Data Layer** - Extract all content into TypeScript data files and configure deployment
- [ ] **Phase 6: Interactive Features** - Wire up currency toggle, contact form, buy buttons, and count-up animations
- [ ] **Phase 7: Blog, Docs, and Legal** - MDX blog/documentation sections and legal content pages
- [ ] **Phase 8: SEO Completion** - Sitemap, robots.txt, and analytics tracking
- [ ] **Phase 9: Internationalization** - Bengali language support via next-intl
- [ ] **Phase 10: Polish and Enhancements** - Custom cursor, Syne 900, responsive audit, enhanced animations

## Phase Details

<details>
<summary>v1.0 Core Site Details (Phases 1-4)</summary>

### Phase 1: Foundation
**Goal**: Get the project building and running without errors. Establish the component and utility foundation that all subsequent phases depend on.
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-04, FOUND-10
**Success Criteria** (what must be TRUE):
  1. `pnpm build` completes without errors
  2. `pnpm dev` starts and all existing pages render correctly
  3. Footer component renders with design token styling matching the design reference
  4. Buttons in Navbar are styled correctly (not unstyled text links)
  5. Navbar renders without layout shift on page load
**Plans**: 3 plans (complete)

### Phase 2: Homepage
**Goal**: Port the homepage content from the HTML design reference into Next.js components. The homepage should display all 8 sections with dark/light mode and responsive layout.
**Depends on**: Phase 1
**Requirements**: HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, HOME-07, HOME-08, HOME-09
**Success Criteria** (what must be TRUE):
  1. Homepage displays hero section with dashboard mockup, headline, and CTAs
  2. Trust bar shows key stats with design-matched styling
  3. Bento features grid displays 6 modules with icons and descriptions
  4. BD couriers section displays courier cards with live status chips
  5. How It Works, Testimonials, and CTA sections render correctly
  6. Visual design matches woobooster-v2.html reference
**Plans**: 3 plans (complete)

### Phase 3: Content Pages
**Goal**: Build all four content pages (Features, Pricing, Changelog, Support) with proper navigation and visual components matching the design reference.
**Depends on**: Phase 2
**Requirements**: FEAT-01, FEAT-02, FEAT-03, FEAT-04, FEAT-05, FEAT-06, FEAT-07, PRIC-01, PRIC-03, PRIC-04, PRIC-05, CHLOG-01, CHLOG-02, SUPP-01, SUPP-02
**Success Criteria** (what must be TRUE):
  1. All five navigation links resolve to real pages
  2. Features page displays module details with tracking panel and fraud box
  3. Pricing page shows 3 tiers with feature checklists and FAQ accordion
  4. Changelog page lists version history with tagged changes
  5. Support page displays support cards and contact form layout
  6. All pages render correctly in both light and dark mode
**Plans**: 4 plans (complete)

### Phase 4: Polish
**Goal**: Add SEO metadata, custom 404 page, scroll animations, and favicon. Optimize performance baseline.
**Depends on**: Phase 3
**Requirements**: SEO-01, SEO-02
**Success Criteria** (what must be TRUE):
  1. Each page has unique title and meta description via Metadata API
  2. Open Graph tags render correctly for social sharing
  3. Custom 404 page displays with navigation back to home
  4. Custom favicon replaces default Next.js icon
  5. ScrollReveal animations trigger on homepage below-fold sections
**Plans**: 3 plans (complete)

</details>

### Phase 5: Data Layer
**Goal**: All page content lives in structured TypeScript data files (not inline JSX), and the project is configured for self-hosted deployment. This unblocks i18n (translating data files) and makes content maintainable.
**Depends on**: Phase 4
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, CHLOG-03, FOUND-07
**Success Criteria** (what must be TRUE):
  1. Pricing page renders identical content but reads from src/data/pricing.ts instead of inline arrays
  2. Changelog page renders identical content but reads from src/data/changelog.ts instead of inline arrays
  3. Testimonials, features, FAQ, support info, and navigation links each have dedicated data files in src/data/
  4. `pnpm build` produces standalone output (output: 'standalone' in next.config.ts)
  5. No visual or content changes from user perspective -- pure refactor
**Plans**: 4 plans

Plans:
- [x] 05-01-PLAN.md -- Extract navigation links to data file, update Navbar + Footer
- [x] 05-02-PLAN.md -- Extract pricing, changelog, FAQ data to data files, update consumers
- [x] 05-03-PLAN.md -- Extract features, testimonials, support data to data files, update consumers
- [x] 05-04-PLAN.md -- Configure standalone output, install sharp, create Dockerfile

### Phase 6: Interactive Features
**Goal**: Existing pages gain real interactive functionality -- users can toggle currencies, submit contact forms that send email, follow buy links, and see count-up animations on stats. Pages stop being static mockups and become functional.
**Depends on**: Phase 5
**Requirements**: PRIC-02, PRIC-06, SUPP-03, SUPP-04, SUPP-05, HOME-10
**Success Criteria** (what must be TRUE):
  1. User can toggle between USD and BDT on the pricing page and see all prices update
  2. User can fill out and submit the contact form, and receive confirmation feedback
  3. Contact form validates required fields and shows inline error messages before submission
  4. "Buy Now" buttons link to external checkout; WhatsApp option visible for BD payments
  5. Trust bar stats and dashboard numbers animate with count-up effect on scroll
**Plans**: 3 plans

Plans:
- [x] 06-01-PLAN.md -- Extract useCountUp hook, animate TrustBar stats and HeroSection dashboard
- [x] 06-02-PLAN.md -- Currency toggle, checkout links, and WhatsApp BD payment on pricing page
- [x] 06-03-PLAN.md -- Validated contact form with success feedback on support page

### Phase 7: Blog, Docs, and Legal
**Goal**: The site has three new content sections -- a blog with MDX posts, documentation with structured guides, and legal pages (Privacy, Terms, Refund, License). These are essential for trust, SEO, and compliance.
**Depends on**: Phase 5
**Requirements**: BLOG-01, BLOG-02, BLOG-03, BLOG-04, DOCS-01, DOCS-02, LEGL-01, LEGL-02, LEGL-03, LEGL-04
**Success Criteria** (what must be TRUE):
  1. Blog listing page at /blog displays posts with title, date, excerpt, and reading time
  2. Individual blog posts render MDX content with code blocks, tables, and frontmatter metadata
  3. Documentation section at /docs displays guides organized by topic with table of contents
  4. Privacy Policy, Terms of Service, Refund Policy, and License Agreement pages each display full legal content
  5. Navigation includes links to blog and legal pages (footer or appropriate location)
**Plans**: 4 plans

Plans:
- [x] 07-01-PLAN.md -- Install MDX dependencies, configure Next.js, set up Typography, create content files
- [ ] 07-02-PLAN.md -- Blog listing page with card grid and individual post pages with MDX rendering
- [ ] 07-03-PLAN.md -- Documentation section with sidebar navigation, TOC, and individual doc pages
- [ ] 07-04-PLAN.md -- Legal pages (Privacy, Terms, Refund, License) and footer navigation link updates

### Phase 8: SEO Completion
**Goal**: The site is fully discoverable by search engines and has analytics tracking visitor behavior. Technical SEO is complete.
**Depends on**: Phase 7
**Requirements**: SEO-03, SEO-04, SEO-05
**Success Criteria** (what must be TRUE):
  1. sitemap.xml is accessible at /sitemap.xml and lists all public pages
  2. robots.txt is accessible at /robots.txt and allows search engine crawling
  3. Analytics script loads on all pages and tracks page views without cookies
  4. Google Search Console can verify the site via sitemap submission
**Plans**: TBD

### Phase 9: Internationalization
**Goal**: The site structure supports English and Bengali, with a language switcher in the navbar and translatable strings extracted to message files. Bengali-capable font is loaded.
**Depends on**: Phase 5
**Requirements**: I18N-01, I18N-02, I18N-03, I18N-04
**Success Criteria** (what must be TRUE):
  1. User can switch between English and Bengali via a language switcher in the navbar
  2. Bengali text renders correctly with a Bengali-capable fallback font (not tofu squares)
  3. All translatable strings (headings, descriptions, button labels, navigation) are extracted to en.json and bn.json message files
  4. URL structure reflects language (e.g., /en/features, /bn/features) via next-intl route segment
**Plans**: TBD
**UI hint**: yes

### Phase 10: Polish and Enhancements
**Goal**: The site has premium visual polish -- custom cursor on desktop, Syne 900 weight for headings, verified responsive design across all breakpoints, and enhanced animation effects. These are the finishing touches that elevate the site from functional to premium.
**Depends on**: Phase 6
**Requirements**: FOUND-03, FOUND-05, FOUND-08, FOUND-09
**Success Criteria** (what must be TRUE):
  1. Syne font renders weight 900 in headings without synthetic bold (font configuration updated in layout.tsx)
  2. Custom cursor effect (floating dot with blend mode) renders on desktop and is disabled on touch devices
  3. All pages are verified responsive at mobile (375px), tablet (768px), and desktop (1024px+) breakpoints
  4. Enhanced Framer Motion animations work smoothly: page transitions, stagger effects, scroll reveals without layout shift
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 5 -> 6 -> 7 -> 8 -> 9 -> 10
(Phase 7 and 9 both depend on Phase 5 and can proceed in parallel if desired, but sequential is recommended)
(Phase 10 depends on Phase 6 and can run alongside Phase 8 or 9)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-05-11 |
| 2. Homepage | 3/3 | Complete | 2026-05-11 |
| 3. Content Pages | 4/4 | Complete | 2026-05-11 |
| 4. Polish | 3/3 | Complete | 2026-05-11 |
| 5. Data Layer | 0/4 | Not started | - |
| 6. Interactive Features | 0/3 | Not started | - |
| 7. Blog, Docs, and Legal | 0/4 | Not started | - |
| 8. SEO Completion | 0/? | Not started | - |
| 9. Internationalization | 0/? | Not started | - |
| 10. Polish and Enhancements | 0/? | Not started | - |
