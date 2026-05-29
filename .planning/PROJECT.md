# ConversionFlow Platform

## What This Is

ConversionFlow is a self-contained SaaS platform for Devsroom. The public marketing site (already built in v1.x) presents the ConversionFlow plugin to Bangladeshi WooCommerce store owners. v2.0 added a **Customer Portal** and **Admin BI Dashboard**. v3.0 refactors the platform into a completely self-contained licensing system with modular monolith architecture — managing all products, customers, licenses, subscriptions, activations, and analytics internally without external dependencies.

## Core Value

A production-grade, self-contained licensing platform where Bangladeshi WooCommerce store owners purchase ConversionFlow licenses, manage billing and downloads, get support — while Devsroom operators gain real-time business intelligence, revenue analytics, and complete control over the licensing lifecycle. All licensing operations are managed directly within ConversionFlow.

## Current Milestone: v3.0 Self-Contained Licensing Architecture

**Goal:** Refactor ConversionFlow into a completely self-contained licensing platform where all licensing, subscriptions, customers, products, activations, domains, orders, and analytics are managed directly within ConversionFlow — no external licensing dependencies.

**Target features:**
- **Product Management** — Create Products, Manage Product Versions, Manage Product Plans, Configure Licensing Rules
- **Customer Management** — Store Customer Information, Manage Customer Purchases, Track Customer Activity
- **License Management** — Generate, Validate, Activate, Deactivate, Suspend, Revoke, Extend Licenses
- **Activation Management** — Track Domains, Track Installations, Track Device Activations, Enforce Activation Limits
- **Subscription Management** — Manage Renewals, Track Expiration Dates, Handle Subscription Statuses, Manage Lifetime Licenses
- **Analytics & Reporting** — License Analytics, Revenue Analytics, Product Performance, Customer Growth, Activation Statistics
- **Technical Architecture** — Modular Monolith, DDD, Service Layer Pattern, Repository Pattern, Event-Driven Internal Actions, Background Jobs, API-First Design
- **Removal** — No dependency on `license.devsroom.com`, no `centralOrderId`, `centralLicenseId`, `centralUserId` fields

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

### Active

<!-- v3.0 scope. Building toward these. -->

**Licensing Architecture**
- [ ] Modular Monolith structure with Domain-Driven Design
- [ ] Service Layer Pattern for all business logic
- [ ] Repository Pattern for data access abstraction
- [ ] Event-driven internal actions for decoupled operations
- [ ] Background job system for scheduled tasks

**Product & License Core**
- [ ] Products table and management (products, versions, plans)
- [ ] Product Plans configuration (licensing rules, activation limits)
- [ ] Local License Generation (no external dependency)
- [ ] License Validation service
- [ ] License Activation/Deactivation service
- [ ] License Status management (active, expired, revoked, suspended)

**Customer & Order Management**
- [ ] Customer activity tracking
- [ ] Order lifecycle management
- [ ] Subscription handling (renewals, expirations, lifetime)
- [ ] Remove centralOrderId, centralLicenseId, centralUserId fields

**Activation & Domain Tracking**
- [ ] Domain activation tracking
- [ ] Installation tracking
- [ ] Device activation management
- [ ] Activation limit enforcement

**Analytics & Reporting**
- [ ] License analytics dashboard
- [ ] Revenue analytics
- [ ] Product performance metrics
- [ ] Customer growth tracking
- [ ] Activation statistics

**API Design**
- [ ] Public API endpoints for license validation
- [ ] Webhook system for external integrations
- [ ] API authentication and rate limiting

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- WordPress plugin development — this is the SaaS platform, not the plugin itself
- External licensing engines — all licensing managed internally in v3.0
- CMS integration — content managed via data files and MDX in the repository
- Mobile app — web-only platform
- Redesigning existing marketing pages — all v1.x pages preserved as-is
- Redesigning dashboard UI — use backenddashboard/ folder design as-is
- Multi-tenant support — single-instance platform for Devsroom only

## Context

- **Product state**: ConversionFlow plugin is live and serving 500+ active WooCommerce stores in Bangladesh
- **Design reference**: Marketing site design from `woobooster-v2.html`. Dashboard design from `backenddashboard/` folder
- **Company**: Built by Devsroom/WPMHS team based in Dhaka, Bangladesh (contact: mhs@wpmhs.com, WhatsApp: +880 1721-328992)
- **Target audience**: Bangladeshi WooCommerce store owners (customers) + Devsroom operators (admins)
- **Products**: ConversionFlow WP Plugin, ConversionFlow Laravel Module
- **Existing codebase**: v2.1 complete — Next.js 16, TypeScript, TailwindCSS v4, Framer Motion, next-intl, MDX blog/docs
- **Pricing**: Starter $29/3,499BDT, Professional $69/8,299BDT (most popular), Agency $129/15,499BDT — all one-time payments
- **Design feel**: Premium SaaS quality with Bangladeshi local personality

## Constraints

- **Package Manager**: pnpm only — never npm, yarn, or bun
- **Framework**: Next.js 16 with App Router, TypeScript strict mode, TailwindCSS v4, ESLint
- **Proxy**: Use `proxy.ts` instead of `middleware.ts` per project rules
- **Components**: Server components by default; client components only when needed
- **Styling**: TailwindCSS v4 CSS-first config — no tailwind.config.js file
- **Design Fidelity**: Dashboard UI ported from `backenddashboard/` folder — no redesign
- **Preservation**: All existing marketing pages and v2.x functionality preserved as-is
- **Deployment**: Self-hosted (not Vercel) — must work on custom server/VPS
- **Architecture**: Modular Monolith with Service Layer, Repository Pattern, DDD

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
| Self-contained licensing (v3.0) | Complete control, no external dependencies, future-proof | Pending |
| Modular Monolith + DDD | Scalable architecture, clear domain boundaries | Pending |
| Service Layer Pattern | Business logic abstraction, testability | Pending |
| Repository Pattern | Data access abstraction, easier testing | Pending |

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
*Last updated: 2026-05-29 — v3.0 Self-Contained Licensing Architecture milestone started*
