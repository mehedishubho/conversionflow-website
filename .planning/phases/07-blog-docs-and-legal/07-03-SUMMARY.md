---
phase: 07-blog-docs-and-legal
plan: 03
subsystem: ui
tags: [docs, mdx, sidebar, table-of-contents]
requires:
  - phase: 07-blog-docs-and-legal
    provides: "Docs MDX files and docsNav data from plan 01"
provides:
  - "Documentation landing route at /docs"
  - "Static documentation routes at /docs/[slug]"
  - "Sticky docs sidebar and scroll-tracking table of contents"
affects: [docs, seo, support]
tech-stack:
  added: []
  patterns: ["Scoped route layout for docs detail pages", "client-only TOC component reading trusted MDX headings"]
key-files:
  created: [src/components/docs/DocsSidebar.tsx, src/components/docs/TableOfContents.tsx, src/app/docs/[slug]/layout.tsx, src/app/docs/page.tsx, src/app/docs/[slug]/page.tsx]
  modified: []
key-decisions:
  - "Docs sidebar layout is scoped to /docs/[slug] so the /docs landing page remains full-width."
patterns-established:
  - "Active docs navigation uses usePathname in a small client boundary."
requirements-completed: [DOCS-01, DOCS-02]
duration: 11 min
completed: 2026-05-12
---

# Phase 07 Plan 03: Documentation Routes Summary

**Docs landing page and static MDX guide pages with scoped sidebar navigation and scroll-aware TOC**

## Performance

- **Duration:** 11 min
- **Started:** 2026-05-12T11:08:00Z
- **Completed:** 2026-05-12T11:19:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Added `/docs` landing page with guides grouped by category from `docsNav`.
- Added `/docs/[slug]` pages for all five MDX guides with static params and prose rendering.
- Added `DocsSidebar` and `TableOfContents` client components for active navigation and heading anchors.

## Task Commits

1. **Task 1 and 2: Docs layout and pages** - `f5ba54c` (feat)
2. **Task 1 lint fix: Defer TOC heading state update** - `b3aa0fb` (fix)

## Files Created/Modified

- `src/components/docs/DocsSidebar.tsx` - Sticky grouped navigation with active route styling.
- `src/components/docs/TableOfContents.tsx` - IntersectionObserver-based TOC for h2/h3 headings.
- `src/app/docs/[slug]/layout.tsx` - Two-column docs layout scoped to detail routes.
- `src/app/docs/page.tsx` - Full-width docs landing page.
- `src/app/docs/[slug]/page.tsx` - Static MDX documentation route.

## Decisions Made

- Kept the docs landing page outside the sidebar layout by placing the route layout in `src/app/docs/[slug]/layout.tsx`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TOC heading discovery set state synchronously inside an effect**
- **Found during:** Code review/lint gate
- **Issue:** React lint flagged the `TableOfContents` mount effect for synchronous state update.
- **Fix:** Deferred heading discovery/state update with `requestAnimationFrame` and cleaned it up with `cancelAnimationFrame`.
- **Files modified:** `src/components/docs/TableOfContents.tsx`
- **Verification:** `pnpm exec eslint` on Phase 7 changed source files passes and `pnpm build` passes.
- **Committed in:** `b3aa0fb`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Improved React lint compatibility without changing docs behavior.

## Issues Encountered

None beyond the auto-fixed TOC lint issue.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Documentation routes are ready for sitemap generation and future Bengali translation extraction.

---
*Phase: 07-blog-docs-and-legal*
*Completed: 2026-05-12*
