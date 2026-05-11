# Coding Conventions

**Analysis Date:** 2026-05-11

## Project-Level Rules

The file `AGENTS.md` (referenced by `CLAUDE.md`) defines mandatory project rules:
- Use **pnpm** exclusively (never npm, yarn, or bun)
- Use **Next.js 16** with App Router, TypeScript, TailwindCSS, ESLint
- Prefer `proxy.ts` over `middleware.ts` for auth, redirects, rewrites
- Use **server components by default**, client components only when needed
- Use **async server actions** when possible
- Follow **strict TypeScript**

## Naming Patterns

**Files:**
- Components: PascalCase `.tsx` -- e.g., `ThemeProvider.tsx`, `Navbar.tsx`
- Pages: lowercase `page.tsx` inside route directories (App Router convention)
- Config files: lowercase with `.config.mjs` or `.config.ts` -- e.g., `postcss.config.mjs`, `next.config.ts`, `eslint.config.mjs`
- Global styles: `globals.css`

**Functions/Components:**
- React components: named function exports with PascalCase
  ```tsx
  // src/components/layout/Navbar.tsx
  export function Navbar() { ... }

  // src/app/layout.tsx
  export default function RootLayout({ children }: ...) { ... }
  ```
- Helper/utility functions: camelCase (none present yet, but `cn()` from `@/lib/utils` is expected)

**Variables:**
- Constants: camelCase at module scope
  ```tsx
  // src/components/layout/Navbar.tsx
  const navLinks = [ ... ];
  const syne = Syne({ ... });
  ```
- State variables: `const [isSomething, setIsSomething] = useState(initial)`
  ```tsx
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  ```

**Types:**
- Inline types for props (no separate interface files yet)
  ```tsx
  // src/app/layout.tsx
  Readonly<{ children: React.ReactNode }>
  ```
- Derived types via `React.ComponentProps<typeof Provider>`
  ```tsx
  // src/components/layout/layout/ThemeProvider.tsx
  React.ComponentProps<typeof NextThemesProvider>
  ```
- Import types with `import type` syntax
  ```tsx
  import type { Metadata } from "next";
  ```

## Code Style

**Formatting:**
- No Prettier config detected -- relies on ESLint for style enforcement
- Indentation: 2 spaces
- Semicolons: used consistently in `src/app/` files, omitted in `src/components/layout/ThemeProvider.tsx` (mixed style -- inconsistency present)
- Quotes: double quotes for strings
- Trailing commas: not used consistently

**Linting:**
- ESLint 9 with flat config (`eslint.config.mjs`)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Config:
  ```js
  // eslint.config.mjs
  import { defineConfig, globalIgnores } from "eslint/config";
  import nextVitals from "eslint-config-next/core-web-vitals";
  import nextTs from "eslint-config-next/typescript";

  const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  ]);

  export default eslintConfig;
  ```
- Run with: `pnpm lint`

**TypeScript:**
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- Target: ES2017
- Module resolution: bundler
- JSX: react-jsx
- Incremental compilation enabled
- `skipLibCheck: true`

## Import Organization

**Order observed across source files:**
1. React / framework types (`import type { Metadata } from "next"`)
2. React / framework values (`import { useState, useEffect } from "react"`)
3. Third-party packages (`import { motion, AnimatePresence } from "framer-motion"`)
4. Internal aliases (`import { cn } from "@/lib/utils"`, `import { ThemeProvider } from "@/components/layout/ThemeProvider"`)
5. CSS imports (`import "./globals.css"` -- only in layout)

**Path Aliases:**
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)
- Always use `@/` imports for internal modules, never relative paths across directories

**Import Style:**
- Named imports for specific values: `import { useState, useEffect } from "react"`
- Default imports for components: `import Link from "next/link"`, `import Image from "next/image"`
- Namespace imports for broad APIs: `import * as React from "react"` (in `ThemeProvider.tsx`)

## Component Patterns

**Server Components (default):**
- `src/app/page.tsx` -- no `"use client"` directive, uses `export default function`
- `src/app/layout.tsx` -- no `"use client"` directive, exports metadata and default function

**Client Components (opt-in):**
- Mark with `"use client"` at the very first line of the file
  ```tsx
  // src/components/layout/Navbar.tsx
  "use client";
  ```
- Use when the component needs: `useState`, `useEffect`, `usePathname`, `useTheme`, event handlers, browser APIs

**Component Export Style:**
- Layout components: named exports
  ```tsx
  export function Navbar() { ... }
  export function ThemeProvider({ ... }) { ... }
  ```
- Page components: default exports
  ```tsx
  export default function Home() { ... }
  export default function RootLayout({ ... }) { ... }
  ```

**Component Organization:**
- Layout shell components (Navbar, ThemeProvider) live in `src/components/layout/`
- Data constants (`navLinks`) defined at module scope above the component
- Client-side hydration guard pattern:
  ```tsx
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  ```

## Styling Conventions

**TailwindCSS 4** with `@tailwindcss/postcss` plugin:
- CSS-first configuration in `src/app/globals.css` using `@theme { }` block
- Custom design tokens defined as CSS custom properties under `:root` and `.dark`
- Token categories: background, surface, border, text, accent, green, red, orange, shadow, nav-bg, hero-g
- Custom fonts registered via `@theme`: `--font-syne`, `--font-dm-sans`, `--font-mono`

**Utility Functions for Classes:**
- Use `cn()` (expected from `@/lib/utils`, likely `clsx` + `tailwind-merge` based on installed deps) for conditional class merging:
  ```tsx
  className={cn(
    "base-classes-here",
    condition && "conditional-class"
  )}
  ```
- Both `clsx` and `tailwind-merge` are installed dependencies

**Class Naming (CSS):**
- Custom utility classes defined in `@layer utilities`: `.glass`, `.hero-mesh`
- CSS variables used directly in Tailwind: `bg-[--nav-bg]`, `border-[--border2]`
- Tailwind semantic color tokens: `bg-background`, `text-foreground`, `text-accent`, `bg-accent-light`

**Button/CTA pattern:**
- Uses custom CSS classes `btn`, `btn-primary`, `btn-outline` (referenced in Navbar but not yet defined in globals.css -- these need to be added)

## Error Handling

No error handling patterns established yet (early-stage project). No `try/catch` blocks, no error boundaries, no error.tsx files.

**Guidance for new code:**
- Add `error.tsx` at the app route level for Next.js error boundaries
- Use `try/catch` in server actions with appropriate error responses
- Validate inputs at the component level before use

## Logging

No logging framework detected. Console methods would be used directly.

## Comments

- JSX comments used sparingly for section delineation:
  ```tsx
  {/* Desktop Links */}
  {/* Mobile Menu Toggle */}
  {/* Mobile Menu */}
  ```
- No JSDoc/TSDoc comments present
- No inline code comments

## Function Design

**Size:** Functions range from 3 lines (`ThemeProvider`) to ~130 lines (`Navbar`). The Navbar component is monolithic and will benefit from extraction of sub-components as the codebase grows.

**Parameters:** Destructured props objects:
```tsx
export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>)
```

**Return Values:** JSX directly returned, no intermediate variables for simple returns.

## Module Design

**Exports:**
- Named exports for reusable components: `export function Navbar()`
- Default exports for page/route components: `export default function Home()`
- No barrel files (index.ts) currently

**Barrel Files:** Not used. Import directly from component files:
```tsx
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
```

## Fonts

Loaded via `next/font/google` in `src/app/layout.tsx`:
- **Syne** -- display/heading font (weights: 400-900)
- **DM Sans** -- body font (weights: 300-700)
- **JetBrains Mono** -- code font (weights: 400, 600)

Registered as CSS variables (`--font-syne`, `--font-dm-sans`, `--font-jetbrains-mono`) and applied to `<html>` element classes.

## Animation

- Use **framer-motion** for animations (installed: `framer-motion ^12.38.0`)
- Pattern: `motion.div` with `initial`, `animate`, `exit`, `transition` props
- Use `AnimatePresence` for mount/unmount animations
- Use `layoutId` for shared layout animations (e.g., active nav indicator)

---

*Convention analysis: 2026-05-11*
