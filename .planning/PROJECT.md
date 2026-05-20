# ConversionFlow Platform

## What This Is

ConversionFlow is a dual-portal SaaS platform for Devsroom. The public marketing site (already built in v1.x) presents the ConversionFlow plugin to Bangladeshi WooCommerce store owners. The v2.0 platform adds a **Customer Portal** for license management, billing, downloads, and support — plus an **Admin BI Dashboard** for revenue intelligence, sales analytics, license intelligence, and operational management. All licensing is handled by the central authority at `license.devsroom.com`.

## Core Value

A production-grade SaaS platform where Bangladeshi WooCommerce store owners purchase ConversionFlow licenses, manage billing and downloads, get support — while Devsroom operators gain real-time business intelligence, revenue analytics, and license intelligence across all products.

## Current Milestone: v2.1 Marketing & SEO Settings Dashboard

**Goal:** Build a complete SEO & Marketing settings module in the admin dashboard with sub-page navigation, restructuring the flat settings page into a premium, enterprise-grade configuration system covering technical SEO, social metadata, tracking pixels, schema markup, AI crawler controls, redirect management, image/performance SEO, and analytics.

**Target features:**
- Settings sub-page navigation system (Payment Gateway / SMTP / SEO Settings)
- General SEO configuration (title, meta, canonical, URL formatting, auto-generation)
- Search Engine Verification (Google, Bing, Yandex, Baidu, Pinterest)
- XML Sitemap management with content type controls
- Robots.txt visual + raw editor with AI bot controls
- Open Graph & Social SEO (Facebook, Twitter/X, LinkedIn)
- Meta Pixel & Conversion API with event tracking
- TikTok Pixel tracking
- Google Analytics 4 & Google Ads integration
- Schema Markup system (Organization, Product, Article, FAQ, HowTo, Review)
- Redirect Manager (301/302/regex, bulk import/export)
- AI SEO & LLM crawler controls (GPTBot, ClaudeBot, PerplexityBot)
- Image SEO (auto ALT, WebP, lazy loading, compression)
- Performance SEO (CSS/JS optimization, CDN, Core Web Vitals)
- SEO Analytics dashboard (indexed pages, keywords, 404s, crawl issues)

## Requirements

### Validated

<!-- v1.0 + v1.1 shipped work. -->

- Root layout with 3 Google Fonts (Syne, DM Sans, JetBrains Mono) — shipped v1.0
- ThemeProvider with next-themes (class strategy, light default) — shipped v1.0
- Responsive Navbar with scroll detection, mobile drawer, theme toggle — shipped v1.0
- TailwindCSS v4 CSS-first config with custom design tokens — shipped v1.0
- All 5 core pages (Home, Features, Pricing, Changelog, Support) — shipped v1.0
- Framer Motion animations, custom cursor, ScrollReveal — shipped v1.0/v1.1
- Footer with 4-column grid — shipped v1.0
- Data layer: all content in TS data files — shipped v1.1
- Blog with MDX, Documentation section, 4 Legal pages — shipped v1.1
- SEO: metadata, sitemap, robots, Plausible analytics — shipped v1.1
- i18n: Bengali via next-intl, language switcher — shipped v1.1
- Interactive: currency toggle, contact form, count-up animations — shipped v1.1
- Responsive design verified at all breakpoints — shipped v1.1

### Active

<!-- v2.1 scope. Building toward these. -->

**Settings Navigation Restructure**
- [ ] Sub-page navigation system for Settings (Payment / SMTP / SEO)
- [ ] Migrate existing Payment, Email, Tracking forms to sub-routes
- [ ] Settings landing page with category cards

**General SEO**
- [ ] Website title, meta title, meta description, keywords, canonical URL
- [ ] Default robots meta, SEO separator, OG image, favicon upload
- [ ] URL formatting controls (lowercase, trailing slash)
- [ ] Auto meta generation toggle
- [ ] Real-time SERP preview snippet with character counts

**Search Engine Verification**
- [ ] Google Search Console, Bing, Yandex, Baidu, Pinterest verification fields
- [ ] Verification status indicators

**Sitemaps & Robots.txt**
- [ ] XML sitemap enable/configure with content type inclusion
- [ ] Robots.txt visual + raw editor with AI bot controls

**Social & Open Graph**
- [ ] Facebook, Twitter/X, LinkedIn social sharing defaults
- [ ] Social share preview simulator (mobile + desktop)

**Tracking Pixels**
- [ ] Meta Pixel & Conversion API with event tracking
- [ ] TikTok Pixel tracking
- [ ] Google Analytics 4 & Google Ads integration

**Schema Markup**
- [ ] Global schema (Organization, Website, Breadcrumb)
- [ ] Content schema (Product, Article, FAQ, HowTo, Review)
- [ ] JSON-LD preview and validation

**Redirect Manager**
- [ ] 301/302/regex redirects with table UI
- [ ] Bulk import/export, hit counter, search/filter

**AI SEO & Performance**
- [ ] AI crawler allow/block controls (GPTBot, ClaudeBot, PerplexityBot)
- [ ] Image SEO (auto ALT, WebP, lazy loading, compression stats)
- [ ] Performance SEO (Critical CSS, JS defer, minify, CDN, cache)
- [ ] Core Web Vitals monitor cards

**SEO Analytics**
- [ ] Indexed pages, keyword rankings, CTR, impressions
- [ ] 404 errors, broken links, sitemap health, crawl issues
- [ ] Charts, tables, status badges, trend indicators

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- WordPress plugin development — this is the SaaS platform, not the plugin itself
- Central licensing engine — owned by license.devsroom.com, only integrated here
- CMS integration — content managed via data files and MDX in the repository
- Mobile app — web-only platform
- Redesigning existing marketing pages — all v1.x pages preserved as-is
- Redesigning dashboard UI — use backenddashboard/ folder design as-is

## Context

- **Product state**: ConversionFlow plugin is live and serving 500+ active WooCommerce stores in Bangladesh
- **Design reference**: Marketing site design from `woobooster-v2.html`. Dashboard design from `backenddashboard/` folder (Next.js admin template with ecommerce metrics, charts, sidebar layout, auth pages)
- **Company**: Built by Devsroom/WPMHS team based in Dhaka, Bangladesh (contact: mhs@wpmhs.com, WhatsApp: +880 1721-328992)
- **Target audience**: Bangladeshi WooCommerce store owners (customers) + Devsroom operators (admins)
- **Central licensing**: license.devsroom.com — all license generation, activation, validation happens there. This app only syncs and caches.
- **Products**: ConversionFlow WP Plugin, ConversionFlow Laravel Module
- **Existing codebase**: v1.x marketing site with 10 phases complete — Next.js 16, TypeScript, TailwindCSS v4, Framer Motion, next-intl, MDX blog/docs
- **Pricing**: Starter $29/3,499BDT, Professional $69/8,299BDT (most popular), Agency $129/15,499BDT — all one-time payments
- **Design feel**: Premium SaaS quality with Bangladeshi local personality

## Constraints

- **Package Manager**: pnpm only — never npm, yarn, or bun
- **Framework**: Next.js 16 with App Router, TypeScript strict mode, TailwindCSS v4, ESLint
- **Proxy**: Use `proxy.ts` instead of `middleware.ts` per project rules
- **Components**: Server components by default; client components only when needed
- **Styling**: TailwindCSS v4 CSS-first config — no tailwind.config.js file
- **Design Fidelity**: Dashboard UI ported from `backenddashboard/` folder — no redesign
- **Preservation**: All existing marketing pages preserved as-is
- **Deployment**: Self-hosted (not Vercel) — must work on custom server/VPS
- **Licensing Rule**: NEVER generate licenses locally — always use central API

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Faithful but polished marketing design | HTML is a prototype, not production | Shipped v1.0 |
| Data files for content (not CMS) | Small team, developer-managed | Shipped v1.1 |
| MDX for blog/docs | Developer-friendly, supports React components | Shipped v1.1 |
| Better Auth for dual auth | Supports multi-role, session management, social login, 2FA | Pending |
| PostgreSQL + Drizzle ORM | Type-safe ORM, migrations, good Next.js ecosystem | Pending |
| Central licensing only (never local) | Single source of truth, prevents license drift | Pending |
| Redis for caching/queues | Fast in-memory store for sessions, rate limiting, background jobs | Pending |
| Dashboard design from backenddashboard/ | Saves design time, proven admin template | Pending |
| BD payment methods (bKash/Nagad/Rocket/SSL) | Matches how BD customers actually pay | Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-20 — Milestone v2.1 Marketing & SEO Settings started*
