---
phase: 01-foundation
plan: 03
subsystem: auth
tags: [better-auth, resend, react-forms, nextjs-app-router, tailwindcss-v4, route-groups]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Better Auth server (auth.ts), client (auth-client.ts), lockout module, audit logging, Redis"
provides:
  - "Five auth pages: /login, /register, /verify-email, /forgot-password, /reset-password"
  - "Ported SignInForm and SignUpForm components with Better Auth wiring"
  - "Dashboard CSS file separate from marketing globals.css"
  - "Auth route group layout with ThemeProvider and fonts"
  - "Email sending utilities via Resend (verification + reset)"
  - "Email verification and password reset callbacks wired in auth.ts"
affects: [dashboard-shell, customer-portal, admin-dashboard]

# Tech tracking
tech-stack:
  added: [resend]
  patterns: [route-group-isolation, separate-css-per-layout, dynamic-import-for-email-callbacks]

key-files:
  created:
    - src/app/dashboard.css
    - src/app/(auth)/layout.tsx
    - src/app/(auth)/login/page.tsx
    - src/app/(auth)/register/page.tsx
    - src/app/(auth)/verify-email/page.tsx
    - src/app/(auth)/forgot-password/page.tsx
    - src/app/(auth)/reset-password/page.tsx
    - src/components/auth/SignInForm.tsx
    - src/components/auth/SignUpForm.tsx
    - src/lib/emails/verification.ts
    - src/lib/emails/reset-password.ts
  modified:
    - src/lib/auth.ts

key-decisions:
  - "Phone field passed via fetchOptions.body since Better Auth client types don't include custom additionalFields"
  - "Used Syne weight 400-800 only (900 not available in Google Fonts for Syne)"
  - "verify-email page uses fetch to GET /api/auth/verify-email directly rather than a client-side verifyEmail method"
  - "Dynamic imports for email sender functions in auth.ts to avoid server-side module loading at import time"

patterns-established:
  - "Route group isolation: (auth)/ layout loads dashboard.css separately from marketing globals.css"
  - "Auth form pattern: use client component with useState, Better Auth client method, loading/error state, router.push redirect"
  - "Suspense boundary wrapping for pages using useSearchParams"
  - "Inline SVG icons instead of external icon dependencies for auth forms"

requirements-completed: [AUTH-03, AUTH-04, DASH-02]

# Metrics
duration: 13min
completed: 2026-05-15
---

# Phase 01 Plan 03: Auth Pages & Email Summary

**Five auth pages (login, register, verify-email, forgot-password, reset-password) with Better Auth client wiring, Resend email sending, and route-group CSS isolation**

## Performance

- **Duration:** 13 min
- **Started:** 2026-05-15T12:38:46Z
- **Completed:** 2026-05-15T12:52:10Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Created complete auth surface with 5 pages covering the full user auth lifecycle
- Ported auth forms from backenddashboard with social login removed and Better Auth wired
- Established route group CSS isolation pattern -- dashboard.css separate from marketing globals.css
- Wired email verification and password reset callbacks into Better Auth server config
- Created email sending utilities via Resend with branded HTML templates

## Task Commits

Each task was committed atomically:

1. **Task 1: Create dashboard CSS, auth layout, port auth forms, create login and register pages** - `82168a1` (feat)
2. **Task 2: Create remaining auth pages, email utilities, and wire email callbacks into auth.ts** - `7f2d57d` (feat)

## Files Created/Modified

- `src/app/dashboard.css` - Dashboard/auth CSS with Tailwind v4, color tokens, utilities (separate from marketing globals.css)
- `src/app/(auth)/layout.tsx` - Auth route group layout with DM Sans, Syne, JetBrains Mono fonts and ThemeProvider
- `src/components/auth/SignInForm.tsx` - Sign-in form with Better Auth signIn.email, lockout error display, password toggle
- `src/components/auth/SignUpForm.tsx` - Sign-up form with full name, email, phone, password fields and Better Auth signUp.email
- `src/app/(auth)/login/page.tsx` - Login page with split-panel layout (brand panel + SignInForm)
- `src/app/(auth)/register/page.tsx` - Register page with split-panel layout (brand panel + SignUpForm)
- `src/app/(auth)/verify-email/page.tsx` - Email verification page with token handling and resend capability
- `src/app/(auth)/forgot-password/page.tsx` - Password reset request form with requestPasswordReset
- `src/app/(auth)/reset-password/page.tsx` - New password form with token validation and auto-login redirect
- `src/lib/emails/verification.ts` - Email verification sender via Resend API
- `src/lib/emails/reset-password.ts` - Password reset email sender via Resend API
- `src/lib/auth.ts` - Added emailVerification config (sendOnSignUp, sendVerificationEmail callback) and sendResetPassword callback

## Decisions Made

- **Phone field via fetchOptions.body:** The Better Auth client TypeScript types do not include custom user additionalFields, so `phone` is passed through the second argument's `body` property rather than the main signUp.email options object.
- **Syne font weight cap:** Google Fonts Syne family supports weights 400-800, not 900. The auth layout uses `["400", "600", "700", "800"]`.
- **verify-email fetch approach:** The verify-email page calls the Better Auth GET endpoint directly via `fetch()` rather than importing a client-side `verifyEmail` method, since the verification token arrives as a URL query parameter.
- **Dynamic imports for email callbacks:** Email sender functions are imported dynamically (`await import()`) in auth.ts to prevent loading the Resend SDK at module initialization time on every request.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed Syne font weight 900 not available**
- **Found during:** Task 1 (build verification)
- **Issue:** Google Fonts Syne font does not have weight 900; available weights are 400-800
- **Fix:** Changed Syne weight array from `["400", "600", "700", "800", "900"]` to `["400", "600", "700", "800"]`
- **Files modified:** src/app/(auth)/layout.tsx
- **Verification:** Build passes after fix
- **Committed in:** 82168a1 (Task 1 commit)

**2. [Rule 3 - Blocking] Fixed phone field TypeScript type error in signUp**
- **Found during:** Task 1 (build verification)
- **Issue:** Better Auth client TypeScript types do not include custom `phone` additionalField, causing `Object literal may only specify known properties` error
- **Fix:** Pass `phone` through `fetchOptions.body` as second argument to `signUp.email()` instead of in the main options object
- **Files modified:** src/components/auth/SignUpForm.tsx
- **Verification:** Build passes, phone field will be included in the request body
- **Committed in:** 82168a1 (Task 1 commit)

**3. [Rule 1 - Bug] Corrected Better Auth callback names per actual API**
- **Found during:** Task 2 (auth.ts wiring)
- **Issue:** Plan specified `sendResetPasswordEmail` callback name but actual Better Auth API uses `sendResetPassword`; also the callback receives `{ user, url, token }` as a single data object, not separate positional parameters
- **Fix:** Used correct `sendResetPassword` callback name and destructured `({ user, url })` from the data object per the actual @better-auth/core type definitions
- **Files modified:** src/lib/auth.ts
- **Verification:** Build passes
- **Committed in:** 7f2d57d (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (2 blocking, 1 bug)
**Impact on plan:** All auto-fixes necessary for correctness and build success. No scope creep.

## Issues Encountered

- Better Auth client types are generated statically and do not reflect server-side `user.additionalFields`. Custom fields must be passed through `fetchOptions.body` or via a type-augmented client. This is a known Better Auth limitation for client-side TypeScript.

## User Setup Required

None - no external service configuration required for the auth pages themselves. Email sending requires `RESEND_API_KEY` and `EMAIL_FROM` environment variables to be set, but the app builds and runs without them (emails will fail silently at runtime until configured).

## Next Phase Readiness
- Auth surface is complete and ready for dashboard shell (Phase 2)
- The (auth)/ route group pattern is established and can be extended for (portal)/ and (admin)/ groups
- Dashboard CSS isolation pattern established -- Phase 2 can extend dashboard.css for dashboard-specific components
- Auth pages redirect to /dashboard which does not exist yet -- Phase 2 must create this route

## Self-Check: PASSED

All 12 files verified present on disk. Both task commits (82168a1, 7f2d57d) confirmed in git log. Build passes cleanly with all 5 auth routes in route tree.

---
*Phase: 01-foundation*
*Completed: 2026-05-15*
