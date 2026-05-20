# Phase 11: Tracking Pixels & Social SEO - Research

**Researched:** 2026-05-21
**Domain:** Tracking pixels, social SEO, structured data, Meta CAPI, TikTok Events API, GA4
**Confidence:** HIGH

## Summary

Phase 11 builds 5 admin SEO sub-sections (Social/OG, Meta Pixel & CAPI, TikTok, Google Analytics & Ads, Schema Markup) plus migrates 5 existing tracking keys from `admin-tracking.ts`, integrates the orphaned `TrackingScripts` component into the locale layout, and redesigns the SEO overview page as a card grid landing page. The phase covers 24 requirements (SOCL-01 through SCHM-05) across social sharing, tracking pixels, analytics, and structured data.

The codebase already has the full server action pattern (`requireAdmin`, `get`/`save` with key validation, `createAuditLog`), a key-value settings table (`settings` with `key` PK and `value` text), route placeholders for all 5 Phase 11 pages with "Coming in Phase 11" stubs, and existing `TrackingScripts` component with GA4/GTM/FB pixel injection. The `seo.ts` module already generates `Organization`, `WebSite`, `SoftwareApplication`, and `BreadcrumbList` schemas from hardcoded data plus DB overrides.

**Primary recommendation:** Extend the existing `seo-keys.ts` pattern to create `tracking-keys.ts` with slice groups for each tracking sub-section. Reuse the `admin-seo.ts` server action pattern (requireAdmin + key validation + upsert + audit log) for `admin-tracking-v2.ts`. All form components follow the `GeneralSeoForm.tsx` pattern (`useState` + `useTransition` + `ComponentCard` + `InputField` + `Switch` + `Button`).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Social Preview Layout -- Side-by-side cards (Facebook, Twitter/X, LinkedIn) with mobile/desktop toggle, unified form above previews
- **D-02:** Tracking Events -- Standard event checkboxes (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Lead) stored as JSON in settings key
- **D-03:** TrackingScripts Integration -- Move into `[locale]/layout.tsx`, add TikTok pixel, production-only rendering
- **D-04:** Advanced Matching -- Toggle + field selection checkboxes (email, phone, name, city, country) per platform
- **D-05:** Migrate Existing Tracking -- Absorb 5 existing keys from `admin-tracking.ts` into new Phase 11 system, delete old file
- **D-06:** Schema Markup -- Form-based per schema type with auto-generation from site data, JSON-LD preview below each form
- **D-07:** Connection Status -- Live API connection test per platform (Meta Graph API, GA Management API, TikTok format validation)
- **D-08:** Event Logging -- Session-scoped client-side event buffer (last 50 events), admin-only debug panel
- **D-09:** GA Summary Cards -- Real data from GA4 Data API (NOT deprecated Reporting API v4), cached 5 minutes
- **D-10:** SEO Overview Redesign -- Card grid landing page replacing old `TrackingSettingsForm`
- **D-11:** Empty State Warnings -- Yellow/amber warning banner when primary ID not configured, with "Configure Now" scroll link
- **D-12:** GTM -- Container ID only + enable/disable toggle (no deep API integration)
- **D-13:** CAPI -- Full management: token, dataset ID, test event code, deduplication toggle, "Send Test Event" button

### Claude's Discretion

None explicitly stated -- all 13 decisions are locked.

### Deferred Ideas (OUT OF SCOPE)

- Redirect Manager (Phase 12)
- AI SEO controls (Phase 12)
- Image SEO (Phase 12)
- Performance SEO (Phase 12)
- Page-level SEO overrides (Phase 12)
- SEO Analytics dashboard (Phase 13)
- WhatsApp/Email notification integration for tracking alerts
- A/B testing for social sharing
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SOCL-01 | Admin can configure Facebook App ID, default share title, description, and image | Social section: 7 settings keys (seo_fb_app_id, seo_share_title, etc.), InputField pattern |
| SOCL-02 | Admin can configure Twitter/X handle, card type, default share image | Social section: seo_twitter_handle, seo_twitter_card_type (select: summary/summary_large_image) |
| SOCL-03 | Admin can configure LinkedIn share image override | Social section: seo_linkedin_image key |
| SOCL-04 | Admin sees social share preview simulator (Facebook, Twitter/X, LinkedIn) | SocialPreviewSimulator component with side-by-side cards (D-01) |
| SOCL-05 | Admin can toggle between mobile and desktop preview modes | Mobile/desktop toggle switch above preview cards |
| META-01 | Admin can configure Meta Pixel ID and CAPI token | Meta section: meta_pixel_id, meta_capi_token keys |
| META-02 | Admin can configure Dataset ID and Test Event Code | Meta section: meta_dataset_id, meta_test_event_code keys |
| META-03 | Admin can toggle Advanced Matching and Event Deduplication | Meta section: meta_advanced_matching (boolean), meta_event_deduplication (boolean), meta_matching_fields (JSON) |
| META-04 | Admin can select standard events to track | Meta section: meta_events JSON key with checkboxes (D-02) |
| META-05 | Admin sees connection status for Pixel and CAPI | Connection test via Meta Graph API (D-07) |
| META-06 | Admin sees recent event firing logs | EventLogPanel component, session-scoped buffer (D-08) |
| TIKT-01 | Admin can configure TikTok Pixel ID and Events API token | TikTok section: tiktok_pixel_id, tiktok_events_token keys |
| TIKT-02 | Admin can toggle Advanced Matching and server-side tracking | TikTok section: tiktok_advanced_matching, tiktok_matching_fields, tiktok_server_side keys |
| TIKT-03 | Admin sees tracking status and recent event logs | Connection status indicator + EventLogPanel reuse |
| GOOG-01 | Admin can configure GA4 ID, Google Ads Conversion ID, Conversion Label | Google section: google_analytics_id (migrate), google_ads_conversion_id, google_ads_conversion_label |
| GOOG-02 | Admin can configure GTM Container ID | Google section: google_tag_manager_id (migrate), container ID + toggle (D-12) |
| GOOG-03 | Admin can toggle server-side tracking and enhanced ecommerce | Google section: google_server_side, google_enhanced_ecommerce booleans |
| GOOG-04 | Admin sees connection status and connection tester | GA Management API test + "Test Connection" button (D-07) |
| GOOG-05 | Admin sees analytics summary cards | GA4 Data API with service account, 5-minute cache (D-09) |
| SCHM-01 | Admin can configure global schema: Organization, Website, Breadcrumb | Schema section: reuse existing seo.ts functions + overrides |
| SCHM-02 | Admin can enable/configure content schemas: Product, Article, FAQ, HowTo, Review | Schema section: seo_schema_types_enabled JSON, seo_schema_overrides JSON |
| SCHM-03 | Admin sees JSON-LD preview of generated schema | JsonLd component reuse, read-only preview below each form |
| SCHM-04 | Admin can validate schema against Google structured data requirements | Link to Google Rich Results Test with pre-filled URL |
| SCHM-05 | Admin can toggle auto schema generation | Schema section: seo_schema_auto_generate boolean |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Package Manager:** pnpm only (never npm, yarn, bun)
- **Framework:** Next.js 16 with App Router, TypeScript strict, TailwindCSS v4, ESLint
- **Proxy:** Use `proxy.ts` instead of `middleware.ts`
- **Components:** Server components by default; client components only when needed (`"use client"`)
- **Styling:** TailwindCSS v4 CSS-first config -- no tailwind.config.js, tokens via `@theme { }` block
- **Server actions:** Use async server actions, `requireAdmin()` pattern, `createAuditLog()` for mutations
- **Imports:** Always use `@/` path alias, never relative paths across directories

## Standard Stack

### Core (Already Installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.2.6 | App Router, server actions, Script component | Framework -- already in use [VERIFIED: package.json] |
| react | 19.2.4 | UI rendering | Framework -- already in use [VERIFIED: package.json] |
| drizzle-orm | ^0.45.2 | Database ORM for settings table | Already in use for all settings operations [VERIFIED: package.json] |
| lucide-react | ^1.14.0 | Icons (Share2, Target, Music, BarChart3, Code, etc.) | Already in use in SettingsShell nav [VERIFIED: package.json] |
| next-intl | ^4.12.0 | Internationalization (en/bn) | Already in use in locale layout [VERIFIED: package.json] |

### Supporting (Already Installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-themes | ^0.4.6 | Dark/light theme | Already wrapping app, all admin pages support dark mode |
| framer-motion | ^12.38.0 | Animations | Optional for card transitions, toggle animations |
| clsx | 2.1.1 | Conditional classNames | Used via `cn()` utility in component styling |
| tailwind-merge | 3.6.0 | Tailwind class dedup | Used via `cn()` utility for class merging |

### No New Dependencies Required

All Phase 11 functionality can be built with existing dependencies. Tracking pixel scripts are injected via `next/script` (already installed). API calls for connection tests use native `fetch`. JSON-LD rendering uses the existing `JsonLd` component. Form state uses React `useState` + `useTransition`.

**Installation:**
```bash
# No new packages needed for Phase 11
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual script injection | `@next/third-parties` package | Official Next.js third-party scripts -- adds dependency for something already working via `next/script`. Not needed since TrackingScripts already uses `next/script` directly [ASSUMED] |
| Custom OG preview | `react-share` preview components | Adds dependency; our preview is simple card rendering, not worth a package |
| GA4 API client library | `googleapis` npm package | Adds ~2MB dependency; we only need one API call (runReport). Use `fetch` with Google auth instead |

## Architecture Patterns

### Existing Project Structure (Phase 11 files highlighted)

```
src/
├── app/
│   ├── (admin)/
│   │   ├── actions/
│   │   │   ├── admin-seo.ts              # Pattern to follow for server actions
│   │   │   └── admin-tracking.ts         # TO BE DEPRECATED (migrate into v2)
│   │   └── admin/settings/
│   │       ├── layout.tsx                # SettingsShell wrapper (auth guard)
│   │       └── seo/
│   │           ├── page.tsx              # TO REDESIGN: card grid landing (D-10)
│   │           ├── social/page.tsx       # TO BUILD: SocialPreviewSimulator
│   │           ├── meta-pixel/page.tsx   # TO BUILD: MetaPixelForm
│   │           ├── tiktok/page.tsx       # TO BUILD: TikTokForm
│   │           ├── google/page.tsx       # TO BUILD: GoogleTrackingForm
│   │           └── schema/page.tsx       # TO BUILD: SchemaForm
│   └── [locale]/
│       └── layout.tsx                    # TO MODIFY: integrate TrackingScripts (D-03)
├── components/
│   ├── admin/
│   │   ├── SettingsShell.tsx             # Sidebar nav with SEO sub-items
│   │   ├── TrackingSettingsForm.tsx      # TO BE DEPRECATED
│   │   └── seo/
│   │       ├── GeneralSeoForm.tsx        # Pattern to follow
│   │       ├── SerpPreview.tsx           # Preview pattern reference
│   │       └── SeoScore.tsx              # Score indicator reference
│   ├── layout/
│   │   └── TrackingScripts.tsx           # TO MODIFY: add TikTok + event selection
│   └── seo/
│       └── JsonLd.tsx                    # Reuse for schema preview
├── lib/
│   ├── seo-keys.ts                       # Pattern for tracking-keys.ts
│   ├── seo.ts                            # TO MODIFY: read schema overrides from DB
│   └── tracking.ts                       # TO EXPAND: new tracking keys
└── data/
    └── dashboard-nav.ts                  # No changes needed
```

### Pattern 1: Server Action Pattern (from admin-seo.ts)

**What:** Admin-only server actions with auth guard, key validation, upsert, and audit logging.
**When to use:** Every Phase 11 form save action.

```typescript
// Source: src/app/(admin)/actions/admin-seo.ts [VERIFIED: codebase]
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { TRACKING_KEYS, type TrackingSettingsData } from "@/lib/tracking-keys";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") redirect("/admin/dashboard");
  return { session, userId: session.user.id, role };
}

export async function getTrackingSettings(keys?: string[]): Promise<TrackingSettingsData> {
  await requireAdmin();
  const queryKeys = keys
    ? keys.filter((k) => (TRACKING_KEYS as readonly string[]).includes(k))
    : [...TRACKING_KEYS];
  const rows = await db.select().from(settings).where(inArray(settings.key, queryKeys));
  const map: TrackingSettingsData = {};
  for (const key of queryKeys) {
    const row = rows.find((r) => r.key === key);
    map[key] = row?.value ?? "";
  }
  return map;
}
```

### Pattern 2: Key Registry with Slice Groups (from seo-keys.ts)

**What:** `as const` array of settings keys with slice exports for each sub-section.
**When to use:** `tracking-keys.ts` for Phase 11.

```typescript
// Source: src/lib/seo-keys.ts [VERIFIED: codebase]
export const SEO_KEYS = [
  "seo_title", "seo_description", /* ... */
] as const;

export type SeoKey = (typeof SEO_KEYS)[number];
export const GENERAL_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(0, 10);
export const VERIFICATION_SEO_KEYS: readonly SeoKey[] = SEO_KEYS.slice(10, 15);
// ...
```

### Pattern 3: Client Form Component (from GeneralSeoForm.tsx)

**What:** `"use client"` component with `useState` + `useTransition`, `ComponentCard` sections, `InputField`/`Switch`/`Button` controls.
**When to use:** All Phase 11 form components.

```typescript
// Source: src/components/admin/seo/GeneralSeoForm.tsx [VERIFIED: codebase]
"use client";

import { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";

export default function MetaPixelForm({ initialData }: { initialData: TrackingSettingsData }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [data, setData] = useState<TrackingSettingsData>({ ...initialData });
  // ...
}
```

### Pattern 4: Script Injection (from TrackingScripts.tsx)

**What:** Client component using `next/script` with `strategy="afterInteractive"` for tracking pixels.
**When to use:** Expanding TrackingScripts with TikTok + event selection.

```typescript
// Source: src/components/layout/TrackingScripts.tsx [VERIFIED: codebase]
"use client";
import Script from "next/script";

export function TrackingScripts({ ga4Id, gtmId, facebookPixelId }: TrackingScriptsProps) {
  return (
    <>
      {ga4Id && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`...`}</Script>
        </>
      )}
    </>
  );
}
```

### Pattern 5: Page Route with Server Data Fetching

**What:** Server component page that fetches data via server action, passes to client form.
**When to use:** All Phase 11 page routes.

```typescript
// Source: src/app/(admin)/admin/settings/seo/general/page.tsx pattern
import { getTrackingSettings } from "@/app/(admin)/actions/admin-tracking-v2";
import MetaPixelForm from "@/components/admin/seo/MetaPixelForm";

export const dynamic = "force-dynamic";

export default async function SeoMetaPixelPage() {
  const settings = await getTrackingSettings(META_PIXEL_KEYS);
  return <MetaPixelForm initialData={settings} />;
}
```

### Anti-Patterns to Avoid

- **Don't put `"use client"` on page files:** Page files should be server components that fetch data and pass to client form components. The form component is the client boundary.
- **Don't create separate server action files per form:** One `admin-tracking-v2.ts` file handles all Phase 11 tracking settings, with slice-group-based get/save functions.
- **Don't hardcode schema data in new files:** The existing `seo.ts` already has `organizationSchema()`, `websiteSchema()`, `productSchema()`, `breadcrumbSchema()`. Phase 11 adds DB override reading to these, not new schema functions.
- **Don't use GA Reporting API v4:** It is deprecated (UA-only, sunset July 2023). Use GA4 Data API (`analyticsdata.googleapis.com`) instead [VERIFIED: web search, Google developer docs].
- **Don't persist event logs to database:** D-08 explicitly states session-scoped, in-memory only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Meta Pixel script | Custom script loader | Existing `TrackingScripts` pattern with `fbq('init')` + `fbq('track')` | Already working in codebase, handles `next/script` correctly |
| GA4 script injection | Custom gtag loader | Existing GA4 block in `TrackingScripts` | Already tested and working |
| GTM container script | Custom GTM loader | Existing GTM block in `TrackingScripts` | Already tested and working |
| JSON-LD rendering | Custom script tag | Existing `JsonLd` component with XSS protection (`.replace(/</g, "\\u003c")`) | Handles JSON-LD injection safely |
| Admin auth guard | New auth check | Existing `requireAdmin()` pattern from `admin-seo.ts` | Proven pattern used across all admin actions |
| Settings upsert | Custom DB logic | Existing upsert pattern (select + update/insert) | Proven pattern in both `admin-seo.ts` and `admin-tracking.ts` |
| Audit logging | Custom log system | Existing `createAuditLog()` utility | Already used in all admin mutations |
| Form styling | Custom form styles | Existing `ComponentCard`, `InputField`, `Switch`, `Button` components | Consistent with Phase 10 admin forms |

**Key insight:** Phase 11 is entirely pattern-extension work. Every major building block (server actions, key registry, form components, script injection, JSON-LD) already exists and is production-tested. The phase creates new form components and expands existing ones.

## Runtime State Inventory

> Phase 11 involves migration of existing tracking keys, not rename/refactor. However, there is a migration aspect.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `settings` table contains 5 existing tracking keys (facebook_pixel_id, facebook_capi_token, google_analytics_id, google_tag_manager_id, google_search_console_verification) | No data migration needed -- same keys continue to work, just accessed from new server action file |
| Live service config | None -- all tracking config is in the `settings` database table managed by admin forms | None |
| OS-registered state | None | None |
| Secrets/env vars | No env vars for tracking keys (all stored in DB `settings` table). GA4 service account credentials for D-09 will need env vars (e.g., `GA4_SERVICE_ACCOUNT_EMAIL`, `GA4_PRIVATE_KEY`, `GA4_PROPERTY_ID`) | Code edit: add env var reading in GA summary server action |
| Build artifacts | None -- no compiled artifacts depend on tracking settings | None |

**Nothing found that requires data migration.** The existing 5 keys remain in the same `settings` table with the same key names. The only change is which server action file reads/writes them.

## Common Pitfalls

### Pitfall 1: GA Reporting API v4 vs GA4 Data API

**What goes wrong:** Using the deprecated Universal Analytics Reporting API v4 (`analyticsreporting.googleapis.com`) which was sunset in July 2023.
**Why it happens:** The API names are confusingly similar. "Reporting API v4" sounds like the current version.
**How to avoid:** Use GA4 Data API v1 (`analyticsdata.googleapis.com/v1beta/properties/{property_id}:runReport`). The endpoint, auth, and response format are completely different.
**Warning signs:** API calls return 404 or "UA properties not found" errors.

### Pitfall 2: Meta CAPI event deduplication requires event_id

**What goes wrong:** Sending the same event from both browser pixel and server-side CAPI creates duplicate events in Meta Events Manager.
**Why it happens:** Without a shared `event_id`, Meta cannot deduplicate browser and server events.
**How to avoid:** When deduplication is enabled (D-13), generate a deterministic `event_id` (e.g., `event_name + timestamp + user_hash`) and pass it to both `fbq('track')` and the CAPI POST. The `event_id` field is Meta's official deduplication mechanism.
**Warning signs:** Meta Events Manager shows duplicate events with slightly different timestamps.

### Pitfall 3: TikTok pixel ttq.track event names must match exactly

**What goes wrong:** Using non-standard event names like `'Page_View'` instead of `'PageView'` causes TikTok to not recognize the event.
**Why it happens:** TikTok's event names are case-sensitive and specific. `'ViewContent'` not `'view_content'` or `'view content'`.
**How to avoid:** Use the pre-defined standard event list from D-02 (checkbox approach). The checkbox labels ARE the correct event names: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Lead.
**Warning signs:** TikTok Ads Manager shows no events firing despite pixel loading correctly.

### Pitfall 4: Advanced Matching requires SHA-256 hashing

**What goes wrong:** Sending raw PII (email, phone) to Meta/TikTok pixels instead of SHA-256 hashed values.
**Why it happens:** The pixel SDK documentation is ambiguous about client-side vs server-side hashing. The browser pixel SDK (`fbq`) handles hashing automatically, but CAPI server-side events require pre-hashing.
**How to avoid:** For browser pixel `fbq('init')` with Advanced Matching, pass raw values -- the SDK hashes them. For CAPI server-side events, hash with SHA-256 before sending.
**Warning signs:** Meta Events Manager shows "Advanced Matching: Low" quality score.

### Pitfall 5: next/script in client components vs server components

**What goes wrong:** Using `<Script>` inside a server component silently fails to load the script.
**Why it happens:** `next/script` requires React context and must be used inside a client component boundary.
**How to avoid:** `TrackingScripts` is already a client component (`"use client"`). When adding TikTok pixel, keep it inside this client component. The parent `[locale]/layout.tsx` is a server component -- it imports and renders the client component, which is fine.
**Warning signs:** Tracking scripts don't appear in browser Network tab.

### Pitfall 6: JSON settings values need careful parsing

**What goes wrong:** JSON values stored as strings in the `settings` table (`meta_events: '{"PageView":true,"ViewContent":true}'`) fail to parse when read.
**Why it happens:** The `settings.value` column is `text` type. JSON keys need `JSON.parse()` on read and `JSON.stringify()` on write. Empty string defaults need to resolve to `{}` or `[]`.
**How to avoid:** Create a helper function `parseJsonSetting(value: string, fallback: T): T` that safely parses with try/catch and returns fallback on empty string or parse error.
**Warning signs:** `JSON.parse` exceptions in admin form rendering or event firing.

### Pitfall 7: Social preview images need specific aspect ratios

**What goes wrong:** OG images with wrong aspect ratios get cropped poorly on different platforms.
**Why it happens:** Each platform has different ideal dimensions: Facebook 1200x630px, Twitter summary_large_image 1200x628px, LinkedIn 1200x627px.
**How to avoid:** The universal safe dimension is 1200x630px (1.91:1 ratio) [VERIFIED: Facebook sharing docs, Twitter card docs, LinkedIn sharing docs]. Show placeholder with "Recommended: 1200x630px" when no image is set.
**Warning signs:** Social previews show heavily cropped or tiny images.

## Code Examples

### Meta CAPI Test Event (D-13)

```typescript
// Server action: Send test Purchase event via CAPI
// Source: Meta Marketing API docs [CITED: developers.facebook.com/docs/marketing-api/conversions-api]

export async function sendMetaTestEvent(
  pixelId: string,
  accessToken: string,
  testEventCode: string
): Promise<{ success: boolean; response?: string }> {
  const url = `https://graph.facebook.com/v21.0/${pixelId}/events`;

  const body = {
    data: [{
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: "https://conversionflow.com",
      action_source: "website",
      user_data: {
        client_ip_address: "127.0.0.1",
        client_user_agent: "ConversionFlow-Admin-Test",
      },
      custom_data: {
        currency: "USD",
        value: "0.01",
      },
    }],
    test_event_code: testEventCode,
    access_token: accessToken,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    const text = await res.text();
    return { success: false, response: text };
  }

  return { success: true, response: await res.text() };
}
```

### TikTok Pixel Script Injection (D-03)

```typescript
// Client component script injection for TikTok pixel
// Source: TikTok Business API docs [CITED: ads.tiktok.com/help/article/tiktok-pixel]

{tiktokPixelId && (
  <Script id="tiktok-pixel" strategy="afterInteractive">
    {`!function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","use","off","on"];
        ttq.factory=function(e){return function(){var n=Array.prototype.slice.call(arguments);
        return n.unshift(e),ttq.push(n),ttq}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(e){for(var n=ttq._i[e]||[],i=0;i<ttq.methods.length;i++)
        ttq.setAndDefer(n,ttq.methods[i]);return n};
        ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i=tq._i||{},ttq._i[e]=[],ttq._i[e]._u=i;
        var o=document.createElement("script");o.type="text/javascript",
        o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
        var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};

        ttq.load('${tiktokPixelId}');
        ttq.page();
      }(window, document, 'ttq');`}
  </Script>
)}
```

### GA4 Data API runReport (D-09)

```typescript
// Server action: Fetch GA4 summary metrics
// Source: GA4 Data API docs [CITED: developers.google.com/analytics/devguides/reporting/data/v1]

export async function getGa4Summary(): Promise<{
  activeUsers: string;
  pageviews: string;
  sessions: string;
  topPages: { path: string; views: string }[];
}> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const serviceAccountEmail = process.env.GA4_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!propertyId || !serviceAccountEmail || !privateKey) {
    return { activeUsers: "--", pageviews: "--", sessions: "--", topPages: [] };
  }

  // Get OAuth2 token using service account (JWT grant)
  const jwt = await getServiceAccountToken(serviceAccountEmail, privateKey);
  // ... token exchange logic ...

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: "today", endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "sessions" },
        ],
        dimensions: [{ name: "pagePath" }],
        limit: 10,
      }),
    }
  );
  // ... parse response ...
}
```

### Social Preview Card Component (D-01)

```typescript
// Simplified social preview card structure
// Dimensions verified: [VERIFIED: Facebook sharing docs, Twitter card docs, LinkedIn sharing docs]

function FacebookPreviewCard({ title, description, image, url }: PreviewProps) {
  return (
    <div className="border rounded-lg overflow-hidden max-w-[500px]">
      {/* Image: 1.91:1 ratio (1200x630px recommended) */}
      {image ? (
        <img src={image} alt="" className="w-full aspect-[1.91/1] object-cover" />
      ) : (
        <div className="w-full aspect-[1.91/1] bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-xs text-gray-400">1200 x 630px recommended</span>
        </div>
      )}
      {/* Text content */}
      <div className="p-3 bg-gray-100 dark:bg-gray-800">
        <p className="text-xs text-gray-500 uppercase truncate">{url || "conversionflow.com"}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{title || "Page Title"}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{description || "Page description"}</p>
      </div>
    </div>
  );
}

function TwitterPreviewCard({ title, description, image, cardType }: PreviewProps) {
  // summary_large_image: landscape 2:1 (1200x628px)
  // summary: square 1:1 (min 144x144px)
  const isLarge = cardType === "summary_large_image";
  return (
    <div className="border rounded-xl overflow-hidden max-w-[500px]">
      {image && (
        <img
          src={image}
          alt=""
          className={`w-full object-cover ${isLarge ? "aspect-[2/1]" : "aspect-square max-w-[144px]"}`}
        />
      )}
      <div className="p-3">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{description}</p>
        <p className="text-xs text-gray-400 mt-1">conversionflow.com</p>
      </div>
    </div>
  );
}
```

### Schema Form with JSON-LD Preview (D-06)

```typescript
// Reusing existing JsonLd component and seo.ts functions
// Source: src/components/seo/JsonLd.tsx [VERIFIED: codebase]

import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema, websiteSchema, productSchema, breadcrumbSchema } from "@/lib/seo";

function SchemaPreviewSection({ overrides }: { overrides: Record<string, string> }) {
  // Generate schema with overrides applied
  const orgSchema = {
    ...organizationSchema(),
    ...(overrides.org_name ? { name: overrides.org_name } : {}),
    ...(overrides.org_email ? { email: overrides.org_email } : {}),
  };

  return (
    <div className="mt-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-400">
        JSON-LD Preview
      </label>
      <pre className="mt-2 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs overflow-auto max-h-64">
        {JSON.stringify(orgSchema, null, 2)}
      </pre>
      <a
        href={`https://search.google.com/test/rich-results`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-xs text-brand-500 hover:underline"
      >
        Validate with Google Rich Results Test
      </a>
    </div>
  );
}
```

### JSON Settings Helper (for meta_events, tiktok_events, etc.)

```typescript
// Safe JSON parsing for settings values stored as text
function parseJsonSetting<T>(value: string | undefined | null, fallback: T): T {
  if (!value || value.trim() === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

// Usage:
const metaEvents = parseJsonSetting<Record<string, boolean>>(data.meta_events, {});
const tiktokEvents = parseJsonSetting<Record<string, boolean>>(data.tiktok_events, {});
const matchingFields = parseJsonSetting<string[]>(data.meta_matching_fields, []);
```

### Empty State Warning Banner (D-11)

```typescript
function EmptyStateBanner({
  isConfigured,
  platformName,
  targetId,
}: {
  isConfigured: boolean;
  platformName: string;
  targetId: string;
}) {
  if (isConfigured) return null;

  const scrollToConfig = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
      <AlertTriangle className="h-5 w-5 text-amber-500" />
      <p className="text-sm text-amber-700 dark:text-amber-400">
        {platformName} is not connected. Configure your tracking to start collecting data.
      </p>
      <button onClick={scrollToConfig} className="text-sm font-medium text-amber-700 underline dark:text-amber-400">
        Configure Now
      </button>
    </div>
  );
}
```

### Event Log Panel (D-08)

```typescript
// Client-side session-scoped event buffer
// Source: D-08 decision [VERIFIED: CONTEXT.md]

const MAX_EVENTS = 50;
const eventBuffer: TrackingEvent[] = [];

interface TrackingEvent {
  timestamp: Date;
  eventName: string;
  platform: "meta" | "tiktok" | "google";
  status: "fired" | "pending" | "error";
}

function logEvent(event: Omit<TrackingEvent, "timestamp">) {
  eventBuffer.unshift({ ...event, timestamp: new Date() });
  if (eventBuffer.length > MAX_EVENTS) eventBuffer.pop();
}

// EventLogPanel renders eventBuffer as a table
// Only visible in admin debug mode
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GA Reporting API v4 | GA4 Data API v1beta | July 2023 (UA sunset) | Completely different endpoint, auth, and response format. Must use `analyticsdata.googleapis.com` [VERIFIED: Google developer docs] |
| Meta Marketing API v18.0 | v21.0 (latest) | Ongoing | CAPI endpoint is `graph.facebook.com/v{version}/{pixel_id}/events`. Use latest stable version. |
| TikTok Events API v1.2 | v1.3 | 2024 | Endpoint: `business-api.tiktok.com/open_api/v1.3/event/track/` [VERIFIED: TikTok Business docs] |
| UA-style `ga()` command queue | GA4 `gtag()` + Measurement Protocol | 2023 | Already migrated in TrackingScripts (uses `gtag('config', ...)`) |
| Twitter card validator tool | Removed by X | 2023 | No official preview tool; use card meta tags and manual testing [ASSUMED] |

**Deprecated/outdated:**
- `analyticsreporting.googleapis.com` (UA Reporting API v4): Sunset with Universal Analytics in July 2023
- Twitter Card Validator (cards-dev.twitter.com/validator): Removed by X/Twitter

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No test framework currently installed |
| Config file | None -- Wave 0 would need setup |
| Quick run command | N/A -- needs framework install |
| Full suite command | N/A -- needs framework install |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SOCL-01 | Save/load social OG settings (fb_app_id, share_title, etc.) | unit | N/A | No -- Wave 0 |
| SOCL-02 | Twitter card type select persists | unit | N/A | No -- Wave 0 |
| SOCL-03 | LinkedIn image override saves | unit | N/A | No -- Wave 0 |
| SOCL-04 | SocialPreviewSimulator renders 3 platform cards | unit | N/A | No -- Wave 0 |
| SOCL-05 | Mobile/desktop toggle switches preview layout | unit | N/A | No -- Wave 0 |
| META-01 | Meta pixel ID and CAPI token save/load | unit | N/A | No -- Wave 0 |
| META-02 | Dataset ID and test event code persist | unit | N/A | No -- Wave 0 |
| META-03 | Advanced matching toggle + field selection | unit | N/A | No -- Wave 0 |
| META-04 | Standard event checkboxes save as JSON | unit | N/A | No -- Wave 0 |
| META-05 | Connection status indicator shows correct state | unit | N/A | No -- Wave 0 |
| META-06 | Event log panel displays session events | unit | N/A | No -- Wave 0 |
| TIKT-01 | TikTok pixel ID and Events API token save | unit | N/A | No -- Wave 0 |
| TIKT-02 | Advanced matching and server-side toggles | unit | N/A | No -- Wave 0 |
| TIKT-03 | Tracking status and event log display | unit | N/A | No -- Wave 0 |
| GOOG-01 | GA4 ID, Ads Conversion ID, Conversion Label save | unit | N/A | No -- Wave 0 |
| GOOG-02 | GTM container ID saves | unit | N/A | No -- Wave 0 |
| GOOG-03 | Server-side tracking and enhanced ecommerce toggles | unit | N/A | No -- Wave 0 |
| GOOG-04 | Connection tester shows status | unit | N/A | No -- Wave 0 |
| GOOG-05 | GA summary cards display data from API | unit | N/A | No -- Wave 0 |
| SCHM-01 | Global schema overrides save and generate correct JSON-LD | unit | N/A | No -- Wave 0 |
| SCHM-02 | Content schema enable/configure works | unit | N/A | No -- Wave 0 |
| SCHM-03 | JSON-LD preview renders correctly | unit | N/A | No -- Wave 0 |
| SCHM-04 | Validation link opens Google Rich Results Test | manual-only | N/A | N/A |
| SCHM-05 | Auto schema generation toggle works | unit | N/A | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** Manual verification (no test runner)
- **Per wave merge:** `pnpm build` + `pnpm lint` (catch TypeScript/ESLint errors)
- **Phase gate:** Full build passes, all 24 requirements manually verified

### Wave 0 Gaps
- [ ] Test framework install: `pnpm add -D vitest @testing-library/react @testing-library/jest-dom` -- needed for unit tests
- [ ] No test files exist -- all 24 requirements need test coverage created
- [ ] `vitest.config.ts` -- configuration file needed
- [ ] Note: Project has no test infrastructure currently. Phase 11 can proceed without tests (matching project convention) or establish test infrastructure in Wave 0.

**Alternative:** Since the project has zero test files across all 13 phases and the CLAUDE.md does not mention testing requirements, the pragmatic approach is to rely on `pnpm build` + `pnpm lint` + manual verification, matching the established project convention.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/runtime | Yes | 24.15.0 | -- |
| pnpm | Package management | Yes | 10.33.2 | -- |
| PostgreSQL | Settings DB | Yes (configured) | -- | -- |
| GA4 Service Account | GOOG-05 summary cards | Not configured | -- | Graceful fallback: "Connect GA to see data" |
| Meta Graph API access token | META-05 connection test | Not configured | -- | Connection test disabled until configured |
| TikTok Events API | TIKT-03 connection test | Not configured | -- | Format validation only until API token provided |

**Missing dependencies with no fallback:**
- None that block execution. All external API features have graceful fallbacks per their respective decisions (D-07, D-09).

**Missing dependencies with fallback:**
- GA4 service account credentials: Summary cards show "Connect GA to see data" placeholder
- Meta Graph API access token: Connection test shows "Not configured" status
- TikTok Events API token: Basic format validation only

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | Existing `requireAdmin()` via Better Auth session |
| V3 Session Management | Yes | Better Auth session with Redis backing |
| V4 Access Control | Yes | Role check (admin/super_admin) in requireAdmin() |
| V5 Input Validation | Yes | Settings keys validated against TRACKING_KEYS array before DB write |
| V6 Cryptography | Partial | CAPI tokens stored as plain text in DB (acceptable for server-side config). Advanced Matching SHA-256 handled by pixel SDK. |

### Known Threat Patterns for Next.js Admin Settings

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| CSRF on settings save | Tampering | Server actions with `requireAdmin()` session check; Next.js server actions have built-in CSRF protection via `Origin` header validation |
| XSS via JSON-LD preview | Tampering | `JsonLd` component uses `JSON.stringify().replace(/</g, "\\u003c")` to prevent script injection [VERIFIED: codebase] |
| XSS via social preview | Tampering | Social preview uses React JSX (auto-escaped); image URLs rendered in `<img>` tags (no inline script risk) |
| IDOR on settings API | Information Disclosure | All server actions require admin session; no public-facing settings read endpoint (public reads go through `tracking.ts` with limited key set) |
| Sensitive token exposure | Information Disclosure | CAPI token field uses `type="password"` input; tokens never sent to client-side except in admin form |
| SQL injection | Tampering | Drizzle ORM parameterized queries; no raw SQL [VERIFIED: codebase uses `eq()`, `inArray()`] |

### Additional Security Considerations

- **GA4 service account credentials:** Stored in environment variables (not DB). The private key must never be exposed to the client. Server action only.
- **Meta CAPI access token:** Stored in `settings` DB table. Should be treated as sensitive -- use `type="password"` input field.
- **TikTok Events API token:** Same as Meta CAPI token treatment.
- **Event log (D-08):** Session-scoped, in-memory only. Never persisted. No PII logged.
- **Advanced Matching PII:** Admin configures which fields to collect. Actual user data hashing happens in the pixel SDK (browser-side) or server-side CAPI. The admin form only configures which fields are enabled -- no actual PII passes through the admin form.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@next/third-parties` package not needed -- `next/script` is sufficient for tracking pixel injection | Standard Stack / Alternatives | Low -- current approach already works |
| A2 | Twitter Card Validator tool has been removed by X | State of the Art | Low -- preview can still be rendered client-side from meta tags |
| A3 | Meta Graph API v21.0 is the latest stable version | Code Examples / State of the Art | Low -- API is versioned per call, using any recent v18+ works for pixel status check |
| A4 | No new npm dependencies needed for Phase 11 | Standard Stack | Medium -- GA4 service account auth could use `googleapis` library but `fetch` + JWT is feasible |
| A5 | Existing `settings` table schema (key: text PK, value: text NOT NULL, updatedAt: timestamp) supports JSON values stored as strings | Architecture | Low -- Phase 10 already stores JSON-like values (seo_ai_bots) |

**Claims verified in this session:**
- Meta CAPI endpoint structure: `graph.facebook.com/v{version}/{pixel_id}/events` [VERIFIED: Meta developer docs]
- TikTok Events API endpoint: `business-api.tiktok.com/open_api/v1.3/event/track/` [VERIFIED: TikTok Business docs]
- GA4 Data API endpoint: `analyticsdata.googleapis.com/v1beta/properties/{id}:runReport` [VERIFIED: Google developer docs]
- OG image dimensions: Facebook 1200x630px, Twitter 1200x628px, LinkedIn 1200x627px -- universal 1200x630px [VERIFIED: Facebook sharing docs, Twitter card docs, LinkedIn sharing docs]
- TikTok standard events include: ViewContent, AddToCart, InitiateCheckout, Purchase, CompletePayment, Search, AddPaymentInfo, SubmitForm, Download, Contact, Subscribe, CompleteRegistration [VERIFIED: TikTok Business API docs]
- Meta standard events include: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Lead, AddPaymentInfo, Search, CompleteRegistration, AddToWishlist, Contact, CustomizeProduct, Donate, FindLocation, Schedule, StartTrial, SubmitApplication [VERIFIED: Meta developer docs]

## Open Questions

1. **GA4 Service Account Credentials**
   - What we know: D-09 requires GA Reporting API (actually GA4 Data API) for summary cards. This needs a service account with `analytics.readonly` scope.
   - What's unclear: Has the user already set up a GA4 service account? Are the env var names (`GA4_SERVICE_ACCOUNT_EMAIL`, `GA4_PRIVATE_KEY`, `GA4_PROPERTY_ID`) acceptable?
   - Recommendation: Build the server action with graceful fallback. When env vars are missing, show "Connect GA to see data" placeholder. Document required env vars in the form help text.

2. **Meta Graph API Access Token for Connection Test**
   - What we know: D-07 requires live API validation of pixel status. This needs a Meta app access token or system user token.
   - What's unclear: Where to store the Meta API access token. Options: env var or a new settings key.
   - Recommendation: Store as a new settings key (`meta_graph_api_token`) on the Meta Pixel page. This keeps all Meta config in one place.

3. **Event Logging Scope**
   - What we know: D-08 specifies session-scoped, client-side, in-memory buffer (last 50 events).
   - What's unclear: Should the EventLogPanel be a standalone page or embedded in each tracking page?
   - Recommendation: Per CONTEXT.md, it is a "lightweight client-side logger" with "admin-only debug panel." Create as a shared component that each tracking page can optionally include. Also consider a global debug panel accessible from the SEO overview.

## Sources

### Primary (HIGH confidence)
- `src/app/(admin)/actions/admin-seo.ts` - Server action pattern (requireAdmin, get/save, audit log)
- `src/lib/seo-keys.ts` - Key registry with slice groups pattern
- `src/components/admin/seo/GeneralSeoForm.tsx` - Form component pattern
- `src/components/layout/TrackingScripts.tsx` - Script injection pattern
- `src/components/seo/JsonLd.tsx` - JSON-LD rendering component
- `src/lib/seo.ts` - Existing schema functions (organizationSchema, websiteSchema, productSchema, breadcrumbSchema)
- `src/lib/tracking.ts` - Existing tracking settings read function
- `src/components/admin/SettingsShell.tsx` - Settings sidebar navigation
- `package.json` - Dependency versions verified
- Meta Marketing API docs (developers.facebook.com/docs/marketing-api/conversions-api) - CAPI endpoint structure, test_event_code, event deduplication
- TikTok Business API docs (ads.tiktok.com/help/article/tiktok-pixel) - Standard events list, pixel setup, Events API
- GA4 Data API docs (developers.google.com/analytics/devguides/reporting/data/v1) - runReport endpoint, metrics, service account auth

### Secondary (MEDIUM confidence)
- Facebook Sharing Best Practices (developers.facebook.com/docs/sharing/webmasters) - OG image dimensions 1200x630px
- Twitter Card docs (developer.x.com/en/docs/twitter-for-websites/cards) - summary vs summary_large_image dimensions
- LinkedIn Sharing docs (learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/ugc-post-api) - 1200x627px recommended
- Google Rich Results Test (search.google.com/test/rich-results) - Schema validation tool
- Schema.org validator (validator.schema.org) - Alternative schema validation

### Tertiary (LOW confidence)
- None -- all critical claims verified from primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already installed and verified from package.json
- Architecture: HIGH - All patterns verified from existing codebase files
- Pitfalls: HIGH - API deprecation verified from official docs, OG dimensions cross-referenced from multiple platform docs
- Code examples: HIGH - Based on verified API endpoints and existing codebase patterns

**Research date:** 2026-05-21
**Valid until:** 2026-06-20 (30 days -- stable stack, no new dependencies)
