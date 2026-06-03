---
phase: 18-subscription-status
plan: "02"
subsystem: licensing
tags: [validation, grace-period, email-templates, subscription-lifecycle]
dependency_graph:
  requires: [phase-14, phase-15, phase-16, phase-17]
  provides: [grace-period-validation, expiry-email-templates]
  affects: [ValidateLicenseHandler, email-system]
tech_stack:
  added: []
  patterns: [Resend-email, settings-table-lookup, real-time-expiry-check]
key_files:
  created:
    - src/lib/emails/license-expiry-reminder.ts
    - src/lib/emails/license-grace-period.ts
    - src/lib/emails/license-expired.ts
  modified:
    - src/modules/licensing/application/commands/ValidateLicenseHandler.ts
decisions:
  - Grace period days fetched from settings table with 7-day default and 7-30 range validation
  - ValidationCache.set used for grace period caching (TTL 600s) rather than shorter custom TTL
  - Grace period only applies to natural expiration, not revoked/suspended (D-07)
  - Three separate email templates rather than one combined template (D-20)
metrics:
  duration: ~8 minutes
  completed: "2026-06-03"
---

# Phase 18 Plan 02: Grace Period Validation & Email Templates Summary

**One-liner:** ValidateLicenseHandler returns valid with grace_period_expires_at during grace period; three email templates handle countdown reminders (variable urgency), grace period entry, and final expiration.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update ValidateLicenseHandler with grace period real-time check | 9819979 | `src/modules/licensing/application/commands/ValidateLicenseHandler.ts` |
| 2 | Create three email templates | f6ab877 | `src/lib/emails/license-expiry-reminder.ts`, `src/lib/emails/license-grace-period.ts`, `src/lib/emails/license-expired.ts` |

## Key Changes

### Task 1: ValidateLicenseHandler Grace Period Logic

- Added `grace_period_expires_at?: Date` to `ValidateResult` interface
- Added `getGracePeriodDays()` private static method that reads from `settings` table (key: `grace_period_days`), validates range 7-30, defaults to 7
- Replaced flat `status !== "active"` check with explicit `revoked`/`suspended` check (D-07: no grace for admin actions)
- Added real-time expiry check (D-03): if `expiresAt < now`, computes grace period end and returns `valid: true` with `grace_period_expires_at` when within grace window
- Past grace period returns `valid: false` (D-05)
- Validation API never writes status changes (D-04) -- only reads

### Task 2: Three Email Templates

1. **license-expiry-reminder.ts** -- Countdown reminder with variable urgency:
   - Subject line varies: informational (14+ days), reminder (7+ days), urgent (3+ days), final notice (1 day)
   - Color-coded urgency banner: green (30/14), orange (7/3), red (1)
   - Shows plan, masked license key, expiry date

2. **license-grace-period.ts** -- Grace period entry notification:
   - Orange warning styling
   - Shows both expired-on date and grace-period-ends date
   - CTA: "Renew Your License"

3. **license-expired.ts** -- Final expiration notification:
   - Red status badge
   - Explains impact: premium features lost, no updates/support
   - CTA: "Renew Your License"

All three follow the `order-confirmation.ts` pattern (Resend, inline CSS, ConversionFlow header/footer).

## Decisions Made

1. **Grace period DB lookup on every validation** -- No caching of grace_period_days setting. The DB query is fast and ensures config changes apply immediately (D-25).
2. **ValidationCache.set for grace period** -- Uses existing cache infrastructure (TTL 600s). Grace period entries get re-evaluated within a minute via the real-time expiry check anyway.
3. **Separate maskLicenseKey function per file** -- Each email template is self-contained with its own helper, matching the `order-confirmation.ts` pattern of single-file templates.

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

- `pnpm tsc --noEmit` passes with no new errors (pre-existing errors in `analytics-dashboard.ts` are out of scope)
- All acceptance criteria verified via grep checks
- `grace_period_expires_at` present in ValidateResult and grace period return path
- `getGracePeriodDays` present with settings table lookup and range validation
- All three email files export correctly named functions
- All three use `resend.emails.send`, `process.env.EMAIL_FROM`, and mask license keys

## Self-Check: PASSED

- All 4 files (1 modified + 3 created) exist on disk: CONFIRMED
- Both commits (9819979, f6ab877) exist in git log: CONFIRMED
