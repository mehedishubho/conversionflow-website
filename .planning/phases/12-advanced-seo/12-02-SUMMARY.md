---
phase: 12-advanced-seo
plan: 02
subsystem: seo
tags: [llms-txt, ai-seo, bot-controls, usage-rules, route-handler]

# Dependency graph
requires:
  - phase: 12-01
    provides: "AI_SEO_KEYS slice (seo_ai_usage_rules, seo_llms_txt_custom) in seo-keys.ts"
  - phase: 10-core-seo
    provides: "AiBotCards component, seo_ai_bots key, getSeoSettings/saveSeoSettings actions"
provides:
  - "AiUsageRulesForm component with 4 boolean toggle rules"
  - "LlmsTxtPreview component with copy button and route fetch"
  - "llms.txt route handler auto-generating from pageSeo data"
  - "AI SEO page wiring bot controls, usage rules, and llms.txt preview"
affects: [12-advanced-seo, seo-overview]

# Tech tracking
tech-stack:
  added: []
  patterns: [llms-txt-auto-generation, toggle-rules-json-storage]

key-files:
  created:
    - src/components/admin/seo/AiUsageRulesForm.tsx
    - src/components/admin/seo/LlmsTxtPreview.tsx
    - src/app/llms.txt/route.ts
  modified:
    - src/app/(admin)/admin/settings/seo/ai-seo/page.tsx

key-decisions:
  - "llms.txt auto-generates from pageSeo data with optional custom content from settings (D-04)"
  - "AI usage rules stored as JSON with 4 boolean toggles (D-05)"
  - "Each section on AI SEO page saves independently to avoid partial state issues"

patterns-established:
  - "Self-contained form components that load their own data (AiUsageRulesForm, LlmsTxtPreview)"
  - "llms.txt route handler with DB try/catch fallback to minimal content"

requirements-completed: [AISE-01, AISE-02, AISE-03, AISE-04, AISE-05]

# Metrics
duration: 8min
completed: 2026-05-21
---

# Phase 12 Plan 02: AI SEO & LLM Controls Summary

**AI bot toggle cards reuse, 4-rule usage policy toggles, and auto-generated llms.txt route handler from pageSeo data**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-21T04:06:47Z
- **Completed:** 2026-05-21T04:14:54Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- AiUsageRulesForm with 4 boolean toggles (summarization, training, attribution, commercial use) saved as JSON
- llms.txt route handler auto-generates from pageSeo data per AnswerDotAI specification with custom content support
- LlmsTxtPreview fetches live from route handler with copy-to-clipboard and open-in-new-tab
- AI SEO page wires AiBotCards (reused from Phase 10), AiUsageRulesForm, and LlmsTxtPreview with independent save per section

## Task Commits

Each task was committed atomically:

1. **Task 1: Add AI SEO keys, server action support, llms.txt route handler, and usage rules form** - `653f45f` (feat)
2. **Task 2: Build AI SEO page with bot cards, usage rules, llms.txt preview** - `1850426` (feat)

## Files Created/Modified
- `src/components/admin/seo/AiUsageRulesForm.tsx` - Client component with 4 toggle switches for AI content usage policy
- `src/app/llms.txt/route.ts` - GET route handler generating llms.txt from pageSeo data with DB fallback
- `src/components/admin/seo/LlmsTxtPreview.tsx` - Client component fetching and displaying llms.txt with copy button
- `src/app/(admin)/admin/settings/seo/ai-seo/page.tsx` - Replaced placeholder with full AI SEO page wiring all three sections

## Decisions Made
- Each section (bot controls, usage rules, llms.txt preview) saves independently to avoid partial state issues
- llms.txt route uses text/plain content type with Cache-Control header (1hr for success, 5min for fallback)
- Custom content from `seo_llms_txt_custom` setting appended at end of auto-generated llms.txt
- LlmsTxtPreview fetches from the live route handler rather than duplicating generation logic

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing build failures from missing `pricingTiers` export in blog components (unrelated to this plan, out of scope)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- AI SEO controls complete, ready for Plan 12-03 (Image SEO)
- llms.txt route publicly accessible at /llms.txt
- All AI_SEO_KEYS from Plan 12-01 are now wired to UI components

## Self-Check: PASSED

- All 4 created/modified files verified to exist on disk
- Both commit hashes verified in git log (653f45f, 1850426)
- No build errors from plan files (pre-existing pricingTiers issue is out of scope)

---
*Phase: 12-advanced-seo*
*Completed: 2026-05-21*
