# Pitfalls Research: WooCommerce Plugin Marketing Site

**Research Date:** 2026-05-11

## Critical Pitfalls

### 1. Build-Breaking Missing Files
**Problem**: `Footer.tsx` and `utils.ts` are imported but don't exist. The project cannot build.
**Warning Signs**: Import errors in `pnpm build`, TypeScript compilation failures
**Prevention**: Fix these FIRST before any feature work. This is Phase 0.
**Phase**: Foundation (Phase 1)

### 2. CSS Classes Used But Never Defined
**Problem**: `btn`, `btn-primary`, `btn-outline` classes used in Navbar but not defined in `globals.css`.
**Warning Signs**: Buttons render as unstyled text links
**Prevention**: Define button utility classes in `globals.css` `@layer utilities` section, or replace with Tailwind utility classes
**Phase**: Foundation (Phase 1)

### 3. Hydration Mismatch from Theme
**Problem**: `next-themes` causes hydration mismatch if component renders differently before mount. Current Navbar returns `null` before mount — causes layout shift.
**Warning Signs**: Console hydration warnings, visible flash of content
**Prevention**: Use skeleton/placeholder during hydration, then swap to full component. `suppressHydrationWarning` on `<html>` is already in place.
**Phase**: Foundation (Phase 1)

### 4. HTML Prototype Not Directly Portable
**Problem**: `woobooster-v2.html` uses raw CSS, inline styles, and vanilla JS. Can't copy-paste into React components.
**Warning Signs**: Styling differences, broken interactions, CSS conflicts
**Prevention**: Port STRUCTURE and DESIGN, not code. Translate HTML classes to Tailwind utilities. Replace vanilla JS with React state/effects.
**Phase**: Homepage (Phase 2)

### 5. Font Weight Bloat
**Problem**: Loading 12 font weight variants across 3 families adds significant download size.
**Warning Signs**: Slow LCP, high font-related data transfer
**Prevention**: Audit actual weight usage. Remove unused weights from `next/font/google` configuration.
**Phase**: Polish (Phase 4)

### 6. Framer Motion Bundle Size
**Problem**: `framer-motion` is ~36KB gzipped. If used only for simple entrance animations, it's overkill.
**Warning Signs**: Large JS bundle for a marketing site
**Prevention**: Use CSS animations for simple entrance effects. Reserve Framer Motion for complex interactions (page transitions, shared layout animations).
**Phase**: Polish (Phase 4)

### 7. next-themes Version Instability
**Problem**: `next-themes` is on 0.x version. Minor bumps can introduce breaking changes.
**Warning Signs**: Theme switching breaks after `pnpm install`
**Prevention**: Pin exact version (remove `^` from version spec). Test after any dependency update.
**Phase**: Any phase (proactive fix)

### 8. No Error Boundaries
**Problem**: No `error.tsx` files. If any component throws, the entire app crashes.
**Warning Signs**: White screen of death in production
**Prevention**: Add `error.tsx` at root and route levels. Add `not-found.tsx` for 404s.
**Phase**: Content Pages (Phase 3)

### 9. Missing SEO Foundation
**Problem**: Only basic `title` and `description` metadata. No OG tags, no sitemap, no robots.txt.
**Warning Signs**: Poor social media previews, low search visibility
**Prevention**: Add metadata exports to each page. Create `sitemap.ts` and `robots.ts`. Add OG image.
**Phase**: Polish (Phase 4)

### 10. Accessibility Gaps
**Problem**: No ARIA enhancements, no accessibility audit. Marketing sites need to be accessible.
**Warning Signs**: Failed accessibility audits, keyboard navigation issues
**Prevention**: Use semantic HTML, add ARIA labels where needed, test with screen reader, ensure keyboard navigation works.
**Phase**: All phases (ongoing concern)

## Domain-Specific Pitfalls

### WooCommerce Plugin Market
- **Plugin compatibility claims**: Don't claim compatibility with specific WooCommerce versions without testing
- **Pricing page trust**: Include money-back guarantee, support SLA to build trust
- **Feature overload**: Marketing sites that list too many features overwhelm visitors. Focus on top 3-5 benefits.

### Marketing Site Specifics
- **Above-the-fold CTA**: Every page should have a clear primary action visible without scrolling
- **Mobile-first**: 60%+ of marketing site traffic is mobile. Design for mobile first.
- **Page speed**: Marketing sites that load slowly lose visitors. Target < 3s LCP.
