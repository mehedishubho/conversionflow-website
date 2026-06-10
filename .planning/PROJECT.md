# ConversionFlow Platform

## What This Is

ConversionFlow is a self-contained SaaS platform for Devsroom. The public marketing site (already built in v1.x) presents the ConversionFlow plugin to Bangladeshi WooCommerce store owners. v2.0 added a **Customer Portal** and **Admin BI Dashboard**. v3.0 refactored the platform into a completely self-contained licensing system with modular monolith architecture. v4.0 transforms ConversionFlow into a **multi-platform license server** — serving WordPress, Laravel, Shopify, and Next.js clients with platform SDKs, update delivery, multi-gateway payments, feature flags per tier, and API security.

## Core Value

A production-grade, self-contained licensing platform where Bangladeshi WooCommerce store owners purchase ConversionFlow licenses, manage billing and downloads, get support — while Devsroom operators gain real-time business intelligence, revenue analytics, and complete control over the licensing lifecycle. All licensing operations are managed directly within ConversionFlow.

## Current Milestone: v4.0 Multi-Platform License Server & SDK Distribution

**Goal:** Transform ConversionFlow into a multi-platform license server serving WordPress, Laravel, Shopify, and Next.js clients. Build platform-specific SDKs, complete the update delivery system, add automatic payment gateways (Stripe, Paddle, bKash API), enforce feature flags per tier, and harden API security with HMAC signing.

**v3.0 (shipped):**
- **Product Management** — Create Products, Manage Product Versions, Manage Product Plans, Configure Licensing Rules ✅
- **Customer Management** — Store Customer Information, Manage Customer Purchases, Track Customer Activity ✅
- **License Management** — Generate, Validate, Activate, Deactivate, Suspend, Revoke, Extend Licenses ✅
- **Activation Management** — Track Domains, Track Installations, Track Device Activations, Enforce Activation Limits ✅
- **Subscription Management** — Manage Renewals, Track Expiration Dates, Handle Subscription Statuses, Manage Lifetime Licenses ✅
- **Analytics & Reporting** — License Analytics, Revenue Analytics, Product Performance, Customer Growth, Activation Statistics ✅
- **Technical Architecture** — Modular Monolith, DDD, Service Layer Pattern, Repository Pattern, Event-Driven Internal Actions, Background Jobs, API-First Design ✅
- **Removal** — No dependency on `license.devsroom.com`, no `centralOrderId`, `centralLicenseId`, `centralUserId` fields ✅

**v4.0 target features:**
- **Update Delivery** — Plugin update check, authenticated download, version management
- **Feature Flags** — Per-plan feature definitions, platform-specific feature sets, tier enforcement in API
- **Multi-Gateway Payments** — Dual system: Manual (bKash/Nagad/Rocket/Bank) + Real automatic (SSL Commerz/Stripe/Paddle/bKash API)
- **WordPress SDK** — PHP client library for license management and auto-updates inside WP plugin
- **Laravel SDK** — Composer package with ServiceProvider, Facade, middleware, Artisan commands
- **Shopify Integration** — Shopify Billing API sync, App Bridge auth, webhook handlers
- **Next.js SDK** — npm package (@conversionflow/license-sdk) with useLicense hook, proxy.ts (middleware) helpers, compatible with npm and pnpm
- **API Security** — HMAC request signing, API key auth, rate limiting per platform

**Key Architecture Decision:** ConversionFlow IS the license server. No 3rd party website handles licensing. All operations run from this Next.js application. Dual payment system: Manual (non-automatic, admin-verified) + Real (automatic gateway processing).

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

<!-- v2.0 + v2.1 shipped work. -->

- Authentication System (Better Auth, dual auth, 4 roles) — shipped v2.0
- Database Layer (PostgreSQL + Drizzle ORM + Redis) — shipped v2.0
- Customer Portal (licenses, billing, downloads, support) — shipped v2.0
- Admin BI Dashboard (revenue, sales, analytics, exports) — shipped v2.0
- Checkout System (bKash, Nagad, Rocket, SSL Commerce, coupons) — shipped v2.0
- Webhooks, Background Jobs, License Intelligence — shipped v2.0
- Settings Foundation (sub-page navigation) — shipped v2.1
- Core SEO Configuration — shipped v2.1
- Tracking Pixels & Social SEO — shipped v2.1
- Advanced SEO Controls — shipped v2.1
- SEO Analytics Dashboard — shipped v2.1

<!-- v3.0 shipped work. -->

- Modular Monolith with DDD (bounded contexts, event bus, repositories) — shipped v3.0
- Product Management (products, versions, plans, licensing rules) — shipped v3.0
- Local License Generation (CF-XXXX format, crypto.randomBytes) — shipped v3.0
- License Validation API (/api/v1/license/validate with Redis caching) — shipped v3.0
- License Activation/Deactivation with domain verification — shipped v3.0
- License State Machine (active, expired, revoked, suspended, grace_period) — shipped v3.0
- Subscription Lifecycle (expiry tracking, grace periods, renewal emails) — shipped v3.0
- License Transfer System (transfer codes, audit trail) — shipped v3.0
- License Analytics Dashboard (KPIs, trend charts, geo breakdown) — shipped v3.0
- Billing Integration (OrderCompleted event triggers license generation) — shipped v3.0
- External API Removal (central-api.ts deleted, no license.devsroom.com dependency) — shipped v3.0
- Backup & Restore System (pg_dump, BullMQ scheduling, rotation) — shipped v3.0

### Active

<!-- v4.0 scope. Building toward these. -->

**Update Delivery**
- [ ] /api/v1/update/check endpoint (WordPress-compatible format)
- [ ] /api/v1/update/download endpoint (authenticated ZIP download)
- [ ] /api/v1/license/status endpoint (full license info + activations)
- [ ] ZIP file storage and version management

**Feature Flags & Tier Enforcement**
- [ ] Feature flag definitions per plan (JSONB or dedicated table)
- [ ] Validate endpoint returns allowed features list
- [ ] Admin UI for managing features per plan per product
- [ ] Platform-specific feature sets (WP vs Laravel vs Shopify vs Next.js)
- [ ] Feature gating in customer portal

**Multi-Gateway Payment System**
- [ ] Dual-system payment model: Manual + Real
- [ ] Gateway abstraction layer (common interface)
- [ ] Stripe integration (Checkout Sessions, Webhooks, Subscriptions)
- [ ] Paddle integration (Checkout, Webhooks, Merchant of Record)
- [ ] bKash Automatic API gateway
- [ ] Admin UI for managing multiple gateways

**WordPress SDK**
- [ ] PHP client library (conversionflow-sdk-php)
- [ ] License activation/deactivation/validation methods
- [ ] Auto-update integration (WP plugin update hooks)
- [ ] Admin settings page helper
- [ ] Domain activation helpers
- [ ] Composer package

**Laravel SDK**
- [ ] Laravel package (conversionflow/laravel)
- [ ] ServiceProvider + Facade with auto-discovery
- [ ] License validation middleware
- [ ] Artisan commands (activate, deactivate, check)
- [ ] Config publishing

**Shopify Integration**
- [ ] Shopify app scaffold with App Bridge
- [ ] Shopify Billing API to ConversionFlow license sync
- [ ] Webhook handlers for install/uninstall/billing
- [ ] Installation flow with automatic license creation

**Next.js SDK & API Security**
- [ ] npm package (@conversionflow/license-sdk)
- [ ] useLicense() hook and middleware helpers
- [ ] HMAC request signing for all /api/v1/* endpoints
- [ ] Standardized API key authentication
- [ ] Rate limiting per platform

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- WordPress plugin development — this is the SaaS platform, not the plugin itself (but we build the SDK the plugin uses)
- External licensing engines — all licensing managed internally, ConversionFlow IS the license server
- CMS integration — content managed via data files and MDX in the repository
- Mobile app — web-only platform
- Redesigning existing marketing pages — all v1.x pages preserved as-is
- Redesigning dashboard UI — use backenddashboard/ folder design as-is
- Multi-tenant support — single-instance platform for Devsroom only
- Building the actual WordPress/Laravel/Shopify/Next.js products — we build the license server and SDKs only

## Context

- **Product state**: ConversionFlow v3.0 complete — self-contained licensing platform serving WordPress stores in Bangladesh. v4.0 will extend to multi-platform.
- **License server**: ConversionFlow IS the license server — no 3rd party (no license.devsroom.com). All licensing runs from this application.
- **Payment model**: Dual system — Manual (bKash/Nagad/Rocket/Bank, admin-verified) + Real automatic gateways (SSL Commerz/Stripe/Paddle/bKash API)
- **Platform SDKs**: WordPress (PHP), Laravel (PHP Composer), Shopify (JS), Next.js (npm) — all call /api/v1/license/*
- **Design reference**: Marketing site design from `woobooster-v2.html`. Dashboard design from `backenddashboard/` folder
- **Company**: Built by Devsroom/WPMHS team based in Dhaka, Bangladesh (contact: mhs@wpmhs.com, WhatsApp: +880 1721-328992)
- **Target audience**: Bangladeshi WooCommerce store owners (current) + International store owners (v4.0 via Stripe/Paddle)
- **Products**: ConversionFlow WP Plugin (live), ConversionFlow Laravel Module (planned), ConversionFlow Shopify App (planned), ConversionFlow Next.js SDK (planned)
- **Existing codebase**: v3.0 complete — Next.js 16, TypeScript, TailwindCSS v4, Drizzle ORM, Better Auth, BullMQ, DDD licensing modules
- **Pricing**: Starter $29/3,499BDT, Professional $69/8,299BDT (most popular), Agency $129/15,499BDT — all one-time payments
- **Design feel**: Premium SaaS quality with Bangladeshi local personality
- **Milestone context**: `.planning/phases/32-v4-milestone/v4-MILESTONE-CONTEXT.md`

## Constraints

- **Package Manager**: pnpm only — never npm, yarn, or bun
- **Framework**: Next.js 16 with App Router, TypeScript strict mode, TailwindCSS v4, ESLint
- **Proxy**: Use `proxy.ts` instead of `middleware.ts` per project rules
- **Components**: Server components by default; client components only when needed
- **Styling**: TailwindCSS v4 CSS-first config — no tailwind.config.js file
- **Design Fidelity**: Dashboard UI ported from `backenddashboard/` folder — no redesign
- **Preservation**: All existing marketing pages and v2.x/v3.0 functionality preserved as-is
- **Deployment**: Self-hosted (not Vercel) — must work on custom server/VPS
- **Architecture**: Modular Monolith with Service Layer, Repository Pattern, DDD (established in v3.0)
- **License server**: ConversionFlow is the license server — no external licensing dependencies ever
- **Payment gateways**: Extensible dual-system (Manual + Real) — new gateways added via admin settings

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Faithful but polished marketing design | HTML is a prototype, not production | Shipped v1.0 |
| Data files for content (not CMS) | Small team, developer-managed | Shipped v1.1 |
| MDX for blog/docs | Developer-friendly, supports React components | Shipped v1.1 |
| Better Auth for dual auth | Supports multi-role, session management, social login, 2FA | Shipped v2.0 |
| PostgreSQL + Drizzle ORM | Type-safe ORM, migrations, good Next.js ecosystem | Shipped v2.0 |
| Redis for caching/queues | Fast in-memory store for sessions, rate limiting, background jobs | Shipped v2.0 |
| Dashboard design from backenddashboard/ | Saves design time, proven admin template | Shipped v2.0 |
| BD payment methods (bKash/Nagad/Rocket/SSL) | Matches how BD customers actually pay | Shipped v2.0 |
| Self-contained licensing (v3.0) | Complete control, no external dependencies, future-proof | Shipped v3.0 |
| Modular Monolith + DDD | Scalable architecture, clear domain boundaries | Shipped v3.0 |
| Service Layer Pattern | Business logic abstraction, testability | Shipped v3.0 |
| Repository Pattern | Data access abstraction, easier testing | Shipped v3.0 |
| ConversionFlow IS the license server | No 3rd party handles licensing — full control | Decided v4.0 |
| Dual payment system (Manual + Real) | BD market needs manual, international needs automatic | Decided v4.0 |
| Paddle as MoR for international | Handles tax/compliance for non-BD customers | Planned v4.0 |
| HMAC request signing for SDKs | Security for client-side SDK API calls | Planned v4.0 |
| Platform-specific SDKs | Each platform gets a native SDK calling the same API | Planned v4.0 |

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
*Last updated: 2026-06-11
