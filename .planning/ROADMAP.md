# Roadmap: ConversionFlow Platform

## Overview

Transform the ConversionFlow marketing website into a full SaaS platform with Customer Portal, Admin BI Dashboard, Marketing/SEO Settings, and a completely self-contained licensing architecture. v1.x built the marketing site. v2.0 added authentication, database, customer portal, checkout, admin BI, webhooks, and license intelligence. v2.1 added comprehensive SEO & Marketing settings. v3.0 refactors the platform into a self-contained licensing system with modular monolith architecture — managing all products, customers, licenses, subscriptions, activations, and analytics internally without external dependencies.

## Past Milestones (shipped, archived)

- **v1.0 Core Site** - Phases 1-4 (shipped 2026-05-11) -- archived in `.planning/phases/_archive-v1x/`
- **v1.1 Functional Site** - Phases 5-10 (shipped 2026-05-14) -- archived in `.planning/phases/_archive-v1x/`
- **v2.0 Dual Portal SaaS Platform** - Phases 1-8 (shipped 2026-05-19) -- archived in `.planning/phases/_archive-v2x/`
- **v2.1 Marketing & SEO Settings Dashboard** - Phases 9-13 (shipped 2026-05-30)

## Milestones

- **v1.0 Core Site** - Phases 1-4 (shipped 2026-05-11)
- **v1.1 Functional Site** - Phases 5-10 (shipped 2026-05-14)
- **v2.0 Dual Portal SaaS Platform** - Phases 1-8 (shipped 2026-05-19)
- **v2.1 Marketing & SEO Settings Dashboard** - Phases 9-13 (shipped 2026-05-30)
- **v3.0 Self-Contained Licensing Architecture** - Phases 14-20 (active)

## Current Milestone

- **v3.0 Self-Contained Licensing Architecture** - Phases 14-20

**Milestone Goal:** Refactor ConversionFlow into a completely self-contained licensing platform where all licensing, subscriptions, customers, products, activations, domains, orders, and analytics are managed directly within ConversionFlow — no external licensing dependencies. Build a modular monolith with Domain-Driven Design, Service Layer Pattern, Repository Pattern, and event-driven internal actions.

## Phases

<details>
<summary>v1.0 Core Site (Phases 1-4) -- SHIPPED 2026-05-11</summary>

- [x] **Phase 1: Foundation** -- Project scaffolding, core layout, responsiveness
- [x] **Phase 2: Homepage** -- Hero, trust bar, features, CTA, animations
- [x] **Phase 3: Content Pages** -- Features, Pricing, Changelog, Support
- [x] **Phase 4: SEO & Polish** -- Metadata, 404, performance, deployment config

</details>

<details>
<summary>v1.1 Functional Site (Phases 5-10) -- SHIPPED 2026-05-14</summary>

- [x] **Phase 5: Data Layer & Changelog** -- Extract content to data files, MDX changelog
- [x] **Phase 6: Interactivity** -- Currency toggle, contact form, count-up animations
- [x] **Phase 7: Blog & Documentation** -- MDX blog, documentation section
- [x] **Phase 8: Legal Pages & SEO** -- 4 legal pages, sitemap, robots, analytics
- [x] **Phase 9: Internationalization** -- Bengali i18n, language switcher, message files
- [x] **Phase 10: Polish & Refinement** -- Font fixes, responsive fixes, cursor, animations

</details>

<details>
<summary>v2.0 Dual Portal SaaS Platform (Phases 1-8) -- SHIPPED 2026-05-19</summary>

- [x] **Phase 1: Database, Auth, and Route Foundation** -- COMPLETE (4/4 plans)
- [x] **Phase 2: Dashboard Shell** -- VERIFIED (3/3 plans)
- [x] **Phase 3: Customer Portal** -- VERIFIED (5/5 plans)
- [x] **Phase 4: Checkout and Payments** -- EXECUTED (6/6 plans)
- [x] **Phase 5: Admin BI Dashboard** -- UAT gap closure (6/6 plans)
- [x] **Phase 6: Webhooks, Background Jobs, and License Intelligence** -- COMPLETE (4/4 plans)
- [x] **Phase 7: Multi-channel Notification Engine** -- Partial (3/5 plans)
- [ ] **Phase 8: Affiliate Network System** -- Deferred to post-MVP

</details>

<details>
<summary>v2.1 Marketing & SEO Settings Dashboard (Phases 9-13) -- SHIPPED 2026-05-30</summary>

- [x] **Phase 9: Settings Foundation** -- Settings sub-page navigation, category landing
- [x] **Phase 10: Core SEO Configuration** -- General SEO, verification, sitemaps, robots.txt
- [x] **Phase 11: Tracking Pixels & Social SEO** -- Meta/CAPI, TikTok, Google, Schema Markup
- [x] **Phase 12: Advanced SEO Controls** -- Redirects, AI SEO, Image SEO, Performance SEO
- [x] **Phase 13: SEO Analytics Dashboard** -- Analytics overview, rankings, 404 reports

</details>

### v3.0 Self-Contained Licensing Architecture (Phases 14-20)

**Milestone Goal:** Build a completely self-contained licensing platform with modular monolith architecture — managing all products, customers, licenses, subscriptions, activations, and analytics internally using Domain-Driven Design, Service Layer Pattern, Repository Pattern, and event-driven internal actions.

- [ ] **Phase 14: Shared DDD Infrastructure** -- Event bus, repository base, value objects, module structure
- [ ] **Phase 15: Products Bounded Context** -- Product management, versions, plans, licensing rules
- [ ] **Phase 16: Licensing Core (Generation & Validation)** -- License keys, validation API, activation service
- [ ] **Phase 17: Customer & Billing Integration** -- Checkout refactor, order events, subscription lifecycle
- [ ] **Phase 18: Subscription & Status Management** -- Expiry tracking, grace periods, renewal reminders
- [ ] **Phase 19: Portal & Analytics Enhancements** -- License management UI, analytics dashboard, transfer system
- [ ] **Phase 20: Migration & External API Removal** -- Data migration, feature flags, remove central API deps

## Phase Details

<details>
<summary>v2.0 Phase Details (Phases 1-8) -- ARCHIVED</summary>

### Phase 1: Database, Auth, and Route Foundation
**Goal**: The application has a working database, authentication system, and route architecture that isolates the dashboard from the marketing site.
**Depends on**: Nothing (first phase of v2.0 milestone)
**Requirements**: DB-01, DB-02, DB-03, DB-04, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, DASH-02, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. User can register a new account and verify their email address via a confirmation link
  2. User can log in with email/password and stay logged in across browser sessions
  3. User can reset their password via an email link and log in with the new password
  4. Admin users see the admin dashboard route; customer users see the customer portal route; unauthorized users are redirected to login
  5. Marketing site pages render identically to v1.x with no CSS or layout changes
**Plans**: 4/4 complete
**Status**: Complete 2026-05-16

### Phase 2: Dashboard Shell
**Goal**: Both the customer portal and admin dashboard have a complete layout shell with sidebar navigation, header, responsive backdrop, and unified theming.
**Depends on**: Phase 1
**Requirements**: DASH-01
**Success Criteria** (what must be TRUE):
  1. Customer portal displays a sidebar layout with navigation links to all portal sections
  2. Admin dashboard displays a sidebar layout with navigation links to all admin sections
  3. Sidebar collapses to a mobile-friendly hamburger menu on narrow viewports
  4. Dark/light theme toggle works consistently across marketing site and both dashboard layouts
  5. Dashboard CSS does not affect marketing site responsive breakpoints or design tokens
**Plans**: 3/3 complete
**Status**: Verified 2026-05-16

### Phase 3: Customer Portal
**Goal**: Customers can manage their ConversionFlow licenses, view billing history, download plugin files, submit support tickets, and manage notifications.
**Depends on**: Phase 2
**Requirements**: PORT-01, PORT-02, PORT-03, PORT-04, PORT-05, PORT-06
**Success Criteria** (what must be TRUE):
  1. Customer sees a dashboard overview with counts of active licenses, expiring soon, recent downloads, and open tickets
  2. Customer can view their license list, click into a license detail, copy the license key, and see activation domain status
  3. Customer can view invoices, payment history, and refund status in the billing section
  4. Customer can download the latest plugin version and access previous versions with changelogs
  5. Customer can create a support ticket, reply to existing tickets with attachments, and view ticket status
  6. Customer can view their notification list, mark notifications as read, and manage notification preferences
**Plans**: 5/5 complete
**Status**: Verified 2026-05-17

### Phase 4: Checkout and Payments
**Goal**: Customers can complete a purchase using Bangladesh payment methods or SSL Commerce gateway, with coupon codes, tax/VAT, and invoice generation synced with the central licensing API.
**Depends on**: Phase 3
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, LIC-01, LIC-02
**Success Criteria** (what must be TRUE):
  1. Customer can select a plan, choose a payment method, and initiate checkout
  2. SSL Commerce gateway redirects customer to payment page and back with order confirmation
  3. Manual BD payments create a pending order that admin can verify and confirm
  4. Customer can apply a coupon code and see the discounted price before payment
  5. Customer receives an invoice after successful payment
  6. Successful payment triggers a POST to license.devsroom.com and stores mappings locally
**Plans**: 6/6 complete
**Status**: Executed 2026-05-17

### Phase 5: Admin BI Dashboard
**Goal**: Admin operators can view real-time business intelligence with revenue KPIs, adaptive charts, invoice management, user management, activity feeds, and CSV export.
**Depends on**: Phase 4
**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09, ADMN-10
**Success Criteria** (what must be TRUE):
  1. Admin sees an executive overview with total revenue, MRR, active customers, and trend indicators
  2. Admin can view an adaptive revenue chart with a preset date range selector
  3. Admin can list and filter invoices by status, mark invoices as paid, and send payment reminders
  4. Admin can list users, view user details, assign roles, and ban/activate accounts
  5. Admin can export any data table as CSV
  6. Admin sees an activity feed and receives admin-scoped notifications
**Plans**: 6/6 complete
**Status**: Complete 2026-05-18

### Phase 6: Webhooks, Background Jobs, and License Intelligence
**Goal**: The platform reliably syncs with the central licensing API via webhooks and scheduled fallback jobs. Admins can monitor license health and detect piracy patterns.
**Depends on**: Phase 4
**Requirements**: LIC-03, LIC-04, LIC-05, LINT-01, LINT-02, LINT-03
**Success Criteria** (what must be TRUE):
  1. Webhook handlers receive and process license events with HMAC signature verification
  2. A scheduled job syncs license data every 15 minutes as a fallback
  3. Admin can view a license intelligence dashboard with counts and renewal rates
  4. Admin can see domain tracking details for each license
  5. Suspicious activation patterns are flagged for admin review
**Plans**: 4/4 complete
**Status**: Complete 2026-05-19

### Phase 7: Multi-channel Notification Engine
**Goal**: Build a unified notification engine delivering messages across email, in-app, and WhatsApp channels.
**Depends on**: Phase 6
**Requirements**: NOTIF-01, NOTIF-02, NOTIF-03, NOTIF-04, NOTIF-05, NOTIF-06, NOTIF-07
**Success Criteria** (what must be TRUE):
  1. Core notification service routes events to correct channels based on event type and user preferences
  2. Email channel sends HTML emails via generic SMTP with configurable templates
  3. In-app notification bell shows unread count badge and dropdown with notification list
  4. WhatsApp channel sends concise BD-formatted messages
  5. Event catalog covers all trigger events
  6. Admin can manage notification templates and view delivery logs
  7. Users can manage per-channel notification preferences
**Plans**: 3/5 partial
**Status**: Deferred to post-MVP

### Phase 8: Affiliate Network System
**Goal**: Build a full affiliate marketing system with referral links, click tracking, commission calculation, and payout management.
**Depends on**: Phase 7
**Requirements**: AFF-01, AFF-02, AFF-03, AFF-04, AFF-05, AFF-06, AFF-07, AFF-08
**Success Criteria** (what must be TRUE):
  1. Customers can apply to become affiliates; admin can approve, reject, or suspend
  2. Each affiliate gets a unique referral code with 30-day cookie
  3. Click tracking records every referral link visit
  4. Commission is auto-calculated on completed referred purchases
  5. Affiliate dashboard shows clicks, conversions, earnings, and payout history
  6. Affiliates can request payouts; admin processes them
  7. Admin can manage affiliates and set commission rates
  8. DB schema supports affiliates, clicks, commissions, payouts tables linked to users and orders
**Plans**: TBD
**Status**: Deferred to post-MVP

</details>

<details>
<summary>v2.1 Phase Details (Phases 9-13) -- ARCHIVED</summary>

### Phase 9: Settings Foundation
**Goal**: The admin settings page is restructured from a flat form stack into a sub-page navigation system with category landing page, dedicated sub-routes for Payment/SMTP/SEO, and migrated existing forms -- providing the foundation all SEO settings pages depend on.
**Depends on**: v2.0 Phases 1-6 (complete)
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05
**Success Criteria** (what must be TRUE):
  1. Admin navigates to /admin/settings and sees a landing page with category cards linking to Payment Gateway, SMTP/Email, and SEO Settings
  2. Admin clicks into /admin/settings/payment, /admin/settings/smtp, or /admin/settings/seo and sees the respective existing forms functioning identically to their previous flat-page versions
  3. Admin navigates SEO sub-routes and sees a consistent sidebar or tabbed layout across all SEO sections
  4. Admin can toggle between settings categories without losing unsaved form state within the same category
  5. Settings navigation appears in the admin sidebar with correct active-state highlighting for the current sub-route
**Plans**: 3/3 complete
**Status**: Complete 2026-05-25

### Phase 10: Core SEO Configuration
**Goal**: Admin can configure all fundamental SEO settings -- site-wide meta configuration with SERP preview, search engine verification with status indicators, XML sitemap management with content type controls, and robots.txt editing with visual and raw editors.
**Depends on**: Phase 9
**Requirements**: GSEO-01, GSEO-02, GSEO-03, GSEO-04, GSEO-05, GSEO-06, GSEO-07, VERF-01, VERF-02, VERF-03, VERF-04, VERF-05, SITM-01, SITM-02, SITM-03, SITM-04, SITM-05, ROBT-01, ROBT-02, ROBT-03, ROBT-04, ROBT-05
**Success Criteria** (what must be TRUE):
  1. Admin can configure website title, meta title, meta description, keywords, canonical URL, robots meta, separator, and OG image -- and sees a real-time SERP preview snippet with character count indicators and an SEO completeness score
  2. Admin can toggle URL formatting options (lowercase, trailing slash) and auto meta generation, with changes persisted to the settings table
  3. Admin can enter Google Search Console, Bing, Yandex, Baidu, and Pinterest verification codes and see connected/disconnected status indicators for each engine
  4. Admin can enable/disable XML sitemap generation, toggle individual sitemap types (product, blog, image), trigger manual regeneration, and see the sitemap URL and last-generated timestamp
  5. Admin can edit robots.txt using both a visual rule builder and a raw code editor, toggle AI bot access controls, apply crawl presets, and see a live preview of the generated robots.txt content
**Plans**: 5/5 complete
**Status**: Complete 2026-05-26

### Phase 11: Tracking Pixels & Social SEO
**Goal**: Admin can configure all tracking integrations (Meta Pixel/CAPI, TikTok, Google Analytics/Ads/GTM), social sharing defaults (Open Graph for Facebook, Twitter/X, LinkedIn) with preview simulators, and schema markup (Organization, Product, Article, FAQ, HowTo, Review) with JSON-LD preview and validation.
**Depends on**: Phase 9
**Requirements**: SOCL-01, SOCL-02, SOCL-03, SOCL-04, SOCL-05, META-01, META-02, META-03, META-04, META-05, META-06, TIKT-01, TIKT-02, TIKT-03, GOOG-01, GOOG-02, GOOG-03, GOOG-04, GOOG-05, SCHM-01, SCHM-02, SCHM-03, SCHM-04, SCHM-05
**Success Criteria** (what must be TRUE):
  1. Admin can configure Facebook App ID, share title/description/image, Twitter/X handle and card type, and LinkedIn share image -- and sees a social share preview simulator for all three platforms with mobile/desktop toggle
  2. Admin can configure Meta Pixel ID, CAPI token, Dataset ID, Test Event Code, toggle Advanced Matching and Event Deduplication, select standard events to track, and see connection status and recent event logs
  3. Admin can configure TikTok Pixel ID, Events API token, toggle Advanced Matching and server-side tracking, and see tracking status and event logs
  4. Admin can configure GA4 Measurement Id, Google Ads Conversion ID/Label, GTM Container ID, toggle server-side tracking and enhanced ecommerce, and see connection status with a connection tester
  5. Admin can configure global schema (Organization, Website, Breadcrumb) and content schemas (Product, Article, FAQ, HowTo, Review), see a JSON-LD preview, validate against Google requirements, and toggle auto schema generation
**Plans**: 5/5 complete
**Status**: Complete 2026-05-27

### Phase 12: Advanced SEO Controls
**Goal**: Admin can manage URL redirects with bulk operations, control AI crawler access and generate llms.txt, configure image SEO automation, tune performance SEO settings with Core Web Vitals monitoring, and set page-level SEO overrides for individual content items.
**Depends on**: Phase 10
**Requirements**: RDIR-01, RDIR-02, RDIR-03, RDIR-04, RDIR-05, AISE-01, AISE-02, AISE-03, AISE-04, AISE-05, IMGS-01, IMGS-02, IMGS-03, IMGS-04, IMGS-05, PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PLVL-01, PLVL-02, PLVL-03, PLVL-04, PLVL-05
**Success Criteria** (what must be TRUE):
  1. Admin can create 301/302 and regex-based redirects, view them in a searchable/filterable table with hit counter, bulk import/export via CSV, and delete individually or in bulk
  2. Admin can allow or block individual AI crawlers (GPTBot, ClaudeBot, PerplexityBot), generate an llms.txt file, and configure AI content usage rules
  3. Admin can toggle auto ALT text, WebP conversion, lazy loading, and image compression -- and sees image performance statistics (total images, optimized count, savings)
  4. Admin can toggle Critical CSS, JS defer, HTML/CSS minification, configure CDN URL and cache settings -- and sees Core Web Vitals monitor cards (LCP, CLS, INP, TTFB, overall score)
  5. Admin can set per-page SEO overrides (title, meta description, canonical URL, focus keyword, robots control, custom OG image, schema type selector) for each page and blog post
**Plans**: 5/5 complete
**Status**: Complete 2026-05-28

### Phase 13: SEO Analytics Dashboard
**Goal**: Admin sees a comprehensive SEO analytics dashboard displaying indexed pages, top performing pages, keyword rankings, CTR/impressions with charts, 404 error reports, sitemap health, and crawl issues -- providing visibility into the impact of all configured SEO settings.
**Depends on**: Phase 10, Phase 11
**Requirements**: ANLT-01, ANLT-02, ANLT-03, ANLT-04, ANLT-05, ANLT-06, ANLT-07
**Success Criteria** (what must be TRUE):
  1. Admin sees an SEO analytics overview with indexed pages count and trend indicator, and top performing pages ranked by organic traffic metrics
  2. Admin sees keyword rankings with position tracking and trend indicators (up/down/flat arrows)
  3. Admin sees CTR and impressions data displayed as trend charts over configurable time ranges
  4. Admin sees 404 error and broken link reports in a searchable table with affected URLs, referral sources, and occurrence counts
  5. Admin sees sitemap health status and crawl issue reports with actionable status badges
**Plans**: 3/3 complete
**Status**: Complete 2026-05-30

</details>

### v3.0 Phase Details (Phases 14-20)

### Phase 14: Shared DDD Infrastructure
**Directory**: `14-ddd-infrastructure`
**Goal**: The codebase is reorganized into a modular monolith structure with Domain-Driven Design bounded contexts, and the foundational infrastructure (event bus, repository base, value objects) is in place for all domain modules.
**Depends on**: v2.1 Phases 9-13 (complete)
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05
**Success Criteria** (what must be TRUE):
  1. Codebase is organized into `src/modules/` with bounded contexts (licensing, billing, customers, products, analytics) and `src/shared/` for common infrastructure
  2. Event bus implements EventEmitter for in-process events and Redis Pub/Sub for cross-process events, with a unified publish/subscribe interface
  3. Repository base classes and interfaces provide CRUD operations, transaction support, and query building for all bounded contexts
  4. Shared value objects (LicenseKey, Money, Email, Domain) implement validation, equality, and serialization logic
  5. Module boundaries are enforced via import rules and dependency direction (customers → products is allowed, products → customers is not)
**Plans**: 4 plans (14-01, 14-02, 14-03, 14-04)
Plans:
- [x] 14-01-PLAN.md — Module structure and TypeScript path aliases
- [x] 14-02-PLAN.md — Event bus implementation (EventEmitter + Redis Pub/Sub)
- [x] 14-03-PLAN.md — Repository base classes and interfaces
- [x] 14-04-PLAN.md — Shared value objects (LicenseKey, Money, Email, Domain)

### Phase 15: Products Bounded Context
**Directory**: `15-products-context`
**Goal**: Admin can create and manage products with versions and plans, defining pricing, activation limits, licensing rules, and feature flags — serving as the foundation for license generation.
**Depends on**: Phase 14
**Requirements**: PROD-01, PROD-02, PROD-03, PROD-04, PROD-05, PROD-06, PROD-07
**Success Criteria** (what must be TRUE):
  1. Admin can create products with name, slug, description, and current version via admin dashboard UI
  2. Admin can manage product versions with download URLs and changelogs, and mark versions as released or beta
  3. Admin can create plans for each product with pricing (BDT, USD), activation limits (1, 3, 5, unlimited), and feature flags
  4. Plans support both lifetime licenses (no expiration) and subscription licenses (duration-based with billing cycle)
  5. Product and plan data is persisted in database and accessible via admin dashboard UI with edit/delete operations
**Plans**: TBD
**UI hint**: yes

### Phase 16: Licensing Core (Generation & Validation)
**Directory**: `16-licensing-core`
**Goal**: The platform generates unique, secure license keys locally and provides a public API for validation, activation, and deactivation — completely replacing external licensing dependency.
**Depends on**: Phase 14, Phase 15
**Requirements**: LGEN-01, LGEN-02, LGEN-03, LGEN-04, LGEN-05, LGEN-06, LGEN-07, LGEN-08, LGEN-09, ACT-01, ACT-02, ACT-03, ACT-04, ACT-05, ACT-06, ACT-07, ACT-08, API-01, API-02, API-03, API-04, API-05
**Success Criteria** (what must be TRUE):
  1. System generates unique license keys using crypto.randomBytes() (25-32 chars, segmented format, case-insensitive, no ambiguous characters)
  2. License keys have UNIQUE database constraint and generation is entirely local with no external API calls
  3. Public API endpoint /api/v1/license/validate validates license keys and returns status, expiry, plan details with Redis caching (5-15 min TTL)
  4. Public API endpoints /api/v1/license/activate and /api/v1/license/deactivate bind/unbind domains to licenses after domain verification (DNS TXT, file upload, or meta tag)
  5. Domain normalization strips protocol (https://), www prefix, and trailing slashes before activation
  6. Activation limit enforcement uses atomic database operations to prevent race conditions and rejects activation if limit reached
  7. Validation API has rate limiting (100 requests/minute per IP) and returns identical error for all failures (no information leakage)
  8. Customers can view and manage their active domains in customer portal, and admin can view activation history and detect suspicious patterns
**Plans**: TBD
**UI hint**: yes

### Phase 17: Customer & Billing Integration
**Directory**: `17-billing-integration`
**Goal**: Checkout and billing processes are refactored into the Billing Bounded Context, generating licenses locally via domain events when orders complete — removing centralOrderId dependency.
**Depends on**: Phase 15, Phase 16
**Requirements**: LSTAT-05, LSTAT-06, ARCH-06, ARCH-08
**Success Criteria** (what must be TRUE):
  1. Checkout actions are refactored into Billing Context services with OrderCompleted event triggering license generation
  2. Order lifecycle management creates orders, processes payments, generates invoices, and triggers OrderCompleted event
  3. License generation is triggered by OrderCompleted domain event instead of external webhook
  4. License status changes (revoke, suspend) trigger audit log entries and customer notifications via domain events
  5. Webhook handlers for central license API events are removed and replaced with local event handlers
**Plans**: TBD
**UI hint**: yes

### Phase 18: Subscription & Status Management
**Directory**: `18-subscription-status`
**Goal**: The platform manages subscription lifecycle with expiration tracking, grace periods, renewal processing, and lifetime license support — ensuring continuous license validity.
**Depends on**: Phase 17
**Requirements**: LSTAT-01, LSTAT-02, LSTAT-03, LSTAT-04, LSTAT-07, JOB-01, JOB-02, JOB-04
**Success Criteria** (what must be TRUE):
  1. License status supports: active, expired, revoked, suspended, grace_period with state transitions enforced
  2. Subscription licenses have expires_at timestamp in UTC and lifetime licenses have null or far-future expires_at
  3. Grace period of 7-30 days after expiration keeps license valid during grace period
  4. Background job checks for expiring licenses daily and sends reminder emails (30, 14, 7, 3, 1 days before expiration)
  5. BullMQ worker processes license expiration checks daily with Redis queue management and retry logic with exponential backoff
**Plans**: TBD

### Phase 19: Portal & Analytics Enhancements
**Directory**: `19-portal-analytics`
**Goal**: Customer portal and admin dashboard are enhanced with license management UI, analytics dashboards for licenses and revenue, and a license transfer system.
**Depends on**: Phase 16, Phase 18
**Requirements**: ANLT-01, ANLT-02, ANLT-03, ANLT-04, ANLT-05, XFER-01, XFER-02, XFER-03, XFER-04, JOB-03
**Success Criteria** (what must be TRUE):
  1. Admin dashboard shows license analytics overview (total, active, expired, revoked counts) and revenue analytics (total revenue, MRR, ARR, trend indicators)
  2. Product performance metrics show sales by product and plan, and customer growth tracking displays daily/weekly/monthly signups
  3. Activation statistics show current activations, activation rate, and geographic distribution
  4. BullMQ worker handles analytics aggregation for dashboard with scheduled processing
  5. Customers can transfer license ownership to another account via transfer code and deactivate old domain to activate new domain (within transfer limits)
  6. Admin can configure maximum transfers per month per license and all transfer operations are logged in audit trail with timestamp and actor
**Plans**: TBD
**UI hint**: yes

### Phase 20: Migration & External API Removal
**Directory**: `20-migration-cleanup`
**Goal**: All existing license data is migrated from external API to local storage, feature flags control gradual rollout, and central API dependencies are completely removed.
**Depends on**: Phase 19
**Requirements**: ARCH-07, ARCH-09, ARCH-10
**Success Criteria** (what must be TRUE):
  1. Data migration strategy includes verification (counts match between source and target), rollback plan, and gradual feature flag rollout (10% -> 25% -> 50% -> 100%)
  2. Migration preserves all existing license data without loss and creates mapping table for central_id to local_id references
  3. Feature flag system controls traffic migration between old and new license generation systems
  4. Database fields centralOrderId, centralLicenseId, and centralUserId are removed from schema
  5. src/lib/central-api.ts file is removed and all imports/references are replaced with local Licensing Context services
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order within each milestone.
v1.0: 1 -> 2 -> 3 -> 4
v1.1: 5 -> 6 -> 7 -> 8 -> 9 -> 10
v2.0: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8
v2.1: 9 -> 10 -> 11 -> 12 -> 13
v3.0: 14 -> 15 -> 16 -> 17 -> 18 -> 19 -> 20

(Phase 14 depends on v2.1 Phases 9-13. Phase 15 depends on Phase 14. Phase 16 depends on Phase 14, 15. Phase 17 depends on Phase 15, 16. Phase 18 depends on Phase 17. Phase 19 depends on Phase 16, 18. Phase 20 depends on Phase 19.)

| Phase | Directory | Milestone | Plans Complete | Status | Completed |
|-------|-----------|-----------|----------------|--------|-----------|
| 1-4 | v1.0 | v1.0 | - | Complete | 2026-05-11 |
| 5-10 | v1.1 | v1.1 | - | Complete | 2026-05-14 |
| 1-8 | v2.0 | v2.0 | - | Complete | 2026-05-19 |
| 9-13 | v2.1 | v2.1 | - | Complete | 2026-05-30 |
| 14. Shared DDD Infrastructure | 14-ddd-infrastructure | v3.0 | 0/TBD | Not started | - |
| 15. Products Bounded Context | 15-products-context | v3.0 | 0/TBD | Not started | - |
| 16. Licensing Core | 16-licensing-core | v3.0 | 0/TBD | Not started | - |
| 17. Customer & Billing Integration | 17-billing-integration | v3.0 | 0/TBD | Not started | - |
| 18. Subscription & Status Management | 18-subscription-status | v3.0 | 0/TBD | Not started | - |
| 19. Portal & Analytics Enhancements | 19-portal-analytics | v3.0 | 0/TBD | Not started | - |
| 20. Migration & External API Removal | 20-migration-cleanup | v3.0 | 0/TBD | Not started | - |

---
*Last updated: 2026-05-30*
