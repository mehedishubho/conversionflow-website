# Phase 16: Licensing Core (Generation & Validation) - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

The platform generates unique, secure license keys locally using `crypto.randomBytes()` and exposes a public REST API for license validation, activation, and deactivation — completely replacing the dependency on `license.devsroom.com` (`src/lib/central-api.ts`).

This phase builds the **Licensing Bounded Context** within `src/modules/licensing/` using the DDD layers established in Phase 14. It delivers the public `/api/v1/license/*` endpoints, plus customer portal domain management UI and admin activation history views.

**In scope:**
- License generation service (crypto.randomBytes, format: `CF-XXXX-XXXX-XXXX-XXXX-XXXX`)
- Update existing `LicenseKey` value object to enforce 20-char body (currently allows 16-32)
- Public API endpoints: `/api/v1/license/validate`, `/api/v1/license/activate`, `/api/v1/license/deactivate`
- Per-license API token model (opaque bearer, SHA-256 hashed in DB)
- Redis sliding-window rate limiting (100 req/min per IP)
- Redis caching for validation responses (5-15 min TTL, invalidation on status change)
- Domain verification at activation time (DNS TXT, file upload, meta tag — all three)
- Hybrid activation storage: keep `licenses.activation_domains` JSONB + new `license_activations` history table
- Basic threshold-based suspicious pattern flags (computed at write time)
- Customer portal: domain management on license detail page
- Admin: activation history view per license

**NOT in scope (later phases):**
- Refactoring checkout to generate licenses via domain events (Phase 17)
- Subscription lifecycle: expiry tracking, grace periods, renewal reminders (Phase 18)
- License analytics dashboard, advanced suspicious pattern surfacing, transfer system (Phase 19)
- Removing `src/lib/central-api.ts`, `centralOrderId`/`centralLicenseId`/`centralUserId` fields (Phase 20)
- Geo-IP lookup (deferred to Phase 19)
- Cryptographic offline validation (post-MVP, DEFER-01)
- Hardware fingerprinting (post-MVP, DEFER-02)

</domain>

<decisions>
## Implementation Decisions

### License Key Format
- **D-01:** Final format is `CF-XXXX-XXXX-XXXX-XXXX-XXXX` — 20-character body with `CF-` prefix, 5 segments of 4 chars separated by hyphens. Total length with separators: 24 chars. Matches existing mock pattern in `src/lib/central-api.ts` (currently `CF-${nanoid(4)}-${nanoid(4)}-${nanoid(4)}` — Phase 16 extends to 5 segments and switches to `crypto.randomBytes()`).
- **D-02:** No checksum character — pure random body. Server rejects typos with the standard uniform "invalid license" error. The UNIQUE constraint plus LGEN-09 identical-error policy already prevent information leakage.
- **D-03:** Character set: `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (32 chars). Same set as existing `LicenseKey` value object. No new ambiguous pairs introduced.
- **D-04:** Existing `src/shared/domain/valueObjects/LicenseKey.ts` must be updated: change length validation from `16-32` to exactly `20` (the body, excluding hyphens). Format display already produces 4-char segments — extend `formatted` getter to produce 5 segments for 20-char bodies.

### Public API Authentication
- **D-05:** Per-license API tokens — each license has its own token delivered alongside the license key. Plugin sends both `license_key` and `api_token` on every call. Revoking a license automatically revokes its token.
- **D-06:** Token format: opaque bearer string `cf_live_<32-char-nanoid>`. Stored as SHA-256 hash in a new `licenses.api_token_hash` column (never store plaintext). Constant-time comparison at validation.
- **D-07:** Token generation happens at license creation time (Phase 17 will trigger this via `OrderCompleted` event). For Phase 16, generate token when admin manually creates a license via the existing admin actions.
- **D-08:** Rate limiting uses Redis sliding window (100 req/min per IP). Use existing `src/lib/redis.ts` infrastructure — implement sliding window via sorted sets (`ZADD`/`ZREMRANGEBYSCORE`/`ZCARD`) or token bucket. Return HTTP 429 with `Retry-After` header on limit exceeded.

### Domain Verification Flow
- **D-09:** Support all three verification methods: DNS TXT record, file upload, meta tag. Customer picks method at activation time. Method stored on the activation request.
- **D-10:** Verification happens at activation time — single round-trip. Plugin calls `/activate` with domain + method + token + proof-of-placement. Server fetches proof immediately and activates in one request. No two-step pending state.
- **D-11:** DNS lookup uses Node built-in `dns.resolveTxt()`. No external DoH dependency. Query domain for TXT record matching `cf-license-verify=<token>`.
- **D-12:** File verification: server fetches `https://<domain>/.well-known/conversionflow-verify.txt` and expects content `<token>`. Meta tag verification: server fetches `https://<domain>/` and looks for `<meta name="cf-license-verify" content="<token>">`.
- **D-13:** Verification token lifetime: 24 hours, single-use. Token issued at activation request start, invalidated after successful activation or after 24h expiry. Customer can re-issue expired tokens by re-attempting activation.

### Activation Data Model
- **D-14:** Hybrid storage — keep `licenses.activation_domains` JSONB for fast current-state reads (used by validation API's cache). Add new `license_activations` table for full event history (every activate/deactivate with timestamp, IP, action).
- **D-15:** New `license_activations` table columns: `id` (uuid), `license_id` (fk→licenses), `domain` (text, normalized via Domain VO), `action` (enum: activate/deactivate), `ip_address` (inet), `user_agent` (text, nullable), `verification_method` (enum: dns/file/meta), `suspicious_flags` (jsonb array of triggered flag codes), `created_at` (timestamp).
- **D-16:** Atomic activation count enforcement: use PostgreSQL `UPDATE licenses SET current_activations = current_activations + 1 WHERE id = $1 AND current_activations < max_activations RETURNING *`. If 0 rows returned, activation limit reached — reject with `403 Forbidden`.
- **D-17:** Skip geo-IP lookup in Phase 16. Log IP only. Geo enrichment deferred to Phase 19 (Portal & Analytics Enhancements).
- **D-18:** Suspicious pattern flags computed at write time (basic threshold-based):
  - `burst_ips_24h` — 5+ unique IPs for same license in 24h
  - `multi_country_7d` — flagged if geo added later and shows 3+ countries in 7d (Phase 19 will activate this)
  - `vpn_tor_exit` — IP matches known VPN/Tor exit node list (basic list, manually curated)
  - `plan_limit_breach` — simultaneous active domains > plan's maxActivations (defensive; should never fire if atomic ops are correct)
  Flags stored in `license_activations.suspicious_flags` as JSONB array. Phase 16 surfaces them in admin views as a column on the activation history table; Phase 19 adds dashboard aggregation.

### Validation Cache Strategy
- **D-19:** Cache key: `license:validate:<sha256(licenseKey)>:<sha256(licenseKey+domain)>`. Two-level key scheme: the first sha256 segment groups all domain entries for a license key, enabling `invalidateAll` to prefix-scan on `license:validate:<sha256(licenseKey)>:*`. TTL: 10 minutes (midpoint of 5-15 min spec range). Stored value: full validation response JSON.
- **D-20:** Cache invalidation via domain event subscription. The licensing service emits `LicenseRevoked`, `LicenseSuspended`, `LicenseActivated`, `LicenseDeactivated` events. A handler subscribes and calls `cacheDelete('license', validateKey)`. Use the existing `EventBus` from Phase 14.
- **D-21:** Identical error response for all validation failures (LGEN-09). HTTP 404 with body `{"valid": false, "error": "INVALID_LICENSE"}` for: not found, expired, revoked, suspended, deactivated for that domain, plan limit exceeded. HTTP 200 with `{"valid": true, ...}` only on success.

### API Endpoint Contracts
- **D-22:** All three endpoints accept `Content-Type: application/json` POST with body containing `license_key`, `domain`, `api_token`. Activate additionally requires `verification_method` (dns/file/meta) and the verification is performed server-side (customer doesn't send the proof content — server fetches it).
- **D-23:** Response format (API-05): `{"valid": boolean, "license_id": string|null, "plan": string|null, "expires_at": string|null, "max_activations": number|null, "current_activations": number|null, "error": string|null}`. Always include all fields; null when invalid.

### Module Structure (following Phase 14/15 pattern)
- **D-24:** `src/modules/licensing/domain/` — entities (License, Activation), value objects (reuse shared LicenseKey/Domain), domain events (LicenseCreated, LicenseRevoked, LicenseActivated, etc.), domain services (LicenseKeyGenerator, ActivationValidator)
- **D-25:** `src/modules/licensing/application/` — CQRS commands (GenerateLicense, ValidateLicense, ActivateLicense, DeactivateLicense) and queries (GetLicense, GetActivationHistory). Service layer pattern from ARCH-02.
- **D-26:** `src/modules/licensing/infrastructure/` — LicenseRepository, ActivationRepository (both extend BaseRepository from Phase 14), mappers, external service adapters (RateLimiter, DnsVerifier, HttpProofFetcher)
- **D-27:** API route handlers in `src/app/api/v1/license/[validate|activate|deactivate]/route.ts` — thin layer that calls application services. Auth check, rate limit check, request validation, service call, response formatting. No business logic in routes.

### Customer Portal Domain Management
- **D-28:** Domain management lives on existing `/dashboard/licenses/[id]/` page as a new "Active Domains" section (inline, not a separate tab). Shows current domains from `licenses.activation_domains` JSONB, deactivate button per domain.
- **D-29:** Deactivation from portal is instant (no admin approval). Updates JSONB atomically, logs to `license_activations`, emits `LicenseDeactivated` event for cache invalidation.

### Admin Activation History View
- **D-30:** New admin page `/admin/licenses/[id]/activations/` showing chronological `license_activations` rows for that license with: timestamp, domain, action, IP, verification method, suspicious flags (color-coded badges).

### Claude's Discretion
- Exact database column types for `license_activations` table (researcher picks based on Drizzle best practices)
- Detailed implementation of sliding window rate limiter (sorted set vs token bucket)
- HTTP client choice for file/meta proof fetching (native fetch vs axios — native preferred since Node 18+)
- VPN/Tor exit node list source (researcher picks a maintained open dataset)
- Specific colors/styling for suspicious flag badges
- Internal structure of application layer services (single service vs separate command handlers)
- Error code naming beyond `INVALID_LICENSE` (e.g., `RATE_LIMITED`, `VERIFICATION_FAILED`)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-Level Specs
- `.planning/REQUIREMENTS.md` §"License Generation & Validation (LGEN)" — LGEN-01 through LGEN-09 (license format, generation rules, validation, caching, rate limiting)
- `.planning/REQUIREMENTS.md` §"Activation & Domain Tracking (ACT)" — ACT-01 through ACT-08 (activation tracking, normalization, atomic ops, verification, portal/admin views)
- `.planning/REQUIREMENTS.md` §"Public API Endpoints (API)" — API-01 through API-05 (endpoint contracts, auth, response format)
- `.planning/REQUIREMENTS.md` §"Deferred (Post-MVP)" — DEFER-01 (offline validation) and DEFER-02 (hardware fingerprinting) — explicitly out of scope
- `.planning/PROJECT.md` §"Key Decisions" — Self-contained licensing, Modular Monolith + DDD, Service Layer, Repository Pattern decisions

### Roadmap
- `.planning/ROADMAP.md` §"Phase 16: Licensing Core (Generation & Validation)" — Success criteria 1-8, dependency on Phase 14 + 15

### Phase 14 Infrastructure (MUST use)
- `src/shared/domain/valueObjects/LicenseKey.ts` — Existing LicenseKey VO; needs length update from 16-32 to exactly 20 (D-04)
- `src/shared/domain/valueObjects/Domain.ts` — Domain VO with all normalization rules already implemented (BD TLD support included)
- `src/shared/infrastructure/eventBus/EventBus.ts` — EventBus interface for publish/subscribe
- `src/shared/infrastructure/eventBus/types.ts` — BaseEvent interface for domain events (D-20 invalidation events must implement this)
- `src/shared/infrastructure/repositories/BaseRepository.ts` — Base CRUD repository with transactions, query builder
- `src/shared/infrastructure/repositories/types.ts` — IRepository, IMapper, QueryBuilder interfaces

### Phase 15 Patterns (follow same structure)
- `src/modules/products/domain/entities/Product.ts` — Entity pattern reference
- `src/modules/products/infrastructure/repositories/ProductRepository.ts` — Repository extending BaseRepository pattern
- `src/modules/products/infrastructure/repositories/mappers/ProductMapper.ts` — IMapper implementation pattern
- `src/modules/products/domain/events/ProductEvents.ts` — Domain events pattern (Phase 16 follows same shape for LicenseEvents)

### Existing Schema (must integrate)
- `src/lib/db/schema.ts` — `licenses` table (lines 191-213): existing `license_key UNIQUE`, `activation_domains` JSONB, `current_activations`/`max_activations`, `status` enum, `expires_at`. Add `api_token_hash` column.
- `src/lib/db/schema.ts` — `licenseStatusEnum` (line 35-40): has 4 values. Phase 18 adds `grace_period`. Phase 16 only uses existing 4.
- `src/lib/db/schema.ts` — `productPlans` table (lines 400-431): source of `maxActivations`, `licenseType`, `billingCycle`. Read during validation.

### Existing Infrastructure (must use)
- `src/lib/redis.ts` — ioredis client + `cacheGet`/`cacheSet`/`cacheDelete`/`cacheDeletePattern` helpers. `LICENSE:` prefix already registered with 5-min default TTL.
- `src/lib/auth.ts` — Better Auth setup (for admin/customer auth on portal/admin pages, NOT for public API which uses per-license tokens)
- `src/lib/central-api.ts` — Current external API client. Phase 16 builds the LOCAL replacement. Phase 20 removes this file.

### Customer Portal & Admin (extend these)
- `src/app/(portal)/dashboard/licenses/[id]/page.tsx` — Existing license detail page. Add "Active Domains" section here (D-28).
- `src/app/(admin)/admin/orders/page.tsx` — Standard admin page pattern (auth check, data fetch, PageBreadcrumb + ComponentCard) — follow this for new admin activation history page.
- `src/app/(admin)/actions/admin-products.ts` — Admin server actions pattern (Phase 15); replicate for `admin-licenses.ts`.

### Existing API Routes (follow conventions)
- `src/app/api/ssl-commerz/ipn/route.ts` — Reference for POST handler pattern with signature verification
- `src/app/api/invoices/[id]/pdf/route.ts` — Reference for auth check pattern

### References to Replace
- `src/lib/central-api.ts` — Mock generates `CF-${nanoid(4)}-${nanoid(4)}-${nanoid(4)}` (12-char body, 3 segments). Phase 16 introduces real generation: `crypto.randomBytes()` mapped to allowed charset, 20-char body, 5 segments.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`LicenseKey` value object** (`src/shared/domain/valueObjects/LicenseKey.ts`) — Already implements validation, formatting, serialization. Update length constraint (16-32 → exactly 20) and segment count (`.match(/.{1,4}/g)` already handles any length — just generates 5 segments for 20 chars automatically).
- **`Domain` value object** (`src/shared/domain/valueObjects/Domain.ts`) — Full normalization including `.com.bd` and other multi-part TLDs. Use for every domain input on API endpoints.
- **`BaseRepository`** (`src/shared/infrastructure/repositories/BaseRepository.ts`) — Provides `findById`, `findAll` (with QueryBuilder), `create`, `update`, `delete`, `exists`, `transaction`. Extend for `LicenseRepository`, `ActivationRepository`.
- **EventBus** — Use for cache invalidation subscription (D-20). Both `EventEmitterBus` (in-process) and `RedisPubSubBus` (cross-process) are wired.
- **Redis cache helpers** (`src/lib/redis.ts`) — `cacheGet('license', key)`, `cacheSet('license', key, value, 600)`, `cacheDelete('license', key)`. `LICENSE:` prefix and 5-min default TTL already configured; pass `600` (10 min) explicitly for validation cache.
- **Existing `licenses` table** — Already has the columns we need; we add `api_token_hash` and create new `license_activations` table alongside.
- **Admin UI components** — `ComponentCard`, `PageBreadcrumb`, existing admin tables in `src/components/`.

### Established Patterns
- **DDD module layering** — `domain/` (entities, events, services), `application/` (commands, queries), `infrastructure/` (repositories, mappers, adapters). Phase 15's `products` module is the template.
- **Admin page pattern** — server component → `requireAdmin()` → data fetch via server action → render with `ComponentCard` + `PageBreadcrumb`. See `src/app/(admin)/admin/orders/page.tsx`.
- **Server actions** — `src/app/(admin)/actions/admin-{resource}.ts` with `requireAdmin()` guard. Phase 16 adds `admin-licenses.ts` for revoke/suspend actions and activation history queries.
- **API route pattern** — `POST` handler reads body, validates input, calls service, returns JSON. See `src/app/api/ssl-commerz/ipn/route.ts`.
- **Drizzle transactions** — `db.transaction(async (tx) => { ... })` for atomic operations. Used by BaseRepository; reusable in service layer for the activation count increment (D-16).

### Integration Points
- **`licenses` table** — Add `api_token_hash` column via migration. Existing rows can have NULL initially (backfill in Phase 17 when checkout generates licenses locally).
- **`product_plans` table** — Read-only lookup during validation. Joins: `licenses.productId` → `products.id` → `product_plans` (filter by slug matching `licenses.plan`). Phase 20 will migrate these to foreign keys; Phase 16 keeps text fields as-is and uses service-layer joins.
- **`src/app/(portal)/dashboard/licenses/[id]/page.tsx`** — Add domain management UI section.
- **`src/app/(admin)/admin/licenses/`** — Does not exist yet; create new route for licenses list and activation history detail.
- **EventBus handlers** — Subscribe `LicenseRevoked`, `LicenseSuspended`, `LicenseActivated`, `LicenseDeactivated` to invalidate validation cache. Register in module initialization.
- **Public API routes** — New `src/app/api/v1/license/{validate,activate,deactivate}/route.ts`. Add Next.js proxy.ts exclusions so these don't get auth-redirected.

</code_context>

<specifics>
## Specific Ideas

- The plugin (WordPress) is the primary consumer of the public API. The flow must be implementable in <100 lines of PHP — keep the contract simple: POST JSON, get JSON, handle three status codes (200, 403, 429).
- Verification via meta tag is the "easy mode" for WordPress customers — the plugin can inject `<meta name="cf-license-verify" content="...">` via `wp_head` hook without the customer lifting a finger. Make sure this path is documented.
- For BD customers on managed WordPress hosting (Pressable, WP Engine, Hostinger BD), file-based verification may fail because of CDN caching. DNS TXT should be the recommended path in docs, with meta tag as the "quick start" option.
- Suspicious flag badges in admin should use the existing color tokens (orange/red from globals.css) — don't invent new colors.
- The D-16 atomic activation query should be a single SQL statement, not a transaction with read-then-write. The RETURNING clause gives us the updated row to build the response from.
- API token column should be nullable so existing v2.x licenses don't break — they'll get tokens generated during the Phase 20 migration or on first use.

</specifics>

<deferred>
## Deferred Ideas

- **Geo-IP enrichment of activation logs** — deferred to Phase 19 (Portal & Analytics Enhancements). Phase 16 stores IP only; Phase 19 adds MaxMind/IPinfo integration and a `geo` JSONB column on `license_activations`.
- **Real-time admin alerts on suspicious patterns** — deferred to Phase 19. Phase 16 computes flags and stores them; Phase 19 surfaces aggregated alerts.
- **Cryptographic offline validation** (DEFER-01) — post-MVP. Public key embedded in plugin, signed license payload validated without calling home.
- **Hardware fingerprinting** (DEFER-02) — post-MVP. Device-bound activations beyond domain checks.
- **API versioning beyond `/v1/`** — when v2 is needed, add `/api/v2/license/*` and keep v1 alive. No need to design the versioning system now.
- **OpenAPI/Swagger docs generation** — out of scope for Phase 16. Hand-written docs in `/docs/api` are enough for v1.
- **Per-product API tokens** — D-05 chose per-license tokens. If token proliferation becomes a problem, revisit per-product as a future optimization.
- **DNS-over-HTTPS fallback for verification** — D-11 uses Node `dns` module only. If OS resolver quirks cause issues for BD customers, add DoH fallback later.
- **Removing `src/lib/central-api.ts` and `centralOrderId`/`centralLicenseId`/`centralUserId` fields** — explicitly Phase 20. Phase 16 leaves them in place; the new local system runs in parallel.
- **Refactoring checkout to trigger license generation via `OrderCompleted` domain event** — explicitly Phase 17. Phase 16 builds the generation service; Phase 17 wires it into checkout.

### Reviewed Todos (not folded)
None — no matching todos in `.planning/` for this phase.

</deferred>

---

*Phase: 16-licensing-core*
*Context gathered: 2026-06-02*
