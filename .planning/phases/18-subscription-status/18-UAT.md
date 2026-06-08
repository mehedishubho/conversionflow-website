---
status: diagnosed
phase: 18-subscription-status
source: 18-01-SUMMARY.md, 18-02-SUMMARY.md
started: 2026-06-08T12:00:00Z
updated: 2026-06-08T12:35:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Subscription License Grace Period Status
expected: When a subscription license naturally expires, it enters grace_period status instead of immediate expiration. During grace period, the license is still valid with a visible grace_period_expires_at date.
result: pass

### 2. Expiry Date Calculation Accuracy
expected: Expiry dates are calculated with exact calendar math. For example, a license purchased Jan 31 for 1 month expires Feb 28/29 (not Mar 3). A 12-month subscription purchased any date expires on the same day-next-year or last day of month if clamped.
result: issue
reported: "Created Jun 8, 2026, Expiry Jun 6, 2026 — expiry date is 2 days BEFORE creation date, should be in the future based on plan duration"
severity: major

### 3. Invalid License Status Transitions Blocked
expected: The state machine prevents invalid transitions. For example, an "expired" license cannot directly go to "suspended" — it must be reactivated to "active" first. Any invalid transition attempt is rejected with an error.
result: pass

### 4. Order Checkout Sets Correct Expiry Date
expected: When a customer purchases a subscription plan (e.g., 12-month), the license created during order completion has an exact calendar-based expires_at date (not approximate 30-day calculation).
result: pass

### 5. ValidateLicense Returns Grace Period Info
expected: Calling the license validation API for a recently expired subscription license returns valid: true with a grace_period_expires_at field showing when the grace period ends. After grace period ends, returns valid: false.
result: pass

### 6. Grace Period Days Configurable in Settings
expected: Grace period days are fetched from the settings table (key: grace_period_days). Default is 7 days. Admin can set between 7-30 days. Changes apply immediately (no cache delay).
result: pass

### 7. Revoked/Suspended Licenses Skip Grace Period
expected: A license that is revoked or suspended by admin gets NO grace period — validation immediately returns invalid. Only naturally expired subscriptions get grace period.
result: pass

### 8. Expiry Reminder Email with Variable Urgency
expected: Expiry reminder emails show urgency that changes based on days remaining: informational (14+ days, green), reminder (7+ days, orange), urgent (3+ days, red), final notice (1 day, red). Email includes plan name, masked license key, and expiry date.
result: pass

### 9. Grace Period Entry Email
expected: When a license enters grace period, an email is sent with orange warning styling showing both the "expired on" date and "grace period ends" date, with a "Renew Your License" CTA button.
result: pass

### 10. License Expired Email
expected: When grace period ends and license fully expires, a final email is sent with red status badge explaining impact (premium features lost, no updates/support) with a "Renew Your License" CTA.
result: pass

## Summary

total: 10
passed: 9
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Expiry dates are calculated with exact calendar math — a license created Jun 8 should have expiry in the future based on plan duration"
  status: failed
  reason: "User reported: Created Jun 8, 2026, Expiry Jun 6, 2026 — expiry date is 2 days BEFORE creation date"
  severity: major
  test: 2
  root_cause: "ExpiryCalculator.calculateExpiry() hardcodes 12 for 'yearly' billing cycle, ignoring billingDurationMonths. Professional plan has billingCycle=yearly with billingDurationMonths=24 but gets only 12 months. Fix: use billingDurationMonths ?? 12 for yearly plans too."
  artifacts:
    - path: "src/modules/licensing/application/services/ExpiryCalculator.ts"
      issue: "Line 33: billingCycle === 'yearly' ? 12 — ignores billingDurationMonths"
  missing:
    - "Change yearly logic to: billingDurationMonths ?? 12 (respect plan-specific duration)"
