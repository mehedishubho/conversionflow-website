# Phase 9 Discussion Log — Settings Foundation

**Date:** 2026-05-20
**Phase:** 9 — Settings Foundation
**Mode:** discuss (interactive)

## Gray Areas Identified

1. Settings page layout and navigation pattern
2. SEO sub-navigation style (flat vs grouped)
3. Admin sidebar integration strategy
4. Settings landing page design
5. Non-SEO settings navigation
6. Save/feedback UX pattern
7. Route structure and granularity

## Discussion Results

### 1. Settings Page Layout
- **Options:** Tab-based, Left sidebar nav, Accordion sections
- **Selected:** Left sidebar navigation within settings page content area
- **Rationale:** Persistent nav, matches Shopify/Vercel patterns, doesn't bloat admin sidebar

### 2. SEO Sub-Navigation Style
- **Options:** Flat list, Grouped categories, Collapsible tree
- **Selected:** Flat list of all 14 SEO sections
- **Rationale:** Simpler mental model, easier scan, fewer clicks. Grouping done visually on landing page only.

### 3. Admin Sidebar Integration
- **Options:** Secondary nav inside page, Expanded admin sidebar, Breadcrumb-based
- **Selected:** Secondary nav inside page content area
- **Rationale:** Admin sidebar stays clean, settings has its own self-contained navigation

### 4. Settings Landing Page Design
- **Options:** Category cards, Direct redirect to first section, Tabbed overview
- **Selected:** Category cards with status indicators
- **Rationale:** Premium feel, shows configuration status at a glance, clear navigation

### 5. Non-SEO Settings Navigation
- **Options:** Always-visible sidebar, Collapsible sidebar, Top tabs
- **Selected:** Always-visible secondary sidebar on all settings pages
- **Rationale:** Consistent experience across all settings sections

### 6. Save/Feedback Pattern
- **Options:** Per-section save, Global save all, Auto-save with debounce
- **Selected:** Per-section Save button with inline feedback
- **Rationale:** Matches existing pattern, proven in codebase, no UX regression

### 7. Route Structure
- **Options:** Separate routes, Query parameter tabs, Single page with state
- **Selected:** Separate Next.js routes for each section
- **Rationale:** Clean URLs, code splitting, server component data loading, browser history

## Decisions Captured

All decisions recorded in `09-CONTEXT.md` (D-01 through D-13).
