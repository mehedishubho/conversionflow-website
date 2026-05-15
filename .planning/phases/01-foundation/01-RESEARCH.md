# Phase 1: Database, Auth, and Route Foundation - Research

**Researched:** 2026-05-15
**Domain:** PostgreSQL + Drizzle ORM, Better Auth authentication, Redis, route group architecture, CSS isolation
**Confidence:** HIGH

## Summary

Phase 1 builds the foundational infrastructure for the entire v2.0 platform. The three pillars are: (1) a PostgreSQL database with Drizzle ORM managing 8 application tables plus Better Auth's internal tables, (2) a complete authentication system using Better Auth with 4-role RBAC, email verification, password reset, Redis-backed sessions, and 2FA readiness, and (3) a route group architecture that isolates the marketing site, auth pages, customer portal, and admin dashboard into separate layout trees with independent CSS.

The primary technical risk is the Better Auth + Drizzle schema coordination. Better Auth generates its own tables via CLI (`npx @better-auth/cli generate`), and the application tables are managed by Drizzle Kit (`drizzle-kit generate` + `drizzle-kit migrate`). These two migration systems must not overlap on the same tables. The solution is to use `additionalFields` on Better Auth's user table for custom columns (role, phone, central_user_id), and keep application tables (orders, licenses, downloads, tickets, notifications, audit_logs, coupons) entirely separate.

The CSS isolation strategy is the second critical concern. The dashboard template (`backenddashboard/`) uses `--breakpoint-*: initial;` in its `@theme` block, which would destroy the marketing site's responsive breakpoints if merged naively. Separate CSS files per route group, with the marketing site's `globals.css` untouched, is the correct approach.

**Primary recommendation:** Establish the full 8-table schema, complete Better Auth configuration with all plugins (admin, 2FA, access control, email verification), route group architecture, and CSS isolation in this single phase. Do not defer any schema or auth decisions -- later phases should only add data flows, not new tables or auth plugins.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Port backenddashboard auth forms (SignInForm.tsx, SignUpForm.tsx) as-is -- swap Outfit font for ConversionFlow design system fonts (DM Sans, Syne), rewire ThemeContext to next-themes
- **D-02:** Auth pages are English only -- no Bengali i18n (they live outside [locale] route group)
- **D-03:** Single shared login page at `(auth)/login` -- server-side role check after auth redirects customers to /portal/dashboard, admins/support_staff to /admin/dashboard
- **D-04:** Fixed redirect per role -- no dynamic routing or permission-based nav in Phase 1
- **D-05:** Registration collects: full name + email + password + phone number (phone needed for BD payment verification in Phase 4)
- **D-06:** Auto-login with full access after registration -- email verification sent but not blocking. Users can use the platform immediately.
- **D-07:** Minimum 8 characters, no complexity rules (suitable for BD audience)
- **D-08:** 5 failed login attempts triggers 15-minute account lockout
- **D-09:** Password reset link expires in 1 hour, auto-login after successful reset
- **D-10:** 30-day session duration
- **D-11:** Setup wizard page as primary method -- a /admin/setup route that only works when no admin account exists (protected from abuse by checking user count)
- **D-12:** Seed script (pnpm db:seed) from env vars (ADMIN_EMAIL, ADMIN_PASSWORD) as backup/emergency fallback for creating super_admin
- **D-13:** Full 8-table schema created upfront in Phase 1: users, orders, licenses, downloads, tickets, notifications, audit_logs, coupons. Later phases add data flows, not new tables.
- **D-14:** Add Redis to docker-compose.yml alongside PostgreSQL. In-memory fallback when Redis is unavailable -- dev works with or without Docker.
- **D-15:** Resend for auth emails (verification, password reset) -- same provider already used for contact form emails
- **D-16:** Customer account settings at /portal/account (within sidebar layout). Admin settings at /admin/settings. Both accessible from their respective sidebar navigation.

### Claude's Discretion
- Drizzle migration strategy (push vs generate + migrate)
- Drizzle schema file organization (single file vs split by domain)
- Better Auth configuration and plugin setup
- Redis client choice (ioredis vs redis)
- BullMQ worker configuration
- CSRF protection implementation
- Environment variable structure and .env.example
- proxy.ts auth middleware implementation for route protection
- Setup wizard abuse protection mechanism
- Audit log storage format and query patterns

### Deferred Ideas (OUT OF SCOPE)
- Social login (Google) -- considered but deferred. Better Auth supports it, can add in a future phase if needed.
- Support staff limited admin access (different nav, restricted routes) -- deferred to Phase 2 when dashboard shell is built. Phase 1 gives support_staff same admin dashboard access.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DB-01 | PostgreSQL + Drizzle ORM setup with migration system | Drizzle ORM v0.45.2 with postgres.js driver, drizzle-kit v0.31.10 for migrations. Schema in `src/lib/db/schema/`. Docker PostgreSQL 17 on port 5433. |
| DB-02 | Redis client for caching, sessions, and job queues | ioredis v5.10.1 with in-memory fallback. Add Redis service to docker-compose.yml. Better Auth `secondaryStorage` interface for session persistence. |
| DB-03 | Background job system (BullMQ) for async tasks | BullMQ v5.76.8 (bundles its own ioredis). Queue definitions in `src/jobs/`. Workers run as separate process in production. |
| DB-04 | Database schema: users, orders, licenses, downloads, tickets, notifications, audit_logs, coupons | Full 8-table Drizzle schema with pgEnum types, relations, and foreign keys. Better Auth CLI generates auth tables separately. |
| AUTH-01 | Better Auth integration with dual auth (customer login + admin login) | Single Better Auth instance with `emailAndPassword` enabled. Route handler at `api/auth/[...all]/route.ts`. Client at `src/lib/auth-client.ts`. |
| AUTH-02 | 4-role RBAC system (customer, admin, support_staff, super_admin) with server-side checks | Better Auth admin plugin + access control plugin via `createAccessControl()`. Role stored as custom field on user table. |
| AUTH-03 | Email verification on registration | Better Auth email verification plugin. Non-blocking per D-06 -- sent but does not block access. Resend for email delivery. |
| AUTH-04 | Password reset flow via email link | Better Auth built-in password reset. 1-hour expiry per D-09. Auto-login after reset. Resend for email delivery. |
| AUTH-05 | Session management with Redis-backed storage (optional in dev) | Better Auth `secondaryStorage` interface with ioredis. In-memory fallback when Redis unavailable. 30-day session per D-10. |
| AUTH-06 | Admin 2FA-ready (TOTP support via Better Auth plugin) | Better Auth twoFactor plugin. Enable for admin + super_admin roles. Store TOTP secret in user table. |
| AUTH-07 | Audit logging for all admin mutations (actor, action, target, IP, timestamp) | Better Auth `databaseHooks` for auth events. Manual audit log insertion for application mutations. Separate `audit_logs` table. |
| DASH-02 | Separate CSS for dashboard routes (prevent CSS token conflict with marketing site) | Dashboard CSS in separate file (e.g., `src/app/dashboard.css`). Marketing `globals.css` untouched. Route groups load different CSS. |
| DASH-03 | Unified next-themes across marketing + dashboard (delete dashboard's ThemeContext) | Delete `backenddashboard/src/context/ThemeContext.tsx`. Use existing `ThemeProvider.tsx` (next-themes) in all layout trees. |
| DASH-04 | Route group architecture: (auth)/, (portal)/, (admin)/ separate from [locale]/ | Four independent layout trees. Root layout passthrough. Each group has own `<html>`/`<body>`. proxy.ts handles auth checks. |
</phase_requirements>

## Standard Stack

### Core (Phase 1 Required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `better-auth` | ^1.6.11 | Authentication framework with Drizzle adapter, RBAC, 2FA, admin | Self-hosted, framework-agnostic, built-in Drizzle adapter, admin + access control + twoFactor plugins. Verified: peerDeps include React 19, Next.js 16, drizzle-orm ^0.45.2 [VERIFIED: npm registry] |
| `drizzle-orm` | ^0.45.2 | Type-safe ORM for PostgreSQL queries | Zero runtime deps. Full TypeScript inference. First-class postgres.js driver support. Better Auth expects ^0.45.2 exactly. [VERIFIED: npm registry] |
| `drizzle-kit` | ^0.31.10 | Schema migrations and introspection | Official migration tool. `drizzle-kit generate` + `drizzle-kit migrate` workflow. Required by Better Auth (>=0.31.4). [VERIFIED: npm registry] |
| `postgres` | ^3.4.9 | PostgreSQL driver (postgres.js) | Zero-dependency, async/await-native. Drizzle recommends as primary driver. No native bindings (works on any VPS). [VERIFIED: npm registry] |
| `ioredis` | ^5.10.1 | Redis client for caching and sessions | Full-featured Redis client. Better Auth `secondaryStorage` backend. BullMQ also uses ioredis internally. [VERIFIED: npm registry] |
| `bullmq` | ^5.76.8 | Redis-backed job queue for background tasks | Ships ioredis as bundled dep. Delayed jobs, recurring jobs, retries, dead-letter queues. [VERIFIED: npm registry] |
| `resend` | ^6.12.3 | Transactional email (auth emails) | Already installed and used for contact form emails. Reuse for email verification, password reset. [VERIFIED: npm registry, confirmed in package.json] |

### Supporting (Phase 1 Required)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@better-auth/cli` | ^1.4.21 | Better Auth schema generation CLI | Run `pnpm exec @better-auth/cli generate` to create Drizzle schema for auth tables |
| `zod` | ^4.4.3 | Schema validation (comes with better-auth) | Form validation, API input validation, env var validation. No separate install needed. |
| `date-fns` | ^4.1.0 | Date manipulation and formatting | Audit log timestamps, session expiry, date range queries |
| `nanoid` | ^5.1.11 | Unique ID generation | Order reference IDs, ticket numbers, download tokens |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `postgres` (postgres.js) | `pg` (node-postgres) | pg has callback-based origins and requires native bindings. postgres.js is async-native, zero-dep. Use pg only if PgBouncer transaction-mode is needed. |
| `ioredis` | `redis` (node-redis) | ioredis has better TypeScript types, pipeline support, and is what BullMQ uses internally. |
| `better-auth` | `next-auth` (Auth.js v5) | NextAuth has prolonged beta, harder dual-portal config, no built-in admin/RBAC plugins. Better Auth has Drizzle adapter, admin, access control, 2FA out of the box. |
| `drizzle-orm` | `prisma` | Prisma requires Rust engine binary, larger bundle, slower cold starts on VPS. Drizzle is lighter, faster, zero-dep. |

**Installation (Phase 1 only):**
```bash
# Core dependencies
pnpm add better-auth drizzle-orm postgres ioredis bullmq date-fns nanoid

# Dev dependencies
pnpm add -D drizzle-kit @better-auth/cli @types/node
```

**Note:** `resend` is already installed. `zod` comes with `better-auth` (dependency). Charts, tables, payment gateways, and export libraries are for later phases.

**Version verification (2026-05-15):**
```
better-auth:  1.6.11   (npm view)
drizzle-orm:  0.45.2   (npm view)
drizzle-kit:  0.31.10  (npm view)
postgres:     3.4.9    (npm view)
ioredis:      5.10.1   (npm view)
bullmq:       5.76.8   (npm view)
resend:       6.12.3   (npm view, already in package.json)
@better-auth/cli: 1.4.21 (npm view)
```

## Architecture Patterns

### Recommended Project Structure (Phase 1 additions only)

```
src/
├── app/
│   ├── layout.tsx                          # Root layout (PRESERVED - returns children)
│   ├── globals.css                         # Marketing design tokens (PRESERVED)
│   ├── not-found.tsx                       # 404 page (PRESERVED)
│   │
│   ├── [locale]/                           # Marketing site (PRESERVED AS-IS)
│   │   └── ...                             # All v1.x pages untouched
│   │
│   ├── (auth)/                             # Auth pages (new)
│   │   ├── layout.tsx                      # Auth layout: split-panel design
│   │   ├── login/page.tsx                  # Shared login (role-based redirect)
│   │   ├── register/page.tsx               # Registration (name, email, pass, phone)
│   │   ├── verify-email/page.tsx           # Email verification page
│   │   ├── forgot-password/page.tsx        # Password reset request
│   │   ├── reset-password/page.tsx         # Password reset form
│   │   └── setup/
│   │       └── page.tsx                    # First admin setup wizard
│   │
│   ├── (portal)/                           # Customer portal (skeleton in Phase 1)
│   │   ├── layout.tsx                      # Portal layout with ThemeProvider
│   │   └── dashboard/page.tsx              # Placeholder dashboard
│   │
│   ├── (admin)/                            # Admin dashboard (skeleton in Phase 1)
│   │   ├── layout.tsx                      # Admin layout with ThemeProvider
│   │   └── dashboard/page.tsx              # Placeholder admin dashboard
│   │
│   └── api/
│       └── auth/[...all]/route.ts          # Better Auth catch-all handler
│
├── lib/
│   ├── utils.ts                            # cn() utility (PRESERVED)
│   ├── auth.ts                             # Better Auth server config
│   ├── auth-client.ts                      # Better Auth client config
│   ├── redis.ts                            # Redis client singleton (ioredis)
│   └── db/
│       ├── index.ts                        # Drizzle client initialization
│       ├── schema.ts                       # All table definitions (8 tables + auth)
│       └── seed.ts                         # Seed script for super_admin
│
├── components/
│   ├── layout/                             # Marketing layout (PRESERVED)
│   └── auth/                               # Auth form components (ported)
│       ├── SignInForm.tsx                  # Ported from backenddashboard
│       └── SignUpForm.tsx                  # Ported from backenddashboard
│
├── jobs/                                   # Background job system
│   ├── queues.ts                           # BullMQ queue definitions
│   └── workers/                            # Worker processes
│
├── proxy.ts                                # Route protection + i18n middleware
├── drizzle.config.ts                       # Drizzle Kit config
└── .env.example                            # Environment variable template
```

### Pattern 1: Better Auth with Drizzle Adapter + RBAC

**What:** Single Better Auth instance configured with Drizzle adapter for PostgreSQL, admin plugin for user management, access control plugin for 4-role RBAC, twoFactor plugin for admin 2FA, and email verification for account confirmation.

**When to use:** For any Next.js app needing authentication with database persistence and role-based access.

**Example:**

```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, twoFactor, accessControl } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8, // D-07: minimum 8 characters
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // D-10: 30 days
    updateAge: 60 * 60 * 24,      // Refresh every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,              // Cache session in cookie for 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: false, // Not settable during registration
      },
      phone: {
        type: "string",
        required: true, // D-05: phone at registration
      },
      centralUserId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  plugins: [
    admin(),
    twoFactor(),
    accessControl({
      // Custom role definitions for RBAC
      roles: {
        customer: {},
        admin: {},
        support_staff: {},
        super_admin: {},
      },
    }),
  ],
  // Redis secondary storage for sessions (optional in dev)
  secondaryStorage: process.env.REDIS_URL ? {
    get: async (key) => {
      const { redis } = await import("@/lib/redis");
      return await redis.get(key);
    },
    set: async (key, value, ttl) => {
      const { redis } = await import("@/lib/redis");
      await redis.set(key, value, { EX: ttl });
    },
    delete: async (key) => {
      const { redis } = await import("@/lib/redis");
      await redis.del(key);
    },
  } : undefined,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Log user creation to audit log
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          // Log login event with IP and timestamp
        },
      },
    },
  },
});

export type Auth = typeof auth;
```

```typescript
// src/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  forgotPassword,
  resetPassword,
  emailVerification,
} = authClient;
```

```typescript
// src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

**Source:** Better Auth official docs (installation, database, admin plugin, access control) [VERIFIED: npm registry exports, package.json peerDeps]

### Pattern 2: Route Group Isolation (Four Independent Layout Trees)

**What:** The app has four independent layout trees: marketing (`[locale]`), auth (`(auth)`), portal (`(portal)`), and admin (`(admin)`). The root `layout.tsx` passes children through with no shared HTML shell.

**When to use:** When an app serves fundamentally different UI contexts.

**Key constraint:** Route groups do NOT create URL segments. `(portal)/dashboard/page.tsx` resolves to `/dashboard`, not `/(portal)/dashboard`. Routes must be unique across all groups.

```typescript
// src/app/layout.tsx (PRESERVED - no changes)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

```typescript
// src/app/(auth)/layout.tsx (NEW)
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

```typescript
// src/app/(portal)/layout.tsx (NEW - skeleton for Phase 1)
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

```typescript
// src/app/(admin)/layout.tsx (NEW - skeleton for Phase 1)
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Note:** Phase 2 will add sidebar navigation and header to portal and admin layouts. Phase 1 only establishes the route groups with ThemeProvider.

### Pattern 3: Drizzle Schema with Better Auth Coordination

**What:** Better Auth CLI generates auth tables (user, session, account, verification). Application tables are defined separately. Custom user fields (role, phone, central_user_id) are added via Better Auth's `additionalFields`, not by creating a separate users table.

**When to use:** When integrating Better Auth with a Drizzle-managed PostgreSQL database.

**Schema generation workflow:**
1. Define Better Auth config in `src/lib/auth.ts` with all plugins and `additionalFields`
2. Run `pnpm exec @better-auth/cli generate --output src/lib/db/auth-schema.ts` to generate Drizzle schema for auth tables
3. Define application tables in `src/lib/db/schema.ts` (orders, licenses, downloads, tickets, notifications, audit_logs, coupons)
4. Import both auth schema and application schema into `src/lib/db/index.ts`
5. Run `pnpm exec drizzle-kit generate` to create migration SQL files
6. Run `pnpm exec drizzle-kit migrate` to apply migrations

**Example (application tables):**

```typescript
// src/lib/db/schema.ts (application tables)
import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// === Enums ===
export const licenseStatusEnum = pgEnum("license_status", ["active", "expired", "revoked", "suspended"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "completed", "failed", "refunded"]);
export const paymentMethodEnum = pgEnum("payment_method", ["bkash", "nagad", "rocket", "bank_transfer", "ssl_commerz"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed"]);

// === Orders ===
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id), // references auth user table
  centralOrderId: text("central_order_id"),
  productId: text("product_id").notNull(),
  plan: text("plan").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("BDT"),
  paymentMethod: paymentMethodEnum("payment_method"),
  paymentRef: text("payment_ref"),
  status: orderStatusEnum("status").notNull().default("pending"),
  couponCode: text("coupon_code"),
  taxAmount: integer("tax_amount").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ... remaining 6 tables follow same pattern
```

**Source:** Better Auth docs (schema generation), Drizzle ORM docs (PostgreSQL setup) [VERIFIED: npm registry, official docs]

### Pattern 4: Proxy-Based Route Protection

**What:** Use `proxy.ts` (project convention instead of `middleware.ts`) for auth checks on protected routes. The proxy checks for session cookie existence. Detailed RBAC checks happen in page components (server-side).

**Key constraint:** Edge runtime cannot access Drizzle/PostgreSQL. Proxy does auth yes/no only. Role checks happen in server components.

```typescript
// src/proxy.ts (key sections)
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, and _next
  if (pathname.includes('.') || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return;
  }

  // Protected portal routes
  const isPortalRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/licenses') ||
    pathname.startsWith('/billing') ||
    pathname.startsWith('/downloads') ||
    pathname.startsWith('/tickets') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/checkout');

  // Protected admin routes
  const isAdminRoute = pathname.startsWith('/admin');

  if (isPortalRoute || isAdminRoute) {
    const sessionCookie = request.cookies.get('better-auth.session_token');
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth pages should redirect logged-in users
  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) {
    const sessionCookie = request.cookies.get('better-auth.session_token');
    if (sessionCookie) {
      // Redirect to appropriate dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // i18n routing for marketing pages only
  const isDashboardOrAuth = isPortalRoute || isAdminRoute ||
    pathname.startsWith('/login') || pathname.startsWith('/register') ||
    pathname.startsWith('/verify-email') || pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') || pathname.startsWith('/admin/setup');

  if (isDashboardOrAuth) {
    return NextResponse.next();
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/', '/(bn|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
```

### Pattern 5: Redis Client with In-Memory Fallback

**What:** Redis client singleton that gracefully degrades to in-memory Map when Redis is unavailable. Better Auth `secondaryStorage` is conditionally provided.

```typescript
// src/lib/redis.ts
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

let redis: Redis | null = null;
let memoryStore: Map<string, { value: string; expires: number }> | null = null;

try {
  if (process.env.REDIS_URL) {
    redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        return Math.min(times * 200, 5000);
      },
    });

    if (process.env.NODE_ENV !== "production") {
      globalForRedis.redis = redis;
    }

    console.warn("[Redis] Connected to Redis for session storage and caching.");
  } else {
    memoryStore = new Map();
    console.warn("[Redis] No REDIS_URL found. Using in-memory fallback. Sessions will not persist across restarts.");
  }
} catch (error) {
  memoryStore = new Map();
  console.warn("[Redis] Failed to connect. Using in-memory fallback.", error);
}

export { redis, memoryStore };
```

**Source:** Better Auth docs (secondary storage interface) [VERIFIED: official docs]

### Pattern 6: CSS Isolation Between Marketing and Dashboard

**What:** Marketing site uses `src/app/globals.css` (PRESERVED). Dashboard and auth routes use a separate CSS file. The dashboard template's `--breakpoint-*: initial;` reset is isolated to dashboard CSS only.

**How it works:**
- `[locale]/layout.tsx` imports `../globals.css` (unchanged)
- `(auth)/layout.tsx`, `(portal)/layout.tsx`, `(admin)/layout.tsx` import a separate `dashboard.css`
- Each layout has its own `<html>` element, so CSS scoping is natural

**Why separate files:** The dashboard template's `@theme` block resets breakpoints (`--breakpoint-*: initial`) and font tokens (`--font-*: initial`). Merging this into the marketing site's `globals.css` would destroy all responsive breakpoints on marketing pages. [VERIFIED: `backenddashboard/src/app/globals.css` line 6 and 9]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | bcrypt/bcryptjs wrapper | Better Auth built-in hashing | Better Auth handles hashing internally with argon2id. Never hash passwords yourself. |
| JWT/session management | Custom JWT signing + verification | Better Auth session system | Better Auth manages session tokens, cookie setting, expiry, rotation. Sessions in DB + Redis. |
| RBAC role checking | `if (user.role === 'admin')` conditionals | Better Auth admin + access control plugins | Plugins provide type-safe role/permission checks. Custom conditionals miss edge cases. |
| Email sending templates | Raw HTML string concatenation | Resend SDK with React Email | Already have Resend installed. React Email components are type-safe and maintainable. |
| Rate limiting | Custom request counter middleware | `rate-limiter-flexible` with Redis | Handles sliding window, fixed window, distributed counting. Do not build your own. |
| CSRF protection | Custom token generation | Better Auth built-in CSRF | Better Auth handles CSRF tokens for auth forms automatically. |
| Database migrations | Manual SQL files without versioning | Drizzle Kit `generate` + `migrate` | Version-controlled migration files with rollback support. |

**Key insight:** Better Auth handles the entire auth lifecycle (registration, login, sessions, password reset, email verification, 2FA, RBAC, CSRF). Building any of these manually creates security vulnerabilities and maintenance burden.

## Common Pitfalls

### Pitfall 1: Dashboard CSS Token Reset Destroys Marketing Site

**What goes wrong:** The `backenddashboard/globals.css` opens with `--breakpoint-*: initial;` inside its `@theme { }` block, which resets ALL Tailwind default breakpoints to nothing. If merged into the marketing site's `globals.css`, every responsive breakpoint breaks.

**Why it happens:** The dashboard template was built as a standalone app. The reset is intentional within that context but catastrophic when merged.

**How to avoid:** Create a separate CSS file for dashboard routes. Marketing site's `globals.css` remains untouched. Each layout tree imports its own CSS.

**Warning signs:** Marketing pages lose responsive behavior. `sm:`, `md:`, `lg:` classes stop working. Font families revert to browser defaults.

### Pitfall 2: Better Auth + Drizzle Dual Migration Conflict

**What goes wrong:** Running both `npx @better-auth/cli migrate` and `drizzle-kit migrate` on the same tables creates conflicts. Better Auth expects its own tables (user, session, account, verification) to match its internal schema exactly. Drizzle Kit also tries to manage these tables if they are in the schema.

**Why it happens:** Two migration systems managing overlapping tables.

**How to avoid:**
1. Use Better Auth CLI to generate the Drizzle schema for auth tables only
2. Define application tables separately in `src/lib/db/schema.ts`
3. Use a SINGLE `drizzle-kit migrate` to apply all migrations (auth + application tables together)
4. After Better Auth CLI generates the schema, merge it into your main schema file
5. Never run `@better-auth/cli migrate` directly -- always go through Drizzle Kit

**Warning signs:** "Column already exists" errors during migration. Two `users` tables in the database. Better Auth login fails after Drizzle migration.

### Pitfall 3: Redis Hard Dependency Blocks Development

**What goes wrong:** If the app requires Redis on startup, developers cannot run `pnpm dev` without Docker running. On Windows, Redis is not natively available.

**Why it happens:** Redis added as hard dependency without fallback.

**How to avoid:** Make Redis optional in development via `secondaryStorage: process.env.REDIS_URL ? ... : undefined`. Provide in-memory Map fallback for caching. Log a warning so developers know they are not using persistent sessions.

**Warning signs:** `pnpm dev` fails with Redis connection errors. Developers cannot test auth flows without Docker.

### Pitfall 4: Route Group Collision Between [locale] and Dashboard

**What goes wrong:** If dashboard routes are inside `[locale]/`, the i18n middleware processes them, adding `/en/dashboard` or `/bn/dashboard` URL prefixes. Dashboard pages load i18n provider unnecessarily.

**Why it happens:** The i18n middleware intercepts all `[locale]` routes. Dashboard pages do not need i18n.

**How to avoid:** Dashboard, portal, and auth route groups are outside `[locale]`. They live at `/dashboard`, `/admin`, `/login`, etc. Only marketing pages are under `[locale]`. Proxy.ts must explicitly skip i18n middleware for these routes.

**Warning signs:** Dashboard URLs redirect to `/en/dashboard`. Marketing Navbar/Footer appears on dashboard pages.

### Pitfall 5: RBAC Checks Only in Proxy (Not in Page Components)

**What goes wrong:** Proxy checks for session cookie existence but not role. A customer with a valid session can access `/admin` URLs if role checks are only in proxy.

**Why it happens:** Edge runtime in proxy cannot query the database for role information.

**How to avoid:** Proxy checks auth (session cookie exists). Page components check role (server-side session validation with role lookup). Every admin page verifies `role === "admin" | "super_admin"` in its server-side data fetch.

**Warning signs:** Customer can access `/admin/dashboard` URL with a valid customer session.

### Pitfall 6: Setup Wizard Abuse (Creating Unwanted Admin Accounts)

**What goes wrong:** The `/admin/setup` route is supposed to only work when no admin exists. If the check is naive (e.g., checking a single admin user count), race conditions or direct API calls could create unwanted admin accounts.

**Why it happens:** Setup wizard has no authentication gate (it runs before any admin exists). Anyone who knows the URL can attempt access.

**How to avoid:** Check user count server-side. If any user with `role === 'super_admin'` exists, return 404 or redirect. Add rate limiting to the setup endpoint. Consider adding a setup token in env vars (`ADMIN_SETUP_TOKEN`) that must be provided. After first admin is created, the route permanently disables.

**Warning signs:** Multiple super_admin accounts exist in the database. Setup page accessible after initial admin creation.

### Pitfall 7: Theme Flash Between Marketing and Dashboard

**What goes wrong:** User has dark mode set on marketing site, navigates to dashboard, and gets a white flash because the dashboard layout initializes theme independently.

**Why it happens:** Each layout tree has its own `<html>` element and ThemeProvider instance. They use the same `next-themes` key but different layout trees.

**How to avoid:** All ThemeProvider instances use identical configuration (`attribute="class"`, `defaultTheme="light"`, `enableSystem={false}"`). They share the same cookie/localStorage key (`theme`). Navigation between layout trees is a full page load, so `next-themes` reads the stored preference from cookie/localStorage and applies it before paint.

**Warning signs:** Theme does not persist when navigating from `/en/pricing` to `/dashboard`. Light flash on dark mode when entering dashboard.

## Code Examples

### Better Auth Server Configuration

```typescript
// src/lib/auth.ts
// Source: Better Auth official docs + npm registry verification
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, twoFactor } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  plugins: [admin(), twoFactor()],
  // ... see Pattern 1 above for full config
});
```

### Drizzle Database Client

```typescript
// src/lib/db/index.ts
// Source: Drizzle ORM official docs
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });
```

### Redis Client Singleton

```typescript
// src/lib/redis.ts
// Source: ioredis docs + Better Auth secondary storage interface
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export const redis = globalForRedis.redis ?? (process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 3 })
  : null);

if (process.env.NODE_ENV !== "production" && redis) {
  globalForRedis.redis = redis;
}
```

### Server-Side Role Check in Page Component

```typescript
// src/app/(admin)/dashboard/page.tsx
// Source: Better Auth admin plugin docs
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboard() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const userRole = session.user.role;
  if (userRole !== "admin" && userRole !== "super_admin" && userRole !== "support_staff") {
    redirect("/dashboard"); // Redirect customers to their portal
  }

  return <div>Admin Dashboard (placeholder)</div>;
}
```

### Account Lockout After Failed Attempts (D-08)

```typescript
// Implementation approach: Better Auth hooks + rate-limiter-flexible
// Track failed attempts in Redis, check before auth
import { redis } from "@/lib/redis";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

async function checkLoginLockout(email: string): Promise<boolean> {
  if (!redis) return false; // Skip in dev without Redis
  const key = `login_attempts:${email}`;
  const attempts = await redis.get(key);
  return attempts !== null && parseInt(attempts) >= MAX_ATTEMPTS;
}

async function recordFailedAttempt(email: string): Promise<void> {
  if (!redis) return;
  const key = `login_attempts:${email}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, LOCKOUT_MINUTES * 60);
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NextAuth/Auth.js v5 beta | Better Auth v1.6+ (stable) | 2024-2025 | Better Auth has built-in Drizzle adapter, admin plugin, RBAC. No more custom adapter wiring. |
| Prisma ORM | Drizzle ORM v0.45+ | 2024-2025 | Zero Rust engine binary, lighter bundle, faster cold starts on VPS, SQL-like API. |
| pg (node-postgres) | postgres.js | 2024-2025 | Zero-dependency, async-native, no callback legacy. Drizzle recommends as primary driver. |
| Custom session management | Better Auth secondaryStorage | 2025 | Standard interface for Redis/Memcached session storage. No custom session code needed. |
| `middleware.ts` | `proxy.ts` (Next.js 16) | 2025-2026 | Next.js 16 recommends proxy.ts over middleware.ts for auth, redirects, rewrites. |
| Tailwind CSS v3 (config file) | Tailwind CSS v4 (CSS-first) | 2024-2025 | No tailwind.config.js. Tokens via `@theme { }` block in CSS. PostCSS plugin. |

**Deprecated/outdated:**
- `middleware.ts`: Project rule mandates `proxy.ts` instead. Do not create middleware.ts.
- `bcrypt`/`bcryptjs`: Better Auth handles password hashing internally with argon2id. Never hash passwords yourself.
- `jsonwebtoken`/`jose`: Better Auth handles JWT/session management. Do not build custom token logic.
- Custom `ThemeContext.tsx` from dashboard template: Delete entirely, use `next-themes`.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Better Auth `additionalFields` supports `defaultValue` and `input: false` for role field | Standard Stack / Pattern 1 | If not supported, role management requires manual DB inserts after user creation |
| A2 | Better Auth admin plugin provides `createAccessControl` for custom 4-role RBAC | Pattern 1 | If not available, implement RBAC with manual role checks in every protected route |
| A3 | Better Auth `secondaryStorage` interface accepts `get/set/delete` with async functions | Pattern 5 | If interface differs, Redis session integration needs custom adapter |
| A4 | `@better-auth/cli generate` outputs Drizzle-compatible TypeScript schema | Pattern 3 | If output format differs, manual schema conversion needed |
| A5 | postgres.js driver works with Drizzle adapter `provider: "pg"` | Pattern 3 | If incompatible, switch to `pg` driver (minor change) |
| A6 | Next.js 16 route groups resolve literal segments before `[locale]` dynamic segment | Pattern 2 | If not, `/dashboard` would be caught by `[locale]` middleware |
| A7 | Better Auth session cookie name is `better-auth.session_token` | Pattern 4 | If different name, proxy.ts cookie check needs adjustment |
| A8 | Better Auth `databaseHooks` supports `after` hooks on user and session creation | Pattern 1 | If not, audit logging requires custom middleware wrapper |

**If this table is empty:** All claims were verified or cited. The above claims need confirmation during implementation.

## Open Questions

1. **Better Auth + Drizzle CLI workflow**
   - What we know: Better Auth CLI generates Drizzle schema for auth tables. Drizzle Kit generates migrations for all tables.
   - What's unclear: Exact sequence of commands. Does `@better-auth/cli generate` output directly into a Drizzle schema file, or does it create a separate file that must be merged?
   - Recommendation: Run `@better-auth/cli generate` first, examine output, then merge into main schema file. This needs hands-on validation (flagged in STATE.md as a blocker concern).

2. **Setup wizard abuse protection mechanism**
   - What we know: D-11 specifies setup wizard at `/admin/setup` that only works when no admin exists. Protected by checking user count.
   - What's unclear: Whether a simple user count check is sufficient, or if an env var token (`ADMIN_SETUP_TOKEN`) is also needed.
   - Recommendation: Implement both: user count check (no super_admin exists) + optional setup token from env vars. If token is set, require it. If not set, allow without token (for convenience).

3. **Account lockout implementation with Better Auth**
   - What we know: D-08 specifies 5 failed attempts = 15-minute lockout.
   - What's unclear: Better Auth does not have built-in account lockout. Need to implement via `databaseHooks` or pre-login check.
   - Recommendation: Implement with Redis counter (track failed attempts per email). Check counter before allowing login attempt. Clear counter on successful login.

4. **Email verification flow with Resend**
   - What we know: D-06 specifies auto-login after registration, email verification sent but not blocking. Resend is already installed.
   - What's unclear: Better Auth email verification plugin integration with Resend (not the built-in email provider).
   - Recommendation: Use Better Auth's `sendVerificationEmail` callback to send via Resend SDK. This should be a simple callback override.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL 17 | Database layer | Available (Docker) | 17-alpine | -- |
| Redis | Sessions, caching, queues | Not yet installed | -- | In-memory Map |
| Node.js | Runtime | Available | Compatible with Next.js 16 | -- |
| pnpm | Package manager | Available | In lockfile | -- |
| Docker | PostgreSQL + Redis containers | Available | Docker Desktop (Windows) | -- |
| Resend | Auth emails | Available (installed) | ^6.12.3 | -- |

**Missing dependencies with no fallback:**
- None. All critical dependencies are available or have fallbacks.

**Missing dependencies with fallback:**
- Redis: Not yet in docker-compose.yml. In-memory fallback for development. Must add to docker-compose.yml as part of Phase 1.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- needs setup |
| Config file | None -- Wave 0 |
| Quick run command | `pnpm test` (after setup) |
| Full suite command | `pnpm test` (after setup) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DB-01 | Drizzle ORM connects to PostgreSQL and queries succeed | integration | Manual verification | No -- Wave 0 |
| DB-02 | Redis client connects and get/set works | integration | Manual verification | No -- Wave 0 |
| DB-03 | BullMQ queue accepts and processes jobs | integration | Manual verification | No -- Wave 0 |
| DB-04 | All 8 tables created with correct columns and relations | integration | Manual verification | No -- Wave 0 |
| AUTH-01 | User can register, login, logout via Better Auth | e2e | Manual verification | No -- Wave 0 |
| AUTH-02 | RBAC: customer cannot access admin routes, admin can | e2e | Manual verification | No -- Wave 0 |
| AUTH-03 | Email verification sent after registration | integration | Manual verification | No -- Wave 0 |
| AUTH-04 | Password reset link works and auto-logs in | e2e | Manual verification | No -- Wave 0 |
| AUTH-05 | Redis-backed sessions persist across requests | integration | Manual verification | No -- Wave 0 |
| AUTH-06 | Admin can enable TOTP 2FA | e2e | Manual verification | No -- Wave 0 |
| AUTH-07 | Admin mutations logged to audit_logs | integration | Manual verification | No -- Wave 0 |
| DASH-02 | Dashboard CSS does not affect marketing site | manual | Visual verification | No -- Wave 0 |
| DASH-03 | Theme toggle works across all layouts | manual | Visual verification | No -- Wave 0 |
| DASH-04 | Route groups resolve correctly (no collisions) | integration | Manual verification | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** Visual verification + `pnpm build` passes
- **Per wave merge:** Full auth flow walkthrough (register -> verify email -> login -> role check -> logout -> password reset)
- **Phase gate:** All 5 success criteria from ROADMAP.md verified manually

### Wave 0 Gaps
- [ ] No test framework installed -- project has zero test files
- [ ] Consider Vitest for unit/integration tests (fast, ESM-native, TypeScript support)
- [ ] Phase 1 is infrastructure-heavy -- manual verification may be more practical than automated tests for initial setup
- [ ] Automated tests should be added in Phase 2+ when feature logic exists

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | Better Auth (email/password, session management) |
| V3 Session Management | Yes | Better Auth + Redis secondaryStorage, 30-day expiry |
| V4 Access Control | Yes | Better Auth admin + access control plugins, proxy.ts route protection |
| V5 Input Validation | Yes | Zod (comes with Better Auth), form validation on auth pages |
| V6 Cryptography | Yes | Better Auth handles password hashing (argon2id), session token generation |
| V8 Data Protection | Yes | RBAC restricts data access, role-based query filtering |
| V9 Logging | Yes | audit_logs table for admin mutations, Better Auth databaseHooks |

### Known Threat Patterns for Next.js + Better Auth

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Brute force login | Tampering | Rate limiting (5 attempts / 15-min lockout per D-08) |
| Session hijacking | Spoofing | HttpOnly cookies, HTTPS-only, Redis session validation |
| CSRF on auth forms | Tampering | Better Auth built-in CSRF protection |
| Privilege escalation | Elevation | Server-side role checks in every protected page component |
| SQL injection | Tampering | Drizzle ORM parameterized queries (never raw SQL) |
| Mass assignment | Tampering | Better Auth `additionalFields` with `input: false` for role |
| Open redirect on login | Spoofing | Whitelist redirect destinations in login handler |

## Sources

### Primary (HIGH confidence)
- npm registry version queries (all packages, 2026-05-15) -- versions, peerDeps, exports
- `better-auth` package.json exports -- verified drizzle adapter, next-js integration, admin/twoFactor/access plugins
- `drizzle-orm` documentation -- PostgreSQL setup, schema definition, migrations
- Better Auth official docs (via Context7) -- installation, database, admin plugin, access control, secondary storage
- Codebase analysis -- `src/app/layout.tsx`, `src/app/[locale]/layout.tsx`, `src/app/globals.css`, `package.json`, `docker-compose.yml`, `next.config.ts`

### Secondary (MEDIUM confidence)
- `backenddashboard/` template analysis -- auth forms, ThemeContext, SidebarContext, layout structure, CSS token system
- Better Auth email verification plugin docs -- mostly empty (client-rendered page), assumed based on plugin name and peer patterns
- BullMQ documentation -- queue patterns, worker configuration

### Tertiary (LOW confidence)
- Better Auth `createAccessControl` API surface -- assumed from plugin exports, needs hands-on validation
- Better Auth + Drizzle CLI workflow exact sequence -- assumed from docs, flagged as open question
- Account lockout implementation approach -- assumed (Redis counter + pre-login check), not a built-in Better Auth feature

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified via npm registry, peerDeps confirmed compatible
- Architecture: HIGH -- route groups, Drizzle schema, Better Auth config all verified against codebase and official docs
- Pitfalls: HIGH -- based on direct codebase analysis of dashboard CSS reset, theme context, and route structure
- Auth integration: MEDIUM -- Better Auth is well-documented but CLI workflow and exact plugin APIs need hands-on validation

**Research date:** 2026-05-15
**Valid until:** 2026-06-15 (stable libraries, low churn expected)
