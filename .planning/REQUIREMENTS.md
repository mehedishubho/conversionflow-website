# Requirements: WooBooster Website

**Defined:** 2026-05-11
**Core Value:** A premium, high-performance marketing website that converts Bangladeshi WooCommerce store owners into WooBooster customers through clear presentation of features, local payment trust signals (bKash/Nagad), and a design that blends SaaS polish with Bangladeshi identity.

## v1 Requirements

### Foundation

- [ ] **FOUND-01**: Build compiles without errors — Footer component, cn() utility, and CSS button classes created
- [ ] **FOUND-02**: TailwindCSS v4 design token system is complete and consistent — all CSS variables registered in @theme block
- [ ] **FOUND-03**: Syne font loads weight 900 (used throughout headings) — fix font configuration in layout.tsx
- [ ] **FOUND-04**: Dark/light theme switches without flash — suppressHydrationWarning and next-themes configured correctly
- [ ] **FOUND-05**: All pages are fully responsive — mobile, tablet, and desktop layouts work correctly
- [ ] **FOUND-06**: Custom 404 page matches site design
- [ ] **FOUND-07**: Self-hosted deployment configured — output: 'standalone' in next.config.ts
- [ ] **FOUND-08**: Custom cursor effect renders on desktop — floating dot following mouse with blend mode, disabled on touch devices
- [ ] **FOUND-09**: Enhanced Framer Motion animations — page transitions, stagger effects, scroll reveals work smoothly without layout shift
- [ ] **FOUND-10**: Shared layout components work — Navbar, Footer, ThemeProvider render on all pages

### Homepage

- [ ] **HOME-01**: Hero section displays with dashboard mockup, word-by-word title animation, CTAs, and trust pills
- [ ] **HOME-02**: Trust bar shows key stats (500+ stores, 3 couriers, 6 platforms, 100% CAPI, BDT pricing)
- [ ] **HOME-03**: Bento features grid displays 6 modules with icons, descriptions, and tags — 2-column card spans correctly
- [ ] **HOME-04**: Video section shows mock player with pulsing play button and opens lightbox on click
- [ ] **HOME-05**: BD couriers section displays Steadfast, Pathao, RedX cards with live status chips and order flow diagram
- [ ] **HOME-06**: How It Works section shows 3 step cards with numbered badges
- [ ] **HOME-07**: Testimonials grid displays 3 review cards with star ratings, quotes, and author info
- [ ] **HOME-08**: CTA banner displays with BD tag, headline, and pricing link
- [ ] **HOME-09**: Dashboard mockup component renders with revenue/orders/blocked stats, chart bars, and order list
- [ ] **HOME-10**: Count-up animations trigger on scroll for trust bar stats and dashboard numbers

### Features Page

- [ ] **FEAT-01**: Page hero with eyebrow, title, and subtitle matching design reference
- [ ] **FEAT-02**: Video walkthrough section with mock player and lightbox
- [ ] **FEAT-03**: Feature filter tabs (All Modules, Courier Sync, Tracking, Fraud Shield, Analytics, Lead Recovery)
- [ ] **FEAT-04**: Feature rows display module details with alternating layout — Courier Sync, Meta CAPI, Fraud Shield
- [ ] **FEAT-05**: Tracking panel component shows active status for Meta Pixel, GA4, TikTok, Pinterest, GTM
- [ ] **FEAT-06**: Fraud box component displays order table with block buttons and fraud stats
- [ ] **FEAT-07**: Courier cards component reusable across Features and Homepage

### Pricing Page

- [ ] **PRIC-01**: Three pricing tiers display (Starter $29, Professional $69, Agency $129) with feature checklists
- [ ] **PRIC-02**: USD/BDT currency toggle switches all prices between dollar and taka
- [ ] **PRIC-03**: "Most Popular" badge on Professional tier with accent border glow
- [ ] **PRIC-04**: FAQ accordion expands/collapses with rotate animation on icon
- [ ] **PRIC-05**: Trust strip displays secure checkout, payment methods, refund, delivery, and BD support
- [ ] **PRIC-06**: "Buy Now" buttons link to external checkout; "WhatsApp" option shown for BD payment methods

### Changelog Page

- [ ] **CHLOG-01**: Version entries display with version badge, date, release name, and tagged changes
- [ ] **CHLOG-02**: Change tags differentiate New, Improved, and Fixed entries with color coding
- [ ] **CHLOG-03**: Changelog data sourced from TypeScript data file, not hardcoded in component

### Support Page

- [ ] **SUPP-01**: Three support cards display (Email, WhatsApp BD, Documentation) with icons and action buttons
- [ ] **SUPP-02**: Contact form collects name, email, license key, subject, and message
- [ ] **SUPP-03**: Contact form sends email via server action using Resend
- [ ] **SUPP-04**: Form validation provides inline error messages for required fields
- [ ] **SUPP-05**: Success/error feedback displayed after form submission

### Content Data Layer

- [ ] **DATA-01**: All pricing tiers extracted to src/data/pricing.ts
- [ ] **DATA-02**: All changelog entries extracted to src/data/changelog.ts
- [ ] **DATA-03**: All testimonials extracted to src/data/testimonials.ts
- [ ] **DATA-04**: All feature/module data extracted to src/data/features.ts
- [ ] **DATA-05**: FAQ items extracted to src/data/faq.ts
- [ ] **DATA-06**: Support info extracted to src/data/support.ts
- [ ] **DATA-07**: Navigation links extracted to src/data/navigation.ts

### Blog

- [x] **BLOG-01**: Blog listing page displays posts with title, date, excerpt, and reading time
- [x] **BLOG-02**: Individual blog posts render from MDX files with frontmatter (title, date, excerpt, author)
- [x] **BLOG-03**: MDX supports GitHub-flavored markdown (tables, code blocks, etc.)
- [x] **BLOG-04**: Blog content lives in src/content/blog/*.mdx

### Documentation

- [x] **DOCS-01**: Documentation section displays guides organized by topic
- [x] **DOCS-02**: Individual doc pages render from MDX with table of contents

### Legal Pages

- [x] **LEGL-01**: Privacy Policy page with full legal content
- [x] **LEGL-02**: Terms of Service page with full legal content
- [x] **LEGL-03**: Refund Policy page with full legal content
- [x] **LEGL-04**: License Agreement page with full legal content

### SEO & Analytics

- [ ] **SEO-01**: Each page has unique metadata (title, description) via Next.js Metadata API
- [ ] **SEO-02**: Open Graph and Twitter Card tags configured for social sharing
- [ ] **SEO-03**: sitemap.xml generated at build time
- [ ] **SEO-04**: robots.txt configured
- [ ] **SEO-05**: Analytics script loaded (Plausible or equivalent)

### Internationalization

- [ ] **I18N-01**: Site structure supports English (en) and Bengali (bn) via next-intl
- [ ] **I18N-02**: Bengali-capable font loaded (Noto Sans Bengali or equivalent) as fallback
- [ ] **I18N-03**: Language switcher available in Navbar
- [ ] **I18N-04**: Translatable strings extracted to message files (en.json, bn.json)

## v2 Requirements

### Performance

- **PERF-01**: Lighthouse score 90+ on mobile and desktop
- **PERF-02**: Image optimization via Next Image with sharp for self-hosted
- **PERF-03**: Code splitting and lazy loading for heavy components

### Advanced Features

- **ADV-01**: A/B testing infrastructure for CTAs and pricing
- **ADV-02**: Newsletter/email marketing integration
- **ADV-03**: Real-time order counter on homepage (webhook from plugin)

## Out of Scope

| Feature | Reason |
|---------|--------|
| WordPress plugin development | This is the marketing website, not the plugin itself |
| User authentication/login | Public marketing site — no user accounts needed |
| On-site payment processing | Checkout handled externally (WooCommerce/EasyCart + WhatsApp) |
| Real-time courier data | Dashboard mockups are illustrative only |
| CMS integration | Content in data files and MDX — simpler for small team |
| Mobile app | Web-only marketing site |
| Admin dashboard | Not a SaaS application |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 10 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 10 | Complete |
| FOUND-06 | Phase 4 | Complete |
| FOUND-07 | Phase 5 | Not started |
| FOUND-08 | Phase 10 | Complete |
| FOUND-09 | Phase 10 | Complete |
| FOUND-10 | Phase 1 | Complete |
| HOME-01 | Phase 2 | Complete |
| HOME-02 | Phase 2 | Complete |
| HOME-03 | Phase 2 | Complete |
| HOME-04 | Phase 2 | Complete |
| HOME-05 | Phase 2 | Complete |
| HOME-06 | Phase 2 | Complete |
| HOME-07 | Phase 2 | Complete |
| HOME-08 | Phase 2 | Complete |
| HOME-09 | Phase 2 | Complete |
| HOME-10 | Phase 6 | Not started |
| FEAT-01 | Phase 3 | Complete |
| FEAT-02 | Phase 3 | Complete |
| FEAT-03 | Phase 3 | Complete |
| FEAT-04 | Phase 3 | Complete |
| FEAT-05 | Phase 3 | Complete |
| FEAT-06 | Phase 3 | Complete |
| FEAT-07 | Phase 3 | Complete |
| PRIC-01 | Phase 3 | Complete |
| PRIC-02 | Phase 6 | Not started |
| PRIC-03 | Phase 3 | Complete |
| PRIC-04 | Phase 3 | Complete |
| PRIC-05 | Phase 3 | Complete |
| PRIC-06 | Phase 6 | Not started |
| CHLOG-01 | Phase 3 | Complete |
| CHLOG-02 | Phase 3 | Complete |
| CHLOG-03 | Phase 5 | Not started |
| SUPP-01 | Phase 3 | Complete |
| SUPP-02 | Phase 3 | Complete |
| SUPP-03 | Phase 6 | Not started |
| SUPP-04 | Phase 6 | Not started |
| SUPP-05 | Phase 6 | Not started |
| DATA-01 | Phase 5 | Not started |
| DATA-02 | Phase 5 | Not started |
| DATA-03 | Phase 5 | Not started |
| DATA-04 | Phase 5 | Not started |
| DATA-05 | Phase 5 | Not started |
| DATA-06 | Phase 5 | Not started |
| DATA-07 | Phase 5 | Not started |
| BLOG-01 | Phase 7 | Not started |
| BLOG-02 | Phase 7 | Not started |
| BLOG-03 | Phase 7 | Not started |
| BLOG-04 | Phase 7 | Not started |
| DOCS-01 | Phase 7 | Not started |
| DOCS-02 | Phase 7 | Not started |
| LEGL-01 | Phase 7 | Not started |
| LEGL-02 | Phase 7 | Not started |
| LEGL-03 | Phase 7 | Not started |
| LEGL-04 | Phase 7 | Not started |
| SEO-01 | Phase 4 | Complete |
| SEO-02 | Phase 4 | Complete |
| SEO-03 | Phase 8 | Not started |
| SEO-04 | Phase 8 | Not started |
| SEO-05 | Phase 8 | Not started |
| I18N-01 | Phase 9 | Complete |
| I18N-02 | Phase 9 | Complete |
| I18N-03 | Phase 9 | Complete |
| I18N-04 | Phase 9 | Complete |

**Coverage:**
- v1 requirements: 57 total
- Mapped to phases: 57
- Complete (Phases 1-4): 25
- Remaining (Phases 5-10): 32
- Unmapped: 0

---
*Requirements defined: 2026-05-11*
*Last updated: 2026-05-11 after roadmap revision (Phases 5-10)*
