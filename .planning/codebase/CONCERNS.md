# Codebase Concerns

**Analysis Date:** 2026-05-11

## Tech Debt

**Missing `Footer` component - build-breaking import:**
- Issue: `src/app/layout.tsx` line 6 imports `Footer` from `@/components/layout/Footer`, but no `Footer.tsx` file exists anywhere in the project. This will cause a compilation error.
- Files: `src/app/layout.tsx` (line 6), `src/components/layout/` (missing `Footer.tsx`)
- Impact: The application will not build or run. This is the highest-priority blocking issue.
- Fix approach: Create `src/components/layout/Footer.tsx` with a footer component matching the design tokens in `src/app/globals.css`. Reference `woobooster-v2.html` lines 985-1022 for the intended footer design.

**Missing `cn` utility - build-breaking import:**
- Issue: `src/components/layout/Navbar.tsx` line 9 imports `cn` from `@/lib/utils`, but the `src/lib/` directory exists and is empty. No `utils.ts` file is present.
- Files: `src/components/layout/Navbar.tsx` (line 9), `src/lib/utils.ts` (missing)
- Impact: The application will not build. Second highest-priority blocking issue.
- Fix approach: Create `src/lib/utils.ts` with the standard `clsx` + `tailwind-merge` utility:
  ```typescript
  import { clsx, type ClassValue } from "clsx";
  import { twMerge } from "tailwind-merge";
  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```
  Both `clsx` and `tailwind-merge` are already listed in `package.json` dependencies.

**Default `page.tsx` not replaced:**
- Issue: `src/app/page.tsx` still contains the default Create Next App boilerplate content ("To get started, edit the page.tsx file"). It uses generic Tailwind classes (`bg-zinc-50`, `text-black`, `dark:bg-black`) that are completely disconnected from the project's custom design tokens in `globals.css`.
- Files: `src/app/page.tsx`
- Impact: The homepage shows the default Next.js starter page instead of the WooBooster landing page.
- Fix approach: Rewrite `page.tsx` to implement the hero section and content from `woobooster-v2.html`, using the project's design tokens (`bg-background`, `text-foreground`, `text-accent`, `font-syne`, etc.).

**Standalone HTML prototype not integrated:**
- Issue: `woobooster-v2.html` (1247 lines) is a complete, self-contained landing page prototype sitting at the project root. It contains the full intended design including hero, features, pricing, changelog, support, and footer sections. None of its content has been ported to the Next.js application yet.
- Files: `woobooster-v2.html` (project root)
- Impact: This file is not served by Next.js and represents the design specification that needs to be implemented.
- Fix approach: Use `woobooster-v2.html` as the design reference. Port each section into proper Next.js components under `src/components/`, then compose them in `page.tsx` and any additional route pages.

**CSS button classes used but never defined:**
- Issue: `Navbar.tsx` uses class names `btn`, `btn-primary`, `btn-outline` (lines 90, 97, 140), but these are never defined in `globals.css` or any Tailwind config. They exist only in the standalone `woobooster-v2.html` as plain CSS (lines 74-82).
- Files: `src/components/layout/Navbar.tsx` (lines 90, 97, 140), `src/app/globals.css`
- Impact: The "View Plans", "Buy Now", and "Get WooBooster" buttons render with no styling, appearing as unstyled links.
- Fix approach: Add button utility classes to `globals.css` under `@layer utilities`, or use Tailwind utility classes directly in the JSX. Do NOT duplicate raw CSS from the HTML file.

## Known Bugs

**CSS typo - `height-[34px]` is not a valid Tailwind class:**
- Symptoms: The WooBooster logo square will not have a proper height applied; only width will be set.
- Files: `src/components/layout/Navbar.tsx` (line 47)
- Trigger: Renders at all times; the logo icon box will have inconsistent dimensions.
- Workaround: Change `height-[34px]` to `h-[34px]` to use the correct Tailwind property prefix.

**Navbar returns null before mount - layout shift:**
- Symptoms: When the page loads, the navbar does not render at all until `useEffect` fires and sets `mounted` to true. This causes a visible flash/layout shift where the navbar suddenly appears after the page has already rendered.
- Files: `src/components/layout/Navbar.tsx` (line 33)
- Trigger: Every page load, both client-side navigation and full page reload.
- Workaround: Return a placeholder/skeleton with the same dimensions instead of `null`, so the space is reserved during hydration.

**Five navigation links point to non-existent routes:**
- Symptoms: Clicking "Features", "Pricing", "Changelog", or "Support" navigates to a 404 page. Only "Home" (`/`) resolves.
- Files: `src/components/layout/Navbar.tsx` (lines 13-16)
- Trigger: Clicking any nav link except "Home"
- Workaround: None - these route pages need to be created at `src/app/features/page.tsx`, `src/app/pricing/page.tsx`, `src/app/changelog/page.tsx`, and `src/app/support/page.tsx`.

## Security Considerations

**No Content Security Policy configured:**
- Risk: The application has no CSP headers. `next.config.ts` is empty with no security headers configured.
- Files: `next.config.ts`
- Current mitigation: None
- Recommendations: Add security headers in `next.config.ts` via the `headers()` function, including `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`.

**External links missing comprehensive security attributes:**
- Risk: The default `page.tsx` has links with `target="_blank"` and `rel="noopener noreferrer"` which is correct, but this page is boilerplate and will be replaced.
- Files: `src/app/page.tsx` (will be replaced)
- Current mitigation: `rel="noopener noreferrer"` is used in current boilerplate
- Recommendations: When porting links from `woobooster-v2.html`, ensure all external links use `target="_blank"` with `rel="noopener noreferrer"`. Use Next.js `<Link>` for internal navigation.

## Performance Bottlenecks

**Scroll event listener without throttle/debounce:**
- Problem: The scroll handler in `Navbar.tsx` line 28 fires on every scroll pixel without any throttling.
- Files: `src/components/layout/Navbar.tsx` (line 28)
- Cause: Raw `window.addEventListener("scroll", handleScroll)` without throttle
- Improvement path: Use a throttled version or `requestAnimationFrame` to limit handler frequency. Alternatively, use `IntersectionObserver` for scroll-based UI changes.

**Three Google Fonts loaded with many weight variants:**
- Problem: `layout.tsx` loads three font families (Syne, DM_Sans, JetBrains_Mono) with a combined 12 weight variants. Each weight is a separate download.
- Files: `src/app/layout.tsx` (lines 8-24)
- Cause: All weights requested upfront via `next/font/google`
- Improvement path: Audit which weights are actually used and remove unused ones. For example, check if all 5 Syne weights and all 5 DM_Sans weights are actually needed.

**Framer Motion animation on navbar mount:**
- Problem: The navbar animates in on every page load with `initial/animate` props from Framer Motion, adding ~36KB of client-side JS to the initial render path for a cosmetic effect.
- Files: `src/components/layout/Navbar.tsx` (lines 38-40)
- Cause: `motion.nav` with `initial={{ y: -24, opacity: 0 }}` animation
- Improvement path: Consider using CSS animations instead for the entrance, removing the need for the `motion` wrapper on a static navigation element. This also affects the `AnimatePresence` mobile menu (lines 113-146).

## Fragile Areas

**Navbar component - high complexity, multiple responsibilities:**
- Files: `src/components/layout/Navbar.tsx` (149 lines)
- Why fragile: Single component handles scroll detection, mobile menu toggle, theme switching, active route highlighting, responsive layout, AND animation. Any change to one concern risks breaking another.
- Safe modification: Extract concerns into separate hooks (`useScrollDetection`, `useMobileMenu`) and smaller components (`ThemeToggle`, `NavLinks`, `MobileMenu`).
- Test coverage: No tests exist for this component.

**ThemeProvider - thin wrapper with no added value:**
- Files: `src/components/layout/ThemeProvider.tsx` (11 lines)
- Why fragile: This is a pass-through wrapper around `next-themes`'s `ThemeProvider`. It adds no custom logic. If the `next-themes` API changes, this wrapper needs updating too.
- Safe modification: Either add custom logic (default theme detection, persistence) or remove the wrapper and import from `next-themes` directly in `layout.tsx`.

**CSS design token system - partially connected to Tailwind:**
- Files: `src/app/globals.css`
- Why fragile: Some CSS custom properties are connected to Tailwind via `@theme` (e.g., `--color-accent` maps to `var(--accent)`), but others are not. Classes like `text-text2`, `bg-accent-light`, `border-border` rely on the `@theme` registration working correctly. Meanwhile, the HTML prototype uses raw `var()` references everywhere.
- Safe modification: When adding new CSS properties, always register them in the `@theme` block to make them available as Tailwind utilities. Test both light and dark modes.

## Scaling Limits

**Single-page architecture with no route structure:**
- Current capacity: One route (`/`)
- Limit: The Navbar defines 5 routes but only `/` has a corresponding page. As content grows, all pages will need to be created.
- Scaling path: Create route directories under `src/app/` for each nav link. Consider shared layouts for common page structures.

**No data fetching layer:**
- Current capacity: All content is hardcoded in components
- Limit: No infrastructure for dynamic content (blog posts, changelog entries, pricing data)
- Scaling path: If dynamic content is needed, add a data layer (CMS integration, API routes, or static generation with data files).

## Dependencies at Risk

**`next-themes` version pinning:**
- Risk: Version `^0.4.6` is used. The `next-themes` package is on a 0.x major version, meaning breaking changes can appear in minor version bumps.
- Impact: Theme switching could break silently after a `pnpm install`
- Migration plan: Pin the exact version in `package.json` (remove the caret), or plan to migrate to a Next.js-native theme solution if one becomes available.

**`framer-motion` bundle size:**
- Risk: `framer-motion` at `^12.38.0` is a large animation library (~36KB gzipped). It is currently used only for navbar entrance animation and mobile menu transitions.
- Impact: Increases initial JavaScript bundle for all pages
- Migration plan: Replace with CSS animations or smaller alternatives like `motion` (the standalone package from the same team) for simple entrance animations.

## Missing Critical Features

**No favicon or brand assets:**
- Problem: Only the default Next.js favicon exists at `src/app/favicon.ico`. No WooBooster branding is present.
- Blocks: Brand identity on browser tabs and bookmarks

**No SEO configuration beyond metadata:**
- Problem: Only basic `title` and `description` metadata are set in `layout.tsx`. No Open Graph tags, no structured data, no sitemap, no robots.txt configuration.
- Blocks: Social media sharing previews, search engine optimization

**No 404 page:**
- Problem: No custom `not-found.tsx` exists. Navigating to undefined routes shows the default Next.js 404.
- Blocks: Branded error experience

**No `proxy.ts` or middleware:**
- Problem: Per AGENTS.md rules, a `proxy.ts` should be used for route protection and redirects. None exists yet.
- Blocks: Any authentication or route-level logic

## Test Coverage Gaps

**Zero test coverage across entire project:**
- What's not tested: All components (`Navbar`, `ThemeProvider`, `Home`), all CSS/token configuration, all build configuration
- Files: No test files exist anywhere in the project. No test framework is configured in `package.json`.
- Risk: Any change to components, layout, or styling could introduce regressions with no automated safety net
- Priority: High - At minimum, add unit tests for the `Navbar` component (the most complex component) and the `cn` utility once it is created

---

*Concerns audit: 2026-05-11*
