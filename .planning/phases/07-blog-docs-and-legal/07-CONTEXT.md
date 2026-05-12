# Phase 7: Blog, Docs, and Legal - Context

**Gathered:** 2026-05-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Add three new content sections to the site: (1) an MDX-powered blog with listing page and individual posts, (2) a documentation section with sidebar navigation and auto-generated TOC, and (3) four legal content pages (Privacy Policy, Terms of Service, Refund Policy, License Agreement). These sections are essential for trust, SEO, and compliance. None exist in the HTML design reference — all are new UI.

</domain>

<decisions>
## Implementation Decisions

### MDX Rendering
- **D-01:** Use `@next/mdx` for static MDX rendering — zero runtime overhead, automatic static generation, native Next.js integration
- **D-02:** Blog posts live in `src/content/blog/*.mdx` (per BLOG-04 requirement)
- **D-03:** Documentation guides live in `src/content/docs/*.mdx`
- **D-04:** Legal pages are plain TSX components (not MDX) — they're static content with no dynamic markdown needs
- **D-05:** Install `@next/mdx` and `@mdx-js/loader` as dev dependencies; configure in `next.config.ts` with `withMDx` wrapper

### Blog Design
- **D-06:** Blog listing page uses a 2-3 column card grid layout — matches existing card patterns from features/testimonials sections
- **D-07:** Each card shows: gradient thumbnail placeholder, title, date, excerpt, and reading time
- **D-08:** Include 3 realistic sample blog posts about WooBooster features, BD eCommerce, and getting started — with varied MDX formatting (tables, code blocks, headings)
- **D-09:** Blog route: `/blog` (listing) and `/blog/[slug]` (individual posts)
- **D-10:** Generate static params from MDX file names at build time

### Documentation Structure
- **D-11:** Two-column layout: fixed sidebar with doc categories (left) + scrollable content area with auto-generated TOC (right)
- **D-12:** 5 documentation guides covering: Getting Started, Courier Sync, Meta CAPI, Fraud Shield, Analytics
- **D-13:** Docs route: `/docs` (index/landing) and `/docs/[slug]` (individual guides)
- **D-14:** Sidebar navigation groups guides by category (Getting Started, Modules)
- **D-15:** Auto-generate TOC from markdown headings (h2, h3) in each doc page

### Legal Content
- **D-16:** Draft professional legal content for all 4 pages, tailored to a WooCommerce plugin sold as one-time license to BD customers
- **D-17:** Legal routes: `/privacy`, `/terms`, `/refund`, `/license`
- **D-18:** Legal pages use shared layout component with consistent heading hierarchy and responsive typography
- **D-19:** Content covers: data collection (privacy), usage terms (terms), 30-day refund policy (refund), license scope and restrictions (license)
- **D-20:** Not legal advice — professional content that can be reviewed by a lawyer before production launch

### MDX Styling
- **D-21:** Use `@tailwindcss/typography` plugin for drop-in prose styling on MDX content — apply `prose` class to MDX wrapper
- **D-22:** Customize prose styles with existing design tokens (accent color for links, code block styling, heading fonts)
- **D-23:** Blog post thumbnails use gradient placeholders — no real image management needed
- **D-24:** Dark mode prose styling via `prose-invert` class (Tailwind Typography supports this)

### Navigation Updates
- **D-25:** Update footer "Blog" link from "#" to "/blog" in `src/data/navigation.ts`
- **D-26:** Update footer "Documentation" link from "#" to "/docs" in `src/data/navigation.ts`
- **D-27:** Update all 4 footer legal links from "#" to their real routes in `src/data/navigation.ts`
- **D-28:** Blog and docs are NOT in the top navbar — footer-only navigation (matches marketing site convention)

### Claude's Discretion
- Exact reading time calculation logic for blog posts
- Gradient color choices for blog thumbnails
- Sidebar component implementation details
- TOC auto-generation approach (headings extraction)
- Blog card hover/transition effects
- Legal page heading hierarchy and section structure
- MDX frontmatter schema details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Reference
- No HTML design reference exists for blog, docs, or legal sections — all new UI
- Match existing card patterns from features page and testimonials section for blog cards
- Match existing page hero pattern (eyebrow + title + subtitle) for section landing pages
- Legal pages follow standard legal document layout

### Existing Source Files (must read before implementing)
- `src/data/navigation.ts` — Footer links (Blog, Documentation, and all 4 legal links currently point to "#")
- `src/app/layout.tsx` — Root layout, fonts, metadata template
- `src/app/globals.css` — Design tokens, theme variables
- `src/components/layout/Footer.tsx` — Footer with 4-column grid, already renders legal links
- `next.config.ts` — Currently minimal (output: 'standalone'), needs MDX configuration

### Project Configuration
- `.planning/PROJECT.md` — Constraints: pnpm only, server components default, TailwindCSS v4
- `.planning/REQUIREMENTS.md` — BLOG-01..04, DOCS-01..02, LEGL-01..04
- `.planning/ROADMAP.md` — Phase 7 success criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Card grid pattern from features page — can be adapted for blog listing cards
- Page hero pattern (eyebrow + title + subtitle) used on Features, Pricing, Changelog, Support pages
- `cn()` utility at `src/lib/utils.ts` — for conditional class merging
- Design tokens in `globals.css` — colors, fonts, spacing, shadows already established
- ScrollReveal component for below-fold content animations
- `src/data/navigation.ts` — Already has `footerLegalLinks` array with correct names, just needs href updates

### Established Patterns
- Server components by default — blog/docs pages are server-rendered from MDX
- App Router file-based routing — `/blog/page.tsx`, `/blog/[slug]/page.tsx`, etc.
- Data-driven content — all content in data files under `src/data/`
- Named exports for reusable components, default exports for pages
- Metadata API for per-page SEO (title, description, OG tags)

### Integration Points
- `next.config.ts` — Add `withMDx()` wrapper for MDX support
- `src/data/navigation.ts` — Update 6 href values from "#" to real routes
- `tsconfig.json` — May need to add `.mdx` to content directory includes
- `src/app/globals.css` — Add `@tailwindcss/typography` import and prose customizations

### New Dependencies Required
- `@next/mdx` — MDX support for Next.js
- `@mdx-js/loader` — MDX webpack/loader
- `@tailwindcss/typography` — Prose styling for MDX content
- `gray-matter` — Parse MDX frontmatter (if not using built-in)
- `reading-time` — Calculate reading time for blog posts (or compute manually)

</code_context>

<specifics>
## Specific Ideas

- Blog card grid should use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for responsive layout
- Docs sidebar should be sticky (position: sticky) with overflow scroll on long navigation
- TOC should highlight the currently visible section heading while scrolling
- Legal pages should have a "Last updated: [date]" line at the top
- Blog post gradient thumbnails can use different gradient angles/colors based on post slug hash
- Reading time can be calculated from word count: `Math.ceil(words / 200)` minutes

</specifics>

<deferred>
## Deferred Ideas

- Blog categories/tags and filtering — simple chronological listing is sufficient for launch
- Blog search functionality — not needed for initial blog with 3 posts
- RSS feed for blog — can add in Phase 8 (SEO Completion)
- Docs full-text search — defer until docs grow significantly
- Comments on blog posts — not needed for a marketing site blog
- Newsletter signup on blog — deferred to future milestone per PROJECT.md Out of Scope
- Author profile pages — single-author blog (Devsroom team) doesn't need this yet
- Image optimization for blog images — using gradient placeholders eliminates this need
- Social sharing buttons on blog posts — can add later if needed

</deferred>

---

*Phase: 07-blog-docs-and-legal*
*Context gathered: 2026-05-12*
