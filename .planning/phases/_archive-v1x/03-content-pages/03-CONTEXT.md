# Phase 3: Content Pages - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Build all four content pages (Features, Pricing, Changelog, Support) from `woobooster-v2.html` templates into Next.js App Router pages. Each page has a small hero section + content section matching the HTML design reference. Also ensure all navigation works end-to-end, dark/light mode works on all pages, and mobile menu works correctly.

The HTML reference defines clear templates:
- **Features** (lines 686-815): Page hero + feature tabs + feature rows (3 module showcases with visual panels)
- **Pricing** (lines 817-903): Page hero + pricing grid (3 tiers) + trust strip + FAQ accordion
- **Changelog** (lines 905-953): Page hero + changelog list (3 version entries)
- **Support** (lines 955-986): Page hero + support cards (3 contact methods) + contact form

</domain>

<decisions>
## Implementation Decisions

### Features Page (FEAT-01..04)
- **D-01:** Features page has a small page hero (not full viewport) + feature tabs (decorative — no filtering) + 3 feature rows (Courier Sync, Meta CAPI, Fraud Shield)
- **D-02:** Feature rows alternate layout (normal/reversed) with content on one side and a visual panel on the other (courier cards, tracking panel, fraud box)
- **D-03:** Feature tabs are purely decorative (visual only, no filtering logic) — can be client component for active state toggle
- **D-04:** Visual panels (courier cards, tracking hub, fraud box) reuse existing CSS classes from globals.css (`.cc`, `.cc-l`, `.cc-icon`, `.cc-name`, `.cc-sub`, `.live-chip`, `.live-d`)
- **D-05:** New CSS classes needed in globals.css: `.page-hero-sm`, `.feat-rows`, `.feat-row`, `.fc`, `.fv`, `.tp`, `.tp-head`, `.tp-row`, `.tp-name`, `.ts-on`, `.ts-off`, `.fraud-box`, `.fb-head`, `.fb-row`, `.fid`, `.blk-btn`, `.blkd-badge`, `.feat-tabs`, `.ftab`
- **D-06:** Features page is a **server component** — feature tabs can use simple CSS `:hover`/`.active` class without JS. The HTML reference has JS for tab toggling but it's decorative — just show "All Modules" as active.

### Pricing Page (PRIC-01..05)
- **D-07:** Pricing page has: small hero + 3 pricing cards (Starter $29, Professional $69 popular, Agency $129) + trust strip + FAQ section
- **D-08:** Pricing cards use `.pc` and `.pop` classes. Popular card has accent border + "MOST POPULAR" tag
- **D-09:** FAQ accordion is a **client component** — needs click-to-toggle state management
- **D-10:** New CSS classes needed: `.price-grid`, `.pc`, `.pop`, `.pop-tag`, `.p-plan`, `.p-price`, `.p-bdt`, `.p-desc`, `.p-features`, `.p-ck`, `.p-no`, `.trust-strip`, `.ts-it`, `.faq-list`, `.fi`, `.fi-q`, `.fi-ic`, `.fi-a`, `.fi-a-in`
- **D-11:** Trust strip shows: Secure Checkout, bKash/Nagad/Card, 30-Day Refund, Instant License, BD Local Support

### Changelog Page (CHNG-01..03)
- **D-12:** Changelog page has: small hero + changelog list with 3 version entries (v0.0.14, v0.0.13, v0.0.12)
- **D-13:** Each changelog entry has version badge, date, name, and categorized changes (New/Improved/Fixed)
- **D-14:** New CSS classes needed: `.clog-list`, `.clog-item`, `.clog-v`, `.clog-date`, `.clog-name`, `.clog-changes`, `.clog-tag`, `.ct-new`, `.ct-fix`, `.ct-imp`, `.clog-entry`
- **D-15:** This is a **server component** — purely static content

### Support Page (SUPP-01..03)
- **D-16:** Support page has: small hero + 3 support cards (Email, WhatsApp, Docs) + contact form
- **D-17:** Contact form is static (no submission logic) — just visual form with inputs
- **D-18:** New CSS classes needed: `.support-grid`, `.support-card`, `.sc-icon`, `.sc-title`, `.sc-desc`, `.contact-form`, `.form-grid`, `.form-group`, `.form-input`
- **D-19:** This is a **server component** — form inputs are uncontrolled HTML elements

### Page Hero Component
- **D-20:** All 4 pages share the same small hero pattern (`.page-hero-sm`). Create a reusable `PageHero` component or inline the pattern.
- **D-21:** Page hero uses the hero gradient background with a radial accent glow overlay

### Navigation & Theme
- **D-22:** All 5 nav links (Home, Features, Pricing, Changelog, Support) already defined in Navbar.tsx — just need the pages to exist
- **D-23:** Active route highlighting already works via `usePathname()` in Navbar
- **D-24:** Dark/light mode works automatically via CSS custom properties — all new CSS uses existing design tokens

### Agent's Discretion
- Whether to create a shared `PageHero` component or inline the hero markup in each page
- Whether feature tabs need any JS or can be purely CSS
- Exact responsive behavior of pricing grid and support grid (follow HTML reference)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Reference
- `woobooster-v2.html` lines 686-815 — Features page template (`<template id="tpl-features">`)
- `woobooster-v2.html` lines 817-903 — Pricing page template (`<template id="tpl-pricing">`)
- `woobooster-v2.html` lines 905-953 — Changelog page template (`<template id="tpl-changelog">`)
- `woobooster-v2.html` lines 955-986 — Support page template (`<template id="tpl-support">`)
- `woobooster-v2.html` lines 337-405 — Page skeleton CSS and responsive breakpoints

### Existing Source Files
- `src/app/globals.css` — All existing design tokens and utility classes
- `src/components/layout/Navbar.tsx` — Navigation links already defined
- `src/components/layout/Footer.tsx` — Footer already exists
- `src/components/sections/FeaturesBento.tsx` — Pattern reference for server components
- `src/components/sections/CTASection.tsx` — Pattern reference for server components

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **All CSS design tokens** in globals.css work with new pages automatically
- **`.cc`, `.cc-l`, `.cc-icon`** etc. for courier cards already defined
- **`.btn`, `.btn-primary`, `.btn-outline`** button classes already defined
- **`.eyebrow`, `.sec-title`, `.sec-sub`, `.sh`** section header classes already defined
- **`.sec`, `.sec-bg`** section padding/background classes already defined

### Established Patterns
- Server components for static content, `"use client"` only for interactivity
- `max-w-[1160px] mx-auto px-7` for container (matching HTML `.container`)
- `@layer utilities` in globals.css for custom CSS classes
- Named exports for reusable components, default exports for pages

### Integration Points
- `src/app/features/page.tsx` — New route
- `src/app/pricing/page.tsx` — New route
- `src/app/changelog/page.tsx` — New route
- `src/app/support/page.tsx` — New route
- `src/app/globals.css` — New CSS classes for all page-specific styles

</code_context>

<specifics>
## Specific Ideas

- The features page visual panels (courier cards, tracking hub, fraud box) are key differentiators — they show the product UI and should feel authentic
- Pricing is in USD with BDT equivalents — preserve both currencies
- FAQ accordion needs smooth open/close animation matching the HTML reference
- Changelog entries are ordered newest-first
- Support page WhatsApp number and email are real contact info from the HTML reference

</specifics>

<deferred>
## Deferred Ideas

None — all four pages are in Phase 3 scope per ROADMAP.md.

</deferred>

---

*Phase: 03-content-pages*
*Context gathered: 2026-05-11*
