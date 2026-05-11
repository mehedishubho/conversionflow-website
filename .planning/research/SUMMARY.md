# Research Summary: WooBooster Website

**Research Date:** 2026-05-11

## Key Findings

### Stack
The project's stack (Next.js 16, TailwindCSS 4, TypeScript, Framer Motion, Lucide React) is modern and well-chosen. No stack changes needed. Focus on completing the implementation.

### Table Stakes Features
A WooCommerce plugin marketing site MUST have:
- Hero section with clear value proposition and CTA
- Features page showcasing product capabilities
- Pricing page with clear tiers and comparison
- Responsive design (mobile-first)
- Fast loading (< 3s LCP)
- Dark/light mode support
- SEO metadata (OG tags, title, description)
- Branded 404 page
- Footer with navigation and legal links

### Architecture Approach
- **Build order**: Foundation (fix broken imports) → Homepage (port from HTML) → Content Pages (features, pricing, changelog, support) → Polish (SEO, animations, performance) → Quality (tests, CI)
- **Component pattern**: Server components by default, client components for interactivity (Navbar, ThemeProvider, animated sections)
- **Content strategy**: Hardcode content as constants for v1; CMS integration deferred

### Watch Out For
1. **Build is currently broken** — Missing Footer.tsx and utils.ts. Must fix FIRST.
2. **HTML prototype not directly portable** — Must translate to React/Tailwind, not copy-paste
3. **Font weight bloat** — 12 weights loaded across 3 fonts; audit and trim
4. **Framer Motion bundle** — 36KB for simple animations; consider CSS alternatives
5. **next-themes version pinning** — 0.x version, pin exact to prevent breakage
6. **No error boundaries** — Add error.tsx and not-found.tsx

## Decisions Informed by Research

1. **Port HTML reference section-by-section** rather than trying to port all at once
2. **Create UI primitives** (Button, Card) early for consistency across pages
3. **Define content as data arrays** (pricing tiers, feature lists) separate from JSX
4. **Add button CSS classes to globals.css** rather than using raw Tailwind everywhere
5. **Use CSS animations for simple effects**, reserve Framer Motion for complex interactions

---
*Research completed: 2026-05-11*
