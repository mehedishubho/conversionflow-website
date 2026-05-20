---
phase: 9
phase_name: Settings Foundation
milestone: v2.1
created: 2026-05-20
status: Active
---

# Phase 9 Context — Settings Foundation

## Goal

Restructure the flat `/admin/settings` page into a sub-page navigation system with three top-level sections (Payment Gateway, SMTP/Email, SEO Settings) and a landing page with category cards. Build the navigation shell, layout components, and route structure that all subsequent SEO phases (10-13) will plug into.

## Decisions

### D-01: Settings Page Layout
**Decision:** Left sidebar navigation within the settings page content area.
**Why:** Gives persistent navigation across all settings sections without consuming admin sidebar space. Matches Shopify/Vercel patterns.
**How to apply:** Build a `SettingsShell` client component that renders a left sidebar + right content area inside the existing `DashboardLayout` content slot.

### D-02: Settings Shell Component
**Decision:** New `SettingsShell` component with its own sidebar nav list and `<Slot>`/children for content.
**Why:** Reusable across all 18+ settings routes; sidebar highlights active section automatically.
**How to apply:** `SettingsShell` takes `activeSection` prop, renders vertical nav with icons + labels, wraps children in scrollable content area.

### D-03: SEO Sub-Navigation Style
**Decision:** Flat list of all 14 SEO sections (no nesting/grouping in nav).
**Why:** Simpler mental model, fewer clicks, easier to scan. Groups are visual in the landing page cards only.
**How to apply:** Single flat array of `{ label, icon, href }` for all SEO sections under `/admin/settings/seo/*`.

### D-04: SEO Route Structure
**Decision:** Separate Next.js route for each section (18 total routes).
**Why:** Clean URLs, proper code splitting, server component data loading per page, browser back/forward works.
**How to apply:**
```
src/app/(admin)/admin/settings/
├── page.tsx                          (landing with cards)
├── payment/page.tsx                  (existing PaymentSettingsForm)
├── smtp/page.tsx                     (existing EmailProviderSettings)
├── layout.tsx                        (SettingsShell wrapper)
├── seo/
│   ├── layout.tsx                    (SEO sub-shell with flat nav)
│   ├── general/page.tsx
│   ├── verification/page.tsx
│   ├── sitemaps/page.tsx
│   ├── robots/page.tsx
│   ├── social/page.tsx
│   ├── meta-pixel/page.tsx
│   ├── tiktok/page.tsx
│   ├── google/page.tsx
│   ├── schema/page.tsx
│   ├── redirects/page.tsx
│   ├── ai-seo/page.tsx
│   ├── image-seo/page.tsx
│   ├── performance/page.tsx
│   └── analytics/page.tsx
```

### D-05: Admin Sidebar Integration
**Decision:** Single "Settings" entry in admin sidebar (unchanged from current `/admin/settings`).
**Why:** Avoids bloating the main admin nav with 15+ settings items.
**How to apply:** Keep `adminNavItems` entry as-is. The SettingsShell handles sub-navigation internally.

### D-06: Secondary Sidebar Visibility
**Decision:** Always-visible secondary sidebar on ALL settings pages (Payment, SMTP, SEO and its sub-pages).
**Why:** Consistent navigation experience; user always knows where they are and can jump to any section.
**How to apply:** `SettingsShell` renders on every `/admin/settings/**` route. Top-level shows 3 items (Payment, SMTP, SEO). When SEO is active, nav expands to show all 14 sub-sections.

### D-07: Secondary Nav Structure
**Decision:** Two-level sidebar: Top level (Payment, SMTP, SEO) always visible. SEO sub-sections shown when SEO is active/expanded.
**Why:** Balance between flat navigation and logical grouping.
**How to apply:** Nav array with optional `children` array. SEO item has 14 children. Others have none.

### D-08: Settings Landing Page
**Decision:** Category cards landing page at `/admin/settings`.
**Why:** Provides overview and quick access to each settings category; looks premium.
**How to apply:** 3 cards (Payment Gateway, SMTP/Email, SEO Settings) with icon, title, description, status indicator, "Configure →" link. Each links to its respective first route.

### D-09: Landing Page Design
**Decision:** Category cards with status indicators and navigation links.
**Why:** Enterprise SaaS feel; shows configured/not-configured at a glance.
**How to apply:** Each card shows: icon (Lucide), title, 1-line description, green/gray dot for configured status, arrow link to section.

### D-10: Save/Feedback Pattern
**Decision:** Per-section Save button with inline success/error message (current pattern).
**Why:** Already works; consistent with existing Payment/SMTP/Tracking forms. No need to change.
**How to apply:** Each settings page form has its own `<form>` with `useTransition`, `isPending`, and inline status message. No global save button.

### D-11: Form Component Pattern
**Decision:** Follow existing pattern: server component loads data → passes as `initialData` prop → client form component handles interaction.
**Why:** Proven pattern in this codebase; type-safe; works with server actions.
**How to apply:** Each `page.tsx` is a server component that calls a server action to load settings. Passes data to a client `*SettingsForm.tsx` component.

### D-12: Route Granularity
**Decision:** Each settings section is its own Next.js route with its own page.tsx.
**Why:** Clean code splitting, proper SSR, browser history, deep linking.
**How to apply:** Create individual route directories under `/admin/settings/seo/` for each of the 14 SEO sub-sections.

### D-13: Migration Strategy
**Decision:** Move existing forms to new routes, old flat page becomes landing page with cards.
**Why:** Non-breaking; existing forms keep working at new URLs.
**How to apply:** Move `PaymentSettingsForm` to `/admin/settings/payment/page.tsx`, `EmailProviderSettings` to `/admin/settings/smtp/page.tsx`, `TrackingSettingsForm` content absorbed into SEO tracking pages. Replace old flat `page.tsx` with landing cards.

## Codebase Context

### Existing Settings Architecture
- **Settings page:** `src/app/(admin)/admin/settings/page.tsx` — flat vertical stack of 3 forms
- **Payment form:** `src/components/admin/PaymentSettingsForm.tsx` — `"use client"`, `initialData` prop, `useTransition`
- **Email form:** `src/components/admin/EmailProviderSettings.tsx` — same pattern
- **Tracking form:** `src/components/admin/TrackingSettingsForm.tsx` — same pattern, handles GA4/GTM/FB/GSC
- **Admin nav:** `src/data/dashboard-nav.ts` — `adminNavItems` array, Settings at `/admin/settings`
- **Admin shell:** `src/components/dashboard/AdminShell.tsx` wraps `DashboardShell` with admin nav
- **Dashboard shell:** `src/components/dashboard/DashboardShell.tsx` renders sidebar + header + content
- **Sidebar:** `src/components/dashboard/AppSidebar.tsx` — 290px/90px responsive, `NavItem` supports `subItems`

### Database Pattern
- Settings table: generic key-value (`key` PK, `value` text, `updated_at` timestamp)
- Server actions in `src/app/(admin)/actions/` for CRUD
- All SEO settings will use same table with new keys (e.g., `seo_general_title`, `seo_og_facebook_app_id`)

### UI Components Available
- `ComponentCard` — section wrapper with title + description
- `InputField` — labeled text input
- `Select` — dropdown select
- `Button` — styled button with variants
- All from `src/components/dashboard/` shared components

## Scope

### In Scope (This Phase)
1. Settings landing page with 3 category cards
2. SettingsShell layout component (left sidebar nav)
3. SEO sub-navigation shell (flat list of 14 sections)
4. Move Payment form to `/admin/settings/payment`
5. Move SMTP form to `/admin/settings/smtp`
6. Create SEO layout shell at `/admin/settings/seo/layout.tsx`
7. Create placeholder pages for all 14 SEO sub-sections
8. Update `adminNavItems` if needed (likely no change)

### Out of Scope (Later Phases)
- Actual SEO settings forms (Phase 10)
- Tracking pixel forms (Phase 11)
- Schema/redirect forms (Phase 12)
- Analytics dashboard (Phase 13)
- Any database schema changes
- Server actions for new settings
