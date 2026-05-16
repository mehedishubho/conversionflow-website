# Phase 4: Polish - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Add SEO metadata to all pages, create a custom 404 page, build a custom SVG favicon, and optimize performance (fonts, bundle). This is the final polish phase — making the site production-ready.

</domain>

<decisions>
## Implementation Decisions

### SEO Metadata
- **D-01:** Use Next.js `export const metadata` on each page (server components by default)
- **D-02:** Root layout has base metadata; each page overrides `title` and `description`
- **D-03:** Include Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`) for social sharing
- **D-04:** Use a template title pattern: `"{page title} — WooBooster"` for consistency

### 404 Page
- **D-05:** Create `src/app/not-found.tsx` as a server component
- **D-06:** Include navigation back to home and links to key pages
- **D-07:** Use existing design tokens and `.page-hero-sm` pattern for visual consistency

### Favicon
- **D-08:** Create SVG favicon with rocket emoji branding (matching Footer's 🚀 icon)
- **D-09:** Place at `public/favicon.svg` and configure via metadata in `layout.tsx`

### Performance
- **D-10:** Audit font weights — remove unused Syne 900 if not referenced
- **D-11:** Verify `pnpm build` succeeds and check for build warnings

### Agent's Discretion
- Scroll-triggered animations: Add Framer Motion `useInView` animations to section components where appropriate
- Performance specifics: Agent decides based on build output

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Reference
- `woobooster-v2.html` — Original HTML design reference with all visual patterns

### Project Files
- `.planning/PROJECT.md` — Project constraints and decisions
- `.planning/REQUIREMENTS.md` — SEO-01 through SEO-04 requirements

### Existing Code
- `src/app/layout.tsx` — Root layout with base metadata
- `src/app/page.tsx` — Homepage (no metadata yet)
- `src/app/features/page.tsx` — Features page (no metadata)
- `src/app/pricing/page.tsx` — Pricing page (no metadata)
- `src/app/changelog/page.tsx` — Changelog page (no metadata)
- `src/app/support/page.tsx` — Support page (no metadata)
- `src/app/globals.css` — All design tokens and utility classes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.page-hero-sm` CSS class — Page hero pattern for subpages
- `.glass` utility — Glassmorphism for nav/overlays
- Framer Motion already installed (`framer-motion ^12.38.0`)
- Lucide React already installed (`lucide-react ^1.14.0`)

### Established Patterns
- Server components by default (no `"use client"` unless needed)
- `@/` imports for internal modules
- Design tokens via CSS custom properties in `globals.css`
- Each content page has a `page-hero-sm` hero section

### Integration Points
- `layout.tsx` exports base `metadata` — pages can override with their own exports
- `not-found.tsx` at `src/app/` level will be auto-detected by Next.js

</code_context>

<specifics>
## Specific Ideas

- Favicon should use the rocket branding (🚀) consistent with Footer
- OG tags should reference WooBooster's value proposition for WooCommerce stores
- 404 page should feel like a real page, not a generic error

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-polish*
*Context gathered: 2026-05-11*
