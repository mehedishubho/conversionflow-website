---
phase: 10-core-seo
plan: 04
subsystem: seo
tags: [seo, robots-txt, ai-bots, visual-editor, raw-editor, crawl-presets, db-aware]

# Dependency graph
requires:
  - phase: 10-core-seo
    plan: 01
    provides: "admin-seo.ts server actions, ROBOTS_SEO_KEYS, getSeoSettings, saveSeoSettings"
provides:
  - "AiBotCards component with 8 individual AI bot toggle cards"
  - "RobotsEditor component with visual + raw dual-mode tabs, crawl presets, and live preview"
  - "DB-aware robots.ts reading seo_robots_txt from settings table with static fallback"
  - "Robots.txt settings page at /admin/settings/seo/robots"
affects: [robots-txt-generation, ai-bot-controls, seo-robots-page]

# Tech tracking
tech-stack:
  added: []
patterns: ["Dual-mode editor with bidirectional tab sync (visual <-> raw)", "AI bot toggle cards with JSON storage in settings key", "Crawl presets applying coordinated state changes across multiple fields", "DB-aware route handler parsing raw robots.txt content to MetadataRoute.Robots format"]

key-files:
  created:
    - src/components/admin/seo/AiBotCards.tsx
    - src/components/admin/seo/RobotsEditor.tsx
  modified:
    - src/app/(admin)/admin/settings/seo/robots/page.tsx
    - src/app/robots.ts

key-decisions:
  - "RobotsEditor generates robots.txt from structured visual state; raw mode edits the raw string directly; switching tabs syncs bidirectionally"
  - "AI bots stored as JSON in seo_ai_bots settings key with boolean allow/block per bot"
  - "Crawl presets (allow_all, block_ai, block_all, custom) update multiple form fields and bot state atomically"
  - "robots.ts parses raw DB content into MetadataRoute.Robots format with try/catch fallback to hardcoded default"

patterns-established:
  - "Dual-mode editor pattern: tab buttons with border-bottom highlight, bidirectional state sync on tab switch"
  - "Crawl preset pattern: button grid with active state styling, coordinated multi-field updates"
  - "Live preview pattern: separate ComponentCard showing read-only generated content with copy button"

requirements-completed: [ROBT-01, ROBT-02, ROBT-03, ROBT-04, ROBT-05]

# Metrics
duration: 4min
completed: 2026-05-20
---

# Phase 10 Plan 04: Robots.txt Editor Summary

**Dual-mode Robots.txt Editor with visual rule builder and raw monospace editor, 8 AI bot toggle cards (GPTBot, ClaudeBot, PerplexityBot, etc.), 4 crawl presets, live preview with copy, and DB-aware robots.ts route handler with static fallback**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-20T14:10:58Z
- **Completed:** 2026-05-20T14:15:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created AiBotCards component with 8 individual AI bot toggle cards in a 2-column grid, each showing bot name, organization, description, and allow/block Switch
- Created RobotsEditor with dual-tab interface (visual mode with structured form + raw mode with monospace textarea), bidirectional tab sync, 4 crawl presets, AI bot integration, live preview panel with copy button
- Replaced robots.txt placeholder page with server component loading settings from DB via getSeoSettings
- Made robots.ts async and DB-aware: reads seo_robots_txt from settings table, parses raw content into MetadataRoute.Robots format, falls back to hardcoded default on any failure

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AiBotCards component** - `1ac3d91` (feat)
2. **Task 2: Create RobotsEditor with dual-mode editing and update robots page + robots.ts** - `72eeaf6` (feat)

## Files Created/Modified

- `src/components/admin/seo/AiBotCards.tsx` - 8 AI bot toggle cards with name, org, description, and Switch toggle in 2-column grid
- `src/components/admin/seo/RobotsEditor.tsx` - Dual-mode robots.txt editor with visual tab (crawl presets, user-agent, allow/disallow paths, crawl delay, sitemap URL, AI bot controls), raw tab (monospace textarea), live preview with copy
- `src/app/(admin)/admin/settings/seo/robots/page.tsx` - Server component replacing Phase 9 placeholder, loads data via getSeoSettings
- `src/app/robots.ts` - Async DB-aware route handler reading seo_robots_txt from settings table with parseRobotsContent utility and hardcoded fallback

## Decisions Made

- RobotsEditor generates robots.txt from visual form state via generateRobotsTxt(); switching to raw tab serializes visual state into raw text; switching back parses raw text into visual fields
- AI bots stored as JSON boolean map in seo_ai_bots settings key; blocked bots generate separate User-agent/Disallow blocks in robots.txt output
- Crawl presets apply coordinated atomic updates across allow/disallow paths and bot states
- robots.ts uses a dedicated parseRobotsContent() utility to convert raw text into MetadataRoute.Robots format, handling multiple user-agent blocks for AI bot rules
- Live preview panel renders as read-only pre element with monospace font and a copy-to-clipboard button

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 10 Core SEO Configuration is now fully complete (all 4 plans executed)
- All 22 SEO requirements covered: GSEO-01 through GSEO-07, VERF-01 through VERF-05, SITM-01 through SITM-05, ROBT-01 through ROBT-05
- robots.ts and sitemap.ts both DB-aware with static fallbacks
- All 4 SEO sub-section pages functional: General, Verification, Sitemaps, Robots

---
*Phase: 10-core-seo*
*Completed: 2026-05-20*

## Self-Check: PASSED

- FOUND: src/components/admin/seo/AiBotCards.tsx
- FOUND: src/components/admin/seo/RobotsEditor.tsx
- FOUND: src/app/(admin)/admin/settings/seo/robots/page.tsx
- FOUND: src/app/robots.ts
- FOUND: commit 1ac3d91 (Task 1)
- FOUND: commit 72eeaf6 (Task 2)
