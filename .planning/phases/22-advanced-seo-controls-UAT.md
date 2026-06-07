---
status: diagnosed
phase: 22-advanced-seo-controls
source: Phase 22 (v2.1) roadmap success criteria + codebase analysis
started: 2026-06-06T21:45:00Z
updated: 2026-06-06T22:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. URL Redirect Management
expected: Navigate to /admin/settings/seo/redirects. Redirect table loads with add/edit form, search/filter, CSV import/export. Can create 301/302 redirects.
result: pass

### 2. AI SEO & LLMs.txt
expected: Navigate to /admin/settings/seo/ai-seo. AI bot toggles for 8 crawlers, usage rules, llms.txt preview. Can save.
result: pass

### 3. Image SEO Optimization
expected: Navigate to /admin/settings/seo/image-seo. Image stats cards, auto ALT/WebP/lazy loading/compression toggles. Can save.
result: pass

### 4. Performance SEO
expected: Navigate to /admin/settings/seo/performance. Core Web Vitals cards, critical CSS/JS defer/minification toggles, CDN URL, cache settings. Can save.
result: pass

### 5. Page-Level SEO Overrides
expected: Navigate to /admin/settings/seo/page-level. Select a page, edit title/description/keywords, save. Override reflects on the live marketing page.
result: issue
reported: "when I update title it doesnt reflect on selected page for website"
severity: major
note: "Fixed ReferenceError (SeoOverrides inline, commit a3eaaf0). But the core issue remains: 10 of 12 marketing pages use hardcoded static metadata instead of createPageMetadata(). Even the 2 pages that use it assign a Promise to export const metadata (should be generateMetadata function)."

### 6. SEO Sidebar Navigation
expected: Sidebar shows Redirects, AI SEO, Image SEO, Performance, Page-Level SEO sub-items. All navigate correctly.
result: pass

## Summary

total: 6
passed: 5
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Page-level SEO overrides reflect on live marketing pages"
  status: diagnosed
  reason: "User reported: page-level SEO title override does not appear on the actual website page after saving."
  severity: major
  test: 5
  artifacts: ["src/app/(marketing)/features/page.tsx", "src/app/(marketing)/pricing/page.tsx", "src/app/(marketing)/blog/page.tsx", "src/app/(marketing)/support/page.tsx", "src/app/(marketing)/docs/page.tsx", "src/app/(marketing)/changelog/page.tsx", "src/app/(marketing)/terms/page.tsx", "src/app/(marketing)/privacy/page.tsx", "src/app/(marketing)/refund/page.tsx", "src/app/(marketing)/license/page.tsx", "src/app/(marketing)/faq/page.tsx", "src/app/(marketing)/platform-comparison/page.tsx", "src/lib/seo.ts", "src/lib/page-seo-config.ts"]
  missing: []
  root_cause: "Two issues: (1) 10 of 12 marketing pages export hardcoded static metadata objects — they never call createPageMetadata() to read DB overrides. (2) The 2 pages that do use createPageMetadata() assign its return value (a Promise) to export const metadata instead of using export async function generateMetadata()."
  fix: "Convert all 12 marketing pages from static `export const metadata` to `export async function generateMetadata()` that calls `createPageMetadata(pageKey, locale)`. The pageKey must match a key in pageSeo config. The locale should be read from params or default to 'en'."
