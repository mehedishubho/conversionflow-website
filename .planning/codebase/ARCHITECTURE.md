# Architecture

**Analysis Date:** 2026-05-11

## Pattern Overview

**Overall:** Next.js App Router single-page marketing website (in early development)

**Key Characteristics:**
- Server Components by default; Client Components only where interactivity is required (marked with `"use client"`)
- File-based routing via the App Router convention (`src/app/`)
- TailwindCSS v4 with CSS-first configuration using custom design tokens (CSS variables)
- Dark/light theme support via `next-themes` with class-based strategy
- Framer Motion for animations and micro-interactions
- Lucide React for iconography
- Utility-first CSS with custom `.glass` and `.hero-mesh` utility classes
- Path alias `@/*` maps to `./src/*` for clean imports

## Layers

**Presentation Layer (Pages & Layouts):**
- Purpose: Render pages and wrap with shared layout chrome
- Location: `src/app/`
- Contains: `page.tsx`, `layout.tsx`, `globals.css`, `favicon.ico`
- Depends on: Layout components (`Navbar`, `Footer`, `ThemeProvider`), global styles
- Used by: Next.js router (file-based routing)

**Component Layer (UI Components):**
- Purpose: Reusable UI building blocks organized by domain
- Location: `src/components/`
- Contains: Layout components (`Navbar.tsx`, `ThemeProvider.tsx`)
- Depends on: `next-themes`, `framer-motion`, `lucide-react`, `@/lib/utils`
- Used by: Presentation layer (`layout.tsx`, pages)

**Utility Layer:**
- Purpose: Shared helper functions (e.g., `cn` for className merging)
- Location: `src/lib/`
- Contains: Intended `utils.ts` (not yet created)
- Depends on: `clsx`, `tailwind-merge` (declared in `package.json`)
- Used by: Components

## Data Flow

**Page Rendering:**

1. Next.js router matches URL to file in `src/app/`
2. `layout.tsx` wraps the page with fonts, `<html>`, `<body>`, `ThemeProvider`, `Navbar`, `Footer`
3. Server Component page renders its JSX (e.g., `page.tsx`)
4. Client Components hydrate for interactivity (`Navbar`, `ThemeProvider`)

**Theme Switching:**

1. `ThemeProvider` wraps the app with `next-themes` context (class-based strategy)
2. `Navbar` reads/writes theme via `useTheme()` hook
3. CSS variables in `globals.css` switch between `:root` and `.dark` selectors
4. All components reference CSS custom properties for colors, so theme propagates automatically

**Navigation State:**

1. `Navbar` reads current path via `usePathname()` from `next/navigation`
2. Active link is highlighted with a Framer Motion `layoutId="active-nav"` animated underline
3. Mobile menu uses `AnimatePresence` for enter/exit transitions

**State Management:**
- No global state management library (no Redux, Zustand, etc.)
- Local state via `useState`/`useEffect` in Client Components
- Theme state managed by `next-themes` context
- Intended as a static marketing site with no server-side data fetching

## Key Abstractions

**Layout Shell:**
- Purpose: Provides the persistent chrome (navbar, footer, theme) around all pages
- Examples: `src/app/layout.tsx`
- Pattern: Next.js root layout wraps children with providers and structural components
- Loads 3 Google Fonts: Syne (headings), DM Sans (body), JetBrains Mono (code)

**ThemeProvider Wrapper:**
- Purpose: Wraps `next-themes` provider with typed props
- Examples: `src/components/layout/ThemeProvider.tsx`
- Pattern: Thin adapter component exposing `next-themes` as a client component boundary

**Navigation Component:**
- Purpose: Responsive top navigation with theme toggle, desktop links, and mobile drawer
- Examples: `src/components/layout/Navbar.tsx`
- Pattern: Client component with scroll detection, mobile menu state, active route tracking

**Design Token System:**
- Purpose: Unified color/type/spacing system across light and dark modes
- Examples: `src/app/globals.css`
- Pattern: CSS custom properties defined in `:root` and `.dark`, referenced via Tailwind `@theme` directive

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page request (server-rendered)
- Responsibilities: Sets up HTML structure, loads fonts, initializes theme, renders navbar/footer shell

**Home Page:**
- Location: `src/app/page.tsx`
- Triggers: Requests to `/`
- Responsibilities: Currently renders the default Next.js starter template (placeholder)

**Config Entry:**
- Location: `next.config.ts`
- Triggers: Build/dev server startup
- Responsibilities: Next.js configuration (currently minimal, no custom config)

## Error Handling

**Strategy:** Default Next.js error handling (no custom error boundaries yet)

**Patterns:**
- No custom `error.tsx` or `not-found.tsx` pages created yet
- No `loading.tsx` suspense boundaries defined yet
- Hydration mismatch prevented in `layout.tsx` via `suppressHydrationWarning` on `<html>` (required by `next-themes`)

## Cross-Cutting Concerns

**Logging:** No logging framework; browser default console only

**Validation:** No form validation or input validation present (marketing site, no forms yet)

**Authentication:** None (public marketing website)

**Responsive Design:** TailwindCSS responsive breakpoints used in `Navbar.tsx` (e.g., `hidden md:flex`, `md:hidden` for mobile/desktop toggle)

**Accessibility:** Basic semantic HTML used; no ARIA enhancements or accessibility audit performed yet

**Performance:** Fonts loaded via `next/font/google` with CSS variable strategy; `priority` attribute on hero image

## Design Reference

**Reference HTML:** `woobooster-v2.html` (1247 lines) sits at project root
- This is the original static HTML/CSS design reference for the site
- Contains the full design with custom cursor, animations, all sections
- CSS design tokens in this file were extracted into `globals.css`
- Serves as the source of truth for the visual design being ported to Next.js

## Planned Routes

Based on `navLinks` array defined in `src/components/layout/Navbar.tsx`:
- `/` - Home
- `/features` - Features page (not yet created)
- `/pricing` - Pricing page (not yet created)
- `/changelog` - Changelog page (not yet created)
- `/support` - Support page (not yet created)

## Missing Components (Referenced but Not Created)

- `src/components/layout/Footer.tsx` - Imported in `layout.tsx` but file does not exist yet (will cause build error)
- `src/lib/utils.ts` - Imported in `Navbar.tsx` as `@/lib/utils` for `cn()` function but file does not exist yet (will cause build error)

---

*Architecture analysis: 2026-05-11*
