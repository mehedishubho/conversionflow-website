---
status: diagnosed
phase: 20-core-seo-configuration
source: Phase 20 roadmap success criteria + codebase analysis
started: 2026-06-06T19:45:00Z
updated: 2026-06-06T20:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. General SEO Settings
expected: Navigate to /admin/settings/seo/general. Form loads with site title, description, keywords, canonical URL fields. Can edit and save. SEO score updates after save.
result: pass

### 2. Site Verification
expected: Navigate to /admin/settings/seo/verification. Form shows fields for Google, Bing, Yandex, Baidu, Pinterest verification codes. Can enter codes and save. Meta tags render in page source after save.
result: pass
note: Success shown as green inline banner, not toast notification — by design.

### 3. Sitemap Configuration
expected: Navigate to /admin/settings/seo/sitemaps. Sitemap settings form loads. Can configure included pages, change frequencies, priorities. Sitemap health cards show status. "Ping search engines" button works.
result: pass
note: "Ping search engines" is integrated into the "Regenerate Sitemap" button which saves, regenerates, and pings Google/Bing.

### 4. robots.txt Management
expected: Navigate to /admin/settings/seo/robots. Code editor loads with current robots.txt content. Can edit and save. Changes reflect at /robots.txt public route.
result: issue
reported: "after refresh the page data removed"
severity: minor
note: Save shows success message but data does not persist on page refresh. Save flow (upsert) and load flow (getSeoSettings) both appear structurally correct. Needs deeper investigation — possible DB write issue or page cache.

### 5. SEO Sidebar Navigation
expected: In the settings sidebar, "SEO Settings" item expands to reveal sub-items (General, Verification, Sitemaps, Robots.txt, Schema, Social/OG). Each sub-item navigates correctly. Active item is highlighted.
result: pass

### 6. Public sitemap.xml and robots.txt
expected: Navigate to /sitemap.xml — valid XML sitemap loads with pages. Navigate to /robots.txt — valid robots.txt loads with configured rules including sitemap reference.
result: pass

## Summary

total: 6
passed: 5
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "robots.txt settings persist after page refresh"
  status: diagnosed
  reason: "User reported: after saving robots.txt settings and refreshing the page, the data is removed/lost. Save shows green success message but data doesn't persist."
  severity: minor
  test: 4
  artifacts: ["src/components/admin/seo/RobotsEditor.tsx", "src/app/(admin)/actions/admin-seo.ts", "src/lib/seo-keys.ts"]
  missing: []
  root_cause: "Under investigation. saveSeoSettings upsert pattern looks correct. getSeoSettings fetches ROBOTS_SEO_KEYS correctly. Possible: DB write not committing, Next.js page cache ignoring force-dynamic, or initialData not reflecting saved state."
  fix: "Debug the save/load cycle: add console logging to saveSeoSettings to verify DB write, check if getSeoSettings returns saved data on subsequent load, verify force-dynamic is honored."
