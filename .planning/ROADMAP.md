# Roadmap: ConversionFlow v2.0

## Overview

Transform the ConversionFlow marketing website (v1.x complete) into a full SaaS platform with Customer Portal and Admin BI Dashboard. The existing marketing site is preserved as-is. This milestone adds authentication, database infrastructure, customer-facing license management, checkout with Bangladesh payment methods, admin business intelligence, and central licensing integration. All licensing handled by license.devsroom.com -- never generated locally.

## Past Milestones (shipped, archived)

- **v1.0 Core Site** - Phases 1-4 (shipped 2026-05-11) — archived in `.planning/phases/_archive-v1x/`
- **v1.1 Functional Site** - Phases 5-10 (shipped 2026-05-14) — archived in `.planning/phases/_archive-v1x/`

## Current Milestone

- **v2.0 Dual Portal SaaS Platform** - Phases 1-6

## Phases

- [x] **Phase 1: Database, Auth, and Route Foundation** — `01-foundation` — COMPLETE (4/4 plans)
- [x] **Phase 2: Dashboard Shell** — `02-homepage` — VERIFIED (3/3 plans, UAT 9/9 pass)
- [ ] **Phase 3: Customer Portal** — `03-customer-portal` — Planned (5 plans)
- [ ] **Phase 4: Checkout and Payments** — `04-checkout-payments` — Not started
- [ ] **Phase 5: Admin BI Dashboard** — `05-admin-dashboard` — Not started
- [ ] **Phase 6: Webhooks, Background Jobs, and License Intelligence** — `06-webhooks-jobs` — Not started

## Phase Details

### Phase 1: Database, Auth, and Route Foundation
**Directory**: `01-foundation`
**Goal**: The application has a working database, authentication system, and route architecture that isolates the dashboard from the marketing site. Users can register, verify email, log in, reset passwords, and access role-appropriate routes.
**Depends on**: Nothing (first phase of v2.0 milestone)
**Requirements**: DB-01, DB-02, DB-03, DB-04, AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, AUTH-07, DASH-02, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. User can register a new account and verify their email address via a confirmation link
  2. User can log in with email/password and stay logged in across browser sessions (Redis-backed in production, in-memory fallback in dev)
  3. User can reset their password via an email link and log in with the new password
  4. Admin users see the admin dashboard route; customer users see the customer portal route; unauthorized users are redirected to login
  5. Marketing site pages ([locale]/*) render identically to v1.x with no CSS or layout changes
**Plans**: 4/4 complete

Plans:
- [x] 01-01-PLAN.md — Database infrastructure: Drizzle ORM, Redis, BullMQ, 8-table schema, seed script
- [x] 01-02-PLAN.md — Better Auth configuration: Drizzle adapter, RBAC plugins, API route, audit logging
- [x] 01-03-PLAN.md — Auth pages: login, register, verify-email, forgot/reset password, email sending, dashboard CSS
- [x] 01-04-PLAN.md — Route architecture: proxy.ts protection, portal/admin layouts, setup wizard, human verification

### Phase 2: Dashboard Shell
**Directory**: `02-homepage`
**Goal**: Both the customer portal and admin dashboard have a complete layout shell with sidebar navigation, header, responsive backdrop, and unified theming. The shell is ready for feature pages to be dropped in.
**Depends on**: Phase 1
**Requirements**: DASH-01
**Success Criteria** (what must be TRUE):
  1. Customer portal displays a sidebar layout with navigation links to Dashboard, Licenses, Billing, Downloads, Support, and Account
  2. Admin dashboard displays a sidebar layout with navigation links to Overview, Sales, Users, Invoices, Licenses, and Settings
  3. Sidebar collapses to a mobile-friendly hamburger menu on narrow viewports with a backdrop overlay
  4. Dark/light theme toggle works consistently across marketing site and both dashboard layouts (single next-themes instance, no separate ThemeContext)
  5. Dashboard CSS does not affect marketing site responsive breakpoints or design tokens
**Plans**: 3/3 complete, UAT verified
**UI hint**: yes

### Phase 3: Customer Portal
**Directory**: `03-customer-portal`
**Goal**: Customers can log in and manage their ConversionFlow licenses, view billing history, download plugin files, submit support tickets, and manage notifications -- all within the portal sidebar layout.
**Depends on**: Phase 2
**Requirements**: PORT-01, PORT-02, PORT-03, PORT-04, PORT-05, PORT-06
**Success Criteria** (what must be TRUE):
  1. Customer sees a dashboard overview with counts of active licenses, licenses expiring soon, recent downloads, and open tickets
  2. Customer can view their license list, click into a license detail, copy the license key, and see activation domain status
  3. Customer can view invoices, payment history, and refund status in the billing section
  4. Customer can download the latest plugin version and access previous versions with changelogs
  5. Customer can create a support ticket, reply to existing tickets with attachments, and view ticket status
  6. Customer can view their notification list, mark notifications as read, and manage notification preferences
**Plans**: 5 plans

Plans:
- [x] 03-01-PLAN.md — Dashboard overview: metric cards, real DB queries, breadcrumb basePath update
- [x] 03-02-PLAN.md — License management: list table, copy key, detail panel, activation domains
- [ ] 03-03-PLAN.md — Billing and downloads: invoice table, featured download card, changelog expandable
- [ ] 03-04-PLAN.md — Support tickets: list, create modal, chat thread, file upload, server actions
- [ ] 03-05-PLAN.md — Notifications and account: notification dropdown rewrite, profile, password, preferences

**UI hint**: yes

### Phase 4: Checkout and Payments
**Directory**: `04-checkout-payments`
**Goal**: Customers can complete a purchase using Bangladesh payment methods (bKash, Nagad, Rocket, Bank Transfer) or SSL Commerce gateway, with coupon codes, tax/VAT calculation, and invoice generation. The purchase flow syncs with the central licensing API.
**Depends on**: Phase 3
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, LIC-01, LIC-02
**Success Criteria** (what must be TRUE):
  1. Customer can select a plan, choose a payment method (bKash/Nagad/Rocket/Bank Transfer/SSL Commerce), and initiate checkout
  2. SSL Commerce gateway redirects customer to payment page and back to the site with order confirmation on success
  3. Manual BD payments (bKash, Nagad, Rocket, Bank Transfer) create a pending order that admin can verify and confirm
  4. Customer can apply a coupon code and see the discounted price before payment
  5. Customer receives an invoice (HTML view + PDF download) after successful payment
  6. Successful payment triggers a POST to license.devsroom.com/api/orders/import and stores the central_user_id + central_license_id mapping locally
**Plans**: 0/? (not started)
**UI hint**: yes

### Phase 5: Admin BI Dashboard
**Directory**: `05-admin-dashboard`
**Goal**: Admin operators can view real-time business intelligence -- revenue KPIs, sales performance, user growth trends, revenue charts, invoice management, user management, and activity feeds -- with filtering and export capabilities.
**Depends on**: Phase 4
**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05, ADMN-06, ADMN-07, ADMN-08, ADMN-09, ADMN-10
**Success Criteria** (what must be TRUE):
  1. Admin sees an executive overview with total revenue, MRR, ARR, active customers, CLV, and CAC with trend indicators (up/down/flat)
  2. Admin can view revenue trend charts (daily/weekly/monthly/yearly) with a date range selector via ApexCharts
  3. Admin can list and filter invoices by status (paid/pending/failed/overdue), mark invoices as paid, and send payment reminders
  4. Admin can list users, view user details, assign roles, and ban/activate accounts
  5. Admin can export any report (revenue, sales, users, invoices) as CSV, Excel, or PDF
  6. Admin sees a real-time activity feed of events (purchases, license activations, refunds, tickets) and receives alerts for failed payments, expiring licenses, and fraud signals
**Plans**: 0/? (not started)
**UI hint**: yes

### Phase 6: Webhooks, Background Jobs, and License Intelligence
**Directory**: `06-webhooks-jobs`
**Goal**: The platform reliably syncs with the central licensing API via webhooks and scheduled fallback jobs. Admins can monitor license health, detect piracy patterns, and background jobs handle async tasks without blocking user-facing responses.
**Depends on**: Phase 4
**Requirements**: LIC-03, LIC-04, LIC-05, LINT-01, LINT-02, LINT-03
**Success Criteria** (what must be TRUE):
  1. Webhook handlers receive and process license events (created, updated, expired, payment-refunded) from license.devsroom.com with HMAC signature verification
  2. A scheduled job syncs license data from the central API every 15 minutes as a fallback when webhooks fail or are missed
  3. Admin can view a license intelligence dashboard showing total/active/expired/revoked counts and renewal rates by product and plan
  4. Admin can see domain tracking details for each license (activation domains, timestamps, multisite usage flags)
  5. Suspicious activation patterns are flagged for admin review as potential piracy indicators
**Plans**: 0/? (not started)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6
(Phase 5 and Phase 6 both depend on Phase 4 and could partially overlap, but sequential is recommended)

| Phase | Directory | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Database, Auth, Route Foundation | 01-foundation | 4/4 | Complete | 2026-05-16 |
| 2. Dashboard Shell | 02-homepage | 3/3 | Verified | 2026-05-16 |
| 3. Customer Portal | 03-customer-portal | 0/5 | Planned | - |
| 4. Checkout and Payments | 04-checkout-payments | 0/? | Not started | - |
| 5. Admin BI Dashboard | 05-admin-dashboard | 0/? | Not started | - |
| 6. Webhooks, Jobs, License Intelligence | 06-webhooks-jobs | 0/? | Not started | - |
