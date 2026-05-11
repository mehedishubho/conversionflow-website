# WooBooster Website

## What This Is

WooBooster is a marketing/landing page website for a live WooCommerce automation plugin built specifically for Bangladeshi eCommerce store owners. The site presents the plugin's six core modules — Courier Sync, Meta CAPI, Fraud Shield, Analytics, Lead Recovery, and Premium UI — through a polished, high-converting multi-page experience with dark/light themes, BD-specific branding, and functional lead capture forms. It ports a complete static HTML design reference (`woobooster-v2.html`, 1247 lines) into a production-ready Next.js 16 application with enhanced animations, bilingual support (English primary, Bengali secondary), and self-hosted deployment.

## Core Value

A premium, high-performance marketing website that converts Bangladeshi WooCommerce store owners into WooBooster customers through clear presentation of features, local payment trust signals (bKash/Nagad), and a design that blends SaaS polish with Bangladeshi identity.

## Requirements

### Validated

<!-- Inferred from existing codebase (brownfield). -->

- ✓ Root layout with 3 Google Fonts (Syne, DM Sans, JetBrains Mono) loaded via next/font — existing
- ✓ ThemeProvider wrapping app with next-themes (class strategy, light default) — existing
- ✓ Responsive Navbar with scroll detection, mobile drawer, theme toggle, and active route tracking — existing
- ✓ TailwindCSS v4 CSS-first config with custom design tokens (light/dark CSS variables) — existing
- ✓ Project initialized with Next.js 16, TypeScript strict mode, ESLint, pnpm — existing
- ✓ Framer Motion and Lucide React installed and integrated — existing
- ✓ Path alias `@/*` → `./src/*` configured — existing

### Active

<!-- Current scope. Building toward these. -->

**Core Pages (from HTML design)**
- [ ] Convert Home page: hero with dashboard mockup, trust bar, bento features grid, video section, BD couriers section, how-it-works steps, testimonials, CTA banner
- [ ] Convert Features page: page hero, video walkthrough, feature tabs, feature rows (Courier Sync, Meta CAPI, Fraud Shield)
- [ ] Convert Pricing page: 3 pricing tiers with USD/BDT currency toggle, FAQ accordion, trust strip
- [ ] Convert Changelog page: version history entries with tags (New/Improved/Fixed)
- [ ] Convert Support page: support cards (Email, WhatsApp, Docs), functional contact form

**Additional Pages**
- [ ] Build Blog section with MDX-based posts and listing page
- [ ] Build Documentation section with structured guides
- [ ] Build Legal pages: Privacy Policy, Terms of Service, Refund Policy, License Agreement — full legal content

**Functional Features**
- [ ] Implement functional contact form with email sending (server action)
- [ ] Wire pricing "Buy Now" buttons to external checkout + WhatsApp for BD payment methods
- [ ] Implement USD/BDT currency toggle on pricing page

**Design & Animation**
- [ ] Implement enhanced Framer Motion animations: page transitions, scroll reveals, stagger effects, word-by-word hero reveal, magnetic tilt cards, count-up animations
- [ ] Implement custom cursor effect (floating dot following mouse with blend mode)
- [ ] Build BD-specific branding elements: bKash/Nagad payment badges, BD flag, courier live status chips, BDT pricing
- [ ] Create reusable component library: Bento cards, feature rows, pricing cards, testimonials, FAQ accordion, video player with lightbox, trust bar, step cards, support cards
- [ ] Implement shared Footer component with 4-column grid and BD developer attribution
- [ ] Ensure fully responsive design (equal priority desktop/mobile)

**Infrastructure**
- [ ] Extract all content (changelog, testimonials, pricing tiers, features, FAQs, support info) into TypeScript data files
- [ ] Set up i18n infrastructure for English primary + Bengali translation support
- [ ] Implement SEO: metadata API per page, Open Graph tags, Twitter cards, sitemap.xml, robots.txt
- [ ] Add site analytics tracking
- [ ] Create proxy.ts for server-side routing needs
- [ ] Fix existing build-breaking issues: missing Footer component, missing cn() utility, undefined CSS button classes
- [ ] Optimize for Lighthouse 90+ (Next Image, font optimization, code splitting, lazy loading)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- WordPress plugin development — this is the marketing website, not the plugin itself
- User authentication or accounts on the marketing site — not needed for a landing page
- CMS integration — content managed via data files and MDX in the repository (simpler for small team)
- Payment processing on-site — checkout handled externally (WooCommerce/EasyCart + WhatsApp)
- Real-time courier data on the marketing site — dashboard mockups are illustrative only
- Mobile app — web-only marketing site
- A/B testing infrastructure — can be added later if needed
- Newsletter/email marketing integration — deferred to future milestone

## Context

- **Product state**: WooBooster plugin is live and serving 500+ active WooCommerce stores in Bangladesh
- **Design reference**: Complete static HTML design in `woobooster-v2.html` (1247 lines) — includes all 5 pages, CSS tokens, animations, and JavaScript interactions. This is the visual source of truth
- **Company**: Built by Devsroom/WPMHS team based in Dhaka, Bangladesh (contact: mhs@wpmhs.com, WhatsApp: +880 1721-328992)
- **Target audience**: Bangladeshi WooCommerce store owners who manually manage courier tracking, lack fraud protection, or have poor Meta ad tracking due to iOS 14+ issues
- **Competitive landscape**: No other WooCommerce plugin offers integrated BD courier sync + Meta CAPI + fraud protection in one package
- **Pricing**: Starter $29/৳3,499, Professional $69/৳8,299 (most popular), Agency $129/৳15,499 — all one-time payments
- **Existing codebase**: Early-stage Next.js 16 project with 4 source files. Has build-breaking issues (missing Footer, missing cn() utility). TailwindCSS v4 CSS-first configuration already established with design tokens
- **Design approach**: Faithful to HTML but polished — improve rough edges, enhance animations beyond the prototype, maintain visual identity
- **Design feel**: Premium SaaS quality with Bangladeshi local personality — not generic, not purely Western

## Constraints

- **Package Manager**: pnpm only — never npm, yarn, or bun
- **Framework**: Next.js 16 with App Router, TypeScript strict mode, TailwindCSS v4, ESLint
- **Proxy**: Use `proxy.ts` instead of `middleware.ts` per project rules
- **Components**: Server components by default; client components only when needed (useState, useEffect, browser APIs)
- **Styling**: TailwindCSS v4 CSS-first config — no tailwind.config.js file, tokens via `@theme { }` block in globals.css
- **Design Fidelity**: Faithful to the HTML design but polished — improve rough edges, don't pixel-perfect copy
- **Animation**: Enhanced beyond the HTML — page transitions, stagger effects, 3D elements where appropriate, but avoid over-animation
- **Deployment**: Self-hosted (not Vercel) — must work on custom server/VPS
- **Design feel**: Premium SaaS quality with Bangladeshi local personality

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Faithful but polished design approach | HTML is a prototype, not production — polish rough edges while maintaining visual identity | — Pending |
| Enhanced animations beyond HTML | Premium feel differentiates from competitors; page transitions and stagger effects add perceived quality | — Pending |
| Data files for content (not CMS) | Small team, developer-managed content, version-controlled — simpler than headless CMS for a marketing site | — Pending |
| MDX for blog posts | Developer-friendly authoring, supports React components in posts, version-controlled | — Pending |
| i18n infrastructure from start | English primary but Bengali market is core audience — easier to build in now than retrofit later | — Pending |
| Self-hosted deployment | Team manages own infrastructure — no Vercel dependency | — Pending |
| USD/BDT currency toggle | BD customers prefer Taka pricing; international visitors need USD — both audiences served | — Pending |
| Dual checkout paths | External payment for card users, WhatsApp for bKash/Nagad — matches how BD customers actually pay | — Pending |
| Server actions for forms | Next.js 16 native approach for form handling, no API routes needed | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-11 after initialization*
