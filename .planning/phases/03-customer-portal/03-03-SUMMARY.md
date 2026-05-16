---
phase: 03-customer-portal
plan: 03
subsystem: ui
tags: [drizzle, server-components, billing, downloads, badge, table, changelog, expandable]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "DB schema (orders, downloads tables), auth session, portal route group"
  - phase: 02-homepage
    provides: "PortalShell layout, dashboard.css design tokens, UI primitives (Badge, Table, ComponentCard, PageBreadCrumb)"
  - plan: 03-01
    provides: "Portal dashboard page pattern (auth guard + DB query + render), PageBreadcrumb basePath prop"
  - plan: 03-02
    provides: "License table pattern (server component table + Badge status mapping + empty state)"
provides:
  - "Billing page with invoice table, status badges, BDT currency formatting, payment method labels"
  - "Downloads page with featured latest version card, version history, expandable changelogs"
  - "InvoiceTable server component with order status badge color map and payment method display map"
  - "DownloadsList server component with featured card and version history sections"
  - "ChangelogExpandable client component with toggle and chevron rotation animation"
affects: [03-04-PLAN, 03-05-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns: [intl-number-format-bdt, changelog-expandable-toggle, featured-version-card]

key-files:
  created:
    - src/components/portal/InvoiceTable.tsx
    - src/components/portal/DownloadsList.tsx
    - src/components/portal/ChangelogExpandable.tsx
    - src/app/(portal)/billing/page.tsx
    - src/app/(portal)/downloads/page.tsx
  modified: []

key-decisions:
  - "Wrapped Badge in span for margin spacing since Badge component does not accept className prop"
  - "Download buttons rendered as disabled since no file serving route exists yet (deferred per T-03-07)"

patterns-established:
  - "InvoiceTable pattern: server component with statusBadgeMap + paymentMethodMap + Intl.NumberFormat for BDT"
  - "Featured card pattern: prominent border-brand-200 card for latest version with version number + Latest badge"
  - "Changelog expandable: client component with isExpanded toggle and ChevronDown 180deg rotation"

requirements-completed: [PORT-03, PORT-04]

# Metrics
duration: 6min
completed: 2026-05-16
---

# Phase 3 Plan 3: Billing and Downloads Summary

**Billing page with invoice table showing BDT amounts and payment method labels, Downloads page with featured latest version card and expandable changelogs**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-16T18:44:20Z
- **Completed:** 2026-05-16T18:50:32Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- InvoiceTable with status badges (completed=success, pending=warning, failed=error, refunded=light) and payment method display (bKash, Nagad, Rocket, Bank Transfer, SSL Commerce)
- Billing page with userId-filtered orders query, BDT currency formatting via Intl.NumberFormat, and empty state
- ChangelogExpandable client component with toggle state, chevron rotation animation, and "No changelog" fallback
- DownloadsList with featured latest version card (accent border, version number, Latest badge) and version history section
- Downloads page with userId-filtered query and empty state messaging

## Task Commits

Each task was committed atomically:

1. **Task 1: Create InvoiceTable component and Billing page** - `d0541c4` (feat)
2. **Task 2: Create ChangelogExpandable, DownloadsList, and Downloads page** - `3bdbc8d` (feat)

## Files Created/Modified
- `src/components/portal/InvoiceTable.tsx` - Server component: invoice table with status badges, payment method mapping, BDT formatting
- `src/app/(portal)/billing/page.tsx` - Billing page with auth guard, orders query filtered by userId, empty state
- `src/components/portal/ChangelogExpandable.tsx` - Client component: expandable changelog with isExpanded toggle and chevron rotation
- `src/components/portal/DownloadsList.tsx` - Server component: featured latest version card + version history with changelog rows
- `src/app/(portal)/downloads/page.tsx` - Downloads page with auth guard, downloads query filtered by userId, empty state

## Decisions Made
- Wrapped Badge in a `<span className="ml-2">` for spacing since Badge component does not accept a className prop -- keeps the Badge API unchanged
- Download buttons rendered as disabled buttons (not links) since no file serving route exists yet -- consistent with threat model T-03-07 (accept disposition)
- DownloadsList conditionally renders changelog section only when `download.changelog !== undefined` to avoid showing "No changelog" for DB rows without changelog data

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed className prop from Badge component in DownloadsList**
- **Found during:** Task 2 (build verification)
- **Issue:** Badge component does not accept className prop, causing TypeScript build error
- **Fix:** Wrapped Badge in a `<span className="ml-2">` to apply spacing instead of passing className directly to Badge
- **Files modified:** src/components/portal/DownloadsList.tsx
- **Verification:** pnpm build passes
- **Committed in:** 3bdbc8d (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 type bug)
**Impact on plan:** Trivial fix. No scope creep.

## Issues Encountered
None beyond the Badge className deviation documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Billing and Downloads pages follow the established server-component-with-DB-query pattern
- InvoiceTable status badge mapping reusable for admin order views in Phase 5
- DownloadsList featured card ready for wiring to actual download API route when created in Phase 4
- ChangelogExpandable ready for real changelog data when added to schema or sourced from a data file

## Self-Check: PASSED

- [x] src/components/portal/InvoiceTable.tsx - FOUND
- [x] src/app/(portal)/billing/page.tsx - FOUND
- [x] src/components/portal/ChangelogExpandable.tsx - FOUND
- [x] src/components/portal/DownloadsList.tsx - FOUND
- [x] src/app/(portal)/downloads/page.tsx - FOUND
- [x] Commit d0541c4 - FOUND
- [x] Commit 3bdbc8d - FOUND

---
*Phase: 03-customer-portal*
*Completed: 2026-05-16*
