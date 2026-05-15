# Technology Stack

**Project:** ConversionFlow v2.0 -- Dual Portal SaaS Platform (Customer Portal + Admin BI Dashboard)
**Researched:** 2026-05-15
**Scope:** NEW dependencies only (database, auth, caching, payments, jobs, exports, dashboard UI)
**Existing stack preserved:** Next.js 16.2.6, React 19.2.4, TailwindCSS v4, Framer Motion, next-themes, next-intl, MDX, Lucide, clsx, tailwind-merge, Sharp, Google Fonts (Syne, DM Sans, JetBrains Mono), Plausible Analytics

---

## Recommended Stack

### Database Layer

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `drizzle-orm` | ^0.45.2 | Type-safe ORM for PostgreSQL queries | Zero runtime dependencies. Full TypeScript inference with SQL-like API. Excellent Drizzle Kit migration tooling. First-class Next.js support. Native support for both `pg` and `postgres.js` drivers. Chosen over Prisma because: no Rust engine binary, lighter bundle, faster cold starts on VPS, better SQL control, better self-hosted deployment story. |
| `drizzle-kit` | ^0.31.10 | Schema migrations and introspection | Official migration tool. Generates SQL migrations from schema changes. `drizzle-kit generate` + `drizzle-kit migrate` workflow. Required peer dep by Better Auth (>=0.31.4). |
| `postgres` | ^3.4.9 | PostgreSQL driver (postgres.js) | Zero-dependency, async/await-native driver. Chosen over `pg` because: no native bindings (works on any VPS), simpler API surface, faster cold start, better edge/runtime compatibility, Drizzle recommends it as the primary driver. Use `pg` (^8.20.0) as an alternative only if PgBouncer transaction-mode pooling is needed. |

**Install:** `pnpm add drizzle-orm postgres` and `pnpm add -D drizzle-kit`

**Schema structure:**
```
src/db/
  schema/            -- One file per domain table
    users.ts         -- users, sessions, accounts (Better Auth tables)
    orders.ts        -- orders, payments, invoices
    licenses.ts      -- license mappings (central_user_id, central_license_id)
    tickets.ts       -- support tickets, replies, attachments
    downloads.ts     -- download logs, version tracking
    notifications.ts -- notification records
    audit.ts         -- audit log entries
    index.ts         -- Barrel export of all schemas
  index.ts           -- Drizzle instance + connection singleton
  migrate.ts         -- Migration runner script
drizzle.config.ts    -- Drizzle Kit config (project root)
```

**Confidence:** HIGH

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `better-auth` | ^1.6.11 | Full authentication framework | Self-hosted, framework-agnostic, built for Next.js. Ships with a dedicated `better-auth/next-js` export, `better-auth/adapters/drizzle` for direct Drizzle ORM integration, `better-auth/plugins/admin` for admin panel user management, `better-auth/plugins/two-factor` for TOTP 2FA, `better-auth/plugins/access` for RBAC role-based access, and `better-auth/plugins/email-otp` for email-based OTP login. The Drizzle adapter is bundled inside the core package at `@better-auth/drizzle-adapter@1.6.11` -- no separate install needed. |

**Install:** `pnpm add better-auth` (zod@^4.4.3 comes as a dependency -- no separate install)

**Key exports (verified from package.json):**
```
better-auth                        -- Server-side auth configuration
better-auth/client                 -- Client-side hooks (useSession, signIn, signOut)
better-auth/next-js                -- Next.js route handler integration (toNextJsHandler)
better-auth/adapters/drizzle       -- Drizzle ORM adapter (built-in, maps Drizzle tables)
better-auth/plugins/admin          -- Admin user management panel
better-auth/plugins/access         -- RBAC / role-based access control
better-auth/plugins/two-factor     -- TOTP 2FA (admin requirement)
better-auth/plugins/email-otp      -- Email OTP for passwordless login
better-auth/plugins/username       -- Username-based auth
better-auth/plugins/bearer         -- API token / bearer auth
better-auth/plugins/custom-session -- Session customization for Redis
better-auth/plugins/organization   -- Multi-tenant organization support
```

**Better Auth peer deps (verified):** `react: ^18.0.0 \|\| ^19.0.0`, `next: ^14.0.0 \|\| ^15.0.0 \|\| ^16.0.0`, `drizzle-orm: ^0.45.2`, `drizzle-kit: >=0.31.4` -- all compatible with our stack.

**Dual auth pattern:** Better Auth supports multiple auth configurations on the same server. Customer portal (`/portal/...`) and admin portal (`/admin/...`) share one Better Auth instance. The `access` plugin provides role-based routing (customer, admin, support_staff, super_admin). The `admin` plugin provides admin-specific user management capabilities.

**Integration files:**
```
src/lib/auth.ts              -- Better Auth server config (plugins, Drizzle adapter, database)
src/lib/auth-client.ts       -- Better Auth client config (for client components)
src/app/api/auth/[...all]/route.ts  -- Catch-all auth API route handler
src/proxy.ts                 -- Auth middleware for route protection (NOT middleware.ts)
```

**Confidence:** HIGH

### Caching, Sessions, and Queues (Redis)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `ioredis` | ^5.10.1 | Redis client for caching, sessions, rate limiting | Full-featured Redis client with cluster support, pipeline/multi, Lua scripting, and robust reconnection. Used for: Better Auth custom session store, API response caching (license lookups, product data), rate limiting counters, and as the shared infrastructure for BullMQ queues. Standard Node.js Redis client -- nothing else comes close in maturity. |
| `bullmq` | ^5.76.8 | Redis-backed job queue for background tasks | Ships ioredis@5.10.1 as a bundled dependency. Supports delayed jobs, recurring/cron jobs, job prioritization, rate limiting per queue, retries with exponential backoff, dead-letter queues, and job progress tracking. Perfect for: license sync from central API, webhook retry processing, scheduled analytics reports, email sending, large data export jobs. |

**Install:** `pnpm add ioredis bullmq`

**Note on Redis duplication:** BullMQ bundles its own ioredis for queue operations. Installing `ioredis` separately gives us a dedicated client for caching and session operations independent of the queue system. Standard practice -- BullMQ manages its own connections for queue operations, the app uses a separate connection for general caching.

**Redis connection pattern:**
```
src/lib/redis.ts     -- Redis client singleton (ioredis, used for caching + sessions)
src/jobs/queues.ts   -- BullMQ queue definitions (BullMQ uses its own internal ioredis)
src/jobs/workers/    -- BullMQ worker processes (separate from Next.js in production)
```

**Redis usage areas:**
1. Better Auth session store (via custom session adapter writing to Redis)
2. API response caching (license lookups from central API, product catalog)
3. Rate limiting counters (rate-limiter-flexible Redis backend)
4. Feature flags / configuration cache
5. BullMQ job queues (internal ioredis)

**Worker deployment:** In production, BullMQ workers run as a separate Node.js process (`npx tsx src/jobs/workers/index.ts`). During development, workers can run alongside the Next.js dev server. The workers connect to the same Redis instance.

**BullMQ verified dependencies:** `ioredis@5.10.1`, `cron-parser@4.9.0`, `msgpackr@2.0.1`

**Confidence:** HIGH

### Charts and Data Visualization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `apexcharts` | ^5.11.0 | Chart rendering engine | Already used in `backenddashboard/` template. Full chart library: line, bar, area, pie, donut, radar, heatmap, treemap, gauge, range bar. Cannot SSR -- must use `dynamic()` import with `ssr: false`. |
| `react-apexcharts` | ^2.1.0 | React wrapper for ApexCharts | Peer deps: `apexcharts>=5.10.1`, `react>=16.8.0`. Compatible with React 19. Dashboard template already uses the proven pattern. |
| `@react-jvectormap/core` | ^1.0.4 | Interactive world map for geographic analytics | Already in dashboard template. Used for sales-by-country heatmap in admin dashboard. React 19 compatible (template has override in package.json). |
| `@react-jvectormap/world` | ^1.1.2 | World map data for jVectormap | Companion to core. Dashboard template uses this for the CountryMap component. |

**Install:** `pnpm add apexcharts react-apexcharts @react-jvectormap/core @react-jvectormap/world`

**Proven pattern from dashboard template (MonthlySalesChart.tsx):**
```typescript
"use client";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
```
This pattern is already battle-tested in the dashboard template. All chart components must use `"use client"` and dynamic import.

**Charts needed for Admin BI Dashboard:**
- Revenue trend line chart (daily/weekly/monthly/yearly)
- Sales performance bar chart
- User growth area chart
- Churn rate donut chart
- Conversion funnel horizontal bar chart
- Product performance radar chart
- Geographic heatmap (jVectormap)
- Retention analytics multi-line chart
- MRR/ARR gauge chart

**Confidence:** HIGH

### Data Tables

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@tanstack/react-table` | ^8.21.3 | Headless table component for data grids | Peer deps: `react>=16.8`, `react-dom>=16.8` -- compatible with React 19. Headless design gives full styling control with TailwindCSS, matching the existing dashboard template aesthetic. Supports sorting, filtering, pagination, row selection, column resizing, and row virtualization for large datasets. Also listed as a peer dep by Better Auth for its admin UI. |

**Install:** `pnpm add @tanstack/react-table`

**Use cases:**
- Admin: Orders table, users table, licenses table, invoices table, tickets table
- Customer: Licenses table, orders table, invoices table, downloads table
- All tables: Server-side pagination, column sorting, text search, date range filters

**Confidence:** HIGH

### Payment Gateways (Bangladesh)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `bkash-payment` | ^3.0.5 | bKash tokenized checkout API | Most maintained bKash npm package (updated Sep 2024). Handles the full tokenized checkout flow: create agreement, execute payment, query payment status. Dependencies: axios, uuid, node-global-storage. |
| `sslcommerz` | ^1.7.0 | SSL Commerz payment gateway | Covers credit/debit cards, internet banking, and mobile banking across Bangladesh. Handles full checkout flow: session init, payment validation, IPN (instant payment notification), refund. Dependencies: form-data, isomorphic-fetch, node-fetch. Well-maintained community package. |
| Manual flow (custom) | N/A | Nagad, Rocket, Bank Transfer | No reliable npm packages exist for Nagad or Rocket merchant APIs. These will be implemented as manual payment verification: customer sends payment, uploads proof screenshot, admin reviews and approves. Bank transfer follows the same pattern. This is standard practice for BD SaaS platforms. |

**Install:** `pnpm add bkash-payment sslcommerz`

**Payment architecture:**
```
PaymentMethod enum:
  bkash            -> bkash-payment package (tokenized API flow)
  nagad            -> manual flow (no public merchant API SDK)
  rocket           -> manual flow (no public merchant API SDK)
  ssl_commerz      -> sslcommerz package (card/bank/mobile)
  bank_transfer    -> manual flow (upload payment proof)

PaymentStatus enum:
  pending -> processing -> completed -> failed -> refunded

PaymentFlow:
  1. Customer selects plan + payment method
  2a. [API methods] Redirect to payment gateway, callback verifies
  2b. [Manual methods] Customer uploads proof, admin verifies
  3. On success: create/find customer -> POST to license.devsroom.com/api/orders/import
  4. Store central_user_id + central_license_id mapping locally
```

**API routes:**
```
src/app/api/payments/
  bkash/
    create/route.ts       -- Initialize bKash payment
    execute/route.ts      -- Execute bKash payment
    callback/route.ts     -- bKash callback handler
  sslcommerz/
    init/route.ts         -- Initialize SSL Commerz session
    success/route.ts      -- SSL Commerz success callback
    fail/route.ts         -- SSL Commerz failure callback
    ipn/route.ts          -- SSL Commerz IPN handler
  manual/
    submit/route.ts       -- Customer uploads payment proof
    verify/route.ts       -- Admin verifies manual payment
```

**SSL Commerz coverage:** Visa, Mastercard, DBBL Nexus, City Bank, internet banking, mobile banking (including bKash via SSL Commerz as a payment option), all major BD bank transfers. This makes it the single most comprehensive payment option.

**Confidence:** MEDIUM -- bKash and SSL Commerz packages are community-maintained (not officially published by the companies). Standard practice in BD developer ecosystem. Manual flows for Nagad/Rocket are the accepted norm.

### Export Libraries

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `xlsx` | ^0.18.5 | Excel (XLSX) file generation and reading | SheetJS community edition. Read and write Excel files server-side. No peer deps. For large exports (>10K rows), generate in a BullMQ worker and notify the user when ready. |
| `papaparse` | ^5.5.3 | CSV parsing and generation | Zero-dependency CSV library. Handles edge cases correctly (quoted fields, special characters, Unicode Bengali text). Use for CSV export and any CSV import needs. |
| `@types/papaparse` | ^5.5.2 | TypeScript types for PapaParse | Type definitions. |
| `@react-pdf/renderer` | ^4.5.1 | PDF generation from React components | Write PDF documents as JSX templates. Peer dep: `react: ^16.0.0 \|\| ^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0` -- confirmed React 19 compatible. Best for invoice PDFs, analytics report PDFs. JSX-based template approach is far more maintainable than programmatic PDF libraries. |

**Install:** `pnpm add xlsx papaparse @react-pdf/renderer` and `pnpm add -D @types/papaparse`

**Export strategy by data size:**
```
Small (< 1K rows):   Generate synchronously in API route, return as file download
Medium (1K-10K):     Generate in API route with streaming response
Large (> 10K):       Queue in BullMQ worker, email/notify user when ready
```

**Export use cases:**
- Admin: Revenue reports (CSV/Excel), user lists (CSV), invoice batches (PDF), license reports (Excel)
- Admin: Analytics snapshots (PDF), geographic data (CSV), transaction history (Excel)
- Customer: Invoice PDF downloads, order history (CSV), license details (PDF)

**Confidence:** HIGH

### Email

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `nodemailer` | ^8.0.7 | Transactional email sending | Standard Node.js email library. Supports SMTP, Amazon SES, and any transactional email provider. Use with a provider like Resend, Amazon SES, or Mailgun. Self-hosted compatible. `@types/nodemailer`@^8.0.0 for TypeScript. |

**Install:** `pnpm add nodemailer` and `pnpm add -D @types/nodemailer`

**Email use cases:**
- Welcome email (new customer signup)
- Email verification
- Password reset
- Invoice/receipt PDF delivery
- License expiration warnings
- Support ticket notifications
- Admin alerts (failed payment, fraud detection, churn alerts)

**Note:** v1.x used Resend SDK directly. For v2.0, nodemailer is more flexible because it works with any SMTP provider and is better suited for self-hosted deployment. If the team already has Resend configured, the Resend SDK from v1.x can be kept for contact forms while nodemailer handles all new transactional emails.

**Confidence:** HIGH

### Rate Limiting and Security

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `rate-limiter-flexible` | ^11.1.0 | Rate limiting for API routes and auth endpoints | Supports Redis as a backend (uses our ioredis connection). Prevents brute force on auth endpoints, API abuse, payment endpoint flooding, and webhook endpoint overload. Works with Next.js API route handlers directly. |

**Install:** `pnpm add rate-limiter-flexible`

**Rate limiting strategy:**
```
Auth endpoints:           5 requests/minute per IP (login, register, password reset)
Payment endpoints:        10 requests/minute per user
API routes:               60 requests/minute per user
Webhook endpoints:        100 requests/minute per IP
Public API (if any):      30 requests/minute per IP
Export endpoints:         5 requests/minute per user
```

**Confidence:** HIGH

### Dashboard UI Components (from backenddashboard/ template)

These are defined in `backenddashboard/package.json`. Port selectively -- only what the ConversionFlow dashboard needs.

| Technology | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-dnd` | ^16.0.1 | Drag and drop | Kanban boards, reorderable lists. Peer dep: `react>=16.11`, React 19 compatible. |
| `react-dnd-html5-backend` | ^16.0.1 | HTML5 DnD backend | Companion to react-dnd. |
| `react-dropzone` | ^15.0.0 | File upload component | Support ticket attachments, manual payment proof uploads. |
| `flatpickr` | ^4.6.13 | Date/time picker | Admin date range filters, report scheduling. |
| `@svgr/webpack` | ^8.1.0 | SVG-to-React webpack loader | Dashboard template uses custom SVG icons. Dev dependency. |
| `@tailwindcss/forms` | ^0.5.11 | Form element styling | Reset/base styles for form elements with TailwindCSS. Dev dependency. |

**Install:** `pnpm add react-dnd react-dnd-html5-backend react-dropzone flatpickr` and `pnpm add -D @svgr/webpack @tailwindcss/forms`

**Do NOT install from dashboard template:** `swiper` (no carousels needed in dashboard), `@fullcalendar/*` (calendar view optional -- skip unless specifically requested), `autoprefixer` (already handled by TailwindCSS v4 PostCSS plugin), `prettier` (project uses ESLint for formatting).

### Utility Libraries

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `date-fns` | ^4.1.0 | Date manipulation and formatting | Tree-shakeable, modern. Used for: date range filtering in analytics, relative time display ("3 days ago"), subscription expiry calculations, chart date axis formatting. |
| `nanoid` | ^5.1.11 | Unique ID generation | Fast, URL-safe, compact IDs. Use for: order reference IDs, ticket numbers, download tokens, export job IDs. Shorter and faster than uuid for non-UUID-format identifiers. |
| `zod` | ^4.4.3 | Schema validation | Comes as a dependency of better-auth -- no separate install needed. Use project-wide for: form validation, API input validation, environment variable validation, payment payload validation. |

**Install:** `pnpm add date-fns nanoid` (zod is already included with better-auth)

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| ORM | Drizzle ORM | Prisma | Prisma requires a Rust engine binary, larger bundle size, slower cold starts on VPS, less control over generated SQL. Drizzle is lighter, faster, zero-dep, and better for self-hosted deployment. |
| PostgreSQL Driver | postgres.js | pg (node-postgres) | pg has callback-based origins and requires native bindings for some features. postgres.js is async-native, zero-dependency, recommended by Drizzle docs. Use pg only if PgBouncer transaction-mode is needed. |
| Auth | Better Auth | NextAuth/Auth.js v5 | NextAuth v5 had a prolonged beta period, limited self-hosting customization, harder to configure for dual-portal (customer vs admin with different auth flows). Better Auth has built-in admin plugin, RBAC access plugin, Drizzle adapter, and first-class self-hosting. |
| Auth | Better Auth | Clerk | Clerk is a managed SaaS auth service with per-MAU pricing. Not suitable for self-hosted VPS deployment. Limits customization of the auth flow. |
| Job Queue | BullMQ | Inngest | Inngest has nice developer experience but requires their SDK and event-driven model. BullMQ is proven, Redis-backed (we already need Redis), no external service dependency, fully self-hosted. |
| Job Queue | BullMQ | Agenda / MongoDB-based | Agenda uses MongoDB. We are using PostgreSQL. BullMQ uses Redis (already planned). |
| Charts | ApexCharts | Recharts | Dashboard template already built with ApexCharts and proven patterns. Switching means rewriting all chart components. ApexCharts also has more chart types (heatmap, treemap) needed for BI analytics. |
| Charts | ApexCharts | Chart.js + react-chartjs-2 | Same reason -- template already uses ApexCharts. |
| CSV | PapaParse | Manual string concatenation | PapaParse handles edge cases (escaping, quoting, special characters, Unicode/Bengali text). Worth the small dependency for correctness. |
| Excel | SheetJS (xlsx) | ExcelJS | xlsx is more established, handles more file formats, smaller API surface for export-only use. ExcelJS has streaming support for very large files but adds complexity. Start with xlsx, switch only if streaming is needed. |
| PDF | @react-pdf/renderer | pdfkit | @react-pdf/renderer uses JSX templates for PDF layout -- much easier for invoice and report design. pdfkit is lower-level and requires manual layout calculations. @react-pdf/renderer confirmed React 19 compatible. |
| Tables | @tanstack/react-table | AG Grid | TanStack Table is headless (no styling opinions), works perfectly with TailwindCSS. AG Grid Community has limited features; Enterprise has licensing costs. |
| Tables | @tanstack/react-table | Material Table | Brings Material Design which conflicts with our custom design system. |
| Email | nodemailer | Resend SDK | Resend is a SaaS product with per-email pricing. nodemailer works with any SMTP provider including self-hosted. More flexible for VPS deployment. |
| Rate Limiting | rate-limiter-flexible | express-rate-limit | express-rate-limit is Express-specific. rate-limiter-flexible works with any Node.js handler including Next.js API routes, and supports Redis for distributed limiting. |
| Redis Client | ioredis | node-redis (@redis/client) | ioredis has better TypeScript types, pipeline support, and is what BullMQ uses internally. More mature ecosystem and wider community adoption. |

---

## What NOT to Install

### Conflicts with Existing Stack
| Package | Why Not |
|---------|---------|
| `@prisma/client` / `prisma` | Conflicts with Drizzle ORM. Using Drizzle. |
| `mongoose` | MongoDB driver. We use PostgreSQL. |
| `next-auth` / `@auth/core` | Conflicts with Better Auth. |
| `@upstash/redis` | Serverless-focused Redis wrapper. We have real Redis via ioredis. |
| `express` | Not needed. Next.js API routes handle server logic. |
| `body-parser` | Built into Next.js API route handling. |
| `multer` | File uploads handled by Next.js `request.formData()`. |
| `cors` | Next.js API routes handle CORS via headers config. |
| `jsonwebtoken` | Better Auth handles JWT/session via its `jose` dependency. |
| `bcrypt` / `bcryptjs` | Better Auth handles password hashing internally. |
| `@vercel/postgres` | Vercel-specific. We are self-hosted. |
| `moment` | Use date-fns instead (tree-shakeable, modern). |

### Redundant with Existing Stack
| Package | Why Not |
|---------|---------|
| `tailwindcss` | Already at v4.3.0. Dashboard template has its own -- keep ours. |
| `next` | Already at 16.2.6. |
| `react` / `react-dom` | Already at 19.2.4. |
| `tailwind-merge` | Already at 3.6.0. Dashboard template has 2.6.0 -- keep ours. |
| `autoprefixer` | Already handled by TailwindCSS v4 PostCSS plugin. |
| `@tailwindcss/postcss` | Already installed. |
| `swiper` | Dashboard template includes it. ConversionFlow dashboard does not need carousels. |

### Unnecessary for This Project
| Package | Why Not |
|---------|---------|
| `@fullcalendar/list` / `timegrid` / `interaction` | Calendar view is optional. Skip unless explicitly requested. |
| `gsap` | Framer Motion covers animation needs. GSAP adds weight and licensing complexity. |
| `styled-components` / `emotion` | CSS-in-JS declining. Tailwind is our styling approach. |
| `shadcn/ui` | Adds component dependency. Dashboard template has its own UI components to port. |
| `zustand` / `jotai` / `redux` | Server components + React state handles UI state. Use React Context for shared dashboard state if needed. |
| `middleware.ts` | Project rule: use `proxy.ts` instead. |

---

## Installation Summary

```bash
# === Database Layer ===
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit

# === Authentication ===
pnpm add better-auth
# zod comes with better-auth -- no separate install

# === Caching, Sessions, and Queues ===
pnpm add ioredis bullmq

# === Charts and Data Visualization ===
pnpm add apexcharts react-apexcharts @react-jvectormap/core @react-jvectormap/world

# === Data Tables ===
pnpm add @tanstack/react-table

# === Payment Gateways (Bangladesh) ===
pnpm add bkash-payment sslcommerz

# === Export Libraries ===
pnpm add xlsx papaparse @react-pdf/renderer
pnpm add -D @types/papaparse

# === Email ===
pnpm add nodemailer
pnpm add -D @types/nodemailer

# === Rate Limiting ===
pnpm add rate-limiter-flexible

# === Dashboard UI Components (selective) ===
pnpm add react-dnd react-dnd-html5-backend react-dropzone flatpickr
pnpm add -D @svgr/webpack @tailwindcss/forms

# === Utilities ===
pnpm add date-fns nanoid
```

**New production dependencies: ~20**
**New dev dependencies: ~5**
**Total stack size: ~47 packages (27 existing + 20 new production + 5 new dev)**

---

## Version Compatibility Matrix

| Package | Version | React 19 | Next.js 16 | Node.js | TypeScript 5 |
|---------|---------|----------|------------|---------|-------------|
| drizzle-orm | ^0.45.2 | N/A | Yes | >=18 | Yes |
| drizzle-kit | ^0.31.10 | N/A | Yes | >=18 | Yes |
| postgres | ^3.4.9 | N/A | Yes | >=18 | Yes |
| better-auth | ^1.6.11 | Yes | Yes (^14\|\|^15\|\|^16) | >=18 | Yes |
| ioredis | ^5.10.1 | N/A | N/A | >=12 | Yes |
| bullmq | ^5.76.8 | N/A | N/A | >=18 | Yes |
| apexcharts | ^5.11.0 | N/A | N/A | N/A | N/A |
| react-apexcharts | ^2.1.0 | Yes (>=16.8) | Yes | N/A | Yes |
| @tanstack/react-table | ^8.21.3 | Yes (>=16.8) | N/A | N/A | Yes |
| @react-pdf/renderer | ^4.5.1 | Yes (^16\|\|^17\|\|^18\|\|^19) | N/A | N/A | Yes |
| xlsx | ^0.18.5 | N/A | N/A | N/A | Yes |
| papaparse | ^5.5.3 | N/A | N/A | N/A | Yes (via @types) |
| nodemailer | ^8.0.7 | N/A | N/A | N/A | Yes (via @types) |
| rate-limiter-flexible | ^11.1.0 | N/A | N/A | >=12 | Yes |
| react-dnd | ^16.0.1 | Yes (>=16.11) | Yes | N/A | Yes |
| react-dropzone | ^15.0.0 | Yes (>=16.8) | Yes | N/A | Yes |
| date-fns | ^4.1.0 | N/A | N/A | N/A | Yes |
| nanoid | ^5.1.11 | N/A | N/A | N/A | Yes |

---

## Integration Points with Next.js 16 App Router

### 1. Database Connection
```
src/db/index.ts            -- Exports Drizzle instance (singleton, module-cached)
src/app/api/**/route.ts    -- Route handlers import db directly
src/app/(portal)/**/page.tsx  -- Server components can use db for reads
```
postgres.js handles connection pooling internally. For VPS, configure `max: 10` connections. Server components can query directly; mutations go through API routes with proper auth checks.

### 2. Better Auth Integration
```
src/lib/auth.ts                       -- Better Auth server config
src/lib/auth-client.ts                -- Better Auth client config
src/app/api/auth/[...all]/route.ts    -- Catch-all route handler
src/proxy.ts                          -- Auth middleware (NOT middleware.ts)
```
Better Auth's `better-auth/next-js` export provides `toNextJsHandler()`. The `proxy.ts` file handles session checking and route protection for `/portal/*` and `/admin/*` routes.

### 3. BullMQ Workers
```
src/jobs/queues.ts          -- Queue definitions (licenseSync, email, export, webhook)
src/jobs/workers/index.ts   -- Worker entry point (runs as separate process)
src/jobs/schedulers/        -- Cron/recurring job definitions
```
Workers run as `npx tsx src/jobs/workers/index.ts` in production. Can be managed by PM2 or systemd alongside the Next.js server.

### 4. Redis Connection
```
src/lib/redis.ts    -- Redis client singleton (ioredis)
```
Single file, single connection, used everywhere. BullMQ manages its own internal connections.

### 5. Payment Callback Routes
```
src/app/api/payments/bkash/callback/route.ts
src/app/api/payments/sslcommerz/success/route.ts
src/app/api/payments/sslcommerz/ipn/route.ts
```
Payment callbacks must be public routes (no auth middleware on these) but must verify request signatures to prevent spoofing.

### 6. API Route Structure
```
src/app/api/
  auth/[...all]/route.ts          -- Better Auth handler
  payments/                       -- Payment endpoints
  licenses/                       -- License management endpoints
  exports/                        -- Export generation endpoints
  admin/                          -- Admin-specific API routes
  webhooks/                       -- Webhook receivers (central API, payment gateways)
```

---

## Sources

- pnpm registry version queries (all packages, executed 2026-05-15) -- HIGH confidence
- `backenddashboard/package.json` -- verified existing chart/dashboard dependencies -- HIGH confidence
- `backenddashboard/src/components/ecommerce/MonthlySalesChart.tsx` -- verified ApexCharts integration pattern -- HIGH confidence
- `backenddashboard/src/components/ecommerce/EcommerceMetrics.tsx` -- verified component structure -- HIGH confidence
- better-auth package.json exports -- verified drizzle adapter, next-js integration, admin/access/two-factor plugins -- HIGH confidence
- better-auth peerDependencies -- verified React 19 + Next.js 16 + drizzle-orm compatibility -- HIGH confidence
- drizzle-orm peerDependencies -- verified postgres.js and pg driver support -- HIGH confidence
- bullmq dependencies -- verified ioredis@5.10.1 bundling -- HIGH confidence
- react-apexcharts peerDependencies -- verified React 19 compatibility (>=16.8.0) -- HIGH confidence
- @react-pdf/renderer peerDependencies -- verified React 19 compatibility (^16||^17||^18||^19) -- HIGH confidence
- @tanstack/react-table peerDependencies -- verified React 19 compatibility (>=16.8) -- HIGH confidence
- bkash-payment package -- community-maintained, verified via pnpm view -- MEDIUM confidence
- sslcommerz package -- community-maintained, verified via pnpm view -- MEDIUM confidence
- Nagad/Rocket payment APIs -- no public npm packages, manual flow is standard practice -- MEDIUM confidence

---
*Research completed: 2026-05-15. All versions verified via pnpm registry queries.*
