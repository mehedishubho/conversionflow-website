# Technology Stack

**Analysis Date:** 2026-05-11

## Languages

**Primary:**
- TypeScript 5.x - All source files in `src/` use `.tsx` extension; strict mode enabled in `tsconfig.json`

**Secondary:**
- CSS (Tailwind v4) - Custom theming via `src/app/globals.css` with CSS custom properties
- HTML - Reference design mockup at `woobooster-v2.html` (1247 lines, design prototype for the Next.js build)

## Runtime

**Environment:**
- Node.js (version managed by developer; `.nvmrc` or `.python-version` not present)
- React 19.2.4 with React DOM 19.2.4

**Package Manager:**
- pnpm (lockfile: `pnpm-lock.yaml` present)
- Workspace config: `pnpm-workspace.yaml` (ignores `sharp` and `unrs-resolver` builds)

## Frameworks

**Core:**
- Next.js 16.2.6 - App Router, server components by default, `src/` directory structure
- React 19.2.4 - UI rendering

**Styling:**
- Tailwind CSS 4.x (via `@tailwindcss/postcss` plugin)
- PostCSS (`postcss.config.mjs`) with `@tailwindcss/postcss` plugin only
- `next-themes` 0.4.6 - Light/dark theme switching via class strategy
- Google Fonts loaded via `next/font/google`: Syne (headings), DM Sans (body), JetBrains Mono (monospace)

**Animation:**
- Framer Motion 12.38.0 - Page transitions, navbar animations, animated UI elements

**Icons:**
- Lucide React 1.14.0 - Icon library (Sun, Moon, Menu, X, ArrowRight used in `src/components/layout/Navbar.tsx`)

**Testing:**
- None detected - No test framework installed, no test files present

**Build/Dev:**
- ESLint 9.x with `eslint-config-next` 16.2.6 - Core Web Vitals + TypeScript configs
- TypeScript 5.x - strict mode, bundler module resolution, incremental compilation

## Key Dependencies

**Critical:**
- `clsx` 2.1.1 - Conditional class name merging
- `tailwind-merge` 3.6.0 - Intelligent Tailwind class deduplication (used via `cn()` utility at `src/lib/utils`)
- `framer-motion` 12.38.0 - Animation library for React components
- `lucide-react` 1.14.0 - SVG icon components

**Infrastructure:**
- `next-themes` 0.4.6 - Theme provider wrapping the app with `attribute="class"`, `defaultTheme="light"`, `enableSystem={false}`

## Configuration

**TypeScript (`tsconfig.json`):**
- Target: ES2017
- Module: esnext with bundler resolution
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- JSX: react-jsx
- Incremental compilation enabled

**Next.js (`next.config.ts`):**
- Empty config (no custom rewrites, redirects, or environment variable exposure)

**ESLint (`eslint.config.mjs`):**
- Uses `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

**PostCSS (`postcss.config.mjs`):**
- Single plugin: `@tailwindcss/postcss` (Tailwind CSS v4 approach)

**Tailwind CSS v4 (`src/app/globals.css`):**
- Uses `@import "tailwindcss"` (v4 syntax, no `tailwind.config.js` file)
- Theme customization via `@theme { }` block defining CSS custom properties as design tokens
- Custom utility classes in `@layer utilities { }`: `.glass`, `.hero-mesh`
- CSS custom properties for light/dark themes in `:root` and `.dark` selectors
- Color palette: accent (blue), green, red, orange with light variants
- Custom border-radius tokens: `--radius-xl: 18px`, `--radius-2xl: 22px`
- Custom keyframe animation: `meshFloat`

**Environment:**
- No `.env` files detected (no environment variables required at this stage)
- No `NEXT_PUBLIC_*` variables in use

## Platform Requirements

**Development:**
- Node.js (compatible with Next.js 16 requirements)
- pnpm package manager
- Run: `pnpm dev` (starts dev server on localhost:3000)

**Production:**
- `pnpm build` followed by `pnpm start`
- Deployment target: Vercel (default Next.js deployment, referenced in `README.md` and `public/vercel.svg`)
- Static assets served from `public/` directory (SVG icons: file.svg, globe.svg, next.svg, vercel.svg, window.svg)

## Design System

**Fonts (loaded via `next/font/google` in `src/app/layout.tsx`):**
- `--font-syne`: Syne (weights 400, 600, 700, 800, 900) - Display/headings
- `--font-dm-sans`: DM Sans (weights 300, 400, 500, 600, 700) - Body text (default)
- `--font-jetbrains-mono`: JetBrains Mono (weights 400, 600) - Monospace

**Color Tokens (defined in `src/app/globals.css`):**
- Light mode accent: `#0047FF`
- Dark mode accent: `#4D8AFF`
- Full light/dark theme with: background, surface, border, text, accent, green, red, orange variants
- Shadow tokens: `--shadow`, `--shadow-lg`
- Glassmorphism: `--nav-bg` with `backdrop-blur-[20px]`

---

*Stack analysis: 2026-05-11*
