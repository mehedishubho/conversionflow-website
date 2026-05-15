# Requirements: ConversionFlow Platform

**Defined:** 2026-05-11
**Core Value:** A production-grade SaaS platform where Bangladeshi WooCommerce store owners purchase and manage ConversionFlow licenses, while Devsroom operators gain real-time business intelligence and revenue analytics.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: Build compiles without errors — Footer component, cn() utility, and CSS button classes created
- [x] **FOUND-02**: TailwindCSS v4 design token system is complete and consistent — all CSS variables registered in @theme block
- [x] **FOUND-03**: Syne font loads weight 900 (used throughout headings) — fix font configuration in layout.tsx
- [x] **FOUND-04**: Dark/light theme switches without flash — suppressHydrationWarning and next-themes configured correctly
- [x] **FOUND-05**: All pages are fully responsive — mobile, tablet, and desktop layouts work correctly
- [x] **FOUND-06**: Custom 404 page matches site design
- [x] **FOUND-07**: Self-hosted deployment configured — output: 'standalone' in next.config.ts
- [x] **FOUND-08**: Custom cursor effect renders on desktop — floating dot following mouse with blend mode, disabled on touch devices
- [x] **FOUND-09**: Enhanced Framer Motion animations — page transitions, stagger effects, scroll reveals work smoothly without layout shift
- [x] **FOUND-10**: Shared layout components work — Navbar, Footer, ThemeProvider render on all pages

### Homepage

- [x] **HOME-01**: Hero section displays with dashboard mockup, word-by-word title animation, CTAs, and trust pills
- [x] **HOME-02**: Trust bar shows key stats (500+ stores, 3 couriers, 6 platforms, 100% CAPI, BDT pricing)
- [x] **HOME-03**: Bento features grid displays 6 modules with icons, descriptions, and tags — 2-column card spans correctly
- [x] **HOME-04**: Video section shows mock player with pulsing play button and opens lightbox on click
- [x] **HOME-05**: BD couriers section displays Steadfast, Pathao, RedX cards with live status chips and order flow diagram
- [x] **HOME-06**: How It Works section shows 3 step cards with numbered badges
- [x] **HOME-07**: Testimonials grid displays 3 review cards with star ratings, quotes, and author info
- [x] **HOME-08**: CTA banner displays with BD tag, headline, and pricing link
- [x] **HOME-09**: Dashboard mockup component renders with revenue/orders/blocked stats, chart bars, and order list
- [x] **HOME-10**: Count-up animations trigger on scroll for trust bar stats and dashboard numbers

### Features Page

- [x] **FEAT-01**: Page hero with eyebrow, title, and subtitle matching design reference
- [x] **FEAT-02**: Video walkthrough section with mock player and lightbox
- [x] **FEAT-03**: Feature filter tabs (All Modules, Courier Sync, Tracking, Fraud Shield, Analytics, Lead Recovery)
- [x] **FEAT-04**: Feature rows display module details with alternating layout — Courier Sync, Meta CAPI, Fraud Shield
- [x] **FEAT-05**: Tracking panel component shows active status for Meta Pixel, GA4, TikTok, Pinterest, GTM
- [x] **FEAT-06**: Fraud box component displays order table with block buttons and fraud stats
- [x] **FEAT-07**: Courier cards component reusable across Features and Homepage

### Pricing Page

- [x] **PRIC-01**: Three pricing tiers display (Starter $29, Professional $69, Agency $129) with feature checklists
- [x] **PRIC-02**: USD/BDT currency toggle switches all prices between dollar and taka
- [x] **PRIC-03**: "Most Popular" badge on Professional tier with accent border glow
- [x] **PRIC-04**: FAQ accordion expands/collapses with rotate animation on icon
- [x] **PRIC-05**: Trust strip displays secure checkout, payment methods, refund, delivery, and BD support
- [x] **PRIC-06**: "Buy Now" buttons link to external checkout; "WhatsApp" option shown for BD payment methods

### Changelog Page

- [x] **CHLOG-01**: Version entries display with version badge, date, release name, and tagged changes
- [x] **CHLOG-02**: Change tags differentiate New, Improved, and Fixed entries with color coding
- [x] **CHLOG-03**: Changelog data sourced from TypeScript data file, not hardcoded in component

### Support Page

- [x] **SUPP-01**: Three support cards display (Email, WhatsApp BD, Documentation) with icons and action buttons
- [x] **SUPP-02**: Contact form collects name, email, license key, subject, and message
- [x] **SUPP-03**: Contact form sends email via server action using Resend
- [x] **SUPP-04**: Form validation provides inline error messages for required fields
- [x] **SUPP-05**: Success/error feedback displayed after form submission

### Content Data Layer

- [x] **DATA-01**: All pricing tiers extracted to src/data/pricing.ts
- [x] **DATA-02**: All changelog entries extracted to src/data/changelog.ts
- [x] **DATA-03**: All testimonials extracted to src/data/testimonials.ts
- [x] **DATA-04**: All feature/module data extracted to src/data/features.ts
- [x] **DATA-05**: FAQ items extracted to src/data/faq.ts
- [x] **DATA-06**: Support info extracted to src/data/support.ts
- [x] **DATA-07**: Navigation links extracted to src/data/navigation.ts

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

- [x] **SEO-01**: Each page has unique metadata (title, description) via Next.js Metadata API
- [x] **SEO-02**: Open Graph and Twitter Card tags configured for social sharing
- [x] **SEO-03**: sitemap.xml generated at build time
- [x] **SEO-04**: robots.txt configured
- [x] **SEO-05**: Analytics script loaded (Plausible or equivalent)

### Internationalization

- [x] **I18N-01**: Site structure supports English (en) and Bengali (bn) via next-intl
- [x] **I18N-02**: Bengali-capable font loaded (Noto Sans Bengali or equivalent) as fallback
- [x] **I18N-03**: Language switcher available in Navbar
- [x] **I18N-04**: Translatable strings extracted to message files (en.json, bn.json)

## v2 Requirements (Milestone: Dual Portal SaaS Platform)

### Authentication

- [ ] **AUTH-01**: Better Auth integration with dual auth (customer login + admin login)
- [ ] **AUTH-02**: 4-role RBAC system (customer, admin, support_staff, super_admin) with server-side checks
- [ ] **AUTH-03**: Email verification on registration
- [ ] **AUTH-04**: Password reset flow via email link
- [ ] **AUTH-05**: Session management with Redis-backed storage (optional in dev)
- [ ] **AUTH-06**: Admin 2FA-ready (TOTP support via Better Auth plugin)
- [ ] **AUTH-07**: Audit logging for all admin mutations (actor, action, target, IP, timestamp)

### Database & Infrastructure

- [ ] **DB-01**: PostgreSQL + Drizzle ORM setup with migration system
- [ ] **DB-02**: Redis client for caching, sessions, and job queues
- [ ] **DB-03**: Background job system (BullMQ) for async tasks
- [ ] **DB-04**: Database schema: users, orders, licenses, downloads, tickets, notifications, audit_logs, coupons

### Central Licensing

- [ ] **LIC-01**: POST to license.devsroom.com/api/orders/import on purchase completion
- [ ] **LIC-02**: Store central_user_id + central_license_id mappings locally
- [ ] **LIC-03**: Webhook handlers for license-created/updated/expired/payment-refunded events
- [ ] **LIC-04**: Scheduled fallback sync (every 15 minutes) when webhooks fail
- [ ] **LIC-05**: HMAC signature verification on all incoming webhooks

### Customer Portal

- [ ] **PORT-01**: Dashboard overview (active licenses, expiring soon, recent downloads, open tickets)
- [ ] **PORT-02**: License management (list, detail, copy key, deactivate domain, sync status)
- [ ] **PORT-03**: Billing section (invoices, payment history, refund status)
- [ ] **PORT-04**: Downloads section (latest + old plugin versions with changelogs)
- [ ] **PORT-05**: Support tickets (create, list, reply with attachments)
- [ ] **PORT-06**: Notification center (list, mark read, preferences)

### Checkout & Payments

- [ ] **PAY-01**: BD manual payments (bKash, Nagad, Rocket, Bank Transfer) with admin verification workflow
- [ ] **PAY-02**: SSL Commerce gateway integration (session creation, redirect, IPN handler, validation)
- [ ] **PAY-03**: Coupon code system (percentage/flat, usage limits, expiry)
- [ ] **PAY-04**: Tax/VAT calculation with configurable rates
- [ ] **PAY-05**: Invoice generation (HTML view + PDF download)
- [ ] **PAY-06**: Complete purchase flow: payment -> central API -> store mapping -> confirmation

### Admin BI Dashboard

- [ ] **ADMN-01**: Executive overview (total revenue, MRR, ARR, active customers, CLV, CAC with trend indicators)
- [ ] **ADMN-02**: Sales performance (total sales, conversion rate, refund rate, average order value)
- [ ] **ADMN-03**: User growth tracking (daily/weekly/monthly signups, activation rate)
- [ ] **ADMN-04**: Revenue trend charts (daily/weekly/monthly/yearly via ApexCharts with date range selector)
- [ ] **ADMN-05**: Invoice management (list/filter by status: paid/pending/failed/overdue, mark paid, send reminders)
- [ ] **ADMN-06**: User management (list, detail, role assignment, ban/activate)
- [ ] **ADMN-07**: Activity feed (real-time chronological events: purchase, license, refund, ticket)
- [ ] **ADMN-08**: Date range + product/plan/channel filters across all BI widgets
- [ ] **ADMN-09**: Data export (CSV, Excel, PDF) for all report types
- [ ] **ADMN-10**: Admin notifications (failed payment alerts, expiring licenses, churn alerts, fraud alerts)

### License Intelligence

- [ ] **LINT-01**: License status dashboard (total/active/expired/revoked/renewal rate by product/plan)
- [ ] **LINT-02**: Domain tracking (activation domains per license, timestamps, multisite usage)
- [ ] **LINT-03**: Piracy detection flagging (suspicious activation patterns for admin review)

### Dashboard UI

- [ ] **DASH-01**: Port dashboard layout from backenddashboard/ (AppSidebar, AppHeader, Backdrop, SidebarContext)
- [ ] **DASH-02**: Separate CSS for dashboard routes (prevent CSS token conflict with marketing site)
- [ ] **DASH-03**: Unified next-themes across marketing + dashboard (delete dashboard's ThemeContext)
- [ ] **DASH-04**: Route group architecture: (auth)/, (portal)/, (admin)/ separate from [locale]/

## Out of Scope

| Feature | Reason |
|---------|--------|
| WordPress plugin development | This is the SaaS platform, not the plugin itself |
| Central licensing engine | Owned by license.devsroom.com, only integrated here |
| CMS integration | Content managed via data files and MDX in the repository |
| Mobile app | Web-only platform |
| Redesigning existing marketing pages | All v1.x pages preserved as-is |
| Redesigning dashboard UI | Use backenddashboard/ folder design as-is |

## Traceability

### v1 Requirements

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 10 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 10 | Complete |
| FOUND-06 | Phase 4 | Complete |
| FOUND-07 | Phase 5 | Complete |
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
| HOME-10 | Phase 6 | Complete |
| FEAT-01 | Phase 3 | Complete |
| FEAT-02 | Phase 3 | Complete |
| FEAT-03 | Phase 3 | Complete |
| FEAT-04 | Phase 3 | Complete |
| FEAT-05 | Phase 3 | Complete |
| FEAT-06 | Phase 3 | Complete |
| FEAT-07 | Phase 3 | Complete |
| PRIC-01 | Phase 3 | Complete |
| PRIC-02 | Phase 6 | Complete |
| PRIC-03 | Phase 3 | Complete |
| PRIC-04 | Phase 3 | Complete |
| PRIC-05 | Phase 3 | Complete |
| PRIC-06 | Phase 6 | Complete |
| CHLOG-01 | Phase 3 | Complete |
| CHLOG-02 | Phase 3 | Complete |
| CHLOG-03 | Phase 5 | Complete |
| SUPP-01 | Phase 3 | Complete |
| SUPP-02 | Phase 3 | Complete |
| SUPP-03 | Phase 6 | Complete |
| SUPP-04 | Phase 6 | Complete |
| SUPP-05 | Phase 6 | Complete |
| DATA-01 | Phase 5 | Complete |
| DATA-02 | Phase 5 | Complete |
| DATA-03 | Phase 5 | Complete |
| DATA-04 | Phase 5 | Complete |
| DATA-05 | Phase 5 | Complete |
| DATA-06 | Phase 5 | Complete |
| DATA-07 | Phase 5 | Complete |
| BLOG-01 | Phase 7 | Complete |
| BLOG-02 | Phase 7 | Complete |
| BLOG-03 | Phase 7 | Complete |
| BLOG-04 | Phase 7 | Complete |
| DOCS-01 | Phase 7 | Complete |
| DOCS-02 | Phase 7 | Complete |
| LEGL-01 | Phase 7 | Complete |
| LEGL-02 | Phase 7 | Complete |
| LEGL-03 | Phase 7 | Complete |
| LEGL-04 | Phase 7 | Complete |
| SEO-01 | Phase 4 | Complete |
| SEO-02 | Phase 4 | Complete |
| SEO-03 | Phase 8 | Complete |
| SEO-04 | Phase 8 | Complete |
| SEO-05 | Phase 8 | Complete |
| I18N-01 | Phase 9 | Complete |
| I18N-02 | Phase 9 | Complete |
| I18N-03 | Phase 9 | Complete |
| I18N-04 | Phase 9 | Complete |

### v2 Requirements (Milestone: Dual Portal SaaS Platform)

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| AUTH-06 | Phase 1 | Pending |
| AUTH-07 | Phase 1 | Pending |
| DB-01 | Phase 1 | Pending |
| DB-02 | Phase 1 | Pending |
| DB-03 | Phase 1 | Pending |
| DB-04 | Phase 1 | Pending |
| DASH-02 | Phase 1 | Pending |
| DASH-03 | Phase 1 | Pending |
| DASH-04 | Phase 1 | Pending |
| DASH-01 | Phase 2 | Pending |
| PORT-01 | Phase 3 | Pending |
| PORT-02 | Phase 3 | Pending |
| PORT-03 | Phase 3 | Pending |
| PORT-04 | Phase 3 | Pending |
| PORT-05 | Phase 3 | Pending |
| PORT-06 | Phase 3 | Pending |
| LIC-01 | Phase 4 | Pending |
| LIC-02 | Phase 4 | Pending |
| PAY-01 | Phase 4 | Pending |
| PAY-02 | Phase 4 | Pending |
| PAY-03 | Phase 4 | Pending |
| PAY-04 | Phase 4 | Pending |
| PAY-05 | Phase 4 | Pending |
| PAY-06 | Phase 4 | Pending |
| ADMN-01 | Phase 5 | Pending |
| ADMN-02 | Phase 5 | Pending |
| ADMN-03 | Phase 5 | Pending |
| ADMN-04 | Phase 5 | Pending |
| ADMN-05 | Phase 5 | Pending |
| ADMN-06 | Phase 5 | Pending |
| ADMN-07 | Phase 5 | Pending |
| ADMN-08 | Phase 5 | Pending |
| ADMN-09 | Phase 5 | Pending |
| ADMN-10 | Phase 5 | Pending |
| LIC-03 | Phase 6 | Pending |
| LIC-04 | Phase 6 | Pending |
| LIC-05 | Phase 6 | Pending |
| LINT-01 | Phase 6 | Pending |
| LINT-02 | Phase 6 | Pending |
| LINT-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 67 total (all Complete)
- v2 requirements: 45 total
- Mapped to phases: 45
- Orphaned: 0

---
*Requirements defined: 2026-05-11*
*Last updated: 2026-05-15 -- v2.0 requirements added, traceability mapped*
