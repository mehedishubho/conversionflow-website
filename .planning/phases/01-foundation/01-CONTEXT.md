# Phase 1: Database, Auth, and Route Foundation - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning

<domain>
## Phase Boundary

The application has a working database, authentication system, and route architecture that isolates the dashboard from the marketing site. Users can register, verify email, log in, reset passwords, and access role-appropriate routes. PostgreSQL + Drizzle schema with all 8 tables, Better Auth with 4-role RBAC, Redis-backed sessions, route group architecture, and CSS isolation — all functional and building cleanly.

</domain>

<decisions>
## Implementation Decisions

### Auth Page Design
- **D-01:** Port backenddashboard auth forms (SignInForm.tsx, SignUpForm.tsx) as-is — swap Outfit font for ConversionFlow design system fonts (DM Sans, Syne), rewire ThemeContext to next-themes
- **D-02:** Auth pages are English only — no Bengali i18n (they live outside [locale] route group)

### Login Flow
- **D-03:** Single shared login page at `(auth)/login` — server-side role check after auth redirects customers to /portal/dashboard, admins/support_staff to /admin/dashboard
- **D-04:** Fixed redirect per role — no dynamic routing or permission-based nav in Phase 1

### Registration
- **D-05:** Registration collects: full name + email + password + phone number (phone needed for BD payment verification in Phase 4)
- **D-06:** Auto-login with full access after registration — email verification sent but not blocking. Users can use the platform immediately.

### Password & Security
- **D-07:** Minimum 8 characters, no complexity rules (suitable for BD audience)
- **D-08:** 5 failed login attempts triggers 15-minute account lockout
- **D-09:** Password reset link expires in 1 hour, auto-login after successful reset
- **D-10:** 30-day session duration

### First Admin Setup
- **D-11:** Setup wizard page as primary method — a /admin/setup route that only works when no admin account exists (protected from abuse by checking user count)
- **D-12:** Seed script (pnpm db:seed) from env vars (ADMIN_EMAIL, ADMIN_PASSWORD) as backup/emergency fallback for creating super_admin

### Database Schema
- **D-13:** Full 8-table schema created upfront in Phase 1: users, orders, licenses, downloads, tickets, notifications, audit_logs, coupons. Later phases add data flows, not new tables.

### Dev Environment
- **D-14:** Add Redis to docker-compose.yml alongside PostgreSQL. In-memory fallback when Redis is unavailable — dev works with or without Docker.
- **D-15:** Resend for auth emails (verification, password reset) — same provider already used for contact form emails

### Account Management
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Planning
- `.planning/ROADMAP.md` — Phase 1 goal, requirements (DB-01 through DB-04, AUTH-01 through AUTH-07, DASH-02 through DASH-04), success criteria
- `.planning/REQUIREMENTS.md` — Full v2 requirements with traceability, acceptance criteria for each requirement
- `.planning/PROJECT.md` — Constraints (pnpm only, Next.js 16, proxy.ts, TailwindCSS v4 CSS-first), key decisions, out of scope items
- `.planning/STATE.md` — Current progress, accumulated decisions, blockers/concerns

### Dashboard Template (Port Source)
- `backenddashboard/src/components/auth/SignInForm.tsx` — Sign-in form to port (layout, fields, styling)
- `backenddashboard/src/components/auth/SignUpForm.tsx` — Sign-up form to port (layout, fields, styling)
- `backenddashboard/src/context/ThemeContext.tsx` — Custom theme context to DELETE, replace with next-themes
- `backenddashboard/src/context/SidebarContext.tsx` — Sidebar state management pattern reference
- `backenddashboard/src/layout/AppSidebar.tsx` — Sidebar component pattern reference
- `backenddashboard/src/layout/AppHeader.tsx` — Header component pattern reference
- `backenddashboard/src/layout/Backdrop.tsx` — Mobile backdrop pattern reference
- `backenddashboard/src/app/layout.tsx` — Dashboard root layout structure reference

### Existing Source Files
- `src/app/layout.tsx` — Root layout (passes children through)
- `src/app/[locale]/layout.tsx` — Marketing site layout with fonts, ThemeProvider, Navbar, Footer, CustomCursor
- `src/app/globals.css` — Design tokens, theme variables, utility classes
- `src/components/layout/ThemeProvider.tsx` — next-themes wrapper (shared across all layouts)
- `docker-compose.yml` — PostgreSQL 17 Alpine on port 5433, Adminer on 8081

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Resend email**: Already installed and sending contact form emails — reuse for auth emails
- **cn() utility** (`src/lib/utils.ts`): clsx + tailwind-merge, available everywhere
- **Design token system** (`globals.css`): Full light/dark theme with CSS variables, `.glass` utility
- **ThemeProvider** (`src/components/layout/ThemeProvider.tsx`): next-themes wrapper, already working across marketing site
- **Dashboard template** (`backenddashboard/`): 65+ components, auth forms, sidebar, header, charts, tables — port, don't rebuild

### Established Patterns
- Server components by default, `"use client"` only when needed (useState, useEffect, browser APIs)
- TailwindCSS v4 CSS-first config — no tailwind.config.js, tokens via `@theme { }` block
- Route groups for layout isolation — `[locale]/` for marketing, new groups for auth/portal/admin
- Framer Motion for animations, Lucide React for icons
- Data files in `src/data/` for content, MDX for blog/docs

### Integration Points
- `src/app/layout.tsx` — Root layout needs to wrap new route groups alongside `[locale]`
- `src/app/[locale]/layout.tsx` — Must remain untouched (marketing site preserved as-is)
- `docker-compose.yml` — Add Redis service alongside existing PostgreSQL
- `src/components/layout/ThemeProvider.tsx` — Shared across marketing + dashboard layouts

</code_context>

<specifics>
## Specific Ideas

- Setup wizard page should only activate when zero admin users exist — after first admin is created, the route returns 404 or redirects
- Auto-login after registration means the verification email is informational only — users can ignore it
- Phone number at registration is forward-looking for Phase 4 BD payment verification (bKash, Nagad)
- In-memory Redis fallback should log a warning so developers know they're not using persistent sessions

</specifics>

<deferred>
## Deferred Ideas

- Social login (Google) — considered but deferred. Better Auth supports it, can add in a future phase if needed.
- Support staff limited admin access (different nav, restricted routes) — deferred to Phase 2 when dashboard shell is built. Phase 1 gives support_staff same admin dashboard access.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-05-15*
