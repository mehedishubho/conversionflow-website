---
phase: 11
phase_name: Tracking Pixels & Social SEO
created: 2026-05-21
status: Approved
---

# Phase 11 Context: Tracking Pixels & Social SEO

## Scope

Phase 11 builds 5 admin SEO sub-sections under `/admin/settings/seo/`:
- **Social / OG** (`/social`) — Facebook, Twitter/X, LinkedIn share config with side-by-side preview simulator
- **Meta Pixel & CAPI** (`/meta-pixel`) — Full CAPI management: Pixel ID, token, dataset ID, test events, event mapping, deduplication
- **TikTok** (`/tiktok`) — Pixel ID, Events API token, Advanced Matching with field selection
- **Google Analytics & Ads** (`/google`) — GA4, GTM container ID, Google Ads conversion, enhanced ecommerce, GA summary cards
- **Schema Markup** (`/schema`) — Per-schema-type forms with auto-generation from existing data and JSON-LD preview

**Plus:** Migrate existing 5 basic tracking fields from `admin-tracking.ts` into the new system, integrate orphaned `TrackingScripts` component into locale layout, redesign SEO overview page as a card grid landing page.

**Requirements covered:** SOCL-01 through SOCL-05, META-01 through META-06, TIKT-01 through TIKT-03, GOOG-01 through GOOG-05, SCHM-01 through SCHM-05 (24 requirements)

## Decisions

### D-01: Social Preview Layout — Side-by-side cards

Three card previews rendered side-by-side (Facebook, Twitter/X, LinkedIn). Each card shows the platform icon and a realistic share card preview with actual images when URL is provided.

**Implementation:**
- `SocialPreviewSimulator` client component renders 3 platform-specific preview cards
- Mobile/desktop toggle switch above the cards (shows different image ratios and text truncation)
- Unified form above the preview with all social fields: FB App ID, default share title/description/image, Twitter/X handle, card type, LinkedIn image override
- Preview updates reactively as form fields change (controlled inputs)
- When image URL is provided, `<img>` loads and displays it; otherwise show a placeholder with recommended dimensions

**Why:** Side-by-side gives immediate visual comparison across all platforms. Unified form avoids switching tabs to configure all fields. Actual images make the preview genuinely useful.

### D-02: Tracking Events — Standard event checkboxes

Pre-defined checkbox list of standard events for Meta and TikTok: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Lead. Admin toggles which events fire.

**Implementation:**
- Event checkboxes stored as JSON object in settings key (e.g., `meta_events: {"PageView":true,"ViewContent":true,...}`)
- `TrackingScripts` component reads selected events and only fires enabled ones
- Standard WooCommerce conversion events cover 95% of BD store use cases

**Why:** Checkboxes prevent typos and non-standard events. Standard events are well-documented by Meta and TikTok.

### D-03: TrackingScripts Integration — Locale layout

Move `TrackingScripts` component into `[locale]/layout.tsx` so scripts load on every public marketing page. Add TikTok pixel alongside existing GA4/GTM/FB.

**Implementation:**
- Import `TrackingScripts` in `[locale]/layout.tsx` (inside `<body>`, before or after `ThemeProvider`)
- `TrackingScripts` reads all tracking settings from DB and conditionally renders script tags
- Add TikTok pixel script injection (similar pattern to FB pixel)
- Scripts only render in production (`process.env.NODE_ENV === "production"`)

**Why:** Layout integration ensures tracking is never missed on any page. The component already exists — just needs to be wired in.

### D-04: Advanced Matching — Toggle + field selection

Each tracking platform (Meta, TikTok) gets an Advanced Matching toggle plus checkboxes for which user data fields to include: email, phone, name, city, country.

**Implementation:**
- Settings keys: `meta_advanced_matching` (boolean), `meta_matching_fields` (JSON array), `tiktok_advanced_matching` (boolean), `tiktok_matching_fields` (JSON array)
- Toggle enables/disables; checkboxes appear when enabled
- `TrackingScripts` reads these and configures pixel `init` calls accordingly

**Why:** Granular control over PII sharing is important for privacy-conscious admins. Some fields may not be available for all stores.

### D-05: Migrate Existing Tracking — Absorb into Phase 11 pages

The 5 existing tracking keys (GA4 ID, GTM ID, FB Pixel ID, CAPI token, GSC verification) from `admin-tracking.ts` migrate into the new Phase 11 system. The old `TrackingSettingsForm` and `admin-tracking.ts` are deprecated.

**Implementation:**
- Add the 5 existing keys to the new Phase 11 settings key registry
- Meta page absorbs: `facebook_pixel_id`, `facebook_capi_token`
- Google page absorbs: `google_analytics_id`, `google_tag_manager_id`
- GSC verification stays in Phase 10's Verification page (already there)
- Delete `admin-tracking.ts` after migration
- Replace the old `TrackingSettingsForm` on the SEO overview page with the new card grid

**Why:** Avoids duplicate patterns. One source of truth for all tracking configuration.

### D-06: Schema Markup — Form-based per schema type with auto-generation

Each schema type (Organization, Product, Article, FAQ, HowTo, Review) gets its own card with structured form fields. System auto-generates JSON-LD from existing site data (pricing, page hierarchy, site name) and lets admin override specific fields. Read-only JSON-LD preview shown below each form.

**Implementation:**
- Global schemas (Organization, Website, Breadcrumb): auto-generated from existing site settings, with override fields
- Content schemas (Product, Article, FAQ, HowTo, Review): toggle to enable, form fields for each type
- `seo.ts` enhanced to read schema overrides from DB before generating JSON-LD
- `JsonLd` component already exists — reuse it
- Validation: link to Google Rich Results Test with pre-filled URL
- Auto-generate toggle per schema type (when ON, fills from site data; when OFF, fully manual)

**Why:** Form-based input prevents invalid JSON. Auto-generation reduces setup time. Existing schemas in `seo.ts` provide the foundation.

### D-07: Connection Status — Live API connection test

Each tracking platform gets a live connection test that verifies the configured ID is valid and receiving data. Not just config-check dots — actual API validation.

**Implementation:**
- Meta: Use Graph API to test pixel status (requires app access token)
- Google: Use GA Management API to verify tracking ID
- TikTok: Basic pixel ID format validation + Events API health check
- Status indicators: green checkmark (connected), yellow spinner (testing), red X (error), gray circle (not configured)
- "Test Connection" button per platform

**Why:** Admins need to know if tracking is actually working, not just if an ID was entered. Live tests catch typos and misconfigurations.

### D-08: Event Logging — Simple event log table

Show recent client-side events in a table: timestamp, event name, platform, status (fired/pending). Captured via a lightweight client-side logger.

**Implementation:**
- Client-side event buffer (last 50 events per session, stored in memory)
- Admin-only debug panel showing the event log
- Not persisted to DB — session-scoped for diagnostics
- Table columns: Time, Event, Platform, Status

**Why:** Helps admins verify events are firing correctly without switching to external tools. Session-scoped avoids DB overhead.

### D-09: GA Summary Cards — Real data from GA Reporting API

Show basic GA metrics on the Google settings page: active users (real-time), pageviews today, top pages. Requires GA Reporting API access.

**Implementation:**
- Server action calls GA Reporting API using service account credentials
- Display 3-4 summary cards: Active Users, Pageviews Today, Top Pages, Sessions
- Cache for 5 minutes to avoid API rate limits
- Graceful fallback when API not configured (show "Connect GA to see data")

**Why:** Bringing GA data into the admin dashboard saves context-switching. GOOG-05 specifically requires summary cards.

### D-10: SEO Overview Redesign — Card grid landing page

Replace the old TrackingSettingsForm on `/admin/settings/seo` with a card grid showing all SEO sub-sections with completion status per section.

**Implementation:**
- Grid of cards: General, Verification, Sitemaps, Robots, Social, Meta Pixel, TikTok, Google, Schema
- Each card shows: section name, icon, completion percentage or status dot, link to sub-page
- Reuses existing card pattern from Phase 9 settings landing page

**Why:** After migrating tracking fields to dedicated pages, the overview becomes a navigation hub rather than a form.

### D-11: Empty State Warnings — Warning banner + CTA

Each tracking page shows a yellow/amber warning banner at the top when the primary ID is not configured.

**Implementation:**
- If Pixel ID is empty → "Meta Pixel is not connected. Configure your Pixel ID to start tracking."
- If GA4 ID is empty → "Google Analytics is not connected."
- Banner includes a "Configure Now" link that scrolls to the ID input field
- Banner disappears once the ID is saved

**Why:** Clear actionable guidance prevents admins from thinking tracking is working when it's not.

### D-12: GTM — Container ID only

Google Tag Manager integration is limited to the Container ID field plus an enable/disable toggle. Admins manage tags and events inside GTM's own UI.

**Why:** GTM is a complex tool with its own management interface. Deep API integration is a separate project. Container ID + toggle covers the 95% use case.

### D-13: CAPI — Full management

Meta Conversions API gets full management: CAPI token, dataset ID, test event code, event-to-pixel mapping, deduplication toggle, and a "Send Test Event" button.

**Implementation:**
- Fields: CAPI token, dataset ID, test event code
- Toggles: event deduplication, test mode
- Test Event button: fires a test `Purchase` event to verify CAPI connection
- Event mapping section: which standard events send via CAPI vs browser pixel

**Why:** CAPI is critical for BD stores where ad blockers and browser restrictions reduce pixel effectiveness. Full control in one place.

## Codebase Context

### Existing patterns to reuse
- **Server action pattern:** `src/app/(admin)/actions/admin-seo.ts` — `requireAdmin()`, key array, `get`/`save` functions, `createAuditLog()`
- **Settings key registry:** `src/lib/seo-keys.ts` — `as const` key array with slice groups
- **Form component pattern:** `src/components/admin/TrackingSettingsForm.tsx` — `useState` + `useTransition`, `ComponentCard`, `InputField`
- **SEO form components:** `src/components/admin/seo/` — GeneralSeoForm, VerificationForm, SitemapForm, RobotsEditor
- **JSON-LD component:** `src/components/seo/JsonLd.tsx` — renders `<script type="application/ld+json">`
- **Schema functions:** `src/lib/seo.ts` — `organizationSchema()`, `websiteSchema()`, `productSchema()`, `breadcrumbSchema()`
- **TrackingScripts component:** `src/components/layout/TrackingScripts.tsx` — GA4, GTM, FB Pixel script injection (orphaned, needs integration)
- **Tracking helper:** `src/lib/tracking.ts` — `getTrackingSettings()` for public-side reads

### Files to modify
- `src/app/[locale]/layout.tsx` — Add `TrackingScripts` import and rendering
- `src/components/layout/TrackingScripts.tsx` — Add TikTok pixel, read event selections from DB
- `src/lib/seo.ts` — Read schema overrides from DB for JSON-LD generation
- `src/lib/tracking.ts` — Expand with new tracking keys
- `src/app/(admin)/admin/settings/seo/page.tsx` — Replace TrackingSettingsForm with card grid landing page
- `src/data/dashboard-nav.ts` — No changes needed (SEO nav already in settings sub-nav)

### Files to create
- `src/app/(admin)/actions/admin-tracking-v2.ts` — New server actions for all Phase 11 tracking settings (absorbs admin-tracking.ts keys)
- `src/components/admin/seo/SocialPreviewSimulator.tsx` — Side-by-side social share previews with mobile/desktop toggle
- `src/components/admin/seo/MetaPixelForm.tsx` — Full CAPI management form
- `src/components/admin/seo/TikTokForm.tsx` — TikTok pixel + Events API form
- `src/components/admin/seo/GoogleTrackingForm.tsx` — GA4 + GTM + Google Ads form with GA summary cards
- `src/components/admin/seo/SchemaForm.tsx` — Per-schema-type forms with JSON-LD preview
- `src/components/admin/seo/EventLogPanel.tsx` — Session-scoped event log table
- `src/components/admin/seo/SeoOverviewCards.tsx` — Card grid landing page for SEO overview
- `src/lib/tracking-keys.ts` — Tracking settings key registry (replaces keys in admin-tracking.ts)

### Files to deprecate/delete after migration
- `src/app/(admin)/actions/admin-tracking.ts` — Merged into admin-tracking-v2.ts
- `src/components/admin/TrackingSettingsForm.tsx` — Replaced by dedicated Phase 11 forms
- `src/lib/tracking.ts` — Expanded into new tracking module

### Settings keys to add (~30 new)

| Key | Type | Default | Section |
|-----|------|---------|---------|
| `seo_fb_app_id` | string | "" | Social |
| `seo_share_title` | string | "" | Social |
| `seo_share_description` | string | "" | Social |
| `seo_share_image` | string | "" | Social |
| `seo_twitter_handle` | string | "" | Social |
| `seo_twitter_card_type` | string | "summary_large_image" | Social |
| `seo_linkedin_image` | string | "" | Social |
| `meta_pixel_id` | string | "" | Meta Pixel |
| `meta_capi_token` | string | "" | Meta Pixel |
| `meta_dataset_id` | string | "" | Meta Pixel |
| `meta_test_event_code` | string | "" | Meta Pixel |
| `meta_advanced_matching` | boolean | false | Meta Pixel |
| `meta_matching_fields` | json | "[]" | Meta Pixel |
| `meta_events` | json | "{}" | Meta Pixel |
| `meta_event_deduplication` | boolean | false | Meta Pixel |
| `tiktok_pixel_id` | string | "" | TikTok |
| `tiktok_events_token` | string | "" | TikTok |
| `tiktok_advanced_matching` | boolean | false | TikTok |
| `tiktok_matching_fields` | json | "[]" | TikTok |
| `tiktok_server_side` | boolean | false | TikTok |
| `tiktok_events` | json | "{}" | TikTok |
| `google_analytics_id` | string | "" | Google (migrate) |
| `google_tag_manager_id` | string | "" | Google (migrate) |
| `google_ads_conversion_id` | string | "" | Google |
| `google_ads_conversion_label` | string | "" | Google |
| `google_server_side` | boolean | false | Google |
| `google_enhanced_ecommerce` | boolean | false | Google |
| `seo_schema_auto_generate` | boolean | true | Schema |
| `seo_schema_overrides` | json | "{}" | Schema |
| `seo_schema_types_enabled` | json | "{}" | Schema |

## Scope Boundaries

**In scope:**
- 5 SEO sub-section pages with full forms and server actions
- Social preview simulator (Facebook, Twitter/X, LinkedIn)
- Tracking event selection (standard events checkboxes)
- TrackingScripts integration into locale layout
- Advanced Matching with field selection (Meta + TikTok)
- Full CAPI management on Meta Pixel page
- GA summary cards via Reporting API
- Schema markup configuration with auto-generation and JSON-LD preview
- Event log panel (session-scoped diagnostics)
- SEO overview card grid landing page
- Empty state warning banners
- Migration of existing tracking settings into new system

**Out of scope (deferred to later phases):**
- Redirect Manager (Phase 12)
- AI SEO controls (Phase 12)
- Image SEO (Phase 12)
- Performance SEO (Phase 12)
- Page-level SEO overrides (Phase 12)
- SEO Analytics dashboard (Phase 13)
- WhatsApp/Email notification integration for tracking alerts
- A/B testing for social sharing
