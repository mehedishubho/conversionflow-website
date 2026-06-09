---
phase: 16-licensing-core
plan: 01
subsystem: database, domain
tags: [crypto, drizzle, license-keys, api-tokens, verification-tokens, ddd, domain-events]

# Dependency graph
requires:
  - phase: 14-shared-infrastructure
    provides: Event bus types (BaseEvent), shared value objects, Redis helpers
  - phase: 15-products
    provides: Product domain entity pattern, ProductEvents pattern to replicate
provides:
  - license_activations table schema with 3 indexes
  - api_token_hash column on licenses table
  - Updated LicenseKey value object (12-32 char input, fromDatabase() method)
  - License aggregate root entity with status/activation getters
  - Activation entity for activation audit trail
  - LicenseEvents constants and factory function
  - LicenseKeyGenerator with crypto.randomBytes() rejection sampling (threshold=248)
  - ApiTokenGenerator with cf_live_ tokens, SHA-256 hashing, timingSafeEqual validation
  - VerificationTokenIssuer with 32-hex single-use tokens, Redis GETDEL
  - Barrel export at src/modules/licensing/domain/index.ts
affects: [16-02, 16-03, 16-04, 16-05, 17-billing, 18-subscriptions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Rejection sampling for unbiased key generation: threshold=floor(256/charset_len)*charset_len"
    - "Constant-time token validation via crypto.timingSafeEqual"
    - "Atomic GETDEL for single-use token consumption"
    - "Domain event factory following products-context pattern"

key-files:
  created:
    - src/modules/licensing/domain/entities/License.ts
    - src/modules/licensing/domain/entities/Activation.ts
    - src/modules/licensing/domain/events/LicenseEvents.ts
    - src/modules/licensing/domain/services/LicenseKeyGenerator.ts
    - src/modules/licensing/domain/services/ApiTokenGenerator.ts
    - src/modules/licensing/domain/services/VerificationTokenIssuer.ts
    - src/modules/licensing/domain/index.ts
  modified:
    - src/lib/db/schema.ts
    - src/shared/domain/valueObjects/LicenseKey.ts

key-decisions:
  - "Text type for ip_address instead of inet (simpler, no customType needed in Drizzle 0.45)"
  - "Updated licensesRelations to include activations as one-to-many (enables join queries)"

patterns-established:
  - "Licensing domain events follow PRODUCT_EVENTS pattern with createLicenseEvent factory"
  - "Domain services are static classes (no DI needed at domain layer)"
  - "Token consumption uses Redis GETDEL for atomicity, falls back to GET+DELETE for memory store"

requirements-completed: [LGEN-01, LGEN-02, LGEN-03, LGEN-04, ACT-01, ACT-02, ACT-05, API-04]

# Metrics
duration: 4min
completed: 2026-06-02
---

# Phase 16 Plan 01: Licensing Domain Foundation Summary

**Schema additions (license_activations table + api_token_hash), LicenseKey VO updated for 12-32 chars, and complete licensing domain layer with 2 entities, 5 event types, and 3 crypto-secure domain services**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-02T17:22:16Z
- **Completed:** 2026-06-02T17:26:56Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Database schema extended with license_activations table (9 columns, 3 indexes, cascade delete) and api_token_hash column on licenses
- LicenseKey value object updated to accept 12-32 char input for v2.x backward compatibility, with fromDatabase() bypass method
- Complete licensing domain layer created: License aggregate root, Activation entity, 5 event types, 3 domain services
- All three domain services use cryptographic best practices: rejection sampling, constant-time comparison, atomic token consumption

## Task Commits

Each task was committed atomically:

1. **Task 1: Add license_activations table and api_token_hash column to schema** - `362f6aa` (feat)
2. **Task 2: Create licensing domain layer with entities, events, and services** - `6da1654` (feat)

## Files Created/Modified
- `src/lib/db/schema.ts` - Added activationActionEnum, verificationMethodEnum, apiTokenHash column, licenseActivations table with 3 indexes, licenseActivationsRelations
- `src/shared/domain/valueObjects/LicenseKey.ts` - Updated min length from 16 to 12, added fromDatabase() static method
- `src/modules/licensing/domain/entities/License.ts` - License aggregate root with isActive, canActivate, hasExpiry, isExpired getters and create() factory
- `src/modules/licensing/domain/entities/Activation.ts` - Activation entity with ActivationAction and VerificationMethod types
- `src/modules/licensing/domain/events/LicenseEvents.ts` - 5 LICENSE_EVENTS constants and createLicenseEvent factory
- `src/modules/licensing/domain/services/LicenseKeyGenerator.ts` - 20-char key generation with crypto.randomBytes() rejection sampling (REJECTION_THRESHOLD=248)
- `src/modules/licensing/domain/services/ApiTokenGenerator.ts` - cf_live_ token generation, SHA-256 hashing, timingSafeEqual validation
- `src/modules/licensing/domain/services/VerificationTokenIssuer.ts` - 32-hex single-use tokens with Redis GETDEL, 24h TTL
- `src/modules/licensing/domain/index.ts` - Barrel export for all entities, events, and services

## Decisions Made
- Used text type for ip_address instead of inet -- inet requires customType in Drizzle 0.45 adding complexity with no runtime benefit
- Updated licensesRelations to include activations as one-to-many for future join query support
- Memory store fallback in VerificationTokenIssuer uses GET+DELETE (non-atomic) which is acceptable for development

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing 59 TypeScript errors in `src/app/(admin)/actions/analytics-dashboard.ts` -- out of scope, logged but not fixed

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Schema and domain layer ready for Plan 02 (license CRUD operations and repository)
- LicenseKeyGenerator ready to be called by license creation service
- ApiTokenGenerator ready for token provisioning during license creation
- VerificationTokenIssuer ready for domain verification flow in activation plans

---
*Phase: 16-licensing-core*
*Completed: 2026-06-02*

## Self-Check: PASSED

All 10 files verified present. Both task commits (362f6aa, 6da1654) verified in git log.
