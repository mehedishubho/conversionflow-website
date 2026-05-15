# Pitfalls Research

**Domain:** SaaS Platform (auth, database, payments, BI dashboard) added to existing Next.js 16 marketing site
**Researched:** 2026-05-15
**Confidence:** HIGH (codebase audit + Better Auth docs + dashboard template analysis)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, production failures, or security breaches.

### Pitfall 1: Dashboard CSS Token Reset Destroys Marketing Site Breakpoints

**What goes wrong:**
The `backenddashboard/globals.css` opens with `--breakpoint-*: initial;` inside its `@theme { }` block (line 9). This resets ALL Tailwind default breakpoints (sm, md, lg, xl, 2xl) to nothing. It also does `--font-*: initial;` (line 6) which wipes all default font family tokens. If this CSS is merged naively into the marketing site's `globals.css`, every responsive breakpoint and font token used across all marketing pages will silently break. The marketing site uses `sm:`, `md:`, `lg:`, `xl:` breakpoints extensively across all 10+ pages and the Navbar/Footer.

**Why it happens:**
The dashboard template was built as a standalone Next.js app with its own self-contained design system. The `--breakpoint-*: initial;` reset is intentional within that context -- it clears defaults before redefining custom sizes (2xsm, xsm, 3xl) plus standard sizes. But when merged with another app that relies on Tailwind defaults, the reset destroys everything.

**How to avoid:**
- Do NOT copy the dashboard's `@theme` block into the marketing site's `globals.css`
- Create a separate CSS file for dashboard-specific tokens (e.g., `src/app/dashboard/globals.css` or a scoped `@theme` block)
- The dashboard's `@theme` tokens (brand-25 through brand-950, gray-25 through gray-950, custom text sizes, custom breakpoints) must be namespaced or isolated
- Use Next.js route groups to load different CSS: marketing site keeps its current `globals.css`, dashboard routes import dashboard CSS
- Alternatively, prefix all dashboard tokens: `--color-dash-brand-500` instead of `--color-brand-500`
- The marketing site's `@theme inline { }` block (lines 56-79 of globals.css) must remain untouched

**Warning signs:**
- Marketing pages lose responsive behavior after dashboard merge
- Font families revert to browser defaults on marketing pages
- `pnpm build` succeeds but layout is completely broken at mobile/tablet breakpoints
- Dashboard-specific colors bleed into marketing pages or vice versa

**Phase to address:**
Phase 1 (Database & Auth Foundation) -- route group architecture and CSS isolation strategy must be established before any dashboard code is ported

---

### Pitfall 2: Two Competing Theme Systems Create Hydration Chaos

**What goes wrong:**
The marketing site uses `next-themes` (ThemeProvider with `attribute="class"`, `defaultTheme="light"`, `enableSystem={false}"`). The dashboard template uses a custom `ThemeContext.tsx` that manually reads/writes `localStorage` and toggles `document.documentElement.classList`. Both systems operate on `<html class="dark">` but with different APIs, initialization timing, and state management. If both are loaded, they fight over the `<html>` class attribute. The custom `ThemeContext` has an `isInitialized` guard that delays class application, which means `next-themes` script runs first, then `ThemeContext` overwrites it one render cycle later -- causing a visible theme flash.

**Why it happens:**
Each codebase was designed independently. The dashboard's ThemeContext was not designed to coexist with `next-themes`. Both use the same CSS class strategy (`.dark` on `<html>`) but with different hydration timing.

**How to avoid:**
- Choose ONE theme system for the entire application
- Use `next-themes` for both marketing and dashboard -- it handles SSR correctly, has the inline script for flash prevention, and already works in the marketing site
- Delete the dashboard's `ThemeContext.tsx` entirely
- Replace `useTheme()` calls in dashboard components with `useTheme()` from `next-themes`
- The dashboard's `ThemeToggleButton` component can be adapted to use `next-themes`' `theme` and `setTheme` instead of the custom `toggleTheme()`
- Test that the dashboard's `@custom-variant dark (&:is(.dark *));` selector works with `next-themes` class strategy (it should, since both target `.dark` class)

**Warning signs:**
- Theme toggle works in one portal but not the other
- Dark mode flash on page load (FOUC)
- Theme state desynchronizes when navigating between marketing and dashboard routes
- Hydration mismatch warnings in console about `<html>` class

**Phase to address:**
Phase 1 (Database & Auth Foundation) -- theme unification must happen before dashboard UI is ported

---

### Pitfall 3: Better Auth Session Invalidation After Schema Changes

**What goes wrong:**
Better Auth manages its own database schema (users, sessions, accounts, verifications tables). When you modify the auth schema (add fields, change column types, add the admin plugin, add secondary storage), existing sessions become invalid because the session data structure no longer matches what the auth library expects. All logged-in users get logged out. In development this is annoying; in production it is a support incident for every customer.

**Why it happens:**
Better Auth uses its own migration system (`npx @better-auth/cli migrate` or `generate`). Running these migrations changes the underlying tables. If the session table structure changes, the serialized session cookie no longer deserializes correctly. The Drizzle adapter (`@better-auth/drizzle`) creates a mapping between Better Auth's expected schema and your Drizzle tables, but this mapping can break during schema evolution.

**How to avoid:**
- Run Better Auth CLI migrations during planned maintenance windows, not during active usage
- Before running auth migrations in production, test in staging with real session data
- Use the `databaseHooks` feature for lifecycle events rather than modifying auth tables directly
- When adding the admin plugin, add all plugins you need at once rather than incrementally
- Keep auth schema changes to a minimum -- use `additionalFields` for custom user data rather than altering core auth tables
- Document the exact Better Auth CLI commands needed for each migration in your deployment runbook
- Consider using Redis `secondaryStorage` for sessions from the start -- this decouples session storage from the auth schema

**Warning signs:**
- Users report being logged out after deployment
- Session table queries return unexpected column errors
- Better Auth logs schema mismatch warnings on startup
- `npx @better-auth/cli generate` shows unexpected diffs

**Phase to address:**
Phase 1 (Database & Auth Foundation) -- establish the full auth schema and migration workflow before any user-facing features depend on it

---

### Pitfall 4: Central Licensing API Single Point of Failure

**What goes wrong:**
The v2.0 platform depends on `license.devsroom.com` for all license operations: purchase completion (POST /api/orders/import), license validation, activation domain management, and webhook notifications. If the central API goes down, purchases fail, license lookups fail, and webhook deliveries stop. The "scheduled fallback sync" mentioned in requirements is critical but often implemented as an afterthought. Without it, a 2-hour central API outage means 2 hours of lost sales data, broken checkout flows, and customer frustration.

**Why it happens:**
The central API is owned by a different system (license.devsroom.com) with its own deployment cycle, uptime guarantees, and maintenance windows. The ConversionFlow platform treats it as synchronous infrastructure but it is a network service subject to latency, timeouts, and outages.

**How to avoid:**
- Implement all central API calls with timeout + retry + circuit breaker from day one
- The purchase flow must be: payment succeeds -> queue job -> job calls central API -> job retries on failure -> job marks order as "pending sync" after max retries
- Never block the customer-facing response on the central API call -- show "Your license is being prepared" and complete sync asynchronously
- Store all order/license data locally FIRST, then sync to central API (eventual consistency, not strong consistency)
- Implement webhook handlers with idempotency keys and signature verification
- The fallback sync job should run every 5-15 minutes, checking for orders/licenses where `synced_at` is NULL or stale
- Monitor central API health with a health check endpoint and alert on degradation
- Document what happens during a full central API outage: customers can still browse, purchase (payment captured), but license delivery is delayed

**Warning signs:**
- Checkout page takes >5 seconds (synchronous central API call in the request path)
- Webhook deliveries failing silently (no alerting on webhook receiver errors)
- License count mismatch between local DB and central API (fallback sync not running)
- Customer support tickets about "I paid but didn't get my license"

**Phase to address:**
Phase 2 (Licensing & Checkout) -- async sync architecture must be designed before the checkout flow is built

---

### Pitfall 5: BD Payment Gateway Integration Has No Official SDK

**What goes wrong:**
bKash, Nagad, and Rocket are mobile financial services (MFS) popular in Bangladesh, but none provide a well-documented, npm-installable SDK. bKash has a merchant API that requires manual token-based OAuth, Nagad's API documentation is primarily in Bengali and inconsistent, and Rocket's API is the least mature of the three. SSL Commerce has better documentation but still requires manual HTTP integration. Developers used to Stripe's clean SDK often underestimate the integration effort for these gateways by 3-5x.

**Why it happens:**
These payment services evolved from mobile telecom companies (bKash from bKash Limited/BRAC, Nagad from Bangladesh Postal Service, Rocket from Dutch-Bangla Bank). Their APIs were designed for merchant integrations, not developer experience. Documentation is fragmented, test environments are unreliable, and sandbox credentials require manual approval processes that take days.

**How to avoid:**
- Start payment gateway integration early -- it will take longer than expected
- Create an abstract `PaymentProvider` interface and implement each gateway as a provider adapter. This isolates the mess:
  ```
  interface PaymentProvider {
    initiatePayment(order): Promise<PaymentSession>
    verifyPayment(transactionId): Promise<PaymentResult>
    refund(transactionId, amount): Promise<RefundResult>
  }
  ```
- For bKash: use their Tokenized Checkout (bKash Tokenized API) -- it is the most reliable flow. You handle: create agreement -> create payment -> execute payment -> query payment
- For manual payments (bKash/Nagad/Rocket "send money" to merchant number): build a manual verification workflow where customer submits transaction ID, admin verifies in MFS app, admin approves order
- SSL Commerce: use their SSLCommerz library pattern -- it has a Node.js integration example in their docs
- Test each gateway with their sandbox/test environments FIRST before writing any production code
- Build payment reconciliation into the admin dashboard -- compare payment gateway reports with local order records daily
- Budget 2-3 weeks per gateway for proper integration and testing

**Warning signs:**
- Payment gateway integration code is a single monolithic function instead of provider adapters
- No manual payment verification workflow (auto-approval of manual payments)
- Test environment credentials not yet obtained
- No payment state machine (order can be in multiple inconsistent states)
- Payment webhook URLs not configured in gateway dashboards

**Phase to address:**
Phase 2 (Licensing & Checkout) -- payment provider abstraction must be designed before any gateway implementation starts

---

### Pitfall 6: Route Group Collision Between `[locale]` and Dashboard Routes

**What goes wrong:**
The current app uses `src/app/[locale]/` for all marketing pages with next-intl. The dashboard needs routes like `/dashboard`, `/admin`, `/dashboard/licenses`, etc. If the dashboard is placed inside `src/app/[locale]/dashboard/`, every dashboard route is processed by the i18n middleware (locale detection, redirect logic), which is unnecessary and can cause redirect loops. If dashboard routes are placed at `src/app/dashboard/` (sibling to `[locale]`), they bypass the locale layout but Next.js must resolve the ambiguity: does `/dashboard` match a literal `dashboard` segment or the dynamic `[locale]` segment? In Next.js App Router, literal segments take precedence over dynamic segments, so `/dashboard` matches `src/app/dashboard/` correctly. But `/admin` could collide with any future locale code.

**Why it happens:**
Next.js App Router resolves routes from most specific to least specific. A literal `dashboard` segment is more specific than `[locale]`, so it works. But this requires careful planning -- any new top-level route must not conflict with valid locale codes ("en", "bn"). The route group structure must be designed upfront.

**How to avoid:**
- Use this route structure:
  ```
  src/app/
    [locale]/          # Marketing site (i18n)
      (marketing)/     # Route group for shared marketing layout
        page.tsx       # Home
        features/
        pricing/
        ...
      layout.tsx       # Locale layout with Navbar, Footer, i18n
    (dashboard)/       # Route group, NO URL segment
      dashboard/       # Customer portal URL
        layout.tsx     # Customer sidebar layout
        licenses/
        billing/
        ...
      admin/           # Admin portal URL
        layout.tsx     # Admin sidebar layout
        analytics/
        users/
        ...
    layout.tsx         # Root layout (passthrough, or auth providers)
  ```
- The root `layout.tsx` should be a passthrough (it already is)
- Auth providers (Better Auth `SessionProvider`) should be in the `(dashboard)` group layout, NOT in root, to avoid loading auth code on marketing pages
- The `[locale]/layout.tsx` keeps its current provider chain (ThemeProvider, NextIntlClientProvider, CustomCursor, Navbar, Footer)
- The `(dashboard)/` group has its own ThemeProvider (next-themes, unified), sidebar contexts, and no i18n overhead
- NEVER place dashboard routes inside `[locale]/` -- the locale handling will interfere

**Warning signs:**
- Dashboard URLs redirect to `/en/dashboard` or `/bn/dashboard` (locale middleware catching dashboard routes)
- i18n messages loaded on dashboard pages unnecessarily
- Marketing Navbar/Footer appearing on dashboard pages (shared layout leak)
- 404 on dashboard routes because `[locale]` catches them first

**Phase to address:**
Phase 1 (Database & Auth Foundation) -- route group architecture must be established before any pages are built

---

### Pitfall 7: Better Auth + Drizzle Schema Drift Between Auth and Application Tables

**What goes wrong:**
Better Auth creates its own tables (user, session, account, verification) with specific column names and types. Your application also needs a `users` table (or extends Better Auth's user table) with custom fields (role, bangla_name, phone, company, central_user_id). If you create a separate `users` table that duplicates Better Auth's `user` table, you get data drift. If you extend Better Auth's user table with `additionalFields`, the fields exist in Better Auth's schema but Drizzle's schema definition must match exactly or migrations will fail.

**Why it happens:**
Better Auth's Drizzle adapter creates a bidirectional mapping. The adapter reads your Drizzle schema and maps it to Better Auth's expected tables. If your Drizzle schema defines columns that Better Auth doesn't know about, or omits columns that Better Auth expects, the adapter throws errors or silently drops data.

**How to avoid:**
- Use `additionalFields` in Better Auth config for custom user fields (role, phone, company, central_user_id) -- this is the supported extension mechanism
- Run `npx @better-auth/cli generate` to generate the Drizzle schema for auth tables, then extend it with your custom fields
- Keep a single `auth.ts` config file that is the source of truth for all auth-related schema
- Your application schema (orders, licenses, downloads, tickets, notifications) should reference the auth user table via foreign key but NOT modify it
- Run `drizzle-kit push` or `drizzle-kit migrate` for application tables, and `npx @better-auth/cli migrate` for auth tables -- understand these are separate migration systems
- When adding the admin plugin, it adds its own tables (ban, etc.) -- run the CLI migration after adding the plugin to config

**Warning signs:**
- Two `users` tables in the database (one from Better Auth, one from your schema)
- Drizzle migration fails with "column already exists" or "column not found"
- Better Auth login works but custom fields are missing or NULL
- `drizzle-kit generate` and `npx @better-auth/cli generate` both try to manage the same tables

**Phase to address:**
Phase 1 (Database & Auth Foundation) -- schema architecture must be finalized before any tables are created

---

### Pitfall 8: Redis Dependency Blocks Local Development

**What goes wrong:**
Redis is planned for sessions (Better Auth secondaryStorage), caching, and background job queues. If the application requires Redis to start (e.g., Better Auth checks Redis connection on initialization), developers cannot run the app locally without Redis installed. On Windows (the development platform per env info), Redis is not natively available and requires WSL2, Docker, or Memurai. This blocks development onboarding and makes the dev environment fragile.

**Why it happens:**
Redis is added as a hard dependency without a fallback. Better Auth's `secondaryStorage` option is designed for Redis but can be implemented with any store. If the Redis connection fails on startup, the entire auth system fails.

**How to avoid:**
- Make Redis optional in development -- use an in-memory fallback or disable secondary storage entirely
- Better Auth's `secondaryStorage` can be conditionally provided:
  ```typescript
  secondaryStorage: process.env.REDIS_URL ? {
    get: (key) => redis.get(key),
    set: (key, value, ttl) => redis.set(key, value, { EX: ttl }),
    delete: (key) => redis.del(key),
  } : undefined
  ```
- For background jobs in development, use a simple in-memory queue or skip queue processing
- Provide a `docker-compose.yml` with Redis for developers who want the full stack
- Document Redis setup options for Windows: Docker Desktop (recommended), WSL2 + Redis, or Memurai
- In production, Redis must be required -- but make it a soft requirement in development

**Warning signs:**
- `pnpm dev` fails with Redis connection errors on a new developer's machine
- Developers cannot test auth flows without Docker running
- CI/CD pipeline fails because Redis is not available
- Auth features break intermittently in development (Redis not running)

**Phase to address:**
Phase 1 (Database & Auth Foundation) -- Redis fallback strategy must be in place before auth is wired up

---

### Pitfall 9: Webhook Secret Verification Skipped in Development, Forgotten in Production

**What goes wrong:**
The central licensing API sends webhooks (license-created, updated, expired, payment-refunded) that must be verified using HMAC signatures. In development, developers often skip signature verification (or use a hardcoded secret) to speed up testing. When deploying to production, the webhook secret is either not configured, not rotated, or the verification code path was never tested and silently passes all webhooks (or rejects all webhooks).

**Why it happens:**
Webhook verification is invisible until it matters. It does not affect functionality in development. Developers test with mock data that does not have real signatures. The production deployment checklist may not include "configure webhook secret" as a step.

**How to avoid:**
- Implement webhook signature verification from day one -- do not add it "later"
- Use environment variables for webhook secrets: `CENTRAL_WEBHOOK_SECRET`
- In development, use a known test secret and sign your mock webhooks with it
- Create a utility function `verifyWebhookSignature(payload, signature, secret)` and use it in EVERY webhook handler
- Add a startup check that warns if `CENTRAL_WEBHOOK_SECRET` is not set
- In production, reject webhooks with invalid signatures with 401 status
- Log all rejected webhooks for debugging
- Test the verification path with real signatures from the central API sandbox before going live

**Warning signs:**
- Webhook handler has no signature verification code
- Webhook secret is hardcoded in source code
- No environment variable for webhook secret
- All webhooks are accepted regardless of signature
- Production webhooks fail with 401 after deployment

**Phase to address:**
Phase 2 (Licensing & Checkout) -- webhook security must be built into the handler from the first implementation

---

### Pitfall 10: Merging Two Next.js Apps Breaks the Build

**What goes wrong:**
The `backenddashboard/` is a complete standalone Next.js app with its own `package.json`, `next.config.ts`, `globals.css`, `layout.tsx`, fonts (Outfit), component library (65+ components), and dependencies (apexcharts, react-apexcharts, jvectormap, swiper, react-dnd, flatpickr, fullcalendar). Porting this into the main app is not a copy-paste operation. The two apps have different:
- Font stacks (Outfit vs DM_Sans + Noto_Sans_Bengali + JetBrains_Mono)
- Theme systems (custom ThemeContext vs next-themes)
- CSS token systems (brand-25-950, gray-25-950 vs accent, surface, border)
- Layout structures (SidebarProvider + AppSidebar vs Navbar + Footer)
- Tailwind configurations (different `@theme` blocks)
- React versions (both 19.x but different minor versions)
- ESLint configs

Naively copying components from backenddashboard into the main project will cause build errors, CSS conflicts, missing dependency errors, and runtime crashes.

**Why it happens:**
The dashboard template was never designed to coexist with another Next.js app. It assumes it IS the entire app. Its components import from its own context providers (`@/context/SidebarContext`, `@/context/ThemeContext`) that don't exist in the main app.

**How to avoid:**
- Port components one at a time, not in bulk
- For each component, resolve these before copying:
  1. Does it import from `@/context/ThemeContext`? -> Replace with `next-themes` `useTheme`
  2. Does it import from `@/context/SidebarContext`? -> Port SidebarContext as-is (it's dashboard-specific)
  3. Does it use CSS classes from the dashboard's `globals.css`? -> Ensure those tokens exist in the dashboard's scoped CSS
  4. Does it use a dependency not in the main app? -> Install it with `pnpm add`
- Add dashboard dependencies incrementally:
  - `pnpm add apexcharts react-apexcharts` (charts -- needed for BI dashboard)
  - `pnpm add flatpickr` (date picker -- if used in admin forms)
  - `pnpm add react-dropzone` (file upload -- if used in support tickets)
  - Skip unnecessary deps: `@fullcalendar/*` (calendar not in v2.0 scope), `swiper` (not needed), `react-dnd` (not needed), `@react-jvectormap/*` (geographic analytics can use simpler alternatives)
- Create a dashboard-specific layout that provides SidebarContext, uses next-themes, and loads dashboard CSS
- The dashboard's `@theme` block should be in a separate CSS file imported only by dashboard routes

**Warning signs:**
- 100+ TypeScript errors after copying dashboard components
- CSS classes from dashboard template have no effect (tokens not registered)
- Components crash at runtime with "useTheme must be used within ThemeProvider" (wrong provider)
- Build fails with missing module errors for dashboard dependencies
- Dashboard and marketing pages share layout chrome (Navbar appearing on dashboard)

**Phase to address:**
Phase 3 (Dashboard UI Porting) -- porting strategy must be planned before any components are moved

---

## Technical Debt Patterns

Shortcuts that seem reasonable during v2.0 development but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip Redis, use in-memory session store | Faster dev setup, no Docker dependency | Sessions lost on server restart, no session sharing across instances, memory leak under load | Development only -- NEVER in production |
| Store payment transaction data as JSON blob in orders table | Faster schema design, no migration for new fields | Cannot query by payment status, cannot index transaction data, reports require full table scan | MVP only -- normalize into separate payments table before launch |
| Implement RBAC with simple role checks (`if (user.role === 'admin')`) | Quick to implement, no library needed | Role changes require code changes, cannot do fine-grained access control, every new permission adds conditional complexity | Never -- use Better Auth admin plugin's `createAccessControl` from the start |
| Copy dashboard components without adapting imports | Fast porting, get UI working quickly | Tight coupling to dashboard's internal structure, every upstream change breaks imports, cannot evolve independently | First pass only -- refactor each component after initial port |
| Sync central API data synchronously in request handlers | Simpler code flow, immediate consistency | Slow checkout (API latency added to response time), request failures when central API is down, no retry logic | Never -- always async with fallback sync |
| Use single `globals.css` for both marketing and dashboard | No CSS loading complexity | Token conflicts, CSS specificity wars, slow compilation as file grows to 3000+ lines | Never -- separate CSS from day one |
| Hardcode license tiers and pricing in components | Quick to display pricing page | Price changes require code deployment, cannot A/B test pricing, admin cannot adjust prices | Acceptable for v2.0 MVP -- move to database config in follow-up |
| Skip webhook idempotency (process every webhook as new) | Simpler handler code | Duplicate license activations, double-refunded orders, incorrect analytics counts | Never -- idempotency keys are essential for distributed systems |
| Use `prisma` or `typeorm` alongside Drizzle | Some team members may know other ORMs | Two ORM runtimes, conflicting migration systems, schema drift between ORMs, larger bundle | Never -- standardize on Drizzle |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Better Auth + Drizzle | Letting both `drizzle-kit migrate` and `npx @better-auth/cli migrate` manage auth tables | Use Better Auth CLI for auth tables, Drizzle Kit for application tables. Never overlap. |
| Better Auth + next-intl | Placing auth session check inside `[locale]` middleware, causing redirect loops for unauthenticated users on dashboard | Auth checks belong in `(dashboard)` route group's layout or proxy.ts, not in i18n middleware |
| Better Auth + Redis | Passing Redis client directly to `secondaryStorage` without connection error handling | Wrap Redis calls in try/catch, provide in-memory fallback, log connection failures |
| bKash payment API | Using bKash Checkout (legacy) instead of Tokenized Checkout | Use bKash Tokenized API -- it supports recurring and has better error handling |
| SSL Commerce | Not configuring the success/cancel/fail callback URLs in SSL Commerce dashboard | Set all three callback URLs in SSL Commerce merchant panel before any integration code |
| Central API webhooks | Verifying webhook signature only in production (skipping in dev) | Verify in all environments with environment-specific secrets. Sign mock webhooks in dev. |
| Central API sync | Syncing immediately after purchase in the same request | Queue the sync job, respond to customer immediately, retry on failure, fallback sync every 15 min |
| PostgreSQL + Drizzle | Using `drizzle-kit push` in production instead of `drizzle-kit migrate` | `push` is for prototyping. Use `generate` to create migration files, `migrate` to apply them in production. |
| Dashboard components + next-themes | Importing dashboard's ThemeContext alongside next-themes | Delete dashboard ThemeContext entirely. Replace all `useTheme()` calls with next-themes import. |
| ApexCharts + Next.js SSR | Importing ApexCharts directly in a server component | ApexCharts requires browser APIs. Use `dynamic(() => import(...), { ssr: false })` or `"use client"` wrapper. |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| BI dashboard queries without time-range indexing | Admin analytics page takes >10s to load, database CPU spikes | Add composite indexes on `(created_at, status)` for orders, licenses tables. Use materialized views for pre-computed metrics. | 10K+ orders |
| Central API sync without batch processing | Fallback sync job processes one order at a time, takes hours to catch up after outage | Implement batch sync: fetch last 1000 modified licenses, update local DB in bulk | 5K+ licenses |
| Better Auth session validation hitting PostgreSQL every request | Database connection pool exhausted, 503 errors during traffic spikes | Use Redis `secondaryStorage` for sessions -- Redis lookup is sub-millisecond, PG connection is 5-50ms | 100+ concurrent authenticated users |
| Dashboard charts loading all historical data | Monthly sales chart queries 2 years of data, returns 50K+ rows to client | Server-side aggregation: compute chart data points in SQL, return only the data points the chart needs | 50K+ orders |
| Redis cache without TTL | Cached data never expires, stale license counts shown in admin dashboard | Set appropriate TTLs: license counts = 5 min, user session = 24h, payment status = 1 min | Immediately (stale data from day one) |
| N+1 queries in admin user list | User list page makes 1 query for users + N queries for each user's license count | Use SQL JOIN with GROUP BY or a single aggregated query | 100+ users in the list |
| Webhook processing in request handler | Webhook handler does heavy processing (sync, email, notifications) synchronously | Acknowledge webhook immediately (200), queue processing job, process asynchronously | 10+ webhooks per minute |
| No pagination on admin tables | Admin order list loads ALL orders, renders 50K+ row HTML table | Server-side pagination with cursor-based approach (not offset-based for large datasets) | 1K+ orders |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Central API credentials in environment variables without rotation | Compromised key gives access to all license operations across all Devsroom products | Store in encrypted secrets manager, rotate every 90 days, use API key with minimum required permissions |
| Accepting payment confirmation from client-side only | Attacker calls the "payment complete" endpoint without actually paying | Always verify payment server-side with the payment gateway's server-to-server API. Never trust client-side payment status. |
| Webhook endpoint without rate limiting | Attacker floods webhook handler with fake events, exhausting server resources | Rate limit webhook endpoint by IP, validate signature before processing, reject invalid signatures early |
| Admin RBAC checks only in frontend (hiding UI elements) | Attacker calls admin API directly without admin role | Every admin API route must verify role server-side. Frontend hiding is UX, not security. Use Better Auth admin plugin's `createAccessControl` for server-side checks. |
| License keys stored in plaintext in database | Database breach exposes all active license keys | Store only license IDs and metadata. The actual license key is managed by central API. This app should never see raw license keys. |
| bKash/Nagad merchant credentials in source code | Credentials leaked via git history | Use environment variables exclusively. Add payment credential patterns to `.gitignore`. Never commit test credentials. |
| No CSRF protection on payment initiation | Attacker tricks admin into initiating refunds or modifying orders | Use Next.js built-in CSRF protection. Add custom CSRF tokens for payment-related mutations. |
| Session fixation via central API user import | Creating a local user from central API data without invalidating any existing sessions for that email | After central API user import, force email verification. Use Better Auth's email verification flow. |
| Admin dashboard accessible without 2FA | Compromised admin password gives full access to all customer data and billing | Implement 2FA for admin and super_admin roles using Better Auth's 2FA plugin. Block admin access without 2FA enabled. |
| Proxy.ts not protecting dashboard routes | Unauthenticated users can access /admin or /dashboard URLs directly | Implement route protection in `proxy.ts` that checks session and role before allowing dashboard/admin routes. |

## UX Pitfalls

Common user experience mistakes in this dual-portal SaaS domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| License activation domain change requires support ticket | Customer self-service blocked for a common operation (staging -> production domain change) | Allow customers to deactivate one domain and activate another from the license management page, with rate limiting (max 2 changes per month) |
| Admin dashboard shows 0 revenue on first load | Fresh admin sees empty dashboard with no context, thinks something is broken | Show onboarding state for empty dashboards: "No data yet. Data will appear after your first sale." |
| Checkout requires account creation before payment | Bangladeshi customers abandon checkout when forced to create account first | Allow guest checkout: collect payment first, then create account with email. Send license details via email + account. |
| Support tickets have no status notification | Customer submits ticket and has no idea if/when it will be addressed | Email notifications on ticket status changes. Show expected response time in ticket UI. |
| License expiry shown only in dashboard | Customer doesn't know license is expiring until it stops working | Email reminders at 30, 14, 7, and 1 day before expiry. Dashboard banner for expiring licenses. |
| Mobile payment flow opens external browser | bKash/Nagad payment redirect opens in external browser on mobile, losing app context | Use bKash/Nagad deep links or in-app browsers where possible. On return, redirect back to the correct page. |
| Dashboard loads all data on first render | Admin opens dashboard and waits 5+ seconds for all analytics to load | Load overview metrics first (fast queries), lazy-load charts and detailed analytics. Show skeleton loaders. |
| Manual payment with no status feedback | Customer sends bKash payment and waits days with no feedback | Auto-acknowledge manual payment submission ("Payment received, pending verification"), admin notification, SLA display ("Verified within 2 hours") |
| Bengali-only error messages in payment flow | Non-Bengali-speaking admin cannot debug payment failures from customer screenshots | Log payment errors in English for admin logs. Show user-facing errors in user's selected locale. |
| Currency toggle not persisted across pages | Customer switches to BDT, navigates away, returns to USD | Persist currency preference in localStorage and URL params. Default to BDT for BD IP addresses. |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Auth login flow:** Often missing -- email verification, password reset, session expiry handling, "remember me" functionality, login rate limiting
- [ ] **RBAC system:** Often missing -- server-side role checks (frontend hiding is not security), role assignment UI, role change audit logging, role-based menu filtering
- [ ] **Checkout flow:** Often missing -- payment failure handling, payment timeout (what happens if customer abandons mid-payment?), order state machine (pending -> paid -> licensed -> expired), duplicate order prevention
- [ ] **Webhook handlers:** Often missing -- idempotency (processing same webhook twice), ordering (events arriving out of order), retry with backoff, dead letter queue for permanently failed webhooks
- [ ] **License sync:** Often missing -- conflict resolution (local says active, central says expired), sync status tracking, manual trigger for admin, sync history/audit log
- [ ] **Admin analytics:** Often missing -- date range filtering, data export (CSV/PDF), real-time updates (stale dashboard), timezone handling (BD is UTC+6)
- [ ] **Invoice generation:** Often missing -- PDF generation, sequential invoice numbering, tax/VAT calculation, invoice cancellation/credit notes
- [ ] **Customer notifications:** Often missing -- notification preferences (opt-out), email delivery tracking, notification history, notification batching (don't send 10 emails for 10 expiring licenses)
- [ ] **Database migrations:** Often missing -- rollback scripts, migration testing in staging, data migration for schema changes (not just DDL)
- [ ] **Error boundaries:** Often missing -- dashboard-specific error boundary (don't crash to white screen), error reporting (Sentry or similar), user-facing error messages
- [ ] **Rate limiting:** Often missing -- login endpoint rate limiting, payment initiation rate limiting, API endpoint rate limiting, webhook endpoint rate limiting
- [ ] **Mobile responsiveness for dashboard:** Dashboard template may look good on desktop but breaks on tablet/mobile -- verify all admin and customer portal pages at 375px, 768px, 1024px

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CSS token conflict after dashboard merge | MEDIUM | Revert to pre-merge globals.css. Create separate dashboard CSS file. Re-port with scoped tokens. Test marketing pages after each component port. |
| Theme system conflict (dual providers) | LOW | Delete ThemeContext.tsx. Replace all dashboard `useTheme()` calls with `next-themes`. Test theme toggle in both portals. |
| Better Auth schema drift | HIGH | Export affected user data. Reset auth schema with CLI. Re-import data with correct field mapping. Force password resets for affected users. |
| Central API sync failure (data drift) | MEDIUM | Run manual full sync from central API. Compare local vs central counts. Reconcile differences. Investigate root cause of sync failure. |
| BD payment gateway integration failure | MEDIUM | Disable failing gateway. Fall back to manual payment verification. Communicate to customers. Debug with gateway sandbox. Re-enable after testing. |
| Route group misconfiguration (404s) | LOW | Reconfigure route groups. Test all marketing routes + dashboard routes. Check proxy.ts matchers. Verify no overlap between `[locale]` and dashboard segments. |
| Production database migration failure | HIGH | Restore from backup. Fix migration script. Test in staging with production data snapshot. Re-run migration during maintenance window. |
| Redis outage in production | MEDIUM | Auth falls back to database sessions (if secondaryStorage is optional). Queue jobs paused. Resume when Redis recovers. Investigate Redis stability. |
| Webhook processing failure (missed events) | MEDIUM | Check dead letter queue. Manually replay failed webhooks. Run fallback sync. Verify data consistency with central API. |
| Dashboard component port breaking build | LOW | Revert the specific component. Port with correct imports and dependencies. Test in isolation before merging. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| CSS token conflict (P1) | Phase 1: Route group + CSS isolation | Marketing pages render correctly after dashboard CSS is added |
| Theme system conflict (P2) | Phase 1: Unify on next-themes | Theme toggle works in both marketing and dashboard |
| Auth schema drift (P3) | Phase 1: Full auth schema + migration workflow | `npx @better-auth/cli migrate` runs cleanly, test users can login |
| Central API SPOF (P4) | Phase 2: Async sync architecture | Simulate central API outage, verify orders still captured locally |
| BD payment integration (P5) | Phase 2: Payment provider abstraction | All 4 payment methods working in sandbox |
| Route group collision (P6) | Phase 1: Route structure design | All marketing routes + dashboard routes return 200, no redirect loops |
| Auth + Drizzle drift (P7) | Phase 1: Unified schema design | Single migration workflow, no duplicate tables |
| Redis dev dependency (P8) | Phase 1: Optional Redis in dev | `pnpm dev` works without Redis, auth flows functional |
| Webhook security (P9) | Phase 2: Secure webhook handlers | Webhook with invalid signature is rejected, valid signature is processed |
| Dashboard merge breaks build (P10) | Phase 3: Incremental porting strategy | Each component works after port, no bulk breakage |
| RBAC server-side checks | Phase 1: Better Auth admin plugin | Non-admin cannot access /admin API routes even with direct API call |
| Payment server-side verification | Phase 2: Payment verification flow | Client-side "payment complete" rejected without server-side verification |
| Session performance | Phase 1: Redis secondary storage setup | Session lookup < 5ms with Redis, < 50ms fallback to DB |
| Admin dashboard empty state | Phase 4: BI Dashboard polish | Fresh install shows helpful empty states, not zeros and broken charts |
| License expiry notifications | Phase 3: Notification system | Email sent at 30/14/7/1 days before expiry |
| Database migration rollback | Phase 1: Migration infrastructure | Every migration has a tested rollback script |

## Sources

- **Codebase audit:** `src/app/globals.css` (marketing CSS tokens, @theme inline block), `backenddashboard/src/app/globals.css` (dashboard CSS with --breakpoint-*: initial reset), `src/app/[locale]/layout.tsx` (provider chain, i18n setup), `backenddashboard/src/context/ThemeContext.tsx` (competing theme system), `backenddashboard/src/app/layout.tsx` (Outfit font, different provider chain)
- **Better Auth documentation:** Database schema (user, session, account, verification tables with all required fields), Admin plugin (RBAC with `createAccessControl`, user management, banning, impersonation), Drizzle adapter (`provider: "pg"`), `secondaryStorage` for Redis, `databaseHooks` for lifecycle events, `additionalFields` for schema extension, CLI commands (`npx @better-auth/cli migrate` / `generate`)
- **Dashboard template analysis:** `backenddashboard/package.json` (dependencies: apexcharts, react-apexcharts, jvectormap, fullcalendar, swiper, react-dnd, flatpickr), 65+ components, route structure with `(admin)` and `(full-width-pages)` groups, separate context providers (SidebarContext, ThemeContext)
- **BD payment ecosystem knowledge:** bKash Tokenized API, Nagad merchant API, Rocket (Dutch-Bangla Bank) integration, SSL Commerce documentation -- all require manual HTTP integration, no npm SDKs, sandbox environments require manual approval
- **Next.js App Router documentation:** Route resolution order (literal before dynamic), route groups (parenthesized directories), layout nesting, parallel routes
- **PROJECT.md requirements:** Central licensing integration spec, 4-role RBAC, BD payment methods, dual portal architecture, proxy.ts rule, self-hosted deployment constraint

---
*Pitfalls research for: ConversionFlow v2.0 Dual Portal SaaS Platform*
*Researched: 2026-05-15*
