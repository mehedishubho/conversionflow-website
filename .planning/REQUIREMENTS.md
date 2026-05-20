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

- [x] **AUTH-01**: Better Auth integration with dual auth (customer login + admin login)
- [x] **AUTH-02**: 4-role RBAC system (customer, admin, support_staff, super_admin) with server-side checks
- [x] **AUTH-03**: Email verification on registration
- [x] **AUTH-04**: Password reset flow via email link
- [x] **AUTH-05**: Session management with Redis-backed storage (optional in dev)
- [x] **AUTH-06**: Admin 2FA-ready (TOTP support via Better Auth plugin)
- [x] **AUTH-07**: Audit logging for all admin mutations (actor, action, target, IP, timestamp)

### Database & Infrastructure

- [x] **DB-01**: PostgreSQL + Drizzle ORM setup with migration system
- [x] **DB-02**: Redis client for caching, sessions, and job queues
- [x] **DB-03**: Background job system (BullMQ) for async tasks
- [x] **DB-04**: Database schema: users, orders, licenses, downloads, tickets, notifications, audit_logs, coupons

### Central Licensing

- [ ] **LIC-01**: POST to license.devsroom.com/api/orders/import on purchase completion
- [ ] **LIC-02**: Store central_user_id + central_license_id mappings locally
- [x] **LIC-03**: Webhook handlers for license-created/updated/expired/payment-refunded events
- [x] **LIC-04**: Scheduled fallback sync (every 15 minutes) when webhooks fail
- [x] **LIC-05**: HMAC signature verification on all incoming webhooks

### Customer Portal

- [x] **PORT-01**: Dashboard overview (active licenses, expiring soon, recent downloads, open tickets)
- [x] **PORT-02**: License management (list, detail, copy key, deactivate domain, sync status)
- [x] **PORT-03**: Billing section (invoices, payment history, refund status)
- [x] **PORT-04**: Downloads section (latest + old plugin versions with changelogs)
- [x] **PORT-05**: Support tickets (create, list, reply with attachments)
- [x] **PORT-06**: Notification center (list, mark read, preferences)

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

- [x] **LINT-01**: License status dashboard (total/active/expired/revoked/renewal rate by product/plan)
- [x] **LINT-02**: Domain tracking (activation domains per license, timestamps, multisite usage)
- [x] **LINT-03**: Piracy detection flagging (suspicious activation patterns for admin review)

### Dashboard UI

- [x] **DASH-01**: Port dashboard layout from backenddashboard/ (AppSidebar, AppHeader, Backdrop, SidebarContext)
- [x] **DASH-02**: Separate CSS for dashboard routes (prevent CSS token conflict with marketing site)
- [x] **DASH-03**: Unified next-themes across marketing + dashboard (delete dashboard's ThemeContext)
- [x] **DASH-04**: Route group architecture: (auth)/, (portal)/, (admin)/ separate from [locale]/

### Notification Engine

- [ ] **NOTIF-01**: Core notification service with channel router — `sendNotification(userId, event, data, channels)` dispatches to email, in-app, and/or WhatsApp
- [ ] **NOTIF-02**: Email channel via generic SMTP — configurable transport, HTML templates for transactional/support/system events, no vendor lock-in
- [ ] **NOTIF-03**: In-app notification bell — unread count badge, dropdown with notification list, mark-as-read, per-type grouping, extends existing notifications table
- [ ] **NOTIF-04**: WhatsApp channel for BD customers — concise messages for order confirmations, license delivery, ticket updates via Meta Business API or BD provider
- [ ] **NOTIF-05**: Complete event catalog — order (created/confirmed/payment_failed/refunded), license (generated/delivered/expiring_soon/expired), ticket (created/reply/status_changed/resolved), system (blog_published/security_alert)
- [ ] **NOTIF-06**: Admin notification management — view delivery logs, manage templates, test notifications
- [ ] **NOTIF-07**: User notification preferences — per-channel opt-in/out per event category

### Affiliate Network

- [ ] **AFF-01**: Affiliate registration and approval — customers apply, admin approves/rejects/suspends affiliate accounts
- [ ] **AFF-02**: Unique referral links — each affiliate gets a code, `?ref=CODE` sets 30-day cookie on visitor
- [ ] **AFF-03**: Click tracking — records referral link visits with timestamp, landing page, visitor metadata
- [ ] **AFF-04**: Commission auto-calculation — percentage-based (configurable per affiliate) on completed referred orders
- [ ] **AFF-05**: Affiliate dashboard — clicks, conversions, earnings, referral link copy, payout history
- [ ] **AFF-06**: Payout management — affiliates request payouts, admin approves and marks paid after manual bKash/Nagad/bank transfer
- [ ] **AFF-07**: Admin affiliate management — list affiliates, set commission rates, view performance, process payouts
- [ ] **AFF-08**: DB schema — affiliates, affiliate_clicks, affiliate_commissions, affiliate_payouts tables linked to users and orders

## v3 Requirements (Milestone: v2.1 Marketing & SEO Settings Dashboard)

### Settings Navigation

- [ ] **NAV-01**: Admin can access a settings landing page at /admin/settings with category cards linking to Payment Gateway, SMTP/Email, and SEO Settings
- [ ] **NAV-02**: Each settings category has its own sub-route (/admin/settings/payment, /admin/settings/smtp, /admin/settings/seo)
- [ ] **NAV-03**: SEO Settings has nested sub-routes for each SEO section (/admin/settings/seo/general, /admin/settings/seo/verification, etc.)
- [ ] **NAV-04**: Existing Payment, Email, and Tracking forms are migrated from the flat settings page to their respective sub-routes without losing functionality
- [ ] **NAV-05**: Settings sub-navigation uses a consistent tabbed or sidebar layout across all categories

### General SEO

- [ ] **GSEO-01**: Admin can configure website title, default meta title, meta description, meta keywords, and canonical URL
- [ ] **GSEO-02**: Admin can set default robots meta directive, SEO separator character, and default Open Graph image
- [ ] **GSEO-03**: Admin can toggle URL formatting options: lowercase URLs, trailing slash handling
- [ ] **GSEO-04**: Admin can toggle auto meta generation (auto-generate meta titles and descriptions from content)
- [ ] **GSEO-05**: Admin sees a real-time SERP preview snippet showing how the page will appear in Google search results
- [ ] **GSEO-06**: Admin sees character count indicators for meta title (recommended 50-60) and meta description (recommended 150-160)
- [ ] **GSEO-07**: Admin sees an SEO score indicator based on configured settings completeness

### Search Engine Verification

- [ ] **VERF-01**: Admin can enter and save Google Search Console verification meta tag
- [ ] **VERF-02**: Admin can enter and save Bing Webmaster verification code
- [ ] **VERF-03**: Admin can enter and save Yandex, Baidu, and Pinterest verification codes
- [ ] **VERF-04**: Admin sees verification status indicators (connected/disconnected) for each search engine
- [ ] **VERF-05**: Admin can copy verification codes to clipboard using a helper button

### XML Sitemaps

- [ ] **SITM-01**: Admin can enable/disable XML sitemap generation
- [ ] **SITM-02**: Admin can enable/disable individual sitemap types: product sitemap, blog sitemap, image sitemap
- [ ] **SITM-03**: Admin can toggle auto-regeneration of sitemaps when content changes
- [ ] **SITM-04**: Admin sees the sitemap URL preview and last-generated timestamp
- [ ] **SITM-05**: Admin can manually trigger sitemap regeneration and ping search engines

### Robots.txt Manager

- [ ] **ROBT-01**: Admin can edit robots.txt using a visual rule builder (user-agent, allow, disallow, sitemap)
- [ ] **ROBT-02**: Admin can edit robots.txt using a raw code editor with syntax highlighting
- [ ] **ROBT-03**: Admin can toggle AI bot access controls for GPTBot, ClaudeBot, and PerplexityBot (allow/block)
- [ ] **ROBT-04**: Admin can apply crawl rule presets (allow all, block AI bots, block all, custom)
- [ ] **ROBT-05**: Admin sees a live preview of the generated robots.txt content

### Open Graph & Social SEO

- [ ] **SOCL-01**: Admin can configure Facebook App ID, default share title, description, and image
- [ ] **SOCL-02**: Admin can configure Twitter/X handle, card type (summary/summary_large_image), and default share image
- [ ] **SOCL-03**: Admin can configure LinkedIn share image override
- [ ] **SOCL-04**: Admin sees a social share preview simulator showing how links appear on Facebook, Twitter/X, and LinkedIn
- [ ] **SOCL-05**: Admin can toggle between mobile and desktop preview modes

### Meta Pixel & Conversion API

- [ ] **META-01**: Admin can configure Meta Pixel ID and Conversion API token
- [ ] **META-02**: Admin can configure Dataset ID and Test Event Code for debugging
- [ ] **META-03**: Admin can toggle Advanced Matching and Event Deduplication
- [ ] **META-04**: Admin can select which standard events to track: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Lead
- [ ] **META-05**: Admin sees connection status indicator for Pixel and CAPI
- [ ] **META-06**: Admin sees recent event firing logs for diagnostics

### TikTok Tracking

- [ ] **TIKT-01**: Admin can configure TikTok Pixel ID and Events API token
- [ ] **TIKT-02**: Admin can toggle Advanced Matching and server-side tracking
- [ ] **TIKT-03**: Admin sees tracking status indicator and recent event logs

### Google Analytics & Ads

- [ ] **GOOG-01**: Admin can configure GA4 Measurement ID, Google Ads Conversion ID, and Conversion Label
- [ ] **GOOG-02**: Admin can configure Google Tag Manager Container ID
- [ ] **GOOG-03**: Admin can toggle server-side tracking and enhanced ecommerce
- [ ] **GOOG-04**: Admin sees connection status and a connection tester
- [ ] **GOOG-05**: Admin sees analytics summary cards (integrated with existing dashboard metrics)

### Schema Markup

- [ ] **SCHM-01**: Admin can configure global schema: Organization, Website, and Breadcrumb
- [ ] **SCHM-02**: Admin can enable/configure content schemas: Product, Article, FAQ, HowTo, Review
- [ ] **SCHM-03**: Admin sees a JSON-LD preview of the generated schema markup
- [ ] **SCHM-04**: Admin can validate schema markup against Google structured data requirements
- [ ] **SCHM-05**: Admin can toggle auto schema generation based on content type

### Redirect Manager

- [ ] **RDIR-01**: Admin can create 301 (permanent) and 302 (temporary) redirects with from/to URL fields
- [ ] **RDIR-02**: Admin can create regex-based redirects for pattern matching
- [ ] **RDIR-03**: Admin sees a redirect table with search/filter, status tracking, and hit counter
- [ ] **RDIR-04**: Admin can bulk import and export redirects via CSV
- [ ] **RDIR-05**: Admin can delete individual redirects or bulk delete selected redirects

### AI SEO & LLM Controls

- [ ] **AISE-01**: Admin can allow or block GPTBot from crawling the site
- [ ] **AISE-02**: Admin can allow or block ClaudeBot from crawling the site
- [ ] **AISE-03**: Admin can allow or block PerplexityBot from crawling the site
- [ ] **AISE-04**: Admin can generate an llms.txt file for AI crawler consumption
- [ ] **AISE-05**: Admin can configure AI content usage rules (how AI models may use site content)

### Image SEO

- [ ] **IMGS-01**: Admin can toggle auto ALT text generation for images
- [ ] **IMGS-02**: Admin can toggle WebP conversion for uploaded images
- [ ] **IMGS-03**: Admin can toggle lazy loading for images across the site
- [ ] **IMGS-04**: Admin can toggle image compression and see optimization savings stats
- [ ] **IMGS-05**: Admin sees image performance statistics (total images, optimized count, savings)

### Performance SEO

- [ ] **PERF-01**: Admin can toggle Critical CSS extraction and injection
- [ ] **PERF-02**: Admin can toggle JS defer loading strategy
- [ ] **PERF-03**: Admin can toggle HTML and CSS minification
- [ ] **PERF-04**: Admin can configure CDN integration URL
- [ ] **PERF-05**: Admin can configure cache control settings (max-age, stale-while-revalidate)
- [ ] **PERF-06**: Admin sees Core Web Vitals monitor cards: LCP, CLS, INP, TTFB, and overall performance score

### SEO Analytics

- [ ] **ANLT-01**: Admin sees an SEO analytics overview dashboard with indexed pages count and trend
- [ ] **ANLT-02**: Admin sees top performing pages ranked by organic traffic metrics
- [ ] **ANLT-03**: Admin sees keyword rankings with position tracking and trend indicators
- [ ] **ANLT-04**: Admin sees CTR and impressions data with trend charts
- [ ] **ANLT-05**: Admin sees 404 error and broken link reports
- [ ] **ANLT-06**: Admin sees sitemap health status and crawl issue reports
- [ ] **ANLT-07**: Analytics data is displayed using charts, tables, status badges, and trend indicators

### Page-Level SEO

- [ ] **PLVL-01**: Each page, product, and blog post has editable SEO title, meta description, and canonical URL
- [ ] **PLVL-02**: Each content item has a focus keyword field with density analysis
- [ ] **PLVL-03**: Each content item has per-page robots indexing control (index/noindex, follow/nofollow)
- [ ] **PLVL-04**: Each content item has a custom OG image override
- [ ] **PLVL-05**: Each content item has a schema type selector and social preview

## v4 Requirements (Future)

Deferred to future release.

### Advanced Analytics Integration

- **ANLT-08**: Real-time Google Search Console API integration for live keyword data
- **ANLT-09**: Automated weekly SEO audit reports with email delivery
- **ANLT-10**: Competitor analysis dashboard

### Advanced Redirect Features

- **RDIR-06**: Auto-slug redirect creation when URLs change
- **RDIR-07**: Redirect chain detection and warning

### Advanced Schema

- **SCHM-06**: LocalBusiness schema with geo coordinates
- **SCHM-07**: Video schema markup
- **SCHM-08**: Custom schema builder for arbitrary JSON-LD

### Marketing Automation

- **MKTG-01**: A/B testing for meta titles and descriptions
- **MKTG-02**: Automated internal linking suggestions
- **MKTG-03**: Content optimization scoring

## Out of Scope

| Feature | Reason |
|---------|--------|
| WordPress plugin development | This is the SaaS platform, not the plugin itself |
| Central licensing engine | Owned by license.devsroom.com, only integrated here |
| CMS integration | Content managed via data files and MDX in the repository |
| Mobile app | Web-only platform |
| Redesigning existing marketing pages | All v1.x pages preserved as-is |
| Redesigning dashboard UI | Use backenddashboard/ folder design as-is |
| Real-time Google Search Console API | Requires OAuth setup, API quotas, complex auth flow — defer to v4 |
| Competitor analysis | Needs third-party data providers (Ahrefs/Semrush API) — out of budget scope |
| A/B testing for meta tags | Requires traffic splitting infrastructure — complex for v1 |
| WordPress plugin SEO integration | Plugin manages its own SEO; this dashboard controls the marketing site |
| Multi-tenant SEO settings | Current platform is single-tenant; multi-tenant requires architecture changes |
| Actual server-side image processing | Image SEO toggles save intent; actual WebP/compression is a deployment pipeline concern |
| Actual CSS/JS minification at runtime | Performance toggles save preferences; optimization is a build-time/deployment concern |

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
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| AUTH-06 | Phase 1 | Complete |
| AUTH-07 | Phase 1 | Complete |
| DB-01 | Phase 1 | Complete |
| DB-02 | Phase 1 | Complete |
| DB-03 | Phase 1 | Complete |
| DB-04 | Phase 1 | Complete |
| DASH-02 | Phase 1 | Complete |
| DASH-03 | Phase 1 | Complete |
| DASH-04 | Phase 1 | Complete |
| DASH-01 | Phase 2 | Complete |
| PORT-01 | Phase 3 | Complete |
| PORT-02 | Phase 3 | Complete |
| PORT-03 | Phase 3 | Complete |
| PORT-04 | Phase 3 | Complete |
| PORT-05 | Phase 3 | Complete |
| PORT-06 | Phase 3 | Complete |
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
| LIC-03 | Phase 6 | Complete |
| LIC-04 | Phase 6 | Complete |
| LIC-05 | Phase 6 | Complete |
| LINT-01 | Phase 6 | Complete |
| LINT-02 | Phase 6 | Complete |
| LINT-03 | Phase 6 | Complete |
| NOTIF-01 | Phase 7 | Pending |
| NOTIF-02 | Phase 7 | Pending |
| NOTIF-03 | Phase 7 | Pending |
| NOTIF-04 | Phase 7 | Pending |
| NOTIF-05 | Phase 7 | Pending |
| NOTIF-06 | Phase 7 | Pending |
| NOTIF-07 | Phase 7 | Pending |
| AFF-01 | Phase 8 | Pending |
| AFF-02 | Phase 8 | Pending |
| AFF-03 | Phase 8 | Pending |
| AFF-04 | Phase 8 | Pending |
| AFF-05 | Phase 8 | Pending |
| AFF-06 | Phase 8 | Pending |
| AFF-07 | Phase 8 | Pending |
| AFF-08 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 67 total (all Complete)
- v2 requirements: 60 total
- v3 requirements: 57 total (new milestone)
- Mapped to phases: 60 (v2) + 0 (v3, pending roadmap)
- Orphaned: 57 (v3, pending roadmap creation)

---
*Requirements defined: 2026-05-11*
*Last updated: 2026-05-20 — v2.1 Marketing & SEO Settings requirements added (57 REQs)*
