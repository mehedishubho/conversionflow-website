---
phase: 11-tracking-pixels-social-seo
reviewed: 2026-05-21T00:00:00Z
depth: quick
files_reviewed: 10
files_reviewed_list:
  - src/components/admin/seo/SchemaForm.tsx
  - src/components/admin/seo/EmptyStateWarning.tsx
  - src/components/admin/seo/EventLogPanel.tsx
  - src/components/admin/seo/GoogleTrackingForm.tsx
  - src/components/admin/seo/TikTokForm.tsx
  - src/components/admin/seo/MetaPixelForm.tsx
  - src/lib/schema-helpers.ts
  - src/lib/seo.ts
  - src/app/(admin)/admin/settings/seo/schema/page.tsx
  - src/app/(admin)/actions/admin-seo.ts
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 11: Code Review Report

**Reviewed:** 2026-05-21
**Depth:** quick
**Files Reviewed:** 10
**Status:** issues_found

## Summary

Reviewed 10 source files from Phase 11 (Tracking Pixels & Social SEO). The codebase is generally well-structured with proper admin auth guards on server actions, consistent error handling in JSON parsing, and clean separation between client components and server logic.

One critical security issue was identified: a Graph API token passed as a URL query parameter in a client-side fetch, which exposes the token in browser network logs, server access logs, and referrer headers. Additionally, four warnings were found related to credentials handling, missing header options in API calls, and potential token leakage during save.

## Critical Issues

### CR-01: Graph API Token Exposed in URL Query Parameter

**File:** `src/components/admin/seo/MetaPixelForm.tsx:181`
**Issue:** The Meta Graph API token is passed as a URL query parameter (`access_token=${graphApiToken}`) in a client-side `fetch()` call. This exposes the token in:
1. Browser network dev tools
2. Server access logs (the full URL including query string is typically logged)
3. Browser history
4. Any proxy or CDN logs between the client and Facebook's API

The Graph API supports passing the token via the `Authorization: Bearer` header instead, which is the recommended approach.

**Fix:**
```typescript
const res = await fetch(
  `https://graph.facebook.com/v21.0/${data.meta_pixel_id}?fields=name,status`,
  {
    headers: {
      Authorization: `Bearer ${graphApiToken}`,
    },
    signal: AbortSignal.timeout(15000),
  }
);
```

## Warnings

### WR-01: Graph API Token Stored in Component State and Potentially Persisted to DB

**File:** `src/components/admin/seo/MetaPixelForm.tsx:378-383`
**Issue:** The `_graph_api_token` is stored in component state alongside other tracking settings data. While the save handler filters keys via `META_PIXEL_KEYS` (which does not include `_graph_api_token`), the pattern of storing a credential in the same state object as settings that get saved is fragile. A future refactor could accidentally include it in the save payload. Additionally, the token is displayed in a password-type input but its `defaultValue` reads from the data state, meaning it persists in memory for the entire component lifecycle.

**Fix:** Store `_graph_api_token` in a separate `useState` variable instead of mixing it into the `data` state object that gets sent to `saveTrackingSettings`.

### WR-02: TikTok Events API Test Call Lacks Pixel ID in Payload

**File:** `src/components/admin/seo/TikTokForm.tsx:177-188`
**Issue:** The test connection fires a POST to TikTok's event track endpoint but does not include the `pixel_id` or `access_token` in the request body. The TikTok Business API requires an `access_token` header and `pixel_code` in the payload for event tracking. The current test call will always return an authentication error (not a format validation), making the "reachable" status check misleading -- it succeeds on HTTP 400 which could mean many things, not specifically that the pixel is correctly configured.

**Fix:** Either pass proper auth headers to make a real health check, or remove the API call and stick with local format validation only (as the Google form does).

### WR-03: GA4 Private Key Referenced in Client-Side Error Message

**File:** `src/components/admin/seo/GoogleTrackingForm.tsx:167`
**Issue:** The connection tester error message lists GA4 environment variable names including `GA4_PRIVATE_KEY`. While this is a helpful hint for the admin, mentioning a private key name in client-rendered output could encourage storing the actual key in an insecure location. The real concern is architectural: if these env vars are intended for server-side use only (which they should be for a private key), the client component should not be aware of them at all.

**Fix:** Replace the specific env var hint with a generic message like "Configure GA4 server-side credentials in your environment settings" or move the env var hint to a tooltip/documentation link.

### WR-04: Duplicated `parseJsonSetting` Utility Across Four Files

**File:** `src/components/admin/seo/SchemaForm.tsx:25-32`, `GoogleTrackingForm.tsx:35-42`, `TikTokForm.tsx:28-35`, `MetaPixelForm.tsx:31-38`, `src/lib/seo.ts:185-192`
**Issue:** The `parseJsonSetting` function is identically duplicated in five files. Any bug fix or enhancement must be applied in all five places. This is already a maintenance risk and will worsen as more tracking forms are added.

**Fix:** Extract to a shared utility in `src/lib/tracking-keys.ts` or a new `src/lib/json-utils.ts` and import it from all consumers.

## Info

### IN-01: EventLogPanel Uses Array Index as React Key

**File:** `src/components/admin/seo/EventLogPanel.tsx:129`
**Issue:** The events table uses `key={i}` (array index). Since events are `unshift`ed (newest first) and truncated at 50, using the index as key can cause React to mismatch DOM elements when items are added or removed from the front of the list. For a simple diagnostics panel this is unlikely to cause visible bugs, but it violates React best practices.

**Fix:** Generate a unique ID for each event (e.g., `timestamp + eventName` composite key) or use a counter in `logTrackingEvent`.

### IN-02: `saveSeoSettings` Executes N+1 Queries in a Loop

**File:** `src/app/(admin)/actions/admin-seo.ts:54-73`
**Issue:** For each key in the input, the code performs a SELECT to check existence, then an UPDATE or INSERT. For N keys, this results in 2N database queries. The `saveTrackingSettings` action in `admin-tracking-v2.ts` has the same pattern. This is a data-access efficiency concern but not a correctness bug.

**Fix:** Consider using an "upsert" pattern (e.g., `ON CONFLICT ... DO UPDATE`) to reduce to N queries, or batch the existence check into a single SELECT.

### IN-03: `createPageMetadata` Calls `getCachedSeoOverrides` Redundantly

**File:** `src/lib/seo.ts:133`
**Issue:** `createPageMetadata` calls `getCachedSeoOverrides()` directly even though it only needs a few specific values. The function also calls `getSeoSetting` (line 125) which itself calls `getCachedSeoOverrides` again. While the naming suggests "cached," there is no actual caching -- each call hits the database. This is not a bug but a wasted query opportunity.

**Fix:** Have `createPageMetadata` call `getCachedSeoOverrides` once and extract the needed values directly, or implement actual caching with a module-level variable or request-scoped cache.

---

_Reviewed: 2026-05-21_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: quick_
