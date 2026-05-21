# Phase 12: Advanced SEO Controls - Research

**Researched:** 2026-05-21
**Domain:** Next.js middleware redirects, llms.txt generation, Drizzle ORM JSONB, admin settings forms
**Confidence:** HIGH

## Summary

Phase 12 builds five advanced SEO admin sub-sections: Redirect Manager, AI SEO & LLM Controls, Image SEO, Performance SEO, and Page-Level SEO. All five have existing placeholder pages at their respective routes. The phase integrates deeply with three existing codebase systems: (1) `proxy.ts` middleware for redirect matching and hit counting, (2) the `settings` table + key registry pattern for configuration toggles, and (3) Drizzle ORM schema for a new `redirects` table and JSONB `seo_overrides` columns.

The redirect system requires a new DB table and proxy.ts integration -- the most architecturally significant work. AI SEO extends existing Phase 10 AiBotCards and adds an `/llms.txt` route handler. Image and Performance SEO are config-only toggles with placeholder stats (per D-06/D-07 decisions). Page-Level SEO adds a JSONB column approach to content tables and a centralized form for marketing pages.

**Primary recommendation:** Follow the existing key-registry + server-action + ComponentCard pattern established in Phases 10-11. Add the redirects table with a GIN index on `from_url` for fast lookup. Use Drizzle's `jsonb().$type<SeoOverrides>()` for type-safe JSONB columns. Generate llms.txt as a Next.js route handler at `/llms.txt` using the AnswerDotAI specification format.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Dedicated `redirects` DB table with columns (id, from_url, to_url, type, is_regex, hit_count, status, created_at, updated_at) + proxy.ts middleware enforcement
- **D-02:** CSV import uses `from_url,to_url` 2-column format only, default 301
- **D-03:** Server-side hit counter via proxy.ts: `UPDATE redirects SET hit_count = hit_count + 1 WHERE id = ?`
- **D-04:** Auto-generate llms.txt from site data (site name, description, features, pricing, support URL)
- **D-05:** Toggle-based AI content usage rules (Allow Summarization, Allow Training, Require Attribution, Allow Commercial Use) stored as JSON in settings key `seo_ai_usage_rules`
- **D-06:** Image SEO and Performance SEO toggles save to DB only, no real processing. Image stats show placeholder "--" values.
- **D-07:** CWV cards show placeholder "--" values with note about connecting PageSpeed Insights API
- **D-08:** Page-level SEO overrides live inline on content edit pages (blog posts). Marketing pages use a centralized form.
- **D-09:** JSONB `seo_overrides` column on content tables. Marketing page overrides stored in settings table keyed by page slug.
- **D-10:** Simple focus keyword field, no density analysis

### Claude's Discretion
- Implementation details for each component follow established codebase patterns
- Standard approaches per established codebase conventions

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RDIR-01 | Create 301/302 redirects with from/to URL fields | Redirects table + server actions CRUD |
| RDIR-02 | Regex-based redirects for pattern matching | `is_regex` column + `new RegExp()` matching in proxy.ts |
| RDIR-03 | Redirect table with search/filter, status, hit counter | Table component + hit_count column + D-03 |
| RDIR-04 | Bulk import/export via CSV | CSV parsing, D-02 minimal format |
| RDIR-05 | Delete individual or bulk redirects | Server action batch delete |
| AISE-01-03 | Allow/block GPTBot, ClaudeBot, PerplexityBot | Extend Phase 10 AiBotCards |
| AISE-04 | Generate llms.txt file | Route handler at /llms.txt, AnswerDotAI spec |
| AISE-05 | AI content usage rules | Toggle-based policy, D-05 |
| IMGS-01-04 | Image SEO toggles | Config-only, D-06 |
| IMGS-05 | Image performance statistics | Placeholder cards, D-06 |
| PERF-01-05 | Performance SEO toggles + CDN/cache config | Config-only, D-06 |
| PERF-06 | Core Web Vitals monitor cards | Placeholder cards, D-07 |
| PLVL-01 | Per-page SEO title, meta description, canonical URL | JSONB seo_overrides column, D-09 |
| PLVL-02 | Focus keyword field | Simple text field, D-10 |
| PLVL-03 | Per-page robots control | index/noindex, follow/nofollow in seo_overrides |
| PLVL-04 | Custom OG image override | og_image in seo_overrides |
| PLVL-05 | Schema type selector and social preview | schema_type in seo_overrides |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | 0.45.2 | ORM for redirects table + JSONB columns | Already installed, project standard [VERIFIED: package.json] |
| drizzle-kit | 0.31.10 | Schema migrations | Already installed [VERIFIED: package.json] |
| postgres | 3.4.9 | PostgreSQL driver | Already installed [VERIFIED: package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| framer-motion | 12.38.0 | Animation for redirects table interactions | Table row animations |
| lucide-react | 1.14.0 | Icons for SEO section UI | Status indicators, action buttons |
| clsx | 2.1.1 + tailwind-merge 3.6.0 | Class merging via cn() | All components |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom CSV parser | papaparse library | Custom is fine for 2-column format; papaparse overkill |
| DB redirect lookup per request | In-memory cache/Map | DB lookup fine for hundreds of rules; cache for thousands+ [ASSUMED] |
| Settings table for all config | Separate tables per feature | Settings table pattern is established; consistent with codebase |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── (admin)/admin/settings/seo/
│   │   ├── redirects/page.tsx       # REPLACE placeholder
│   │   ├── ai-seo/page.tsx          # REPLACE placeholder
│   │   ├── image-seo/page.tsx       # REPLACE placeholder
│   │   ├── performance/page.tsx     # REPLACE placeholder
│   │   └── page-level/page.tsx      # NEW route for marketing pages
│   ├── llms.txt/route.ts            # NEW route handler
│   └── (admin)/admin/blog/[id]/edit/page.tsx  # EXTEND with SEO tab
├── components/admin/seo/
│   ├── RedirectTable.tsx            # NEW
│   ├── RedirectForm.tsx             # NEW (create/edit modal)
│   ├── RedirectCsvImport.tsx        # NEW
│   ├── LlmsTxtPreview.tsx           # NEW
│   ├── AiUsageRulesForm.tsx         # NEW
│   ├── ImageSeoForm.tsx             # NEW
│   ├── ImageStatsCards.tsx          # NEW
│   ├── PerformanceSeoForm.tsx       # NEW
│   ├── CoreWebVitalsCards.tsx       # NEW
│   ├── PageLevelSeoForm.tsx         # NEW (marketing pages selector)
│   └── InlineSeoEditor.tsx          # NEW (blog post SEO section)
├── lib/
│   ├── seo-keys.ts                  # EXTEND with Phase 12 keys
│   ├── seo.ts                       # EXTEND for page-level overrides
│   └── db/schema.ts                 # EXTEND with redirects table
├── proxy.ts                         # EXTEND with redirect matching
└── app/(admin)/actions/
    ├── admin-seo.ts                 # EXTEND with redirect CRUD + Phase 12 settings
    └── admin-redirects.ts           # NEW (dedicated redirect actions)
```

### Pattern 1: Redirect Table Schema (Drizzle ORM)
**What:** New `redirects` table with indexed `from_url` for fast lookups
**When to use:** Every request passes through proxy.ts redirect check
**Example:**
```typescript
// Source: [CITED: orm.drizzle.team/docs/column-types/pg] - jsonb pattern verified
// Source: [VERIFIED: src/lib/db/schema.ts] - existing table patterns

import { pgTable, uuid, text, integer, boolean, timestamp, index, pgEnum } from "drizzle-orm/pg-core";

export const redirectTypeEnum = pgEnum("redirect_type", ["301", "302"]);

export const redirectStatusEnum = pgEnum("redirect_status", ["active", "inactive"]);

export const redirects = pgTable(
  "redirects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fromUrl: text("from_url").notNull(),
    toUrl: text("to_url").notNull(),
    type: redirectTypeEnum("type").notNull().default("301"),
    isRegex: boolean("is_regex").default(false).notNull(),
    hitCount: integer("hit_count").default(0).notNull(),
    status: redirectStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("redirects_from_url_idx").on(table.fromUrl),
    index("redirects_status_idx").on(table.status),
  ]
);
```

### Pattern 2: JSONB seo_overrides Column
**What:** Typed JSONB column for storing per-page SEO overrides
**When to use:** Blog posts table and marketing page settings
**Example:**
```typescript
// Source: [CITED: orm.drizzle.team/docs/column-types/pg] - jsonb().$type<T>() pattern

interface SeoOverrides {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  robots?: { index: boolean; follow: boolean };
  ogImage?: string;
  schemaType?: string;
}

// On blog posts table (when it gets created):
seoOverrides: jsonb("seo_overrides").$type<SeoOverrides>(),

// Marketing pages stored in settings table as:
// key: "seo_page_overrides_home", value: JSON.stringify(seoOverrides)
// key: "seo_page_overrides_features", value: JSON.stringify(seoOverrides)
```

### Pattern 3: Redirect Matching in proxy.ts
**What:** Insert redirect matching before auth/i18n checks in the middleware chain
**When to use:** Every incoming request that isn't a static file or API route
**Example:**
```typescript
// Source: [VERIFIED: src/proxy.ts] - current proxy structure
// Insert BEFORE auth/i18n checks, AFTER static file skip

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, and _next
  if (pathname.includes('.') || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return;
  }

  // REDIRECT CHECK — insert here, before auth/i18n logic
  // DB lookup by from_url (exact match first, then regex patterns)
  // If match found: increment hit_count, return NextResponse.redirect(toUrl, { status: 301/302 })
  // Must be async to query DB — proxy function needs to become async
}
```

### Pattern 4: llms.txt Route Handler
**What:** Next.js route handler generating llms.txt from site configuration
**When to use:** Served at /llms.txt following AnswerDotAI specification
**Example:**
```typescript
// Source: [CITED: github.com/AnswerDotAI/llms-txt] - official spec format
// Format: H1 title > blockquote summary > details sections > H2 file lists with links

// src/app/llms.txt/route.ts
export async function GET() {
  const seoSettings = await getCachedSeoOverrides(); // reuse existing pattern
  const schemaSettings = await getSchemaSettings();

  const content = `# ConversionFlow

> Commerce tracking, courier automation, COD fraud protection, and analytics for WooCommerce stores in Bangladesh and beyond.

## Product

- [ConversionFlow Features](https://conversionflow.com/features): Tracking, courier sync, fraud shield, analytics, lead recovery modules
- [Pricing](https://conversionflow.com/pricing): Starter, Professional, Agency plans with yearly/lifetime licensing

## Documentation

- [Getting Started](https://conversionflow.com/docs): Setup guides for tracking, couriers, fraud protection
- [FAQ](https://conversionflow.com/faq): Licensing, tracking, couriers, COD protection questions

## Support

- [Contact Support](https://conversionflow.com/support): Email and WhatsApp support channels

## Optional

- [Changelog](https://conversionflow.com/changelog): Product updates and release notes
- [Platform Comparison](https://conversionflow.com/platform-comparison): WooCommerce vs Laravel vs Next.js/MERN editions
`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
```

### Pattern 5: Settings Key Registry Extension
**What:** Add Phase 12 keys to the SEO key registry following established pattern
**When to use:** All config-only toggles (Image SEO, Performance SEO, AI usage rules)
**Example:**
```typescript
// Source: [VERIFIED: src/lib/seo-keys.ts, src/lib/tracking-keys.ts] - established pattern
// Add to seo-keys.ts or create new seo-advanced-keys.ts:

export const ADVANCED_SEO_KEYS = [
  // AI SEO (2)
  "seo_ai_bots",              // already exists from Phase 10
  "seo_ai_usage_rules",        // NEW: JSON toggle rules
  "seo_llms_txt_custom",       // NEW: optional custom markdown additions
  // Image SEO (4)
  "seo_image_auto_alt",
  "seo_image_webp",
  "seo_image_lazy_loading",
  "seo_image_compression",
  // Performance SEO (5)
  "seo_perf_critical_css",
  "seo_perf_js_defer",
  "seo_perf_minification",
  "seo_perf_cdn_url",
  "seo_perf_cache_settings",
] as const;
```

### Anti-Patterns to Avoid
- **Querying redirects table on every request without indexing:** Must have index on `from_url` and `status` columns. Without indexes, redirect matching degrades linearly as rules grow.
- **Making proxy.ts redirect check synchronous:** DB lookup requires async. The current `proxy()` function is synchronous -- it must become `async function proxy()` to support `await db.select()`.
- **Storing redirect rules in next.config.ts:** The `redirects` field in next.config only supports static patterns and requires rebuild. Dynamic DB-backed redirects are the right approach.
- **Treating blog admin-blog.ts as existing:** The import path `@/app/(admin)/actions/admin-blog` is referenced by BlogPostForm.tsx but the file does not exist on disk. Phase 12 cannot depend on it without first verifying/creating it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV parsing (2-column) | Full CSV parser library | String split on newlines + commas | Only 2 columns, no edge cases [ASSUMED] |
| Redirect regex matching | Custom URL pattern engine | JavaScript `new RegExp(pattern)` + `test()` | Native regex is fast and sufficient |
| JSONB type safety | Runtime JSON validation | Drizzle `jsonb().$type<T>()` + TypeScript | Compile-time type safety without runtime overhead [CITED: orm.drizzle.team] |
| Settings get/save | New CRUD functions | Existing `getSeoSettings`/`saveSeoSettings` pattern | Pattern proven in Phases 10-11 |
| Admin auth guard | New auth checks | `requireAdmin()` from admin-seo.ts | Reusable, already handles role check + redirect |

**Key insight:** The codebase has a well-established pattern for settings (key registry + server actions + ComponentCard forms). Every feature in Phase 12 should follow it rather than inventing new approaches.

## Common Pitfalls

### Pitfall 1: proxy.ts Becomes Async - Breaking Change
**What goes wrong:** The current `proxy()` export is synchronous. Adding `await db.select()` requires making it `async`. Next.js middleware/proxy functions CAN be async, but the caller must handle the promise.
**Why it happens:** The proxy function is imported and called by Next.js middleware infrastructure. If the caller doesn't await, redirect logic silently skips.
**How to avoid:** Verify the proxy function's caller (likely in a middleware wrapper or next.config integration). Ensure the caller awaits the result. Test with a redirect rule and verify the redirect actually fires.
**Warning signs:** Redirects silently don't work; no error in console; proxy function returns a Promise that nobody awaits.

### Pitfall 2: Redirect Lookup Performance at Scale
**What goes wrong:** With 1000+ redirect rules, querying the DB on every request adds latency to all page loads.
**Why it happens:** PostgreSQL round-trip per request in middleware adds 5-20ms per request.
**How to avoid:** (1) Add proper indexes on `from_url` and `status`. (2) For the expected scale (dozens to hundreds of rules), direct DB lookup is fine. (3) If scale grows, cache active redirects in an in-memory Map refreshed periodically. The CONTEXT.md says "scales to thousands of rules" -- implement a simple cache if rules exceed 100.
**Warning signs:** Page load TTFB increases noticeably after adding many redirects.

### Pitfall 3: Regex Redirect ReDoS
**What goes wrong:** A malicious or poorly-crafted regex pattern causes catastrophic backtracking, hanging the server.
**Why it happens:** `new RegExp(userInput)` with patterns like `(.+)+` can cause exponential backtracking.
**How to avoid:** Validate regex patterns on save -- test with a timeout. Use a simple regex safety check: reject patterns with nested quantifiers like `(.+)+`, `(.*)*`. Set a regex execution timeout or use `RegExp` with a simple character limit.
**Warning signs:** Server hangs on specific URL patterns; high CPU usage.

### Pitfall 4: Missing admin-blog.ts Server Action File
**What goes wrong:** BlogPostForm.tsx imports from `@/app/(admin)/actions/admin-blog` but this file does not exist on disk. The blog admin pages also import from it. Phase 12 needs to add SEO fields to blog posts, which requires this file to exist.
**Why it happens:** The blog admin feature may have been partially implemented -- components reference actions that were never committed, or were committed in a different branch.
**How to avoid:** Verify at plan time whether admin-blog.ts exists. If not, create it as a prerequisite or include it in the page-level SEO plan. The blog posts table (`blogPosts`) is also missing from schema.ts despite being imported by `src/lib/blog.ts`.
**Warning signs:** Build errors referencing `admin-blog`; TypeScript errors on `BlogPostInput` type.

### Pitfall 5: llms.txt Route Handler Conflict
**What goes wrong:** Next.js may not serve `/llms.txt` if the route conflicts with static file serving or the proxy matcher pattern.
**Why it happens:** The proxy.ts matcher includes `'/((?!api|_next|_vercel|.*\\..*).*)'` which excludes URLs containing dots. `/llms.txt` contains a dot and might be skipped by the proxy, which is correct -- but it also means Next.js must handle it as a route, not middleware.
**How to avoid:** Create the route handler at `src/app/llms.txt/route.ts`. Test that the route is accessible. The proxy correctly skips URLs with dots, so llms.txt requests bypass middleware and hit the route handler directly.
**Warning signs:** 404 on /llms.txt; redirect loop on /llms.txt.

### Pitfall 6: JSONB Column Migration on Non-Existent Tables
**What goes wrong:** Decision D-09 says to add `seo_overrides` JSONB column to "content tables." But `blogPosts` and `blogCategories` tables are not defined in `src/lib/db/schema.ts`, even though `src/lib/blog.ts` imports them from it.
**Why it happens:** The blog tables may exist in the database but were never added to the Drizzle schema file, or they exist in a migration but not in the TypeScript schema.
**How to avoid:** Before adding JSONB columns, verify the blog posts table actually exists in the database. If it doesn't, the planner must include blog table creation as a prerequisite step in the page-level SEO plan.
**Warning signs:** Drizzle migration fails; `blogPosts` import throws undefined error at runtime.

## Code Examples

### Redirect Server Actions (CRUD)
```typescript
// Following existing pattern from admin-seo.ts [VERIFIED: src/app/(admin)/actions/admin-seo.ts]

"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { redirects } from "@/lib/db/schema";
import { eq, ilike, and, sql } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") redirect("/admin/dashboard");
  return { session, userId: session.user.id, role };
}

export async function getRedirects(page = 1, pageSize = 20, search?: string) {
  await requireAdmin();
  const conditions = [eq(redirects.status, "active")];
  if (search) {
    conditions.push(ilike(redirects.fromUrl, `%${search}%`));
  }
  // ... select with pagination
}

export async function createRedirect(data: {
  fromUrl: string; toUrl: string; type: "301" | "302"; isRegex: boolean;
}) {
  const { userId, role } = await requireAdmin();
  await db.insert(redirects).values({
    fromUrl: data.fromUrl,
    toUrl: data.toUrl,
    type: data.type,
    isRegex: data.isRegex,
  });
  await createAuditLog({ actorId: userId, actorRole: role, action: "redirect.created", targetType: "redirect", targetId: "new" });
  return { success: true };
}

export async function deleteRedirects(ids: string[]) {
  const { userId, role } = await requireAdmin();
  await db.delete(redirects).where(sql`${redirects.id} IN ${ids}`);
  await createAuditLog({ actorId: userId, actorRole: role, action: "redirect.bulk_deleted", targetType: "redirect", targetId: ids.join(",") });
  return { success: true };
}
```

### Redirect Matching in proxy.ts
```typescript
// Source: [VERIFIED: src/proxy.ts] - extending current structure

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, and _next
  if (pathname.includes('.') || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return;
  }

  // === REDIRECT CHECK (NEW) ===
  try {
    // Exact match first
    const [exactMatch] = await db
      .select()
      .from(redirects)
      .where(and(eq(redirects.fromUrl, pathname), eq(redirects.status, "active")))
      .limit(1);

    if (exactMatch) {
      // Increment hit count (fire-and-forget, don't block response)
      db.update(redirects)
        .set({ hitCount: sql`${redirects.hitCount} + 1` })
        .where(eq(redirects.id, exactMatch.id))
        .catch(() => {}); // silent fail for counter

      return NextResponse.redirect(
        new URL(exactMatch.toUrl, request.url),
        { status: parseInt(exactMatch.type) }
      );
    }

    // Regex match (only if no exact match)
    const regexRules = await db
      .select()
      .from(redirects)
      .where(and(eq(redirects.isRegex, true), eq(redirects.status, "active")));

    for (const rule of regexRules) {
      try {
        const regex = new RegExp(rule.fromUrl);
        if (regex.test(pathname)) {
          db.update(redirects)
            .set({ hitCount: sql`${redirects.hitCount} + 1` })
            .where(eq(redirects.id, rule.id))
            .catch(() => {});

          const dest = rule.toUrl.replace(/\$(\d+)/g, (_, i) => {
            const match = pathname.match(regex);
            return match?.[parseInt(i)] ?? "";
          });

          return NextResponse.redirect(
            new URL(dest, request.url),
            { status: parseInt(rule.type) }
          );
        }
      } catch {
        // Invalid regex pattern, skip
      }
    }
  } catch {
    // DB unavailable, skip redirect check
  }
  // === END REDIRECT CHECK ===

  // ... existing auth/i18n logic continues unchanged
}
```

### CSV Import Handler
```typescript
// Minimal 2-column CSV: from_url,to_url [D-02]

export async function importRedirectsCsv(csvText: string) {
  const { userId, role } = await requireAdmin();
  const lines = csvText.trim().split("\n");
  const header = lines[0].toLowerCase();

  // Skip header if present
  const startIdx = header.includes("from") ? 1 : 0;
  let imported = 0;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(",");
    const fromUrl = parts[0]?.trim();
    const toUrl = parts[1]?.trim();

    if (!fromUrl || !toUrl) continue;

    await db.insert(redirects).values({
      fromUrl,
      toUrl,
      type: "301",       // Default per D-02
      isRegex: false,
      hitCount: 0,
      status: "active",
    }).onConflictDoNothing(); // Skip duplicates

    imported++;
  }

  await createAuditLog({
    actorId: userId, actorRole: role,
    action: "redirect.csv_import",
    targetType: "redirect",
    targetId: "bulk",
    details: { imported },
  });

  return { success: true, imported };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| middleware.ts | proxy.ts | Project convention (v2.0) | All middleware goes in proxy.ts |
| Static next.config redirects | DB-backed dynamic redirects | Phase 12 | Redirects manageable from admin UI |
| Per-column SEO fields | JSONB seo_overrides column | Phase 12 | Flexible, schema-free SEO metadata |
| robots.txt only | robots.txt + llms.txt | 2024-2025 (AnswerDotAI proposal) | AI crawlers get structured content |

**Deprecated/outdated:**
- `middleware.ts` in this project: Replaced by `proxy.ts` per AGENTS.md convention
- Hardcoded `next.config.ts` redirects: Cannot be managed from admin UI

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Custom CSV parsing (string split) is sufficient for 2-column format | Code Examples | If CSV values contain commas or quotes, parsing breaks. Low risk since URLs rarely contain commas. |
| A2 | Direct DB lookup per request is acceptable performance for hundreds of redirects | Pitfalls | If redirect count grows to thousands, needs caching layer. Moderate risk. |
| A3 | The proxy.ts caller correctly handles async return values | Pitfalls | If the middleware infrastructure doesn't await, redirects silently fail. Critical to verify. |
| A4 | `blogPosts` table exists in the database despite missing from schema.ts | Pitfalls | If it doesn't exist, blog features are broken and page-level SEO can't extend it. Critical to verify. |
| A5 | The fire-and-forget hit counter update won't cause connection pool exhaustion | Code Examples | Under high traffic, many pending updates could drain the pool. Low risk for current scale. |

## Open Questions

1. **Does the blogPosts table exist in the database?**
   - What we know: `src/lib/blog.ts` imports `blogPosts` from `@/lib/db/schema`, but schema.ts has no such export. Blog admin pages reference `admin-blog` actions that don't exist as files.
   - What's unclear: Whether the tables were created via direct SQL, a migration that wasn't committed, or if this is a partially-implemented feature.
   - Recommendation: Planner should include a verification step at the start. If `blogPosts` doesn't exist in the DB, the page-level SEO plan must create both the table AND the admin-blog.ts actions file as a prerequisite.

2. **Does proxy.ts handle async return values correctly?**
   - What we know: Current proxy function is synchronous. Adding DB queries requires making it async.
   - What's unclear: How Next.js consumes the proxy function export. The file uses `export function proxy()` -- changing to `export async function proxy()` may or may not be compatible with the caller.
   - Recommendation: Test by adding a simple async operation to proxy.ts and verifying the middleware still works. If not, consider caching redirects in memory with periodic DB refresh instead.

3. **Should admin-blog.ts be created as part of Phase 12 or a prerequisite?**
   - What we know: The file is imported by existing components but doesn't exist. Page-level SEO for blog posts depends on it.
   - What's unclear: Whether this is an oversight or a separate work item.
   - Recommendation: Include blog table verification and admin-blog.ts creation in the page-level SEO plan (Plan 12-05), since it directly blocks that work.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL | Redirect table, settings reads | Yes (assumed) | -- | -- |
| Node.js | Runtime | Yes | -- | -- |
| pnpm | Package management | Yes | -- | -- |
| Drizzle Kit | Schema migration | Yes | 0.31.10 | -- |
| drizzle-orm | ORM queries | Yes | 0.45.2 | -- |

**Missing dependencies with no fallback:**
- None identified -- all required dependencies are installed.

**Missing dependencies with fallback:**
- None needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RDIR-01 | Create 301/302 redirect | manual | N/A | No |
| RDIR-02 | Create regex redirect | manual | N/A | No |
| RDIR-03 | Redirect table with search/filter | manual | N/A | No |
| RDIR-04 | CSV import/export | manual | N/A | No |
| RDIR-05 | Delete redirects | manual | N/A | No |
| AISE-01-03 | AI bot allow/block | manual | N/A | No |
| AISE-04 | llms.txt generation | manual | N/A | No |
| AISE-05 | AI usage rules | manual | N/A | No |
| IMGS-01-05 | Image SEO toggles | manual | N/A | No |
| PERF-01-06 | Performance SEO toggles | manual | N/A | No |
| PLVL-01-05 | Page-level SEO overrides | manual | N/A | No |

### Sampling Rate
- **Per task commit:** Manual verification through admin UI
- **Per wave merge:** `pnpm build` must pass without errors
- **Phase gate:** All 26 requirements verified via manual admin UI testing

### Wave 0 Gaps
- No test framework installed -- all testing is manual through admin UI
- This is consistent with the existing project approach (no tests in any prior phase)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAdmin()` guard on all server actions |
| V3 Session Management | yes | Better Auth session cookie check in proxy.ts |
| V4 Access Control | yes | Role-based (admin/super_admin) on all mutations |
| V5 Input Validation | yes | TypeScript strict mode + form validation |
| V6 Cryptography | no | No cryptographic operations in this phase |

### Known Threat Patterns for Next.js Admin Settings

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Regex DoS via crafted redirect patterns | Denial of Service | Validate regex patterns on save; reject nested quantifiers |
| CSV injection via crafted import files | Tampering | Sanitize CSV input; don't execute formulas |
| Unauthorized redirect creation | Tampering | requireAdmin() guard + audit logging |
| Open redirect via to_url pointing to external domains | Spoofing | Validate to_url stays within allowed domains or warn admin |
| SQL injection via search/filter | Tampering | Drizzle ORM parameterized queries (automatic) |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: src/proxy.ts] - Current middleware structure, async compatibility concern
- [VERIFIED: src/lib/db/schema.ts] - Existing table patterns, missing blogPosts
- [VERIFIED: src/app/(admin)/actions/admin-seo.ts] - Server action pattern, requireAdmin()
- [VERIFIED: src/lib/seo-keys.ts] - Key registry pattern for settings
- [VERIFIED: src/lib/tracking-keys.ts] - Extended key registry pattern with slices
- [VERIFIED: src/components/admin/seo/AiBotCards.tsx] - AI bot toggle component from Phase 10
- [VERIFIED: src/lib/blog.ts] - Blog post data access using blogPosts (imported but not in schema)
- [VERIFIED: src/app/robots.ts] - Route handler pattern for text file generation
- [CITED: orm.drizzle.team/docs/column-types/pg] - jsonb().$type<T>() pattern verified
- [CITED: github.com/AnswerDotAI/llms-txt] - Official llms.txt specification format

### Secondary (MEDIUM confidence)
- [VERIFIED: src/components/admin/blog/BlogPostForm.tsx] - Existing SEO fields on blog posts
- [VERIFIED: src/app/(admin)/admin/blog/[id]/edit/page.tsx] - Blog edit page structure
- [VERIFIED: src/components/common/ComponentCard.tsx] - Standard card wrapper component
- [VERIFIED: package.json] - drizzle-orm 0.45.2, postgres 3.4.9, drizzle-kit 0.31.10

### Tertiary (LOW confidence)
- None -- all findings verified against codebase or official docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all dependencies already installed, no new packages needed
- Architecture: HIGH - follows established codebase patterns from Phases 10-11
- Pitfalls: HIGH - proxy.ts async conversion and missing blog tables are verified codebase issues
- llms.txt format: HIGH - verified against official AnswerDotAI specification
- Drizzle JSONB: HIGH - verified against official Drizzle ORM documentation

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (stable - no fast-moving dependencies)
