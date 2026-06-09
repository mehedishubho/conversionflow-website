---
status: diagnosed
phase: 04-seo-and-polish
source: 04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md
started: 2026-06-06T10:00:00Z
updated: 2026-06-06T10:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Page SEO Titles
expected: Visit the homepage. The browser tab title should show a unique title containing "WooBooster" or "ConversionFlow". Navigate to /features, /pricing, /changelog, and /support — each page should have a DIFFERENT title in the browser tab (not all the same).
result: issue
reported: "all page showing same title ConversionFlow — WooCommerce Automation for Bangladesh"
severity: major

### 2. Open Graph Tags
expected: View page source on the homepage. The HTML head should contain og:title, og:description, and twitter:card meta tags. These should be present on at least the homepage and /features page.
result: pass

### 3. Custom Favicon
expected: The browser tab should show a custom favicon (not the default Next.js triangle). It should be a rocket or ConversionFlow-branded icon visible in the browser tab.
result: pass

### 4. Custom 404 Page
expected: Navigate to a non-existent URL like /this-does-not-exist. You should see a branded 404 page (not the default Next.js 404) with a large "404" display, descriptive text, and working navigation links back to Home, Features, or Pricing.
result: pass

### 5. Scroll-Triggered Animations
expected: Load the homepage and scroll down slowly. Sections like Features, Testimonials, and CTA should fade in with a slide-up animation as they enter the viewport. The Hero section and top-of-page elements should be immediately visible (no animation).
result: pass

### 6. Build Verification
expected: Running `pnpm build` completes with 0 errors and generates all expected routes (/, /features, /pricing, /changelog, /support).
result: pass

## Summary

total: 6
passed: 5
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Each page has a unique SEO title in the browser tab"
  status: failed
  reason: "User reported: all page showing same title ConversionFlow — WooCommerce Automation for Bangladesh"
  severity: major
  test: 1
  root_cause: "None of the 5 marketing pages export their own metadata. They all fall back to the layout's default title. The marketing layout has a correct template pattern but no child page provides a title to fill the %s placeholder."
  artifacts:
    - path: "src/app/(marketing)/features/page.tsx"
      issue: "Missing metadata export"
    - path: "src/app/(marketing)/pricing/page.tsx"
      issue: "Missing metadata export"
    - path: "src/app/(marketing)/changelog/page.tsx"
      issue: "Missing metadata export"
    - path: "src/app/(marketing)/support/page.tsx"
      issue: "Missing metadata export"
  missing:
    - "Add export const metadata: Metadata = { title: 'Features' } to features/page.tsx"
    - "Add export const metadata: Metadata = { title: 'Pricing' } to pricing/page.tsx"
    - "Add export const metadata: Metadata = { title: 'Changelog' } to changelog/page.tsx"
    - "Add export const metadata: Metadata = { title: 'Support' } to support/page.tsx"
  debug_session: ""
