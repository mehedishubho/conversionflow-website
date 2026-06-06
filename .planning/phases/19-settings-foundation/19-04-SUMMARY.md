---
phase: 19-settings-foundation
plan: 04
status: complete
gap_closure: true
completed: 2026-06-06T19:30:00Z
---

# Plan 19-04: Fix ERR_TOO_MANY_REDIRECTS for Non-Admin Users

## What Was Built

Fixed the infinite redirect loop that occurred when non-admin authenticated users tried to access any `/admin/*` route. The root cause was that all admin auth guards redirected unauthorized roles to `/admin/dashboard`, which itself called the same auth guard — creating an infinite loop.

## Root Cause

`requireAdmin()` in `src/lib/auth-guard.ts` (and 30 other files) redirected non-admin users to `/admin/dashboard`. Since `/admin/dashboard` also calls `requireAdmin()`, the user was bounced back and forth indefinitely → `ERR_TOO_MANY_REDIRECTS`.

## Changes Made

| Task | Files | Change |
|------|-------|--------|
| Task 1 | `src/lib/auth-guard.ts` | Changed shared `requireAdmin()` redirect from `/admin/dashboard` to `/dashboard` |
| Task 2 | `src/app/(admin)/admin/settings/layout.tsx` | Changed inline auth check redirect from `/admin/dashboard` to `/dashboard` |
| Task 3 | 15 action files in `src/app/(admin)/actions/` | Changed local `requireAdmin()` redirect in each file |
| Task 4 | 15 page/layout files in `src/app/(admin)/admin/` | Changed inline auth redirects in each file |

**Total: 32 files modified, 1 string replaced per file**

## Key Files

### Created
- `src/lib/auth-guard.ts` (new shared auth guard — was previously only imported but now also serves as the canonical redirect source)

### Modified
- `src/lib/auth-guard.ts` — shared `requireAdmin()` redirect target
- `src/app/(admin)/admin/settings/layout.tsx` — inline auth check
- 15 action files in `src/app/(admin)/actions/`
- 15 page/layout files in `src/app/(admin)/admin/`

## Verification

- `grep -rn 'redirect("/admin/dashboard")' src/app/(admin)/` → **0 results** (all admin-side redirects fixed)
- `pnpm build` → **success**, no type errors
- Portal-side redirects (`src/app/(portal)/`) remain unchanged — they correctly redirect admin users *to* `/admin/dashboard`

## Success Criteria

- [x] Zero occurrences of `redirect("/admin/dashboard")` in admin-side files
- [x] `pnpm build` succeeds without errors
- [x] Non-admin users accessing `/admin/*` routes redirect to `/dashboard` (customer portal) in a single redirect
- [x] Unauthenticated users still redirect to `/login` (unchanged)
- [x] Admin users can access all `/admin/*` routes normally (unchanged)
- [x] Portal pages still redirect admin users to `/admin/dashboard` (unchanged — correct behavior)

## Commits

1. `7a9a837` — fix(19-04): redirect non-admin users to /dashboard in shared requireAdmin()
2. `02369d1` — fix(19-04): fix settings layout redirect from /admin/dashboard to /dashboard
3. `d340d0d` — fix(19-04): fix 15 admin action files redirect
4. `0080b3e` — fix(19-04): fix 15 admin page/layout files redirect

## Self-Check: PASSED
