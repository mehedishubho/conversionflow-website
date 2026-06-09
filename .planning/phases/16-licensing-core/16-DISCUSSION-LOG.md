# Phase 16: Licensing Core (Generation & Validation) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-02
**Phase:** 16-licensing-core
**Areas discussed:** License Key Format, Public API Authentication, Domain Verification Flow, Activation Data Model

---

## License Key Format

### Q1: What license key format should customers see and the API accept?

| Option | Description | Selected |
|--------|-------------|----------|
| CF-XXXX-XXXX-XXXX-XXXX-XXXX (5x4) | 20-char body + CF- prefix. 24 chars total with separators. Matches existing mock. Easy to read/type. | ✓ |
| CF-XXXXX-XXXXX-XXXXX-XXXXX-XXXXX (5x5) | 25-char body + CF- prefix. Hits 25-char minimum spec. More entropy. Slightly harder to read aloud. | |
| CF-XXXXXXXX-XXXXXXXX-XXXXXXXXXX (8-8-10) | 26-char body + CF- prefix. Asymmetric. Compact for WooCommerce input fields. | |
| No prefix, 4x7 = 28 chars | Pure random body, no brand prefix. Maximum untraceability. Customers can't recognize brand. | |

**User's choice:** CF-XXXX-XXXX-XXXX-XXXX-XXXX (5x4)
**Notes:** Aligns with existing mock pattern in `src/lib/central-api.ts`. Familiar to anyone who's already seen the test keys. 5 segments of 4 chars is the sweet spot for readability + entropy.

---

### Q2: Should keys include a checksum character for typo detection (Luhn-style)?

| Option | Description | Selected |
|--------|-------------|----------|
| No checksum | Pure random body. Simpler. Server rejects typos with uniform error. UNIQUE + LGEN-09 prevent leakage. | ✓ |
| Yes, last char is checksum | Luhn-style last character. Plugin can pre-validate. ~1 char overhead + complexity. | |

**User's choice:** No checksum
**Notes:** Premature optimization. The rate limiter and uniform-error policy handle the "many invalid guesses" attack without client-side validation.

---

### Q3: Which character set should the body use?

| Option | Description | Selected |
|--------|-------------|----------|
| ABCDEFGHJKMNPQRSTUVWXYZ23456789 | 32 chars. Excludes 0/O, 1/I/L. Widely used "Crockford-like" set. | ✓ |
| ABCDEFGHJKMNPQRSTUVWXYZ23456789 (current VO set) | Same as recommended — what `LicenseKey.ts` already uses. No code change needed beyond extending length. | |
| Crockford Base32 (0-9, A-Z minus I/L/O/U) | Standardized base32. Best for future keyed decoding. Slightly different from current VO. | |

**User's choice:** ABCDEFGHJKMNPQRSTUVWXYZ23456789
**Notes:** Matches existing LicenseKey.ts implementation. No rework on the VO character set — only the length constraint changes.

---

## Public API Authentication

### Q1: What should API tokens be scoped to?

| Option | Description | Selected |
|--------|-------------|----------|
| Per-license tokens | Each license has its own token, delivered with the license. Plugin sends license_key + api_token. Easy per-license revocation. | ✓ |
| Per-product tokens | One token per product. All licenses under that product share it. Simpler but revoking affects all customers. | |
| Per-customer tokens | Each customer has one token for all licenses. Plugin needs customer_id + license_key + token. Most complex. | |
| No auth, just rate-limited | No tokens. Relies on rate limiting alone. Anyone with a key can hit the API. | |

**User's choice:** Per-license tokens
**Notes:** Granular revocation is worth the per-row token storage cost. Aligns with "one license = one installation" mental model.

---

### Q2: What token format should be used?

| Option | Description | Selected |
|--------|-------------|----------|
| Opaque bearer string | `cf_live_<32-char-nanoid>`. Stored SHA-256 hashed. Industry standard (Stripe, GitHub PATs). | ✓ |
| Signed JWT | Self-validating JWT with HS256. But still need DB lookup for revocation. Larger payload. | |
| HMAC-signed requests | Each request signed with token + nonce + timestamp. Most secure but most complex for plugin authors. | |

**User's choice:** Opaque bearer string
**Notes:** Simple wins. JWT and HMAC add complexity without real benefit since we need DB lookup anyway for revocation checks.

---

### Q3: Where should rate limit counters live (100 req/min per IP)?

| Option | Description | Selected |
|--------|-------------|----------|
| Redis sliding window | Accurate counts. Atomic INCR + EXPIRE. Works across instances. Already wired. | ✓ |
| Redis fixed window | Simpler. Less accurate at minute boundaries. Slightly cheaper. | |
| In-memory Map | No Redis needed. Doesn't work with multi-instance. Per-server fallback. | |

**User's choice:** Redis sliding window
**Notes:** The infrastructure is already there. Sliding window avoids the burst-at-boundary problem.

---

## Domain Verification Flow

### Q1: Which verification methods should the API support?

| Option | Description | Selected |
|--------|-------------|----------|
| All three: DNS TXT + file + meta tag | Customer picks method. WordPress plugin can auto-place file/meta. DNS works for any stack. | ✓ |
| File + meta tag only (no DNS) | Avoids Node `dns` module complexity. Sufficient for WordPress (99% of users). | |
| DNS TXT only | Simplest. But blocks customers on managed hosting (Pressable, WP Engine). | |

**User's choice:** All three: DNS TXT + file + meta tag
**Notes:** Maximum flexibility. BD customers on managed WP hosting often can't edit DNS, so file/meta are essential backups.

---

### Q2: When does verification happen in the activation flow?

| Option | Description | Selected |
|--------|-------------|----------|
| Verification at activation time | One round-trip. Server fetches proof immediately. Simplest UX for plugin authors. | ✓ |
| Two-step: create pending, then verify | Plugin gets challenge, places proof, calls /verify. Better for DNS propagation delays. | |
| Pre-register domain, verify later | Customer adds domain in portal once, activates any license on it. Reusable verification. | |

**User's choice:** Verification at activation time
**Notes:** Plugin author experience is paramount. One POST, one response. DNS propagation is the customer's problem to retry — and DNS TXT typically propagates in minutes.

---

### Q3: How should the server actually fetch DNS TXT records?

| Option | Description | Selected |
|--------|-------------|----------|
| Node `dns` module (built-in) | `dns.resolveTxt()`. Zero new dependencies. Works anywhere. May inherit OS quirks. | ✓ |
| DNS-over-HTTPS (Cloudflare 1.1.1.1 or Google) | `fetch()` to DoH endpoints. Predictable. Adds external dependency. | |
| Both, with DoH fallback | Try Node `dns` first, fallback on timeout. Maximum reliability. More code. | |

**User's choice:** Node `dns` module (built-in)
**Notes:** Zero new dependencies is the right call for v1. If OS resolver quirks cause real BD customer issues, DoH fallback can be added later as a defensive enhancement.

---

### Q4: How long should verification tokens be valid?

| Option | Description | Selected |
|--------|-------------|----------|
| 24 hours, single-use | Long enough for DNS propagation. Re-issuable on expiry. Balanced security/UX. | ✓ |
| 1 hour, single-use | Forces fast action. Bad for DNS which can take 15min-1hr. | |
| Persistent (no expiry) | Token stays valid until manual rotation. Leaked token = permanent domain claim. Risky. | |

**User's choice:** 24 hours, single-use
**Notes:** 24h covers typical DNS propagation. Single-use means a re-activation always gets a fresh token.

---

## Activation Data Model

### Q1: How should activation data be stored?

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid: JSONB current + new license_activations table | Keep JSONB for fast current-state reads. New table for full history with timestamps, IP, action. Best of both. | ✓ |
| Drop JSONB, full relational only | All activation data in license_activations. Cleaner but every read needs aggregation. | |
| Keep JSONB only, no history | Sticks with current schema. Fails ACT-01 (history) and ACT-08 (suspicious detection) requirements. | |

**User's choice:** Hybrid: JSONB current + new license_activations table
**Notes:** JSONB gives O(1) read for validation API's hot path. Relational table gives the audit trail and suspicious-pattern detection surface.

---

### Q2: How should IP geolocation be determined for activation logs?

| Option | Description | Selected |
|--------|-------------|----------|
| Skip geo, log IP only | Store IP only. Investigate manually. Geo added later in Phase 19. | ✓ |
| Server-side MaxMind GeoLite2 | Bundle local DB. Fast. Requires periodic updates. ~70MB binary asset. | |
| External IP API (ipinfo.io / ipapi.co) | Fetch from API on each activation. Adds latency + external dependency. Free tier limits. | |

**User's choice:** Skip geo, log IP only
**Notes:** Phase 16 is already large. Geo adds a binary asset or external dependency we don't need yet. Defer cleanly to Phase 19.

---

### Q3: What suspicious patterns should be flagged in Phase 16 (vs deferred to Phase 19)?

| Option | Description | Selected |
|--------|-------------|----------|
| Basic threshold-based flags | 5+ IPs/24h, 3+ countries/7d (when geo added), VPN/Tor exits, plan-limit breaches. Computed at write time. | ✓ |
| No detection in Phase 16, log only | Log everything, detect nothing. Defer all pattern detection to Phase 19. | |
| Real-time alerting on every flag | Thresholds + immediate email/notification. Risk of noise during legitimate onboarding. | |

**User's choice:** Basic threshold-based flags
**Notes:** Compute flags at write time so the data is ready when Phase 19 builds the dashboard. Real-time alerts are noise-prone — let admin review flags on demand.

---

## Claude's Discretion

Areas deferred to Claude's judgment during implementation:
- Exact DB column types for `license_activations` (researcher picks Drizzle best practices)
- Sliding window rate limiter implementation (sorted set vs token bucket)
- HTTP client choice for proof fetching (native fetch preferred)
- VPN/Tor exit node list source
- Specific colors/styling for suspicious flag badges
- Application layer service structure
- Additional error code naming beyond `INVALID_LICENSE`

## Deferred Ideas

Captured in CONTEXT.md `<deferred>` section:
- Geo-IP enrichment → Phase 19
- Real-time admin alerts → Phase 19
- Cryptographic offline validation → post-MVP (DEFER-01)
- Hardware fingerprinting → post-MVP (DEFER-02)
- API versioning beyond `/v1/` → future v2
- OpenAPI/Swagger docs generation → v1 hand-written docs sufficient
- Per-product API tokens → revisit if per-license token proliferation becomes a problem
- DNS-over-HTTPS fallback for verification → add only if Node `dns` proves unreliable for BD customers
- Removing `src/lib/central-api.ts` and central fields → explicitly Phase 20
- Refactoring checkout to use `OrderCompleted` event for license generation → explicitly Phase 17
