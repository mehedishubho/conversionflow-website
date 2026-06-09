---
phase: 16-licensing-core
plan: 03
subsystem: application, api
tags: [cqrs, command-handlers, query-handlers, cache-invalidation, rate-limiting, api-routes, validation, activation, deactivation]

# Dependency graph
requires:
  - phase: 16-licensing-core/16-01
    provides: License and Activation entities, LicenseKey VO, domain events, LicenseKeyGenerator, ApiTokenGenerator, VerificationTokenIssuer
  - phase: 16-licensing-core/16-02
    provides: LicenseRepository (atomic ops), ActivationRepository, RateLimiter, ValidationCache, DnsVerifier, HttpProofFetcher, SuspiciousFlagDetector
  - phase: 14-shared-infrastructure
    provides: BaseRepository, EventBus (inProcessPublisher, inProcessSubscriber), BaseEvent type
provides:
  - ValidateLicenseHandler with 10-step validation flow and uniform error responses (LGEN-09)
  - ActivateLicenseHandler with DNS/file/meta verification, atomic increment, suspicious flag detection
  - DeactivateLicenseHandler with auth check delegating to shared performDeactivation()
  - deactivationService.ts with shared logic for API and portal deactivation paths
  - GenerateLicenseHandler for admin/checkout license creation with key + token generation
  - GetActivationHistoryHandler for paginated activation history queries
  - GetActiveDomainsHandler for portal active domain display
  - Cache invalidation via EventBus subscription on 4 license events
  - POST /api/v1/license/validate route handler with rate limiting and uniform 404 errors
  - POST /api/v1/license/activate route handler with verification_method validation
  - POST /api/v1/license/deactivate route handler with domain removal
  - Barrel export at src/modules/licensing/application/index.ts
affects: [16-04, 16-05, 17-billing, 18-subscriptions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CQRS command handlers with static execute() method pattern"
    - "Shared deactivation service for API/portal code reuse (D-29)"
    - "Uniform INVALID_RESPONSE factory for all validate error paths (LGEN-09, T-16-09)"
    - "Route handlers as thin delegation layer with no business logic (D-27)"

key-files:
  created:
    - src/modules/licensing/application/commands/ValidateLicenseHandler.ts
    - src/modules/licensing/application/commands/ActivateLicenseHandler.ts
    - src/modules/licensing/application/commands/DeactivateLicenseHandler.ts
    - src/modules/licensing/application/commands/deactivationService.ts
    - src/modules/licensing/application/commands/GenerateLicenseHandler.ts
    - src/modules/licensing/application/queries/GetActivationHistoryHandler.ts
    - src/modules/licensing/application/queries/GetActiveDomainsHandler.ts
    - src/modules/licensing/application/cacheInvalidation.ts
    - src/modules/licensing/application/index.ts
    - src/app/api/v1/license/validate/route.ts
    - src/app/api/v1/license/activate/route.ts
    - src/app/api/v1/license/deactivate/route.ts
  modified:
    - src/modules/licensing/application/index.ts

key-decisions:
  - "Combined Tasks 1a and 1b into single commit -- tightly coupled barrel export references both command and query handlers"
  - "performDeactivation() in deactivationService.ts is a standalone async function (not a class) to enable direct reuse from both API handler and future portal server action"

patterns-established:
  - "Command handlers are static classes with execute() method, no DI container needed"
  - "Query handlers are static classes with execute() returning domain entities or DTOs"
  - "Cache invalidation uses inProcessSubscriber for 4 license events with try/catch error isolation"
  - "Route handlers follow pattern: rate limit -> parse body -> validate fields -> delegate to handler -> format response"

requirements-completed: [LGEN-05, LGEN-07, LGEN-09, ACT-06, API-01, API-02, API-03, API-05]

# Metrics
duration: 6min
completed: 2026-06-02
---

# Phase 16 Plan 03: Application Layer and Public API Routes Summary

**CQRS command handlers (validate, activate, deactivate, generate), query handlers, EventBus-driven cache invalidation, and three thin POST route handlers wiring the licensing bounded context to /api/v1/license/* endpoints**

## Performance

- **Duration:** 6 min
- **Started:** 2026-06-02T17:36:07Z
- **Completed:** 2026-06-02T17:42:10Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- ValidateLicenseHandler implements full 10-step validation flow with Redis cache (10-min TTL) and uniform error responses for all failure paths (LGEN-09, D-21)
- ActivateLicenseHandler implements domain verification (DNS/file/meta), atomic activation count increment, suspicious flag detection, history logging, and event publishing
- Shared performDeactivation() function ensures identical behavior between API route and future portal server action (D-29)
- Three public API route handlers with rate limiting (100 req/min/IP), request validation, and thin delegation to command handlers
- Cache invalidation via EventBus subscription on LicenseActivated/Deactivated/Revoked/Suspended events

## Task Commits

Each task was committed atomically:

1. **Task 1a+1b: Application command handlers, query handlers, cache invalidation, barrel export** - `84030e2` (feat)
2. **Task 2: Three public API route handlers** - `309f2a1` (feat)

## Files Created/Modified
- `src/modules/licensing/application/commands/ValidateLicenseHandler.ts` - 10-step validation: parse key, cache lookup, DB lookup, token validation, status/expiry/domain checks, cache set
- `src/modules/licensing/application/commands/ActivateLicenseHandler.ts` - Full activation flow: auth, verification proof, consume token, atomic increment, history, event
- `src/modules/licensing/application/commands/DeactivateLicenseHandler.ts` - Auth check + delegation to performDeactivation()
- `src/modules/licensing/application/commands/deactivationService.ts` - Shared performDeactivation() for API and portal paths
- `src/modules/licensing/application/commands/GenerateLicenseHandler.ts` - License + API token generation for admin/checkout
- `src/modules/licensing/application/queries/GetActivationHistoryHandler.ts` - Paginated activation history for admin/portal
- `src/modules/licensing/application/queries/GetActiveDomainsHandler.ts` - Active domains query for portal display
- `src/modules/licensing/application/cacheInvalidation.ts` - EventBus subscription for cache invalidation on 4 license events
- `src/modules/licensing/application/index.ts` - Barrel export for all handlers and registerCacheInvalidationHandlers
- `src/app/api/v1/license/validate/route.ts` - POST handler with uniform 404 for all failures (LGEN-09)
- `src/app/api/v1/license/activate/route.ts` - POST handler with verification_method validation, 200/403/404/409/429 responses
- `src/app/api/v1/license/deactivate/route.ts` - POST handler with domain removal, 200/404/429 responses

## Decisions Made
- Combined Tasks 1a and 1b into single commit since the barrel export (index.ts) references both command and query handlers -- splitting would leave a broken intermediate state
- performDeactivation() is a standalone async function rather than a static class method to enable direct import and reuse from both the API handler and future portal server action without instantiation
- All three route handlers extract IP from x-forwarded-for header with fallback to "unknown" for rate limiting

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript errors in src/app/(admin)/actions/analytics-dashboard.ts (59 errors) remain out of scope

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All application handlers and API routes ready for Plan 04 (admin portal integration and portal domain management UI)
- GenerateLicenseHandler ready for Phase 17 checkout event handler to call
- performDeactivation() ready for portal deactivation server action (Plan 05)
- registerCacheInvalidationHandlers() ready to be called during app startup initialization

---
*Phase: 16-licensing-core*
*Completed: 2026-06-02*

## Self-Check: PASSED

All 12 files verified present. Both task commits (84030e2, 309f2a1) verified in git log. TypeScript compiles without errors in all licensing and API route modules.
