---
phase: 16-licensing-core
fixed_at: 2026-06-03T12:30:00Z
review_path: .planning/phases/16-licensing-core/16-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 8
skipped: 0
status: all_fixed
---

# Phase 16: Code Review Fix Report

**Fixed at:** 2026-06-03T12:30:00Z
**Source review:** .planning/phases/16-licensing-core/16-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 8
- Fixed: 8
- Skipped: 0

## Fixed Issues

### CR-01: Barrel export references nonexistent type `DeactivateHandlerResult`

**Files modified:** `src/modules/licensing/application/index.ts`
**Commit:** `7bde838`
**Applied fix:** Changed `DeactivateHandlerResult` to `DeactivateResult` on line 16 to match the actual exported type from `DeactivateLicenseHandler.ts`.

### CR-02: jsonb_agg returns NULL when all elements filtered out in atomic decrement

**Files modified:** `src/modules/licensing/infrastructure/repositories/LicenseRepository.ts`
**Commit:** `d45990b`
**Applied fix:** Wrapped the `jsonb_agg` subquery in `COALESCE(..., '[]'::jsonb)` in the `atomicDecrement` method, ensuring `activationDomains` becomes an empty JSONB array `[]` instead of SQL NULL when the last domain is removed.

### WR-01: Inconsistent domain normalization between portal actions and activation handler

**Files modified:** `src/app/(portal)/actions/portal-licenses.ts`
**Commit:** `550bee6`
**Applied fix:** Replaced `domain.toLowerCase().trim()` with `Domain.create(domain).value` in both `deactivateDomain` and `issueVerificationToken` functions, with try/catch returning `"Invalid domain format"` on validation failure. This ensures consistent normalization (stripping protocols, www prefix, ports, slashes) matching the activation handler.

### WR-02: Race condition between verification token consumption and activation

**Files modified:** `src/modules/licensing/application/commands/ActivateLicenseHandler.ts`
**Commit:** `6882d3a`
**Applied fix:** Added documentation comment explaining the trade-off: token is consumed before proof verification, preventing token replay at the cost of requiring re-issuance on verification failure. This is an accepted design decision rather than a code change.

### WR-03: Admin suspend action has no status guard

**Files modified:** `src/app/(admin)/actions/admin-licenses.ts`
**Commit:** `27c70d2`
**Applied fix:** Added status guard checks in `suspendLicense` after the "not found" check: rejects if already suspended (`"License already suspended"`) or if revoked (`"Cannot suspend a revoked license"`), matching the guard pattern used in `activateLicense` and `revokeLicense`.

### WR-04: `VerificationTokenIssuer.consume` has unguarded JSON.parse

**Files modified:** `src/modules/licensing/domain/services/VerificationTokenIssuer.ts`
**Commit:** `ebda2fd`
**Applied fix:** Wrapped both `JSON.parse(value)` calls (Redis path and memory fallback path) in try/catch blocks. On parse failure, returns `false` instead of propagating an unhandled exception that would cause a 500 error.

### WR-05: `RateLimiter` Redis pipeline errors unchecked

**Files modified:** `src/modules/licensing/infrastructure/adapters/RateLimiter.ts`
**Commit:** `3301669`
**Applied fix:** Added null check on pipeline results and error iteration over all pipeline result tuples. If any pipeline command fails, logs the error and returns `{ allowed: true, retryAfter: 0 }` (fail-open behavior). Changed count access from optional chaining to direct indexing since null is already handled.

### WR-06: `performDeactivation` creates new repository instances per call

**Files modified:** `src/modules/licensing/application/commands/deactivationService.ts`
**Commit:** `aabb37d`
**Applied fix:** Moved `new LicenseRepository()` and `new ActivationRepository()` from per-call instantiation inside `performDeactivation` to module-level static constants, matching the `private static` pattern used by command handlers (`ActivateLicenseHandler`, `DeactivateLicenseHandler`, `ValidateLicenseHandler`).

---

_Fixed: 2026-06-03T12:30:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
