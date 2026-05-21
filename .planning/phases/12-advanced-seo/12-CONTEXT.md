---
phase: 12
phase_name: Advanced SEO Controls
created: 2026-05-21
status: Approved
---

# Phase 12 Context: Advanced SEO Controls

## Scope

Phase 12 builds 5 advanced SEO admin sub-sections under `/admin/settings/seo/`:
- **Redirect Manager** (`/redirects`) — Full redirect table with 301/302/regex support, search/filter, hit counter, bulk CSV import/export
- **AI SEO & LLM Controls** (`/ai-seo`) — AI crawler toggles (extends Phase 10 AiBotCards), llms.txt generation, AI content usage rules
- **Image SEO** (`/image-seo`) — Config-only toggles for auto ALT, WebP, lazy loading, compression with image statistics cards
- **Performance SEO** (`/performance`) — Config-only toggles for Critical CSS, JS defer, minification, CDN URL, cache settings, placeholder CWV cards
- **Page-Level SEO** — Per-content-item SEO overrides stored inline on content edit pages (not a centralized settings page)

**Requirements covered:** RDIR-01 through RDIR-05, AISE-01 through AISE-05, IMGS-01 through IMGS-05, PERF-01 through PERF-06, PLVL-01 through PLVL-05 (26 requirements)

## Decisions

### D-01: Redirect Storage — Dedicated DB table + middleware enforcement

Full `redirects` table with columns: id, from_url, to_url, type (301/302), is_regex, hit_count, status (active/inactive), created_at, updated_at. Redirects enforced via proxy.ts middleware that matches incoming requests against active rules.

**Why:** Dedicated table supports search, filter, hit counting, and scales to thousands of rules. Middleware enforcement in proxy.ts is the project's routing layer (per AGENTS.md — use proxy.ts, not middleware.ts).

### D-02: Redirect CSV — Minimal 2-column format

CSV import uses `from_url,to_url` format only. All imported as 301 by default. Admin can edit type after import.

**Why:** 2-column CSV is universally understood and prevents formatting errors. Most bulk redirects are 301 — type can be adjusted individually.

### D-03: Hit Counter — Server-side increment

Each time proxy.ts matches and executes a redirect, it increments `hit_count` in the redirects table. Simple `UPDATE redirects SET hit_count = hit_count + 1 WHERE id = ?`.

**Why:** Server-side counting is accurate for this deployment. No client-side tracking needed — redirects happen at the server level.

### D-04: llms.txt — Auto-generated from site data

Generate llms.txt content from existing site configuration: site name, description, main features (from pageSeo), pricing summary, support URL. Served as a Next.js route handler at `/llms.txt`. Admin can preview the generated content on the AI SEO settings page.

**Why:** Auto-generation from existing data means llms.txt is always up-to-date. Route handler ensures it's served at the standard path. Admin preview gives visibility without manual editing.

### D-05: AI Content Usage Rules — Toggle-based policy

Simple boolean toggle rules: Allow Summarization, Allow Training, Require Attribution, Allow Commercial Use. Stored as JSON in settings key `seo_ai_usage_rules`. Displayed as a static policy section.

**Why:** Toggle-based rules are clear and actionable. A full markdown editor is overkill for 4 policy decisions. Booleans are easy to display and enforce programmatically.

### D-06: Image & Performance SEO — Config-only toggles (no real processing)

Image SEO toggles (auto ALT, WebP conversion, lazy loading, compression) and Performance SEO toggles (Critical CSS, JS defer, minification) save to DB settings only. No actual server-side processing happens — these are configuration flags for future infrastructure integration.

Image statistics cards show placeholder values (total images: "--", optimized: "--", savings: "--") with a note that stats require server-side integration.

**Why:** Honest approach — avoids fake functionality. Real image optimization and CSS extraction require build plugins, CDN infrastructure, or external services not currently in the stack. Saving config flags now means the admin UI is complete and ready when infrastructure catches up.

### D-07: Core Web Vitals — Placeholder cards with API note

Show 5 CWV cards (LCP, CLS, INP, TTFB, Overall Score) with placeholder "--" values. Include a note: "Connect Google PageSpeed Insights API for real monitoring data." Cards display the metric names and descriptions so admin knows what each measures.

**Why:** Shows admin what monitoring will look like. Placeholder state is honest. The note provides a clear path to activation without over-promising.

### D-08: Page-Level SEO — Inline on content edit pages, not centralized

Page-level SEO overrides live on each content item's own edit page. Blog posts get an SEO section/tab on `/admin/blog/[id]/edit`. Marketing pages get SEO overrides configurable from a centralized page-level SEO admin page since they don't have individual edit pages.

**Why:** SEO settings belong where content is managed — admin edits a blog post and its SEO in the same place. Marketing pages (home, features, pricing, etc.) don't have individual edit pages, so they use a selector-based centralized form.

### D-09: Page-Level Storage — JSONB column on content table

Add `seo_overrides` JSONB column to content tables (blog posts, pages). The column stores: title, description, canonical_url, focus_keyword, robots (index/follow), og_image, schema_type. For marketing pages without DB rows, overrides stored in the settings table keyed by page slug.

**Why:** JSONB on content table co-locates SEO with content — simple queries, no joins, easy to include in metadata generation. Marketing pages are few and static, so settings table works fine.

### D-10: Focus Keyword — Simple field, no density analysis

Store the focus keyword as a plain text field per page. Show it in a preview but don't attempt density analysis (requires full content parsing, word counting, and percentage calculation — too complex for config UI).

**Why:** Focus keyword helps admin think about SEO intent. True density analysis is an analytics feature (Phase 13), not a settings feature. Simple field provides value without complexity.

## Codebase Context

### Reusable Assets
- **AiBotCards.tsx**: 8 AI bot toggle cards from Phase 10 — reuse and extend for AI SEO page
- **SEO key registry pattern**: `seo-keys.ts` with slice exports — add Phase 12 keys
- **Server action pattern**: `admin-seo.ts` with requireAdmin, get/save, audit log — extend with redirect CRUD
- **Form components**: ComponentCard, InputField, Switch, Button — established UI patterns
- **seo.ts**: createPageMetadata reads DB overrides — extend for page-level overrides
- **schema-helpers.ts**: Pure schema generators for JSON-LD — reuse for page-level schema
- **RobotsEditor.tsx**: Visual/raw editor with crawl presets — reference for redirect editor UX
- **proxy.ts**: Current routing middleware — add redirect matching logic

### Integration Points
- `src/proxy.ts` — Add redirect matching before auth/i18n checks
- `src/lib/db/schema.ts` — Add `redirects` table and `seo_overrides` columns to content tables
- `src/app/(admin)/actions/admin-seo.ts` — Add redirect CRUD actions and Phase 12 settings
- `src/lib/seo.ts` — Read page-level overrides for metadata generation
- `src/lib/seo-keys.ts` — Add Phase 12 settings keys
- `/llms.txt` — New route handler for llms.txt generation
- 4 placeholder pages already exist (redirects, ai-seo, image-seo, performance)

### Established Patterns
- **Settings key registry**: `as const` array → typed slice exports → TrackingSettingsData interface
- **Form component**: `"use client"` + useState + useTransition + ComponentCard wrapper
- **Server action**: requireAdmin() guard → DB read/write → createAuditLog() → return result
- **DB table**: Drizzle ORM with pgTable, serial id, timestamps, indexes

## Canonical References

No external specs — requirements fully captured in decisions above and ROADMAP.md success criteria.

## Specific Ideas

No specific requirements — open to standard approaches per established codebase patterns.

## Deferred Ideas

None — discussion stayed within phase scope.
