---
status: completed
phase: 13-seo-analytics
source: [13-01-SUMMARY.md, 13-02-SUMMARY.md, 13-03-SUMMARY.md]
started: 2026-05-22T01:39:00.000Z
updated: 2026-05-22T02:15:00.000Z
completed: 2026-05-22T02:15:00.000Z
---

## Current Test

All tests completed.

## Tests

### 1. Analytics Dashboard Page Renders
expected: Navigate to /admin/settings/seo/analytics. Page loads with 6 ComponentCard sections visible: Overview (KPI cards), Keyword Rankings, CTR/Impressions, 404 Errors, Sitemap Health, Crawl Issues. Each section has a heading and content area.
result: pass

### 2. KPI Cards Display GA4 Data or Fallback
expected: On the analytics dashboard, see 4 KPI cards: Pageviews, Active Users, Sessions, 404 Errors. If GA4 is connected, cards show real numbers. If not connected, cards show gray '--' values with a blue info banner about connecting GA4.
result: pass

### 3. Top Pages Table
expected: On the analytics dashboard, see a 'Top Pages' table showing ranked pages with path (monospace) and view count columns. If GA4 data is available, shows real page paths and formatted view counts. Otherwise shows empty state.
result: pass

### 4. Traffic Overview Chart
expected: On the analytics dashboard, see a traffic chart rendered by ApexCharts. Chart has area/bar type that switches based on selected date range. If GA4 data is available, shows traffic data points. Otherwise shows empty chart area.
result: pass

### 5. Date Range Selector
expected: On the analytics dashboard, see a date range selector with 4 options: 7d, 30d, 90d, Year. Selecting a different range re-fetches GA4 data only (not 404 or sitemap). Page shows isPending transition state during refetch.
result: pass

### 6. Keyword Rankings Placeholder
expected: On the analytics dashboard, see a 'Keyword Rankings' table with 5 rows showing '--' placeholder values. A blue info banner explains that connecting Google Search Console API is required for real keyword data.
result: pass

### 7. CTR/Impressions Placeholder
expected: On the analytics dashboard, see a 'CTR & Impressions' section showing a centered placeholder with a blue info banner about connecting Google Search Console API.
result: pass

### 8. 404 Error Table with Search
expected: On the analytics dashboard, see a '404 Errors' table with a URL search input. If errors exist, table shows URL (monospace), referrer (hostname), hit count (red for frequent), and relative time. Search input filters errors in real-time. If no errors, shows empty state message.
result: pass

### 9. Sitemap Health Cards
expected: On the analytics dashboard, see 4 sitemap health cards: Status (active/inactive badge), Total URLs (count), Last Generated (date), XML Valid (yes/no badge). Cards show real data from local sitemap.xml analysis.
result: pass

### 10. Crawl Issues Placeholder
expected: On the analytics dashboard, see a 'Crawl Issues' panel with 3 placeholder metric cards showing '--' values. A blue info banner explains that connecting Google Search Console API is required for crawl data.
result: pass

### 11. 404 Page Logs Errors to Database
expected: Visit a non-existent URL (e.g., /this-page-does-not-exist-test). The not-found page renders. Then navigate to /admin/settings/seo/analytics. The 404 Errors table shows the newly logged error with the visited URL, hit count 1, and relative time.
result: pass

## Summary

total: 11
passed: 11
issues: 0
pending: 0
skipped: 0

## Fix Applied During UAT

- Test 11 (404 logging) initially failed: `[locale]/not-found.tsx` header-based URL detection didn't work because Next.js doesn't set `x-pathname` or `x-invoke-path` headers, and unmatched routes bypass the custom not-found page in favor of the built-in one.
- Fix: Created `src/app/[locale]/[...slug]/page.tsx` catch-all route that captures unmatched paths via route params, logs the 404 via `log404Error()`, then calls `notFound()`. This is more reliable than header-based detection.
- Also cleaned up `not-found.tsx` to remove broken header-based logging and keep only the NotFoundLogger client component as a secondary logging path.

## Gaps

[none]
