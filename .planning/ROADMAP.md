# Roadmap: ConversionFlow Platform

## Overview

Transform the ConversionFlow marketing website into a full SaaS platform with Customer Portal, Admin BI Dashboard, Marketing/SEO Settings, and a completely self-contained licensing architecture. v1.x built the marketing site. v2.0 added authentication, database, customer portal, checkout, admin BI, webhooks, and license intelligence. v2.1 added comprehensive SEO & Marketing settings. v3.0 refactored the platform into a self-contained licensing system with modular monolith architecture. v4.0 transforms ConversionFlow into a **multi-platform license server** — serving WordPress, Laravel, Shopify, and Next.js clients with platform SDKs, update delivery, multi-gateway payments (Stripe/Paddle/bKash API), feature flags per tier, and API security.

## Milestones

| # | Milestone | Phases | Status | Shipped |
|---|-----------|--------|--------|---------|
| M1 | **v1.0 Core Site** | 01–04 | ✅ Shipped | 2026-05-11 |
| M2 | **v1.1 Functional Site** | 05–10 | ✅ Shipped | 2026-05-14 |
| M3 | **v2.0 Dual Portal SaaS Platform** | 11–18 | ✅ Shipped | 2026-05-19 |
| M4 | **v2.1 Marketing & SEO Settings Dashboard** | 19–23 | ✅ Shipped | 2026-05-30 |
| M5 | **v3.0 Self-Contained Licensing Architecture** | 24–31 | ✅ Shipped | — |
| M6 | **v4.0 Multi-Platform License Server & SDK Distribution** | 32–38 | 🔲 Planned | — |

## Current Milestone

- **v4.0 Multi-Platform License Server & SDK Distribution** — Phases 32–38

**Milestone Goal:** Transform ConversionFlow into a multi-platform license server serving WordPress, Laravel, Shopify, and Next.js clients. Build platform-specific SDKs, complete the update delivery system, add automatic payment gateways (Stripe, Paddle, bKash API), enforce feature flags per tier, and harden API security with HMAC signing. ConversionFlow IS the license server — no 3rd party handles licensing. Dual payment system: Manual (bKash/Nagad/Rocket/Bank) + Real automatic gateways (SSL Commerz, Stripe, Paddle).

**Context:** See `.planning/phases/32-v4-milestone/v4-MILESTONE-CONTEXT.md`

---

## Phase Index

| Phase | Name | Milestone | Status | Verified |
|-------|------|-----------|--------|----------|
| 01 | Foundation | v1.0 | ✅ Complete | — |
| 02 | Homepage | v1.0 | ✅ Complete | — |
| 03 | Content Pages | v1.0 | ✅ Complete | — |
| 04 | SEO & Polish | v1.0 | ✅ Complete | — |
| 05 | Data Layer & Changelog | v1.1 | ✅ Complete | ✅ |
| 06 | Interactivity | v1.1 | ✅ Complete | ✅ |
| 07 | Blog & Documentation | v1.1 | ✅ Complete | ✅ |
| 08 | Legal Pages & SEO | v1.1 | ✅ Complete | — |
| 09 | Internationalization | v1.1 | ✅ Complete | — |
| 10 | Polish & Refinement | v1.1 | ✅ Complete | ✅ |
| 11 | Database, Auth, and Route Foundation | v2.0 | ✅ Complete | — |
| 12 | Dashboard Shell | v2.0 | ✅ Verified | — |
| 13 | Customer Portal | v2.0 | ✅ Verified | — |
| 14 | Checkout and Payments | v2.0 | ✅ Complete | — |
| 15 | Admin BI Dashboard | v2.0 | ✅ Complete | — |
| 16 | Webhooks, Background Jobs & License Intelligence | v2.0 | ✅ Complete | — |
| 17 | Multi-channel Notification Engine | 2/4 | Complete    | 2026-06-11 |
| 18 | Affiliate Network System | v2.0 | ⏸️ Deferred to post-MVP | — |
| 19 | Settings Foundation | v2.1 | ✅ Complete | — |
| 20 | Core SEO Configuration | v2.1 | ✅ Complete | — |
| 21 | Tracking Pixels & Social SEO | 6/6 | Complete   | 2026-06-08 |
| 22 | Advanced SEO Controls | v2.1 | ✅ Complete | — |
| 23 | SEO Analytics Dashboard | v2.1 | ✅ Complete | ✅ |
| 24 | Shared DDD Infrastructure | v3.0 | ✅ Complete | ✅ |
| 25 | Products Bounded Context | v3.0 | ✅ Complete | ✅ |
| 26 | Licensing Core (Generation & Validation) | v3.0 | ✅ Complete | ✅ |
| 27 | Customer & Billing Integration | v3.0 | ✅ Complete | ✅ |
| 28 | Subscription & Status Management | v3.0 | ✅ Complete | ✅ |
| 29 | Portal & Analytics Enhancements | v3.0 | ✅ Complete | ✅ |
| 30 | Migration & External API Removal | v3.0 | ✅ Complete | ✅ |
| 31 | Backup & Restore System | v3.0 | ✅ Complete | ✅ |
| 32 | Update Delivery System | 4/4 | Complete    | 2026-06-11 |
| 33 | Feature Flags & Tier Enforcement | 1/0 | Complete    | 2026-06-11 |
| 34 | Multi-Gateway Payment System | 5/5 | Complete    | 2026-06-10 |
| 35 | WordPress SDK | 3/3 | Complete    | 2026-06-11 |
| 36 | Laravel SDK | v4.0 | 🔲 Planned | — |
| 37 | Shopify App Integration | v4.0 | 🔲 Planned | — |
| 38 | Next.js SDK & API Security | v4.0 | 🔲 Planned | — |

---

## Phase Details

<details>
<summary><strong>M1 — v1.0 Core Site</strong> (Phases 01–04) · Shipped 2026-05-11</summary>

### Phase 01: Foundation
**Milestone:** v1.0
**Goal:** Project scaffolding, core layout, responsiveness
**Status:** ✅ Complete

### Phase 02: Homepage
**Milestone:** v1.0
**Goal:** Hero, trust bar, features, CTA, animations
**Status:** ✅ Complete

### Phase 03: Content Pages
**Milestone:** v1.0
**Goal:** Features, Pricing, Changelog, Support
**Status:** ✅ Complete

### Phase 04: SEO & Polish
**Milestone:** v1.0
**Goal:** Metadata, 404, performance, deployment config
**Status:** ✅ Complete

</details>

<details>
<summary><strong>M2 — v1.1 Functional Site</strong> (Phases 05–10) · Shipped 2026-05-14</summary>

### Phase 05: Data Layer & Changelog
**Directory:** `_archive-v1x/05-data-layer`
**Goal:** Extract content to data files, MDX changelog
**Status:** ✅ Complete · Verified

### Phase 06: Interactivity
**Directory:** `_archive-v1x/06-interactive-features`
**Goal:** Currency toggle, contact form, count-up animations
**Status:** ✅ Complete · Verified

### Phase 07: Blog & Documentation
**Directory:** `_archive-v1x/07-blog-docs-and-legal`
**Goal:** MDX blog, documentation section
**Status:** ✅ Complete · Verified

### Phase 08: Legal Pages & SEO
**Directory:** `_archive-v1x/08-seo-completion`
**Goal:** 4 legal pages, sitemap, robots, analytics
**Status:** ✅ Complete

### Phase 09: Internationalization
**Goal:** Bengali i18n, language switcher, message files
**Status:** ✅ Complete

### Phase 10: Polish & Refinement
**Goal:** Font fixes, responsive fixes, cursor, animations
**Status:** ✅ Complete · Verified

</details>

<details>
<summary><strong>M3 — v2.0 Dual Portal SaaS Platform</strong> (Phases 11–18) · Shipped 2026-05-19</summary>

### Phase 11: Database, Auth, and Route Foundation
**Goal:** The application has a working database, authentication system, and route architecture that isolates the dashboard from the marketing site.
**Depends on:** Nothing (first phase of v2.0 milestone)
**Requirements:** DB-01, DB-02, DB-03, DB-04, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, DASH-02, DASH-03, DASH-04
**Success Criteria:**
  1. User can register a new account and verify their email address via a confirmation link
  2. User can log in with email/password and stay logged in across browser sessions
  3. User can reset their password via an email link and log in with the new password
  4. Admin users see the admin dashboard route; customer users see the customer portal route; unauthorized users are redirected to login
  5. Marketing site pages render identically to v1.x with no CSS or layout changes
**Plans:** 4/4 complete
**Status:** ✅ Complete 2026-05-16

### Phase 12: Dashboard Shell
**Goal:** Both the customer portal and admin dashboard have a complete layout shell with sidebar navigation, header, responsive backdrop, and unified theming.
**Depends on:** Phase 11
**Requirements:** DASH-01
**Success Criteria:**
  1. Customer portal displays a sidebar layout with navigation links to all portal sections
  2. Admin dashboard displays a sidebar layout with navigation links to all admin sections
  3. Sidebar collapses to a mobile-friendly hamburger menu on narrow viewports
  4. Dark/light theme toggle works consistently across marketing site and both dashboard layouts
  5. Dashboard CSS does not affect marketing site responsive breakpoints or design tokens
**Plans:** 3/3 complete
**Status:** ✅ Verified 2026-05-16

### Phase 13: Customer Portal
**Goal:** Customers can manage their ConversionFlow licenses, view billing history, download plugin files, submit support tickets, and manage notifications.
**Depends on:** Phase 12
**Requirements:** PORT-01, PORT-02, PORT-03, PORT-04, PORT-05, PORT-06
**Success Criteria:**
  1. Customer sees a dashboard overview with counts of active licenses, expiring soon, recent downloads, and open tickets
  2. Customer can view their license list, click into a license detail, copy the license key, and see activation domain status
  3. Customer can view invoices, payment history, and refund status in the billing section
  4. Customer can download the latest plugin version and access previous versions with changelogs
  5. Customer can create a support ticket, reply to existing tickets with attachments, and view ticket status
  6. Customer can view their notification list, mark notifications as read, and manage notification preferences
**Plans:** 5/5 complete
**Status:** ✅ Verified 2026-05-17

### Phase 14: Checkout and Payments
**Goal:** Customers can complete a purchase using Bangladesh payment methods or SSL Commerce gateway, with coupon codes, tax/VAT, and invoice generation synced with the central licensing API.
**Depends on:** Phase 13
**Requirements:** PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, LIC-01, LIC-02
**Success Criteria:**
  1. Customer can select a plan, choose a payment method, and initiate checkout
  2. SSL Commerce gateway redirects customer to payment page and back with order confirmation
  3. Manual BD payments create a pending order that admin can verify and confirm
  4. Customer can apply a coupon code and see the discounted price before payment
  5. Customer receives an invoice after successful payment
  6. Successful payment triggers a POST to license.devsroom.com and stores mappings locally
**Plans:** 6/6 complete
**Status:** ✅ Complete 2026-05-17

### Phase 15: Admin BI Dashboard
**Goal:** Admin operators can view real-time business intelligence with revenue KPIs, adaptive charts, invoice management, user management, activity feeds, and CSV export.
**Depends on:** Phase 14
**Requirements:** ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09, ADMN-10
**Success Criteria:**
  1. Admin sees an executive overview with total revenue, MRR, active customers, and trend indicators
  2. Admin can view an adaptive revenue chart with a preset date range selector
  3. Admin can list and filter invoices by status, mark invoices as paid, and send payment reminders
  4. Admin can list users, view user details, assign roles, and ban/activate accounts
  5. Admin can export any data table as CSV
  6. Admin sees an activity feed and receives admin-scoped notifications
**Plans:** 6/6 complete
**Status:** ✅ Complete 2026-05-18

### Phase 16: Webhooks, Background Jobs, and License Intelligence
**Goal:** The platform reliably syncs with the central licensing API via webhooks and scheduled fallback jobs. Admins can monitor license health and detect piracy patterns.
**Depends on:** Phase 14
**Requirements:** LIC-03, LIC-04, LIC-05, LINT-01, LINT-02, LINT-03
**Success Criteria:**
  1. Webhook handlers receive and process license events with HMAC signature verification
  2. A scheduled job syncs license data every 15 minutes as a fallback
  3. Admin can view a license intelligence dashboard with counts and renewal rates
  4. Admin can see domain tracking details for each license
  5. Suspicious activation patterns are flagged for admin review
**Plans:** 4/4 complete
**Status:** ✅ Complete 2026-05-19

### Phase 17: Multi-channel Notification Engine
**Goal:** Build a unified notification engine delivering messages across email and in-app channels, with event-driven routing, delivery tracking, and user preference persistence.
**Depends on:** Phase 16
**Requirements:** NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04, NOTIF-05, NOTIF-06, NOTIF-07
**Success Criteria:**
  1. Core notification service routes events to correct channels based on event type and user preferences
  2. Email channel sends HTML emails via unified adapter (Resend or SMTP) based on admin settings
  3. In-app notification bell shows unread count badge, dropdown list, and polls every 30 seconds
  4. Event catalog covers all 11 core transactional events with channel/template/category mapping
  5. Admin can view delivery status per channel in the notifications table
  6. Users can manage per-channel notification preferences (email/in-app toggles) that persist to database
  7. Per-channel delivery tracking records status (pending/sent/delivered/failed) for each notification
**Plans:** 4 plans
Plans:
- [ ] 17-01-PLAN.md — Unified email adapter, domain types, schema changes
- [ ] 17-02-PLAN.md — NotificationService, EventCatalog, BullMQ workers, module-init wiring
- [x] 17-03-PLAN.md — 30s polling, preference persistence, channel toggles
- [ ] 17-04-PLAN.md — Admin delivery status, schema push
**Status:** 🔲 Planned

### Phase 18: Affiliate Network System
**Goal:** Build a full affiliate marketing system with referral links, click tracking, commission calculation, and payout management.
**Depends on:** Phase 17
**Requirements:** AFF-01, AFF-02, AFF-03, AFF-04, AFF-05, AFF-06, AFF-07, AFF-08
**Success Criteria:**
  1. Customers can apply to become affiliates; admin can approve, reject, or suspend
  2. Each affiliate gets a unique referral code with 30-day cookie
  3. Click tracking records every referral link visit
  4. Commission is auto-calculated on completed referred purchases
  5. Affiliate dashboard shows clicks, conversions, earnings, and payout history
  6. Affiliates can request payouts; admin processes them
  7. Admin can manage affiliates and set commission rates
  8. DB schema supports affiliates, clicks, commissions, payouts tables linked to users and orders
**Plans:** 5 plans planned
**Status:** ⏸️ Deferred to post-MVP

</details>

<details>
<summary><strong>M4 — v2.1 Marketing & SEO Settings Dashboard</strong> (Phases 19–23) · Shipped 2026-05-30</summary>

### Phase 19: Settings Foundation
**Goal:** The admin settings page is restructured from a flat form stack into a sub-page navigation system with category landing page, dedicated sub-routes for Payment/SMTP/SEO, and migrated existing forms.
**Depends on:** Phase 11–16 (v2.0 complete)
**Requirements:** NAV-01, NAV-02, NAV-03, NAV-04, NAV-05
**Success Criteria:**
  1. Admin navigates to /admin/settings and sees a landing page with category cards linking to Payment Gateway, SMTP/Email, and SEO Settings
  2. Admin clicks into /admin/settings/payment, /admin/settings/smtp, or /admin/settings/seo and sees the respective existing forms functioning identically
  3. Admin navigates SEO sub-routes and sees a consistent sidebar or tabbed layout across all SEO sections
  4. Admin can toggle between settings categories without losing unsaved form state within the same category
  5. Settings navigation appears in the admin sidebar with correct active-state highlighting for the current sub-route
**Plans:** 3/3 complete
**Status:** ✅ Complete 2026-05-25

### Phase 20: Core SEO Configuration
**Goal:** Admin can configure all fundamental SEO settings -- site-wide meta configuration with SERP preview, search engine verification with status indicators, XML sitemap management, and robots.txt editing.
**Depends on:** Phase 19
**Requirements:** GSEO-01–07, VERF-01–05, SITM-01–05, ROBT-01–05
**Success Criteria:**
  1. Admin can configure website title, meta title, meta description, keywords, canonical URL, robots meta, separator, and OG image -- and sees a real-time SERP preview with character count indicators and SEO completeness score
  2. Admin can toggle URL formatting options (lowercase, trailing slash) and auto meta generation
  3. Admin can enter Google Search Console, Bing, Yandex, Baidu, and Pinterest verification codes and see connected/disconnected status
  4. Admin can enable/disable XML sitemap generation, toggle individual sitemap types, trigger manual regeneration, and see sitemap URL and last-generated timestamp
  5. Admin can edit robots.txt using both a visual rule builder and a raw code editor, toggle AI bot access controls, apply crawl presets
**Plans:** 5/5 complete
**Status:** ✅ Complete 2026-05-26

### Phase 21: Tracking Pixels & Social SEO
**Goal:** Admin can configure all tracking integrations (Meta Pixel/CAPI, TikTok, Google Analytics/Ads/GTM), social sharing defaults with preview simulators, and schema markup with JSON-LD preview and validation.
**Depends on:** Phase 19
**Requirements:** SOCL-01–05, META-01–06, TIKT-01–03, GOOG-01–05, SCHM-01–05
**Success Criteria:**
  1. Admin can configure Facebook App ID, share title/description/image, Twitter/X handle and card type, and LinkedIn share image -- and sees a social share preview simulator for all three platforms
  2. Admin can configure Meta Pixel ID, CAPI token, Dataset ID, Test Event Code, toggle Advanced Matching and Event Deduplication, select standard events to track
  3. Admin can configure TikTok Pixel ID, Events API token, toggle Advanced Matching and server-side tracking
  4. Admin can configure GA4 Measurement Id, Google Ads Conversion ID/Label, GTM Container ID, toggle server-side tracking and enhanced ecommerce
  5. Admin can configure global schema (Organization, Website, Breadcrumb) and content schemas (Product, Article, FAQ, HowTo, Review), see JSON-LD preview, validate against Google requirements
**Plans:** 5/5 complete
**Status:** ✅ Complete 2026-05-27

### Phase 22: Advanced SEO Controls
**Goal:** Admin can manage URL redirects with bulk operations, control AI crawler access and generate llms.txt, configure image SEO automation, tune performance SEO settings with Core Web Vitals monitoring, and set page-level SEO overrides.
**Depends on:** Phase 20
**Requirements:** RDIR-01–05, AISE-01–05, IMGS-01–05, PERF-01–06, PLVL-01–05
**Success Criteria:**
  1. Admin can create 301/302 and regex-based redirects, view them in a searchable/filterable table with hit counter, bulk import/export via CSV
  2. Admin can allow or block individual AI crawlers (GPTBot, ClaudeBot, PerplexityBot), generate an llms.txt file, and configure AI content usage rules
  3. Admin can toggle auto ALT text, WebP conversion, lazy loading, and image compression -- and sees image performance statistics
  4. Admin can toggle Critical CSS, JS defer, HTML/CSS minification, configure CDN URL and cache settings -- and sees Core Web Vitals monitor cards
  5. Admin can set per-page SEO overrides for each page and blog post
**Plans:** 5/5 complete
**Status:** ✅ Complete 2026-05-28

### Phase 23: SEO Analytics Dashboard
**Goal:** Admin sees a comprehensive SEO analytics dashboard displaying indexed pages, top performing pages, keyword rankings, CTR/impressions with charts, 404 error reports, sitemap health, and crawl issues.
**Depends on:** Phase 20, Phase 21
**Requirements:** ANLT-01–07
**Success Criteria:**
  1. Admin sees an SEO analytics overview with indexed pages count and trend indicator, and top performing pages ranked by organic traffic metrics
  2. Admin sees keyword rankings with position tracking and trend indicators
  3. Admin sees CTR and impressions data displayed as trend charts over configurable time ranges
  4. Admin sees 404 error and broken link reports in a searchable table
  5. Admin sees sitemap health status and crawl issue reports with actionable status badges
**Plans:** 3/3 complete
**Status:** ✅ Complete 2026-05-30

</details>

<details>
<summary><strong>M5 — v3.0 Self-Contained Licensing Architecture</strong> (Phases 24–31) · Active</summary>

### Phase 24: Shared DDD Infrastructure
**Directory:** `14-shared-ddd-infrastructure`
**Goal:** The codebase is reorganized into a modular monolith structure with Domain-Driven Design bounded contexts, and the foundational infrastructure (event bus, repository base, value objects) is in place for all domain modules.
**Depends on:** Phase 19–23 (v2.1 complete)
**Requirements:** ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05
**Success Criteria:**
  1. Codebase is organized into `src/modules/` with bounded contexts (licensing, billing, customers, products, analytics) and `src/shared/` for common infrastructure
  2. Event bus implements EventEmitter for in-process events and Redis Pub/Sub for cross-process events, with a unified publish/subscribe interface
  3. Repository base classes and interfaces provide CRUD operations, transaction support, and query building for all bounded contexts
  4. Shared value objects (LicenseKey, Money, Email, Domain) implement validation, equality, and serialization logic
  5. Module boundaries are enforced via import rules and dependency direction (customers -> products is allowed, products -> customers is not)
**Plans:** 4/4 complete
- [x] 14-01-PLAN.md — Module structure and TypeScript path aliases
- [x] 14-02-PLAN.md — Event bus implementation (EventEmitter + Redis Pub/Sub)
- [x] 14-03-PLAN.md — Repository base classes and interfaces
- [x] 14-04-PLAN.md — Shared value objects (LicenseKey, Money, Email, Domain)
**Status:** ✅ Complete · Verified

### Phase 25: Products Bounded Context
**Directory:** `15-products-context`
**Goal:** Admin can create and manage products with versions and plans, defining pricing, activation limits, licensing rules, and feature flags -- serving as the foundation for license generation.
**Depends on:** Phase 24
**Requirements:** PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-06, PROD-07
**Success Criteria:**
  1. Admin can create products with name, slug, description, and current version via admin dashboard UI
  2. Admin can manage product versions with download URLs and changelogs, and mark versions as released or beta
  3. Admin can create plans for each product with pricing (BDT, USD), activation limits (1, 3, 5, unlimited), and feature flags
  4. Plans support both lifetime licenses (no expiration) and subscription licenses (duration-based with billing cycle)
  5. Product and plan data is persisted in database and accessible via admin dashboard UI with edit/delete operations
**Plans:** 4/4 complete
- [x] 15-01-PLAN.md — Database schema, domain entities, and repositories
- [x] 15-02-PLAN.md — Server actions, seed script, and schema push
- [x] 15-03-PLAN.md — Admin UI: product list, create, detail shell
- [x] 15-04-PLAN.md — Admin UI: version and plan management
**Status:** ✅ Complete · Verified

### Phase 26: Licensing Core (Generation & Validation)
**Directory:** `16-licensing-core`
**Goal:** The platform generates unique, secure license keys locally and provides a public API for validation, activation, and deactivation -- completely replacing external licensing dependency.
**Depends on:** Phase 24, Phase 25
**Requirements:** LGEN-01–09, ACT-01–08, API-01–05
**Success Criteria:**
  1. System generates unique license keys using crypto.randomBytes() (25-32 chars, segmented format, case-insensitive, no ambiguous characters)
  2. License keys have UNIQUE database constraint and generation is entirely local with no external API calls
  3. Public API endpoint /api/v1/license/validate validates license keys and returns status, expiry, plan details with Redis caching (5-15 min TTL)
  4. Public API endpoints /api/v1/license/activate and /api/v1/license/deactivate bind/unbind domains to licenses after domain verification
  5. Domain normalization strips protocol, www prefix, and trailing slashes before activation
  6. Activation limit enforcement uses atomic database operations to prevent race conditions
  7. Validation API has rate limiting (100 requests/minute per IP) and returns identical error for all failures
  8. Customers can view and manage their active domains in customer portal, and admin can view activation history
**Plans:** 5/5 complete
- [x] 16-01-PLAN.md — Schema, domain entities, key generation, and domain services
- [x] 16-02-PLAN.md — Repositories, mappers, and infrastructure adapters
- [x] 16-03-PLAN.md — Application handlers, cache invalidation, and API routes
- [x] 16-04-PLAN.md — Customer portal and admin activation history UI
- [x] 16-05-PLAN.md — Schema push, module initialization, and final wiring
**Status:** ✅ Complete · Verified

### Phase 27: Customer & Billing Integration
**Directory:** `17-billing-integration`
**Goal:** Checkout and billing processes are refactored into the Billing Bounded Context, generating licenses locally via domain events when orders complete -- removing centralOrderId dependency.
**Depends on:** Phase 25, Phase 26
**Requirements:** LSTAT-05, LSTAT-06, ARCH-06, ARCH-08
**Success Criteria:**
  1. Checkout actions are refactored into Billing Context services with OrderCompleted event triggering license generation
  2. Order lifecycle management creates orders, processes payments, generates invoices, and triggers OrderCompleted event
  3. License generation is triggered by OrderCompleted domain event instead of external webhook
  4. License status changes (revoke, suspend) trigger audit log entries and customer notifications via domain events
  5. Webhook handlers for central license API events are removed and replaced with local event handlers
**Plans:** 3/3 complete
- [x] 17-01-PLAN.md
- [x] 17-02-PLAN.md
- [x] 17-03-PLAN.md
**Status:** ✅ Complete · Verified

### Phase 28: Subscription & Status Management
**Directory:** `18-subscription-status`
**Goal:** The platform manages subscription lifecycle with expiration tracking, grace periods, renewal processing, and lifetime license support -- ensuring continuous license validity.
**Depends on:** Phase 27
**Requirements:** LSTAT-01, LSTAT-02, LSTAT-03, LSTAT-04, LSTAT-07, JOB-01, JOB-02, JOB-04
**Success Criteria:**
  1. License status supports: active, expired, revoked, suspended, grace_period with state transitions enforced
  2. Subscription licenses have expires_at timestamp in UTC and lifetime licenses have null or far-future expires_at
  3. Grace period of 7-30 days after expiration keeps license valid during grace period
  4. Background job checks for expiring licenses daily and sends reminder emails (30, 14, 7, 3, 1 days before expiration)
  5. BullMQ worker processes license expiration checks daily with Redis queue management and retry logic with exponential backoff
**Plans:** 3/3 complete
- [x] 18-01-PLAN.md — Schema, state machine, expiry calculator, domain events, OrderCompletedHandler update
- [x] 18-02-PLAN.md — Validation API grace period update, email templates (3 templates)
- [x] 18-03-PLAN.md — BullMQ worker, admin subscription settings, module-init wiring, schema push
**Status:** ✅ Complete · Verified

### Phase 29: Portal & Analytics Enhancements
**Directory:** `19-portal-analytics`
**Goal:** Customer portal and admin dashboard are enhanced with license management UI, analytics dashboards for licenses and revenue, and a license transfer system.
**Depends on:** Phase 26, Phase 28
**Requirements:** ANLT-01–05, XFER-01–04, JOB-03
**Success Criteria:**
  1. Admin dashboard shows license analytics overview (total, active, expired, revoked counts) and revenue analytics (total revenue, MRR, ARR, trend indicators)
  2. Product performance metrics show sales by product and plan, and customer growth tracking displays daily/weekly/monthly signups
  3. Activation statistics show current activations, activation rate, and geographic distribution
  4. BullMQ worker handles analytics aggregation for dashboard with scheduled processing
  5. Customers can transfer license ownership to another account via transfer code and deactivate old domain to activate new domain (within transfer limits)
  6. Admin can configure maximum transfers per month per license and all transfer operations are logged in audit trail
**Plans:** 6/6 complete
- [x] 19-01-PLAN.md — Analytics data layer (schema, services, geo-IP, queue)
- [x] 19-02-PLAN.md — Analytics worker and transfer backend
- [x] 19-03-PLAN.md — Admin license analytics page (KPIs, charts, geo table)
- [x] 19-04-PLAN.md — Portal subscription, transfer UI, email templates
- [x] 19-05-PLAN.md — Gap closure: customer growth tracking (ANLT-04)
- [x] 19-06-PLAN.md — Gap closure: admin transfer settings UI (XFER-04)
**Status:** ✅ Complete · Verified

### Phase 30: Migration & External API Removal
**Directory:** `20-migration-cleanup`
**Goal:** All external central API dependencies are removed from the codebase, existing license data is migrated to local-only storage with standardized keys and API tokens, and FK constraints enforce referential integrity.
**Depends on:** Phase 29
**Requirements:** ARCH-07, ARCH-09, ARCH-10
**Success Criteria:**
  1. Migration CLI script includes dry-run mode, pg_dump backup, data verification counts, and phased execution
  2. Migration preserves all existing license data without loss; v2.x license keys regenerated to 5-segment CF-XXXX format, API tokens backfilled
  3. FK constraints convert orders.productId, licenses.productId, and licenses.plan from text fields to proper foreign key references in a single atomic PostgreSQL transaction
  4. Database fields centralOrderId, centralLicenseId, and centralUserId are removed from schema
  5. src/lib/central-api.ts file is removed and all imports/references are replaced with local Licensing Context services
**Plans:** 3/3 complete
- [x] 20-01-PLAN.md — Code cleanup: delete central-api.ts, remove all central field references
- [x] 20-02-PLAN.md — Migration script: key regeneration, API token backfill, FK validation, backup, logging
- [x] 20-03-PLAN.md — UI replacement: Local License Engine status card, env var cleanup
**Status:** ✅ Complete · Verified

### Phase 31: Backup & Restore System
**Directory:** `21-backup-restore`
**Goal:** Admin can create, schedule, and restore database backups entirely from the admin dashboard — with pg_dump-based backups, configurable retention/rotation, scheduled BullMQ jobs, and one-click restore.
**Depends on:** Phase 30
**Requirements:** BKUP-01–07
**Success Criteria:**
  1. Admin navigates to /admin/backup and sees a backup dashboard with list of all backups (timestamp, size, status), a "Create Backup" button, and backup schedule configuration
  2. Admin can trigger an immediate full database backup via pg_dump with progress indication and receives a success/failure notification
  3. Admin can download any backup file and delete individual backups from the history list
  4. Admin can restore the database from any backup file with a confirmation dialog, progress indication, and automatic pre-restore backup
  5. A BullMQ scheduled job automatically creates backups at configurable intervals (daily, weekly, monthly) with rotation policy (keep last N backups)
  6. Backup settings (frequency, retention count, storage path) are configurable from /admin/settings/backup
  7. Backup rotation automatically removes oldest backups when retention limit is exceeded, with audit log entries for all operations
**Plans:** 5/5 complete
- [x] 21-01-PLAN.md — Schema, BackupService, BackupRotation, schema push
- [x] 21-02-PLAN.md — BullMQ backup worker, RestoreOrchestrator, maintenance mode
- [x] 21-03-PLAN.md — Server actions, API routes, navigation integration
- [x] 21-04-PLAN.md — Backup dashboard UI (KPIs, table, restore dialog)
- [x] 21-05-PLAN.md — Backup settings UI, cloud storage form
**Status:** ✅ Complete · Verified

</details>

<details>
<summary><strong>M6 — v4.0 Multi-Platform License Server & SDK Distribution</strong> (Phases 32–38) · Planned</summary>

### Phase 32: Update Delivery System
**Milestone:** v4.0
**Goal:** Build update check and download endpoints so WordPress (and other) plugins can auto-update from ConversionFlow server. Add license status endpoint for full license info retrieval.
**Depends on:** Phase 31 (v3.0 complete)
**Success Criteria:**
  1. WordPress plugin checks for updates via /api/v1/update/check and receives update info in WordPress-compatible format
  2. Authenticated download endpoint /api/v1/update/download serves ZIP files only to valid license holders
  3. GET /api/v1/license/status returns full license info including all activations, tier, features, and expiry
  4. ZIP file storage and version management integrated with existing product_versions table
  5. Update check supports WordPress plugin info API format (slug, version, download_url, sections)
**Plans:** 4 plans
Plans:
- [x] 32-01-PLAN.md — Schema extensions, core services, and command handlers
- [x] 32-02-PLAN.md — Admin ZIP file upload, config, and UI forms
- [x] 32-03-PLAN.md — API routes and portal download integration
- [x] 32-04-PLAN.md — Portal token generation, schema push, build verification
**Status:** 🔲 Planned

### Phase 33: Feature Flags & Tier Enforcement
**Milestone:** v4.0
**Goal:** Add feature flag definitions per plan/tier with a platform dimension, so the validate endpoint returns what features are allowed per platform, enabling fine-grained access control across WordPress, Laravel, Shopify, and Next.js clients.
**Depends on:** Phase 32
**Success Criteria:**
  1. Feature flag definitions stored in product_plans (JSONB column or dedicated table)
  2. /api/v1/license/validate returns allowed features list in response
  3. Admin UI for managing features per plan per product
  4. Platform-specific feature sets (WP features differ from Laravel features)
  5. Customer portal shows available vs locked features for their tier
**Plans:** 4 plans
Plans:
- [x] 33-01-PLAN.md — Feature catalog, schema type change, and seed data migration
- [x] 33-02-PLAN.md — API handler updates: validate, status, and beta channel
- [x] 33-03-PLAN.md — Admin UI: checkbox grid and nested features validation
- [x] 33-04-PLAN.md — Customer portal feature checklist

### Phase 34: Multi-Gateway Payment System
**Milestone:** v4.0
**Goal:** Refactor payment into a dual-system model (Manual + Real automatic gateways). Extract SSL Commerz into adapter, add Paddle (Merchant of Record) for international payments, add bKash Tokenized Checkout API for automatic BD payments. Stripe deferred to post-v4.0.
**Depends on:** Phase 33
**Requirements:** PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06
**Success Criteria:**
  1. Payment settings UI reorganized into dual-system model: Manual (bKash, Nagad, Rocket, Bank) and Automatic (SSL Commerz, Paddle, bKash API)
  2. Paddle integration as Merchant of Record for international sales with tax handling (Stripe deferred)
  3. bKash automatic API gateway for BD customers
  4. Gateway abstraction layer — common IPaymentGateway interface for adding/replacing gateways
  5. Admin can enable/disable individual gateways from settings with Draft->Test->Live activation flow
  6. Customer checkout has currency toggle (BDT/USD) with gateway filtering
**Plans:** 5 plans
Plans:
- [x] 34-01-PLAN.md — Payments module, schema, gateway abstraction (IPaymentGateway, GatewayRegistry, PaymentService, crypto)
- [x] 34-02-PLAN.md — SSL Commerz adapter extraction (wraps existing ssl-commerz.ts, unified webhook route)
- [x] 34-03-PLAN.md — Paddle adapter (Billing API, hosted checkout, HMAC webhook verification, price sync)
- [x] 34-04-PLAN.md — bKash adapter (Tokenized Checkout v1.2.0-beta, Redis token caching, inline SDK)
- [x] 34-05-PLAN.md — Admin settings UI + checkout UX restructure (two-tab layout, gateway cards, currency toggle, success page)
**Status:** 🔲 Planned

### Phase 35: WordPress SDK
**Milestone:** v4.0
**Goal:** Build a PHP client library (conversionflow-sdk-php) that ships inside the WordPress plugin, handling license activation, validation, auto-updates, and domain management.
**Depends on:** Phase 32, Phase 33
**Success Criteria:**
  1. PHP SDK class with activate(), deactivate(), validate(), check_update() methods
  2. Auto-update integration hooks into WordPress native plugin update system
  3. Admin settings page helper (license key input, status display, activation management)
  4. Domain activation and verification helpers
  5. Composer package for distribution (conversionflow/sdk-php)
  6. Works on shared hosting, WP-CLI, and managed WordPress environments
**Plans:** 4 plans
Plans:
- [x] 32-01-PLAN.md — Schema extensions, core services, and command handlers
- [x] 32-02-PLAN.md — Admin ZIP file upload, config, and UI forms
- [x] 32-03-PLAN.md — API routes and portal download integration
- [x] 32-04-PLAN.md — Portal token generation, schema push, build verification
**Status:** 🔲 Planned

### Phase 36: Laravel SDK
**Milestone:** v4.0
**Goal:** Build a Laravel package (conversionflow/laravel) with ServiceProvider, Facade, middleware, and Artisan commands for license management in Laravel applications.
**Depends on:** Phase 35
**Success Criteria:**
  1. Laravel auto-discovery package with ServiceProvider and Facade
  2. License validation middleware for route protection
  3. Artisan commands: activate, deactivate, check, status
  4. Config and views publishable
  5. Caching layer (24h) to minimize API calls
**Plans:** 4 plans
Plans:
- [x] 32-01-PLAN.md — Schema extensions, core services, and command handlers
- [ ] 32-02-PLAN.md — Admin ZIP file upload, config, and UI forms
- [x] 32-03-PLAN.md — API routes and portal download integration
- [ ] 32-04-PLAN.md — Portal token generation, schema push, build verification
**Status:** 🔲 Planned

### Phase 37: Shopify App Integration
**Milestone:** v4.0
**Goal:** Build Shopify app integration with Shopify Billing API syncing to ConversionFlow licenses, App Bridge auth, and webhook handlers.
**Depends on:** Phase 36
**Success Criteria:**
  1. Shopify app scaffold with App Bridge authentication
  2. Shopify Billing API mapped to ConversionFlow license system
  3. Webhook handlers for install/uninstall/billing events
  4. Installation flow creates ConversionFlow license automatically
  5. License status syncs bidirectionally between Shopify and ConversionFlow
**Plans:** 4 plans
Plans:
- [ ] 32-01-PLAN.md — Schema extensions, core services, and command handlers
- [ ] 32-02-PLAN.md — Admin ZIP file upload, config, and UI forms
- [ ] 32-03-PLAN.md — API routes and portal download integration
- [ ] 32-04-PLAN.md — Portal token generation, schema push, build verification
**Status:** 🔲 Planned

### Phase 38: Next.js SDK & API Security
**Milestone:** v4.0
**Goal:** Build npm package (@conversionflow/license-sdk) for Next.js self-hosted deployments and harden all API endpoints with HMAC request signing and standardized API key auth. Package compatible with both npm and pnpm.
**Depends on:** Phase 37
**Success Criteria:**
  1. npm/pnpm package with useLicense() hook and proxy.ts (middleware) helpers for route protection
  2. All /api/v1/* endpoints secured with HMAC request signing
  3. Standardized API key authentication for SDK clients
  4. Rate limiting per platform (WP, Laravel, Shopify, Next.js)
  5. API key rotation support in admin dashboard
**Plans:** 4 plans
Plans:
- [ ] 32-01-PLAN.md — Schema extensions, core services, and command handlers
- [ ] 32-02-PLAN.md — Admin ZIP file upload, config, and UI forms
- [ ] 32-03-PLAN.md — API routes and portal download integration
- [ ] 32-04-PLAN.md — Portal token generation, schema push, build verification
**Status:** 🔲 Planned

</details>

---

## Dependency Chain

```
v1.0: 01 → 02 → 03 → 04
v1.1: 05 → 06 → 07 → 08 → 09 → 10
v2.0: 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18
v2.1: 19 → 20 → 21 → 22 → 23
v3.0: 24 → 25 → 26 → 27 → 28 → 29 → 30 → 31
            ↗         ↘       ↗
       24 → 25 → 26     28 → 29
                       ↗         ↘
                 24+25 → 27 → 28 → 29 → 30 → 31
v4.0: 32 → 33 → 34 (parallel gateways)
                ↙
           35 → 36 → 37 → 38
           (WP)  (Laravel) (Shopify) (Next.js+Security)
```

---

## Progress Summary

| Milestone | Phases | Total | Complete | Verified | Remaining |
|-----------|--------|-------|----------|----------|-----------|
| v1.0 Core Site | 01–04 | 4 | 4 | 0 | 0 |
| v1.1 Functional Site | 05–10 | 6 | 6 | 4 | 0 |
| v2.0 Dual Portal SaaS | 11–18 | 8 | 6 | 2 | 2 (planned + deferred) |
| v2.1 Marketing & SEO | 19–23 | 5 | 5 | 1 | 0 |
| v3.0 Licensing Architecture | 24–31 | 8 | 8 | 8 | 0 |
| v4.0 Multi-Platform License Server | 32–38 | 7 | 0 | 0 | 7 |
| **Total** | | **38** | **29** | **15** | **9** |

**Notes:**
- Phase 17 (Notification Engine): 4 plans created, ready for execution
- Phase 18 (Affiliate Network): Fully deferred to post-MVP
- v4.0 milestone context: `.planning/phases/32-v4-milestone/v4-MILESTONE-CONTEXT.md`

---
*Last updated: 2026-06-10*
