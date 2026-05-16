---
phase: 02-homepage
plan: 03
subsystem: dashboard-shell
tags: [nextjs-app-router, route-groups, dashboard-layout, tailwindcss-v4]

# Dependency graph
requires:
  - phase: 02-homepage
    provides: "DashboardShell component, AppSidebar, AppHeader, Backdrop, UserDropdown, nav data configs"
provides:
  - "Portal layout with PortalShell wrapping DashboardShell + customerNavItems"
  - "Admin layout with AdminShell wrapping DashboardShell + adminNavItems"
  - "Updated dashboard pages rendering inside the shell"
affects: [customer-portal, admin-dashboard]

key-files:
  created:
    - src/components/dashboard/PortalShell.tsx
    - src/components/dashboard/AdminShell.tsx
  modified:
    - src/app/(portal)/layout.tsx
    - src/app/(admin)/layout.tsx
    - src/app/(portal)/dashboard/page.tsx
    - src/app/(admin)/admin/dashboard/page.tsx

requirements-completed: [DASH-01]

duration: 2min
completed: 2026-05-16
---

# Phase 02 Plan 03: Wire DashboardShell into Layouts Summary

**Integrated dashboard shell into portal and admin route group layouts with proper nav configs**

## Performance

- **Duration:** 2 min
- **Tasks:** 1
- **Files modified:** 6

## Accomplishments
- Created PortalShell and AdminShell thin client wrappers around DashboardShell
- Wired both route group layouts to use their respective shell wrappers
- Updated dashboard pages to render content inside the shell (removed min-h-screen centering)
- Removed LogoutButton from pages (now in header UserDropdown)

## Files Created/Modified

- `src/components/dashboard/PortalShell.tsx` — Thin client wrapper passing customerNavItems to DashboardShell
- `src/components/dashboard/AdminShell.tsx` — Thin client wrapper passing adminNavItems to DashboardShell
- `src/app/(portal)/layout.tsx` — Replaced `<main>` with `<PortalShell>` wrapping
- `src/app/(admin)/layout.tsx` — Replaced `<main>` with `<AdminShell>` wrapping
- `src/app/(portal)/dashboard/page.tsx` — Removed LogoutButton, updated content area for shell
- `src/app/(admin)/admin/dashboard/page.tsx` — Removed LogoutButton, updated content area for shell

## Decisions Made

- **Shell wrapper pattern:** Created `PortalShell` and `AdminShell` as thin `"use client"` wrappers rather than importing DashboardShell directly into layouts. This keeps the layouts as server components (required for metadata export) while properly passing nav config to the client-side shell.
- **Page content simplification:** Dashboard pages no longer need min-h-screen centering or LogoutButton — the shell handles full-page layout and the header provides logout.

## Self-Check: PASSED

Build passes. Both layouts import their respective shell wrappers. Both remain server components. Dashboard pages render simple content divs.

---
*Phase: 02-homepage*
*Completed: 2026-05-16*
