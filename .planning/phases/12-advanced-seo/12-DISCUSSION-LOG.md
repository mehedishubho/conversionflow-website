# Phase 12: Advanced SEO Controls - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 12-advanced-seo
**Areas discussed:** Redirect Manager UX, AI SEO & llms.txt scope, Image & Performance SEO realism, Page-Level SEO overrides

---

## Redirect Manager UX

| Option | Description | Selected |
|--------|-------------|----------|
| Full table + middleware | Dedicated DB table, search/filter, modal create/edit, CSV import/export, hit counter via proxy.ts | Yes |
| JSON in settings table | Simpler but limited — no hit counter, no search/filter | |
| Config-only (no enforcement) | Full DB table but no middleware integration | |

**User's choice:** Full table + middleware
**Notes:** Recommended option selected. proxy.ts is the project's middleware layer per AGENTS.md.

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal CSV (from, to) | 2-column format, all imported as 301 by default | Yes |
| Full CSV (from, to, type, regex) | 4-column format, requires proper formatting | |

**User's choice:** Minimal CSV (from, to)
**Notes:** Simplest format, prevents errors, type editable after import.

| Option | Description | Selected |
|--------|-------------|----------|
| Server-side counter | Increment hit_count in DB on each redirect match in proxy.ts | Yes |
| No hit counter | Just show redirect rules without tracking hits | |

**User's choice:** Server-side counter

---

## AI SEO & llms.txt Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-generate from site data | Generate llms.txt from site config, features, pricing. Route handler at /llms.txt. Admin preview. | Yes |
| Manual textarea editor | Admin writes full llms.txt content manually | |
| Hybrid (auto + manual override) | Auto-generate as default, manual editing mode available | |

**User's choice:** Auto-generate from site data

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle-based policy rules | 4 boolean toggles: Allow Summarization, Allow Training, Require Attribution, Allow Commercial Use | Yes |
| Rich text policy editor | Full markdown editor for custom AI usage policy | |

**User's choice:** Toggle-based policy rules

---

## Image & Performance SEO Realism

| Option | Description | Selected |
|--------|-------------|----------|
| Config-only toggles | Save to DB as config flags. No real processing. Stats show placeholders. | Yes |
| Real implementation attempt | Try actual WebP, Critical CSS, etc. via build plugins and libraries. | |

**User's choice:** Config-only toggles
**Notes:** Honest approach — avoids fake functionality. Flags ready for future infrastructure.

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholder cards with API note | Show 5 CWV cards with "--" values and note about connecting PageSpeed Insights API | Yes |
| Skip CWV cards entirely | Just show performance toggles without monitoring cards | |

**User's choice:** Placeholder cards with API note

---

## Page-Level SEO Overrides

| Option | Description | Selected |
|--------|-------------|----------|
| Inline on content edit pages | SEO settings on each content item's edit page. Marketing pages use centralized form. | Yes |
| Centralized SEO override page | Single page with dropdown to select page, then edit SEO | |
| Hybrid (overview + inline edit) | Centralized overview + inline editing on content pages | |

**User's choice:** Inline on content edit pages
**Notes:** Blog posts get SEO on /admin/blog/[id]/edit. Marketing pages use centralized form since they lack individual edit pages.

| Option | Description | Selected |
|--------|-------------|----------|
| JSONB column on content table | Add seo_overrides JSONB to blog posts table. Marketing pages in settings table. | Yes |
| Separate SEO overrides table | Polymorphic FK (content_type, content_id) | |
| Settings table (JSON per page) | JSON keyed by page slug in settings | |

**User's choice:** JSONB column on content table

| Option | Description | Selected |
|--------|-------------|----------|
| Simple keyword field only | Store focus keyword, show in preview, skip density calculation | Yes |
| Basic occurrence count | Show keyword appears N times | |
| Skip keyword density (save for later) | Don't include focus keyword in Phase 12 | |

**User's choice:** Simple keyword field only
**Notes:** True density analysis deferred to Phase 13 (analytics feature).

---

## Claude's Discretion

None — all decisions were user-selected from recommended options.

## Deferred Ideas

None — discussion stayed within phase scope.
