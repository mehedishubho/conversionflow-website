# WooBooster Website

## What This Is

WooBooster is a marketing/landing page website for a WooCommerce plugin product. The site is built with Next.js 16 (App Router), TypeScript, and TailwindCSS v4, porting a complete static HTML design reference (`woobooster-v2.html`, 1247 lines) into a production-ready React application. The site targets WooCommerce store owners and presents WooBooster's features, pricing, changelog, and support information.

## Core Value

A polished, high-performance marketing website that converts WooCommerce store owners into WooBooster customers through clear presentation of features, pricing, and trust signals.

## Requirements

### Validated

- ✓ Next.js 16 App Router scaffold with TypeScript strict mode — existing
- ✓ TailwindCSS v4 with custom design token system (light/dark themes) — existing
- ✓ Responsive Navbar with theme toggle, mobile menu, active route highlighting — existing
- ✓ ThemeProvider with next-themes class-based strategy — existing
- ✓ Google Fonts loaded via next/font/google (Syne, DM Sans, JetBrains Mono) — existing
- ✓ Framer Motion animation integration — existing
- ✓ Lucide React icon integration — existing
- ✓ Path alias `@/*` → `./src/*` configured — existing

### Active

- [ ] Fix build-breaking missing Footer component (`src/components/layout/Footer.tsx`)
- [ ] Fix build-breaking missing `cn` utility (`src/lib/utils.ts`)
- [ ] Fix CSS bug: `height-[34px]` → `h-[34px]` in Navbar
- [ ] Add button CSS classes (`btn`, `btn-primary`, `btn-outline`) to globals.css
- [ ] Port hero section from `woobooster-v2.html` to `src/app/page.tsx`
- [ ] Create Features page (`/features`)
- [ ] Create Pricing page (`/pricing`)
- [ ] Create Changelog page (`/changelog`)
- [ ] Create Support page (`/support`)
- [ ] Add custom 404 page (`not-found.tsx`)
- [ ] Add SEO metadata (Open Graph, structured data)
- [ ] Add custom favicon and brand assets
- [ ] Fix Navbar hydration flash (return skeleton instead of null)

### Out of Scope

- Backend API or database — static marketing site only
- Authentication/login — public website, no user accounts
- E-commerce functionality — the product is WooCommerce, but this site is marketing only
- CMS integration — hardcoded content for v1
- Real-time features — static content delivery
- Mobile app — web-first approach

## Context

- **Design Reference**: `woobooster-v2.html` (1247 lines) at project root is the complete static HTML prototype containing all sections (hero, features, pricing, changelog, support, footer) with custom cursor, animations, and full design tokens
- **Early Development**: Only 4 source files exist (`layout.tsx`, `page.tsx`, `Navbar.tsx`, `ThemeProvider.tsx`) plus 1 CSS file (`globals.css`)
- **Build Currently Broken**: Missing `Footer.tsx` and `utils.ts` prevent compilation
- **Planned Routes**: `/` (Home), `/features`, `/pricing`, `/changelog`, `/support` — defined in Navbar's `navLinks` array
- **No Tests**: Zero test infrastructure, no test framework installed
- **No CI/CD**: No GitHub Actions, no deployment pipeline configured
- **Deployment Target**: Vercel (implied by project setup)

## Constraints

- **Package Manager**: pnpm only (never npm, yarn, bun)
- **Framework**: Next.js 16 with App Router, TypeScript, TailwindCSS, ESLint
- **Proxy**: Use `proxy.ts` instead of `middleware.ts` per project rules
- **Components**: Server components by default; client components only when needed
- **Styling**: TailwindCSS v4 CSS-first config with custom design tokens; no Tailwind config file
- **Design Fidelity**: Must match `woobooster-v2.html` visual design

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 16 App Router | Modern React framework with server components, App Router is the standard | — Pending |
| TailwindCSS v4 CSS-first | Latest approach, no JS config file needed | — Pending |
| next-themes for dark/light | Well-established library, class-based strategy for Tailwind compatibility | — Pending |
| Framer Motion for animation | Rich animation API, good React integration | — Pending |
| Static marketing site | No backend needed for marketing content | — Pending |
| Design reference HTML | Complete prototype exists as single source of truth for visual design | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-11 after initialization*
