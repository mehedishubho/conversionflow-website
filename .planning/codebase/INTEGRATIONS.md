# External Integrations

**Analysis Date:** 2026-05-11

## APIs & External Services

**No external APIs detected.**
- No `fetch()` calls in source code
- No HTTP client libraries (axios, ky, got, etc.) in dependencies
- No API routes defined in `src/app/api/`
- The project is currently a static marketing/landing page with no backend API consumption

**Google Fonts:**
- Loaded via `next/font/google` (not a direct external API call)
- Fonts: Syne, DM Sans, JetBrains Mono
- Configuration in `src/app/layout.tsx`

## Data Storage

**Databases:**
- None. No database client, ORM, or connection configuration present.
- No Prisma, Drizzle, Mongoose, or similar packages in `package.json`

**File Storage:**
- Local filesystem only via `public/` directory
- Static assets: file.svg, globe.svg, next.svg, vercel.svg, window.svg
- No cloud storage integration (S3, Cloudflare R2, etc.)

**Caching:**
- None. No Redis, Memcached, or caching layer configured.

## Authentication & Identity

**Auth Provider:**
- None. No authentication system implemented.
- No auth libraries (NextAuth.js, Clerk, Lucia, etc.) in dependencies
- No login/signup pages or protected routes

## Monitoring & Observability

**Error Tracking:**
- None. No Sentry, LogRocket, or error tracking service configured.

**Logs:**
- Console-level logging only (Next.js default)
- No structured logging library

**Analytics:**
- None. No Google Analytics, Plausible, Vercel Analytics, or similar packages detected.

## CI/CD & Deployment

**Hosting:**
- Target: Vercel (implied by `public/vercel.svg` and `README.md` references)
- No custom deployment configuration files (no `Dockerfile`, `vercel.json`, or `docker-compose.yml`)

**CI Pipeline:**
- None detected. No `.github/workflows/`, `.gitlab-ci.yml`, or similar CI configuration.

**Build Commands:**
- `pnpm build` - Production build
- `pnpm start` - Start production server
- `pnpm dev` - Development server

## Environment Configuration

**Required env vars:**
- None. The project runs without any environment variables.

**Secrets location:**
- No secrets management. No `.env` files exist.
- No `NEXT_PUBLIC_*` or server-side environment variables referenced in code.

## Webhooks & Callbacks

**Incoming:**
- None. No API routes or webhook endpoints defined.

**Outgoing:**
- None. No outgoing webhook calls or external service notifications.

## Third-Party Libraries (Client-Side Only)

**Framer Motion (`framer-motion` 12.38.0):**
- Purpose: UI animations (navbar entrance, mobile menu transitions, active link indicators)
- Used in: `src/components/layout/Navbar.tsx`
- Client-side only (marked with `"use client"`)

**Lucide React (`lucide-react` 1.14.0):**
- Purpose: SVG icon components (Sun, Moon, Menu, X, ArrowRight)
- Used in: `src/components/layout/Navbar.tsx`
- Tree-shakeable icon imports

**next-themes (`next-themes` 0.4.6):**
- Purpose: Light/dark theme toggling
- Configuration: class-based strategy, default light, system preference disabled
- Used in: `src/components/layout/ThemeProvider.tsx`, `src/components/layout/Navbar.tsx`

**clsx + tailwind-merge:**
- Purpose: Conditional and deduplicated CSS class names
- Combined via `cn()` utility at `src/lib/utils` (file referenced but not yet present on disk)
- Pattern: `cn("base-classes", condition && "conditional-class")`

## Integration Readiness

The project is a clean Next.js 16 scaffold with no external service dependencies. Key observations for future integrations:

- **No API layer exists** - Adding backend integration will require creating `src/app/api/` routes or a separate service layer
- **No environment variable pattern** - Will need to establish `.env` file and `NEXT_PUBLIC_*` conventions when adding integrations
- **No proxy/middleware** - `src/proxy.ts` (as specified in project rules in `AGENTS.md`) has not been created yet
- **Design reference available** - `woobooster-v2.html` at the project root is a 1247-line static HTML prototype that serves as the design reference for the Next.js build

---

*Integration audit: 2026-05-11*
