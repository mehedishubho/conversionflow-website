# Phase 16: Licensing Core (Generation & Validation) - Research

**Researched:** 2026-06-02
**Domain:** License Generation / Public API / Domain Verification / DDD Bounded Context / Redis Caching & Rate Limiting
**Confidence:** HIGH

## Summary

Phase 16 builds the Licensing Bounded Context inside `src/modules/licensing/` and delivers the public `/api/v1/license/*` REST API plus customer portal and admin UI for domain activation management. It completely replaces the dependency on `license.devsroom.com` for all **new** licenses — `src/lib/central-api.ts` itself is removed in Phase 20, but Phase 16 builds the local replacement that runs in parallel.

The existing codebase already provides everything Phase 16 needs: a working `BaseRepository` with `IMapper` pattern (Phase 14), a fully featured `LicenseKey` value object that only needs a length update (16-32 → exactly 20), a `Domain` value object with all normalization including `.com.bd`, an `EventBus` with both in-process and Redis Pub/Sub modes, a Redis client with `cacheGet`/`cacheSet`/`cacheDelete` helpers and an `LICENSE:` prefix already registered, and an existing `licenses` table with `license_key UNIQUE` constraint, JSONB `activation_domains`, and `current_activations`/`max_activations` columns. Phase 15's `products` module is the structural template — Licensing follows the exact same `domain/{entities,events,services}` + `application/{commands,queries}` + `infrastructure/{repositories,mappers,adapters}` layout.

**Primary recommendation:** Build the `licensing` module following Phase 15's exact pattern. Extend `licenses` schema with one nullable column (`api_token_hash`) and add one new table (`license_activations`). Implement three thin API route handlers that delegate to application services. Use Redis `ZADD`/`ZREMRANGEBYSCORE`/`ZCARD` sorted-set sliding window for the 100 req/min rate limiter (not token bucket — see § Architecture Patterns). For atomic activation counting, use a single Drizzle `db.update(...).set({ currentActivations: sql\`${licenses.currentActivations} + 1\` }).where(and(eq(licenses.id, id), sql\`${licenses.currentActivations} < ${licenses.maxActivations}\`)).returning()` statement — **not** a transaction with read-then-write.

**Critical discovery (planner must surface to user):** The D-03 charset `ABCDEFGHJKMNPQRSTUVWXYZ23456789` is **31 characters**, not 32 as stated in CONTEXT.md. This affects the `crypto.randomBytes()` mapping: simple `byte & 31` would introduce modulo bias (256 is not a multiple of 31). The correct approach is **rejection sampling**: draw a byte, if `byte >= 248` reject and draw again, otherwise `byte % 31`. Rejection rate is 3.125%, expected ~1.03 bytes per generated char, ~20.65 bytes for a 20-char key. See § Architecture Patterns / License Key Generation for the verified implementation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Final format is `CF-XXXX-XXXX-XXXX-XXXX-XXXX` — 20-character body with `CF-` prefix, 5 segments of 4 chars separated by hyphens. Total length with separators: 24 chars. Matches existing mock pattern in `src/lib/central-api.ts` (currently `CF-${nanoid(4)}-${nanoid(4)}-${nanoid(4)}` — Phase 16 extends to 5 segments and switches to `crypto.randomBytes()`).
- **D-02:** No checksum character — pure random body. Server rejects typos with the standard uniform "invalid license" error. The UNIQUE constraint plus LGEN-09 identical-error policy already prevent information leakage.
- **D-03:** Character set: `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (32 chars — *NOTE: actually 31 chars; see Critical Discovery above*). Same set as existing `LicenseKey` value object. No new ambiguous pairs introduced.
- **D-04:** Existing `src/shared/domain/valueObjects/LicenseKey.ts` must be updated: change length validation from `16-32` to exactly `20` (the body, excluding hyphens). Format display already produces 4-char segments — extend `formatted` getter to produce 5 segments for 20-char bodies.
- **D-05:** Per-license API tokens — each license has its own token delivered alongside the license key. Plugin sends both `license_key` and `api_token` on every call. Revoking a license automatically revokes its token.
- **D-06:** Token format: opaque bearer string `cf_live_<32-char-nanoid>`. Stored as SHA-256 hash in a new `licenses.api_token_hash` column (never store plaintext). Constant-time comparison at validation.
- **D-07:** Token generation happens at license creation time (Phase 17 will trigger this via `OrderCompleted` event). For Phase 16, generate token when admin manually creates a license via the existing admin actions.
- **D-08:** Rate limiting uses Redis sliding window (100 req/min per IP). Use existing `src/lib/redis.ts` infrastructure — implement sliding window via sorted sets (`ZADD`/`ZREMRANGEBYSCORE`/`ZCARD`) or token bucket. Return HTTP 429 with `Retry-After` header on limit exceeded.
- **D-09:** Support all three verification methods: DNS TXT record, file upload, meta tag. Customer picks method at activation time. Method stored on the activation request.
- **D-10:** Verification happens at activation time — single round-trip. Plugin calls `/activate` with domain + method + token + proof-of-placement. Server fetches proof immediately and activates in one request. No two-step pending state.
- **D-11:** DNS lookup uses Node built-in `dns.resolveTxt()`. No external DoH dependency. Query domain for TXT record matching `cf-license-verify=<token>`.
- **D-12:** File verification: server fetches `https://<domain>/.well-known/conversionflow-verify.txt` and expects content `<token>`. Meta tag verification: server fetches `https://<domain>/` and looks for `<meta name="cf-license-verify" content="<token>">`.
- **D-13:** Verification token lifetime: 24 hours, single-use. Token issued at activation request start, invalidated after successful activation or after 24h expiry. Customer can re-issue expired tokens by re-attempting activation.
- **D-14:** Hybrid storage — keep `licenses.activation_domains` JSONB for fast current-state reads (used by validation API's cache). Add new `license_activations` table for full event history (every activate/deactivate with timestamp, IP, action).
- **D-15:** New `license_activations` table columns: `id` (uuid), `license_id` (fk→licenses), `domain` (text, normalized via Domain VO), `action` (enum: activate/deactivate), `ip_address` (inet), `user_agent` (text, nullable), `verification_method` (enum: dns/file/meta), `suspicious_flags` (jsonb array of triggered flag codes), `created_at` (timestamp).
- **D-16:** Atomic activation count enforcement: use PostgreSQL `UPDATE licenses SET current_activations = current_activations + 1 WHERE id = $1 AND current_activations < max_activations RETURNING *`. If 0 rows returned, activation limit reached — reject with `403 Forbidden`.
- **D-17:** Skip geo-IP lookup in Phase 16. Log IP only. Geo enrichment deferred to Phase 19.
- **D-18:** Suspicious pattern flags computed at write time (basic threshold-based): `burst_ips_24h`, `multi_country_7d` (Phase 19 activates), `vpn_tor_exit`, `plan_limit_breach`. Stored in `license_activations.suspicious_flags` as JSONB array.
- **D-19:** Cache key: `license:validate:<sha256(license_key+domain)>`. TTL: 10 minutes. Stored value: full validation response JSON.
- **D-20:** Cache invalidation via domain event subscription. Licensing service emits `LicenseRevoked`, `LicenseSuspended`, `LicenseActivated`, `LicenseDeactivated`. Handler subscribes and calls `cacheDelete('license', validateKey)`. Use existing `EventBus`.
- **D-21:** Identical error response for all validation failures (LGEN-09). HTTP 404 with body `{"valid": false, "error": "INVALID_LICENSE"}` for: not found, expired, revoked, suspended, deactivated for that domain, plan limit exceeded. HTTP 200 with `{"valid": true, ...}` only on success.
- **D-22:** All three endpoints accept `Content-Type: application/json` POST with body containing `license_key`, `domain`, `api_token`. Activate additionally requires `verification_method` (dns/file/meta) and the verification is performed server-side (customer doesn't send the proof content — server fetches it).
- **D-23:** Response format (API-05): `{"valid": boolean, "license_id": string|null, "plan": string|null, "expires_at": string|null, "max_activations": number|null, "current_activations": number|null, "error": string|null}`. Always include all fields; null when invalid.
- **D-24:** `src/modules/licensing/domain/` — entities (License, Activation), value objects (reuse shared LicenseKey/Domain), domain events (LicenseCreated, LicenseRevoked, LicenseActivated, etc.), domain services (LicenseKeyGenerator, ActivationValidator).
- **D-25:** `src/modules/licensing/application/` — CQRS commands (GenerateLicense, ValidateLicense, ActivateLicense, DeactivateLicense) and queries (GetLicense, GetActivationHistory). Service layer pattern from ARCH-02.
- **D-26:** `src/modules/licensing/infrastructure/` — LicenseRepository, ActivationRepository (both extend BaseRepository from Phase 14), mappers, external service adapters (RateLimiter, DnsVerifier, HttpProofFetcher).
- **D-27:** API route handlers in `src/app/api/v1/license/[validate|activate|deactivate]/route.ts` — thin layer that calls application services. Auth check, rate limit check, request validation, service call, response formatting. No business logic in routes.
- **D-28:** Domain management lives on existing `/dashboard/licenses/[id]/` page as a new "Active Domains" section (inline, not a separate tab). Shows current domains from `licenses.activation_domains` JSONB, deactivate button per domain.
- **D-29:** Deactivation from portal is instant (no admin approval). Updates JSONB atomically, logs to `license_activations`, emits `LicenseDeactivated` event for cache invalidation.
- **D-30:** New admin page `/admin/licenses/[id]/activations/` showing chronological `license_activations` rows for that license with: timestamp, domain, action, IP, verification method, suspicious flags (color-coded badges).

### Claude's Discretion
- Exact database column types for `license_activations` table (researcher picks based on Drizzle best practices) — **DECIDED: see § Architecture Patterns / Schema**
- Detailed implementation of sliding window rate limiter (sorted set vs token bucket) — **DECIDED: sorted set (ZADD/ZREMRANGEBYSCORE/ZCARD); see § Architecture Patterns / Rate Limiting**
- HTTP client choice for file/meta proof fetching (native fetch vs axios — native preferred since Node 18+) — **DECIDED: native fetch**
- VPN/Tor exit node list source (researcher picks a maintained open dataset) — **DECIDED: deferred — Phase 16 ships with empty list and a clean adapter interface; see § Don't Hand-Roll**
- Specific colors/styling for suspicious flag badges — **DECIDED: use existing `orange`/`red` design tokens from globals.css**
- Internal structure of application layer services (single service vs separate command handlers) — **DECIDED: separate command handlers (one class per command); matches Phase 15 pattern**
- Error code naming beyond `INVALID_LICENSE` (e.g., `RATE_LIMITED`, `VERIFICATION_FAILED`) — **DECIDED: see § Architecture Patterns / Error Codes**

### Deferred Ideas (OUT OF SCOPE)
- Geo-IP enrichment of activation logs — Phase 19
- Real-time admin alerts on suspicious patterns — Phase 19
- Cryptographic offline validation (DEFER-01) — post-MVP
- Hardware fingerprinting (DEFER-02) — post-MVP
- API versioning beyond `/v1/` — when v2 is needed
- OpenAPI/Swagger docs generation — out of scope
- Per-product API tokens — future optimization
- DNS-over-HTTPS fallback for verification — D-11 uses Node `dns` only
- Removing `src/lib/central-api.ts` and central fields — Phase 20
- Refactoring checkout to trigger license generation via `OrderCompleted` domain event — Phase 17
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LGEN-01 | System generates unique license keys using Node.js `crypto.randomBytes()` | `LicenseKeyGenerator` domain service using rejection sampling against charset (§ Architecture Patterns) — exact 20-char body per D-01/D-04 |
| LGEN-02 | License keys are case-insensitive with no ambiguous characters | Charset `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (excludes 0,O,1,I,L) enforced in `LicenseKey` VO (already exists, validates via regex `/[01OIL]/`) |
| LGEN-03 | License keys have UNIQUE database constraint | Existing `licenses.license_key` column already has `unique("licenses_license_key_unique")` constraint at schema.ts line 212 [VERIFIED] |
| LGEN-04 | License generation happens locally (no external API calls) | `LicenseKeyGenerator` uses `crypto.randomBytes()` only; `central-api.ts` import removed from any new license-creation code path |
| LGEN-05 | Public API endpoint `/api/v1/license/validate` validates license keys and returns status, expiry, plan details | `src/app/api/v1/license/validate/route.ts` POST handler calling `ValidateLicenseHandler` |
| LGEN-06 | Validation API uses Redis caching with 5-15 minute TTL | TTL=600s (10 min midpoint) via `cacheSet('license', sha256(key+domain), json, 600)` |
| LGEN-07 | Validation API cache invalidates immediately on license status changes | EventBus subscription on `LicenseRevoked`/`LicenseSuspended`/`LicenseActivated`/`LicenseDeactivated` → `cacheDelete('license', key)` |
| LGEN-08 | Public API has rate limiting (100 requests/minute per IP) | Redis sorted-set sliding window in `RateLimiter` adapter (§ Rate Limiting) |
| LGEN-09 | Validation API returns identical error for all failures | Single `buildInvalidResponse()` function in route handler, returns HTTP 404 with `{"valid":false,"error":"INVALID_LICENSE",...}` for all error paths |
| ACT-01 | System tracks domain activations per license with timestamps, IP addresses, and geo-location | `license_activations` table with `created_at`, `ip_address` (inet), `user_agent`; geo-location deferred to Phase 19 per D-17 |
| ACT-02 | Domain normalization strips protocol (https://), www prefix, and trailing slashes | Existing `Domain` VO at `src/shared/domain/valueObjects/Domain.ts` handles all normalization including multi-part TLDs (.com.bd, .co.uk) — reuse directly |
| ACT-03 | Activation limit enforcement uses atomic database operations to prevent race conditions | Single SQL `UPDATE ... SET current_activations = current_activations + 1 WHERE id = $1 AND current_activations < max_activations RETURNING *` via Drizzle `sql` template — see § Code Examples |
| ACT-04 | System enforces max activations per plan (rejects activation if limit reached) | Same atomic query — if 0 rows returned by RETURNING, respond HTTP 403 with `INVALID_LICENSE` uniform error |
| ACT-05 | Domain activation requires verification (DNS TXT record, file upload, or meta tag) | `DnsVerifier` (dns.resolveTxt), `HttpProofFetcher` (native fetch), all return boolean; token format `cf-license-verify=<token>` |
| ACT-06 | Public API endpoints `/api/v1/license/activate` and `/api/v1/license/deactivate` for plugin integration | `src/app/api/v1/license/{activate,deactivate}/route.ts` POST handlers |
| ACT-07 | Customers can view and manage their active domains in customer portal | Extend existing `/dashboard/licenses/[id]/page.tsx` with "Active Domains" section + deactivate button per domain (D-28) |
| ACT-08 | Admin can view activation history and detect suspicious patterns | New admin page `/admin/licenses/[id]/activations/` with chronological table + suspicious_flags color-coded badges (D-30) |
| API-01 | `/api/v1/license/validate` endpoint accepts license_key and domain, returns validation result | Route handler validates JSON body shape, calls `ValidateLicenseHandler`, returns standardized response (D-23) |
| API-02 | `/api/v1/license/activate` endpoint binds license to domain after verification | Route handler → `ActivateLicenseHandler` (auth → rate limit → verify proof → atomic increment → JSONB update → log row → emit event) |
| API-03 | `/api/v1/license/deactivate` endpoint removes domain from license | Route handler → `DeactivateLicenseHandler` (auth → rate limit → JSONB remove → atomic decrement → log row → emit event) |
| API-04 | API uses API token authentication for external requests | Constant-time SHA-256 hash comparison via `crypto.timingSafeEqual` after length check; token format `cf_live_<32-char-nanoid>` |
| API-05 | API responses follow consistent JSON format with error handling | All three endpoints return `{"valid": bool, "license_id": ..., "plan": ..., "expires_at": ..., "max_activations": ..., "current_activations": ..., "error": ...}` (D-23) |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Package Manager**: pnpm only (never npm, yarn, or bun)
- **Framework**: Next.js 16.2.6 with App Router, TypeScript strict mode, TailwindCSS v4, ESLint
- **Proxy**: Use `proxy.ts` instead of `middleware.ts` — existing `src/proxy.ts` skips `/api/*` paths already, so no proxy changes needed for new API routes
- **Components**: Server components by default; client components only when needed (form actions, useState)
- **Styling**: TailwindCSS v4 CSS-first config in `globals.css` — no `tailwind.config.js`
- **Imports**: Use `@/` alias for internal modules, never relative paths across directories
- **Naming**: PascalCase `.tsx` components, camelCase utilities, named exports for reusable, default exports for pages
- **DDD Architecture**: Bounded contexts in `src/modules/`, shared infrastructure in `src/shared/`
- **ORM**: Drizzle ORM 0.45.2 with PostgreSQL, schema in `src/lib/db/schema.ts`
- **GSD Workflow**: No direct edits outside GSD workflow

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | 0.45.2 | Database ORM for licenses + license_activations tables, atomic UPDATE…RETURNING | Already installed, all tables use pgTable/pgEnum/jsonb [VERIFIED: package.json] |
| drizzle-kit | 0.31.10 | Migration generation for new `api_token_hash` column + `license_activations` table | Already installed [VERIFIED: package.json] |
| nanoid | 5.1.11 | API token suffix (`cf_live_<32-char-nanoid>`) + event IDs | Already installed [VERIFIED: package.json] |
| ioredis | 5.10.1 | Rate limiter (sorted set) + cache (existing helpers) + EventBus backing | Already installed, client at `src/lib/redis.ts` [VERIFIED: package.json] |
| next | 16.2.6 | App Router route handlers for `/api/v1/license/*` | Already installed [VERIFIED: package.json] |
| react | 19.2.4 | Admin/portal UI | Already installed [VERIFIED: package.json] |
| lucide-react | 1.14.0 | UI icons (alert/warning badges, action buttons) | Already installed [VERIFIED: package.json] |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | 2.1.1 | Conditional classNames for badge color logic | Suspicious flag badge styling |
| tailwind-merge | 3.6.0 | Tailwind class dedup | Via `cn()` utility |
| date-fns | 4.1.0 | Date formatting in admin activation history table | `format(timestamp, 'MMM d, yyyy HH:mm')` |

### Native Node APIs (no install needed)
| API | Purpose | Verified |
|-----|---------|----------|
| `crypto.randomBytes(size)` | License key generation + verification token generation | [VERIFIED: Node 20 LTS] |
| `crypto.createHash('sha256')` | API token hashing before storage | [VERIFIED: runtime test] |
| `crypto.timingSafeEqual(a, b)` | Constant-time API token comparison | [VERIFIED: runtime test — throws on length mismatch, must check length first] |
| `dns.resolveTxt(domain, callback)` | DNS TXT record verification | [VERIFIED: `typeof dns.resolveTxt === 'function'`] |
| `fetch(url, { signal, redirect })` | File/meta-tag HTTP proof fetching | Native in Node 18+ [VERIFIED] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Redis sorted set rate limiter | Token bucket (INCR + EXPIRE) | Sorted set gives true sliding window (no boundary bursts); token bucket is simpler but allows 2x burst at window edge. D-08 requires sliding window semantics for the 100 req/min cap to be meaningful. |
| Native fetch for proof fetching | axios / undici | Native fetch is built-in, supports AbortSignal for timeouts, follows redirects by default. No new dependency. |
| Storing IP as `text` | Storing IP as PostgreSQL `inet` | `inet` gives free validation + IPv4/IPv6 normalization + subnet query operators. D-15 specifies inet. ~Zero cost to use. |
| JSONB `activation_domains` only | `license_activations` table only | Hybrid wins: JSONB gives O(1) current-state read for cache; table gives audit history. Both updated atomically in single transaction. |
| Per-license API token (D-05) | Per-product or per-customer token | Per-license is most-revoked-granular; matches D-05 decision. |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── modules/licensing/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── License.ts                    # Aggregate root (wraps existing licenses row)
│   │   │   └── Activation.ts                 # Entity for license_activations row
│   │   ├── events/
│   │   │   └── LicenseEvents.ts              # LicenseCreated/Revoked/Suspended/Activated/Deactivated (follow ProductEvents.ts pattern)
│   │   ├── services/
│   │   │   ├── LicenseKeyGenerator.ts        # crypto.randomBytes + rejection sampling → LicenseKey VO
│   │   │   ├── ApiTokenGenerator.ts          # cf_live_<nanoid(32)> + SHA-256 hash
│   │   │   ├── ActivationValidator.ts        # Atomic increment + suspicious flag detection
│   │   │   └── VerificationTokenIssuer.ts    # 32-char token, 24h TTL, single-use
│   │   └── index.ts                          # Barrel export
│   ├── application/
│   │   ├── commands/
│   │   │   ├── GenerateLicenseHandler.ts     # Used by Phase 17 checkout; Phase 16 wires admin action
│   │   │   ├── ValidateLicenseHandler.ts     # Reads cache, falls back to DB
│   │   │   ├── ActivateLicenseHandler.ts     # Verify proof → atomic increment → log row → emit event
│   │   │   ├── DeactivateLicenseHandler.ts   # Atomic decrement → log row → emit event
│   │   │   └── RevokeLicenseHandler.ts       # Admin-only; emits LicenseRevoked for cache invalidation
│   │   ├── queries/
│   │   │   ├── GetLicenseHandler.ts
│   │   │   ├── GetActivationHistoryHandler.ts   # Admin portal query with pagination
│   │   │   └── GetActiveDomainsHandler.ts       # Customer portal query
│   │   └── index.ts
│   └── infrastructure/
│       ├── repositories/
│       │   ├── LicenseRepository.ts          # Extends BaseRepository; adds findByKey, atomicIncrement, atomicDecrement, updateActivationDomains
│       │   ├── ActivationRepository.ts       # Extends BaseRepository; adds findByLicense, countByLicenseSince
│       │   └── mappers/
│       │       ├── LicenseMapper.ts          # Maps between License entity and licenses row (Domain VO + LicenseKey VO)
│       │       └── ActivationMapper.ts       # Maps Activation entity and license_activations row
│       ├── adapters/
│       │   ├── RateLimiter.ts                # Redis sorted-set sliding window (ZADD/ZREMRANGEBYSCORE/ZCARD)
│       │   ├── DnsVerifier.ts                # dns.resolveTxt wrapper with timeout
│       │   ├── HttpProofFetcher.ts           # fetch() wrapper for .well-known file + meta tag
│       │   ├── ValidationCache.ts            # Wraps cacheGet/cacheSet/cacheDelete with sha256 key
│       │   ├── VerificationTokenStore.ts     # Redis SET with 24h TTL + single-use atomic delete
│       │   └── SuspiciousFlagDetector.ts     # Threshold queries + VPN/Tor list (empty in Phase 16)
│       └── index.ts
├── app/
│   ├── api/v1/license/
│   │   ├── validate/route.ts                 # POST handler
│   │   ├── activate/route.ts                 # POST handler
│   │   └── deactivate/route.ts               # POST handler
│   ├── (portal)/dashboard/licenses/[id]/
│   │   └── page.tsx                          # Extend with "Active Domains" section + deactivate button
│   └── (admin)/admin/licenses/
│       ├── page.tsx                          # (Optional, link from existing admin licenses list if present)
│       └── [id]/activations/page.tsx         # New: chronological history table with suspicious flag badges
└── (existing shared infrastructure used as-is)
```

### Pattern 1: License Key Generation (Rejection Sampling)
**What:** Generate a 20-character license key body from the 31-character D-03 charset using `crypto.randomBytes()` with rejection sampling for uniform distribution.
**When to use:** Every license creation (admin manual in Phase 16; checkout event handler in Phase 17).

```typescript
// Source: crypto.randomBytes + rejection sampling math [VERIFIED: runtime test]

import crypto from "crypto";
import { LicenseKey } from "@/shared/domain/valueObjects/LicenseKey";

const CHARSET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // 31 chars (verified)
const CHARSET_LENGTH = 31;
const KEY_LENGTH = 20;
// Rejection threshold: 31 * floor(256/31) = 31 * 8 = 248
const REJECTION_THRESHOLD = Math.floor(256 / CHARSET_LENGTH) * CHARSET_LENGTH;

export class LicenseKeyGenerator {
  /**
   * Generate a cryptographically random license key body.
   * Returns raw 20-char string (no separators); use LicenseKey.create().formatted for display.
   *
   * Math: charset length 31 doesn't divide 256 evenly (256 = 8*31 + 8).
   * Naive `byte % 31` would bias the first 8 characters of the charset
   * (values 0-7 appear 9/256 of the time vs 8-30 at 8/256).
   * Rejection sampling: discard bytes >= 248 (3.125% rejection rate, ~1.03 bytes per char).
   */
  static generate(): LicenseKey {
    const body = Buffer.alloc(KEY_LENGTH);
    let written = 0;
    while (written < KEY_LENGTH) {
      const bytes = crypto.randomBytes(KEY_LENGTH * 2); // over-fetch to cover rejections
      for (let i = 0; i < bytes.length && written < KEY_LENGTH; i++) {
        const byte = bytes[i];
        if (byte < REJECTION_THRESHOLD) {
          body[written] = CHARSET.charCodeAt(byte % CHARSET_LENGTH);
          written++;
        }
      }
    }
    return LicenseKey.create(body.toString("ascii"));
  }

  /** Formatted display: CF-XXXX-XXXX-XXXX-XXXX-XXXX */
  static generateFormatted(): string {
    return `CF-${this.generate().formatted}`;
  }
}
```

### Pattern 2: Atomic Activation Count (Single SQL Statement)
**What:** Use a single UPDATE…RETURNING statement that increments `current_activations` only if the result won't exceed `max_activations`. Eliminates race conditions inherent in read-then-write transactions.
**When to use:** Every `activate` call.

```typescript
// Source: Drizzle SQL template literal + PostgreSQL atomic UPDATE pattern [VERIFIED: drizzle-orm docs]

import { db } from "@/lib/db";
import { licenses } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";

export class LicenseRepository /* extends BaseRepository<License, ...> */ {
  /**
   * Atomically increment current_activations if under the limit.
   * Returns the updated row on success, null if limit reached.
   *
   * Equivalent SQL:
   *   UPDATE licenses
   *   SET current_activations = current_activations + 1,
   *       updated_at = NOW()
   *   WHERE id = $1 AND current_activations < max_activations
   *   RETURNING *;
   */
  async atomicIncrementIfUnderLimit(licenseId: string): Promise<typeof licenses.$inferSelect | null> {
    const result = await db
      .update(licenses)
      .set({
        currentActivations: sql`${licenses.currentActivations} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(licenses.id, licenseId),
          sql`${licenses.currentActivations} < ${licenses.maxActivations}`
        )
      )
      .returning();

    return result[0] ?? null;
  }

  /** Inverse for deactivate (no upper-bound check needed). */
  async atomicDecrement(licenseId: string): Promise<typeof licenses.$inferSelect | null> {
    const result = await db
      .update(licenses)
      .set({
        currentActivations: sql`GREATEST(${licenses.currentActivations} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(licenses.id, licenseId))
      .returning();

    return result[0] ?? null;
  }
}
```

### Pattern 3: Hybrid Storage — JSONB + History Table
**What:** Update both `licenses.activation_domains` (JSONB array) AND insert a row into `license_activations` (history) in a single Drizzle transaction.
**When to use:** Every activate/deactivate operation.

```typescript
// Source: Drizzle db.transaction() pattern + existing JSONB pattern [VERIFIED: BaseRepository.transaction()]

await db.transaction(async (tx) => {
  // 1. Atomic count check + increment
  const updated = await tx
    .update(licenses)
    .set({
      currentActivations: sql`${licenses.currentActivations} + 1`,
      activationDomains: sql`array_append(${licenses.activationDomains}, ${domain.value})`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(licenses.id, licenseId),
        sql`${licenses.currentActivations} < ${licenses.maxActivations}`,
        sql`NOT ${licenses.activationDomains} @> to_jsonb(${domain.value}::text)` // prevent duplicates
      )
    )
    .returning();

  if (updated.length === 0) {
    throw new Error("ACTIVATION_LIMIT_REACHED"); // or "ALREADY_ACTIVATED" — caller decides
  }

  // 2. Log to history table
  await tx.insert(licenseActivations).values({
    licenseId,
    domain: domain.value,
    action: "activate",
    ipAddress: clientIp,
    userAgent: userAgent ?? null,
    verificationMethod: method, // "dns" | "file" | "meta"
    suspiciousFlags: detectedFlags, // JSONB array of strings
  });
});
```

### Pattern 4: Redis Sliding Window Rate Limiter (Sorted Set)
**What:** Enforce N requests per sliding window (100/min) using Redis sorted sets. Each request adds a member with score=timestamp; old entries pruned; count = ZCARD.
**When to use:** Every `/api/v1/license/*` request before any business logic.

**Why sorted set over token bucket:**
- Token bucket (`INCR counter` + `EXPIRE 60`) allows 2x burst at window boundary (100 at 0:59 + 100 at 1:00 = 200 in 1 second).
- Sliding window gives true "no more than 100 in any 60-second window" semantics.
- Cost: 3 Redis commands per request (ZADD, ZREMRANGEBYSCORE, ZCARD) — sub-millisecond on localhost.

```typescript
// Source: Standard Redis sliding window pattern [CITED: redis.io/commands/zcard]

import { redis } from "@/lib/redis";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 100;
const RATE_LIMIT_KEY_PREFIX = "ratelimit:v1:";

export class RateLimiter {
  /**
   * Check rate limit for an IP. Returns allowed=true if under limit.
   * On limit exceeded, returns allowed=false with retryAfter seconds.
   */
  static async check(ip: string): Promise<{ allowed: boolean; retryAfter: number }> {
    if (!redis) {
      // Memory fallback — in-memory Map (only for dev without Redis)
      return InMemoryRateLimiter.check(ip);
    }

    const key = `${RATE_LIMIT_KEY_PREFIX}${ip}`;
    const now = Date.now();
    const windowStart = now - WINDOW_SECONDS * 1000;

    // Use Redis MULTI for atomicity — prevents race between ZADD and ZCARD
    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart); // prune old entries
    pipeline.zadd(key, now, `${now}-${Math.random()}`); // add current request (unique member)
    pipeline.zcard(key); // count entries in window
    pipeline.expire(key, WINDOW_SECONDS + 10); // TTL for cleanup

    const results = await pipeline.exec();
    const count = results?.[2]?.[1] as number;

    if (count > MAX_REQUESTS) {
      // Retry-After: seconds until oldest entry in window expires
      const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
      const oldestScore = oldest[1] ? parseInt(oldest[1], 10) : now;
      const retryAfter = Math.ceil((oldestScore + WINDOW_SECONDS * 1000 - now) / 1000);
      return { allowed: false, retryAfter: Math.max(retryAfter, 1) };
    }

    return { allowed: true, retryAfter: 0 };
  }
}
```

### Pattern 5: API Token Validation (Constant-Time)
**What:** Validate `cf_live_<32-char-nanoid>` token against stored SHA-256 hash without leaking timing info.
**When to use:** Every public API request.

```typescript
// Source: crypto.timingSafeEqual docs [CITED: nodejs.org/api/crypto.html#cryptotimingsafeequala-b]

import crypto from "crypto";

export class ApiTokenValidator {
  /**
   * Validate a plaintext API token against a stored SHA-256 hash.
   * Uses constant-time comparison to prevent timing attacks.
   *
   * IMPORTANT: crypto.timingSafeEqual throws if buffers have different lengths.
   * We must check length first (ALSO in constant time using Buffer.length comparison).
   */
  static validate(plaintext: string, storedHash: string): boolean {
    if (!plaintext || !storedHash) return false;

    const plaintextHash = crypto
      .createHash("sha256")
      .update(plaintext)
      .digest("hex");

    const a = Buffer.from(plaintextHash, "hex");
    const b = Buffer.from(storedHash, "hex");

    // Length check (constant-time-ish — both SHA-256 hashes are 32 bytes / 64 hex chars)
    if (a.length !== b.length) return false;

    return crypto.timingSafeEqual(a, b);
  }

  static generate(): { plaintext: string; hash: string } {
    // nanoid(32) produces URL-safe 32-char string
    const { nanoid } = require("nanoid");
    const token = `cf_live_${nanoid(32)}`;
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    return { plaintext: token, hash };
  }
}
```

### Pattern 6: DNS TXT Verification (with timeout)
**What:** Look up a TXT record on a domain and check for the verification token.
**When to use:** Activation with `verification_method: "dns"`.

```typescript
// Source: Node.js dns module docs [CITED: nodejs.org/api/dns.html#dnsresolvetxthostname-callback]

import { promises as dnsPromises } from "dns";
import { AbortController } from "node-abort-controller"; // or global AbortController in Node 18+

const DNS_TIMEOUT_MS = 5000;

export class DnsVerifier {
  static async verify(domain: string, expectedToken: string): Promise<boolean> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DNS_TIMEOUT_MS);

    try {
      // dnsPromises.resolveTxt returns string[][] (TXT records can have multiple strings)
      const records = await dnsPromises.resolveTxt(domain);
      const expected = `cf-license-verify=${expectedToken}`;

      for (const record of records) {
        const joined = record.join(""); // TXT record chunks joined
        if (joined === expected) return true;
      }
      return false;
    } catch (err) {
      // ENOTFOUND, ENODATA, ETIMEDOUT — all fail verification (no info leakage)
      console.warn(`[DnsVerifier] TXT lookup failed for ${domain}:`, (err as Error).message);
      return false;
    } finally {
      clearTimeout(timer);
    }
  }
}
```

**Note on `AbortController`:** dnsPromises doesn't directly accept AbortSignal in all Node versions. A more reliable approach is to wrap in `Promise.race` with a timeout. The actual implementation should use this pattern:

```typescript
static async verify(domain: string, expectedToken: string): Promise<boolean> {
  return Promise.race([
    dnsPromises.resolveTxt(domain).then(/* match logic */).catch(() => false),
    new Promise<false>((resolve) => setTimeout(() => resolve(false), DNS_TIMEOUT_MS)),
  ]);
}
```

### Pattern 7: Identical Error Response (LGEN-09)
**What:** Single helper that produces the uniform error response for all failure paths.
**When to use:** Every code path in the validate handler that returns a non-success response.

```typescript
// Identical response shape, identical HTTP status (404), identical error code.
// Eliminates timing-based enumeration of valid keys, expired vs revoked, domain-bound vs not.

export function buildInvalidLicenseResponse(): NextResponse {
  return NextResponse.json(
    {
      valid: false,
      license_id: null,
      plan: null,
      expires_at: null,
      max_activations: null,
      current_activations: null,
      error: "INVALID_LICENSE",
    },
    { status: 404 }
  );
}

// ALSO IMPORTANT: To prevent timing-based key enumeration,
// the validate handler should always do ~the same amount of work.
// Run a dummy SHA-256 hash + DB connection check before returning the error
// so response time doesn't reveal whether the key was even found in the DB.
// (For Phase 16, this is acceptable as a documented limitation — Phase 19 can add constant-time error path.)
```

### Pattern 8: Cache Invalidation via Domain Event
**What:** Service publishes domain event on activation/deactivation/revocation; subscriber deletes cached validation response.
**When to use:** Any state change that would invalidate a previously-cached validation.

```typescript
// Source: Existing EventBus pattern from Phase 14 [VERIFIED: src/shared/infrastructure/eventBus/EventBus.ts]

import { inProcessEventBus, inProcessPublisher } from "@/shared/infrastructure/eventBus";

// On activation:
await inProcessPublisher.publish({
  id: nanoid(),
  type: "license.activated",
  aggregateId: licenseId,
  payload: { licenseId, domain, currentActivations },
  timestamp: new Date(),
  metadata: { source: "licensing-context", version: 1 },
});

// Subscriber (registered once at app startup — likely in licensing/infrastructure/index.ts):
inProcessEventBus.subscribe("license.activated", async (event) => {
  const { licenseId, domain } = event.payload as { licenseId: string; domain: string };
  // Cache key is sha256(license_key + domain), but subscriber has license_id — needs to derive.
  // SOLUTION: Subscriber queries license_key from licenseId, then deletes cache entry.
  // Alternative: publish license_key in payload (acceptable since it's internal event bus).
  const cacheKey = sha256(`${licenseKey}${domain}`);
  await cacheDelete("license", `validate:${cacheKey}`);
});

// Same pattern for LicenseRevoked, LicenseSuspended, LicenseDeactivated
```

### Pattern 9: Verification Token Store (Redis)
**What:** Single-use 24h verification tokens stored in Redis.
**When to use:** Customer initiates activation — frontend requests a token; plugin/customer places it in DNS/file/meta; activate API consumes it.

```typescript
// Token format: 32 hex chars from crypto.randomBytes(16).toString('hex')
// Storage: Redis SET with TTL=86400 (24h), then atomic GETDEL on consume

import { kvSet, kvGet, kvDelete } from "@/lib/redis";
import crypto from "crypto";

const VERIFICATION_TOKEN_PREFIX = "verify:";
const VERIFICATION_TTL_SECONDS = 86400; // 24 hours (D-13)

export class VerificationTokenIssuer {
  static async issue(licenseId: string, domain: string): Promise<string> {
    const token = crypto.randomBytes(16).toString("hex");
    const key = `${VERIFICATION_TOKEN_PREFIX}${token}`;
    await kvSet(key, JSON.stringify({ licenseId, domain }), VERIFICATION_TTL_SECONDS);
    return token;
  }

  /** Atomic consume (single-use per D-13). Returns null if expired/missing/mismatched. */
  static async consume(
    token: string,
    expectedLicenseId: string,
    expectedDomain: string
  ): Promise<boolean> {
    // GETDEL is atomic — only one concurrent consumer wins
    if (!redis) {
      // Memory fallback
      const value = await kvGet(`${VERIFICATION_TOKEN_PREFIX}${token}`);
      if (!value) return false;
      await kvDelete(`${VERIFICATION_TOKEN_PREFIX}${token}`);
      const parsed = JSON.parse(value);
      return parsed.licenseId === expectedLicenseId && parsed.domain === expectedDomain;
    }
    const value = await redis.getdel(`${VERIFICATION_TOKEN_PREFIX}${token}`);
    if (!value) return false;
    const parsed = JSON.parse(value);
    return parsed.licenseId === expectedLicenseId && parsed.domain === expectedDomain;
  }
}
```

**Workflow:**
1. Customer visits `/dashboard/licenses/[id]`, clicks "Add Domain", enters domain → portal action calls `issueVerificationToken(licenseId, domain)` → returns token to UI.
2. Customer places token in DNS TXT `cf-license-verify=<token>`, OR uploads `.well-known/conversionflow-verify.txt`, OR plugin injects `<meta name="cf-license-verify" content="<token>">`.
3. Customer clicks "Activate" → plugin calls `/api/v1/license/activate` with `{license_key, api_token, domain, verification_method}`.
4. Server reads token from proof (DNS/file/meta), calls `consume(token, licenseId, domain)`. If single-use atomic GETDEL succeeds, proceeds with activation.
5. Same token cannot be reused; re-activation requires re-issuing a new token.

### Anti-Patterns to Avoid

- **Read-then-write for activation count:** `SELECT current_activations ... if (count < max) UPDATE` causes race condition where two concurrent requests both read 2 (under limit of 3), both increment to 3, but the actual max should have been hit. **Always** use single atomic UPDATE with WHERE clause.

- **Storing API tokens plaintext:** Even though they're "just" bearer tokens, hashing prevents catastrophic DB-leak → instant token abuse. Always SHA-256.

- **`byte % charset.length` for non-power-of-2 charset sizes:** Modulo bias. The D-03 charset is 31 chars — naive modulo gives ~3% bias toward first 8 characters. Always rejection-sample.

- **Different error responses for "not found" vs "expired" vs "revoked":** Enables enumeration attacks. LGEN-09 mandates identical response.

- **Trust client-supplied proof content:** Server MUST fetch the DNS/HTTP proof itself. Sending `{proof_content: "..."}` lets the customer copy a token from one domain to another without controlling the target.

- **Use `Math.random()` for license keys or verification tokens:** Always `crypto.randomBytes()`.

- **Implement constant-time comparison manually:** Always `crypto.timingSafeEqual`. Hand-rolled `===` is timing-leaky.

- **Forget to delete cache entry on activation:** Plugin checks license, gets cached "valid" response, then customer deactivates a domain — plugin continues approving requests until cache TTL expires. Use domain event invalidation.

- **Make public API routes go through `proxy.ts` auth check:** `proxy.ts` already excludes `/api/*` from auth checks. Don't accidentally add API routes to `PORTAL_PREFIXES` or `AUTH_PAGES`. The new `/api/v1/license/*` routes use their own API token auth, not Better Auth sessions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Random license key | `Math.random().toString(36)` | `crypto.randomBytes()` + rejection sampling | `Math.random()` is predictable, not crypto-secure. License keys become guessable. |
| Rate limiting | In-memory Map of timestamps per IP | Redis sorted set (`ZADD`/`ZREMRANGEBYSCORE`/`ZCARD`) | In-memory doesn't work across multiple Node.js instances (PM2 cluster, K8s pods). Redis is the existing cache — reuse it. |
| Constant-time comparison | `for (i...) a[i] === b[i]` | `crypto.timingSafeEqual` | Hand-rolled comparisons optimize away to early-exit; standard library is audited. |
| Atomic counter increment | `SELECT ... UPDATE` in transaction | Single `UPDATE ... WHERE count < max RETURNING *` | Read-then-write races even inside a transaction unless you use explicit row locks. Single statement is faster AND safer. |
| DNS resolution | `doh.google/dns-query` HTTPS requests | `dns.resolveTxt` (Node built-in) | No external dependency, no rate limits, OS-resolver-cached, sub-millisecond typical latency. |
| Domain normalization | Custom regex stack | Existing `Domain` value object | Already handles `.com.bd`, multi-part TLDs, www strip, protocol strip, trailing slash strip, lowercase, RFC 1123 validation. Don't reinvent. |
| Event publish/subscribe | Custom EventEmitter | Existing `EventBus` from `src/shared/infrastructure/eventBus/` | Already has both in-process (EventEmitterBus) and cross-process (RedisPubSubBus) implementations + factory functions. |
| Database transactions | Manual BEGIN/COMMIT | `db.transaction(async (tx) => ...)` | Drizzle's native transaction API handles rollback on throw. |
| Cache helpers | Direct `redis.set`/`redis.get` | `cacheGet('license', key)` / `cacheSet('license', key, val, ttl)` / `cacheDelete('license', key)` from `src/lib/redis.ts` | Already handles prefix, TTL, memory fallback. |
| Audit logging | Direct `db.insert(auditLogs)` | `createAuditLog({ actorId, actorRole, action, targetType, targetId, details })` from `src/lib/audit.ts` | Already used everywhere in admin actions. |
| VPN/Tor exit node list | Scrape free blog posts | Defer — Phase 16 ships `SuspiciousFlagDetector` with `vpn_tor_exit` flag always returning `false`; Phase 19 wires a real list (e.g., EmergingThreats, Spamhaus DROP) | List curation is itself a project; shipping a stale list is worse than no list. |

**Key insight:** The entire technical infrastructure for Phase 16 was built in Phases 14 and 15. Phase 16 should NOT introduce any new patterns for: caching, rate limiting (modulo the adapter wrapper), event bus, repository mapping, audit logging, or domain value objects. The work is **wiring existing primitives to specific business logic**, not inventing infrastructure.

## Common Pitfalls

### Pitfall 1: Modulo Bias in License Key Generation
**What goes wrong:** Naive `charset[byte % 31]` gives ~3.125% bias toward first 8 chars of charset (A,B,C,D,E,F,G,H). Over thousands of keys, attacker can prune search space.
**Why it happens:** 256 (byte range) is not divisible by 31 (charset length). Values 0-7 reach from `byte=0,31,62,93,124,155,186,217,248` (9 hits); values 8-30 reach from only 8 hits.
**How to avoid:** Rejection sampling — discard bytes ≥ 248 (~3.125% rejection rate, ~1.03 bytes per char). See Pattern 1.
**Warning signs:** Statistical analysis of generated keys shows skewed char distribution. Add a unit test that generates 100,000 keys and asserts each charset char appears within ±5% of expected 1/31 frequency.

### Pitfall 2: LicenseKey VO Backwards Compatibility
**What goes wrong:** Changing length from "16-32" to "exactly 20" breaks any code that creates LicenseKey from existing v2.x data (12-char `central-api.ts` mock keys, 16-32 char real keys from central API).
**Why it happens:** The existing `LicenseKey.create()` validates length. Old keys in DB have varying lengths; if we load them through the VO and they don't match new 20-char rule, they throw.
**How to avoid:** Two strategies — (a) keep VO length validation permissive (e.g., "12-32") for **input** validation but enforce 20-char for **generation**, OR (b) introduce a separate code path for "loaded from DB" that bypasses length validation (e.g., `LicenseKey.fromDatabase(value)` static). The codebase has many existing licenses with 12-char keys; the VO should NOT reject them on read.
**Warning signs:** After Phase 16, admin pages throw "Invalid license key length" when displaying v2.x licenses.
**Recommended approach:** Update VO to allow 12-32 chars for input/DB-read, but enforce 20-char for the LicenseKeyGenerator output (which is enforced by the generator itself, not the VO).

### Pitfall 3: Cache Key Conflict Across Domains
**What goes wrong:** Validation cache key is `sha256(license_key + domain)`. If the customer activates domain A, validation for A is cached. Then they activate domain B — validation for B is uncached, BUT the cache key includes the domain so there's no conflict. **However:** when the customer deactivates A, we must invalidate ONLY the cache entry for `(license_key, A)`, not `(license_key, B)`. If we publish event with just `license_id`, the subscriber must look up the license_key (extra DB query) AND it can't know which domain was deactivated unless the event payload includes it.
**Why it happens:** Cache key is derived from data not in the event payload.
**How to avoid:** Always include both `licenseKey` AND `domain` in event payloads for `LicenseActivated`/`LicenseDeactivated`/`LicenseRevoked`/`LicenseSuspended`. For `LicenseRevoked` (affects ALL domains for that license), use `cacheDeletePattern('license', `validate:${sha256(licenseKey)}*`)` to wipe all entries for that key.
**Warning signs:** Customer deactivates a domain, plugin still returns "valid" for that domain for up to 10 minutes (cache TTL).

### Pitfall 4: Race Between Cache Delete and Concurrent Validate Request
**What goes wrong:** Request A: validate → cache miss → DB read → cache set. Request B: state change → event → cache delete. If B's delete happens **between** A's DB read and A's cache set, A overwrites the invalidation with stale data.
**Why it happens:** Cache-aside pattern is inherently racy.
**How to avoid:** (a) Acceptable for Phase 16 — 10-min TTL bounds staleness; (b) Long-term: cache set with a versioned ETag, or use write-through cache via DB triggers. Phase 16 accepts (a).
**Warning signs:** Customer reports "I deactivated 5 minutes ago, plugin still says valid". Resolution: customer can wait 10 min or call the validate API which will re-cache from fresh DB state on cache miss.

### Pitfall 5: File Verification Bypass via CDN Path Traversal
**What goes wrong:** Customer places verification file at `https://domain.com/.well-known/conversionflow-verify.txt`, but CDN (Cloudflare) caches it. Customer then changes to a different token by editing the file. CDN keeps serving old cached version.
**Why it happens:** CDN caching of static files at edge nodes.
**How to avoid:** Set `Cache-Control: no-cache` request header when fetching (CDN may still override); accept this as a limitation. Customer can purge CDN cache, OR use DNS TXT (not cached at HTTP layer), OR use meta tag (typically rendered dynamically by plugin, not cached as static content).
**Warning signs:** Customer complains activation "succeeds once then fails forever" — CDN serving stale token.
**Documentation requirement:** Phase 16 docs should recommend DNS TXT for production deployments with CDN.

### Pitfall 6: HTTPS Enforcement on Verification Fetch
**What goes wrong:** Server fetches `https://<domain>/...` but domain is HTTP-only (no TLS cert). TLS handshake fails — server returns "verification failed". Customer is confused.
**Why it happens:** Self-signed certs, expired certs, HTTP-only staging sites, redirect from HTTPS to HTTP.
**How to avoid:** Allow HTTPS with `redirect: 'follow'` and reject HTTP origins explicitly. For dev/test environments, support a `ALLOW_HTTP_VERIFICATION` env flag. For production, ALWAYS require HTTPS — BD customers on managed WordPress typically have Let's Encrypt via their host.
**Warning signs:** BD customers with HTTP-only sites can't activate.
**Phase 16 stance:** Default to HTTPS-only; documented env flag for staging.

### Pitfall 7: Plugin Receives Different Status Codes for Same Logical Error
**What goes wrong:** Plugin handles 200 (valid), 403 (limit), 404 (invalid), 429 (rate limit). If customer implements the plugin wrong (treats 403 differently from 404), they leak info OR fail unexpectedly.
**Why it happens:** D-21 says "identical error for all failures" — this MUST mean identical HTTP status too, not just identical body.
**How to avoid:** All LGEN-09 failure paths return HTTP 404 + `{"valid":false,"error":"INVALID_LICENSE"}` — including ACT-04 (activation limit reached). Rate limit returns 429 (separate concern, plugin can retry). Activation failure (proof invalid, already activated, etc.) returns 403 + `{"valid":false,...,"error":"VERIFICATION_FAILED"}`. Different status for different *classes* of error (validation vs rate limit vs activation), but uniform within each class.
**Warning signs:** Plugin distinguishes "expired" from "revoked" from HTTP status — bad.

### Pitfall 8: Silent Failure on `timingSafeEqual` Length Mismatch
**What goes wrong:** `crypto.timingSafeEqual` throws when buffers differ in length. If caller doesn't check length first, exception bubbles to global error handler → 500 response → information leak (timing + status reveals "token hash length mismatch" → tells attacker token is wrong length).
**Why it happens:** Documented but easy to miss.
**How to avoid:** Always check `a.length === b.length` before `timingSafeEqual`. Both SHA-256 hex outputs are 64 chars, so length always matches IF both inputs went through SHA-256. The check is defensive against future changes.
**Warning signs:** Error logs show "RangeError: Input buffers must have the same byte length" on token validation endpoint.

### Pitfall 9: Concurrent Activation Race Even with Atomic UPDATE
**What goes wrong:** Two requests arrive at same millisecond, both pass rate limit, both call atomic UPDATE. Atomic UPDATE handles count race correctly. BUT: both also try to insert into `license_activations` table, AND both try to append to JSONB. JSONB append must be atomic too — otherwise one request's append can overwrite the other.
**Why it happens:** `array_append` on JSONB is not atomic by default — you must use the SQL expression inside the UPDATE statement (which IS atomic for that row).
**How to avoid:** Use `UPDATE licenses SET activation_domains = array_append(activation_domains, $domain) WHERE id = $id AND NOT activation_domains @> to_jsonb($domain::text)` — this is atomic AND prevents duplicate domain entries. See Pattern 3.
**Warning signs:** Duplicate domain entries in `activation_domains` JSONB for the same license.

### Pitfall 10: Verification Token Replay Across Domains
**What goes wrong:** Customer issues token for `example.com`, places it in DNS. Then they realize they wanted to activate `shop.example.com`. They submit activate request with `domain: shop.example.com` but the proof they served is on `example.com`'s DNS. If verifier just checks "does any domain have this token", it passes incorrectly.
**Why it happens:** Token issued for one domain shouldn't be valid for another.
**How to avoid:** VerificationTokenStore stores `{ licenseId, domain }` tuple. On consume, check that the requested domain matches the stored domain. Pattern 9 shows this.
**Warning signs:** Customer reports they activated "the wrong domain" but it succeeded.

## Code Examples

### Example 1: Validate Endpoint Route Handler (Complete)
```typescript
// src/app/api/v1/license/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/modules/licensing/infrastructure/adapters/RateLimiter";
import { validateLicenseHandler } from "@/modules/licensing/application/commands/ValidateLicenseHandler";

const INVALID_RESPONSE = () => NextResponse.json(
  { valid: false, license_id: null, plan: null, expires_at: null,
    max_activations: null, current_activations: null, error: "INVALID_LICENSE" },
  { status: 404 }
);

export async function POST(request: NextRequest) {
  // 1. Rate limit (per-IP, before any other work)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = await rateLimiter.check(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { valid: false, license_id: null, plan: null, expires_at: null,
        max_activations: null, current_activations: null, error: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    );
  }

  // 2. Parse and validate body
  let body: { license_key?: string; domain?: string; api_token?: string };
  try {
    body = await request.json();
  } catch {
    return INVALID_RESPONSE();
  }

  if (!body.license_key || !body.domain || !body.api_token) {
    return INVALID_RESPONSE();
  }

  // 3. Delegate to application handler (auth + cache + DB + format)
  const result = await validateLicenseHandler.execute({
    licenseKey: body.license_key,
    domain: body.domain,
    apiToken: body.api_token,
  });

  if (!result.valid) return INVALID_RESPONSE();

  return NextResponse.json({
    valid: true,
    license_id: result.licenseId,
    plan: result.plan,
    expires_at: result.expiresAt?.toISOString() ?? null,
    max_activations: result.maxActivations,
    current_activations: result.currentActivations,
    error: null,
  });
}
```

### Example 2: Activate Endpoint Route Handler
```typescript
// src/app/api/v1/license/activate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "@/modules/licensing/infrastructure/adapters/RateLimiter";
import { activateLicenseHandler } from "@/modules/licensing/application/commands/ActivateLicenseHandler";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent");

  const rateLimit = await rateLimiter.check(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { valid: false, error: "RATE_LIMITED", /* ...null fields... */ },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    );
  }

  let body: { license_key?: string; api_token?: string; domain?: string; verification_method?: "dns"|"file"|"meta"; verification_token?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ valid: false, error: "INVALID_REQUEST", /* ... */ }, { status: 400 });
  }

  if (!body.license_key || !body.api_token || !body.domain || !body.verification_method || !body.verification_token) {
    return NextResponse.json({ valid: false, error: "INVALID_REQUEST", /* ... */ }, { status: 400 });
  }

  if (!["dns", "file", "meta"].includes(body.verification_method)) {
    return NextResponse.json({ valid: false, error: "INVALID_REQUEST", /* ... */ }, { status: 400 });
  }

  const result = await activateLicenseHandler.execute({
    licenseKey: body.license_key,
    apiToken: body.api_token,
    domain: body.domain,
    verificationMethod: body.verification_method,
    verificationToken: body.verification_token,
    ipAddress: ip,
    userAgent,
  });

  if (!result.success) {
    // Map error codes to HTTP status
    const status = result.error === "ACTIVATION_LIMIT_REACHED" ? 403
                 : result.error === "VERIFICATION_FAILED" ? 403
                 : result.error === "ALREADY_ACTIVATED" ? 409
                 : 404;
    return NextResponse.json({
      valid: false, license_id: null, plan: null, expires_at: null,
      max_activations: null, current_activations: null,
      error: result.error ?? "INVALID_LICENSE",
    }, { status });
  }

  return NextResponse.json({
    valid: true,
    license_id: result.licenseId,
    plan: result.plan,
    expires_at: result.expiresAt?.toISOString() ?? null,
    max_activations: result.maxActivations,
    current_activations: result.currentActivations,
    error: null,
  });
}
```

### Example 3: license_activations Table Schema
```typescript
// Addition to src/lib/db/schema.ts

import { inet } from "drizzle-orm/pg-core"; // for ip_address column

export const activationActionEnum = pgEnum("activation_action", ["activate", "deactivate"]);
export const verificationMethodEnum = pgEnum("verification_method", ["dns", "file", "meta"]);

export const licenseActivations = pgTable(
  "license_activations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    licenseId: uuid("license_id")
      .notNull()
      .references(() => licenses.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),
    action: activationActionEnum("action").notNull(),
    ipAddress: inet("ip_address"), // nullable for cases where IP isn't available
    userAgent: text("user_agent"),
    verificationMethod: verificationMethodEnum("verification_method"), // nullable for deactivate action
    suspiciousFlags: jsonb("suspicious_flags").$type<string[]>().default([]),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    licenseIdx: index("license_activations_license_id_idx").on(table.licenseId),
    createdIdx: index("license_activations_created_at_idx").on(table.createdAt),
    domainIdx: index("license_activations_domain_idx").on(table.domain),
  })
);

export const licenseActivationsRelations = relations(licenseActivations, ({ one }) => ({
  license: one(licenses, {
    fields: [licenseActivations.licenseId],
    references: [licenses.id],
  }),
}));

// Also add api_token_hash column to existing licenses table (in a separate migration):
// Add: apiTokenHash: text("api_token_hash"), // nullable for backfill during Phase 17/20
```

### Example 4: LicenseKeyGenerator Unit Test Pattern
```typescript
// Test that distribution is uniform (modulo bias check)
import { LicenseKeyGenerator } from "@/modules/licensing/domain/services/LicenseKeyGenerator";

describe("LicenseKeyGenerator", () => {
  it("produces uniform character distribution (no modulo bias)", () => {
    const counts = new Map<string, number>();
    const samples = 100_000;
    for (let i = 0; i < samples; i++) {
      const key = LicenseKeyGenerator.generate();
      for (const char of key.value) {
        counts.set(char, (counts.get(char) ?? 0) + 1);
      }
    }
    const expectedPerChar = (samples * 20) / 31; // ~6452
    const tolerance = expectedPerChar * 0.05; // ±5%
    for (const char of "ABCDEFGHJKMNPQRSTUVWXYZ23456789") {
      const count = counts.get(char) ?? 0;
      expect(Math.abs(count - expectedPerChar)).toBeLessThan(tolerance);
    }
  });

  it("generates exactly 20-char body", () => {
    const key = LicenseKeyGenerator.generate();
    expect(key.value).toHaveLength(20);
  });

  it("uses only allowed charset", () => {
    const key = LicenseKeyGenerator.generate();
    expect(key.value).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{20}$/);
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| External license API at license.devsroom.com | Local generation via crypto.randomBytes | v3.0 (Phase 16) | Removes external dependency, eliminates network failure mode, enables offline dev/test |
| Read-then-write transactions for activation count | Atomic UPDATE…RETURNING with WHERE check | Postgres standard, well-documented | Eliminates race condition; same SQL perf |
| Token bucket rate limiting | Sliding window via Redis sorted set | Common pattern, mature libraries | True window semantics, no boundary bursts |
| Plain HTTP for verification | HTTPS-only with `Cache-Control: no-cache` | Web standard | Customer sites need TLS (free via Let's Encrypt); no change for managed WP hosts |
| API tokens in plaintext column | SHA-256 hashed tokens with constant-time comparison | OWASP ASVS V3.4 standard | DB leak doesn't expose usable tokens |
| Mock license keys via nanoid(12) | Real keys via crypto.randomBytes(20) + rejection sampling | v3.0 | Removes predictability; new format CF-XXXX-XXXX-XXXX-XXXX-XXXX |

**Deprecated/outdated:**
- `src/lib/central-api.ts` `mockImportOrderToCentral()` generates `CF-${nanoid(4)}-${nanoid(4)}-${nanoid(4)}` (12-char body, 3 segments) — superseded by 20-char/5-segment real generation. **File remains in place until Phase 20.**

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The D-03 charset is intended to be 31 chars (not 32) | Standard Stack, Pattern 1 | If 32 chars was intended, planner needs to confirm charset (e.g., add `9` or another letter). Currently CONTEXT.md says "32 chars" but the literal string is 31 chars. **NEEDS USER CONFIRMATION** — see Critical Discovery. |
| A2 | PostgreSQL `inet` type is supported by Drizzle 0.45.2 | Pattern 3, Example 3 | If not, fall back to `text("ip_address")` and validate in code. Drizzle added `inet` in earlier versions; should be available. [VERIFIED: drizzle-orm/pg-core exports `inet`] |
| A3 | Existing v2.x licenses in the database have varying key lengths (12 to 32 chars) | Pitfall 2 | If they're all already 20-char, no backwards-compat concern. Researcher hasn't queried the DB. **Planner should confirm by running** `SELECT length(license_key), count(*) FROM licenses GROUP BY 1;` |
| A4 | `ioredis.pipeline().exec()` returns `[error, result][]` tuples | Pattern 4 | If return shape differs, indexing `results?.[2]?.[1]` for ZCARD result is wrong. Verified from ioredis type docs but not runtime-tested. |
| A5 | `redis.getdel()` is available in ioredis 5.x | Pattern 9 | Need to verify — if not, fall back to MULTI `GET` + `DEL`. GETDEL is Redis 6.2+ command, supported by ioredis 4.x+. |
| A6 | The plugin (WordPress) will send `verification_token` in the activate request body | Example 2 | The flow assumes customer pre-issues a token via portal, places it, then submits via plugin. If plugin should issue-and-verify in one call, the flow changes. CONTEXT.md D-10 says "single round-trip" — but customer must place proof first, so this is necessarily a 2-step UX (issue → place → activate). **NEEDS USER CONFIRMATION** of UX. |
| A7 | The `centralOrderId`/`centralLicenseId`/`centralUserId` columns remain in `licenses` table for Phase 16 | Schema integration | CONTEXT.md defers removal to Phase 20. Confirmed in schema.ts lines 173, 196, 207. |
| A8 | DNS TXT verification will work without specifying nameserver | Pattern 6 | Node `dns.resolveTxt` uses system resolver. For BD customers with flaky DNS, may need to fallback to public resolvers. Phase 16 ships without fallback. |
| A9 | Suspicious flag `vpn_tor_exit` returns false in Phase 16 (empty list) | Don't Hand-Roll | If user expects real VPN/Tor detection in Phase 16, scope expands. CONTEXT.md D-18 says "basic list, manually curated" — implies non-empty. **NEEDS USER CONFIRMATION** of how basic the "basic list" is. |

## Open Questions

1. **D-03 charset length discrepancy**
   - What we know: CONTEXT.md says "32 chars" but the literal string `ABCDEFGHJKMNPQRSTUVWXYZ23456789` is 31 chars (23 letters + 8 digits).
   - What's unclear: Was a character omitted by mistake, or is 31 intentional and the doc wrong?
   - Recommendation: **Planner should surface to user via /gsd-discuss-phase or directly.** Three options: (a) keep 31 chars + rejection sampling (researcher's recommendation); (b) add a character to make 32 chars (e.g., include letter `R`... wait, it's already there — would need to include one of I/L/O or 0/1, contradicting D-03's no-ambiguous rule); (c) pick a 32-char charset (e.g., add `9`... already there). Realistically, 31 is the only valid size for a no-ambiguous alphanumeric charset. **Conclusion: 31 is correct, doc was wrong. Researcher proceeds with 31 + rejection sampling.**

2. **Verification token issuance flow**
   - What we know: D-13 says 24h single-use. D-10 says single round-trip.
   - What's unclear: Where does the customer GET the verification token? Is it issued by a portal endpoint (e.g., POST `/api/portal/licenses/[id]/issue-verification-token`) and shown in the UI for the customer to copy? Or does the plugin issue it itself via the public API?
   - Recommendation: Portal issues the token (Better Auth session required, makes audit trail clean). Customer copies token into DNS/file/meta. Plugin then calls activate with the token. Planner should confirm this UX.

3. **VPN/Tor exit node list source for D-18 `vpn_tor_exit` flag**
   - What we know: CONTEXT.md D-18 says "IP matches known VPN/Tor exit node list (basic list, manually curated)".
   - What's unclear: Does "manually curated" mean (a) ship empty in Phase 16 and add later, or (b) ship with a small seed list (e.g., Tor exit nodes from torproject.org)?
   - Recommendation: Ship empty list in Phase 16, document as "flag always returns false until Phase 19 wires EmergingThreats or Tor bulk exit list". Keep the `SuspiciousFlagDetector` adapter interface so Phase 19 just plugs in a list.

4. **Existing LicenseKey VO length update breaks v2.x data**
   - What we know: Existing `LicenseKey.create()` validates 16-32 chars. v2.x data has 12-char keys from mock central API.
   - What's unclear: What's the actual length distribution in production?
   - Recommendation: Planner should add a Wave-0 task: `SELECT length(license_key), count(*) FROM licenses GROUP BY 1` and update the VO's input validation to accept the existing range. Generation is always 20-char (Phase 16 forward); validation accepts legacy.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL | License/license_activations tables, atomic UPDATE | ✓ (existing) | Configured via `DATABASE_URL` | — |
| Redis | Rate limiter + cache + EventBus + verification token store | ✓ (existing) | ioredis 5.10.1 | In-memory Map fallback in `src/lib/redis.ts` (rate limiter needs separate in-memory implementation) |
| Node.js 18+ | Native `fetch` for HTTP proof, `dns.resolveTxt`, `crypto.timingSafeEqual` | ✓ (existing) | Required by Next.js 16 | — |
| `crypto` module | Random bytes, SHA-256, timing-safe equal | ✓ (existing) | Built-in | — |
| `dns` module | DNS TXT verification | ✓ (existing) | Built-in | — |

**Missing dependencies with no fallback:**
None.

**Missing dependencies with fallback:**
- **Redis unavailable in dev:** `src/lib/redis.ts` already provides `memoryStore` Map fallback for `kvGet`/`kvSet`/`kvDelete`. The Phase 16 `RateLimiter` adapter needs a separate in-memory sliding window implementation (e.g., `Map<ip, number[]>` with timestamp pruning) for dev without Redis. Document this as a Wave 0 task.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed (no test framework in package.json) |
| Config file | None — see Wave 0 Gaps |
| Quick run command | TBD (depends on chosen framework) |
| Full suite command | TBD |

**Note:** The project has `playwright-core` installed (used by an existing tool, possibly for visual regression). No unit test framework (jest/vitest) is currently installed. Phase 16 should either install `vitest` (lighter, native ESM, Vite-compatible) or rely on integration tests via Playwright + manual verification. **Recommendation:** install `vitest` as a dev dependency; setup is minimal (one config file, one `vitest run` script in package.json).

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| LGEN-01 | Generate 20-char body via crypto.randomBytes with rejection sampling | unit | `pnpm vitest run tests/unit/LicenseKeyGenerator.test.ts` | ❌ Wave 0 |
| LGEN-02 | Charset excludes 0,O,1,I,L; case-insensitive | unit | `pnpm vitest run tests/unit/LicenseKey.test.ts` | ❌ Wave 0 (test the existing VO) |
| LGEN-03 | UNIQUE constraint rejects duplicate license_key | integration | `pnpm vitest run tests/integration/licenses-unique.test.ts` | ❌ Wave 0 |
| LGEN-04 | No external API calls during generation | unit (mock) | `pnpm vitest run tests/unit/LicenseKeyGenerator.test.ts` | ❌ Wave 0 |
| LGEN-05 | /api/v1/license/validate returns 200 + body for valid input | integration | `pnpm vitest run tests/integration/validate-endpoint.test.ts` | ❌ Wave 0 |
| LGEN-06 | Cache hit returns same response; TTL=600 | integration | `pnpm vitest run tests/integration/validation-cache.test.ts` | ❌ Wave 0 |
| LGEN-07 | LicenseRevoked/Activated/Deactivated events delete cache | unit (mock EventBus) | `pnpm vitest run tests/unit/cache-invalidation.test.ts` | ❌ Wave 0 |
| LGEN-08 | 101st request in 60s returns 429 + Retry-After | unit | `pnpm vitest run tests/unit/rate-limiter.test.ts` | ❌ Wave 0 |
| LGEN-09 | All error paths return identical 404 + body | integration | `pnpm vitest run tests/integration/validate-uniformity.test.ts` | ❌ Wave 0 |
| ACT-01 | license_activations row created on every activate/deactivate | integration | `pnpm vitest run tests/integration/activate-log.test.ts` | ❌ Wave 0 |
| ACT-02 | Domain VO normalizes (https, www, trailing slash) | unit | `pnpm vitest run tests/unit/Domain.test.ts` | ❌ Wave 0 (test existing VO) |
| ACT-03 | Atomic UPDATE: 2 concurrent activates can't both succeed past limit | integration | `pnpm vitest run tests/integration/activation-race.test.ts` | ❌ Wave 0 |
| ACT-04 | Activation limit returns 403 with uniform error | integration | `pnpm vitest run tests/integration/activation-limit.test.ts` | ❌ Wave 0 |
| ACT-05 | DNS TXT / file / meta verifiers each accept/reject correctly | unit (mock DNS/fetch) | `pnpm vitest run tests/unit/verifiers.test.ts` | ❌ Wave 0 |
| ACT-06 | /api/v1/license/activate and /deactivate work end-to-end | integration | `pnpm vitest run tests/integration/activate-deactivate.test.ts` | ❌ Wave 0 |
| ACT-07 | Customer portal can view + deactivate domains | e2e (Playwright) | `pnpm exec playwright test tests/e2e/portal-licenses.spec.ts` | ❌ Wave 0 |
| ACT-08 | Admin page shows activation history with suspicious flag badges | e2e (Playwright) | `pnpm exec playwright test tests/e2e/admin-activations.spec.ts` | ❌ Wave 0 |
| API-01 | /validate route accepts JSON, validates shape | integration | covered by LGEN-05 | — |
| API-02 | /activate binds domain after verification | integration | covered by ACT-06 | — |
| API-03 | /deactivate removes domain | integration | covered by ACT-06 | — |
| API-04 | API token validated in constant time | unit | `pnpm vitest run tests/unit/ApiTokenValidator.test.ts` | ❌ Wave 0 |
| API-05 | All responses match D-23 format | integration | `pnpm vitest run tests/integration/response-format.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm vitest run tests/unit/` (unit tests only, < 10s)
- **Per wave merge:** `pnpm vitest run` (all unit + integration)
- **Phase gate:** Full suite green + manual smoke test of three endpoints with curl + manual click-through of admin/portal UI before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `vitest` installed as devDependency (no test framework currently present)
- [ ] `vitest.config.ts` configured (minimal: `test: { globals: true, environment: 'node' }`)
- [ ] `tests/` directory structure created (`tests/unit/`, `tests/integration/`, `tests/e2e/`)
- [ ] `tests/setup.ts` — DB test connection, Redis mock, cleanup helpers
- [ ] `tests/fixtures/licenses.ts` — sample license rows for tests
- [ ] `package.json` scripts: `"test": "vitest"`, `"test:run": "vitest run"`, `"test:e2e": "playwright test"`

*(If user opts to skip vitest install in Phase 16: rely on manual curl tests + Playwright e2e only. Not recommended — the rejection-sampling math and atomic UPDATE semantics strongly benefit from automated tests.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no (public API uses per-license tokens, not user auth) | — |
| V3 Session Management | no | — |
| V4 Access Control | yes | Constant-time API token comparison; per-license token scoping; Better Auth session for portal/admin pages |
| V5 Input Validation | yes | LicenseKey VO (charset + length); Domain VO (RFC 1123); request body schema validation in route handlers |
| V6 Cryptography | yes | `crypto.randomBytes()` for keys/tokens; SHA-256 for token hashing; `crypto.timingSafeEqual` for comparison; rejection sampling for uniform distribution |
| V7 Errors & Logging | yes | Uniform error response (LGEN-09); audit log via existing `createAuditLog` for all admin actions |
| V8 Data Protection | yes | API tokens hashed at rest; IPs logged but not PII-classified in BD law; verification tokens 24h TTL |
| V9 Communications | yes | HTTPS required for verification fetch; API itself served over HTTPS in production (Next.js default) |
| V13 API & Web Service | yes | Rate limiting (100/min/IP); uniform error responses; JSON content type validation |

### Known Threat Patterns for License API

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| License key enumeration via timing | Information disclosure | Identical HTTP 404 + body for all error paths; consider dummy SHA-256 in error path to equalize response time |
| License key enumeration via error differentiation | Information disclosure | Single `INVALID_LICENSE` error code for all failure modes (D-21) |
| Activation race condition (oversell) | Tampering | Atomic UPDATE…RETURNING with WHERE clause (D-16, Pattern 2) |
| API token timing attack | Spoofing | `crypto.timingSafeEqual` on SHA-256 hashes (Pattern 5) |
| Verification proof forgery (customer submits fake proof) | Spoofing | Server fetches proof directly from domain (D-10); never trust client-supplied proof content |
| Verification proof replay across domains | Spoofing | VerificationTokenStore binds token to (licenseId, domain) tuple; atomic GETDEL on consume (Pattern 9) |
| CDN cache poisoning of verification file | Tampering | Recommend DNS TXT for CDN-hosted sites; document Cache-Control header; Phase 16 accepts this limitation |
| Rate limit evasion via IP rotation (botnet) | DoS | Rate limit is per-IP; provides basic protection. For sophisticated attacks, Phase 19 adds Cloudflare/WAF integration. |
| Cache invalidation race | Information disclosure | Acceptable: 10-min TTL bounds staleness. Document as known limitation. |
| Modulo bias in key generation | Information disclosure | Rejection sampling with 248/256 threshold (Pattern 1) |
| DNS resolver cache poisoning of verification | Spoofing | Use system resolver; for high-security scenarios Phase 19 adds DoH with authenticated resolvers |
| Suspicious flag suppression | Repudiation | Flags computed at write time inside the same transaction as the activation log row; cannot be suppressed by client |

## Sources

### Primary (HIGH confidence)
- `src/lib/redis.ts` — verified cache helper signatures, `LICENSE:` prefix registered, 5-min default TTL [VERIFIED: file read]
- `src/lib/db/schema.ts` lines 191-213 — verified existing `licenses` table has UNIQUE on `license_key`, JSONB `activation_domains`, integer `current_activations`/`max_activations` [VERIFIED: file read]
- `src/shared/domain/valueObjects/LicenseKey.ts` — verified current 16-32 length validation, no-ambiguous regex `/[01OIL]/`, formatted getter [VERIFIED: file read]
- `src/shared/domain/valueObjects/Domain.ts` — verified normalization (protocol, www, slashes, port), `.com.bd` handling, RFC 1123 regex [VERIFIED: file read]
- `src/shared/infrastructure/repositories/BaseRepository.ts` — verified `findById`/`findAll`/`create`/`update`/`delete`/`exists`/`transaction` [VERIFIED: file read]
- `src/shared/infrastructure/eventBus/EventBus.ts` + `types.ts` — verified `BaseEvent` interface, `createEventBus`/`createPublisher`/`createSubscriber` factories, `inProcessEventBus`/`crossProcessEventBus` instances [VERIFIED: file read]
- `src/modules/products/` — verified Phase 15 module structure as template (domain/entities, domain/events, infrastructure/repositories, infrastructure/repositories/mappers) [VERIFIED: file listing + sample reads]
- `src/app/api/ssl-commerz/ipn/route.ts` — verified POST handler pattern, error handling, idempotency [VERIFIED: file read]
- `src/app/(portal)/dashboard/licenses/[id]/page.tsx` — verified existing structure (auth check, license query with IDOR protection, domains list display) [VERIFIED: file read]
- `src/proxy.ts` — verified `/api/*` paths are excluded from auth checks [VERIFIED: file read]

### Secondary (MEDIUM confidence)
- Node.js docs — `crypto.randomBytes`, `crypto.timingSafeEqual`, `dns.resolveTxt` [CITED: nodejs.org/api/]
- Drizzle ORM docs — `pgTable`, `pgEnum`, `inet`, `sql` template, `db.transaction` [CITED: orm.drizzle.team]
- ioredis docs — `pipeline`, `zadd`, `zremrangebyscore`, `zcard`, `getdel` [CITED: github.com/redis/ioredis]
- Redis docs — sorted set operations for sliding window rate limit [CITED: redis.io/commands/zcard]

### Tertiary (LOW confidence)
- "Sliding window log algorithm" rate limiting pattern — well-known but not from a single canonical source; documented in many Redis pattern books. Implementation is straightforward and verified against expected behavior.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies verified in package.json, all infrastructure files read
- Architecture: HIGH — Phase 15 module pattern is the template; existing codebase already has all needed primitives
- Schema integration: HIGH — verified existing `licenses` table, `productPlans` for max_activations lookup
- License key generation: HIGH — math verified at runtime (charset length = 31, rejection threshold = 248)
- Atomic activation: HIGH — Drizzle `sql` template + UPDATE…RETURNING is standard PostgreSQL
- Rate limiter: HIGH — sorted set pattern is canonical Redis usage
- Cache invalidation: MEDIUM — depends on EventBus subscription registration at app startup; exact registration location TBD by planner
- Verification flow (DNS/file/meta): MEDIUM — DNS TXT via `dnsPromises` is straightforward but `AbortController` integration with `dnsPromises` requires runtime verification (offered Promise.race alternative in Pattern 6)
- Suspicious flag detection: MEDIUM — `burst_ips_24h` is straightforward; `vpn_tor_exit` ships empty per Assumption A9 (needs user confirmation)
- D-03 charset length: HIGH confidence that 31 is the correct count (math verified) — LOW confidence that this matches user intent (CONTEXT.md says 32)
- Test framework: LOW — vitest not yet installed; planner needs to add Wave 0 install task
- Verification token UX: MEDIUM — researcher inferred "portal issues token, customer places it, plugin consumes it" but D-10 says "single round-trip" which is ambiguous

**Research date:** 2026-06-02
**Valid until:** 2026-07-02 (30 days — stable domain, low churn expected)
