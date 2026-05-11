# Dev Environment Rules (Must Follow)

You are working in my development environment.

Always follow these rules for every project, command, dependency installation, and generated code.

## Package Manager

ALWAYS use pnpm.

Never use:

- npm
- yarn
- bun

Examples:

✅ pnpm install
✅ pnpm add package-name
✅ pnpm add -D package-name
✅ pnpm dev
✅ pnpm build
✅ pnpm lint

Never generate:

❌ npm install
❌ npm run dev
❌ yarn install

## Next.js Rules

Always use latest Next.js 16 with:

- App Router
- TypeScript
- TailwindCSS
- ESLint

When creating a new project always use:

pnpm create next-app@latest project-name

Use these options:

- TypeScript = yes
- ESLint = yes
- Tailwind = yes
- App Router = yes
- src directory = yes

## Package Installation

Before installing packages:

1. Check existing dependencies
2. Use pnpm only
3. Keep lockfile as pnpm-lock.yaml

## Proxy Rules (Next.js 16 Recommended)

Always prefer Next.js proxy over legacy middleware.

Never create:

middleware.ts

Always create:

proxy.ts

Use proxy for:

- authentication
- route protection
- redirects
- rewrites
- locale detection
- header manipulation

Use matcher configuration.

Example structure:

src/
 ├── app/
 ├── proxy.ts

## Code Quality

Always:

- follow strict TypeScript
- use server components by default
- use client components only when needed
- use async server actions when possible
- optimize imports

## Commands

For running project:

pnpm dev

For production:

pnpm build
pnpm start

For adding packages:

pnpm add <package>

For removing packages:

pnpm remove <package>

These rules are mandatory.
Never break them unless I explicitly override.

<!-- GSD:project-start source:PROJECT.md -->
## Project

**WooBooster Website**

WooBooster is a marketing/landing page website for a WooCommerce plugin product. The site is built with Next.js 16 (App Router), TypeScript, and TailwindCSS v4, porting a complete static HTML design reference (`woobooster-v2.html`, 1247 lines) into a production-ready React application. The site targets WooCommerce store owners and presents WooBooster's features, pricing, changelog, and support information.

**Core Value:** A polished, high-performance marketing website that converts WooCommerce store owners into WooBooster customers through clear presentation of features, pricing, and trust signals.

### Constraints

- **Package Manager**: pnpm only (never npm, yarn, bun)
- **Framework**: Next.js 16 with App Router, TypeScript, TailwindCSS, ESLint
- **Proxy**: Use `proxy.ts` instead of `middleware.ts` per project rules
- **Components**: Server components by default; client components only when needed
- **Styling**: TailwindCSS v4 CSS-first config with custom design tokens; no Tailwind config file
- **Design Fidelity**: Must match `woobooster-v2.html` visual design
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.x - All source files in `src/` use `.tsx` extension; strict mode enabled in `tsconfig.json`
- CSS (Tailwind v4) - Custom theming via `src/app/globals.css` with CSS custom properties
- HTML - Reference design mockup at `woobooster-v2.html` (1247 lines, design prototype for the Next.js build)
## Runtime
- Node.js (version managed by developer; `.nvmrc` or `.python-version` not present)
- React 19.2.4 with React DOM 19.2.4
- pnpm (lockfile: `pnpm-lock.yaml` present)
- Workspace config: `pnpm-workspace.yaml` (ignores `sharp` and `unrs-resolver` builds)
## Frameworks
- Next.js 16.2.6 - App Router, server components by default, `src/` directory structure
- React 19.2.4 - UI rendering
- Tailwind CSS 4.x (via `@tailwindcss/postcss` plugin)
- PostCSS (`postcss.config.mjs`) with `@tailwindcss/postcss` plugin only
- `next-themes` 0.4.6 - Light/dark theme switching via class strategy
- Google Fonts loaded via `next/font/google`: Syne (headings), DM Sans (body), JetBrains Mono (monospace)
- Framer Motion 12.38.0 - Page transitions, navbar animations, animated UI elements
- Lucide React 1.14.0 - Icon library (Sun, Moon, Menu, X, ArrowRight used in `src/components/layout/Navbar.tsx`)
- None detected - No test framework installed, no test files present
- ESLint 9.x with `eslint-config-next` 16.2.6 - Core Web Vitals + TypeScript configs
- TypeScript 5.x - strict mode, bundler module resolution, incremental compilation
## Key Dependencies
- `clsx` 2.1.1 - Conditional class name merging
- `tailwind-merge` 3.6.0 - Intelligent Tailwind class deduplication (used via `cn()` utility at `src/lib/utils`)
- `framer-motion` 12.38.0 - Animation library for React components
- `lucide-react` 1.14.0 - SVG icon components
- `next-themes` 0.4.6 - Theme provider wrapping the app with `attribute="class"`, `defaultTheme="light"`, `enableSystem={false}`
## Configuration
- Target: ES2017
- Module: esnext with bundler resolution
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- JSX: react-jsx
- Incremental compilation enabled
- Empty config (no custom rewrites, redirects, or environment variable exposure)
- Uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Single plugin: `@tailwindcss/postcss` (Tailwind CSS v4 approach)
- Uses `@import "tailwindcss"` (v4 syntax, no `tailwind.config.js` file)
- Theme customization via `@theme { }` block defining CSS custom properties as design tokens
- Custom utility classes in `@layer utilities { }`: `.glass`, `.hero-mesh`
- CSS custom properties for light/dark themes in `:root` and `.dark` selectors
- Color palette: accent (blue), green, red, orange with light variants
- Custom border-radius tokens: `--radius-xl: 18px`, `--radius-2xl: 22px`
- Custom keyframe animation: `meshFloat`
- No `.env` files detected (no environment variables required at this stage)
- No `NEXT_PUBLIC_*` variables in use
## Platform Requirements
- Node.js (compatible with Next.js 16 requirements)
- pnpm package manager
- Run: `pnpm dev` (starts dev server on localhost:3000)
- `pnpm build` followed by `pnpm start`
- Deployment target: Vercel (default Next.js deployment, referenced in `README.md` and `public/vercel.svg`)
- Static assets served from `public/` directory (SVG icons: file.svg, globe.svg, next.svg, vercel.svg, window.svg)
## Design System
- `--font-syne`: Syne (weights 400, 600, 700, 800, 900) - Display/headings
- `--font-dm-sans`: DM Sans (weights 300, 400, 500, 600, 700) - Body text (default)
- `--font-jetbrains-mono`: JetBrains Mono (weights 400, 600) - Monospace
- Light mode accent: `#0047FF`
- Dark mode accent: `#4D8AFF`
- Full light/dark theme with: background, surface, border, text, accent, green, red, orange variants
- Shadow tokens: `--shadow`, `--shadow-lg`
- Glassmorphism: `--nav-bg` with `backdrop-blur-[20px]`
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Project-Level Rules
- Use **pnpm** exclusively (never npm, yarn, or bun)
- Use **Next.js 16** with App Router, TypeScript, TailwindCSS, ESLint
- Prefer `proxy.ts` over `middleware.ts` for auth, redirects, rewrites
- Use **server components by default**, client components only when needed
- Use **async server actions** when possible
- Follow **strict TypeScript**
## Naming Patterns
- Components: PascalCase `.tsx` -- e.g., `ThemeProvider.tsx`, `Navbar.tsx`
- Pages: lowercase `page.tsx` inside route directories (App Router convention)
- Config files: lowercase with `.config.mjs` or `.config.ts` -- e.g., `postcss.config.mjs`, `next.config.ts`, `eslint.config.mjs`
- Global styles: `globals.css`
- React components: named function exports with PascalCase
- Helper/utility functions: camelCase (none present yet, but `cn()` from `@/lib/utils` is expected)
- Constants: camelCase at module scope
- State variables: `const [isSomething, setIsSomething] = useState(initial)`
- Inline types for props (no separate interface files yet)
- Derived types via `React.ComponentProps<typeof Provider>`
- Import types with `import type` syntax
## Code Style
- No Prettier config detected -- relies on ESLint for style enforcement
- Indentation: 2 spaces
- Semicolons: used consistently in `src/app/` files, omitted in `src/components/layout/ThemeProvider.tsx` (mixed style -- inconsistency present)
- Quotes: double quotes for strings
- Trailing commas: not used consistently
- ESLint 9 with flat config (`eslint.config.mjs`)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Config:
- Run with: `pnpm lint`
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- Target: ES2017
- Module resolution: bundler
- JSX: react-jsx
- Incremental compilation enabled
- `skipLibCheck: true`
## Import Organization
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Always use `@/` imports for internal modules, never relative paths across directories
- Named imports for specific values: `import { useState, useEffect } from "react"`
- Default imports for components: `import Link from "next/link"`, `import Image from "next/image"`
- Namespace imports for broad APIs: `import * as React from "react"` (in `ThemeProvider.tsx`)
## Component Patterns
- `src/app/page.tsx` -- no `"use client"` directive, uses `export default function`
- `src/app/layout.tsx` -- no `"use client"` directive, exports metadata and default function
- Mark with `"use client"` at the very first line of the file
- Use when the component needs: `useState`, `useEffect`, `usePathname`, `useTheme`, event handlers, browser APIs
- Layout components: named exports
- Page components: default exports
- Layout shell components (Navbar, ThemeProvider) live in `src/components/layout/`
- Data constants (`navLinks`) defined at module scope above the component
- Client-side hydration guard pattern:
## Styling Conventions
- CSS-first configuration in `src/app/globals.css` using `@theme { }` block
- Custom design tokens defined as CSS custom properties under `:root` and `.dark`
- Token categories: background, surface, border, text, accent, green, red, orange, shadow, nav-bg, hero-g
- Custom fonts registered via `@theme`: `--font-syne`, `--font-dm-sans`, `--font-mono`
- Use `cn()` (expected from `@/lib/utils`, likely `clsx` + `tailwind-merge` based on installed deps) for conditional class merging:
- Both `clsx` and `tailwind-merge` are installed dependencies
- Custom utility classes defined in `@layer utilities`: `.glass`, `.hero-mesh`
- CSS variables used directly in Tailwind: `bg-[--nav-bg]`, `border-[--border2]`
- Tailwind semantic color tokens: `bg-background`, `text-foreground`, `text-accent`, `bg-accent-light`
- Uses custom CSS classes `btn`, `btn-primary`, `btn-outline` (referenced in Navbar but not yet defined in globals.css -- these need to be added)
## Error Handling
- Add `error.tsx` at the app route level for Next.js error boundaries
- Use `try/catch` in server actions with appropriate error responses
- Validate inputs at the component level before use
## Logging
## Comments
- JSX comments used sparingly for section delineation:
- No JSDoc/TSDoc comments present
- No inline code comments
## Function Design
## Module Design
- Named exports for reusable components: `export function Navbar()`
- Default exports for page/route components: `export default function Home()`
- No barrel files (index.ts) currently
## Fonts
- **Syne** -- display/heading font (weights: 400-900)
- **DM Sans** -- body font (weights: 300-700)
- **JetBrains Mono** -- code font (weights: 400, 600)
## Animation
- Use **framer-motion** for animations (installed: `framer-motion ^12.38.0`)
- Pattern: `motion.div` with `initial`, `animate`, `exit`, `transition` props
- Use `AnimatePresence` for mount/unmount animations
- Use `layoutId` for shared layout animations (e.g., active nav indicator)
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Server Components by default; Client Components only where interactivity is required (marked with `"use client"`)
- File-based routing via the App Router convention (`src/app/`)
- TailwindCSS v4 with CSS-first configuration using custom design tokens (CSS variables)
- Dark/light theme support via `next-themes` with class-based strategy
- Framer Motion for animations and micro-interactions
- Lucide React for iconography
- Utility-first CSS with custom `.glass` and `.hero-mesh` utility classes
- Path alias `@/*` maps to `./src/*` for clean imports
## Layers
- Purpose: Render pages and wrap with shared layout chrome
- Location: `src/app/`
- Contains: `page.tsx`, `layout.tsx`, `globals.css`, `favicon.ico`
- Depends on: Layout components (`Navbar`, `Footer`, `ThemeProvider`), global styles
- Used by: Next.js router (file-based routing)
- Purpose: Reusable UI building blocks organized by domain
- Location: `src/components/`
- Contains: Layout components (`Navbar.tsx`, `ThemeProvider.tsx`)
- Depends on: `next-themes`, `framer-motion`, `lucide-react`, `@/lib/utils`
- Used by: Presentation layer (`layout.tsx`, pages)
- Purpose: Shared helper functions (e.g., `cn` for className merging)
- Location: `src/lib/`
- Contains: Intended `utils.ts` (not yet created)
- Depends on: `clsx`, `tailwind-merge` (declared in `package.json`)
- Used by: Components
## Data Flow
- No global state management library (no Redux, Zustand, etc.)
- Local state via `useState`/`useEffect` in Client Components
- Theme state managed by `next-themes` context
- Intended as a static marketing site with no server-side data fetching
## Key Abstractions
- Purpose: Provides the persistent chrome (navbar, footer, theme) around all pages
- Examples: `src/app/layout.tsx`
- Pattern: Next.js root layout wraps children with providers and structural components
- Loads 3 Google Fonts: Syne (headings), DM Sans (body), JetBrains Mono (code)
- Purpose: Wraps `next-themes` provider with typed props
- Examples: `src/components/layout/ThemeProvider.tsx`
- Pattern: Thin adapter component exposing `next-themes` as a client component boundary
- Purpose: Responsive top navigation with theme toggle, desktop links, and mobile drawer
- Examples: `src/components/layout/Navbar.tsx`
- Pattern: Client component with scroll detection, mobile menu state, active route tracking
- Purpose: Unified color/type/spacing system across light and dark modes
- Examples: `src/app/globals.css`
- Pattern: CSS custom properties defined in `:root` and `.dark`, referenced via Tailwind `@theme` directive
## Entry Points
- Location: `src/app/layout.tsx`
- Triggers: Every page request (server-rendered)
- Responsibilities: Sets up HTML structure, loads fonts, initializes theme, renders navbar/footer shell
- Location: `src/app/page.tsx`
- Triggers: Requests to `/`
- Responsibilities: Currently renders the default Next.js starter template (placeholder)
- Location: `next.config.ts`
- Triggers: Build/dev server startup
- Responsibilities: Next.js configuration (currently minimal, no custom config)
## Error Handling
- No custom `error.tsx` or `not-found.tsx` pages created yet
- No `loading.tsx` suspense boundaries defined yet
- Hydration mismatch prevented in `layout.tsx` via `suppressHydrationWarning` on `<html>` (required by `next-themes`)
## Cross-Cutting Concerns
## Design Reference
- This is the original static HTML/CSS design reference for the site
- Contains the full design with custom cursor, animations, all sections
- CSS design tokens in this file were extracted into `globals.css`
- Serves as the source of truth for the visual design being ported to Next.js
## Planned Routes
- `/` - Home
- `/features` - Features page (not yet created)
- `/pricing` - Pricing page (not yet created)
- `/changelog` - Changelog page (not yet created)
- `/support` - Support page (not yet created)
## Missing Components (Referenced but Not Created)
- `src/components/layout/Footer.tsx` - Imported in `layout.tsx` but file does not exist yet (will cause build error)
- `src/lib/utils.ts` - Imported in `Navbar.tsx` as `@/lib/utils` for `cn()` function but file does not exist yet (will cause build error)
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
