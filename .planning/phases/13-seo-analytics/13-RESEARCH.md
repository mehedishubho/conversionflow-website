# Phase 13: SEO Analytics Dashboard - Research

**Researched:** 2026-05-21
**Domain:** SEO analytics dashboard (charts, tables, 404 logging, sitemap health, placeholder patterns)
**Confidence:** HIGH

## Summary

Phase 13 builds a single-page SEO analytics dashboard at `/admin/settings/seo/analytics` with three sections: Analytics Overview, Keyword/CTR Analytics (mostly placeholders), and Health Reports (real data from local sources). The page already exists as a placeholder `ComponentCard` with "Coming in Phase 13" text that will be replaced entirely.

The implementation reuses heavily from existing codebase patterns: `RevenueChart.tsx` for ApexCharts integration (dynamic import, SSR guard, configurable bar/area types), `DashboardKPIs.tsx` for card-based KPI display with trend indicators, `DateRangeSelector.tsx` for time range switching, `CoreWebVitalsCards.tsx` and `ImageStatsCards.tsx` for the established placeholder pattern with "--" values and API connection notes, and `ComponentCard.tsx` for section wrapping.

The only new database artifact is the `seo_404_errors` table. The only new infrastructure change is adding 404 detection logic to `proxy.ts`. Everything else is client-side dashboard components consuming server actions.

**Primary recommendation:** Follow the established `DashboardPageClient.tsx` pattern exactly -- server page fetches initial data, client component manages range state with `useTransition`, and each section is a `ComponentCard` wrapper. Extend existing `getGa4Summary()` for overview data, add new server actions for sitemap health and 404 reports, and use the CoreWebVitalsCards placeholder pattern for keyword/CTR sections.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Honest placeholders for Search Console data (keyword rankings, CTR/impressions, crawl issues). GA4 data stays real via existing `getGa4Summary()`.
- **D-02:** `seo_404_errors` DB table + `proxy.ts` logging for 404 tracking. Columns: id, url, referrer, hit_count, last_seen_at, created_at.
- **D-03:** Local XML analysis for sitemap health. Read sitemap file, count URLs, check last modified, verify XML validity.
- **D-04:** Single scrollable page layout at `/admin/settings/seo/analytics`. No tabs or sub-routes.
- **D-05:** Time ranges: 7d, 30d, 90d, Year. Reuse existing `DateRangeSelector` component.
- **D-06:** ApexCharts with `RevenueChart.tsx` pattern (dynamic import, SSR guard, bar/area types).

### Claude's Discretion
None specified -- standard dashboard implementation following established patterns.

### Deferred Ideas (OUT OF SCOPE)
- Google Search Console API integration (ANLT-08) -- v4
- Automated weekly SEO audit reports (ANLT-09) -- v4
- Competitor analysis dashboard (ANLT-10) -- v4
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ANLT-01 | Admin sees an SEO analytics overview dashboard with indexed pages count and trend | Extend `getGa4Summary()` to include indexed pages estimate; use `DashboardKPIs` card pattern with trend indicators |
| ANLT-02 | Admin sees top performing pages ranked by organic traffic metrics | Already available from `getGa4Summary().topPages`; render as sortable table with path + views columns |
| ANLT-03 | Admin sees keyword rankings with position tracking and trend indicators | Placeholder per D-01; follow `CoreWebVitalsCards` pattern with "--" values and "Connect Google Search Console" note |
| ANLT-04 | Admin sees CTR and impressions data with trend charts | Placeholder per D-01; create ApexCharts area chart with "--" data and API connection note |
| ANLT-05 | Admin sees 404 error and broken link reports | New `seo_404_errors` DB table (D-02); proxy.ts logging; server action to query table; sortable table component |
| ANLT-06 | Admin sees sitemap health status and crawl issue reports | Sitemap health: local XML analysis (D-03); Crawl issues: placeholder per D-01. Use status badges from `Badge.tsx` |
| ANLT-07 | Analytics data is displayed using charts, tables, status badges, and trend indicators | ApexCharts (D-06), existing Badge component, existing trend pattern from DashboardKPIs, table pattern from RedirectTable |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| apexcharts | 5.12.0 | Chart rendering | Already installed and used in `RevenueChart.tsx` [VERIFIED: pnpm list] |
| react-apexcharts | 2.1.0 | React wrapper for ApexCharts | Already installed, dynamic import pattern established [VERIFIED: pnpm list] |
| drizzle-orm | (existing) | DB queries for 404 errors table | Project ORM standard [VERIFIED: codebase] |
| date-fns | 4.1.0 | Date formatting for chart labels | Already used in `admin-dashboard.ts` [VERIFIED: pnpm list] |
| lucide-react | 1.14.0 | Icons for cards, badges, tables | Project icon standard [VERIFIED: codebase] |

### No New Dependencies Required
All required libraries are already installed. No new packages need to be added.

**Installation:**
```bash
# No new packages needed -- all dependencies already in node_modules
```

**Version verification:**
```
apexcharts: 5.12.0 (installed, matches registry latest)
react-apexcharts: 2.1.0 (installed, matches registry latest)
date-fns: 4.1.0 (installed, registry has 4.2.1 but project pinned)
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/(admin)/admin/settings/seo/analytics/
│   └── page.tsx                          # Replace placeholder with full dashboard
├── components/admin/seo/
│   ├── SeoAnalyticsClient.tsx            # Client component (new) - orchestrates all sections
│   ├── IndexedPagesCards.tsx             # Overview KPI cards (new)
│   ├── TopPagesTable.tsx                 # Top pages by traffic (new)
│   ├── KeywordRankingsTable.tsx          # Placeholder table (new)
│   ├── CtrImpressionsChart.tsx           # Placeholder chart (new)
│   ├── Errors404Table.tsx                # Real 404 error table (new)
│   ├── SitemapHealthCards.tsx            # Real sitemap analysis (new)
│   └── CrawlIssuesPanel.tsx             # Placeholder crawl issues (new)
├── app/(admin)/actions/
│   ├── admin-tracking-v2.ts              # Extend getGa4Summary with date range
│   └── admin-seo.ts                      # Add: getSitemapHealth(), get404Errors()
├── lib/db/
│   └── schema.ts                         # Add seo_404_errors table
└── proxy.ts                              # Add 404 logging when no route matches
```

### Pattern 1: Analytics Client Component (Follows DashboardPageClient)
**What:** Client component with `useTransition` for date range changes, fetches server actions on range change.
**When to use:** The analytics page itself.
**Example:**
```typescript
// Source: Established pattern from src/components/admin/DashboardPageClient.tsx
"use client";

import { useState, useTransition } from "react";
import DateRangeSelector from "@/components/admin/DateRangeSelector";

export default function SeoAnalyticsClient({ initialData }) {
  const [activeRange, setActiveRange] = useState("7d");
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);

  const handleRangeChange = (range: string) => {
    setActiveRange(range);
    startTransition(async () => {
      const newData = await getAnalyticsData(range);
      setData(newData);
    });
  };

  return (
    <div>
      <DateRangeSelector activeRange={activeRange} onRangeChange={handleRangeChange} />
      {/* Section components */}
    </div>
  );
}
```

### Pattern 2: ApexCharts with Dynamic Import (Follows RevenueChart)
**What:** Chart component using `dynamic()` import to avoid SSR issues.
**When to use:** Any chart in the analytics dashboard.
**Example:**
```typescript
// Source: Established pattern from src/components/admin/RevenueChart.tsx
"use client";

import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// For multi-series (CTR + Impressions on same chart):
const series = [
  { name: "CTR (%)", data: ctrValues },
  { name: "Impressions", data: impressionValues },
];

const options: ApexOptions = {
  chart: { type: "area", height: 310, toolbar: { show: false } },
  stroke: { curve: "smooth", width: 2 },
  colors: ["#465FFF", "#34D399"], // brand blue + green
  // ... same grid/axis pattern as RevenueChart
};
```

### Pattern 3: Placeholder Cards (Follows CoreWebVitalsCards)
**What:** Cards showing "--" values with a blue info banner explaining how to connect the real data source.
**When to use:** Keyword rankings (ANLT-03), CTR/impressions (ANLT-04), crawl issues (ANLT-06 partial).
**Example:**
```typescript
// Source: Established pattern from src/components/admin/seo/CoreWebVitalsCards.tsx
// Key elements:
// 1. Metric cards with "--" value in gray-300 color
// 2. Info icon + blue banner with connection instructions
// 3. Target/description text explaining what the metric measures
```

### Pattern 4: Server Actions with requireAdmin Guard
**What:** All data fetching uses `"use server"` actions that call `requireAdmin()` first.
**When to use:** Every data fetch for the analytics dashboard.
**Example:**
```typescript
// Source: Established pattern from src/app/(admin)/actions/admin-seo.ts
"use server";

async function requireAdmin() { /* auth check */ }

export async function getSitemapHealth() {
  await requireAdmin();
  // Read sitemap file, analyze, return typed data
}
```

### Pattern 5: ComponentCard Section Wrapping
**What:** Each dashboard section wrapped in `ComponentCard` with title/desc props.
**When to use:** Every visual section on the analytics page.
**Example:**
```typescript
// Source: src/components/common/ComponentCard.tsx
// <ComponentCard title="..." desc="...">
//   {/* section content */}
// </ComponentCard>
```

### Anti-Patterns to Avoid
- **Never use mock/fake data for Search Console metrics:** Use honest "--" placeholders per D-01. Fake numbers mislead admins.
- **Never import ApexCharts directly:** Always use `dynamic()` import with `ssr: false` -- the library accesses `window` at import time.
- **Never create a separate layout or tab system:** Single scrollable page per D-04.
- **Never add new npm packages:** Everything needed is already installed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart rendering | Custom SVG/Canvas charts | ApexCharts (installed) | Already in project, established pattern in RevenueChart.tsx |
| Date range selection | Custom range picker | `DateRangeSelector.tsx` | Already exists with exact 7d/30d/90d/year options |
| SSR-safe chart loading | Manual useEffect + window check | `next/dynamic` with `ssr: false` | RevenueChart already proves this pattern works |
| Status badges | Custom colored spans | `Badge.tsx` component | Already has success/error/warning/info/light variants |
| Admin auth guard | Custom session check per action | `requireAdmin()` pattern | Every server action already uses this exact pattern |
| Trend calculation | Custom percentage logic | `calcTrend()` from `admin-dashboard.ts` | Handles division-by-zero, up/down/flat direction |
| Card layout wrapper | Custom div with border/spacing | `ComponentCard` | Standard across all SEO sub-pages |
| XML sitemap parsing | Custom string parsing | Node.js `DOMParser` or `fs.readFileSync` + regex | Simple enough for validation: check `<?xml`, count `<url>`, read `<lastmod>` |

**Key insight:** This phase is almost entirely assembling existing components with new data sources. The only truly new code is the 404 error table schema, proxy.ts 404 logging, and sitemap health analysis.

## Common Pitfalls

### Pitfall 1: ApexCharts SSR Crash
**What goes wrong:** Importing `react-apexcharts` without dynamic import causes "window is not defined" at build time.
**Why it happens:** ApexCharts accesses browser APIs at import time.
**How to avoid:** Always use `dynamic(() => import("react-apexcharts"), { ssr: false })` -- exactly as RevenueChart.tsx does.
**Warning signs:** Build failure mentioning "window" or "document".

### Pitfall 2: proxy.ts 404 Detection Timing
**What goes wrong:** 404 logging happens after i18n routing or before redirect matching, causing false positives.
**Why it happens:** proxy.ts is a pipeline -- order of operations matters.
**How to avoid:** Insert 404 logging AFTER redirect matching (lines 92-161) but BEFORE the auth/i18n pass-through. Only log marketing routes that pass through i18n and would result in a 404. The admin/portal/auth routes already have their own handling.
**Warning signs:** Internal admin routes or redirect targets appearing in the 404 table.

### Pitfall 3: Sitemap File Path in Production
**What goes wrong:** `fs.readFileSync("./src/app/sitemap.ts")` fails in production because the sitemap is generated at runtime, not stored as a static file.
**Why it happens:** Next.js `sitemap.ts` generates sitemap dynamically via `MetadataRoute.Sitemap` -- it's a server function, not a file.
**How to avoid:** For sitemap health, either: (a) call the sitemap function directly and count URLs from the returned array, or (b) fetch `https://conversionflow.com/sitemap.xml` via HTTP and parse the XML response. Option (a) is simpler and doesn't require network access.
**Warning signs:** `ENOENT: no such file or directory` in production.

### Pitfall 4: GA4 Data Without Environment Variables
**What goes wrong:** `getGa4Summary()` returns all "--" values when GA4 env vars are not configured, making the analytics overview look empty.
**Why it happens:** The function gracefully returns fallback data when `GA4_PROPERTY_ID`, `GA4_SERVICE_ACCOUNT_EMAIL`, or `GA4_PRIVATE_KEY` are missing.
**How to avoid:** Handle this case explicitly in the UI -- show the same info banner pattern as CoreWebVitalsCards: "Configure GA4 in Tracking settings for real data." This is consistent with the placeholder approach.
**Warning signs:** All overview cards showing "--" without explanation.

### Pitfall 5: Date Range Affecting Only GA4 Data
**What goes wrong:** Date range selector changes but 404 errors and sitemap health don't change (they're not time-series data).
**Why it happens:** 404 errors are cumulative log entries; sitemap health is point-in-time status.
**How to avoid:** Only pass date range to GA4-dependent server actions. For 404 errors, use `last_seen_at` for sorting/filtering but not the DateRangeSelector. For sitemap health, always show current state.
**Warning signs:** Date range change refreshing all sections unnecessarily.

## Code Examples

### Server Action: Get Sitemap Health (New in admin-seo.ts)
```typescript
// Follows requireAdmin() pattern from admin-seo.ts
export async function getSitemapHealth(): Promise<{
  totalUrls: number;
  lastGenerated: string;
  xmlValid: boolean;
  sitemapEnabled: boolean;
}> {
  await requireAdmin();

  try {
    // Call the sitemap function directly to count URLs
    // (avoids file-path issues in production)
    const { default: sitemapFn } = await import("@/app/sitemap");
    const entries = await sitemapFn();

    // Check if sitemap is enabled
    const enabledRow = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "seo_sitemap_enabled"))
      .limit(1);

    const lastGenRow = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "seo_sitemap_last_generated"))
      .limit(1);

    return {
      totalUrls: entries.length,
      lastGenerated: lastGenRow[0]?.value ?? "Never",
      xmlValid: Array.isArray(entries) && entries.length >= 0, // Valid if function returns array
      sitemapEnabled: enabledRow[0]?.value !== "false",
    };
  } catch {
    return {
      totalUrls: 0,
      lastGenerated: "Never",
      xmlValid: false,
      sitemapEnabled: false,
    };
  }
}
```

### Server Action: Get 404 Errors (New in admin-seo.ts)
```typescript
// Follows pattern from admin-dashboard.ts queries
export async function get404Errors(limit = 50): Promise<{
  errors: {
    id: string;
    url: string;
    referrer: string | null;
    hitCount: number;
    lastSeenAt: Date;
    createdAt: Date;
  }[];
  total: number;
}> {
  await requireAdmin();

  const errors = await db
    .select()
    .from(seo404Errors)
    .orderBy(desc(seo404Errors.lastSeenAt))
    .limit(limit);

  const [totalRow] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(seo404Errors);

  return { errors, total: totalRow.count };
}
```

### DB Schema: seo_404_errors Table
```typescript
// Add to src/lib/db/schema.ts
// Follows pattern of existing redirects table

export const seo404Errors = pgTable(
  "seo_404_errors",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    url: text("url").notNull(),
    referrer: text("referrer"),
    hitCount: integer("hit_count").default(1).notNull(),
    lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("seo_404_errors_url_idx").on(table.url),
    index("seo_404_errors_last_seen_idx").on(table.lastSeenAt),
  ]
);
```

### proxy.ts 404 Logging Insertion Point
```typescript
// In proxy.ts, AFTER the redirect matching block (line ~161) and
// BEFORE the auth/i18n section (line ~163):
//
// The key insight: proxy.ts currently does NOT have a 404 handler.
// Marketing routes pass through to handleI18nRouting, which internally
// handles the 404. Admin/portal routes pass through to NextResponse.next().
//
// Best approach: Add a dedicated "log404" server action that the
// not-found.tsx component calls, OR add it at the proxy level for
// marketing routes that fail i18n matching.
//
// However, proxy.ts cannot know if a route is truly 404 vs valid
// (the Next.js router handles that). The correct approach is:
// 1. Create a "use server" action: log404Error(url, referrer)
// 2. Call it from a client-side not-found component or layout error boundary
// 3. This action upserts into seo_404_errors (increment hit_count if URL exists)
```

### Multi-Series Chart (CTR + Impressions)
```typescript
// Extends RevenueChart pattern for dual-axis display
// Placeholder data for now (per D-01)

const series = [
  { name: "Impressions", data: [] },  // placeholder: empty array
  { name: "CTR", data: [] },          // placeholder: empty array
];

const options: ApexOptions = {
  chart: { type: "area", height: 310, toolbar: { show: false } },
  colors: ["#465FFF", "#34D399"],
  stroke: { curve: "smooth", width: 2 },
  fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: [],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { fontSize: "12px", colors: ["#6B7280"] } },
  },
  yaxis: [
    { labels: { style: { fontSize: "12px", colors: ["#6B7280"] } } },
    {
      opposite: true,
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (val: number) => val.toFixed(1) + "%",
      },
    },
  ],
  tooltip: { shared: true, intersect: false },
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ApexCharts direct import | Dynamic import with `ssr: false` | Project standard since Phase 5 | Must follow RevenueChart pattern exactly |
| Mock data for missing APIs | Honest "--" placeholders with connection notes | Established in Phase 12 (CWV, Image SEO) | Use identical pattern for Search Console data |
| middleware.ts | proxy.ts | Next.js 16 project convention | 404 logging must go in proxy.ts or server action |

**Deprecated/outdated:**
- Direct `import ApexCharts from "apexcharts"` -- causes SSR crash in Next.js App Router

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Sitemap function can be imported and called directly from a server action to count URLs | Code Examples | Would need HTTP fetch approach instead |
| A2 | proxy.ts cannot reliably detect 404s for marketing routes because i18n middleware handles routing internally | Code Examples | If wrong, could add 404 detection in proxy.ts directly |
| A3 | GA4 `getGa4Summary()` already provides enough data for ANLT-01 and ANLT-02 without modification | Phase Requirements | May need to extend the function for date range support |
| A4 | The `DateRangeSelector` can be reused as-is without modification | Architecture | Component accepts `string` range, may need type narrowing |

**Note:** Assumptions A1 and A2 have LOW risk because fallback approaches exist (HTTP fetch for sitemap, server action for 404 logging). Assumption A3 is MEDIUM risk because `getGa4Summary()` currently hardcodes a 7-day range -- the planner should verify whether extending it to accept a date range parameter is needed.

## Open Questions

1. **404 Logging Mechanism**
   - What we know: proxy.ts handles redirects and routing but does not have 404 detection. Next.js renders `not-found.tsx` for unmatched routes.
   - What's unclear: Whether to log 404s from proxy.ts (requires knowing if a route is valid before Next.js routing) or from a client/server action called when the not-found page renders.
   - Recommendation: Use a `"use server"` action `log404Error(url, referrer)` called from the not-found page or a dedicated 404 tracking component. This is more reliable than trying to detect 404s in proxy.ts, where we cannot determine if a marketing route is valid before i18n middleware processes it.

2. **GA4 Date Range Extension**
   - What we know: `getGa4Summary()` currently hardcodes `sevenDaysAgo` for the date range.
   - What's unclear: Whether CONTEXT.md expects the GA4 data to respect the DateRangeSelector or always show 7-day data.
   - Recommendation: Extend `getGa4Summary()` to accept an optional `range` parameter (defaulting to "7d") to align with the dashboard pattern. Use the same `getDateRange()` helper from `admin-dashboard.ts`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL | seo_404_errors table, 404 queries | (remote) | Drizzle ORM | -- |
| Node.js fs | Sitemap health analysis | (runtime) | 18+ | -- |
| ApexCharts | Charts | Installed | 5.12.0 | -- |
| react-apexcharts | React chart wrapper | Installed | 2.1.0 | -- |
| date-fns | Date formatting | Installed | 4.1.0 | -- |
| Drizzle Kit | DB migration generation | Installed | (existing) | -- |

**Missing dependencies with no fallback:**
- None -- all required dependencies are already installed.

**Missing dependencies with fallback:**
- None.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected (no test framework installed) |
| Config file | none |
| Quick run command | N/A |
| Full suite command | N/A |

**Note:** No test framework is installed in this project (confirmed from CLAUDE.md: "None detected - No test framework installed, no test files present"). The project relies on manual UAT testing per phase.

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANLT-01 | Indexed pages count and trend display | manual-only | N/A | No framework |
| ANLT-02 | Top performing pages table renders | manual-only | N/A | No framework |
| ANLT-03 | Keyword rankings placeholder displays | manual-only | N/A | No framework |
| ANLT-04 | CTR/impressions chart placeholder displays | manual-only | N/A | No framework |
| ANLT-05 | 404 errors table with DB logging | manual-only | N/A | No framework |
| ANLT-06 | Sitemap health cards display | manual-only | N/A | No framework |
| ANLT-07 | Charts, tables, badges, trend indicators render | manual-only | N/A | No framework |

### Sampling Rate
- **Per task commit:** Manual verification in dev browser
- **Per wave merge:** Full page walkthrough
- **Phase gate:** UAT checklist covering all 7 requirements

### Wave 0 Gaps
- No test framework -- project convention is manual UAT per phase
- No automated tests to create; validation via 13-UAT.md checklist

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | requireAdmin() guard on all server actions (established pattern) |
| V3 Session Management | yes | Better Auth session validation via requireAdmin() |
| V4 Access Control | yes | Admin-only access enforced at server action level |
| V5 Input Validation | yes | URL validation for 404 logging, range parameter validation |
| V6 Cryptography | no | No cryptographic operations in this phase |

### Known Threat Patterns for SEO Analytics Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized analytics access | Spoofing/Elevation | requireAdmin() on every server action |
| SQL injection via 404 URL logging | Tampering | Drizzle ORM parameterized queries (never raw SQL for user input) |
| XSS via referrer/URL in 404 table | Tampering | React auto-escapes rendered content; sanitize before DB insert |
| Excessive 404 log growth | Denial of Service | Consider hit_count aggregation (D-02 design); limit table growth via cleanup action |

## Sources

### Primary (HIGH confidence)
- Codebase review: `RevenueChart.tsx` -- ApexCharts dynamic import pattern, bar/area configuration
- Codebase review: `DashboardKPIs.tsx` -- KPI card with trend badge pattern
- Codebase review: `CoreWebVitalsCards.tsx` -- Placeholder card pattern with "--" values
- Codebase review: `DashboardPageClient.tsx` -- useTransition + DateRangeSelector integration
- Codebase review: `admin-dashboard.ts` -- Server action patterns, calcTrend(), getDateRange()
- Codebase review: `admin-seo.ts` -- requireAdmin() guard, settings queries
- Codebase review: `admin-tracking-v2.ts` -- getGa4Summary() implementation, GA4 JWT auth
- Codebase review: `proxy.ts` -- Redirect matching pipeline, route categorization
- Codebase review: `schema.ts` -- Table definition patterns, index creation
- Codebase review: `sitemap.ts` -- Sitemap generation function (callable from server action)
- Codebase review: `ComponentCard.tsx` -- Section wrapper pattern
- Codebase review: `DateRangeSelector.tsx` -- 7d/30d/90d/year range buttons
- Codebase review: `Badge.tsx` -- Status badge with variants
- Codebase review: `SettingsShell.tsx` -- Settings page navigation structure

### Secondary (MEDIUM confidence)
- pnpm registry verification: apexcharts 5.12.0, react-apexcharts 2.1.0 are latest

### Tertiary (LOW confidence)
- None -- all findings verified from codebase or registry

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and verified in codebase
- Architecture: HIGH -- following established patterns with direct code references
- Pitfalls: HIGH -- identified from direct codebase analysis (proxy.ts structure, sitemap.ts runtime generation)

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (stable -- no fast-moving dependencies)
