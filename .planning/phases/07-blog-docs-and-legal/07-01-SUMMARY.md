---
phase: 07-blog-docs-and-legal
plan: 01
subsystem: content
tags: [mdx, next-mdx, tailwind-typography, gray-matter, docs]
requires:
  - phase: 04-polish
    provides: "Stable visual shell and design tokens"
provides:
  - "Next.js MDX compilation configured with GFM and heading anchors"
  - "Blog and documentation MDX content corpus"
  - "Frontmatter metadata helpers for blog and docs routes"
affects: [blog, docs, seo, content]
tech-stack:
  added: [@next/mdx, @mdx-js/loader, @mdx-js/react, @types/mdx, @tailwindcss/typography, gray-matter, remark-gfm, rehype-slug, rehype-autolink-headings]
  patterns: ["Local MDX content in src/content", "gray-matter frontmatter parsing", "Tailwind Typography prose styling"]
key-files:
  created: [mdx-components.tsx, src/lib/mdx.ts, src/data/docs-nav.ts, src/content/blog/woo-booster-getting-started.mdx, src/content/blog/bd-ecommerce-courier-guide.mdx, src/content/blog/meta-capi-bangladesh.mdx, src/content/docs/getting-started.mdx, src/content/docs/courier-sync.mdx, src/content/docs/meta-capi.mdx, src/content/docs/fraud-shield.mdx, src/content/docs/analytics.mdx]
  modified: [next.config.ts, tsconfig.json, src/app/globals.css, package.json, pnpm-lock.yaml]
key-decisions:
  - "Configured MDX plugins by package-name strings so Next.js 16 Turbopack can serialize loader options."
patterns-established:
  - "Blog metadata is read from local MDX files with gray-matter and sorted newest first."
  - "Docs navigation is a curated data file rather than inferred from the file tree."
requirements-completed: [BLOG-03, BLOG-04]
duration: 16 min
completed: 2026-05-12
---

# Phase 07 Plan 01: MDX Content Foundation Summary

**Build-time MDX pipeline with GFM support, prose styling, metadata utilities, and seeded WooBooster blog/docs content**

## Performance

- **Duration:** 16 min
- **Started:** 2026-05-12T10:40:00Z
- **Completed:** 2026-05-12T10:56:00Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments

- Added the MDX compilation stack, Tailwind Typography, and required root `mdx-components.tsx`.
- Created `getBlogPosts()` and `getDocPosts()` helpers with frontmatter extraction and reading-time calculation.
- Added 3 blog MDX posts and 5 documentation MDX guides with valid frontmatter, tables, headings, and code blocks.

## Task Commits

1. **Task 1 and 2: MDX foundation and content files** - `b535ec1` (feat)

## Files Created/Modified

- `next.config.ts` - Wraps the standalone Next config with `createMDX`.
- `mdx-components.tsx` - Provides the required global MDX component hook.
- `src/lib/mdx.ts` - Reads local MDX frontmatter for blog and docs metadata.
- `src/data/docs-nav.ts` - Defines the two-category docs navigation model.
- `src/content/blog/*.mdx` - Adds 3 public blog posts.
- `src/content/docs/*.mdx` - Adds 5 public documentation guides.
- `src/app/globals.css` - Registers Tailwind Typography and design-token prose styles.

## Decisions Made

- Used string plugin names in `next.config.ts` for `remark-gfm`, `rehype-slug`, and `rehype-autolink-headings` because Next.js 16 Turbopack rejects non-serializable plugin function options during `next build`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Turbopack rejected imported MDX plugin functions**
- **Found during:** Task 1 build verification
- **Issue:** `pnpm build` failed because loader options containing imported plugin functions were not serializable.
- **Fix:** Kept the planned plugins but configured them as package-name strings, which Next.js documents for Turbopack-compatible MDX plugins.
- **Files modified:** `next.config.ts`
- **Verification:** `pnpm build` passed after the change.
- **Committed in:** `b535ec1`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Same MDX features were preserved; the config shape was adjusted for Next.js 16 build compatibility.

## Issues Encountered

- Initial build failed on MDX plugin serialization; resolved with string-based plugin configuration.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

MDX content and metadata helpers are ready for the blog listing, blog detail pages, docs landing page, and docs detail pages.

---
*Phase: 07-blog-docs-and-legal*
*Completed: 2026-05-12*
