---
phase: 16-licensing-core
plan: 02
subsystem: infrastructure, repositories, adapters
tags: [drizzle, redis, dns, rate-limiting, validation-cache, atomic-ops, sha256, sorted-sets]

# Dependency graph
requires:
  - phase: 16-licensing-core/16-01
    provides: License and Activation domain entities, licenses and licenseActivations schema, IMapper interface
  - phase: 14-shared-infrastructure
    provides: BaseRepository, IMapper, IRepository, QueryBuilder types
  - phase: 15-products
    provides: ProductRepository pattern reference
provides:
  - LicenseRepository with atomic activation increment/decrement via single SQL statements
  - ActivationRepository with paginated history and unique IP counting
  - LicenseMapper and ActivationMapper for domain-to-data conversion
  - RateLimiter with Redis sorted-set sliding window (100 req/min per IP) and in-memory fallback
  - DnsVerifier with dns.resolveTxt and 5-second Promise.race timeout
  - HttpProofFetcher with HTTPS file and meta tag proof verification
  - ValidationCache with two-level sha256 key scheme (validate:{sha256(key)}:{sha256(key+domain)}) and 600s TTL
  - SuspiciousFlagDetector with burst_ips_24h detection (5+ unique IPs in 24h)
  - Barrel export at src/modules/licensing/infrastructure/index.ts
affects: [16-03, 16-04, 16-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Atomic activation count via single UPDATE...RETURNING with composite WHERE clause (D-16)"
    - "Redis sorted-set sliding window rate limiting (ZADD/ZREMRANGEBYSCORE/ZCARD in pipeline)"
    - "Two-level sha256 cache key scheme for prefix-scan invalidation"
    - "Injected dependency pattern for SuspiciousFlagDetector (countUniqueIpsSince callback)"

key-files:
  created:
    - src/modules/licensing/infrastructure/repositories/LicenseRepository.ts
    - src/modules/licensing/infrastructure/repositories/ActivationRepository.ts
    - src/modules/licensing/infrastructure/repositories/mappers/LicenseMapper.ts
    - src/modules/licensing/infrastructure/repositories/mappers/ActivationMapper.ts
    - src/modules/licensing/infrastructure/adapters/RateLimiter.ts
    - src/modules/licensing/infrastructure/adapters/DnsVerifier.ts
    - src/modules/licensing/infrastructure/adapters/HttpProofFetcher.ts
    - src/modules/licensing/infrastructure/adapters/ValidationCache.ts
    - src/modules/licensing/infrastructure/adapters/SuspiciousFlagDetector.ts
  modified:
    - src/modules/licensing/infrastructure/index.ts

key-decisions:
  - "SuspiciousFlagDetector receives countUniqueIpsSince as callback parameter for testability and decoupling"
  - "In-memory rate limiter fallback uses simple array-based sliding window (acceptable for dev only)"

patterns-established:
  - "Repository atomic operations use raw sql template literals for PostgreSQL-specific functions (GREATEST, jsonb_agg, COALESCE, array_append)"
  - "Adapters are static classes matching domain services pattern (no DI container needed)"
  - "Rate limiter pipeline combines ZREMRANGEBYSCORE + ZADD + ZCARD + PEXPIRE for atomic sliding window"

requirements-completed: [LGEN-06, LGEN-08, ACT-03, ACT-04, ACT-05]

# Metrics
duration: 4min
completed: 2026-06-02
---

# Phase 16 Plan 02: Licensing Infrastructure Layer Summary

**LicenseRepository with atomic SQL activation ops, ActivationRepository with IP counting, plus 5 adapters (rate limiter, DNS verifier, HTTP proof fetcher, validation cache with sha256 keys, suspicious flag detector) for the licensing bounded context**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-02T17:29:17Z
- **Completed:** 2026-06-02T17:33:30Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- LicenseRepository with atomic increment/decrement using single UPDATE...RETURNING statements -- no read-then-write race conditions (D-16)
- RateLimiter implementing Redis sorted-set sliding window with 100 req/min limit and in-memory dev fallback
- ValidationCache with two-level sha256 key scheme enabling efficient invalidateAll via prefix-scan
- All 5 adapters ready for Plan 03 application layer to consume

## Task Commits

Each task was committed atomically:

1. **Task 1: Create LicenseRepository, ActivationRepository, and mappers** - `432c936` (feat)
2. **Task 2: Create infrastructure adapters and barrel export** - `17102f8` (feat)

## Files Created/Modified
- `src/modules/licensing/infrastructure/repositories/mappers/LicenseMapper.ts` - IMapper for License entity, handles JSONB activationDomains conversion
- `src/modules/licensing/infrastructure/repositories/mappers/ActivationMapper.ts` - IMapper for Activation entity, handles JSONB suspiciousFlags conversion
- `src/modules/licensing/infrastructure/repositories/LicenseRepository.ts` - findByKey, atomicIncrementIfUnderLimit, atomicDecrement, updateApiTokenHash
- `src/modules/licensing/infrastructure/repositories/ActivationRepository.ts` - findByLicense (paginated), countUniqueIpsSince (for burst detection)
- `src/modules/licensing/infrastructure/adapters/RateLimiter.ts` - Redis sorted-set sliding window with in-memory fallback
- `src/modules/licensing/infrastructure/adapters/DnsVerifier.ts` - DNS TXT record verification with 5s timeout
- `src/modules/licensing/infrastructure/adapters/HttpProofFetcher.ts` - HTTPS file and meta tag proof verification with 10s timeout
- `src/modules/licensing/infrastructure/adapters/ValidationCache.ts` - Two-level sha256 key scheme, 600s TTL, prefix-scan invalidation
- `src/modules/licensing/infrastructure/adapters/SuspiciousFlagDetector.ts` - burst_ips_24h detection with injected callback
- `src/modules/licensing/infrastructure/index.ts` - Barrel export for all repositories, mappers, and adapters

## Decisions Made
- SuspiciousFlagDetector receives countUniqueIpsSince as a callback parameter rather than importing ActivationRepository directly -- enables unit testing without DB and keeps the adapter decoupled from repository layer
- In-memory rate limiter fallback uses array-based sliding window rather than sorted-set emulation -- simpler and sufficient for single-process dev mode

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing 59 TypeScript errors in `src/app/(admin)/actions/analytics-dashboard.ts` -- out of scope, not fixed

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All infrastructure primitives ready for Plan 03 (application layer: commands, queries, service orchestration)
- LicenseRepository.atomicIncrementIfUnderLimit ready for activation service
- RateLimiter, DnsVerifier, HttpProofFetcher ready for API route handlers (Plan 04)
- ValidationCache ready for validation service with invalidateAll on status changes
- SuspiciousFlagDetector ready for integration into activation flow with ActivationRepository.countUniqueIpsSince callback

---
*Phase: 16-licensing-core*
*Completed: 2026-06-02*

## Self-Check: PASSED

All 10 files verified present. Both task commits (432c936, 17102f8) verified in git log.
