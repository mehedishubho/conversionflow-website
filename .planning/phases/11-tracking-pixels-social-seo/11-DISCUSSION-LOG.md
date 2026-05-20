# Phase 11: Tracking Pixels & Social SEO - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 11-tracking-pixels-social-seo
**Areas discussed:** Social Preview Simulator, Tracking Event Architecture, Schema Markup Config UI, Connection Status & Testing, SEO Overview Redesign, Empty State Warnings, GTM Depth, CAPI Depth

---

## Social Preview Simulator

| Option | Description | Selected |
|--------|-------------|----------|
| Side-by-side cards | Three card previews rendered horizontally (Facebook, Twitter/X, LinkedIn) | ✓ |
| Tabbed single preview | One preview area with platform tabs | |
| Stacked cards | Three previews vertically | |

**User's choice:** Side-by-side cards

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, toggle switch | Mobile/desktop toggle showing different image ratios | ✓ |
| Desktop only | Just desktop-style previews | |

**User's choice:** Yes, toggle switch

| Option | Description | Selected |
|--------|-------------|----------|
| Unified form + preview | Single form above the preview with all social fields | ✓ |
| Per-platform forms | Each platform tab has its own mini-form | |

**User's choice:** Unified form + preview

| Option | Description | Selected |
|--------|-------------|----------|
| Show actual image | Display the uploaded/specified image in preview | ✓ |
| Dimension placeholder | Gray placeholder with recommended dimensions | |

**User's choice:** Show actual image

---

## Tracking Event Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Standard event checkboxes | Pre-defined list: PageView, ViewContent, AddToCart, Purchase, Lead | ✓ |
| Custom event input | Free-form event name input | |

**User's choice:** Standard event checkboxes

| Option | Description | Selected |
|--------|-------------|----------|
| Integrate into locale layout | TrackingScripts in [locale]/layout.tsx, loads on all public pages | ✓ |
| Per-page import | Each page imports and renders TrackingScripts | |

**User's choice:** Integrate into locale layout

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle switch only | Simple on/off for Advanced Matching | |
| Toggle + field selection | On/off plus checkboxes for email, phone, name, city, country | ✓ |

**User's choice:** Toggle + field selection

| Option | Description | Selected |
|--------|-------------|----------|
| Migrate to Phase 11 pages | Absorb existing 5 keys into new dedicated pages, delete admin-tracking.ts | ✓ |
| Keep separate + add new | Keep existing form on overview, add new pages for new fields | |

**User's choice:** Migrate to Phase 11 pages

---

## Schema Markup Config UI

| Option | Description | Selected |
|--------|-------------|----------|
| Form-based per schema type | Structured form fields per schema, system generates JSON-LD | ✓ |
| Raw JSON editor | Direct JSON-LD editing with syntax highlighting | |
| Form + JSON-LD preview | Structured input plus read-only generated output | |

**User's choice:** Form-based per schema type

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-generate + overrides | Auto-fill from site data with admin override fields | ✓ |
| Fully manual config | Admin configures every schema field | |

**User's choice:** Auto-generate + overrides

| Option | Description | Selected |
|--------|-------------|----------|
| Link to Google Rich Results Test | External validation, pre-filled URL | ✓ |
| Inline validator | Built-in validation against Google requirements | |

**User's choice:** Link to Google Rich Results Test

---

## Connection Status & Testing

| Option | Description | Selected |
|--------|-------------|----------|
| Config-only status dots | Green/gray based on ID configured (like Phase 10 verification) | |
| Live API connection test | Actual API ping to verify ID validity and data flow | ✓ |

**User's choice:** Live API connection test

| Option | Description | Selected |
|--------|-------------|----------|
| Simple event log table | Client-side log with timestamp, event, platform, status | ✓ |
| Counts + last timestamp only | Minimal metrics, no detailed log | |
| External tools only | No logging, use Meta Events Manager and GA directly | |

**User's choice:** Simple event log table

| Option | Description | Selected |
|--------|-------------|----------|
| GA summary cards | Real data from GA Reporting API (active users, pageviews, top pages) | ✓ |
| Status + link to GA | Configuration status and link to Google Analytics | |

**User's choice:** GA summary cards

---

## SEO Overview Redesign

| Option | Description | Selected |
|--------|-------------|----------|
| Card grid landing page | Grid of section cards with completion status and links | ✓ |
| Summary dashboard | Status indicators, quick stats, direct links | |
| Keep current + add links | Retain TrackingSettingsForm, add quick-links below | |

**User's choice:** Card grid landing page

---

## Empty State Warnings

| Option | Description | Selected |
|--------|-------------|----------|
| Warning banner + CTA | Yellow/amber banner when primary ID not configured | ✓ |
| Empty fields only | Just empty inputs with helpful placeholders | |

**User's choice:** Warning banner + CTA

---

## GTM Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Container ID only (Recommended) | Just the ID field + enable/disable toggle | ✓ |
| Deep GTM integration | Workspace info, version status, environment selector | |

**User's choice:** Container ID only

---

## CAPI Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Token + basic config (Recommended) | CAPI token, deduplication toggle, test event code | |
| Full CAPI management | Token, dataset ID, test events, event mapping, dedup, test button | ✓ |

**User's choice:** Full CAPI management

---

## Claude's Discretion

- Image aspect ratios for social previews (follow platform standards)
- Event log panel styling and refresh behavior
- Schema form field layout and grouping
- GA summary card layout and chart type
- Error message wording for connection test failures

## Deferred Ideas

None — discussion stayed within phase scope
