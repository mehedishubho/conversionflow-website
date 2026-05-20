---
phase: 10
phase_name: Core SEO Configuration
created: 2026-05-20
status: Approved
---

# Phase 10 Context: Core SEO Configuration

## Scope

Phase 10 builds the first 4 SEO sub-sections under `/admin/settings/seo/`:
- **General SEO** (`/general`) — meta title, description, keywords, canonical, separator, robots directive, OG image
- **Search Verification** (`/verification`) — Google, Bing, Yandex, Baidu, Pinterest meta tag verification
- **Sitemaps** (`/sitemaps`) — toggle-based sitemap configuration
- **Robots.txt** (`/robots`) — visual + raw dual-mode robots.txt editor

**Requirements covered:** GSEO-01 through GSEO-07, VERF-01 through VERF-05, SITM-01 through SITM-05, ROBT-01 through ROBT-05 (22 requirements)

## Decisions

### D-01: SEO Library Integration — DB overrides hardcoded

`seo.ts` reads settings from DB first; falls back to hardcoded static values when no DB row exists.

**Implementation:**
- `seo.ts` functions (`pageSeo`, `createPageMetadata`, etc.) call `getSettings(keys[])` at the top
- If a key returns null/empty, use the current hardcoded default
- No new DB table needed — use existing `settings` key-value table
- Settings keys: `seo_title`, `seo_description`, `seo_keywords`, `seo_canonical_url`, `seo_separator`, `seo_robots_default`, `seo_og_image`, `seo_auto_meta`

**Why:** Preserves current behavior as fallback, enables admin overrides without touching code. Zero risk to existing pages.

### D-02: SERP Preview — Google snippet only

Single Google SERP preview showing how the site homepage appears in search results. Character counters for meta title (50-60 recommended) and meta description (150-160 recommended).

**Implementation:**
- Client component renders a Google-style preview card (blue title, green URL, gray description)
- Reads form field values in real-time (controlled inputs)
- Character count badges change color: green (optimal) → yellow (acceptable) → red (too long/short)
- No mobile/tab/news/other SERP variants

**Why:** Google snippet covers 90%+ of BD search traffic. Multiple SERP previews add UI complexity without proportional value.

### D-03: Robots.txt Editor — Visual + Raw dual mode

Tabbed interface with two modes:
- **Visual tab:** Grouped directives with toggle cards per section (User-agents, Sitemap, Crawl-delay, Disallow paths)
- **Raw tab:** Monospace textarea showing actual robots.txt content, editable directly

**Implementation:**
- Visual mode generates robots.txt from structured form state
- Raw mode edits the raw string directly
- Switching between tabs syncs state bidirectionally
- Save button writes final robots.txt content to `settings` table as `seo_robots_txt` key
- Route handler `/robots.txt` reads from DB, falls back to current `public/robots.txt`

**Why:** Visual mode prevents syntax errors for non-technical admins. Raw mode provides escape hatch for advanced users.

### D-04: AI Bot Controls — Individual toggle cards

Each AI bot gets its own card with: bot name, description, current status (Allowed/Blocked), toggle switch.

**Default bots:**
- GPTBot (OpenAI)
- ChatGPT-User (OpenAI)
- ClaudeBot (Anthropic)
- PerplexityBot
- Google-Extended (Gemini)
- Bytespider (TikTok/ByteDance)
- FacebookBot (Meta)
- Applebot-Extended

**Implementation:**
- Stored as JSON object in `seo_ai_bots` settings key: `{ "GPTBot": true, "ClaudeBot": false, ... }`
- Toggle generates appropriate `User-agent` / Disallow directives in robots.txt
- Visual robots.txt mode shows AI bot section with these toggles integrated

**Why:** BD site owners are increasingly aware of AI training on their content. Individual cards are more intuitive than a JSON textarea.

### D-05: Sitemap Management — Toggle-based config

Settings form with toggle switches for sitemap configuration:
- Enable/disable sitemap generation (master toggle)
- Content type toggles: Pages, Blog posts, Documentation, Landing pages
- Exclude patterns textarea (one URL pattern per line)
- Sitemap frequency selector (daily, weekly, monthly)
- Regenerate sitemap button (triggers regeneration on save)

**Implementation:**
- Settings keys: `seo_sitemap_enabled`, `seo_sitemap_pages`, `seo_sitemap_blog`, `seo_sitemap_docs`, `seo_sitemap_landing`, `seo_sitemap_excludes`, `seo_sitemap_frequency`
- Dynamic route handler `src/app/sitemap.ts` (already exists) reads settings from DB
- Current static sitemap generation falls back when no DB overrides

**Why:** Toggle-based config is simpler than a full priority/frequency matrix. Content type toggles cover the 4 content types in this codebase.

### D-06: SEO Score — Simple filled count

Non-interactive metric showing: filled fields count / total fields. Displayed as a progress bar with percentage.

**Implementation:**
- Count non-empty fields from the SEO settings group (general + verification + sitemap + robots)
- Total: all configurable fields across all 4 sub-sections
- Filled: fields with non-empty DB values
- Progress bar color: red (<50%), yellow (50-79%), green (>=80%)

**Why:** Avoids subjective scoring algorithms. Admin sees at a glance how many fields they've configured. Non-judgmental — just a count.

### D-07: Robots.txt & Sitemap Generation — Dynamic routes

- `/robots.txt` served by a Next.js route handler (`src/app/robots.ts`) that reads `seo_robots_txt` from DB, falls back to current static config
- `/sitemap.xml` served by existing `src/app/sitemap.ts` enhanced to read toggle settings from DB
- Both route handlers are server components that query DB on each request (with appropriate caching)

**Why:** Next.js route handlers are the canonical way to generate these files. Reading from DB makes admin changes take effect immediately.

### D-08: Verification Status — Dots with expand

Each search engine (Google, Bing, Yandex, Baidu, Pinterest) shows:
- Green checkmark dot if verification tag is configured
- Gray dot if not configured
- Expand to show the meta tag name + value with copy button

**Implementation:**
- Settings keys: `seo_verify_google`, `seo_verify_bing`, `seo_verify_yandex`, `seo_verify_baidu`, `seo_verify_pinterest`
- Verification page lists all 5 engines as cards
- Each card shows input field for verification code, status dot, and a "Verify" info text explaining the process
- No actual API verification — just storing the meta tag content

**Why:** Dots provide instant visual status. Expand-on-click keeps the page clean. No external API calls needed — admins paste the verification code from each search engine's console.

## Codebase Context

### Existing patterns to reuse
- **Server action pattern:** `src/app/(admin)/actions/admin-tracking.ts` — `requireAdmin()`, key array, `get`/`save` functions, `createAuditLog()`
- **Settings form pattern:** `src/components/admin/TrackingSettingsForm.tsx` — client component with `initialData` prop, `useTransition`, `isPending` loading
- **Settings key-value table:** `src/lib/db/schema.ts` — `settings` table (key PK, value text, updated_at timestamp)
- **Layout wrapper:** `src/app/(admin)/admin/settings/layout.tsx` — auth guard + SettingsShell
- **UI components:** `ComponentCard`, `InputField`, `Switch` from dashboard components
- **CSS utilities:** `src/styles/dashboard.css` — settings nav styling

### Files to modify
- `src/lib/seo.ts` — Add DB read with hardcoded fallback (D-01)
- `src/app/sitemap.ts` — Enhanced to read sitemap toggles from DB (D-05, D-07)
- `src/app/robots.ts` or `public/robots.txt` — Dynamic robots.txt from DB (D-03, D-07)

### Files to create
- `src/app/(admin)/actions/admin-seo.ts` — Server actions for all SEO settings
- `src/app/(admin)/admin/settings/seo/general/page.tsx` — Replace placeholder with real General SEO page
- `src/app/(admin)/admin/settings/seo/verification/page.tsx` — Replace placeholder with verification page
- `src/app/(admin)/admin/settings/seo/sitemaps/page.tsx` — Replace placeholder with sitemap config page
- `src/app/(admin)/admin/settings/seo/robots/page.tsx` — Replace placeholder with robots.txt editor
- `src/components/admin/seo/` — Form components: GeneralSeoForm, VerificationForm, SitemapForm, RobotsEditor, SerpPreview, SeoScore

### Settings keys to add

| Key | Type | Default | Section |
|-----|------|---------|---------|
| `seo_title` | string | "ConversionFlow" | General |
| `seo_description` | string | (current hardcoded) | General |
| `seo_keywords` | string | "" | General |
| `seo_canonical_url` | string | "" | General |
| `seo_separator` | string | "\|" | General |
| `seo_robots_default` | string | "index, follow" | General |
| `seo_og_image` | string | "" | General |
| `seo_auto_meta` | boolean | false | General |
| `seo_verify_google` | string | "" | Verification |
| `seo_verify_bing` | string | "" | Verification |
| `seo_verify_yandex` | string | "" | Verification |
| `seo_verify_baidu` | string | "" | Verification |
| `seo_verify_pinterest` | string | "" | Verification |
| `seo_sitemap_enabled` | boolean | true | Sitemaps |
| `seo_sitemap_pages` | boolean | true | Sitemaps |
| `seo_sitemap_blog` | boolean | true | Sitemaps |
| `seo_sitemap_docs` | boolean | true | Sitemaps |
| `seo_sitemap_landing` | boolean | false | Sitemaps |
| `seo_sitemap_excludes` | string | "" | Sitemaps |
| `seo_sitemap_frequency` | string | "weekly" | Sitemaps |
| `seo_robots_txt` | string | (current robots.txt) | Robots |
| `seo_ai_bots` | json | (all allowed) | Robots |

## Scope Boundaries

**In scope:**
- 4 SEO sub-section pages with full forms and server actions
- seo.ts DB integration with hardcoded fallback
- Dynamic robots.txt and sitemap.xml generation
- SERP preview component (Google only)
- SEO score (simple filled/total count)
- AI bot toggle cards

**Out of scope (deferred to later phases):**
- Open Graph & Social SEO settings (Phase 11)
- Meta Pixel & CAPI configuration (Phase 11)
- TikTok tracking (Phase 11)
- Google Analytics & Ads (Phase 11)
- Schema Markup editor (Phase 11)
- Redirect Manager (Phase 12)
- Image SEO (Phase 12)
- Performance SEO (Phase 12)
- Page-level SEO overrides (Phase 12)
- SEO Analytics dashboard (Phase 13)
