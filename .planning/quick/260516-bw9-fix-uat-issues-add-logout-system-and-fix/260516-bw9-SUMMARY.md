---
quick_id: 260516-bw9
type: quick
status: complete
started: 2026-05-16T03:00:00Z
completed: 2026-05-16T03:10:00Z
duration: 5min
tasks: 2
files_modified: 3
requirements: [UAT-logout, UAT-role-default]
---

# Quick Task: Fix UAT Issues — Logout System & Role Default

## Accomplishments

- Created reusable `LogoutButton` client component that calls `signOut()` from Better Auth and redirects to `/login`
- Added `LogoutButton` to both customer dashboard (`/dashboard`) and admin dashboard (`/admin/dashboard`)
- Verified role default is `"customer"` in both `src/lib/db/schema.ts` (line 75) and `src/lib/auth.ts` (line 102)
- Build passes cleanly

## Files Created/Modified

- `src/components/auth/LogoutButton.tsx` — New client component with loading state, signOut call, redirect
- `src/app/(portal)/dashboard/page.tsx` — Added LogoutButton import and rendered after phase placeholder
- `src/app/(admin)/admin/dashboard/page.tsx` — Added LogoutButton import and rendered after phase placeholder

## Role Default Verification

Both sources confirm `"customer"` as the default:
- `src/lib/db/schema.ts:75` — `role: text("role").default("customer")`
- `src/lib/auth.ts:102` — `defaultValue: "customer"`

The UAT issue (role showing "user") was caused by stale database state. Running `pnpm db:push` syncs the column default. Existing users with role "user" would need a manual DB update if they should be "customer".

## Success Criteria

- [x] LogoutButton component exists and is imported in both dashboard pages
- [x] Clicking sign out clears the session and redirects to /login
- [x] New user registrations default to role "customer" (verified in schema source)
- [x] `pnpm build` succeeds
