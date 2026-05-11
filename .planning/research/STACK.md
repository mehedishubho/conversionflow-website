# Stack Research: WooCommerce Plugin Marketing Site

**Research Date:** 2026-05-11

## Standard 2025/2026 Stack

### Core Framework
- **Next.js 16** (App Router) — Industry standard for React marketing sites. Server Components reduce JS bundle. Static generation (SSG) ideal for marketing content. ✓ Already chosen.
- **React 19** — Latest stable with improved server component support. ✓ Already using.
- **TypeScript 5.x** — Non-negotiable for maintainability. ✓ Already using.

### Styling
- **TailwindCSS 4** — CSS-first config is the latest approach. Utility-first with `@theme` directive for design tokens. ✓ Already using.
- **next-themes** — Standard for dark/light mode in Next.js. Class-based strategy works well with Tailwind. ✓ Already using.
- **Custom design tokens via CSS variables** — Best practice for themeable sites. ✓ Already implemented in `globals.css`.

### Animation
- **Framer Motion** — Standard for React animation. Good for marketing sites with scroll reveals, hover effects, page transitions. ~36KB gzipped. ✓ Already using.
- **CSS animations** — Consider for simple entrance effects to reduce bundle size.
- **GSAP** — Alternative for complex scroll-driven animations. Not needed for current scope.

### Icons
- **Lucide React** — Tree-shakeable, consistent icon set. ✓ Already using.
- **Heroicons** — Alternative from Tailwind team. Lucide is broader.

### Fonts
- **next/font/google** — Optimal font loading strategy. ✓ Already using.
- **Recommendation:** Audit weight usage. Currently loading 12 weight variants across 3 fonts.

### Testing (Not Yet Set Up)
- **Vitest** — Fast, Vite-native test runner. Best choice for Next.js.
- **React Testing Library** — Standard for component testing.
- **Playwright** — For E2E when critical user flows exist.

### Deployment
- **Vercel** — Native Next.js hosting. Zero-config deployment. ✓ Target platform.

## Confidence Levels

| Choice | Confidence | Notes |
|--------|-----------|-------|
| Next.js 16 | High | Industry standard, proven at scale |
| TailwindCSS 4 | High | Latest approach, CSS-first is the future |
| Framer Motion | Medium | Good but large; CSS animations sufficient for simple cases |
| next-themes | Medium | 0.x version, breaking changes possible; pin version |
| Vitest | High | Fast, excellent Next.js integration |
| Vercel | High | Native Next.js deployment |

## What NOT to Use

- **Styled-components/Emotion** — CSS-in-JS is declining; Tailwind is the standard
- **Redux/Zustand** — Overkill for a static marketing site
- **Gatsby** — Next.js has won the React SSG/SSR space
- **Storybook** — Premature for current component count
