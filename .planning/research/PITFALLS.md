# Domain Pitfalls

**Domain:** Next.js 16 Marketing Website (HTML port, i18n, self-hosted)
**Researched:** 2026-05-11
**Confidence:** HIGH (evidence from codebase audit + domain expertise)

---

## Critical Pitfalls

Mistakes that cause rewrites, performance regressions, or production failures.

### Pitfall 1: Server/Client Component Boundary Misplacement

**What goes wrong:** Making section components `"use client"` unnecessarily pulls Framer Motion and all their children into the client bundle. The project already has this problem -- `HeroSection.tsx` is a `"use client"` component that wraps every element in `motion.div`, even static text that never animates independently. Similarly, `ScrollReveal.tsx` is a client component that forces every wrapped section into the client tree.

**Why it happens:** The HTML prototype uses vanilla JS for everything (scroll reveal, word animations, magnetic tilt). Developers port these into React by making every interactive piece a client component, rather than isolating the interactive boundary.

**Consequences:**
- Server-rendered content ships as client JS instead of HTML
- Larger hydration payload, slower Time to Interactive
- SEO degradation (search engines see less server-rendered content)
- Every `motion.div` adds Framer Motion overhead even when the animation is a one-time entrance

**Prevention:**
- Section components should be server components by default
- Wrap only the interactive shell in a client component. For scroll reveal, use a thin client wrapper that toggles a CSS class via IntersectionObserver, and let children be server-rendered
- For the hero, use CSS animations (`@keyframes wordUp` already exists in `globals.css`) with `animation-delay` instead of per-word `motion.span` wrappers
- The current `ScrollReveal` pattern is acceptable IF it only wraps a `div` that toggles opacity/y -- but verify it does not prevent children from being server components (it does not, since `children` is just a ReactNode passed through)

**Detection:** Run `pnpm build` and check the bundle analyzer. If `.next/server` chunks are tiny and `.next/static/chunks` are large, too much is client-rendered.

**Phase:** Homepage (Phase 2) -- establish the pattern early before all sections are built

### Pitfall 2: TailwindCSS v4 `@theme` Token Disconnect

**What goes wrong:** CSS custom properties defined in `:root`/`.dark` are not automatically available as Tailwind utilities unless they are registered in the `@theme { }` block. The project already has this partially correct (lines 3-33 of `globals.css` register color tokens), but the `@theme` block uses indirection: `--color-accent: var(--accent)` where `--accent` is defined in `:root`. This creates a two-layer indirection that can break in unexpected ways.

**Why it happens:** TailwindCSS v4 changed from `tailwind.config.js` to CSS-first configuration. Developers familiar with v3 try to use the old config approach or assume all CSS variables are automatically Tailwind utilities.

**Consequences:**
- Classes like `bg-accent` work, but `bg-accent-2` or `text-green-lt` silently fail if not in `@theme`
- Custom utilities in `@layer utilities` using `@apply` with token-referencing classes can fail at build time
- The `border-border` pattern is fragile -- Tailwind v4 requires `--color-border` in `@theme` to generate `border-border`

**Prevention:**
- Every CSS custom property that needs a Tailwind utility MUST have a corresponding `--color-*`, `--font-*`, or `--radius-*` entry in `@theme`
- The current `globals.css` does NOT register `--color-border` or `--color-border2` -- the `border-[--border]` pattern is used instead (raw CSS variable). This is inconsistent. Pick one approach and stick to it
- Do NOT mix `border-[--border]` (raw var) with `bg-accent` (Tailwind token). This causes confusion about which system to use
- When adding new tokens (for i18n badges, MDX styling, etc.), always add to both `:root`/`.dark` AND `@theme`

**Detection:** Audit `globals.css` for raw `var(--...)` usage in utilities vs `@theme`-registered tokens. If inconsistent, document the convention.

**Phase:** Foundation (Phase 1) -- establish the token registration convention before content pages

### Pitfall 3: Dark Theme Flash (FOIT/FOUC) on Self-Hosted

**What goes wrong:** `next-themes` works by injecting a script that reads `localStorage` and sets the `class` attribute before paint. On Vercel, this script is inlined. On self-hosted (standalone output), the script may not be inlined, causing a brief flash of the default (light) theme before the user's preferred theme applies. This is especially visible for users who prefer dark mode.

**Why it happens:** Self-hosted Next.js with `output: 'standalone'` does not always inline the `next-themes` script tag in the same way as Vercel's optimized builds. The script loads asynchronously and may miss the first paint.

**Consequences:**
- Users who prefer dark mode see a white flash for 50-200ms on every page load
- This looks unprofessional and can cause layout shift (different theme = different background/colors = different computed sizes)

**Prevention:**
- Add an inline `<script>` in `layout.tsx` BEFORE the `<ThemeProvider>` that reads `localStorage` and sets the class synchronously:

```tsx
<script dangerouslySetInnerHTML={{ __html: `
  (function() {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
`}} />
```

- The `suppressHydrationWarning` on `<html>` is already present (good)
- Test on the actual self-hosted deployment, not just `pnpm dev`

**Detection:** Deploy to self-hosted server, open in browser with dark theme preference, observe first paint. Use Chrome DevTools "Capture screenshot" on first paint to verify.

**Phase:** Polish (Phase 4) or earlier if deploying to staging before Phase 4

### Pitfall 4: Framer Motion Animation Performance Degradation at Scale

**What goes wrong:** The HTML prototype has multiple animation systems: scroll reveal (IntersectionObserver), word-by-word reveal (DOM splitting), magnetic tilt cards (mousemove), count-up counters (rAF), page transitions (opacity/transform), navbar entrance, mobile menu, and the custom cursor. Porting all of these to Framer Motion `motion.div`/`motion.span` creates dozens of animation instances that compete for the main thread.

**Why it happens:** Framer Motion is powerful but creates a React state update for every animation frame when using `animate` controls. The `whileInView` pattern (used in `HeroSection.tsx`) creates IntersectionObserver instances per element. The magnetic tilt card effect (mousemove with `perspective` + `rotateX/Y`) requires 60fps updates that should use CSS `will-change` and `transform`, not React state.

**Consequences:**
- Jank on mobile devices (especially lower-end Android phones common in Bangladesh)
- Main thread blocking during scroll
- Increased memory usage from animation instances
- Layout thrashing when multiple animations trigger simultaneously

**Prevention:**
- Use CSS animations for one-time entrance effects (the `@keyframes wordUp` already exists)
- Use `ScrollReveal` sparingly -- the current pattern (wrapping entire sections) is fine, but do NOT wrap individual cards within a section in separate `ScrollReveal` instances
- For magnetic tilt cards: use a single client component that attaches `mousemove` listeners to a parent container and updates child transforms via `style` property (not React state), or better yet, use CSS `transform` with custom properties
- For count-up animations: use a dedicated `useCountUp` hook with `requestAnimationFrame`, not `motion` number animation
- For the custom cursor: use `requestAnimationFrame` for position tracking, not `onMouseMove` React handler

**Detection:** Chrome DevTools Performance tab during scroll on a mid-range Android device (or Chrome throttling to 6x slowdown). If frame rate drops below 30fps, reduce animation instances.

**Phase:** Homepage (Phase 2) for patterns, Polish (Phase 4) for performance tuning

### Pitfall 5: MDX in Next.js App Router Requires Separate Configuration

**What goes wrong:** MDX does not work "out of the box" with Next.js App Router. The `@next/mdx` package needs to be installed and configured in `next.config.ts`. More critically, MDX pages in App Router must be placed in `src/app/` with `.mdx` extension and require a separate layout, OR they need to be loaded programmatically with `next-mdx-remote` or similar. Each approach has different tradeoffs.

**Why it happens:** Developers assume MDX is a drop-in replacement for `.tsx` pages. In App Router, file-based routing means `.mdx` files are treated as pages, but they lose access to React Server Component features unless properly configured.

**Consequences:**
- MDX blog posts cannot use custom React components (like the pricing card or FAQ accordion) without additional configuration
- Frontmatter parsing is not built into `@next/mdx`
- Dynamic route generation for blog posts (`/blog/[slug]`) requires a different pattern than `.tsx` pages
- MDX components need to be registered via `mdx-components.tsx` at the project root

**Prevention:**
- Use `@next/mdx` for the blog with these steps:
  1. Install `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`
  2. Add `mdxRs: true` to `next.config.ts` for Rust-based MDX compilation (faster builds)
  3. Create `mdx-components.tsx` at project root to register custom components
  4. Use `gray-matter` for frontmatter parsing
  5. Place blog posts as `.mdx` files in a `content/blog/` directory (NOT in `src/app/`)
  6. Use `generateStaticParams` in `src/app/blog/[slug]/page.tsx` to create routes
- Alternative: use `next-mdx-remote` for more control over MDX rendering (allows dynamic content, custom scope). This is better for a blog where posts are loaded from files.
- Register the project's design system components (`.bc`, `.tcard`, etc.) as MDX components so blog posts can use the same visual language

**Detection:** If `pnpm build` fails with MDX import errors, or if MDX files are not recognized as routes.

**Phase:** Dedicated blog phase (after Phase 4) -- this is a significant feature requiring its own planning

### Pitfall 6: i18n for Bengali Breaks Without Proper Font Support

**What goes wrong:** Bengali script (Bengali/Bangla) uses complex ligatures and requires specific font support. The current font stack (Syne for headings, DM Sans for body) does NOT support Bengali characters. When Bengali text is rendered, it will fall back to system fonts, creating a jarring visual mismatch where headings use Syne and Bengali text uses whatever the system provides.

**Why it happens:** Developers plan i18n as a string translation problem without considering typography. Google Fonts' Syne and DM Sans do not include Bengali character ranges. The Bengali text will render but with inconsistent styling, spacing, and weight.

**Consequences:**
- Bengali text looks unprofessional compared to English
- Line heights and spacing differ between scripts
- Mixed Bengali/English text (common in BD -- "Courier Sync" alongside "কুরিয়ার সিঙ্ক") creates inconsistent baselines
- The "premium SaaS quality with Bangladeshi personality" design goal is undermined

**Prevention:**
- Use `next/font/google` to load a Bengali-supporting font. `Noto Sans Bengali` is the standard choice -- it pairs reasonably with DM Sans
- Configure fonts with `subsets: ["latin", "bengali"]` in `next/font/google` calls
- Alternatively, use CSS `unicode-range` to load Bengali font only when Bengali characters are present
- Test mixed-script rendering early (even a single Bengali string on the homepage)
- The `font-dm-sans` class on `<body>` will need to be conditional or supplemented with a Bengali fallback
- Consider using `Noto Sans Bengali` as the body font for Bengali locale and `DM Sans` for English, with a shared heading font or a Bengali-compatible heading font

**Detection:** Add a Bengali string to any page and check if it renders in the correct font. If it uses a system fallback, font support is missing.

**Phase:** Foundation (Phase 1) or early Phase 2 -- load the Bengali font before building i18n pages

### Pitfall 7: Self-Hosted Next.js Standalone Output Missing Static Assets

**What goes wrong:** When building for self-hosting with `output: 'standalone'` in `next.config.ts`, the build output in `.next/standalone/` does NOT include the `public/` directory or the `.next/static/` directory. These must be copied manually. The current `next.config.ts` is empty (no `output` config at all), meaning the build output is not optimized for self-hosting.

**Why it happens:** Next.js standalone mode is designed for Docker/containers where the build step and runtime step are separate. The standalone output is a minimal Node.js server, but it expects static assets to be mounted separately.

**Consequences:**
- `favicon.svg`, any images in `public/`, and `_next/static/` files return 404 on self-hosted deployment
- CSS files are missing, so the entire site renders unstyled
- Font files loaded by `next/font` are served from `_next/static/media/` -- if this directory is missing, fonts fail to load

**Prevention:**
- Configure `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  // Copy these after build:
  // .next/static -> .next/standalone/.next/static
  // public -> .next/standalone/public
};
```

- Create a build script (e.g., `build:deploy`) that copies `public/` and `.next/static/` into `.next/standalone/`
- The standalone server runs via `node .next/standalone/server.js` (no `next start`)
- Test the full build + copy + run cycle before deploying
- If using a reverse proxy (nginx), configure it to serve `_next/static/` directly for performance

**Detection:** Build with `output: 'standalone'`, run `node .next/standalone/server.js`, access the site. If CSS/fonts/images are missing, the copy step is missing.

**Phase:** Polish (Phase 4) when preparing for deployment, but configure `output: 'standalone'` in Phase 1

### Pitfall 8: Lighthouse 90+ Impossible With Current Framer Motion Usage

**What goes wrong:** The current codebase loads Framer Motion (~36KB gzipped) on every page. Combined with three Google Fonts (12 weight variants), React 19 hydration, and CSS-in-JS from Tailwind, the JavaScript bundle is already significant for a marketing site. Adding MDX rendering, i18n locale data, and more animations will push the Total Blocking Time (TBT) above the Lighthouse threshold.

**Why it happens:** Marketing sites are often held to Lighthouse 90+ performance scores, but animation libraries, multiple fonts, and client-side rendering work against this goal. The Bangladeshi target audience may have slower connections, making bundle size critical.

**Consequences:**
- Lighthouse Performance score below 80
- Slow Largest Contentful Paint (LCP) due to font loading blocking render
- High Cumulative Layout Shift (CLS) from hydration mismatches and theme flashing
- Slow First Input Delay (FID) / Interaction to Next Paint (INP) from heavy JS

**Prevention:**
- Reduce font weights: Audit actual usage. `layout.tsx` loads Syne with 3 weights (600, 700, 800) but `globals.css` uses `font-weight: 800` and `900` -- weight 900 is not loaded! This will cause fallback rendering
- Use `font-display: swap` (already the default in `next/font/google`) but verify with Lighthouse
- Lazy-load Framer Motion components using `next/dynamic` with `{ ssr: false }` for below-the-fold sections
- Use CSS animations for above-the-fold content (hero text entrance, dashboard mock float)
- Preload the hero image/mockup if any image assets are used
- Enable `compress: true` in standalone server or use nginx gzip
- Consider using `next/image` with proper `priority` and `sizes` attributes for any raster images

**Detection:** Run `pnpm build && pnpm start`, then run Lighthouse in Chrome DevTools. Target: Performance > 80 initially, > 90 after optimization.

**Phase:** Polish (Phase 4) -- performance optimization pass, but structural decisions (font weights, animation approach) must be made in Phase 1-2

### Pitfall 9: CSS Utility Class Explosion in globals.css

**What goes wrong:** The current `globals.css` is already 999 lines with ~100 custom utility classes (`.bc`, `.bc-icon`, `.bc-title`, `.tcard`, `.tav`, `.ms-v`, etc.). These are essentially a parallel design system built with Tailwind's `@apply`. As more pages and components are added (blog, docs, legal pages), this file will grow to 2000+ lines and become unmaintainable.

**Why it happens:** The HTML prototype used flat CSS class names. When porting to Tailwind, developers wrapped these as `@layer utilities` classes using `@apply` instead of converting to proper React components with Tailwind classes inline or to Tailwind `@theme` tokens.

**Consequences:**
- Cannot tree-shake unused utility classes (they are all defined globally)
- Naming conflicts as the project grows (`.bc` could mean "bento card" or "blog card")
- Difficult to understand which classes are used where
- Slow Tailwind compilation as the utility layer grows
- New developers cannot tell if a class is a Tailwind built-in or a project custom class

**Prevention:**
- Stop adding new `@layer utilities` classes for component-specific styling
- For new components, use Tailwind classes directly in JSX or create small scoped CSS modules
- Consider refactoring existing utility classes into component-level styles as part of Phase 2/3
- The `.btn-*` classes are justified as a shared design system (used in multiple places)
- Component-specific classes (`.bc`, `.tcard`, `.ms-v`) should move to their respective components
- Add a comment convention to distinguish: shared utilities vs component utilities

**Detection:** If `globals.css` exceeds 1200 lines, it is time to refactor. Count how many utility classes are used in only one component.

**Phase:** Homepage (Phase 2) -- establish the convention for new components, refactor later if needed

### Pitfall 10: Syne Font Weight 900 Used But Not Loaded

**What goes wrong:** `globals.css` uses `font-weight: 900` in multiple places (`.bc-title`, `.sec-title`, `.clog-name`, `.p-price`, `.hero h1`). But `layout.tsx` only loads Syne with weights `["600", "700", "800"]`. Weight 900 is not loaded, so the browser will synthesize a bold version from weight 800 or fall back to a different font.

**Why it happens:** The HTML prototype loaded Syne with weights 400-900 (`Syne:wght@400;600;700;800;900`), but when porting to `next/font/google`, the weights were reduced without auditing all usage.

**Consequences:**
- Headings that should use weight 900 render with synthetic bold (looks thicker but not the designed weight)
- Inconsistent rendering across browsers
- The "premium" feel is degraded by font rendering differences

**Prevention:**
- Add `"900"` to the Syne font configuration in `layout.tsx`
- Audit all font weights used in `globals.css` against the loaded weights for all three font families
- DM Sans uses weights 300-700 -- verify all are needed (weight 300 may not be used)
- JetBrains Mono uses 400, 600 -- verify both are needed

**Detection:** Search `globals.css` for `font-weight` values and cross-reference with `layout.tsx` font configurations.

**Phase:** Foundation (Phase 1) -- add the missing weight immediately

---

## Moderate Pitfalls

### Pitfall 11: Navbar Scroll Listener Without Throttle

**What goes wrong:** `Navbar.tsx` line 28-29 attaches a raw `scroll` event listener that calls `setIsScrolled(window.scrollY > 20)` on every scroll pixel. This triggers a React state update on every frame during scrolling.

**Prevention:** Use `requestAnimationFrame` throttling or replace with `IntersectionObserver` for a sentinel element at the top of the page. A simpler fix: use a CSS `position: sticky` approach with `top: 16px` and a scroll-linked `border-color` transition that does not require JavaScript state.

**Phase:** Foundation (Phase 1) or Polish (Phase 4)

### Pitfall 12: i18n Library Choice Locks Architecture

**What goes wrong:** Next.js has multiple i18n approaches: file-based (next-intl), routing-based (next-i18n-router), or custom with App Router's built-in locale support. The wrong choice early means rewriting the entire routing structure later.

**Prevention:** For a marketing site with 2 locales (English + Bengali), use `next-intl` with App Router. It supports:
- File-based locale messages (JSON or TS)
- Server Component translation (no client-side locale data)
- Static generation per locale
- `generateStaticParams` for locale-based routes

Do NOT use URL-based locale routing (`/en/features`, `/bn/features`) unless the BD market demands Bengali URLs. Subtle approach: use the same URLs, detect browser language, and serve the appropriate locale. This avoids duplicating all routes.

If Bengali is secondary, consider a simpler approach: store translations in a `src/lib/i18n/` directory with `en.ts` and `bn.ts` dictionaries, and use a client component context to switch locale. This avoids the routing complexity entirely.

**Phase:** Before content pages (late Phase 2 or early Phase 3) -- decide the approach before building pages that need translation

### Pitfall 13: MDX Blog Without Content Structure Plan

**What goes wrong:** Without a clear content directory structure and frontmatter schema, blog posts will have inconsistent metadata, broken listings, and difficult-to-maintain content.

**Prevention:**
- Define a content directory: `content/blog/` with `.mdx` files
- Define a frontmatter schema: `title`, `date`, `excerpt`, `tags`, `author`, `coverImage`
- Use `zod` for frontmatter validation
- Create a content utility in `src/lib/content.ts` that reads and validates all blog posts
- Plan for both English and Bengali blog posts (subdirectory per locale, or frontmatter field)

**Phase:** Dedicated blog phase (after Phase 4)

### Pitfall 14: Custom Cursor Breaks on Touch Devices

**What goes wrong:** The HTML prototype has a custom cursor (`#cursor`) that follows mouse position with `mix-blend-mode`. On mobile/touch devices, this creates an invisible overlay that intercepts touch events, or the cursor element just sits in the center of the screen.

**Prevention:** The `pointer-events: none` CSS is already applied in the HTML prototype. When porting, ensure:
- The cursor component only renders on non-touch devices (use `matchMedia('(hover: hover)')` check)
- Use `requestAnimationFrame` for position updates, not React state
- Destroy the cursor on touch devices entirely

**Phase:** Polish (Phase 4) when implementing the custom cursor

### Pitfall 15: Form Submission Without Rate Limiting or Validation

**What goes wrong:** The support page contact form will use a Next.js server action for email sending. Without rate limiting, this endpoint can be abused for spam. Without proper validation, malformed data reaches the email sending logic.

**Prevention:**
- Validate all form inputs with `zod` schema in the server action
- Add a simple rate limit (e.g., max 3 submissions per IP per hour using an in-memory store or Redis)
- Return meaningful error messages without exposing internal details
- Consider adding a honeypot field to catch bots
- The WhatsApp link for BD payment methods should not expose phone numbers in client-accessible code that bots can scrape -- use the server action to redirect

**Phase:** Content Pages (Phase 3) when building the Support page

---

## Minor Pitfalls

### Pitfall 16: Emoji Reliance for Icons

**What goes wrong:** The project uses emojis for icons (rocket in logo, emoji in feature cards, emoji in support cards). Emojis render differently across operating systems and browsers. On Windows, the rocket emoji looks different from macOS. Some emojis may not render at all on older browsers.

**Prevention:** Lucide React is already installed and used in the Navbar. Extend its usage to feature icons, support card icons, and other UI elements. Use `next/image` for any custom icon graphics. Reserve emojis for decorative purposes only where cross-platform consistency is not critical.

**Phase:** Homepage (Phase 2) when building feature cards

### Pitfall 17: Missing Error and Loading States

**What goes wrong:** No `error.tsx`, no `loading.tsx`, no `not-found.tsx` files exist (though `not-found.tsx` is listed in git status as untracked, suggesting it may have been created recently). Without these, runtime errors crash the entire app and navigation feels instant without feedback.

**Prevention:**
- Add `src/app/not-found.tsx` with the WooBooster design (branded 404)
- Add `src/app/error.tsx` as a root error boundary
- Add `loading.tsx` for routes with data fetching (blog, changelog)
- These are cheap to implement and prevent the worst user experiences

**Phase:** Content Pages (Phase 3) for `error.tsx`, Polish (Phase 4) for `not-found.tsx`

### Pitfall 18: Video Lightbox Without Lazy Loading

**What goes wrong:** The video section has a lightbox overlay with a video player. If the video iframe is loaded when the page renders (even if the lightbox is closed), it downloads video data unnecessarily. The HTML prototype creates the lightbox in the DOM but hides it with CSS.

**Prevention:** Only mount the video iframe/element when the lightbox is open. Use React conditional rendering with `AnimatePresence` (already imported in Navbar). This saves bandwidth for users who never click the video.

**Phase:** Homepage (Phase 2) when building the VideoSection

### Pitfall 19: Pricing Currency Toggle State Management

**What goes wrong:** The USD/BDT toggle on the pricing page needs to persist across page navigations (if the user toggles to BDT, navigates to Features, then back to Pricing, the toggle should remember BDT). Using only local `useState` resets on every page visit.

**Prevention:** Use `localStorage` via `next-themes`-style persistence (read on mount, write on change). Or use URL search params (`?currency=bdt`) so the state is shareable. The URL approach also enables linking directly to BDT pricing from marketing materials.

**Phase:** Content Pages (Phase 3) when building the Pricing page

### Pitfall 20: Missing `robots.txt` and `sitemap.xml`

**What goes wrong:** Search engines cannot discover pages efficiently. For a marketing site, organic search traffic is critical, especially for WooCommerce plugin discovery.

**Prevention:** Next.js App Router supports `src/app/robots.ts` and `src/app/sitemap.ts` as route handlers. Create these files with the correct URLs. Exclude admin routes, include all public pages, and set appropriate crawl frequencies.

**Phase:** Polish (Phase 4)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation | Severity |
|-------------|---------------|------------|----------|
| Foundation: `utils.ts` creation | Wrong `twMerge` import path or missing `clsx` types | Copy the exact pattern from existing codebase (already done correctly at `src/lib/utils.ts`) | LOW |
| Foundation: `Footer.tsx` | Footer imports non-existent links (Blog, Docs, legal pages) | Use `#` placeholders, plan real routes later | LOW |
| Homepage: Hero section | Over-animating the hero with Framer Motion kills LCP | Use CSS animations for hero entrance, Framer Motion for interactive elements only | HIGH |
| Homepage: Dashboard mock | The floating animation (`mockFloat`) runs infinitely, consuming CPU | Use `animation-play-state: paused` when not in viewport, triggered by IntersectionObserver | MEDIUM |
| Content: Features page | Feature tabs using client-side state lose SEO content | Render all feature content server-side, use client-side JS only for visual tab switching | MEDIUM |
| Content: Pricing page | BDT/USD toggle requires all pricing data in client bundle | Keep pricing data in server component, use a thin client wrapper only for the toggle UI | MEDIUM |
| Content: Changelog page | Changelog entries are hardcoded in components | Extract to `src/data/changelog.ts` data file early, before entries multiply | LOW |
| Content: Support form | Server action email sending fails silently | Add error handling with user-facing error messages, log failures server-side | HIGH |
| Polish: Lighthouse audit | CSS utility class file is too large for critical path | Audit and remove unused utility classes, ensure Tailwind tree-shaking works | MEDIUM |
| Polish: Self-hosting | Standalone output missing static assets | Create a build script that copies `public/` and `.next/static/` into standalone dir | HIGH |
| Blog: MDX setup | MDX components not registered, custom components fail | Create `mdx-components.tsx` before writing any blog posts | HIGH |
| i18n: Bengali support | Bengali font not loaded, fallback renders poorly | Load `Noto Sans Bengali` alongside `DM Sans`, test mixed-script rendering | HIGH |
| i18n: Routing structure | Adding locale segments requires rewriting all routes | Decide early: URL-based (`/bn/features`) vs client-side locale switching | MEDIUM |
| Animations: Custom cursor | Cursor intercepts events on mobile, adds latency on desktop | Only render on non-touch devices, use `rAF` not React state | MEDIUM |
| Animations: Magnetic tilt | Mousemove-based tilt on 20+ cards causes jank | Use CSS custom properties with `will-change: transform` instead of React state per card | HIGH |

---

## Sources

- Codebase audit: `src/app/globals.css` (999 lines of CSS utilities), `src/components/layout/Navbar.tsx` (scroll listener), `src/components/sections/HeroSection.tsx` (client component), `src/components/sections/ScrollReveal.tsx` (client wrapper), `next.config.ts` (empty config), `layout.tsx` (font loading, theme setup)
- HTML design reference: `woobooster-v2.html` (1247 lines) -- scroll reveal implementation (line 1108-1113), word-by-word reveal (1119-1142), magnetic tilt cards (1148-1157), count-up animation (1163-1184), page transitions (84-86)
- Dependency analysis: `package.json` -- `framer-motion ^12.38.0`, `next-themes ^0.4.6`, `next 16.2.6`
- Existing concerns: `.planning/codebase/CONCERNS.md` (build-breaking issues, performance bottlenecks, fragile areas)
