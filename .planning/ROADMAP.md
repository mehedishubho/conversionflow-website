# Roadmap: ConversionFlow Platform

## Overview

Transform the ConversionFlow marketing website into a full SaaS platform with Customer Portal, Admin BI Dashboard, and Marketing/SEO Settings. v1.x built the marketing site. v2.0 added authentication, database, customer portal, checkout, admin BI, webhooks, and license intelligence. v2.1 adds a comprehensive SEO & Marketing settings module with sub-page navigation, technical SEO configuration, tracking pixels, schema markup, AI crawler controls, redirect management, image/performance SEO, page-level SEO, and an analytics dashboard.

## Past Milestones (shipped, archived)

- **v1.0 Core Site** - Phases 1-4 (shipped 2026-05-11) -- archived in `.planning/phases/_archive-v1x/`
- **v1.1 Functional Site** - Phases 5-10 (shipped 2026-05-14) -- archived in `.planning/phases/_archive-v1x/`

## Milestones

- **v1.0 Core Site** - Phases 1-4 (shipped 2026-05-11)
- **v1.1 Functional Site** - Phases 5-10 (shipped 2026-05-14)
- **v2.0 Dual Portal SaaS Platform** - Phases 1-8 (6 complete, 2 planned)
- **v2.1 Marketing & SEO Settings Dashboard** - Phases 9-13 (planned)

## Current Milestone

- **v2.1 Marketing & SEO Settings Dashboard** - Phases 9-13

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
<summary>v2.0 Dual Portal SaaS Platform (Phases 1-8) -- IN PROGRESS</summary>

- [x] **Phase 1: Database, Auth, and Route Foundation** -- COMPLETE (4/4 plans)
- [x] **Phase 2: Dashboard Shell** -- VERIFIED (3/3 plans)
- [x] **Phase 3: Customer Portal** -- VERIFIED (5/5 plans)
- [x] **Phase 4: Checkout and Payments** -- EXECUTED (6/6 plans)
- [x] **Phase 5: Admin BI Dashboard** -- UAT gap closure (6/6 plans)
- [x] **Phase 6: Webhooks, Background Jobs, and License Intelligence** -- COMPLETE (4/4 plans)
- [ ] **Phase 7: Multi-channel Notification Engine** -- Planned (5 plans)
- [ ] **Phase 8: Affiliate Network System** -- Planned

</details>

### v2.1 Marketing & SEO Settings Dashboard (Phases 9-13)

**Milestone Goal:** Build a complete SEO & Marketing settings module in the admin dashboard with sub-page navigation, restructuring the flat settings page into a premium configuration system covering technical SEO, social metadata, tracking pixels, schema markup, AI crawler controls, redirect management, image/performance SEO, page-level SEO overrides, and an analytics dashboard.

- [x] **Phase 9: Settings Foundation** -- Restructure settings navigation, create sub-routes, migrate existing forms
- [ ] **Phase 10: Core SEO Configuration** -- General SEO, search verification, sitemaps, robots.txt
- [ ] **Phase 11: Tracking Pixels & Social SEO** -- Open Graph, Meta Pixel/CAPI, TikTok, Google Analytics/Ads, Schema Markup
- [ ] **Phase 12: Advanced SEO Controls** -- Redirect Manager, AI SEO, Image SEO, Performance SEO, Page-Level SEO
- [ ] **Phase 13: SEO Analytics Dashboard** -- Analytics overview, keyword rankings, 404 reports, crawl issues

## Phase Details

<details>
<summary>v2.0 Phase Details (Phases 1-8)</summary>

### Phase 1: Database, Auth, and Route Foundation
**Directory**: `01-foundation`
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

### Phase 2: Dashboard Shell
**Directory**: `02-homepage`
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
**UI hint**: yes

### Phase 3: Customer Portal
**Directory**: `03-customer-portal`
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
**UI hint**: yes

### Phase 4: Checkout and Payments
**Directory**: `04-checkout-payments`
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
**UI hint**: yes

### Phase 5: Admin BI Dashboard
**Directory**: `05-admin-dashboard`
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
**UI hint**: yes

### Phase 6: Webhooks, Background Jobs, and License Intelligence
**Directory**: `06-webhooks-jobs`
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
**UI hint**: yes

### Phase 7: Multi-channel Notification Engine
**Directory**: `07-notification-engine`
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
**Plans**: 5 plans (partial execution)
**UI hint**: yes

### Phase 8: Affiliate Network System
**Directory**: `08-affiliate-network`
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
**UI hint**: yes

</details>

### Phase 9: Settings Foundation
**Directory**: `09-settings-foundation`
**Goal**: The admin settings page is restructured from a flat form stack into a sub-page navigation system with category landing page, dedicated sub-routes for Payment/SMTP/SEO, and migrated existing forms -- providing the foundation all SEO settings pages depend on.
**Depends on**: v2.0 Phases 1-6 (complete)
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05
**Success Criteria** (what must be TRUE):
  1. Admin navigates to /admin/settings and sees a landing page with category cards linking to Payment Gateway, SMTP/Email, and SEO Settings
  2. Admin clicks into /admin/settings/payment, /admin/settings/smtp, or /admin/settings/seo and sees the respective existing forms functioning identically to their previous flat-page versions
  3. Admin navigates SEO sub-routes (e.g., /admin/settings/seo/general, /admin/settings/seo/verification) and sees a consistent sidebar or tabbed layout across all SEO sections
  4. Admin can toggle between settings categories without losing unsaved form state within the same category
  5. Settings navigation appears in the admin sidebar with correct active-state highlighting for the current sub-route
**Plans**: 3 plans

Plans:
- [ ] 09-01: Settings route structure -- sub-page layout component, category landing page with cards, route files for /settings/payment, /settings/smtp, /settings/seo
- [ ] 09-02: Migrate existing forms -- move PaymentSettingsForm, EmailProviderSettings, TrackingSettingsForm to sub-routes, update imports, remove flat settings page
- [ ] 09-03: SEO sub-navigation -- sidebar/tab layout for SEO sections, route files for all SEO sub-routes, admin nav update, settings landing page SEO card

**UI hint**: yes

### Phase 10: Core SEO Configuration
**Directory**: `10-core-seo`
**Goal**: Admin can configure all fundamental SEO settings -- site-wide meta configuration with SERP preview, search engine verification with status indicators, XML sitemap management with content type controls, and robots.txt editing with visual and raw editors.
**Depends on**: Phase 9
**Requirements**: GSEO-01, GSEO-02, GSEO-03, GSEO-04, GSEO-05, GSEO-06, GSEO-07, VERF-01, VERF-02, VERF-03, VERF-04, VERF-05, SITM-01, SITM-02, SITM-03, SITM-04, SITM-05, ROBT-01, ROBT-02, ROBT-03, ROBT-04, ROBT-05
**Success Criteria** (what must be TRUE):
  1. Admin can configure website title, meta title, meta description, keywords, canonical URL, robots meta, separator, and OG image -- and sees a real-time SERP preview snippet with character count indicators and an SEO completeness score
  2. Admin can toggle URL formatting options (lowercase, trailing slash) and auto meta generation, with changes persisted to the settings table
  3. Admin can enter Google Search Console, Bing, Yandex, Baidu, and Pinterest verification codes and see connected/disconnected status indicators for each engine
  4. Admin can enable/disable XML sitemap generation, toggle individual sitemap types (product, blog, image), trigger manual regeneration, and see the sitemap URL and last-generated timestamp
  5. Admin can edit robots.txt using both a visual rule builder and a raw code editor, toggle AI bot access controls, apply crawl presets, and see a live preview of the generated robots.txt content
**Plans**: 5 plans

Plans:
- [x] 10-01: SEO server actions foundation -- admin-seo.ts with get/save/score for all 22 settings keys, seo.ts DB integration with hardcoded fallback
- [x] 10-02: General SEO form -- GeneralSeoForm, SerpPreview (Google snippet), SeoScore (progress bar), character counters, toggle switches
- [x] 10-03: Verification + Sitemaps -- VerificationForm with status dots and copy buttons, SitemapForm with content type toggles, dynamic sitemap.ts
- [x] 10-04: Robots.txt editor -- dual-mode visual/raw editor, AiBotCards (8 bots), crawl presets, live preview, dynamic robots.ts
- [x] 10-05: Gap closure -- last-generated timestamp (SITM-04), search engine ping (SITM-05), raw editor syntax highlighting (ROBT-02)

**UI hint**: yes

### Phase 11: Tracking Pixels & Social SEO
**Directory**: `11-tracking-social`
**Goal**: Admin can configure all tracking integrations (Meta Pixel/CAPI, TikTok, Google Analytics/Ads/GTM), social sharing defaults (Open Graph for Facebook, Twitter/X, LinkedIn) with preview simulators, and schema markup (Organization, Product, Article, FAQ, HowTo, Review) with JSON-LD preview and validation.
**Depends on**: Phase 9
**Requirements**: SOCL-01, SOCL-02, SOCL-03, SOCL-04, SOCL-05, META-01, META-02, META-03, META-04, META-05, META-06, TIKT-01, TIKT-02, TIKT-03, GOOG-01, GOOG-02, GOOG-03, GOOG-04, GOOG-05, SCHM-01, SCHM-02, SCHM-03, SCHM-04, SCHM-05
**Success Criteria** (what must be TRUE):
  1. Admin can configure Facebook App ID, share title/description/image, Twitter/X handle and card type, and LinkedIn share image -- and sees a social share preview simulator for all three platforms with mobile/desktop toggle
  2. Admin can configure Meta Pixel ID, CAPI token, Dataset ID, Test Event Code, toggle Advanced Matching and Event Deduplication, select standard events to track, and see connection status and recent event logs
  3. Admin can configure TikTok Pixel ID, Events API token, toggle Advanced Matching and server-side tracking, and see tracking status and event logs
  4. Admin can configure GA4 Measurement Id, Google Ads Conversion ID/Label, GTM Container ID, toggle server-side tracking and enhanced ecommerce, and see connection status with a connection tester
  5. Admin can configure global schema (Organization, Website, Breadcrumb) and content schemas (Product, Article, FAQ, HowTo, Review), see a JSON-LD preview, validate against Google requirements, and toggle auto schema generation
**Plans**: 5 plans

Plans:
- [ ] 11-01: Open Graph & Social SEO -- social settings form, preview simulator component (Facebook/Twitter/LinkedIn cards), mobile/desktop toggle, server actions
- [ ] 11-02: Meta Pixel & CAPI -- Meta settings form, event selector checkboxes, connection status badge, event log table, server actions
- [ ] 11-03: TikTok tracking -- TikTok settings form, Advanced Matching toggle, status indicator, event log display, server actions
- [ ] 11-04: Google Analytics & Ads -- Google settings form, GA4/Ads/GTM fields, server-side and enhanced ecommerce toggles, connection tester, summary cards
- [ ] 11-05: Schema Markup -- schema settings form (global + content schemas), JSON-LD preview panel, Google validation link, auto-generation toggle, server actions

**UI hint**: yes

### Phase 12: Advanced SEO Controls
**Directory**: `12-advanced-seo`
**Goal**: Admin can manage URL redirects with bulk operations, control AI crawler access and generate llms.txt, configure image SEO automation, tune performance SEO settings with Core Web Vitals monitoring, and set page-level SEO overrides for individual content items.
**Depends on**: Phase 10
**Requirements**: RDIR-01, RDIR-02, RDIR-03, RDIR-04, RDIR-05, AISE-01, AISE-02, AISE-03, AISE-04, AISE-05, IMGS-01, IMGS-02, IMGS-03, IMGS-04, IMGS-05, PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PLVL-01, PLVL-02, PLVL-03, PLVL-04, PLVL-05
**Success Criteria** (what must be TRUE):
  1. Admin can create 301/302 and regex-based redirects, view them in a searchable/filterable table with hit counter, bulk import/export via CSV, and delete individually or in bulk
  2. Admin can allow or block individual AI crawlers (GPTBot, ClaudeBot, PerplexityBot), generate an llms.txt file, and configure AI content usage rules
  3. Admin can toggle auto ALT text, WebP conversion, lazy loading, and image compression -- and sees image performance statistics (total images, optimized count, savings)
  4. Admin can toggle Critical CSS, JS defer, HTML/CSS minification, configure CDN URL and cache settings -- and sees Core Web Vitals monitor cards (LCP, CLS, INP, TTFB, overall score)
  5. Admin can set per-page SEO overrides (title, meta description, canonical URL, focus keyword with density analysis, robots control, custom OG image, schema type selector, social preview) for each page, product, and blog post
**Plans**: 5 plans

Plans:
- [ ] 12-01: Redirect Manager -- redirect table component, create/edit modal (301/302/regex), search/filter, hit counter, bulk CSV import/export, delete actions
- [ ] 12-02: AI SEO & LLM Controls -- AI crawler toggle cards, llms.txt generation preview, content usage rules form, server actions
- [ ] 12-03: Image SEO -- toggle form (auto ALT, WebP, lazy loading, compression), image statistics cards, server actions
- [ ] 12-04: Performance SEO -- toggle form (Critical CSS, JS defer, minification), CDN URL input, cache settings, Core Web Vitals monitor cards, server actions
- [ ] 12-05: Page-Level SEO -- per-content-item SEO override form, focus keyword with density analysis, robots control, OG image override, schema selector, social preview

**UI hint**: yes

### Phase 13: SEO Analytics Dashboard
**Directory**: `13-seo-analytics`
**Goal**: Admin sees a comprehensive SEO analytics dashboard displaying indexed pages, top performing pages, keyword rankings, CTR/impressions with charts, 404 error reports, sitemap health, and crawl issues -- providing visibility into the impact of all configured SEO settings.
**Depends on**: Phase 10, Phase 11
**Requirements**: ANLT-01, ANLT-02, ANLT-03, ANLT-04, ANLT-05, ANLT-06, ANLT-07
**Success Criteria** (what must be TRUE):
  1. Admin sees an SEO analytics overview with indexed pages count and trend indicator, and top performing pages ranked by organic traffic metrics
  2. Admin sees keyword rankings with position tracking and trend indicators (up/down/flat arrows)
  3. Admin sees CTR and impressions data displayed as trend charts over configurable time ranges
  4. Admin sees 404 error and broken link reports in a searchable table with affected URLs, referral sources, and occurrence counts
  5. Admin sees sitemap health status and crawl issue reports with actionable status badges
**Plans**: 3 plans

Plans:
- [ ] 13-01: Analytics overview -- dashboard page layout, indexed pages card with trend, top pages table with traffic metrics, overview chart
- [ ] 13-02: Keyword & CTR analytics -- keyword rankings table with position and trend, CTR/impressions trend charts with date range selector
- [ ] 13-03: Health reports -- 404 errors table, broken links report, sitemap health status, crawl issues panel, status badges

**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order within each milestone.
v2.0: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8
v2.1: 9 -> 10 -> 11 -> 12 -> 13

(Phase 9 depends on v2.0 Phases 1-6. Phase 10 depends on Phase 9. Phase 11 depends on Phase 9. Phase 12 depends on Phase 10. Phase 13 depends on Phase 10 and Phase 11.)

| Phase | Directory | Milestone | Plans Complete | Status | Completed |
|-------|-----------|-----------|----------------|--------|-----------|
| 1. Database, Auth, Route Foundation | 01-foundation | v2.0 | 4/4 | Complete | 2026-05-16 |
| 2. Dashboard Shell | 02-homepage | v2.0 | 3/3 | Verified | 2026-05-16 |
| 3. Customer Portal | 03-customer-portal | v2.0 | 5/5 | Verified | 2026-05-17 |
| 4. Checkout and Payments | 04-checkout-payments | v2.0 | 6/6 | Executed | 2026-05-17 |
| 5. Admin BI Dashboard | 05-admin-dashboard | v2.0 | 6/6 | Complete | 2026-05-18 |
| 6. Webhooks, Jobs, License Intelligence | 06-webhooks-jobs | v2.0 | 4/4 | Complete | 2026-05-19 |
| 7. Notification Engine | 07-notification-engine | v2.0 | 3/5 | Partial | - |
| 8. Affiliate Network | 08-affiliate-network | v2.0 | 0/TBD | Planned | - |
| 9. Settings Foundation | 09-settings-foundation | v2.1 | 0/3 | Not started | - |
| 10. Core SEO Configuration | 10-core-seo | v2.1 | 0/5 | Not started | - |
| 11. Tracking Pixels & Social SEO | 11-tracking-social | v2.1 | 0/5 | Not started | - |
| 12. Advanced SEO Controls | 12-advanced-seo | v2.1 | 0/5 | Not started | - |
| 13. SEO Analytics Dashboard | 13-seo-analytics | v2.1 | 0/3 | Not started | - |
