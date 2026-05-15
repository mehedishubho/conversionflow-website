# Project Research Summary

**Project:** ConversionFlow v2.0 -- Dual Portal SaaS Platform (Customer Portal + Admin BI Dashboard)
**Domain:** WooCommerce plugin licensing SaaS with Bangladesh-specific payments
**Researched:** 2026-05-15
**Confidence:** HIGH

## Executive Summary

ConversionFlow v2.0 transforms an existing Next.js 16 marketing website into a full SaaS platform by adding a customer portal, admin BI dashboard, checkout system, and central licensing integration. This is a dual portal architecture where an existing public marketing site (v1.x, preserved as-is) coexists with two new authenticated portals inside the same Next.js application. The recommended approach uses route group isolation -- marketing pages stay under [locale]/ with i18n, while (portal)/ and (admin)/ route groups provide completely independent layouts with their own sidebars, headers, and theme systems. This avoids the most common architectural mistake of mixing i18n middleware with dashboard routes.

The technology stack centers on PostgreSQL + Drizzle ORM for data, Better Auth for authentication (with built-in admin/RBAC plugins), Redis for caching and job queues, and ApexCharts for the BI dashboard (already proven in the backenddashboard/ template). The most complex integration is the Bangladesh payment system: SSL Commerz provides automated gateway processing, while bKash, Nagad, Rocket, and Bank Transfer use a manual verification workflow where customers send payment externally and admins confirm receipt. This is standard practice in the BD developer ecosystem since none of these MFS providers offer reliable npm SDKs.

The key risks are: (1) merging the backenddashboard/ template CSS with the marketing site CSS will destroy responsive breakpoints if done naively, (2) the central licensing API at license.devsroom.com is a single point of failure that requires async job queues with retry logic, (3) Better Auth schema migrations invalidate all active sessions, and (4) two competing theme systems (the dashboard custom ThemeContext vs the marketing site next-themes) must be unified into one. All four are addressed in Phase 1 before any user-facing features are built.

## Key Findings

### Recommended Stack

The stack adds ~20 production dependencies to the existing 27-package base. Every new dependency was verified for React 19 and Next.js 16 compatibility via registry queries. No version conflicts exist.

**Core technologies:**
- **PostgreSQL + Drizzle ORM + postgres.js:** Type-safe database layer. Drizzle chosen over Prisma for zero Rust engine binary, lighter bundle, faster VPS cold starts, and better SQL control.
- **Better Auth:** Self-hosted auth with built-in admin plugin, RBAC access control, Drizzle adapter, 2FA, and email OTP. Chosen over NextAuth for superior self-hosting story and dual-portal RBAC support.
- **Redis (ioredis + BullMQ):** Session caching, API response caching, rate limiting, and background job queues. BullMQ handles license sync retries, email dispatch, and large data exports.
- **ApexCharts (react-apexcharts):** Chart library already used in the backenddashboard/ template. All chart components use dynamic import with ssr: false.
- **TanStack Table:** Headless data table for server-side paginated/sortable grids in both admin and customer portals.
- **SSL Commerz + manual BD payments:** SSL Commerz for automated card/gateway payments. bKash/Nagad/Rocket/Bank Transfer use manual verification workflow (customer sends, admin confirms).

### Expected Features

**Must have (P1 -- launch blockers):**
- Database + Auth foundation with 4-role RBAC (customer, admin, support_staff, super_admin)
- Central licensing webhook handlers with scheduled fallback sync
- Customer portal: dashboard overview, license management, downloads, copy key
- BD manual payments (bKash/Nagad/Rocket/Bank) with admin verification workflow
- SSL Commerz gateway integration with IPN handler
- Admin BI: executive KPI overview, revenue trend charts, invoice management
- Dashboard UI ported from backenddashboard/ template
- Audit logging for all admin mutations

**Should have (P2 -- add after core is stable):**
- Support ticket system with threaded replies and attachments
- Coupon codes with percentage/flat discount, usage limits, expiry
- Invoice PDF download for customers
- Billing history with payment status tracking
- Notification center (in-app + email for critical events)
- Data export (CSV/Excel/PDF) for admin reports
- Smart renewal reminder email sequence
- Date range filters for all BI dashboard widgets

**Defer (P3 -- future with data/time):**
- Churn analytics (requires 6+ months of expiry data)
- Conversion funnel tracking (requires event infrastructure)
- Retention cohort analysis (requires customer age data)
- Piracy detection (requires activation pattern data from central API)
- Geographic revenue heatmap (requires billing address data)
- Scheduled reporting (automated weekly/monthly email reports)
- Customer lifetime value tracking (requires multi-purchase history)
### Architecture Approach

The architecture uses Next.js 16 route groups to create three parallel layout trees that never share visual chrome: [locale]/ for the marketing site with Navbar/Footer/i18n, (auth)/ for login/register pages with a split-panel design, and (portal)/ + (admin)/ for authenticated dashboards with sidebar layouts. The root layout.tsx is a passthrough that returns children only. Each route group has its own complete layout with independent html and body tags, fonts, styles, and providers. This isolation prevents the marketing Navbar from appearing in the dashboard and prevents i18n middleware from intercepting dashboard routes.

**Major components:**
1. **Marketing site ([locale]/)** -- Preserved as-is from v1.x. All 13 pages with i18n, Navbar, Footer, Framer Motion animations.
2. **Customer portal ((portal)/)** -- Authenticated sidebar layout with license management, billing, downloads, support tickets, checkout.
3. **Admin BI dashboard ((admin)/)** -- Authenticated sidebar layout with revenue charts, sales analytics, user management, license intelligence, export system.
4. **Service layer (src/lib/services/)** -- Business logic: license sync from central API, payment processing, BI aggregation queries, notification dispatch, CSV/Excel/PDF export.
5. **API routes (src/app/api/)** -- Better Auth catch-all, webhook handlers (license + payment), portal actions, admin BI queries, export endpoints.
6. **Background jobs (src/jobs/)** -- BullMQ workers for license sync, email sending, large exports. Runs as separate Node.js process in production.

### Critical Pitfalls

1. **Dashboard CSS token reset destroys marketing site breakpoints** -- The backenddashboard/globals.css opens with breakpoint-*: initial; and font-*: initial; which resets ALL Tailwind defaults. Must use separate CSS files and Next.js route groups to isolate dashboard styles from marketing styles.

2. **Two competing theme systems create hydration chaos** -- The dashboard template uses a custom ThemeContext.tsx that fights with next-themes. Must delete the dashboard ThemeContext entirely and use next-themes across all layouts.

3. **Central licensing API is a single point of failure** -- All license operations depend on license.devsroom.com. Must implement async job queues with retry logic, never block customer-facing responses on central API calls, and run fallback sync every 15 minutes.

4. **Better Auth schema drift between auth and application tables** -- Better Auth and Drizzle Kit manage separate migration systems. Must use Better Auth CLI for auth tables, Drizzle Kit for application tables, and never overlap.

5. **BD payment gateway integration has no official SDK** -- bKash, Nagad, Rocket all require manual HTTP integration or manual verification. Budget 2-3 weeks per gateway. Build a PaymentProvider interface abstraction from the start.
## Implications for Roadmap

Based on combined research, the following phase structure addresses dependency chains, prevents pitfalls, and delivers usable increments at each stage.

### Phase 1: Database, Auth, and Route Architecture

**Rationale:** Everything depends on the database and authentication. Route group architecture and CSS isolation must be established before any dashboard code is ported. This phase is the highest-risk phase because mistakes here cascade into every subsequent phase.

**Delivers:** Working PostgreSQL schema, Better Auth with 4-role RBAC, Redis client (optional in dev), route protection via proxy.ts, login/register/password-reset pages, seed data, migration infrastructure, CSS isolation strategy for dashboard.

**Addresses:** Auth and user management table stakes, RBAC foundation for all portal/admin features.

**Avoids:** Pitfall 1 (CSS token conflict), Pitfall 2 (theme system conflict), Pitfall 3 (auth schema drift), Pitfall 6 (route group collision), Pitfall 7 (schema drift), Pitfall 8 (Redis dev dependency).

**Key decisions:** Full Better Auth config with all plugins added at once (admin, access, two-factor). Redis secondaryStorage conditionally provided in dev. Separate CSS files for marketing vs dashboard. Route groups: [locale]/, (auth)/, (portal)/, (admin)/.

### Phase 2: Dashboard Shell and Customer Portal

**Rationale:** The dashboard UI shell (sidebar, header, layout) must exist before any portal or admin pages can be built. Customer portal features are simpler than admin BI features and provide a tighter feedback loop.

**Delivers:** Ported dashboard layout components (AppSidebar, AppHeader, Backdrop, SidebarContext) adapted from backenddashboard/. Customer portal pages: dashboard overview, license list/detail, downloads, account settings. Unified next-themes across all layouts.

**Uses:** Drizzle ORM for data queries, Better Auth session validation in server components, ApexCharts dynamic import pattern from dashboard template.

**Implements:** Route group isolation pattern, server component data fetching for portal pages, sidebar navigation with customer-specific menu items.

**Avoids:** Pitfall 10 (dashboard merge breaks build) by porting components one at a time with adapted imports.

### Phase 3: Checkout and Payment Integration

**Rationale:** Checkout is the revenue-critical path. It depends on auth (user identification) and database (orders table), both from Phase 1. It must be complete before admin BI can show revenue data. Payment gateway integration is the highest-complexity work in the entire project.

**Delivers:** Checkout page with plan selection and payment method choice. SSL Commerz integration (redirect + IPN handler). Manual payment flow for bKash/Nagad/Rocket/Bank Transfer. Order creation flow. Central API order import (POST to license.devsroom.com). Invoice generation. Post-purchase confirmation page.

**Uses:** sslcommerz package, bkash-payment package, PaymentProvider interface abstraction, BullMQ for async central API sync, @react-pdf/renderer for invoice PDFs.

**Addresses:** Checkout and payment table stakes, central licensing sync.

**Avoids:** Pitfall 4 (central API SPOF) via async job queue architecture. Pitfall 5 (BD payment integration) via PaymentProvider abstraction. Pitfall 9 (webhook security) by building signature verification from day one.
### Phase 4: Admin BI Dashboard

**Rationale:** Admin BI is the most feature-rich phase but depends on data from checkout (Phase 3) and the dashboard shell (Phase 2). Building it last means real data exists for testing charts and metrics.

**Delivers:** Executive overview (MRR, ARR, active customers, CLV, CAC). Revenue trend charts (daily/weekly/monthly). Sales performance metrics. Invoice management. User management with RBAC. Activity feed. Date range filters. Redis-cached BI queries.

**Uses:** ApexCharts (area, bar, donut, gauge charts), TanStack Table (orders, users, licenses, invoices), Redis caching for aggregation queries, Drizzle ORM for complex SQL aggregations.

**Addresses:** Admin BI table stakes, invoice management, data export.

**Avoids:** Performance trap of BI queries without time-range indexing (add composite indexes in migration). Empty state UX pitfall (show onboarding messages for fresh installs).

### Phase 5: Webhooks, Background Jobs, and Polish

**Rationale:** Webhook handlers and background jobs can be built in parallel with admin BI but are separated here to keep the roadmap focused. This phase also handles the looks-done-but-is-not items: rate limiting, error boundaries, mobile responsiveness, and notification infrastructure.

**Delivers:** Central licensing webhook handler (license-created, updated, expired, refunded). Scheduled fallback sync (every 15 minutes). Background job system with BullMQ workers. Rate limiting on auth, payment, and API endpoints. Error boundaries for dashboard. Mobile responsiveness verification. Notification dispatch service.

**Uses:** BullMQ for all background jobs, rate-limiter-flexible for rate limiting, Redis for rate limit counters.

**Addresses:** License intelligence sync, notification center foundation, security hardening.

**Avoids:** Pitfall 9 (webhook security) with HMAC signature verification. Performance trap of webhook processing in request handler (acknowledge immediately, process asynchronously).

### Phase Ordering Rationale

- **Phase 1 first** because database + auth is the foundation for every other feature. Route group architecture and CSS isolation are one-way decisions that cannot be refactored easily.
- **Phase 2 before Phase 3** because the dashboard shell is needed for checkout success pages and customer portal. Also, customer portal features provide a tighter feedback loop than payment integration.
- **Phase 3 before Phase 4** because admin BI needs real order/revenue data to test against. Checkout must work before BI can show meaningful metrics.
- **Phase 5 is parallelizable** with Phase 4 but separated for roadmap clarity. Webhook infrastructure can be built while admin BI charts are being implemented.
- **The dependency chain is strict:** Database -> Auth -> Portal Shell -> Checkout -> Admin BI -> Webhooks/Jobs. Breaking this order creates rework.
### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Better Auth + Drizzle adapter specific migration commands. The interaction between the Better Auth CLI generate and drizzle-kit generate needs hands-on validation. Redis secondaryStorage configuration for Better Auth.
- **Phase 3:** SSL Commerz sandbox testing -- need to obtain sandbox credentials and verify the 3-step flow. Central API (license.devsroom.com) POST /api/orders/import endpoint specification. bKash Tokenized API integration flow.
- **Phase 4:** BI aggregation query patterns with Drizzle ORM -- complex GROUP BY, date_trunc, and window functions need testing.

Phases with standard patterns (skip deep research):
- **Phase 2:** Dashboard component porting from backenddashboard/ -- template is well-analyzed, patterns are documented.
- **Phase 5:** BullMQ background jobs, rate limiting -- well-documented, standard patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All 20 new packages verified for React 19 + Next.js 16 compatibility via registry queries. No version conflicts. |
| Features | HIGH | Feature landscape mapped against WooCommerce.com and Freemius patterns. SSL Commerz API docs reviewed. Priority matrix clear. |
| Architecture | HIGH | Route group isolation is a proven Next.js pattern. Better Auth + Drizzle integration documented in official docs. Dashboard template analyzed. |
| Pitfalls | HIGH | 10 critical pitfalls identified from codebase analysis and domain knowledge. Phase-to-pitfall mapping complete. |

**Overall confidence:** HIGH

### Gaps to Address

- **Central API specification:** The exact request/response format for license.devsroom.com/api/orders/import needs confirmation during Phase 3 planning. Research references the endpoint but the contract should be validated against the actual API.
- **SSL Commerz sandbox credentials:** Need to be obtained before Phase 3 implementation. The sandbox and production environments use different base URLs.
- **Better Auth + Drizzle migration workflow:** The dual migration system (Better Auth CLI vs Drizzle Kit) needs hands-on validation. Research recommends keeping them separate but the exact commands and ordering should be tested in a throwaway branch during Phase 1.
- **Dashboard component inventory:** The backenddashboard/ folder has 65+ components. Not all are needed. A precise inventory of which components to port should be created during Phase 2 planning.
- **BD payment provider testing:** No public sandbox environments exist for bKash/Nagad/Rocket manual flows. Testing strategy needs to be defined (likely manual testing with small real amounts).

## Sources

### Primary (HIGH confidence)
- **Codebase analysis:** src/app/globals.css, src/app/[locale]/layout.tsx, src/proxy.ts, src/i18n/routing.ts, package.json, next.config.ts -- direct analysis of existing v1.x code
- **Dashboard template analysis:** backenddashboard/package.json, backenddashboard/src/app/globals.css (CSS token reset issue), backenddashboard/src/context/ThemeContext.tsx (competing theme system), backenddashboard/src/components/ecommerce/MonthlySalesChart.tsx (ApexCharts pattern)
- **Better Auth official docs:** Drizzle adapter, Next.js integration, Admin plugin, Access Control plugin, secondaryStorage for Redis, CLI migration commands
- **Drizzle ORM docs:** PostgreSQL setup, schema definition, relations, migration workflow
- **npm registry verification:** All 20 new package versions queried via pnpm view for peer dependency compatibility with React 19 and Next.js 16

### Secondary (MEDIUM confidence)
- **SSL Commerz API v4 documentation:** Payment flow, session creation, IPN handling, Validation API. Well-documented but sandbox testing not yet performed.
- **BD payment ecosystem patterns:** bKash Tokenized API, Nagad merchant API -- documentation exists but is fragmented. Manual verification is the standard practice.
- **SaaS BI dashboard patterns:** Based on Stripe Billing feature reference (MRR, ARR, churn, retention patterns) -- standard SaaS metrics, well-established.

### Tertiary (LOW confidence)
- **Central licensing API contract:** license.devsroom.com/api/orders/import -- referenced in PROJECT.md but exact request/response schema needs validation during implementation.

---
*Research synthesized: 2026-05-15*
*Ready for roadmap: yes*
