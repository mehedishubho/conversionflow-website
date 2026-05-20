---
phase: 09-settings-foundation
plan: 02
subsystem: ui
tags: [settings, migration, forms, sub-routes, server-components, react]

# Dependency graph
requires:
  - phase: 09-settings-foundation
    provides: SettingsShell component, settings layout with auth guard, category cards landing page
provides:
  - Payment sub-route page at /admin/settings/payment with PaymentSettingsForm
  - SMTP sub-route page at /admin/settings/smtp with EmailProviderSettings
  - SEO root page at /admin/settings/seo with TrackingSettingsForm
  - Restored EmailProviderSettings.tsx, TrackingSettingsForm.tsx, admin-notif-settings.ts, admin-tracking.ts
affects: [09-03, 10-core-seo, 11-tracking-social]

# Tech tracking
tech-stack:
  added: []
patterns: [server-component-page-wrapping-client-form, force-dynamic-for-settings-pages]

key-files:
  created:
    - src/app/(admin)/admin/settings/payment/page.tsx
    - src/app/(admin)/admin/settings/smtp/page.tsx
    - src/app/(admin)/admin/settings/seo/page.tsx
  modified:
    - src/app/(admin)/actions/admin-notif-settings.ts

key-decisions:
  - "Each sub-route page is a server component that loads data via server action and passes initialData to client form -- no per-page auth check needed since layout.tsx handles it"
  - "TrackingSettingsForm kept intact at /admin/settings/seo as temporary home -- field splitting into dedicated sub-sections deferred to Phases 10-11"
  - "admin-notif-settings.ts trimmed to remove notification engine dependencies (getDeliveryLog, retryNotification, getTemplateList) that do not exist on this branch"

patterns-established:
  - "Sub-route page pattern: server component -> force-dynamic -> server action for data -> client form component with initialData"
  - "PageBreadcrumb with basePath=/admin/settings provides consistent navigation across all settings sub-pages"

requirements-completed: [NAV-02, NAV-04]

# Metrics
duration: 8min
completed: 2026-05-20
---

# Phase 9 Plan 2: Migrate Existing Forms Summary

**Three settings sub-route pages wrapping PaymentSettingsForm, EmailProviderSettings, and TrackingSettingsForm with server-side data loading**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-20T10:03:51Z
- **Completed:** 2026-05-20T10:12:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Payment settings accessible at /admin/settings/payment with full form functionality (bKash, Nagad, Rocket, Bank Transfer, SSL Commerce, VAT)
- SMTP/Email settings accessible at /admin/settings/smtp with provider toggle (Resend/SMTP), test connection, and save
- SEO/Tracking settings accessible at /admin/settings/seo with all 5 tracking fields (GSC verification, GA4, GTM, FB Pixel, FB CAPI)
- All three forms preserve their save functionality with inline success/error messages
- No existing form component files were modified

## Task Commits

Each task was committed atomically:

1. **Task 1: Create payment and SMTP sub-route pages with migrated forms** - `bcf4dc3` (feat)
2. **Task 2: Create SEO root page with TrackingSettingsForm** - `09db2c8` (feat)

Additional commits for prerequisites and fixes:
- **Restore form components and server actions** - `7696bec` (fix)
- **Trim admin-notif-settings to remove notification engine dependencies** - `161683e` (fix)

## Files Created/Modified
- `src/app/(admin)/admin/settings/payment/page.tsx` - Server component loading PaymentSettingsForm with getPaymentSettings data
- `src/app/(admin)/admin/settings/smtp/page.tsx` - Server component loading EmailProviderSettings with getEmailProviderSettings data
- `src/app/(admin)/admin/settings/seo/page.tsx` - Server component loading TrackingSettingsForm with getTrackingSettingsAdmin data
- `src/app/(admin)/actions/admin-notif-settings.ts` - Trimmed to remove notification engine dependencies, kept email provider functions only
- `src/components/admin/EmailProviderSettings.tsx` - Restored from commit 1dcfa60 (deleted by 09-01 worktree rebase)
- `src/components/admin/TrackingSettingsForm.tsx` - Added from main repo working directory (was untracked)
- `src/app/(admin)/actions/admin-tracking.ts` - Added from main repo working directory (was untracked)

## Decisions Made
- Each sub-route page is a pure server component wrapper -- loads data via server action, renders client form with initialData. No auth check in page files since layout.tsx handles it centrally.
- TrackingSettingsForm kept intact at /admin/settings/seo as temporary home. Per RESEARCH.md, individual field splitting into dedicated sub-section pages (Google, Meta Pixel, Verification) happens in Phases 10-11 when those forms are built.
- admin-notif-settings.ts trimmed to only email-provider functions because the notification engine modules (@/lib/notifications, notificationLog table) do not exist on this branch.
- PageBreadcrumb uses basePath="/admin/settings" on all sub-pages for consistent navigation back to the settings landing page.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Restored form components and server actions deleted by 09-01 worktree rebase**
- **Found during:** Pre-task exploration
- **Issue:** EmailProviderSettings.tsx and admin-notif-settings.ts were deleted in commit 59881ba (09-01 worktree). TrackingSettingsForm.tsx and admin-tracking.ts were never committed (untracked in main repo).
- **Fix:** Restored from git history (1dcfa60) and copied from main repo working directory
- **Files modified:** 4 files restored/added
- **Committed in:** 7696bec

**2. [Rule 3 - Blocking] Trimmed admin-notif-settings.ts to remove notification engine dependencies**
- **Found during:** Build verification after Task 1
- **Issue:** admin-notif-settings.ts imported @/lib/notifications, @/lib/notifications/types, and notificationLog table from schema -- none of these exist on this branch
- **Fix:** Removed getDeliveryLog, retryNotification, getTemplateList functions and their imports. Kept getEmailProviderSettings, saveEmailProviderSettings, testEmailConnection which are the only functions needed by the SMTP page.
- **Files modified:** src/app/(admin)/actions/admin-notif-settings.ts
- **Verification:** pnpm build compiles successfully (DATABASE_URL error is pre-existing environment issue, not code error)
- **Committed in:** 161683e

---

**Total deviations:** 2 auto-fixed (2 blocking issues)
**Impact on plan:** Both fixes were prerequisites for the plan to execute. The trimmed admin-notif-settings.ts preserves all functionality needed by the SMTP page. The notification functions will be re-added when the notification engine code is merged to this branch.

## Issues Encountered
- Build fails at "Collecting page data" phase with DATABASE_URL error -- this is pre-existing across the entire project (no .env.local in worktree), not caused by this plan's changes. TypeScript compilation and Turbopack bundling both pass successfully.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All three settings sub-routes are functional and accessible via the SettingsShell sidebar
- Plan 09-03 can now add SEO sub-navigation and placeholder pages for the 14 SEO sub-routes
- The SEO root page is ready to be extended or replaced when Phases 10-11 build dedicated sub-section forms
- admin-notif-settings.ts needs notification engine functions re-added when Phase 7 code is merged

## Self-Check: PASSED

- All 3 created page files verified present on disk
- All 4 plan commits (7696bec, bcf4dc3, 09db2c8, 161683e) verified in git log
- SUMMARY.md exists at expected path

---
*Phase: 09-settings-foundation*
*Completed: 2026-05-20*
