---
status: complete
phase: 16-licensing-core
source: 16-01-SUMMARY.md, 16-02-SUMMARY.md, 16-03-SUMMARY.md, 16-04-SUMMARY.md, 16-05-SUMMARY.md
started: 2026-06-06T11:30:00Z
updated: 2026-06-08T12:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. License API Validate Endpoint
expected: Send a POST to /api/v1/license/validate with invalid credentials. Should return 404 with {"valid": false, "error": "INVALID_LICENSE"} — uniform error for all failure paths.
result: pass

### 2. License API Activate Endpoint
expected: Send a POST to /api/v1/license/activate with invalid data. Should return an error response (not a 500 server error).
result: pass

### 3. License API Deactivate Endpoint
expected: Send a POST to /api/v1/license/deactivate with invalid data. Should return an error response (not a 500 server error).
result: pass

### 4. Rate Limiting
expected: Send 100+ rapid requests to /api/v1/license/validate from the same IP. After ~100 requests, should receive a 429 rate-limited response with Retry-After header.
result: pass

### 5. License Key Generation
expected: Admin verifies order → license auto-generated with crypto-secure key, appears on /admin/licenses and user dashboard.
result: pass
note: 5 bugs fixed to enable this — EventBus singleton, async error swallowing, UUID/slug mismatch (JOIN-based lookup), dynamic checkout prices, LicenseMapper empty id override.

### 6. Portal License Detail — Domain Deactivation
expected: License detail page loads showing key, status, plan details, domains list, deactivation buttons. Fixed server component event handler error.
result: pass

### 7. Portal Domain Activation Form
expected: ActivateDomainForm shows with improved UX — radio card method selector, download button for file upload, clear DNS table instructions, meta tag copy button.
result: pass
note: Rewrote ActivateDomainForm with step-by-step instructions, file download, domain validation, and visual method selector.

### 8. Admin Activation History
expected: Admin can navigate to /admin/licenses, click into license, view activations history page.
result: pass

### 9. Module Initialization
expected: The licensing module initializes at app startup via module-init.ts. License cache invalidation handlers are registered. TypeScript compilation passes.
result: pass

### 10. TypeScript Build
expected: Running pnpm build completes with 0 errors in all licensing module files.
result: pass

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none — all tests passed]

## Bugs Fixed During UAT

1. **EventBus singleton disconnect** — createPublisher() and createSubscriber() each created separate EventEmitterBus instances. Fix: both now share inProcessEventBus singleton.
2. **Async handler error swallowing** — EventEmitter.emit() doesn't await async handlers. Fix: added .catch() wrapper in registerBillingHandlers.
3. **UUID/slug type mismatch** — orders.productId stores text slug but product_plans.productId is UUID. Fix: added findByProductSlugAndPlanSlug() with JOIN.
4. **Hardcoded checkout productId** — PLAN_PRICES hardcoded "conversionflow-wp" slug. Fix: replaced with dynamic getPlanPrices() reading from DB.
5. **LicenseMapper empty id** — License.create() set id to "" overriding DB defaultRandom(). Fix: mapper omits id when empty.
6. **Server Component event handler** — TransferCodeInput had required onClaimSuccess callback from Server Component. Fix: made prop optional.
