---
phase: 32-v4-milestone
plan: 01
subsystem: api, database
tags: [hmac, sha256, semver, wordpress, update-delivery, redis-cache, drizzle-orm]

# Dependency graph
requires:
  - phase: 16-licensing-core
    provides: LicenseRepository, ApiTokenGenerator, ValidateLicenseHandler pattern, ValidationCache, RateLimiter
  - phase: 15-products-context
    provides: products/productVersions/productPlans schema, admin version management
provides:
  - update_logs table and updateLogActionEnum for update event tracking
  - pluginSlug column on products table for plugin-to-product mapping
  - DownloadTokenService for HMAC-SHA256 signed download URLs
  - SemverCompare utility for version comparison
  - UpdateCheckHandler for WordPress-compatible update checks
  - UpdateInfoHandler for WordPress plugin info popup
  - DownloadHandler for authenticated ZIP file downloads
  - LicenseStatusHandler for full license profile with Redis caching
affects: [32-02-PLAN, 32-03-PLAN, 32-04-PLAN, phase-35-wordpress-sdk, phase-38-api-security]

# Tech tracking
tech-stack:
  added: []
  patterns: [HMAC-SHA256 signed download tokens, WordPress-compatible update API, semver comparison utility, license status Redis caching with sha256 keys]

key-files:
  created:
    - src/modules/licensing/application/services/DownloadTokenService.ts
    - src/modules/licensing/application/services/SemverCompare.ts
    - src/modules/licensing/application/commands/UpdateCheckHandler.ts
    - src/modules/licensing/application/commands/UpdateInfoHandler.ts
    - src/modules/licensing/application/commands/DownloadHandler.ts
    - src/modules/licensing/application/commands/LicenseStatusHandler.ts
  modified:
    - src/lib/db/schema.ts

key-decisions:
  - "Token format: licenseId:versionId:expires:signature with HMAC-SHA256 signing via DOWNLOAD_SIGNING_SECRET env var"
  - "No FK constraints on update_logs table -- IDs stored as text references for append-only analytics"
  - "LicenseStatusHandler cache key uses sha256(licenseKey) with 10-min TTL via cacheGet/cacheSet"
  - "UpdateCheckHandler and UpdateInfoHandler return identical error responses to prevent key/version enumeration"

patterns-established:
  - "HMAC-signed download tokens: 2-hour expiry, timing-safe comparison, server secret from env var"
  - "Update handlers follow ValidateLicenseHandler pattern: parse key, normalize domain, validate token, check status/expiry, then domain-specific logic"
  - "WordPress-compatible response format: slug, new_version, package, sections, requires/tested/requires_php"

requirements-completed: [UPDT-01, UPDT-02, UPDT-03, UPDT-05]

# Metrics
duration: 5min
completed: 2026-06-09
---

# Phase 32 Plan 01: Update Delivery System - Core Summary

**Schema extensions (update_logs, pluginSlug), HMAC-SHA256 download token service, semver utility, and four command handlers for WordPress-compatible update delivery and license status retrieval**

## Performance

- **Duration:** 5 min
- **Started:** 2026-06-09T21:39:42Z
- **Completed:** 2026-06-09T21:44:29Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Schema extended with update_logs table (append-only analytics) and pluginSlug column on products
- DownloadTokenService generates and verifies HMAC-SHA256 signed tokens with 2-hour expiry
- UpdateCheckHandler validates licenses and returns WordPress-compatible update JSON
- LicenseStatusHandler returns full license profile with activations, plan features, cached in Redis

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema extensions -- update_logs table, pluginSlug on products** - `d20faa6` (feat)
2. **Task 2: Core services -- DownloadTokenService, SemverCompare, four command handlers** - `50fed39` (feat)

## Files Created/Modified
- `src/lib/db/schema.ts` - Added updateLogActionEnum, update_logs table, pluginSlug column on products
- `src/modules/licensing/application/services/DownloadTokenService.ts` - HMAC-SHA256 token generation/verification with 2hr expiry
- `src/modules/licensing/application/services/SemverCompare.ts` - Simple semver comparison without external deps
- `src/modules/licensing/application/commands/UpdateCheckHandler.ts` - WordPress-compatible update check with license validation
- `src/modules/licensing/application/commands/UpdateInfoHandler.ts` - Full plugin info for WordPress View Details popup
- `src/modules/licensing/application/commands/DownloadHandler.ts` - Token verification and file metadata for ZIP streaming
- `src/modules/licensing/application/commands/LicenseStatusHandler.ts` - Full license profile with Redis caching

## Decisions Made
- Token format uses colon-separated `licenseId:versionId:expires:signature` for deterministic parsing
- DownloadTokenService falls back to a random secret if DOWNLOAD_SIGNING_SECRET env var is not set (with warning log) so development works without configuration
- update_logs stores productId and licenseId as text without FK constraints per context spec -- append-only analytics data
- All update handlers follow the ValidateLicenseHandler pattern for consistency and security

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required for this plan.

## Next Phase Readiness
- All 6 service/handler files and schema extensions are ready for API route wiring in Plan 03
- Plan 02 can build admin UI for ZIP uploads and pluginSlug configuration using the schema changes
- DownloadTokenService requires DOWNLOAD_SIGNING_SECRET env var in production

## Self-Check: PASSED

- All 7 modified/created files verified present on disk
- SUMMARY.md present at `.planning/phases/32-v4-milestone/32-01-SUMMARY.md`
- Task 1 commit `d20faa6` verified in git log
- Task 2 commit `50fed39` verified in git log
- TypeScript compilation passes for all new files (zero errors in new code)

---
*Phase: 32-v4-milestone*
*Completed: 2026-06-09*
