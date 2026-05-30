# Domain Pitfalls

**Domain:** Self-Contained Licensing System for SaaS Platform
**Researched:** 2026-05-29
**Confidence:** HIGH (codebase audit + existing licensing architecture analysis)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, production failures, or security breaches.

### Pitfall 1: License Key Predictability Enables Key Generators

**What goes wrong:**
When transitioning from external licensing (central API) to self-contained licensing, developers often generate license keys using predictable patterns: sequential IDs, timestamps, simple hashes of user data, or weak random number generators. Attackers reverse-engineer the key generation algorithm and create key generators (keygens) that produce valid license keys without purchasing. The existing `mockImportOrderToCentral` uses `nanoid()` which is cryptographically secure, but a custom implementation might not be.

**Why it happens:**
Developers underestimate attacker capabilities. They think "obscure" algorithms are secure. They prioritize readable/debuggable keys over security. They don't realize that key generation only needs to happen once per purchase, so performance is not an excuse for weak randomness.

**How to avoid:**
- Use cryptographically secure random number generation ONLY: `crypto.randomBytes()` in Node.js, `crypto.randomUUID()` or Web Crypto API in browser/Edge
- Never use: `Math.random()`, `Date.now()`-based seeds, sequential IDs, simple hashes, or custom algorithms
- Key format: 25-32 character alphanumeric with separators (e.g., `XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`) — NOT pattern-based like `USER-TIMESTAMP-RANDOM`
- Key entropy minimum: 128 bits of entropy (16+ cryptographically random bytes) — this makes brute-force infeasible
- Never include user-identifiable data in the key itself — store that mapping in the database
- License key uniqueness: enforce UNIQUE constraint on `licenses.licenseKey` column (already exists in schema)

**Warning signs:**
- License key contains user email, name, or sequential components visible in plaintext
- Key generation uses `Math.random()`, `Date.now()`, or custom hash functions
- Keys follow obvious patterns (every key from same day shares prefix, etc.)
- No database uniqueness constraint on license key column

**Phase to address:**
Phase 1 (Licensing Core Foundation) — key generation implementation must be security-reviewed before any licenses are issued

---

### Pitfall 2: Race Conditions in Activation/Deactivation Break Limits

**What goes wrong:**
Multiple concurrent activation requests for the same license key can exceed the `maxActivations` limit. User clicks "activate" twice rapidly → two requests hit server simultaneously → both check `currentActivations < maxActivations` before either increments → both increment → license has 2 activations when max is 1. Similarly, concurrent deactivation can go negative. The existing schema has `maxActivations` and `currentActivations` but no atomic operations protection.

**Why it happens:**
Standard read-modify-write pattern is not atomic. Developers check the count, then increment it separately. Under concurrent load, the check passes for both requests. This is a classic TOCTOU (time-of-check-to-time-of-use) vulnerability.

**How to avoid:**
- Use database-level atomic operations: `UPDATE licenses SET currentActivations = currentActivations + 1 WHERE id = ? AND currentActivations < maxActivations`
- Return affected row count — if 0 rows affected, the limit was reached, reject activation
- For PostgreSQL, use a transaction with `SELECT FOR UPDATE` to lock the license row during activation check-and-update
- Alternative: Use a separate `activations` table with one row per activation, count rows via indexed query instead of maintaining a counter
- Implement idempotency keys for activation requests — same activation request retried should not create duplicate activations

```sql
-- Atomic activation increment (PostgreSQL)
UPDATE licenses
SET currentActivations = currentActivations + 1,
    activationDomains = activation_domains || $1::jsonb
WHERE id = $2
  AND currentActivations < maxActivations
  AND NOT (activation_domains @> $1::jsonb)  -- domain not already activated
RETURNING id;

-- If no rows returned: limit exceeded OR domain already active
```

**Warning signs:**
- Activation logic: `const count = await getActivationCount(); if (count < max) await increment();` (not atomic)
- Deactivation logic allows negative counts
- No unique constraint on (licenseId, domain) combinations
- Load tests show activation count exceeds max

**Phase to address:**
Phase 1 (Licensing Core Foundation) — activation service must use atomic operations from first implementation

---

### Pitfall 3: Time-Based License Expiration Edge Cases

**What goes wrong:**
Subscription licenses expire at specific times. Multiple edge cases cause problems:
- **Timezone confusion:** Expiration stored in UTC but compared in local time, or vice versa. License "expires" at wrong time in different timezones.
- **Grace period gaps:** License expires at 00:00 UTC. User's renewal job runs at 00:15 UTC. For 15 minutes, license is invalid — validation fails, user's site breaks.
- **Clock skew:** Server clock is 30 seconds ahead of database clock. Licenses expire 30 seconds "early" randomly.
- **Midnight boundary:** License expires on day boundary. Renewal job runs at midnight. Expiration logic uses `Date.now()` vs database `expires_at` with different precision.

**Why it happens:**
Developers treat time as a simple comparison, not a distributed systems problem. They don't consider that "expired" is not binary — there should be a grace period. They don't standardize on UTC everywhere. They don't account for clock drift between servers.

**How to avoid:**
- Store ALL timestamps in UTC in database (already using `timestamp` which is timezone-aware)
- Compare using UTC only: `expiresAt < new Date()` (both in UTC)
- Implement grace period: After expiration, license remains "active" for grace period (e.g., 7 days) with status `grace_period`
- Validation logic: `status = 'active' OR (status = 'grace_period' AND expiresAt < gracePeriodEnd)`
- Renewal job: Run daily, process licenses expiring within grace period + 24 hours
- Use database server time for comparisons, not application server time: `NOW() < expires_at`
- Expiration notification: Send warnings at 30, 14, 7, 3, 1 days before expiration — include timezone in email (e.g., "expires on 2026-06-29 at 23:59 UTC")

**Warning signs:**
- License status is `expired` immediately after expiration time with no grace period
- Timezone conversion happening in application code instead of database
- Expiration comparisons use application server time instead of database time
- Support tickets: "My license said it expired today but I already renewed yesterday"

**Phase to address:**
Phase 1 (Licensing Core Foundation) — expiration service must include grace period and UTC-only logic

---

### Pitfall 4: Data Migration from External API Loses or Corrupts Data

**What goes wrong:**
Transitioning from `license.devsroom.com` to self-contained licensing requires migrating existing licenses, users, and activations. Common failures:
- **Incomplete migration:** Only migrating licenses table, not activations history. Users lose their domain activation records.
- **ID mapping loss:** Existing local records reference `centralLicenseId` and `centralOrderId`. After migration to self-contained, these foreign references break.
- **Data truncation:** Central API uses longer license keys or different plan names. Local schema truncates or rejects data.
- **Timestamp loss:** Central API has `activated_at`, `last_verified_at` timestamps. Local schema doesn't have these fields — history is lost.
- **Duplicate users:** Central API and local database both have users. Migration creates duplicates instead of merging.

**Why it happens:**
Migration is treated as an afterthought. Schema is designed without considering existing data structure. Migration script is written hastily with no rollback plan. No dry-run on production data snapshot.

**How to avoid:**
- BEFORE writing migration: Export complete data dump from central API (all tables, all fields)
- Create migration schema that extends local schema to include ALL central API fields, even those not immediately needed
- Migration plan:
  1. Add new columns to local tables for any central API fields not present
  2. Create `licenses_migration` temp table to central API data for verification
  3. Run data import with ON CONFLICT DO UPDATE to handle duplicates
  4. Create mapping table: `central_id_map (central_license_id, local_license_id)` for rollback
  5. Verify counts: `SELECT COUNT(*) FROM licenses_migration` must equal central API count
  6. Verify data integrity: Check a sample of licenses have correct activations, plans, expiration
  7. Application switch: Change `license.devsroom.com` references to local
  8. Keep central API integration read-only for 30 days (verify migration accuracy)
  9. Remove `centralOrderId`, `centralLicenseId`, `centralUserId` columns (v3.0 requirement)

**Warning signs:**
- Migration script references only a subset of central API fields
- No dry-run on production data snapshot
- No verification step comparing source vs target counts
- No rollback plan if migration fails
- Central API integration disabled before migration verification complete

**Phase to address:**
Phase 1 (Licensing Core Foundation) — migration strategy must be designed before schema is finalized

---

### Pitfall 5: Activation Domain Bypass via Header Manipulation

**What goes wrong:**
License activation validates the requesting domain by checking HTTP headers (`Host`, `Origin`, `Referer`). Attackers forge these headers to activate a license on any domain. The plugin sends activation request with custom header claiming domain is `attacker-site.com`. Server accepts it without verification. Now license is "activated" on attacker's domain.

**Why it happens:**
Developers trust client-provided data. They don't realize HTTP headers are trivial to forge. They think "the plugin will send correct headers" but attacker-controlled plugins can send anything.

**How to avoid:**
- NEVER trust HTTP headers for domain validation
- Require DNS verification: License activation must be confirmed by DNS TXT record on the domain
- Alternative: Upload verification file to domain root (e.g., `conversionflow-license-verification.txt`)
- Or: Use meta tag verification (like Google Search Console)
- Activation flow:
  1. User requests activation for `example.com` from admin dashboard
  2. System generates verification token
  3. User adds DNS TXT record: `conversionflow-verify=token` on `example.com`
  4. User clicks "Verify" in dashboard
  5. System makes DNS lookup to verify TXT record exists
  6. Only after verification, `example.com` added to `activationDomains`

**Warning signs:**
- Activation logic reads domain from `headers.host` or `headers.origin` without verification
- No DNS, file, or meta tag verification step
- Plugin sends activation request with self-reported domain
- Activation UI: "Enter domain to activate" with instant success

**Phase to address:**
Phase 1 (Licensing Core Foundation) — domain verification must be designed before activation service is built

---

### Pitfall 6: License Validation Bypass via Caching

**What goes wrong:**
To improve performance, license validation results are cached in Redis with long TTL. Attacker purchases license, validates successfully, result cached for 1 hour. Attacker then cancels purchase (chargeback), admin revokes license. But validation still returns cached "valid" result for remaining cache duration. Attacker continues using plugin for free.

**Why it happens:**
Developers optimize for performance without considering cache invalidation. They set long TTLs to reduce database load. They don't invalidate cache on license status changes.

**How to avoid:**
- Cache TTL should be short: 5-15 minutes maximum for license validation
- On license status change (revoke, suspend, expire), invalidate cache immediately: `DEL license:validation:{licenseKey}`
- Use cache-aside pattern correctly: Check cache, if miss, load from DB, write to cache
- Cache key MUST include license status version: `license:{licenseKey}:v{version}` where version increments on any change
- For high-security operations (plugin loading every request), consider shorter TTL (1-5 minutes)
- Implement cache warming: Pre-load frequently accessed licenses into cache after status changes

```typescript
// Correct caching pattern
async function validateLicense(key: string) {
  const cached = await redis.get(`license:validate:${key}`);
  if (cached) return JSON.parse(cached);

  const license = await db.query.licenses.findFirst({
    where: eq(licenses.licenseKey, key)
  });

  const result = { valid: license?.status === 'active', expiresAt: license?.expiresAt };
  await redis.setex(`license:validate:${key}`, 300, JSON.stringify(result)); // 5 min TTL

  return result;
}

// On license revoke
async function revokeLicense(licenseId: string) {
  await db.update(licenses).set({ status: 'revoked' }).where(eq(licenses.id, licenseId));
  const license = await db.query.licenses.findFirst({ where: eq(licenses.id, licenseId) });
  await redis.del(`license:validate:${license.licenseKey}`); // Invalidate cache
}
```

**Warning signs:**
- Cache TTL > 1 hour for license validation
- No cache invalidation on license status changes
- No cache key versioning
- License status changes don't trigger cache delete

**Phase to address:**
Phase 2 (License Validation Service) — caching strategy must include invalidation logic

---

### Pitfall 7: Public License Validation API Has No Rate Limiting

**What goes wrong:**
License validation endpoint (`/api/licenses/validate?key=XXX`) is public — plugins call it to verify licenses. Without rate limiting, attacker can:
- Enumerate all license keys via brute force
- Check if specific email has license by trying key patterns
- DoS the database by flooding validation requests
- Extract license metadata from error responses (different errors for "not found" vs "expired")

**Why it happens:**
Developers think "only legitimate plugins will call this endpoint." They don't consider that the endpoint is publicly accessible. Rate limiting is treated as nice-to-have, not essential.

**How to avoid:**
- Implement aggressive rate limiting: 100 requests per minute per IP, 1000 per hour per IP
- Use Redis-based rate limiting for distributed systems
- Return identical error for all failures: "Invalid license key" (not "expired", "revoked", "not found")
- Require API key for validation endpoint: Plugins include their own API key
- Log suspicious patterns: Repeated failed validations from same IP, key enumeration attempts
- Consider implementing validation token system: Plugin receives short-lived validation token, uses token for subsequent requests

```typescript
// Rate limiting middleware for license validation
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
});

export async function validateLicenseApi(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Validation logic...
  return Response.json({ valid: true });
}
```

**Warning signs:**
- `/api/licenses/validate` has no rate limiting middleware
- Error messages reveal license state (expired vs revoked vs not found)
- No API key requirement for public validation endpoint
- No logging of validation failures

**Phase to address:**
Phase 2 (License Validation Service) — rate limiting must be implemented before public API is exposed

---

### Pitfall 8: Offline License Activation Creates Replay Attack Vector

**What goes wrong:**
To support offline environments (intranet, air-gapped servers), system implements offline license activation. User downloads "license file" containing signed license data. Plugin validates license file locally without server contact. Attacker extracts license file, shares it publicly. Everyone can use same license offline indefinitely. Server never knows license is being used by thousands of installations.

**Why it happens:**
Developers prioritize user convenience (offline use) over security. They don't realize that offline licenses cannot be reliably revoked or limited. They think "signing the file is enough" but don't prevent file sharing.

**How to avoid:**
- If offline licenses are required, implement strict limitations:
  - Offline license must include hardware fingerprint (binds to specific machine)
  - Offline license expires quickly (e.g., 30 days max) — requires renewal
  - Offline license requires online activation first (establish trust, then allow offline grace period)
  - Implement "phone home" where possible — license validates on next online contact
  - Use asymmetric encryption: License file signed with private key, plugin verifies with public key
- Best approach: Don't support offline licenses. Require online validation. For customers with strict security requirements, offer on-prem licensing server option.

**Warning signs:**
- Offline license activation available with no machine binding
- License file doesn't expire or has very long expiration
- No mechanism to revoke offline licenses
- License file contains all data in plaintext except signature

**Phase to address:**
Phase 2 (License Validation Service) — offline activation decision must be made before validation service is built

---

## Moderate Pitfalls

### Pitfall 9: Subscription Status Ambiguity During Payment Processing

**What goes wrong:**
User's subscription is processing renewal. Payment gateway sends "pending" webhook. License status is ambiguous — is it active or expired? User's plugin checks license during this window and gets "expired" — user's site goes down temporarily. Payment completes 10 minutes later but damage done.

**Why it happens:**
Subscription status is binary (active/expired) but payment is multi-state (pending/processing/completed/failed). Developers don't account for intermediate payment states.

**How to avoid:**
- Implement grace period (see Pitfall 3)
- Add subscription status enum: `active`, `expiring_soon`, `grace_period`, `expired`, `suspended`, `cancelled`
- Payment processing state: Subscription remains `active` during payment processing
- Webhook handler: When payment "pending" received, extend license by 7 days to cover processing time
- On payment completion: Adjust expiration to correct end date

**Phase to address:**
Phase 2 (Subscription Management)

---

### Pitfall 10: License Transfer Not Implemented Causes Support Burden

**What goes wrong:**
Customer sells their business or changes domains. Wants to transfer license to new owner or new domain. System has no license transfer mechanism. Support has to manually edit database. Customer waits hours/days. Support burden increases.

**Why it happens:**
Developers focus on initial purchase flow. They don't consider post-purchase scenarios like ownership transfer, domain changes, plan upgrades.

**How to avoid:**
- Implement self-service license transfer in customer dashboard
- Domain transfer: Deactivate old domain, activate new domain (within limits, e.g., max 2 transfers per month)
- Ownership transfer: Generate transfer code, recipient enters code, license moves to their account
- Audit log: Record all transfers for fraud detection

**Phase to address:**
Phase 3 (Customer Portal Enhancements)

---

### Pitfall 11: No Audit Trail for License Operations

**What goes wrong:**
Admin notices license count is wrong. Customer claims they never deactivated certain domains. No audit trail exists. Cannot determine what happened, when, or who did it. Dispute resolution impossible.

**Why it happens:**
Developers implement write operations without logging. They think "database is source of truth" but don't consider that audit log is essential for operations.

**How to avoid:**
- Log ALL license operations: activation, deactivation, renewal, transfer, revocation, status change
- Include: timestamp, actor (user_id or system), action, old_state, new_state, ip_address
- Store in `audit_logs` table (already exists in schema)
- Display audit trail in admin license detail view
- Implement immutable audit log (once written, cannot be deleted)

**Phase to address:**
Phase 1 (Licensing Core Foundation)

---

### Pitfall 12: Performance Degradation at Scale

**What goes wrong:**
License validation is called on EVERY plugin load (every page load on customer site). At 1000 active installations, that's potentially millions of validations per day. Database cannot keep up. Validation becomes slow. Customer sites experience lag. Database CPU spikes.

**Why it happens:**
Developers test with 10-100 licenses. They don't consider validation will be called millions of times per day in production. They don't implement caching or read replicas.

**How to avoid:**
- Use Redis caching (5-15 minute TTL, see Pitfall 6)
- Implement read replica: Validation queries hit read replica, not primary DB
- Consider CDN edge validation: Deploy validation endpoint to edge (Cloudflare Workers, Vercel Edge) with cached results
- Batch validation: Plugin validates once per session, not on every page load
- Monitor validation request rate: Set up alerts when request rate exceeds expected

**Phase to address:**
Phase 2 (License Validation Service) — performance testing must include load test with 10K+ concurrent validations

---

## Minor Pitfalls

### Pitfall 13: License Key Format Changes Break Backward Compatibility

**What goes wrong:**
Self-contained system uses different license key format than central API. Old licenses from central API stop working. Customer has to purchase new license. Massive support burden. Customer churn.

**How it happens:**
Developers redesign license key format without considering existing licenses. They think "new system, new format" but forget backward compatibility.

**How to avoid:**
- Accept both old and new license key formats in validation endpoint
- Migration: Rewrite old licenses to new format gradually
- Deprecation timeline: Support old format for minimum 12 months
- Communication: Email customers about migration timeline

**Phase to address:**
Phase 1 (Licensing Core Foundation)

---

### Pitfall 14: Hard-Coded Activation Limits Per Plan

**What goes wrong:**
Activation limits (1, 3, 5 domains) are hard-coded in validation logic. Product team wants to change limits. Code change required. Deployment needed. Customer waiting.

**How it happens:**
Developers store limits as constants or if/else logic. They don't make it configurable.

**How to avoid:**
- Store activation limits in `product_plans` table
- Validation reads limit from database: `maxActivations = license.plan.maxActivations`
- Admin UI to edit plan limits without deployment
- Migration: Update existing licenses to use new limits

**Phase to address:**
Phase 1 (Licensing Core Foundation)

---

### Pitfall 15: Missing License Expiration Notifications

**What goes wrong:**
Customer's license expires. They didn't know. Their site breaks. They submit angry support ticket. Churn increases.

**How it happens:**
Developers implement expiration logic but forget notification system.

**How to avoid:**
- Background job runs daily: Find licenses expiring in 30/14/7/3/1 days
- Send email notifications (use notification system from v2.0)
- Dashboard banner: Show expiring licenses prominently
- Grace period: Give 7-day grace period after expiration (see Pitfall 3)

**Phase to address:**
Phase 2 (Subscription Management)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Phase 1: Licensing Core Foundation** | Key predictability (P1), Race conditions (P2), Timezone issues (P3), Data migration (P4) | Use crypto.randomBytes, atomic DB operations, UTC-only with grace period, dry-run migration with verification |
| **Phase 2: License Validation Service** | Cache bypass (P6), No rate limiting (P7), Offline replay (P8) | Short TTL with invalidation, aggressive rate limiting, avoid offline activation or implement machine binding |
| **Phase 3: Customer Portal Enhancements** | No transfer mechanism (P10), Missing notifications (P15) | Self-service domain/ownership transfer, expiration email sequence with dashboard banner |
| **Phase 4: Admin Dashboard Enhancements** | No audit trail (P11) | Immutable audit log with admin view |
| **All Phases** | Performance issues (P12) | Redis caching, read replica, edge deployment, load testing |

---

## Integration Pitfalls (Adding Licensing to Existing SaaS)

### Pitfall 16: Auth-License ID Mapping Drift

**What goes wrong:**
Existing SaaS has `users` table from Better Auth. New licensing system creates `licenses` table. Mapping between users and licenses is via `userId` foreign key. But existing `centralUserId` field was used for central API mapping. After migration to self-contained, `centralUserId` is removed (v3.0 requirement). If migration isn't perfect, licenses become orphaned (userId references non-existent user) or users lose their licenses.

**Why it happens:**
Schema changes don't account for existing data relationships. Migration script doesn't verify referential integrity.

**How to avoid:**
- Before removing `centralUserId`, create mapping: `userId -> licenseId` via `orders` table
- Verification query: `SELECT COUNT(*) FROM licenses WHERE userId NOT IN (SELECT id FROM user)` should return 0
- Add foreign key constraint: `licenses.userId REFERENCES user(id) ON DELETE CASCADE` (already using references but need to verify behavior)
- If foreign key fails, fix data before constraint is enforced
- After migration successful, remove `centralOrderId`, `centralLicenseId`, `centralUserId` columns

**Phase to address:**
Phase 1 (Licensing Core Foundation)

---

### Pitfall 17: Dual License Status During Migration

**What goes wrong:**
During migration from central API to self-contained, both systems are active simultaneously. A license shows as "active" in central API but "expired" in local system (or vice versa). Customer sees conflicting information. Validation returns different results depending on which system is queried.

**Why it happens:**
Migration is not atomic. Data is copied but not verified. System switches to local queries before migration is complete.

**How to avoid:**
- Implement feature flag: `USE_LOCAL_LICENSING=false` during migration
- Migration steps:
  1. Copy all data from central API to local
  2. Verify counts match (read-only query to central API)
  3. Run dual-validation: Both systems return same result for sample licenses
  4. Enable feature flag: Route 10% of traffic to local, monitor
  5. Gradual rollout: 25%, 50%, 100%
  6. Full cutover: All traffic to local, central API read-only
  7. Keep central API integration for 30 days for rollback
  8. Remove central API integration

**Phase to address:**
Phase 1 (Licensing Core Foundation)

---

### Pitfall 18: License Intelligence Queries Without Indexing

**What goes wrong:**
Admin dashboard has license intelligence feature (already exists in v2.0). It queries `licenses` table for counts, renewal rates, expiring soon, etc. Without proper indexes, these queries slow down as license count grows. Dashboard takes 10+ seconds to load. Database CPU spikes.

**Why it happens:**
Developers test with 100-1000 licenses. At 10K+ licenses, queries slow down.

**How to avoid:**
- Add indexes on: `status`, `expiresAt`, `(status, expiresAt)` composite, `plan`, `productId`
- Use materialized views for aggregate queries (license counts by status, renewal rate)
- Cache dashboard data: Refresh every 5-15 minutes via background job
- Lazy load: Load overview metrics first (fast), load detailed charts asynchronously

**Required indexes:**
```sql
CREATE INDEX idx_licenses_status ON licenses(status);
CREATE INDEX idx_licenses_expires_at ON licenses(expires_at);
CREATE INDEX idx_licenses_status_expires_at ON licenses(status, expires_at);  -- For "expiring soon" queries
CREATE INDEX idx_licenses_user_id ON licenses(user_id);  -- For user's license list
CREATE INDEX idx_licenses_product_id ON licenses(product_id);  -- For product analytics
```

**Phase to address:**
Phase 4 (Admin Dashboard Enhancements)

---

## Security Checklist

Before deploying self-contained licensing system, verify:

- [ ] License key generation uses cryptographically secure random ONLY (no `Math.random()`, no timestamps)
- [ ] License keys have UNIQUE database constraint
- [ ] Activation/deactivation uses atomic database operations
- [ ] All timestamps stored and compared in UTC
- [ ] Grace period implemented for expiration (minimum 7 days)
- [ ] Domain activation requires DNS/file/meta tag verification (no header-only validation)
- [ ] License validation cache has short TTL (5-15 minutes) and invalidation on status changes
- [ ] Public validation API has aggressive rate limiting (100 req/min per IP)
- [ ] Validation API returns identical error for all failures (no information leakage)
- [ ] Audit log records ALL license operations (immutable)
- [ ] Data migration has dry-run, verification, and rollback plan
- [ ] Migration removes `centralOrderId`, `centralLicenseId`, `centralUserId` columns successfully
- [ ] Dashboard queries have proper indexes or use materialized views
- [ ] Expiration notification job runs daily
- [ ] License transfer mechanism exists (domain and ownership)
- [ ] Load test validates 10K+ concurrent validation requests

---

## Sources

- **Codebase audit:** `src/lib/central-api.ts` (existing central API integration, mock license generation with nanoid), `src/lib/db/schema.ts` (licenses table with activation tracking, maxActivations, currentActivations fields), `.env.example` (CENTRAL_API_URL, CENTRAL_API_KEY), `src/lib/auth.ts` (Better Auth integration)
- **Existing PITFALLS.md:** v2.0 licensing pitfalls (Central API SPOF, webhook security, BD payment integration) — informs migration risks
- **PROJECT.md:** v3.0 requirement to remove centralOrderId, centralLicenseId, centralUserId fields
- **Roadmap:** v2.0 phases including webhooks, background jobs, license intelligence — informs integration points

---

*Domain pitfalls research for: ConversionFlow v3.0 Self-Contained Licensing Architecture*
*Researched: 2026-05-29*
