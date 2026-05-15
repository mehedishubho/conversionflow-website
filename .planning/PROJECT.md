# ConversionFlow Platform

## What This Is

ConversionFlow is a dual-portal SaaS platform for Devsroom. The public marketing site (already built in v1.x) presents the ConversionFlow plugin to Bangladeshi WooCommerce store owners. The v2.0 platform adds a **Customer Portal** for license management, billing, downloads, and support — plus an **Admin BI Dashboard** for revenue intelligence, sales analytics, license intelligence, and operational management. All licensing is handled by the central authority at `license.devsroom.com`.

## Core Value

A production-grade SaaS platform where Bangladeshi WooCommerce store owners purchase ConversionFlow licenses, manage billing and downloads, get support — while Devsroom operators gain real-time business intelligence, revenue analytics, and license intelligence across all products.

## Current Milestone: v2.0 Dual Portal SaaS Platform

**Goal:** Transform the marketing site into a full SaaS platform with Customer Portal and Admin BI Dashboard, integrating with the central Devsroom licensing engine at license.devsroom.com.

**Target features:**
- Authentication System (Better Auth, dual auth, 4 roles, 2FA-ready, audit logging)
- Database Layer (PostgreSQL + Drizzle ORM + Redis)
- Customer Portal (overview, licenses, billing, downloads, support tickets, notifications)
- Admin BI Dashboard (revenue intelligence, sales analytics, churn, conversion funnel, geographic analytics, exports)
- Checkout System (bKash, Nagad, Rocket, Bank Transfer, SSL Commerce, coupons, tax/VAT, invoices)
- License Intelligence (central API sync, webhooks, piracy detection)
- Admin Operations (invoice management, user management, activity feed, CSV/Excel/PDF export)
- Security (RBAC, signed webhooks, encrypted secrets, CSRF, rate limiting)
- Dashboard Design ported from `backenddashboard/` folder

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

<!-- v2.0 scope. Building toward these. -->

**Authentication**
- [ ] Better Auth integration with dual auth (customer/admin login)
- [ ] 4-role RBAC system (customer, admin, support_staff, super_admin)
- [ ] Email verification, password reset, session management
- [ ] Admin 2FA-ready, IP logging, audit logging

**Database & Infrastructure**
- [ ] PostgreSQL + Drizzle ORM setup with migration system
- [ ] Redis for sessions, caching, queues
- [ ] Background job system for sync tasks
- [ ] Database schema: users, orders, licenses, downloads, tickets, notifications

**Central Licensing Integration**
- [ ] POST to license.devsroom.com/api/orders/import on purchase
- [ ] Store central_user_id + central_license_id mappings locally
- [ ] Webhook handlers for license-created/updated/expired/payment-refunded
- [ ] Scheduled fallback sync when webhooks fail

**Customer Portal**
- [ ] Customer dashboard overview (active licenses, expiring, downloads, tickets)
- [ ] License management (view, copy, renew, upgrade, deactivate domain, sync)
- [ ] Billing section (invoices, payment history, refunds)
- [ ] Downloads section (latest + old versions, changelogs)
- [ ] Support tickets (create, reply, attachments)
- [ ] Notification center

**Checkout & Payments**
- [ ] Manual BD payments (bKash, Nagad, Rocket, Bank Transfer)
- [ ] SSL Commerce payment gateway
- [ ] Coupon codes, tax/VAT calculation
- [ ] Invoice generation
- [ ] Purchase flow: payment -> create/find customer -> call central API -> store mapping

**Admin BI Dashboard**
- [ ] Executive overview (total revenue, MRR, ARR, active customers, CLV, CAC)
- [ ] Sales performance (total sales, conversion rate, refund rate)
- [ ] User growth (daily signups, weekly growth, activation rate)
- [ ] Churn analytics (cancellations, churn rate, downgrade alerts)
- [ ] Conversion funnel (impressions -> visits -> checkout -> purchase -> activation)
- [ ] Product performance (plugin sales, renewals, plans)
- [ ] Revenue trend charts (daily/weekly/monthly/yearly)
- [ ] Retention analytics (day 1/7/30/90)
- [ ] Geographic analytics (sales by country, revenue heatmap)
- [ ] Invoice management (paid/pending/failed/overdue)
- [ ] Activity feed (real-time events)
- [ ] Filtering (date range, product, plan, channel)
- [ ] Export (CSV, Excel, PDF)
- [ ] Notifications (failed payment, expiring license, churn, fraud alerts)

**License & Plugin Intelligence**
- [ ] License sync from central API (total/active/expired/revoked/renewal rate)
- [ ] Plugin intelligence (activation domains, multisite usage, suspicious activations)
- [ ] Piracy detection

**Dashboard UI**
- [ ] Port dashboard design from `backenddashboard/` folder
- [ ] Customer portal layout with sidebar navigation
- [ ] Admin portal layout with sidebar navigation
- [ ] Charts via ApexCharts (from dashboard template)
- [ ] Data tables, forms, modals from dashboard UI components

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
*Last updated: 2026-05-15 — Milestone v2.0 started*
