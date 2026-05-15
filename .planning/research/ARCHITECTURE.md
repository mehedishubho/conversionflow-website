# Architecture Research

**Domain:** Dual-Portal SaaS Platform (Customer Portal + Admin BI Dashboard)
**Researched:** 2026-05-15
**Confidence:** HIGH (based on codebase analysis, Better Auth official docs, Drizzle docs, backenddashboard template analysis, Next.js 16 App Router patterns)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Next.js 16 App Router                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────┐  ┌─────────────────────┐  ┌────────────────────┐  │
│  │  Marketing Site      │  │  Customer Portal    │  │  Admin BI          │  │
│  │  [locale] routes     │  │  (portal) group     │  │  (admin) group     │  │
│  │  (PRESERVED AS-IS)   │  │                     │  │                    │  │
│  │  - Navbar/Footer     │  │  - Sidebar layout   │  │  - Sidebar layout  │  │
│  │  - i18n/bilingual    │  │  - License mgmt     │  │  - Revenue charts  │  │
│  │  - 13 pages          │  │  - Billing/Invoices │  │  - Sales analytics │  │
│  │  - MDX blog/docs     │  │  - Downloads        │  │  - User mgmt       │  │
│  │  - Public only       │  │  - Support tickets  │  │  - License intel   │  │
│  └──────────┬───────────┘  └──────────┬──────────┘  └──────────┬─────────┘  │
│             │                         │                        │             │
├─────────────┴─────────────────────────┴────────────────────────┴─────────────┤
│                          API Routes Layer                                     │
│  ┌────────────────┐  ┌──────────────────┐  ┌────────────────────────────────┐│
│  │ /api/auth/*    │  │ /api/webhooks/*  │  │ /api/(portal|admin)/*          ││
│  │ Better Auth    │  │ License events   │  │ RESTful API routes             ││
│  │ catch-all      │  │ Payment events   │  │ Server actions + route handlers││
│  └───────┬────────┘  └───────┬──────────┘  └───────────────┬────────────────┘│
│          │                   │                              │                 │
├──────────┴───────────────────┴──────────────────────────────┴─────────────────┤
│                          Service Layer                                        │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Auth Service │  │ License Sync  │  │ Payment      │  │ BI Aggregation │  │
│  │ Better Auth  │  │ Service       │  │ Service      │  │ Service        │  │
│  │ + Drizzle    │  │ Central API   │  │ bKash/SSL    │  │ Query builders │  │
│  └──────┬───────┘  └──────┬────────┘  └──────┬───────┘  └───────┬────────┘  │
│         │                 │                  │                   │            │
├─────────┴─────────────────┴──────────────────┴───────────────────┴────────────┤
│                          Data Layer                                           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────────┐│
│  │ PostgreSQL       │  │ Redis            │  │ External APIs                ││
│  │ Drizzle ORM      │  │ Sessions/Cache   │  │ license.devsroom.com        ││
│  │ users, orders,   │  │ Rate limiting    │  │ SSL Commerz gateway         ││
│  │ licenses, etc.   │  │ Job queues       │  │ bKash/Nagad/Rocket (manual) ││
│  └──────────────────┘  └──────────────────┘  └──────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `src/app/[locale]/` | Public marketing site with i18n, Navbar, Footer, all v1.x pages | PRESERVED AS-IS from v1.x |
| `src/app/(portal)/` | Authenticated customer portal with sidebar layout | NEW route group |
| `src/app/(admin)/` | Authenticated admin BI dashboard with sidebar layout | NEW route group |
| `src/app/api/auth/[...all]/` | Better Auth catch-all route handler | NEW |
| `src/app/api/webhooks/` | Webhook handlers for central licensing + payment events | NEW |
| `src/app/api/portal/` | Customer-facing API routes (license copy, download generate) | NEW |
| `src/app/api/admin/` | Admin-facing API routes (exports, user management, BI queries) | NEW |
| `src/lib/auth.ts` | Better Auth configuration with Drizzle adapter, RBAC plugins | NEW |
| `src/lib/db/` | Drizzle ORM schema, migration config, database client | NEW |
| `src/lib/redis.ts` | Redis client singleton for caching, sessions, queues | NEW |
| `src/lib/services/` | Business logic: license sync, payments, BI aggregation | NEW |
| `src/proxy.ts` | Route protection: redirect unauthenticated users, skip `/api` routes | MODIFIED |
| `src/app/layout.tsx` | Root layout: passes children through | PRESERVED (no changes needed) |

## Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx                          # Root layout (PRESERVED - just returns children)
│   ├── globals.css                         # Design tokens (MODIFIED - add dashboard tokens)
│   ├── not-found.tsx                       # 404 page (PRESERVED)
│   │
│   ├── [locale]/                           # Marketing site (PRESERVED AS-IS)
│   │   ├── layout.tsx                      # Locale layout with fonts, Navbar, Footer
│   │   ├── page.tsx                        # Homepage
│   │   ├── features/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── changelog/page.tsx
│   │   ├── support/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   ├── docs/page.tsx
│   │   ├── docs/[slug]/page.tsx
│   │   ├── license/page.tsx
│   │   ├── refund/page.tsx
│   │   ├── terms/page.tsx
│   │   └── privacy/page.tsx
│   │
│   ├── (auth)/                             # Auth pages (no sidebar, no marketing Navbar)
│   │   ├── layout.tsx                      # Auth layout: split-panel design
│   │   ├── login/page.tsx                  # Customer/Admin login (email + social)
│   │   ├── register/page.tsx               # Customer registration
│   │   ├── verify-email/page.tsx           # Email verification
│   │   ├── forgot-password/page.tsx        # Password reset request
│   │   └── reset-password/page.tsx         # Password reset form
│   │
│   ├── (portal)/                           # Customer portal (sidebar layout)
│   │   ├── layout.tsx                      # Portal layout: sidebar + header + main
│   │   ├── dashboard/page.tsx              # Overview (active licenses, recent activity)
│   │   ├── licenses/
│   │   │   ├── page.tsx                    # License list with status filters
│   │   │   └── [id]/page.tsx               # License detail (copy key, domains, renew)
│   │   ├── billing/
│   │   │   ├── page.tsx                    # Invoice list + payment history
│   │   │   └── [id]/page.tsx               # Invoice detail + PDF download
│   │   ├── downloads/page.tsx              # Plugin downloads + changelogs
│   │   ├── tickets/
│   │   │   ├── page.tsx                    # Support ticket list
│   │   │   ├── new/page.tsx                # Create ticket
│   │   │   └── [id]/page.tsx               # Ticket conversation
│   │   ├── notifications/page.tsx          # Notification center
│   │   ├── settings/
│   │   │   ├── page.tsx                    # Account settings
│   │   │   └── security/page.tsx           # Password change, sessions
│   │   └── checkout/
│   │       ├── page.tsx                    # Checkout form (plan, payment method)
│   │       └── success/page.tsx            # Post-purchase confirmation
│   │
│   ├── (admin)/                            # Admin BI Dashboard (sidebar layout)
│   │   ├── layout.tsx                      # Admin layout: sidebar + header + main
│   │   ├── dashboard/page.tsx              # Executive overview (MRR, ARR, CLV)
│   │   ├── sales/
│   │   │   ├── page.tsx                    # Sales performance + charts
│   │   │   └── funnel/page.tsx             # Conversion funnel visualization
│   │   ├── revenue/
│   │   │   ├── page.tsx                    # Revenue trends + forecasting
│   │   │   └── invoices/page.tsx           # Invoice management
│   │   ├── customers/
│   │   │   ├── page.tsx                    # Customer list + growth chart
│   │   │   └── [id]/page.tsx               # Customer detail
│   │   ├── licenses/
│   │   │   ├── page.tsx                    # License intelligence overview
│   │   │   ├── sync/page.tsx               # Central API sync status
│   │   │   └── piracy/page.tsx             # Piracy detection dashboard
│   │   ├── analytics/
│   │   │   ├── page.tsx                    # Geographic analytics
│   │   │   ├── retention/page.tsx          # Retention cohort analysis
│   │   │   └── churn/page.tsx              # Churn analytics
│   │   ├── products/page.tsx               # Product performance
│   │   ├── activity/page.tsx               # Real-time activity feed
│   │   ├── users/
│   │   │   ├── page.tsx                    # User management (RBAC)
│   │   │   └── [id]/page.tsx               # User detail + role assignment
│   │   ├── notifications/page.tsx          # Admin notification rules
│   │   ├── settings/page.tsx               # System settings
│   │   └── exports/page.tsx                # CSV/Excel/PDF export center
│   │
│   └── api/
│       ├── auth/[...all]/route.ts          # Better Auth catch-all handler
│       ├── webhooks/
│       │   ├── license/route.ts            # Central licensing webhook
│       │   └── payment/route.ts            # Payment gateway webhook (SSL Commerz)
│       ├── portal/
│       │   ├── licenses/[id]/copy/route.ts # Copy license key endpoint
│       │   ├── downloads/[id]/route.ts     # Generate download token
│       │   └── tickets/[id]/reply/route.ts # Reply to ticket
│       └── admin/
│           ├── export/route.ts             # Export data (CSV/Excel/PDF)
│           ├── bi/route.ts                 # BI aggregation queries
│           └── sync/route.ts               # Manual central API sync trigger
│
├── lib/
│   ├── utils.ts                            # cn() utility (PRESERVED)
│   ├── auth.ts                             # Better Auth config + Drizzle adapter
│   ├── redis.ts                            # Redis client singleton (ioredis)
│   ├── db/
│   │   ├── index.ts                        # Drizzle client initialization
│   │   ├── schema.ts                       # All table definitions
│   │   ├── migrations/                     # Generated migration files
│   │   └── seed.ts                         # Seed data (admin user, plans)
│   ├── services/
│   │   ├── license-sync.ts                 # Central API sync logic
│   │   ├── payment.ts                      # Payment processing (SSL Commerz + manual)
│   │   ├── invoice.ts                      # Invoice generation + PDF
│   │   ├── bi-queries.ts                   # BI aggregation query builders
│   │   ├── notifications.ts                # Notification dispatch
│   │   └── export.ts                       # CSV/Excel/PDF export service
│   ├── types/
│   │   ├── auth.ts                         # Auth-related types (roles, permissions)
│   │   ├── license.ts                      # License + central API types
│   │   ├── payment.ts                      # Payment, invoice, coupon types
│   │   └── bi.ts                           # BI metric types
│   └── constants.ts                        # Shared constants (PRESERVED)
│
├── components/
│   ├── layout/                             # Marketing site layout (PRESERVED)
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ThemeProvider.tsx
│   │   ├── CustomCursor.tsx
│   │   └── PageTransition.tsx
│   ├── sections/                           # Marketing site sections (PRESERVED)
│   ├── ui/                                 # Marketing site UI (PRESERVED)
│   ├── blog/                               # Blog components (PRESERVED)
│   │
│   ├── dashboard/                          # Shared dashboard components (NEW)
│   │   ├── layout/
│   │   │   ├── AppSidebar.tsx              # Sidebar (adapted from backenddashboard)
│   │   │   ├── AppHeader.tsx               # Header with search, notifications, user menu
│   │   │   ├── Backdrop.tsx                # Mobile backdrop overlay
│   │   │   └── SidebarContext.tsx           # Sidebar state management
│   │   ├── charts/
│   │   │   ├── AreaChart.tsx               # ApexCharts area chart wrapper
│   │   │   ├── BarChart.tsx                # ApexCharts bar chart wrapper
│   │   │   ├── DonutChart.tsx              # ApexCharts donut chart wrapper
│   │   │   ├── HeatMap.tsx                 # Geographic heatmap
│   │   │   └── MetricCard.tsx              # KPI card with trend indicator
│   │   ├── data/
│   │   │   ├── DataTable.tsx               # Server-side paginated/sortable table
│   │   │   └── DataExport.tsx              # Export button (CSV/Excel/PDF)
│   │   └── shared/
│   │       ├── Badge.tsx                   # Status badge component
│   │       ├── Modal.tsx                   # Confirmation/detail modal
│   │       ├── Dropdown.tsx                # Dropdown menu
│   │       ├── Avatar.tsx                  # User avatar
│   │       ├── Alert.tsx                   # Alert/notification banner
│   │       └── Tabs.tsx                    # Tab navigation
│   │
│   ├── portal/                             # Customer portal-specific (NEW)
│   │   ├── LicenseCard.tsx                 # License display card
│   │   ├── InvoiceRow.tsx                  # Invoice list item
│   │   ├── DownloadItem.tsx                # Plugin download row
│   │   ├── TicketThread.tsx                # Support ticket conversation
│   │   ├── NotificationBell.tsx            # Notification dropdown
│   │   └── CheckoutForm.tsx                # Payment form (bKash/Nagad/SSL)
│   │
│   └── admin/                              # Admin-specific (NEW)
│       ├── RevenueChart.tsx                # Revenue trend chart
│       ├── SalesFunnel.tsx                 # Conversion funnel visualization
│       ├── ChurnIndicator.tsx              # Churn rate display
│       ├── ActivityFeed.tsx                # Real-time event feed
│       ├── LicenseSyncStatus.tsx           # Central API sync status
│       └── GeographicMap.tsx               # Sales by country
│
├── i18n/                                   # i18n config (PRESERVED)
├── content/                                # MDX content (PRESERVED)
├── data/                                   # Static data files (PRESERVED)
└── actions/                                # Server actions
    ├── contact.ts                          # Contact form (PRESERVED)
    ├── portal.ts                           # Customer portal actions (NEW)
    └── admin.ts                            # Admin actions (NEW)
```

### Structure Rationale

- **`[locale]/` preserved as-is:** The 13 existing marketing pages have their own layout with Navbar, Footer, i18n, and page transitions. They remain untouched. The `[locale]` segment handles i18n for public-facing pages only.
- **`(auth)/` route group (no locale):** Auth pages (login, register, reset password) are locale-independent. Using a route group without `[locale]` avoids the i18n middleware overhead on auth routes. The auth layout uses the split-panel design from `backenddashboard/(full-width-pages)/(auth)/layout.tsx`.
- **`(portal)/` route group (no locale):** Customer portal pages are locale-independent (portal UI does not need bilingual support initially). Sidebar layout is adapted from `backenddashboard/(admin)/layout.tsx`.
- **`(admin)/` route group (no locale):** Admin dashboard is operator-only, English-only. Sidebar layout is adapted from `backenddashboard/(admin)/layout.tsx` with admin-specific nav items.
- **`api/` routes (no locale):** `proxy.ts` already skips `/api` routes (line 11: `pathname.startsWith('/api')`). All API routes are outside the `[locale]` segment.

## Architectural Patterns

### Pattern 1: Route Group Isolation (Three Parallel Layouts)

**What:** The app has three independent layout trees that never share visual chrome: marketing (`[locale]`), auth (`(auth)`), and portal/admin (`(portal)`, `(admin)`). The root `layout.tsx` simply returns `children` (no shared HTML shell), so each route group can define its own `<html>` and `<body>` tags.

**When to use:** When an app serves fundamentally different UI contexts (public marketing, authenticated portal, admin dashboard).

**Trade-offs:**
- Pro: Complete visual isolation. Marketing Navbar/Footer never appear in the dashboard. Dashboard sidebar never appears on marketing pages.
- Pro: Each layout can load different fonts, scripts, and styles.
- Con: Route groups do NOT create URL segments. `(portal)/dashboard/page.tsx` resolves to `/dashboard`, not `/(portal)/dashboard`. This means routes must be unique across all groups.
- Con: Cannot easily share client-side state between groups (different layout trees).

**Example:**

```typescript
// src/app/(portal)/layout.tsx
"use client";
import { SidebarProvider } from "@/components/dashboard/layout/SidebarContext";
import AppSidebar from "@/components/dashboard/layout/AppSidebar";
import AppHeader from "@/components/dashboard/layout/AppHeader";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SidebarProvider>
            <div className="min-h-screen xl:flex">
              <AppSidebar items={portalNavItems} />
              <div className="flex-1 transition-all duration-300">
                <AppHeader />
                <main className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Critical note on root layout:** `src/app/layout.tsx` currently returns `{children}`. In Next.js 16, if a route group has its own `<html>` and `<body>` tags, those take precedence. The root layout MUST remain minimal. Do NOT add shared UI to the root layout.

### Pattern 2: Better Auth with Drizzle Adapter

**What:** Better Auth is configured in a single `auth.ts` file using the Drizzle adapter for PostgreSQL. The catch-all route handler at `api/auth/[...all]/route.ts` delegates all auth requests to Better Auth.

**When to use:** For any Next.js App Router project needing authentication with database persistence.

**Trade-offs:**
- Pro: Single configuration file for all auth concerns (email/password, social, 2FA, RBAC, sessions).
- Pro: Drizzle adapter generates the schema automatically via CLI.
- Pro: Built-in admin plugin provides admin-specific user management.
- Con: Better Auth is newer than NextAuth/Auth.js -- smaller community, fewer StackOverflow answers.
- Con: Must manage database migrations when Better Auth schema updates.

**Example:**

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, accessControl } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [
    admin(),
    accessControl({
      roles: {
        customer: { permissions: ["portal:read", "portal:write", "license:read"] },
        admin: { permissions: ["admin:read", "admin:write", "portal:read"] },
        support_staff: { permissions: ["admin:read", "tickets:manage"] },
        super_admin: { permissions: ["*"] },
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,      // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,              // Cache session in cookie for 5 minutes
    },
  },
});

export type Auth = typeof auth;
```

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### Pattern 3: Proxy-Based Route Protection

**What:** Use `proxy.ts` (project convention instead of `middleware.ts`) to check authentication and redirect unauthenticated users attempting to access portal/admin routes.

**When to use:** For route-level access control that runs before page rendering.

**Trade-offs:**
- Pro: Runs on the Edge, no database query needed for basic auth checks (session cookie check).
- Pro: Catches all route patterns with matchers.
- Con: Cannot perform complex RBAC checks in Edge runtime (no Drizzle access). Use for auth yes/no only; do detailed RBAC in page components.

**Example:**

```typescript
// src/proxy.ts (MODIFIED from current version)
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

// Routes that require authentication
const protectedRoutes = [
  '/dashboard', '/licenses', '/billing', '/downloads',
  '/tickets', '/notifications', '/settings', '/checkout',
  '/admin',
];

// Routes that require admin role
const adminRoutes = [
  '/admin',
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, and _next
  if (pathname.includes('.') || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return;
  }

  // Check if route is a protected portal/admin route
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdmin = adminRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    // Check for session cookie (Better Auth sets this)
    const sessionCookie = request.cookies.get('better-auth.session_token');
    if (!sessionCookie) {
      const loginUrl = new URL(isAdmin ? '/login?mode=admin' : '/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    // Detailed RBAC checks happen in the page component, not in proxy
  }

  // i18n routing for marketing pages only
  // Portal/admin/auth pages are NOT under [locale]
  const isPortalOrAdminOrAuth = isProtected ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password');

  if (isPortalOrAdminOrAuth) {
    return NextResponse.next();
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: [
    '/',
    '/(bn|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
```

### Pattern 4: Central Licensing API Integration (Never Local)

**What:** All license generation, activation, and validation happens at `license.devsroom.com`. This app only syncs and caches license data via REST API calls and webhooks.

**When to use:** For any system with a central authority that owns a data domain.

**Trade-offs:**
- Pro: Single source of truth. No license drift between systems.
- Pro: The central API handles all the complex licensing logic (activation limits, domain validation, expiration).
- Con: Requires reliable webhook delivery. Must handle webhook failures gracefully.
- Con: Adds network latency for real-time license lookups.

**Purchase Flow:**

```
Customer selects plan on /checkout
    |
    v
POST /api/portal/checkout (server action)
    |-- Validate coupon, calculate tax
    |-- Process payment (SSL Commerz / manual)
    |
    v
Payment confirmed
    |-- POST to license.devsroom.com/api/orders/import
    |   Body: { customer_email, product_id, plan, payment_ref }
    |
    v
Central API responds with:
    { central_user_id, central_license_id, license_key }
    |
    v
Store locally:
    |-- orders table: central_order_id, payment details
    |-- users table: central_user_id mapping
    |-- licenses table: central_license_id, license_key, cached status
    |
    v
Redirect to /checkout/success with license key
```

**Webhook Handler:**

```typescript
// src/app/api/webhooks/license/route.ts
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { licenses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  // 1. Verify webhook signature
  const signature = headers().get("x-webhook-signature");
  const body = await request.text();
  // verify HMAC signature with shared secret

  const event = JSON.parse(body);

  switch (event.type) {
    case "license.created":
    case "license.updated":
      await db.insert(licenses).values({
        centralLicenseId: event.data.license_id,
        centralUserId: event.data.user_id,
        key: event.data.license_key,
        status: event.data.status,
        plan: event.data.plan,
        expiresAt: new Date(event.data.expires_at),
        activationLimit: event.data.activation_limit,
        activationsCount: event.data.activations_count,
        lastSyncedAt: new Date(),
      }).onConflictDoUpdate({
        target: licenses.centralLicenseId,
        set: { status: event.data.status, lastSyncedAt: new Date() },
      });
      break;

    case "license.expired":
      await db.update(licenses)
        .set({ status: "expired", lastSyncedAt: new Date() })
        .where(eq(licenses.centralLicenseId, event.data.license_id));
      break;

    case "payment.refunded":
      await db.update(licenses)
        .set({ status: "revoked", lastSyncedAt: new Date() })
        .where(eq(licenses.centralLicenseId, event.data.license_id));
      break;
  }

  return Response.json({ received: true });
}
```

### Pattern 5: Database Schema Design with Drizzle ORM

**What:** PostgreSQL schema using Drizzle ORM with explicit relationships. The schema extends Better Auth's generated tables with application-specific tables.

**When to use:** For any application with persistent data that needs type-safe queries.

**Trade-offs:**
- Pro: Full TypeScript type safety. Schema changes are compile-time checked.
- Pro: Drizzle Kit generates migration SQL files. Version-controlled schema evolution.
- Pro: Better Auth's Drizzle adapter CLI generates the auth tables automatically.
- Con: Drizzle has a learning curve for complex queries (joins, aggregations for BI).
- Con: Must keep Drizzle Kit version in sync with Better Auth's expected schema.

**Schema Design:**

```typescript
// src/lib/db/schema.ts
import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// === Enums ===
export const licenseStatusEnum = pgEnum("license_status", ["active", "expired", "revoked", "suspended"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "completed", "failed", "refunded"]);
export const paymentMethodEnum = pgEnum("payment_method", ["bkash", "nagad", "rocket", "bank_transfer", "ssl_commerz"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed"]);
export const userRoleEnum = pgEnum("user_role", ["customer", "admin", "support_staff", "super_admin"]);

// === Better Auth generates these tables automatically via CLI ===
// Run: pnpm exec @better-auth/cli generate
// Then manually add our custom columns (role, central_user_id, etc.)

// === Users (extends Better Auth's user table) ===
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("customer"),
  centralUserId: text("central_user_id"),           // Maps to license.devsroom.com user
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// === Sessions (Better Auth managed) ===
export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// === Orders ===
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  centralOrderId: text("central_order_id"),           // Reference to central API order
  productId: text("product_id").notNull(),             // "conversionflow-wp" or "conversionflow-laravel"
  plan: text("plan").notNull(),                        // "starter", "professional", "agency"
  amount: integer("amount").notNull(),                 // Amount in BDT (smallest currency)
  currency: text("currency").notNull().default("BDT"),
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentRef: text("payment_ref"),                     // Transaction ID from payment provider
  status: orderStatusEnum("status").notNull().default("pending"),
  couponCode: text("coupon_code"),
  taxAmount: integer("tax_amount").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// === Licenses (synced from central API) ===
export const licenses = pgTable("licenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  orderId: uuid("order_id").references(() => orders.id),
  centralLicenseId: text("central_license_id").notNull().unique(),
  key: text("key").notNull(),                          // Encrypted or hashed display key
  productId: text("product_id").notNull(),
  plan: text("plan").notNull(),
  status: licenseStatusEnum("status").notNull().default("active"),
  activationLimit: integer("activation_limit").notNull().default(1),
  activationsCount: integer("activations_count").notNull().default(0),
  domains: jsonb("domains").$type<string[]>().default([]),
  expiresAt: timestamp("expires_at"),
  lastSyncedAt: timestamp("last_synced_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// === Downloads ===
export const downloads = pgTable("downloads", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: text("product_id").notNull(),
  version: text("version").notNull(),                  // e.g., "2.1.0"
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),             // Bytes
  changelog: text("changelog"),                        // Markdown changelog
  downloadUrl: text("download_url").notNull(),          // Signed URL or local path
  requiresLicense: boolean("requires_license").notNull().default(true),
  releasedAt: timestamp("released_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// === Support Tickets ===
export const tickets = pgTable("tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  status: ticketStatusEnum("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),  // low, medium, high, urgent
  assignedTo: text("assigned_to").references(() => users.id),
  licenseId: uuid("license_id").references(() => licenses.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ticketMessages = pgTable("ticket_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: uuid("ticket_id").notNull().references(() => tickets.id),
  userId: text("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  attachments: jsonb("attachments").$type<string[]>().default([]),
  isAdminReply: boolean("is_admin_reply").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// === Notifications ===
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),                       // "license_expiring", "payment_failed", etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// === Audit Log ===
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),                   // "user.login", "license.create", etc.
  entity: text("entity").notNull(),                   // "user", "license", "order"
  entityId: text("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// === Coupons ===
export const coupons = pgTable("coupons", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(),                       // "percentage", "fixed"
  value: integer("value").notNull(),                  // Percentage or fixed amount in BDT
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// === Relations ===
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  licenses: many(licenses),
  tickets: many(tickets),
  notifications: many(notifications),
  sessions: many(sessions),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export const licensesRelations = relations(licenses, ({ one }) => ({
  user: one(users, { fields: [licenses.userId], references: [users.id] }),
  order: one(orders, { fields: [licenses.orderId], references: [orders.id] }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  user: one(users, { fields: [tickets.userId], references: [users.id] }),
  assignedTo: one(users, { fields: [tickets.assignedTo], references: [users.id] }),
  messages: many(ticketMessages),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketMessages.ticketId], references: [tickets.id] }),
  user: one(users, { fields: [ticketMessages.userId], references: [users.id] }),
}));
```

### Pattern 6: Redis for Sessions, Caching, and Job Queues

**What:** A single Redis instance serves three purposes: session caching (complementing Better Auth's DB sessions), API response caching (BI aggregation queries), and background job queues (license sync, notification dispatch).

**When to use:** For any app with database-heavy queries that benefit from caching, or where background processing is needed.

**Trade-offs:**
- Pro: Fast in-memory store for frequently accessed data.
- Pro: Redis lists/sets make simple job queues trivial.
- Con: Another infrastructure dependency (Redis server must be managed).
- Con: Cache invalidation complexity.

**Example:**

```typescript
// src/lib/redis.ts
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export const redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 200, 5000);
  },
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

// Usage: BI dashboard queries
// cacheSet("bi:daily-revenue:2026-05-15", revenueData, 3600); // 1 hour TTL
// cacheSet("bi:mrr", mrrData, 1800); // 30 min TTL
```

### Pattern 7: Theme Reconciliation (next-themes across all layouts)

**What:** The dashboard template (`backenddashboard/`) uses a custom `ThemeContext.tsx` with localStorage, while the marketing site uses `next-themes`. These must be reconciled into a single system.

**When to use:** When merging two codebases with different theme approaches.

**Trade-offs:**
- Pro: `next-themes` handles SSR correctly, has cookie-based theme detection, and works with Tailwind's `class` strategy.
- Con: Requires removing the dashboard template's custom ThemeContext entirely.

**Decision:** Use `next-themes` everywhere. Remove the `ThemeContext.tsx` from the dashboard port. Each layout tree (`(portal)`, `(admin)`, `(auth)`) wraps its content with `next-themes` ThemeProvider independently, sharing the same cookie/localStorage key so the theme persists across layouts.

## Data Flow

### Request Flow

```
[User Action: Visit /dashboard]
    |
    v
[proxy.ts] -- Checks session cookie
    |-- No cookie? --> Redirect to /login
    |-- Has cookie? --> NextResponse.next()
    |
    v
[(portal)/layout.tsx] -- Client component
    |-- SidebarProvider wraps children
    |-- AppSidebar renders navigation
    |-- AppHeader renders header
    |
    v
[(portal)/dashboard/page.tsx] -- Server component
    |-- import { auth } from "@/lib/auth"
    |-- const session = await auth.api.getSession({ headers })
    |-- Query DB for user's licenses, recent activity
    |-- Render dashboard with data
```

### Purchase Flow

```
[Customer clicks "Buy Now" on marketing Pricing page]
    |
    v
[POST /api/portal/checkout] (or server action)
    |-- 1. Validate input (plan, coupon code)
    |-- 2. Calculate total (price + tax - coupon discount)
    |-- 3. Route to payment method:
    |       |-- SSL Commerz --> Redirect to gateway
    |       |-- bKash/Nagad/Rocket/Bank --> Show payment instructions
    |
    v
[Payment confirmation (async)]
    |-- SSL Commerz: POST /api/webhooks/payment (callback)
    |-- Manual: Admin marks as paid in /admin/invoices
    |
    v
[POST license.devsroom.com/api/orders/import]
    |-- Body: { email, product, plan, payment_ref }
    |-- Response: { central_user_id, central_license_id, key }
    |
    v
[Store locally]
    |-- upsert users table with central_user_id
    |-- insert orders table with central_order_id
    |-- insert licenses table with central_license_id
    |
    v
[Notify customer]
    |-- Create notification record
    |-- (Future: send email)
```

### License Sync Flow

```
[Webhook from license.devsroom.com]
    |
    v
[POST /api/webhooks/license]
    |-- Verify HMAC signature
    |-- Parse event type
    |-- Update local licenses table cache
    |-- Update user's notifications if needed
    |
    v
[Fallback: Scheduled sync (cron/interval)]
    |-- Every 15 minutes: GET license.devsroom.com/api/licenses/changed?since=<last_sync>
    |-- Batch update local cache
    |-- Log sync results to audit_logs
```

### BI Query Flow

```
[Admin visits /admin/revenue]
    |
    v
[Server component: (admin)/revenue/page.tsx]
    |-- Check Redis cache: "bi:revenue:2026-05-15"
    |-- Cache HIT --> Return cached data
    |-- Cache MISS --> Query PostgreSQL via Drizzle
    |       |-- Complex aggregation: SUM, GROUP BY, date_trunc
    |       |-- Store result in Redis with TTL
    |
    v
[Render with ApexCharts]
    |-- AreaChart component receives data as props
    |-- Client-side chart rendering
```

### State Management

```
[Marketing Site]
    Local useState in client components
    next-themes for theme
    next-intl for locale
    (No global state needed -- PRESERVED pattern)

[Customer Portal]
    Local useState for UI interactions
    next-themes for theme
    SidebarContext for sidebar state
    Server-side data fetching per page (no client cache needed)

[Admin Dashboard]
    Local useState for UI interactions
    next-themes for theme
    SidebarContext for sidebar state
    Server-side BI queries with Redis caching
    (No React Query/SWR needed initially -- server components fetch directly)
```

### Key Data Flows

1. **Authentication:** Login form -> Better Auth handler -> Session cookie + DB session -> Proxy checks cookie on every protected route -> Page components validate session server-side.

2. **License Display:** Customer portal -> Server component queries local `licenses` table (cached from central API) -> Render license cards -> Customer copies key or deactivates domain via server action -> Server action calls central API for activation/deactivation -> Webhook updates local cache.

3. **BI Metrics:** Admin page -> Server component checks Redis cache -> If miss, Drizzle aggregates from `orders`, `licenses`, `users` tables -> Store in Redis with TTL -> Render charts. Manual refresh bypasses cache.

4. **Support Tickets:** Customer creates ticket -> Server action inserts into `tickets` + `ticket_messages` -> Notification created for admin staff -> Admin replies via server action -> Notification created for customer.

## Scaling Considerations

| Concern | At 500 users | At 10K users | At 100K users |
|---------|-------------|--------------|---------------|
| Database queries | Direct Drizzle queries fine | Add indexes on foreign keys, status columns | Read replicas for BI queries, connection pooling (PgBouncer) |
| BI aggregation | Real-time queries acceptable | Redis caching with 5-15 min TTL | Materialized views + scheduled refresh, dedicated BI replica |
| Session storage | PostgreSQL sessions (Better Auth default) | PostgreSQL still fine | Consider Redis-backed sessions for faster lookup |
| License sync | 15-min cron job sufficient | 5-min cron, batch API calls | Webhook-only, real-time sync queue |
| File downloads | Direct file serving | Signed URLs with expiry | CDN for download files, offload from app server |
| Search (Cmd+K) | Simple DB LIKE queries | PostgreSQL full-text search | Dedicated search (Meilisearch) |
| Export (CSV/Excel) | Synchronous generation | Background job + email download link | Pre-computed exports + S3 storage |

### Scaling Priorities

1. **First bottleneck:** BI aggregation queries on `orders` table. Mitigate with Redis caching from day one. Add database indexes in migration.
2. **Second bottleneck:** License sync lag when webhook delivery fails. Mitigate with scheduled fallback sync every 15 minutes.
3. **Third bottleneck:** Session table growth. Better Auth handles session cleanup. Monitor table size.

## Anti-Patterns

### Anti-Pattern 1: Generating Licenses Locally

**What people do:** Create license keys in the local database and push them to the central API.
**Why it is wrong:** Violates the project's single source of truth rule. Creates race conditions where local and central state diverge. The central API owns license generation -- period.
**Do this instead:** POST to `license.devsroom.com/api/orders/import` with purchase details. The central API creates the license and returns the key. Store only the `central_license_id` mapping locally.

### Anti-Pattern 2: Client-Side Data Fetching for Dashboard

**What people do:** Use React Query or SWR to fetch dashboard data from client components.
**Why it is wrong:** Dashboard data is user-specific and should be fetched server-side. Client-side fetching leaks API structure, adds loading states, and increases bundle size.
**Do this instead:** Use Server Components for all dashboard pages. Fetch data in the server component, pass as props to chart components. Charts are client components that receive data, not fetchers.

### Anti-Pattern 3: Sharing Layout HTML Between Marketing and Dashboard

**What people do:** Put Navbar/Footer in the root layout so they appear everywhere.
**Why it is wrong:** The marketing Navbar and Footer must never appear in the portal or admin layouts. Dashboard has its own sidebar navigation. Root layout must remain minimal (return children only).
**Do this instead:** Each route group (`[locale]`, `(portal)`, `(admin)`, `(auth)`) has its own complete layout with its own `<html>` and `<body>` tags. The root `layout.tsx` only returns `{children}`.

### Anti-Pattern 4: Mixing i18n Locale Routes with Dashboard Routes

**What people do:** Put portal and admin pages under `[locale]/portal/` and `[locale]/admin/`.
**Why it is wrong:** The `next-intl` middleware intercepts all `[locale]` routes and adds locale prefix logic. Dashboard pages do not need i18n. Mixing creates URL complexity (`/bn/dashboard` makes no sense for a Bangladeshi product where the dashboard is English-only).
**Do this instead:** Portal and admin route groups are outside `[locale]`. They live at `/dashboard`, `/admin`, `/licenses`, etc. Only marketing pages are under `[locale]`.

### Anti-Pattern 5: Using Dashboard Template's ThemeContext

**What people do:** Port the `backenddashboard/src/context/ThemeContext.tsx` as-is.
**Why it is wrong:** It uses a custom localStorage-based theme system that conflicts with `next-themes` used in the marketing site. Two theme systems means two sets of CSS classes, two localStorage keys, and potential class conflicts.
**Do this instead:** Delete the dashboard's `ThemeContext.tsx`. Use `next-themes` in all layout trees. The dashboard's dark/light toggle buttons call `useTheme()` from `next-themes`, just like the marketing Navbar already does.

### Anti-Pattern 6: RBAC Checks Only in Proxy

**What people do:** Check user role in `proxy.ts` and assume pages are safe.
**Why it is wrong:** The proxy only checks for session cookie existence, not role. Edge runtime cannot query the database. A customer with a valid session could access `/admin` URLs if role checks are only in proxy.
**Do this instead:** Proxy checks auth (session cookie exists). Page components check role (server-side session validation with role lookup). Admin pages verify `role === "admin" | "super_admin"` in every page's server-side data fetch.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| license.devsroom.com | REST API (POST /api/orders/import, GET /api/licenses) + Webhooks | Central authority for all licensing. This app only syncs and caches. Never generate licenses locally. |
| SSL Commerz | Redirect to gateway + POST callback webhook | BD payment gateway for card payments. Requires merchant ID and store password. Test in sandbox mode first. |
| bKash/Nagad/Rocket | Manual payment flow (show instructions, admin confirms) | No API integration for v2.0. Customer sends payment, submits transaction ID, admin manually verifies and marks order as paid. |
| Bank Transfer | Manual payment flow (show bank details, admin confirms) | Same manual flow as mobile banking. |
| Redis | ioredis client for caching and job queues | Self-hosted on same VPS. Used for: BI query caching, rate limiting, background job queues. |
| PostgreSQL | Drizzle ORM with pg driver | Self-hosted on same VPS or managed. All persistent data stored here. |
| Plausible Analytics | Script tag in marketing layout (already configured) | PRESERVED as-is. Dashboard pages can optionally add Plausible tracking. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Marketing <-> Auth | Redirect: pricing "Buy Now" -> /login?redirect=/checkout?plan=professional | Marketing pages link to auth pages. No shared state. |
| Auth <-> Portal | Session cookie set by Better Auth, portal pages validate server-side | After login, redirect to portal dashboard or intended page. |
| Portal <-> Central API | REST API calls from server actions/functions | Server-side only. Never call central API from client. |
| Portal <-> Admin | Shared database tables, separate route groups | Customers and admins read/write same tables. Admin has elevated permissions. |
| Admin <-> Central API | REST API for sync + Webhooks for real-time updates | Admin can trigger manual sync. Scheduled sync runs every 15 minutes. |
| Marketing <-> Portal | No direct communication | Marketing site is completely static. Portal is authenticated. They share a database but have no runtime dependency. |

## Build Order (Dependency Chain)

The architecture imposes a strict build order. Each phase depends on the previous.

```
Phase 1: Database & Auth Foundation
├── PostgreSQL setup (Docker or managed)
├── Drizzle ORM config (drizzle.config.ts)
├── Database schema (src/lib/db/schema.ts)
├── Better Auth config (src/lib/auth.ts)
├── Better Auth API route (api/auth/[...all]/route.ts)
├── Redis setup + client (src/lib/redis.ts)
├── Auth pages layout ((auth)/layout.tsx)
├── Login, Register, Forgot/Reset Password pages
├── Proxy route protection (src/proxy.ts modification)
├── Seed script (admin user, plans)
└── Migration system (drizzle-kit)

Phase 2: Dashboard Shell
├── SidebarContext (adapted from backenddashboard)
├── AppSidebar component (portal nav items)
├── AppHeader component (search, notifications, user menu)
├── Backdrop component (mobile overlay)
├── Portal layout ((portal)/layout.tsx)
├── Admin layout ((admin)/layout.tsx)
├── Theme reconciliation (next-themes in all layouts)
├── globals.css additions (dashboard design tokens from backenddashboard)
└── Shared dashboard UI components (Badge, Modal, Tabs, etc.)

Phase 3: Customer Portal
├── Dashboard overview page (active licenses, recent activity)
├── License management (list, detail, copy key, deactivate domain)
├── Billing section (invoices, payment history)
├── Downloads section (plugin versions, changelogs)
├── Support tickets (create, list, reply)
├── Notifications (list, mark read)
├── Account settings (profile, password, sessions)
└── Server actions for portal operations

Phase 4: Checkout & Payments
├── Checkout page (plan selection, payment method)
├── SSL Commerz integration (redirect + callback)
├── Manual payment flow (bKash/Nagad/Rocket/Bank instructions)
├── Coupon code validation
├── Tax/VAT calculation
├── Invoice generation (HTML + PDF)
├── Central API order import (license.devsroom.com POST)
└── Post-purchase confirmation page

Phase 5: Admin BI Dashboard
├── Executive overview (MRR, ARR, active customers, CLV, CAC)
├── Revenue charts (daily/weekly/monthly/yearly via ApexCharts)
├── Sales performance + conversion funnel
├── Customer growth + retention analytics
├── Churn analytics + alerts
├── Geographic analytics (sales by country)
├── License intelligence (sync status, activation domains, piracy)
├── Product performance (plugin sales, renewals, plans)
├── Invoice management (paid/pending/failed/overdue)
├── User management (RBAC, role assignment)
├── Activity feed (real-time events)
├── Notification rules (failed payment, expiring license, fraud)
├── Export system (CSV, Excel, PDF)
└── BI query service with Redis caching

Phase 6: Webhooks & Background Jobs
├── License webhook handler (api/webhooks/license/route.ts)
├── Payment webhook handler (api/webhooks/payment/route.ts)
├── Webhook signature verification (HMAC)
├── Scheduled license sync (fallback when webhooks fail)
├── Background job system (Redis queue)
├── Audit logging for all mutations
└── Notification dispatch service
```

**Key dependency:** Phase 1 must be complete before anything else. Database + Auth is the foundation. Phase 2 provides the layout shell used by Phases 3, 4, and 5. Phase 6 (webhooks) can run in parallel with Phase 5, but requires Phase 4's payment integration to be complete for payment webhooks.

## Architecture Decision Records

### ADR-1: Route Groups Instead of Subdomain or Path Prefix
**Decision:** Use Next.js route groups `(portal)` and `(admin)` instead of subdomains (`portal.conversionflow.com`, `admin.conversionflow.com`) or path prefixes (`/portal/dashboard`, `/admin/dashboard`).
**Context:** Marketing site lives at `/` with i18n. Portal and admin need separate layouts.
**Consequence:** Routes are `/dashboard`, `/admin/dashboard`, `/licenses` (no prefix). Proxy.ts must carefully distinguish marketing routes from portal/admin routes. No subdomain DNS configuration needed. Simpler deployment.

### ADR-2: Server Components for Dashboard Data Fetching
**Decision:** All dashboard pages are Server Components that fetch data directly from PostgreSQL via Drizzle. Charts are Client Components that receive data as props.
**Context:** Next.js App Router encourages Server Components. Dashboard data is user-specific and benefits from server-side access control.
**Consequence:** No React Query or SWR needed. Data is fresh on every page load (or cached in Redis). Chart components are thin wrappers around ApexCharts that accept data arrays. No API routes needed for data fetching (only for webhooks and specific actions).

### ADR-3: Better Auth over NextAuth/Auth.js
**Decision:** Use Better Auth with Drizzle adapter, not NextAuth/Auth.js.
**Context:** Better Auth has first-class Drizzle support, built-in admin plugin, RBAC via access control plugin, and simpler configuration. NextAuth requires custom Drizzle adapter wiring and has more complex session management.
**Consequence:** Better Auth is newer with a smaller ecosystem. However, it handles all v2.0 auth requirements (dual auth, 4-role RBAC, 2FA-ready, session management) out of the box. Trade-off is acceptable for the functionality gained.

### ADR-4: ApexCharts over Recharts or Chart.js
**Decision:** Use ApexCharts (via react-apexcharts) for all dashboard charts, matching the `backenddashboard/` template.
**Context:** The dashboard template already uses ApexCharts. Recharts would require rewriting all chart components. Chart.js is lower-level and requires more configuration.
**Consequence:** ApexCharts is a client-side library (~150KB). Charts must be Client Components. Data is passed from Server Components as props. The dashboard template's chart wrappers (MonthlySalesChart, StatisticsChart, etc.) can be adapted with minimal changes.

### ADR-5: Manual BD Payments for v2.0
**Decision:** bKash, Nagad, Rocket, and Bank Transfer are manual payment flows (customer sends payment, submits transaction ID, admin confirms). Only SSL Commerz has automated gateway integration.
**Context:** bKash and Nagad have merchant APIs but they require separate merchant accounts, API keys, and compliance processes. For v2.0 launch, manual verification is faster and sufficient for the expected volume.
**Consequence:** Admin must manually verify and approve manual payments. Customer sees payment instructions and submits proof. Not ideal UX but acceptable for launch. Can add automated bKash/Nagad API integration in v2.1.

## Sources

- Better Auth official docs: Introduction, Installation, Drizzle adapter, Next.js integration, Admin plugin, Access Control plugin (via Context7) -- HIGH confidence
- Drizzle ORM official docs: PostgreSQL setup, Schema definition, Relations, Migrations (via training data) -- HIGH confidence
- Next.js 16 App Router: Route Groups, Layouts, Server Components, Middleware/Proxy patterns (via official docs + codebase analysis) -- HIGH confidence
- backenddashboard/ template analysis: AppSidebar, AppHeader, SidebarContext, ThemeContext, Auth layout, globals.css, package.json (direct codebase analysis) -- HIGH confidence
- Existing codebase: src/app/layout.tsx, src/app/[locale]/layout.tsx, src/proxy.ts, src/i18n/routing.ts, package.json, next.config.ts, globals.css (direct analysis) -- HIGH confidence
- Central licensing API patterns: Based on PROJECT.md specification (POST /api/orders/import, webhook handlers) -- HIGH confidence
- SSL Commerz integration: Based on training data for Bangladeshi payment gateway patterns -- MEDIUM confidence

---
*Architecture research for: ConversionFlow v2.0 Dual Portal SaaS Platform*
*Researched: 2026-05-15*
