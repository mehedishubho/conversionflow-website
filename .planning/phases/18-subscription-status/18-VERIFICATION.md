---
phase: 18-subscription-status
verified: 2026-06-03T14:21:45Z
status: gaps_found
score: 11/14 must-haves verified
overrides_applied: 0
gaps:
  - truth: "Validation API returns valid=true with grace_period_expires_at when license is within grace period"
    status: failed
    reason: "ValidateLicenseHandler correctly computes grace_period_expires_at in ValidateResult, but the API route (src/app/api/v1/license/validate/route.ts) does NOT include grace_period_expires_at in the HTTP JSON response. The field is computed then silently dropped at line 83-91."
    artifacts:
      - path: "src/app/api/v1/license/validate/route.ts"
        issue: "Success response (lines 83-91) does not serialize grace_period_expires_at from ValidateResult"
    missing:
      - "Add grace_period_expires_at to the JSON response in route.ts line 83-91, e.g.: grace_period_expires_at: result.grace_period_expires_at?.toISOString() ?? null"
  - truth: "Worker transitions active -> grace_period for licenses past expires_at within grace window"
    status: partial
    reason: "Worker correctly calls licenseRepo.updateStatus() for active->grace_period transition, but updateStatus() does NOT validate the transition via LicenseStateMachine. The state machine is completely orphaned -- never imported or used anywhere except its own definition and barrel export."
    artifacts:
      - path: "src/jobs/workers/subscription-lifecycle.ts"
        issue: "Does not import or use LicenseStateMachine for transition validation"
      - path: "src/modules/licensing/infrastructure/repositories/LicenseRepository.ts"
        issue: "updateStatus() directly writes new status without calling LicenseStateMachine.transition()"
    missing:
      - "Either import LicenseStateMachine in the worker and call transition() before updateStatus(), or add validation inside updateStatus()"
  - truth: "State machine rejects all invalid transitions and accepts only the defined valid ones"
    status: failed
    reason: "LicenseStateMachine exists with correct transition map but is never called in any code path. No runtime enforcement of valid transitions. The repository's updateStatus() writes any status directly to the database without state machine validation."
    artifacts:
      - path: "src/modules/licensing/domain/services/LicenseStateMachine.ts"
        issue: "File exists but is never imported or used outside barrel export -- orphaned artifact"
      - path: "src/modules/licensing/infrastructure/repositories/LicenseRepository.ts"
        issue: "updateStatus() bypasses state machine validation"
    missing:
      - "Wire LicenseStateMachine.transition() into either the worker or the repository before any status update"
---

# Phase 18: Subscription & Status Management Verification Report

**Phase Goal:** The platform manages subscription lifecycle with expiration tracking, grace periods, renewal processing, and lifetime license support -- ensuring continuous license validity.
**Verified:** 2026-06-03T14:21:45Z
**Status:** gaps_found
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | LicenseStatusEnum includes grace_period as a valid status value | VERIFIED | `src/lib/db/schema.ts` line 35-41: licenseStatusEnum includes "grace_period" |
| 2 | State machine rejects all invalid transitions and accepts only the defined valid ones | FAILED | LicenseStateMachine exists but is NEVER called -- orphaned. updateStatus() writes directly without validation |
| 3 | ExpiryCalculator produces exact calendar dates with last-day-of-month clamping | VERIFIED | `src/modules/licensing/application/services/ExpiryCalculator.ts` line 37-43: setMonth + setDate(0) clamping |
| 4 | Lifetime licenses have expiresAt=null and are skipped by expiration queries | VERIFIED | License.daysUntilExpiry returns Infinity for null; findExpiringLicenses filters `isNotNull(licenses.expiresAt)` |
| 5 | OrderCompletedHandler sets expiresAt using exact calendar math | VERIFIED | OrderCompletedHandler.ts line 183: ExpiryCalculator.calculateExpiry replaces old approximate calc |
| 6 | Validation API returns valid=true with grace_period_expires_at when license is within grace period | FAILED | Handler computes it but API route drops it -- grace_period_expires_at missing from HTTP response |
| 7 | Validation API returns valid=false when license is past grace period | VERIFIED | ValidateLicenseHandler.ts line 158: returns INVALID when past grace end |
| 8 | Validation API performs real-time expiry check on every request as a safety net | VERIFIED | ValidateLicenseHandler.ts line 117: `new Date() > license.expiresAt` check |
| 9 | Three email templates exist: countdown reminder, grace period entry, and final expiration | VERIFIED | All three files exist with exports: sendLicenseExpiryReminderEmail, sendGracePeriodEmail, sendLicenseExpiredEmail |
| 10 | Countdown reminder template accepts variable urgency level (30, 14, 7, 3, 1 days) | VERIFIED | license-expiry-reminder.ts lines 27-32: getSubject varies by daysUntilExpiry |
| 11 | Daily BullMQ worker finds expiring/expired licenses and processes status transitions | VERIFIED | subscription-lifecycle.ts: processDailySubscriptionCheck with findExpiringLicenses + updateStatus |
| 12 | Worker sends reminder emails at 30, 14, 7, 3, 1 days before expiry with dedup tracking | VERIFIED | subscription-lifecycle.ts lines 251-279: milestone loop with hasReminderBeenSent dedup |
| 13 | Worker continues on partial failure (individual license errors don't stop processing) | VERIFIED | subscription-lifecycle.ts: per-license try/catch, console.error + continue |
| 14 | Admin can configure grace period days (7-30) and reminder milestones via settings page | VERIFIED | SubscriptionSettingsForm.tsx + admin-settings.ts saveSubscriptionSettings with validation |

**Score:** 11/14 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/db/schema.ts` | grace_period enum, licenseReminders table | VERIFIED | Enum at line 35-41, table at line 250-267 with unique constraint and relations |
| `src/modules/licensing/domain/services/LicenseStateMachine.ts` | State transition validation | ORPHANED | Exists with correct transition map but never imported/used in any code path |
| `src/modules/licensing/application/services/ExpiryCalculator.ts` | Exact calendar date calculation | VERIFIED | calculateExpiry with last-day clamping via setDate(0) |
| `src/modules/licensing/domain/events/LicenseEvents.ts` | LICENSE_GRACE_PERIOD_STARTED and LICENSE_EXPIRED events | VERIFIED | Both event types added at lines 21-22 |
| `src/modules/licensing/domain/entities/License.ts` | isInGracePeriod and daysUntilExpiry getters | VERIFIED | Both getters present at lines 60-73 |
| `src/modules/licensing/application/commands/ValidateLicenseHandler.ts` | Grace period-aware validation | VERIFIED | getGracePeriodDays, grace_period_expires_at in result, real-time expiry check |
| `src/lib/emails/license-expiry-reminder.ts` | Countdown reminder email | VERIFIED | Variable urgency subjects, color-coded banners, resend.emails.send |
| `src/lib/emails/license-grace-period.ts` | Grace period entry notification | VERIFIED | Orange warning styling, gracePeriodEndsAt, subject contains "Grace Period" |
| `src/lib/emails/license-expired.ts` | Final expiration notification | VERIFIED | Red status badge, subject "Has Expired", resend.emails.send |
| `src/jobs/workers/subscription-lifecycle.ts` | Daily BullMQ worker | VERIFIED | startSubscriptionWorker + scheduleSubscriptionJob exports, cron "0 2 * * *" |
| `src/jobs/queues.ts` | Updated queue with SUBSCRIPTION_LIFECYCLE | VERIFIED | QUEUE_NAMES.SUBSCRIPTION_LIFECYCLE + subscriptionQueue export |
| `src/modules/licensing/infrastructure/repositories/LicenseRepository.ts` | findExpiringLicenses, updateStatus | VERIFIED | Both methods present at lines 131-179 |
| `src/app/(admin)/admin/settings/subscription/page.tsx` | Admin subscription settings page | VERIFIED | Calls getSubscriptionSettings, renders SubscriptionSettingsForm |
| `src/components/admin/SubscriptionSettingsForm.tsx` | Subscription settings form | VERIFIED | "use client", gracePeriodDays input, saveSubscriptionSettings action |
| `src/components/admin/SettingsOverviewCards.tsx` | Subscription card in overview | VERIFIED | Subscription card with Clock icon at /admin/settings/subscription |
| `src/lib/module-init.ts` | Worker registration | VERIFIED | startSubscriptionWorker + scheduleSubscriptionJob imported and called |
| `src/modules/licensing/index.ts` | Barrel exports for new services | VERIFIED | LicenseStateMachine and ExpiryCalculator exported at lines 15-16 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| OrderCompletedHandler.ts | ExpiryCalculator.ts | import + calculateExpiry | WIRED | Line 20 import, line 183 usage |
| ValidateLicenseHandler.ts | settings table | getGracePeriodDays db query | WIRED | Lines 47-62: db query for grace_period_days |
| subscription-lifecycle.ts | LicenseStateMachine.ts | import + transition | NOT_WIRED | State machine never imported or used |
| subscription-lifecycle.ts | license-expiry-reminder.ts | import sendLicenseExpiryReminderEmail | WIRED | Line 21 import, line 262 usage |
| subscription-lifecycle.ts | license-grace-period.ts | import sendGracePeriodEmail | WIRED | Line 22 import, line 155 usage |
| subscription-lifecycle.ts | license-expired.ts | import sendLicenseExpiredEmail | WIRED | Line 23 import, line 213 usage |
| subscription-lifecycle.ts | ValidationCache | invalidateAll | WIRED | Lines 195, 247: cache invalidation on transitions |
| subscription-lifecycle.ts | inProcessPublisher | publish events | WIRED | Lines 174, 230: LICENSE_GRACE_PERIOD_STARTED and LICENSE_EXPIRED events |
| module-init.ts | subscription-lifecycle.ts | import + start + schedule | WIRED | Line 11 import, lines 27-29 usage |
| subscription/page.tsx | admin-settings.ts | getSubscriptionSettings | WIRED | Line 1 import |
| SubscriptionSettingsForm.tsx | admin-settings.ts | saveSubscriptionSettings | WIRED | Line 7 import, line 46 usage |
| SettingsOverviewCards.tsx | /admin/settings/subscription | link | WIRED | Line 50-54: Subscription card with href |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| ValidateLicenseHandler | grace_period_expires_at | settings table + expiresAt calc | Yes (but dropped by route) | HOLLOW -- computed in handler, not surfaced in API response |
| subscription-lifecycle.ts | expiringLicenses | findExpiringLicenses DB query | Yes | FLOWING |
| subscription-lifecycle.ts | gracePeriodDays | settings table query | Yes | FLOWING |
| subscription-lifecycle.ts | reminderMilestones | settings table query | Yes | FLOWING |
| SubscriptionSettingsForm | gracePeriodDays | admin-settings.ts getSubscriptionSettings | Yes | FLOWING |
| OrderCompletedHandler | expiresAt | ExpiryCalculator.calculateExpiry | Yes | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| ExpiryCalculator last-day clamping | `node -e "const c=require('./src/modules/licensing/application/services/ExpiryCalculator'); const d=c.ExpiryCalculator.calculateExpiry(new Date('2026-01-31'), 'monthly', null); console.log(d.toISOString())"` | N/A (TypeScript module) | SKIP |
| LicenseStateMachine rejects invalid | N/A (module import needed) | N/A | SKIP |
| TypeScript compilation | `npx tsc --noEmit` | Only pre-existing errors in analytics-dashboard.ts | PASS |

Step 7b: SKIPPED (no runnable entry points for direct behavioral testing without running server)

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| LSTAT-01 | 01, 03 | License status supports: active, expired, revoked, suspended, grace_period | SATISFIED | Enum includes grace_period, state machine defines transitions |
| LSTAT-02 | 01 | Subscription licenses have expires_at timestamp in UTC | SATISFIED | expiresAt field in schema, ExpiryCalculator sets it |
| LSTAT-03 | 02, 03 | Grace period 7-30 days keeps license valid | PARTIAL | Handler logic works, but API route does not expose grace_period_expires_at to consumers |
| LSTAT-04 | 01 | Lifetime licenses have null expires_at | SATISFIED | null expiresAt, worker skips with `isNotNull` filter |
| LSTAT-07 | 02, 03 | Background job checks expiring licenses daily, sends reminders | SATISFIED | BullMQ worker with cron, reminder emails with dedup |
| JOB-01 | 03 | BullMQ worker processes license expiration checks daily | SATISFIED | subscription-lifecycle.ts with daily cron |
| JOB-02 | 02, 03 | Worker sends renewal reminder emails based on expiration date | SATISFIED | Reminder emails at milestones with variable urgency |
| JOB-04 | 03 | Jobs use Redis for queue management and retry logic with exponential backoff | SATISFIED | BullMQ with attempts:3, exponential backoff, Redis connection |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | - | - | - | No TODO/FIXME/placeholder/empty implementations found |

### Human Verification Required

### 1. Admin Subscription Settings Page

**Test:** Navigate to /admin/settings, click "Subscription" card, verify form loads with defaults (grace period 7, milestones "30,14,7,3,1"), change grace period to 14, save, refresh page.
**Expected:** Form loads, saves successfully, persists after page refresh.
**Why human:** Requires running dev server and browser interaction to verify UI rendering, form submission, and database persistence.

### 2. Grace Period Validation Response

**Test:** With a test license past expires_at but within grace period, call POST /api/v1/license/validate with valid credentials.
**Expected:** Response includes `grace_period_expires_at` field with a future date. NOTE: This will currently FAIL -- the field is missing from the route response.
**Why human:** Requires running server, seeded test data, and API call to verify end-to-end behavior.

### 3. Worker Daily Processing

**Test:** Trigger the subscription worker manually and verify status transitions, email sending, and event publishing.
**Expected:** Licenses transition correctly through active -> grace_period -> expired, emails sent at each milestone.
**Why human:** Requires running server with Redis, database with test licenses, and email service configuration.

### Gaps Summary

Three gaps were identified, all stemming from two root causes:

**Root Cause 1: LicenseStateMachine is orphaned.** The state machine is a well-designed artifact with the correct D-23 transition map, but it is never imported or used in any code path. The worker calls `licenseRepo.updateStatus()` directly, and the repository writes status changes to the database without validating via the state machine. This means invalid transitions could be silently applied.

**Root Cause 2: API route does not surface grace_period_expires_at.** The ValidateLicenseHandler correctly computes the `grace_period_expires_at` field and includes it in the `ValidateResult`, but the API route handler at `src/app/api/v1/license/validate/route.ts` (lines 83-91) only serializes a fixed set of fields, omitting `grace_period_expires_at`. The WordPress plugin (the primary consumer) would never know a license is in grace period, defeating the purpose of D-02.

**Fix summary:**
1. Add `grace_period_expires_at: result.grace_period_expires_at?.toISOString() ?? null` to the API route response
2. Wire `LicenseStateMachine.transition()` into either the worker (before calling updateStatus) or the repository's updateStatus method

---

_Verified: 2026-06-03T14:21:45Z_
_Verifier: Claude (gsd-verifier)_
