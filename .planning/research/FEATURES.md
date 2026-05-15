# Feature Research

**Domain:** Dual-portal SaaS platform (Customer Portal + Admin BI Dashboard) for WooCommerce plugin licensing
**Researched:** 2026-05-15
**Confidence:** HIGH (based on PROJECT.md requirements, SSL Commerce API docs, Stripe Billing patterns, backenddashboard/ template analysis)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete. Broken into functional areas.

#### Authentication & User Management

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Customer registration + login | Every SaaS requires account creation. Customers must log in to manage licenses, view billing, download products. | MEDIUM | Better Auth handles core flows. Need dual auth: customer login (public) vs admin login (separate route). |
| Email verification | Standard SaaS pattern. Prevents spam accounts, ensures license emails reach real owners. | LOW | Better Auth supports email verification out of the box. Trigger on registration, resend option. |
| Password reset | Users forget passwords. Not having this = support burden. | LOW | Better Auth built-in. Email-based reset link with expiry. |
| Session management | Users expect to stay logged in across tabs, be logged out after timeout. | MEDIUM | Redis-backed sessions. Customer sessions: 30-day expiry with refresh. Admin sessions: 8-hour expiry, no remember-me. |
| Role-based access (4 roles) | customer, admin, support_staff, super_admin. Admin portal must restrict features by role. | MEDIUM | RBAC middleware in proxy.ts checks role on every admin route. support_staff sees tickets + limited user data. super_admin gets everything + role management. |
| Admin 2FA | Admin dashboard access is high-value. 2FA is table stakes for any admin panel handling revenue data. | MEDIUM | Better Auth supports TOTP. Enable for admin + super_admin roles only. Store 2FA secret encrypted in DB. |
| Audit logging | Admin actions (license changes, refunds, user modifications) must be traceable. Required for dispute resolution. | MEDIUM | Log actor, action, target, timestamp, IP to audit_logs table. Admin can view own activity. super_admin sees all activity. |

#### Customer Portal

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Customer dashboard overview | Landing page after login. Must show: active licenses, expiring soon, recent downloads, open tickets, notifications count. | MEDIUM | Summary cards with counts. "Expiring soon" = licenses within 30 days of expiry. Quick-action links to renew/upgrade. |
| License list + detail | Customers must see all their licenses: key, product, status, activation count, expiry date, associated domain(s). | MEDIUM | List view with filters (active/expired/all). Detail view shows full license info, activation history. |
| License key copy | One-click copy of license key to clipboard. Users expect this for pasting into plugin settings. | LOW | Client-side clipboard API. Visual feedback (copied confirmation). |
| License renewal | One-time payment model means licenses have an update/support period. Renewal extends that period. | HIGH | Creates renewal order -> checkout -> payment -> call central API to extend license. Depends on checkout system. |
| License activation/deactivation | Plugin users activate on a domain. Customer portal should show which domains are active and allow deactivation (free up a slot). | HIGH | Calls central license API. Must handle: max activations reached, cannot deactivate primary domain while active on others. Sync state locally. |
| Billing history | Customers need to see all past payments, invoices, statuses. Standard for any paid product. | MEDIUM | List of orders with: date, product, amount, payment method, status (paid/pending/failed/refunded). Link to invoice PDF. |
| Invoice download | Customers need invoices for accounting, tax purposes, reimbursement. PDF invoices are standard. | MEDIUM | Generate PDF server-side (react-pdf or puppeteer). Include: invoice number, date, customer info, line items, tax, total, payment method, status. |
| Product downloads | Customers must be able to download the plugin ZIP they purchased. Versioned downloads are expected. | LOW | Serve ZIP files from protected storage. Show latest version prominently, with older versions available. Link changelog per version. |
| Support tickets | Customers need a way to get help beyond email/WhatsApp. Ticket system is standard for SaaS. | HIGH | Create ticket with subject, message, category, priority. Reply thread with rich text. File attachments. Status: open/in-progress/resolved/closed. Admin/support_staff can respond. |
| Notifications | Customers expect to be notified about: license expiry, payment success/failure, ticket responses, new versions. | MEDIUM | In-app notification center (bell icon with count). Email notifications for critical events (payment failure, license expiring). Preference settings for notification types. |
| Profile management | Customers need to edit name, email, password, company info. | LOW | Simple profile edit form. Email change requires re-verification. |

#### Admin BI Dashboard

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Executive overview (KPIs) | Admins need at-a-glance business health: total revenue, MRR, ARR, active customers, CLV, CAC. | MEDIUM | KPI cards with trend indicators (up/down arrows, percentage change vs previous period). backenddashboard/ has EcommerceMetrics component pattern to port. |
| Sales performance metrics | Total sales, conversion rate, refund rate, average order value. Basic revenue tracking. | MEDIUM | Aggregated from orders table. Conversion rate = purchases / unique checkout page visits. Refund rate = refunded / total orders. |
| User growth tracking | Daily/weekly/monthly signups, activation rate (purchased after signup), growth trends. | MEDIUM | Time-series chart (ApexCharts line chart). Cohort view optional for v1. backenddashboard/ has MonthlySalesChart pattern. |
| Revenue trend charts | Revenue over time with granularity: daily, weekly, monthly, yearly. With comparison to previous period. | MEDIUM | ApexCharts area/line chart. Date range selector. backenddashboard/ has StatisticsChart component. |
| Invoice management | Admin must view all invoices, filter by status (paid/pending/failed/overdue), mark as paid, trigger retry. | MEDIUM | Data table with status filters, search, pagination. Actions: view, mark paid, send reminder, retry payment. backenddashboard/ has RecentOrders table pattern. |
| Activity feed | Real-time chronological log of important events: new purchase, license activated, ticket created, payment failed. | MEDIUM | Paginated event list with icons per type. Optional WebSocket for real-time (defer to v2, use polling for v1). |
| Date range + filters | Every BI metric must be filterable by date range, product, plan, channel. Without filters, dashboards are useless. | MEDIUM | Date picker component (flatpickr is in backenddashboard/). Product/plan/channel dropdowns. Filters apply to all dashboard widgets simultaneously. |
| Data export (CSV/Excel/PDF) | Admins need to export reports for accounting, meetings, analysis. Standard BI feature. | MEDIUM | Server-side generation for large datasets. CSV for raw data. Excel for formatted reports. PDF for presentation-ready reports. |

#### Checkout & Payments

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| BD manual payments (bKash/Nagad/Rocket/Bank) | Bangladeshi customers predominantly pay via mobile banking. This IS the primary payment method for the target market. | HIGH | Customer selects method, sees instructions (phone number/account details), sends payment, submits transaction ID. Admin verifies manually and approves order. |
| SSL Commerce gateway | For card payments and automated mobile banking. Standard payment gateway in Bangladesh. | HIGH | 3-step flow: (1) Create session via API with store_id + store_passwd + order details, (2) Redirect to SSL Commerce hosted payment page, (3) Handle IPN callback + validate via Order Validation API. Supports BDT 10-500,000 range. |
| SSL Commerce IPN handler | Async payment confirmation. SSL Commerce sends IPN to webhook URL when payment completes. | HIGH | POST endpoint receives tran_id, val_id, amount, status. Must verify with Validation API before marking order paid. Idempotency required (handle duplicate IPNs). |
| Coupon codes | Promotional discounts are standard. Percentage or flat amount, expiry, usage limits. | MEDIUM | Coupon DB table: code, type (percentage/flat), value, max_uses, used_count, expires_at, active. Apply at checkout before payment. Validate server-side. |
| Tax/VAT calculation | Bangladeshi businesses may need VAT on invoices. Configurable tax rate per product. | MEDIUM | Tax rate stored in settings. Calculate on checkout: subtotal + tax = total. Display tax breakdown on invoice. Default 0% (plugin licenses in BD typically not VAT-taxed, but must be configurable). |
| Order creation flow | Purchase -> create/find customer -> create order -> payment -> call central API -> store mapping. The complete purchase pipeline. | HIGH | Multi-step server action: (1) validate cart, (2) create/update user, (3) create order record, (4) process payment, (5) on success: POST to license.devsroom.com/api/orders/import, (6) store central_user_id + central_license_id mapping locally, (7) generate invoice, (8) send confirmation email. |

#### License Intelligence

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Central API sync | Local data must match license.devsroom.com. Sync license statuses on schedule and on webhook events. | HIGH | Webhook handlers: license-created, license-updated, license-expired, payment-refunded. Scheduled fallback sync (hourly) for missed webhooks. Store total/active/expired/revoked counts locally. |
| License status dashboard (admin) | Admin must see: total licenses, active, expired, revoked, renewal rate. Breakdown by product, plan. | MEDIUM | Aggregated from local cache. Sync from central API on load if stale (>15 min old). Charts: status pie chart, renewal rate trend. |
| Domain tracking | Admin needs to see which domains each license is activated on, activation timestamps, multisite usage. | MEDIUM | Data comes from central API sync. Display per-license detail. Flag suspicious patterns (many domains in short time, different countries). |

---

### Differentiators (Competitive Advantage)

Features that set ConversionFlow apart from generic WooCommerce plugin stores. Not expected by users, but create significant value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Churn analytics | Proactive churn detection: cancellation trends, downgrade alerts, at-risk customer identification. Most WP plugin stores do not have this. | HIGH | Churn rate = expired licenses / total licenses per period. At-risk = licenses expiring within 14 days with no renewal intent signal. Alert admin dashboard. |
| Conversion funnel tracking | Full funnel: impressions -> site visits -> pricing page -> checkout started -> payment completed -> license activated. Reveals where customers drop off. | HIGH | Track events at each step. Store in analytics_events table or use existing session tracking. Funnel visualization with drop-off percentages per stage. |
| Retention analytics (day 1/7/30/90) | Measures product stickiness. How many customers who purchased are still active after 1, 7, 30, 90 days? Critical for one-time payment model where revenue depends on renewals. | MEDIUM | Cohort-based analysis. Group customers by purchase month, track their license status over time. ApexCharts cohort grid visualization. |
| Geographic analytics (revenue heatmap) | Sales by country/division with revenue heatmap. Understand where customers are concentrated. Unique for BD-targeted plugin. | MEDIUM | jvectormap (already in backenddashboard/) for world map. Revenue by country aggregated from customer billing addresses. Bangladesh division-level breakdown. |
| Piracy detection | Flag suspicious license activations: same key on many IPs, rapid sequential activations, geographic anomalies. Protect revenue. | HIGH | Heuristic rules: >3 activations in 1 hour, >5 unique IPs in 24 hours, IP geolocation mismatch with customer profile. Admin gets alerts. Does NOT block automatically (manual review). |
| Product performance comparison | Compare sales performance across products (WP Plugin vs Laravel Module) and plans (Starter/Professional/Agency). | MEDIUM | Side-by-side metrics: units sold, revenue, renewal rate, support tickets per product. Reveals which products/plans are most profitable. |
| Real-time revenue counter | Live-updating revenue total on admin dashboard. Psychological motivator for operators. Creates "alive" feeling. | LOW | WebSocket or Server-Sent Events pushing revenue updates. Fallback to 30-second polling. Animated counter (count-up pattern already in codebase). |
| Scheduled reporting | Auto-generate weekly/monthly reports and email to admins. "Your weekly ConversionFlow report" with key metrics. | MEDIUM | Background job (Redis queue or cron) generates report, sends via email. Report includes: revenue, new customers, expiring licenses, support ticket stats. |
| Smart renewal reminders | Automated email sequence: 30 days before expiry, 7 days, 1 day, day of, 7 days after. With renewal link pre-filled. | MEDIUM | Background job checks expiring licenses daily. Email template with customer name, license details, one-click renewal link. |
| Customer lifetime value (CLV) tracking | Calculate and display CLV per customer: total spend + predicted renewal value. Helps admin identify VIP customers. | MEDIUM | CLV = sum of all orders + (avg renewal rate * renewal value). Display on customer detail page. Flag high-CLV customers for priority support. |

---

### Anti-Features (Commonly Requested, Often Problematic)

Features to explicitly NOT build. Documented to prevent scope creep.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| Local license generation | "What if central API is down? Generate locally as fallback." | Violates project constraint: NEVER generate licenses locally. Creates license drift, duplicate keys, activation conflicts. Central API is the single source of truth. | Queue the request in Redis. Retry with exponential backoff. Show "pending" status to customer. Never generate locally. |
| Built-in email marketing | "Send newsletters, drip campaigns, product announcements from the dashboard." | Email delivery is a specialized domain. SPF/DKIM/DMARC configuration, deliverability monitoring, bounce handling, unsubscribe compliance. Not the team's core competency. | Integrate with Resend for transactional emails. Use a dedicated email service (Mailchimp, Resend Campaigns) for marketing emails. |
| Live chat / real-time messaging | "Customers should chat with support in real-time." | WebSocket infrastructure, message persistence, presence detection, typing indicators. Massive complexity for a team of 2-3. BD customers already use WhatsApp. | Support ticket system for structured support. WhatsApp link for urgent issues. No live chat widget. |
| Built-in CMS for marketing pages | "Admin should edit the homepage, pricing, features from the dashboard." | Marketing site (v1.x) is a Next.js app with TypeScript data files and MDX. Adding a CMS would require either a headless CMS integration or building a full content editor. Both are major scope expansion. | Marketing content stays in code. Dashboard is for operational management, not content editing. |
| Automatic fraud blocking | "Auto-block suspicious license activations." | False positives block legitimate customers (shared hosting, office networks, developers testing). Automatic blocking without human review causes support nightmares and lost customers. | Flag suspicious activity for admin review. Admin decides whether to revoke. Show evidence (IPs, timestamps, patterns) to support the decision. |
| Multi-tenant / white-label | "Let other agencies run their own ConversionFlow instance." | Multi-tenant architecture requires database isolation, custom domains, per-tenant configuration, billing for the platform itself. Complete architecture redesign. | Single-tenant. Devsroom runs one instance. Other agencies can become resellers with coupon codes. |
| Social login (Google/Facebook/GitHub) | "Let customers log in with Google." | Better Auth supports it, but adds OAuth app management, token refresh, provider-specific edge cases. BD customers are less familiar with social login than email/password. Also adds a dependency on external services that may be blocked in BD. | Email/password only for v2.0. Social login can be added later via Better Auth if customer demand exists. |
| Subscription/recurring billing | "Offer monthly subscription plans." | The product is one-time payment. Adding subscriptions requires: recurring billing logic, failed payment retry dunning, proration, upgrade/downgrade mid-cycle, Stripe Billing integration. Completely different business model. | Stay one-time payment. Renewal is a separate purchase that extends the update/support period. Not a subscription. |
| Built-in analytics tracking (Google Analytics alternative) | "Track page views, user behavior, funnels ourselves." | Building analytics from scratch is a full product. Plausible is already chosen for marketing site. Use existing tools. | Plausible for marketing site analytics. Internal event tracking for conversion funnel (lightweight: just store events in DB). |
| Mobile app / PWA | "Customers should manage licenses from their phone." | Building and maintaining a mobile app doubles the development burden. The responsive web dashboard is sufficient. PWA adds service worker complexity without clear benefit. | Responsive web design for both portals. Test on mobile browsers. No native app, no PWA. |

---

## Feature Dependencies

```
[Database Layer: PostgreSQL + Drizzle ORM + Redis]
    |
    +--required by--> [Authentication: Better Auth]
    |                       |
    |                       +--required by--> [Customer Portal: all features]
    |                       +--required by--> [Admin BI Dashboard: all features]
    |                       +--required by--> [Checkout: user creation]
    |
    +--required by--> [Central Licensing: API sync + webhooks]
    |                       |
    |                       +--required by--> [License Intelligence: piracy detection]
    |                       +--required by--> [Customer Portal: license management]
    |                       +--required by--> [Admin BI: license metrics]
    |
    +--required by--> [Checkout: order creation]
    |                       |
    |                       +--requires--> [Central Licensing: POST on purchase]
    |                       +--requires--> [SSL Commerce: payment processing]
    |                       +--enhances--> [Billing: invoice generation]
    |
    +--required by--> [BD Manual Payments: transaction verification]
    |
    +--required by--> [Admin BI Dashboard: all analytics queries]

[Authentication: Better Auth]
    +--required by--> [Customer Portal: dashboard, licenses, billing, downloads, tickets, notifications]
    +--required by--> [Admin BI Dashboard: KPIs, charts, reports, user management, invoice management]
    +--required by--> [RBAC: route protection via proxy.ts]
    +--required by--> [Audit Logging: who did what]

[Central Licensing API: license.devsroom.com]
    +--required by--> [License Intelligence: sync, webhooks, domain tracking]
    +--required by--> [Checkout: license creation on purchase]
    +--required by--> [Customer Portal: license activation/deactivation]
    +--enhances--> [Admin BI: license status metrics, renewal rates]

[Checkout System: payments + order flow]
    +--requires--> [Database: order, invoice tables]
    +--requires--> [Authentication: user identification]
    +--requires--> [Central Licensing: license creation]
    +--enhances--> [Admin BI: revenue metrics, conversion funnel]
    +--enhances--> [Customer Portal: billing history, invoices]

[Dashboard UI: backenddashboard/ port]
    +--required by--> [Customer Portal: layout, navigation, components]
    +--required by--> [Admin BI Dashboard: layout, charts, tables, forms]

[SSL Commerce Gateway]
    +--requires--> [Checkout: order creation before payment]
    +--provides--> [IPN Handler: async payment confirmation]
    +--enhances--> [Admin BI: payment method analytics]

[BD Manual Payments]
    +--requires--> [Checkout: order creation]
    +--requires--> [Admin: manual verification workflow]
    +--conflicts with--> [SSL Commerce: same order, different payment paths]

[Coupons + Tax/VAT]
    +--requires--> [Checkout: order total calculation]
    +--enhances--> [Admin BI: discount analytics, tax reporting]
```

### Critical Dependency Chains

1. **Database -> Auth -> Portal/Dashboard:** Nothing works without the database layer and authentication. These are the absolute foundation.

2. **Database -> Central Licensing -> License Management:** The central API sync must be working before customer license management can function. Customer portal cannot show license data until it has been synced from license.devsroom.com.

3. **Auth -> Checkout -> Central API -> License:** The complete purchase flow is a chain: authenticate user -> create order -> process payment -> call central API to generate license -> store mapping locally -> send confirmation. If any link breaks, the purchase fails.

4. **Dashboard UI -> Admin BI:** The admin dashboard visual design comes from backenddashboard/. All BI components (charts, metrics, tables) must be built within that design system. Port the template first, then wire data.

5. **SSL Commerce IPN -> Order Confirmation:** SSL Commerce payment is asynchronous. The IPN handler is the only reliable way to confirm payment. Without it, orders stay in "pending" forever.

### Dependency Notes

- **BD Manual Payments vs SSL Commerce:** These are parallel payment paths for the same checkout. Manual payments require admin verification (human in the loop). SSL Commerce is automated via IPN. Both create orders in the same table with different payment_method values.
- **Central Licensing is read-only for this app:** The app NEVER generates licenses. It only syncs from the central API and caches locally. All write operations (create, activate, deactivate, renew) go through the central API.
- **Webhook reliability:** If webhooks from license.devsroom.com fail, the scheduled fallback sync (hourly) catches up. The system must be designed to handle stale data gracefully.
- **RBAC spans all features:** Role-based access control is not a standalone feature. It is a cross-cutting concern applied to every admin and customer route via proxy.ts.

---

## MVP Definition

### Launch With (v2.0 Phase 1-3)

Minimum viable platform -- what is needed to serve paying customers and give admins business intelligence.

- [ ] **Database + Auth foundation** -- PostgreSQL schema, Drizzle ORM, Redis, Better Auth with dual login, 4-role RBAC, email verification, password reset
- [ ] **Central Licensing sync** -- Webhook handlers for license events, scheduled fallback sync, local license cache
- [ ] **Customer Portal: Dashboard overview** -- Active licenses, expiring soon, quick actions
- [ ] **Customer Portal: License management** -- View, copy key, deactivate domain, sync status
- [ ] **Customer Portal: Downloads** -- Download latest/older plugin versions with changelog
- [ ] **Checkout: BD manual payments** -- bKash, Nagad, Rocket, Bank Transfer with admin verification workflow
- [ ] **Checkout: SSL Commerce** -- Hosted payment page, IPN handler, order validation
- [ ] **Admin BI: Executive overview** -- Total revenue, active customers, MRR, ARR, growth indicators
- [ ] **Admin BI: Sales performance** -- Total sales, conversion rate, refund rate
- [ ] **Admin BI: Revenue charts** -- Daily/weekly/monthly trends with ApexCharts
- [ ] **Admin BI: Invoice management** -- View/filter invoices, mark paid, send reminders
- [ ] **Dashboard UI** -- Port layout, sidebar, charts from backenddashboard/ template
- [ ] **Audit logging** -- Admin action tracking for dispute resolution

### Add After Validation (v2.1)

Features to add once the core platform is stable and serving customers.

- [ ] **Support ticket system** -- When manual email/WhatsApp support becomes unsustainable. Trigger: >20 support emails/week.
- [ ] **Coupon codes** -- When marketing needs promotional campaigns. Trigger: first promotional campaign planned.
- [ ] **Customer Portal: Billing history** -- When customers start asking for payment records. Requires invoice PDF generation.
- [ ] **Notifications center** -- When customers miss important events (license expiry, payment failures). Trigger: first complaint about not knowing license expired.
- [ ] **Admin BI: User growth charts** -- When there is enough signup data to visualize trends. Trigger: >100 registered users.
- [ ] **Admin BI: Activity feed** -- When admins need real-time awareness of platform events. Trigger: support staff missing important events.
- [ ] **Export functionality (CSV/Excel/PDF)** -- When admins need reports for accounting or meetings. Trigger: first request for exportable data.
- [ ] **Smart renewal reminders** -- Automated email sequence for expiring licenses. Trigger: manual renewal reminders becoming tedious.

### Future Consideration (v2.2+)

Features to defer until the platform has traction and data to justify them.

- [ ] **Churn analytics** -- Requires historical data (6+ months of license expiry patterns). No data to analyze at launch.
- [ ] **Conversion funnel tracking** -- Requires significant event tracking infrastructure. Implement after basic analytics are proven.
- [ ] **Retention analytics (day 1/7/30/90)** -- Requires cohort data that only exists after customers have been active for months.
- [ ] **Piracy detection** -- Requires activation data from central API. Implement when suspicious patterns start appearing.
- [ ] **Geographic analytics heatmap** -- Requires customer location data (billing addresses). Nice-to-have visualization.
- [ ] **Scheduled reporting** -- Automated weekly/monthly email reports. Useful but not critical at low volume.
- [ ] **CLV tracking** -- Requires purchase history across multiple transactions. One-time payment model means CLV = purchase price until renewals exist.
- [ ] **Product performance comparison** -- Only 2 products currently (WP Plugin, Laravel Module). Not enough data for meaningful comparison.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Database + Drizzle ORM setup | HIGH (enables everything) | MEDIUM | P1 |
| Better Auth integration + RBAC | HIGH (enables everything) | MEDIUM | P1 |
| Central licensing webhook handlers | HIGH (data integrity) | HIGH | P1 |
| Customer dashboard overview | HIGH (first thing customers see) | MEDIUM | P1 |
| License list + detail + copy key | HIGH (core customer need) | MEDIUM | P1 |
| License deactivation | HIGH (customer autonomy) | MEDIUM | P1 |
| Downloads section | HIGH (product delivery) | LOW | P1 |
| BD manual payments (bKash/Nagad/Rocket/Bank) | HIGH (primary payment method) | HIGH | P1 |
| SSL Commerce integration | HIGH (automated payments) | HIGH | P1 |
| Admin executive overview (KPIs) | HIGH (business health visibility) | MEDIUM | P1 |
| Admin revenue trend charts | MEDIUM (decision making) | MEDIUM | P1 |
| Admin invoice management | HIGH (operational necessity) | MEDIUM | P1 |
| Dashboard UI port from backenddashboard/ | HIGH (visual foundation) | MEDIUM | P1 |
| Audit logging | MEDIUM (dispute resolution) | LOW | P1 |
| Email verification + password reset | MEDIUM (account security) | LOW | P1 |
| Admin 2FA | MEDIUM (admin security) | MEDIUM | P1 |
| Session management (Redis) | HIGH (security + UX) | MEDIUM | P1 |
| Scheduled fallback license sync | MEDIUM (data reliability) | MEDIUM | P1 |
| Support tickets | HIGH (customer satisfaction) | HIGH | P2 |
| Coupon codes | MEDIUM (marketing flexibility) | MEDIUM | P2 |
| Invoice PDF download | MEDIUM (customer accounting) | MEDIUM | P2 |
| Billing history | MEDIUM (customer transparency) | LOW | P2 |
| Notifications center | MEDIUM (customer engagement) | MEDIUM | P2 |
| User growth charts | MEDIUM (growth tracking) | LOW | P2 |
| Activity feed | MEDIUM (admin awareness) | MEDIUM | P2 |
| Data export (CSV/Excel/PDF) | MEDIUM (reporting) | MEDIUM | P2 |
| License renewal flow | HIGH (revenue continuity) | HIGH | P2 |
| Smart renewal reminders | MEDIUM (retention tool) | MEDIUM | P2 |
| Date range + dashboard filters | HIGH (analytics usability) | MEDIUM | P2 |
| Churn analytics | MEDIUM (business intelligence) | HIGH | P3 |
| Conversion funnel tracking | MEDIUM (optimization) | HIGH | P3 |
| Retention analytics | MEDIUM (product insights) | MEDIUM | P3 |
| Geographic analytics heatmap | LOW (visualization) | MEDIUM | P3 |
| Piracy detection | MEDIUM (revenue protection) | HIGH | P3 |
| Product performance comparison | LOW (2 products only) | LOW | P3 |
| Scheduled reporting | LOW (convenience) | MEDIUM | P3 |
| CLV tracking | LOW (one-time model limits value) | MEDIUM | P3 |
| Real-time revenue counter | LOW (cosmetic) | LOW | P3 |

**Priority key:**
- P1: Must have for launch -- the platform cannot function without these
- P2: Should have, add when core is stable -- important but not blocking
- P3: Nice to have, future consideration -- valuable with data/time

---

## Feature Complexity Notes

### HIGH Complexity Features (Plan Extra Time)

1. **SSL Commerce Integration (3-step flow):**
   - Step 1: POST to `https://securepay.sslcommerz.com/gwprocess/v4/api.php` with store_id, store_passwd, total_amount, tran_id, success/fail/cancel/IPN URLs, product details, customer info
   - Step 2: Redirect customer to SSL Commerce hosted page (supports bKash, cards, mobile banking, internet banking)
   - Step 3: Handle IPN at webhook URL. Verify with Validation API: POST to `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php` with val_id + store_id + store_passwd. Only then mark order as paid.
   - Sandbox: sandbox.sslcommerz.com for testing. Production: securepay.sslcommerz.com.
   - BDT range: 10 - 500,000. No USD support in BDT gateway.

2. **BD Manual Payments (admin verification workflow):**
   - Customer selects bKash/Nagad/Rocket/Bank Transfer
   - System shows payment instructions (phone number for bKash/Nagad/Rocket, bank account details for Bank Transfer)
   - Customer sends payment externally, enters transaction ID / reference number
   - Order created with status "pending_verification"
   - Admin sees pending verifications in dashboard
   - Admin verifies payment received (checks their bKash/bank statement)
   - Admin approves or rejects order
   - On approval: same flow as SSL Commerce success -> call central API -> store mapping

3. **Central Licensing Webhook Handlers:**
   - Must handle: license-created, license-updated, license-expired, payment-refunded
   - Each webhook must be: authenticated (shared secret HMAC), idempotent (handle duplicate deliveries), ordered (handle out-of-order delivery)
   - Fallback: hourly scheduled sync fetches all licenses from central API and reconciles local cache
   - Must never generate licenses locally -- only sync and cache

4. **Support Ticket System:**
   - Full CRUD for tickets + threaded replies + file attachments
   - File upload handling (storage, virus scanning optional, size limits)
   - Customer can create and view own tickets
   - Admin/support_staff can view all tickets, assign, respond, close
   - Email notifications on new reply
   - Status workflow: open -> in-progress -> resolved -> closed

5. **Piracy Detection:**
   - Requires activation event data from central API (IP, domain, timestamp per activation)
   - Heuristic rules engine: rate of activation, unique IP count, geographic spread, domain patterns
   - Admin review interface with evidence display
   - Manual action: warn customer, revoke license, or dismiss alert
   - NOT automatic blocking (too many false positives)

---

## Competitor Feature Analysis

| Feature | WooCommerce.com | Freemius (WP plugin SaaS) | Our Approach |
|---------|-----------------|---------------------------|--------------|
| Customer portal | My Account page: purchases, downloads, licenses, support | Freemius dashboard: licenses, upgrades, billing | Standalone customer portal with BD-specific payment support |
| Admin BI | WooCommerce Admin analytics (revenue, orders, customers) | Freemius vendor dashboard (sales, revenue, growth) | Custom BI dashboard ported from backenddashboard/ template, tailored for license intelligence |
| License management | WooCommerce Software License (basic) | Freemius licensing (activation, deactivation, site management) | Central API at license.devsroom.com + local sync cache. Never generate locally. |
| Payment methods | Stripe, PayPal, bank transfer | Stripe, PayPal | BD manual payments (bKash/Nagad/Rocket/Bank) + SSL Commerce gateway. BD-first. |
| Pricing model | Subscription or one-time | Freemium (free + premium) | One-time payment with renewal for updates/support. 3 tiers: Starter/Professional/Agency. |
| Analytics depth | Standard ecommerce metrics | Growth analytics, conversion, retention | Full BI: revenue intelligence, churn, conversion funnel, retention, geographic analytics |
| Anti-piracy | None built-in | Freemius has code obfuscation + license enforcement | Piracy detection via activation pattern analysis. Admin review, not auto-blocking. |

---

## SSL Commerce Integration Reference

Detailed notes from SSL Commerce API v4 documentation research.

### Payment Flow
```
Customer -> Selects product + plan
         -> Clicks "Pay with SSL Commerce"
         -> Server creates session (POST to init API)
         -> Receives redirect_url (GatewayPageURL)
         -> Redirect customer to SSL Commerce hosted page
         -> Customer pays (bKash/card/mobile banking)
         -> SSL Commerce sends IPN to our webhook
         -> Customer redirected to success/fail/cancel URL
         -> Server validates payment via Validation API
         -> On validated: create license via central API, store mapping, generate invoice
```

### Key Parameters (Session Creation)
- `store_id`: Provided by SSL Commerce on registration
- `store_passwd`: API password from SSL Commerce
- `total_amount`: BDT amount (10-500,000 range)
- `currency`: "BDT" (BDT gateway only)
- `tran_id`: Unique transaction ID (our order ID)
- `success_url`: Redirect on payment success
- `fail_url`: Redirect on payment failure
- `cancel_url`: Redirect on customer cancel
- `ipn_url`: Webhook for async notification (MOST IMPORTANT for reliability)
- `product_name`, `product_category`, `product_profile`: Product metadata
- `cus_name`, `cus_email`, `cus_phone`: Customer info (required for bKash)

### IPN Handler Requirements
- Endpoint: POST handler (Next.js API route or server action)
- Validate: Must call Validation API before trusting IPN data
- Idempotency: Same tran_id may be delivered multiple times
- Security: Verify request came from SSL Commerce (check store_id matches)
- Response: Return "VALID" string to acknowledge receipt

### Validation API
- URL: `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php`
- Params: val_id (from IPN), store_id, store_passwd, format (json)
- Returns: status (VALID/INVALID), amount, currency, bank_txn, card_type, etc.
- MUST call this before marking order paid -- never trust the redirect URL alone

---

## Sources

- `.planning/PROJECT.md` -- Complete v2.0 requirements, constraints, key decisions
- SSL Commerce API v4 documentation (https://developer.sslcommerz.com) -- Payment flow, session creation, IPN handling, validation API, refund API. Read in full.
- SSL Commerce integration guide (https://www.sslcommerz.com) -- Overview, sandbox testing, Easy Checkout vs Hosted Payment. Read in full.
- Stripe Billing features reference (https://stripe.com/billing) -- SaaS BI dashboard patterns: MRR, ARR, churn, conversion funnel, retention, revenue recovery, geographic analytics. Used as reference for feature patterns.
- `backenddashboard/` folder analysis -- Admin dashboard template with ApexCharts, ecommerce metrics, charts, sidebar layout, auth pages, calendar, forms, tables, modals. Package.json confirms: apexcharts, react-apexcharts, @react-jvectormap/core, flatpickr, @tailwindcss/forms.
- SaaS customer portal patterns (training data, verified against WooCommerce.com and Freemius patterns) -- License management, billing history, downloads, support tickets, notifications.
- BD payment ecosystem (training data, limited verification -- bKash and Nagad developer docs were inaccessible during research) -- bKash/Nagad/Rocket mobile banking, Bank Transfer, manual verification workflows.

---

*Feature research for: ConversionFlow v2.0 Dual Portal SaaS Platform*
*Researched: 2026-05-15*
