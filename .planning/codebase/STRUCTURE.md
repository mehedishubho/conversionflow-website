# Codebase Structure

**Analysis Date:** 2026-05-11

## Directory Layout

```
woobooster-website/
├── .git/                        # Git repository data
├── .next/                       # Next.js build output (gitignored)
├── .planning/                   # GSD planning documents
│   └── codebase/                # Codebase analysis docs (this file)
├── node_modules/                # Dependencies (gitignored)
├── public/                      # Static assets served at root
│   ├── file.svg                 # Default Next.js placeholder SVG
│   ├── globe.svg                # Default Next.js placeholder SVG
│   ├── next.svg                 # Next.js logo
│   ├── vercel.svg               # Vercel logo
│   └── window.svg               # Default Next.js placeholder SVG
├── src/                         # Application source code
│   ├── app/                     # Next.js App Router pages & layouts
│   │   ├── favicon.ico          # Site favicon
│   │   ├── globals.css          # Global styles, design tokens, Tailwind config
│   │   ├── layout.tsx           # Root layout (fonts, theme, navbar, footer)
│   │   └── page.tsx             # Home page (/)
│   ├── components/              # Reusable UI components
│   │   └── layout/              # Layout-specific components
│   │       ├── Navbar.tsx       # Top navigation bar (client component)
│   │       └── ThemeProvider.tsx # Theme context provider (client component)
│   └── lib/                     # Shared utilities (empty - needs creation)
├── .gitignore                   # Git ignore rules
├── AGENTS.md                    # Dev environment rules and conventions
├── CLAUDE.md                    # Claude Code instructions (references AGENTS.md)
├── eslint.config.mjs            # ESLint flat config (Next.js core-web-vitals + TypeScript)
├── next-env.d.ts                # Next.js TypeScript declarations (gitignored)
├── next.config.ts               # Next.js configuration (minimal)
├── package.json                 # Dependencies and scripts
├── pnpm-lock.yaml               # pnpm lockfile
├── pnpm-workspace.yaml          # pnpm workspace config
├── postcss.config.mjs           # PostCSS config (TailwindCSS v4 plugin)
├── README.md                    # Project readme (default Create Next App)
├── tsconfig.json                # TypeScript configuration
└── woobooster-v2.html           # Static HTML design reference (1247 lines)
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router pages, layouts, and global styles
- Contains: Page files, layout files, CSS, favicon
- Key files: `layout.tsx` (root layout), `page.tsx` (home page), `globals.css` (design tokens)

**`src/components/layout/`:**
- Purpose: Structural layout components that appear on every page
- Contains: Client components for navigation and theme
- Key files: `Navbar.tsx`, `ThemeProvider.tsx`
- Convention: One component per file, named export matching the filename

**`src/lib/`:**
- Purpose: Shared utility functions and helpers
- Contains: Nothing yet (must be created)
- Expected: `utils.ts` with `cn()` function for className merging using `clsx` + `tailwind-merge`

**`public/`:**
- Purpose: Static files served at the web root
- Contains: SVG assets (currently default Next.js placeholders)
- Note: Will need WooBooster branding assets (logo, favicon, OG images)

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents
- Contains: ARCHITECTURE.md, STRUCTURE.md, and other analysis docs
- Generated: Yes (by GSD mapping commands)
- Committed: Yes

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout - wraps all pages with fonts, theme, navbar, footer
- `src/app/page.tsx`: Home page route (`/`)

**Configuration:**
- `next.config.ts`: Next.js configuration (currently empty/default)
- `tsconfig.json`: TypeScript config with `@/*` path alias to `./src/*`
- `eslint.config.mjs`: ESLint flat config using Next.js core-web-vitals and TypeScript presets
- `postcss.config.mjs`: PostCSS with `@tailwindcss/postcss` plugin
- `package.json`: Dependencies, scripts (`dev`, `build`, `start`, `lint`)

**Core Logic:**
- `src/app/globals.css`: Design token system (CSS custom properties for light/dark themes), Tailwind `@theme` directive, custom utility classes (`.glass`, `.hero-mesh`)

**Design Reference:**
- `woobooster-v2.html`: Full static HTML design at project root (1247 lines), source of truth for visual design being implemented

**Testing:**
- No test files or test configuration exists yet

## Naming Conventions

**Files:**
- Components: PascalCase, one component per file. Example: `Navbar.tsx`, `ThemeProvider.tsx`
- Pages: Lowercase `page.tsx` (Next.js App Router convention)
- Layouts: Lowercase `layout.tsx` (Next.js App Router convention)
- Styles: Lowercase `globals.css` (Next.js convention)
- Config: lowercase with `.config.` segment. Example: `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`
- Utilities: camelCase `utils.ts` (planned)

**Directories:**
- App routes: lowercase, kebab-case for multi-word routes. Example: `src/app/` (nested routes would be `src/app/features/`, `src/app/pricing/`)
- Component groups: lowercase, semantically named. Example: `layout/` for layout components
- Top-level `src/`: lowercase, single word. Example: `app/`, `components/`, `lib/`

**Exports:**
- Named exports for components: `export function Navbar()`, `export function ThemeProvider()`
- Default export for pages: `export default function Home()`
- Default export for layouts: `export default function RootLayout()`

**CSS:**
- CSS custom properties: kebab-case with descriptive prefixes. Example: `--accent-light`, `--accent-glow`, `--green-lt`
- Tailwind theme tokens: kebab-case registered via `@theme` directive. Example: `--color-accent`, `--font-syne`
- Utility classes: dot-prefix lowercase. Example: `.glass`, `.hero-mesh`

## Where to Add New Code

**New Page:**
- Create directory: `src/app/{route-name}/`
- Create file: `src/app/{route-name}/page.tsx`
- Use server component by default (no `"use client"` unless needed)
- Example for `/features`: `src/app/features/page.tsx`

**New Layout Component:**
- Create file: `src/components/layout/{ComponentName}.tsx`
- Use named export: `export function ComponentName()`
- Add `"use client"` directive if the component uses hooks, event handlers, or browser APIs
- Import in `src/app/layout.tsx` if it should appear on every page

**New UI Component (non-layout):**
- Create directory: `src/components/{domain}/` (e.g., `src/components/features/`, `src/components/pricing/`)
- Create file: `src/components/{domain}/{ComponentName}.tsx`
- Use named export

**Shared Utilities:**
- Create file: `src/lib/{utilityName}.ts`
- The `cn()` function should be created at `src/lib/utils.ts` using this pattern:
  ```typescript
  import { type ClassValue, clsx } from "clsx";
  import { twMerge } from "tailwind-merge";

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```

**New Route-Specific Layout:**
- Create file: `src/app/{route-name}/layout.tsx`
- Wraps all pages under that route segment

**Error/Loading Pages:**
- Error boundary: `src/app/{route}/error.tsx` (must be a Client Component)
- Loading state: `src/app/{route}/loading.tsx`
- Not found: `src/app/{route}/not-found.tsx`
- Global not found: `src/app/not-found.tsx`

**Static Assets:**
- Place files in: `public/`
- Reference in code: `/filename.ext` (absolute path from web root)
- Organize into subdirectories if assets grow: `public/images/`, `public/icons/`

## Special Directories

**`.next/`:**
- Purpose: Next.js build output, cache, and development artifacts
- Generated: Yes (by `pnpm dev` or `pnpm build`)
- Committed: No (gitignored)

**`node_modules/`:**
- Purpose: npm package dependencies
- Generated: Yes (by `pnpm install`)
- Committed: No (gitignored)

**`.planning/`:**
- Purpose: GSD workflow planning documents
- Generated: Yes (by GSD commands)
- Committed: Yes

**`src/components/layout/`:**
- Purpose: Components that form the persistent page shell (navbar, footer, theme provider, sidebar)
- Pattern: Each layout component is a single file with a named export
- Currently contains: `Navbar.tsx`, `ThemeProvider.tsx`
- Must be created: `Footer.tsx` (imported by `layout.tsx` but missing)

## Component Organization Pattern

The project follows a flat component structure grouped by domain:

```
src/components/
├── layout/              # Shell components (navbar, footer, theme)
│   ├── Navbar.tsx
│   ├── ThemeProvider.tsx
│   └── Footer.tsx       # (needs creation)
├── features/            # Feature section components (needs creation)
├── pricing/             # Pricing section components (needs creation)
├── ui/                  # Generic reusable UI primitives (needs creation)
└── sections/            # Homepage section blocks (needs creation)
```

Choose the grouping that matches the existing `layout/` pattern. For a marketing site, organizing by page section (e.g., `sections/`) or by feature domain (e.g., `features/`, `pricing/`) are both reasonable approaches. Match whichever is used first once more components are built.

---

*Structure analysis: 2026-05-11*
