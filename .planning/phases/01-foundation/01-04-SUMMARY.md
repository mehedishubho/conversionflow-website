---
phase: 01-foundation
plan: 04
subsystem: routing, auth, setup-wizard
tags: [proxy, route-protection, route-groups, role-checks, admin-setup, portal-layout, admin-layout]
dependency_graph:
  requires: [01-01, 01-02, 01-03]
  provides: [proxy-route-protection, portal-route-group, admin-route-group, admin-setup-wizard]
  affects: [proxy.ts, src/app/(portal), src/app/(admin)]
tech_stack:
  added: []
  patterns: [next-intl-middleware-composition, edge-cookie-check, server-side-role-redirect, route-group-isolation]
key_files:
  created:
    - src/app/(portal)/layout.tsx
    - src/app/(portal)/dashboard/page.tsx
    - src/app/(admin)/layout.tsx
    - src/app/(admin)/admin/dashboard/page.tsx
    - src/app/(admin)/admin/setup/page.tsx
    - src/app/(admin)/admin/setup/SetupForm.tsx
    - src/app/(admin)/admin/setup/actions.ts
  modified:
    - src/proxy.ts
decisions:
  - Admin pages nested under (admin)/admin/ to resolve at /admin/* since route groups are URL-invisible
  - Setup page marked force-dynamic to prevent SSG build failures from DB queries
  - Phone field in setup wizard uses placeholder +880000000000 via fetchOptions.body per Better Auth type constraints
  - Proxy checks only session cookie existence (not roles) since Edge runtime cannot query DB
metrics:
  duration: 5min
  completed: 2026-05-15
  tasks: 2
  files: 8
  commits: 2
---

# Phase 01 Plan 04: Route Protection, Layouts & Admin Setup Summary

Proxy-based route protection with session cookie checks, portal/admin route groups with ThemeProvider layouts, role-based server-side redirects, and first-admin setup wizard with race condition protection.

## Tasks Completed

### Task 1: Update proxy.ts for route protection and create portal/admin layouts with role checks

**Commit:** 4d5de14

- Rewrote `src/proxy.ts` with session cookie checks for portal routes (`/dashboard`, `/licenses`, `/billing`, `/downloads`, `/tickets`, `/notifications`, `/checkout`, `/account`) and admin routes (`/admin/*`)
- Unauthenticated users on protected routes are redirected to `/login` with `callbackUrl` param
- Authenticated users visiting auth pages (`/login`, `/register`, etc.) are redirected to `/dashboard`
- Non-marketing routes pass through without i18n routing, preserving marketing site behavior
- Created `(portal)` layout with ThemeProvider, dashboard.css, and DM Sans + Syne + JetBrains Mono fonts
- Created `(portal)/dashboard/page.tsx` with `auth.api.getSession` check, admin role redirect to `/admin/dashboard`
- Created `(admin)` layout with identical ThemeProvider and font setup
- Created `(admin)/admin/dashboard/page.tsx` with session check and customer role redirect to `/dashboard`

### Task 2: Create admin setup wizard page with SetupForm and server action

**Commit:** 393add8

- Created `setup/page.tsx` server component that queries DB for existing `super_admin` count, redirects to `/login` if found
- Created `SetupForm.tsx` client component with name, email, password, confirmPassword fields
- Created `actions.ts` server action with `completeSetup(userId)` that double-checks admin count before setting role (race condition protection)
- Phone field passed via `fetchOptions.body` since Better Auth client types don't include custom `additionalFields`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Admin route group URL collision**
- **Found during:** Task 1 build verification
- **Issue:** Plan specified `(admin)/dashboard/page.tsx` but route groups are URL-invisible in Next.js, causing collision with `(portal)/dashboard/page.tsx` (both resolved to `/dashboard`)
- **Fix:** Nested admin pages under `(admin)/admin/dashboard/page.tsx` so URL resolves to `/admin/dashboard`
- **Files modified:** Moved `src/app/(admin)/dashboard/page.tsx` to `src/app/(admin)/admin/dashboard/page.tsx`
- **Commit:** 4d5de14

**2. [Rule 1 - Bug] TypeScript error on signUp.email phone prop**
- **Found during:** Task 2 build verification
- **Issue:** `phone` is not a known property on `signUp.email()` argument type -- Better Auth client types don't expose custom `additionalFields`
- **Fix:** Removed top-level `phone` prop, kept only in `fetchOptions.body` (consistent with Phase 01 decision)
- **Files modified:** `src/app/(admin)/admin/setup/SetupForm.tsx`
- **Commit:** 393add8

**3. [Rule 3 - Blocking] Setup page SSG build failure**
- **Found during:** Task 2 build verification
- **Issue:** Setup page queries database at build time, causing auth/DB errors during static generation
- **Fix:** Added `export const dynamic = "force-dynamic"` to setup page
- **Files modified:** `src/app/(admin)/admin/setup/page.tsx`
- **Commit:** 393add8

## Self-Check: PASSED

All 8 files verified present on disk. Both commit hashes (4d5de14, 393add8) verified in git log.
