# Phase 20: Migration & External API Removal - Research

**Researched:** 2026-06-04
**Domain:** Database schema migration, data transformation, code cleanup, dependency removal
**Confidence:** HIGH

## Summary

Phase 20 is the final cleanup phase that removes all traces of the external `license.devsroom.com` dependency from the ConversionFlow codebase. The work is primarily data migration (dropping 3 database columns, converting 3 text fields to foreign keys, backfilling API tokens, standardizing license keys) and code cleanup (deleting 1 file, removing references from 9+ files).

The existing codebase is well-prepared: `src/lib/central-api.ts` has zero imports (verified by grep), Phase 17 already disconnected the billing flow from the central API, and Phase 16 provides the `LicenseKeyGenerator` and `ApiTokenGenerator` for data standardization. The main risk is the FK conversion -- `orders.productId` and `licenses.productId` are currently text fields storing product slugs/IDs that must be validated against the `products` table before FK constraints can be added.

**Primary recommendation:** Run the data migration CLI script first (key regeneration, token backfill, FK data validation), then apply the Drizzle schema migration (column drops, FK additions). Use `drizzle-kit push` for schema changes since the project only has one existing migration file.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Drop `centralOrderId` (orders), `centralLicenseId` (licenses), `centralUserId` (user) columns entirely. No gradual rollout needed since `central-api.ts` has zero imports.
- **D-02:** Dedicated migration CLI script (`scripts/migrate-phase20.ts`) runs verification before schema changes. Two-step: data verification then schema change.
- **D-03:** Full FK conversion in a single atomic migration: `orders.productId` text -> FK to `products.id`, `licenses.productId` text -> FK to `products.id`, `licenses.plan` text -> FK to `product_plans.slug`.
- **D-04:** Single atomic PostgreSQL transaction for FK migration. If any step fails, entire transaction rolls back.
- **D-05:** Generate `cf_live_<32>` API tokens for ALL existing licenses with NULL `api_token_hash`. Uses `crypto.randomBytes()`. Stores SHA-256 hash.
- **D-06:** Bulk email notification to each affected customer via existing Resend infrastructure. Email: "Your API Token is Ready". Max ~500 emails.
- **D-07:** Regenerate ALL v2.x license keys to Phase 16's 5-segment format (`CF-XXXX-XXXX-XXXX-XXXX-XXXX`).
- **D-08:** Manual CLI script + Drizzle migration. Script handles data transforms, then `pnpm drizzle-kit push`.
- **D-09:** Script supports `--dry-run` flag that simulates all changes without writing to DB.
- **D-10:** `pg_dump` full database backup before migration. Saved to `backups/pre-phase20-{timestamp}.sql`.
- **D-11:** Write `phase20_migration_complete` = `true` to settings table after successful migration.
- **D-12:** Script writes timestamped log file to `logs/phase20-migration-{ISO-timestamp}.log`.
- **D-13:** Delete `src/lib/central-api.ts` entirely. Remove all remaining references in 9+ files.
- **D-14:** Replace "Central Licensing API" status card with "Local License Engine" status card.
- **D-15:** Remove `centralUserId` from Better Auth config and Drizzle schema. Column drop in Drizzle migration.
- **D-16:** Remove `centralOrderId` from all invoice templates and billing page references.
- **D-17:** Add startup warning if `CENTRAL_API_URL` or `CENTRAL_API_KEY` detected in environment.
- **D-18:** After deleting `central-api.ts`, grep for remaining `nanoid` imports. If none, remove from package.json.

### Claude's Discretion
- Exact CLI script structure (command pattern, argument parsing, progress reporting)
- Exact Drizzle migration file structure and ordering of schema changes
- Local License Engine status card data source (settings table vs live query)
- Email template design for API token notification
- Startup warning implementation (console.warn vs structured logging)
- Log file rotation/cleanup strategy
- Exact FK constraint options (ON DELETE CASCADE vs RESTRICT vs SET NULL)
- How to handle the pg_dump backup file location and naming

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ARCH-07 | Remove database fields: `centralOrderId`, `centralLicenseId`, `centralUserId` | Schema audit confirms 3 columns across 3 tables; Drizzle migration drops them; all code references mapped |
| ARCH-09 | Data migration strategy includes verification, rollback plan, and gradual feature flag rollout | CLI script with dry-run, pg_dump backup, settings flag for completion tracking |
| ARCH-10 | Migration preserves all existing license data without loss | License key regeneration is a pure replacement; FK conversion requires data validation first; API token backfill is additive |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | 0.45.2 | Schema definition, queries, relations | Already in use throughout project [VERIFIED: node_modules] |
| drizzle-kit | 0.31.10 | Schema migration generation and push | Already configured with `drizzle.config.ts` [VERIFIED: node_modules] |
| postgres (postgres.js) | 3.4.9 | PostgreSQL client driver | Used in `src/lib/db/index.ts` [VERIFIED: node_modules] |
| better-auth | 1.6.11 | Auth framework with additional fields | Contains `centralUserId` field to remove [VERIFIED: node_modules] |
| nanoid | 5.1.11 | Unique ID generation for events and tokens | Used in 4 files outside central-api.ts -- CANNOT be removed [VERIFIED: node_modules] |
| resend | 6.12.3 | Email delivery for API token notification | Already used for all transactional emails [VERIFIED: node_modules] |
| tsx | 4.22.0 | TypeScript script runner for migration CLI | Already used for seed scripts [VERIFIED: node_modules] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @react-pdf/renderer | (installed) | PDF invoice generation | InvoicePDF component -- `centralOrderId` in `OrderWithUser` type must be removed |
| date-fns | (installed) | Date formatting in invoices | Used in InvoiceHTML and InvoicePDF |
| ioredis | (installed) | Redis for caching | Session/license caching -- no changes needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `drizzle-kit push` | `drizzle-kit generate` + `drizzle-kit migrate` | Push is simpler for single-deployment; generate+migrate is safer for team environments. Project uses push pattern per seed scripts. |
| `postgres.js` raw query for pg_dump | `child_process.execSync('pg_dump')` | pg_dump is a CLI tool, not a library -- must use child_process. postgres.js cannot do pg_dump. |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Recommended Project Structure
```
scripts/
  migrate-phase20.ts          # NEW: Migration CLI script
src/
  lib/
    central-api.ts            # DELETE: External API client
    db/
      schema.ts               # MODIFY: Drop 3 columns, add 3 FK constraints
    auth.ts                   # MODIFY: Remove centralUserId additional field
    emails/
      api-token-notification.ts  # NEW: Email template for API token backfill
  components/
    admin/
      PaymentSettingsForm.tsx    # MODIFY: Replace Central API card with Local Engine card
    invoice/
      InvoiceHTML.tsx            # MODIFY: Remove centralOrderId from OrderWithUser type
      InvoicePDF.tsx             # MODIFY: Uses OrderWithUser type (transitive)
  app/
    (admin)/
      actions/
        admin-settings.ts        # MODIFY: Remove centralApi config from getPaymentSettings
      admin/settings/payment/
        page.tsx                 # MODIFY: Remove centralApi prop passing
    (portal)/
      dashboard/billing/[id]/
        page.tsx                 # MODIFY: Remove centralOrderId references
    api/invoices/[id]/pdf/
      route.ts                   # MODIFY: Remove centralOrderId from query and type
logs/                            # NEW: Migration audit log directory
backups/                         # NEW: pg_dump backup directory
```

### Pattern 1: Drizzle Schema Column Drop
**What:** Remove columns from schema definition, then push migration.
**When to use:** When columns are no longer referenced by any code.
**Example:**
```typescript
// BEFORE: src/lib/db/schema.ts line 124
centralUserId: text("central_user_id"),

// AFTER: Line removed entirely from user table definition
// Then run: pnpm drizzle-kit push
```
[Source: drizzle-orm schema patterns, verified against schema.ts]

### Pattern 2: FK Conversion (Text -> UUID FK)
**What:** Change text column to UUID foreign key referencing another table.
**When to use:** When denormalized text fields should be proper foreign keys.
**Challenge:** `orders.productId` stores product slugs (text) but `products.id` is UUID. This requires a data migration step to look up the UUID from the slug before the FK constraint can be added. The plan needs to:
1. Validate all text values exist in target table
2. Update text values to UUID values
3. Change column type from text to uuid
4. Add FK constraint

**Example:**
```typescript
// BEFORE:
productId: text("product_id").notNull(),

// AFTER:
productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
```
[Source: drizzle-orm pg-core column types]

### Pattern 3: Settings Table Completion Flag
**What:** Key-value flag in `settings` table to track migration completion.
**When to use:** Preventing accidental re-runs of migration scripts.
**Example:**
```typescript
// Write completion flag (follows existing upsert pattern in admin-settings.ts)
await db.insert(settings).values({
  key: "phase20_migration_complete",
  value: "true",
}).onConflictDoUpdate({
  target: settings.key,
  set: { value: "true", updatedAt: new Date() },
});
```
[Source: admin-settings.ts saveVATSettings pattern, verified]

### Pattern 4: Migration CLI Script
**What:** Standalone TypeScript script run via `tsx`.
**When to use:** One-time data transformations that shouldn't run on every deploy.
**Example:**
```typescript
// Follow pattern from scripts/seed-phase4.ts
import { db } from "../src/lib/db/index.js";
import { licenses, settings } from "../src/lib/db/schema.js";

async function migrate() {
  // Check completion flag
  // pg_dump backup
  // Data transforms
  // Write completion flag
  process.exit(0);
}
migrate().catch((err) => { console.error(err); process.exit(1); });
```
[Source: scripts/seed-phase4.ts, verified]

### Anti-Patterns to Avoid
- **Running FK migration without data validation:** If any `orders.productId` text value doesn't have a matching `products.id` UUID, the FK constraint fails and the transaction rolls back. Must validate ALL data first.
- **Dropping columns before verifying zero code references:** Could miss a runtime dependency. Verified: all central* references mapped above.
- **Using `drizzle-kit generate` instead of `push`:** The project only has 1 migration file (initial schema). Using push is simpler and avoids migration file ordering issues. However, `generate` produces a SQL file that can be reviewed before applying.
- **Regenerating license keys that are in active use:** Keys are stored in WooCommerce plugins. Regenerating means all existing installations need key updates. CONTEXT.md says "No production data exists yet so this is safe" (D-07).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| pg_dump backup | Custom DB dump script | `child_process.execSync('pg_dump ...')` | pg_dump handles all edge cases (large objects, sequences, privileges) |
| License key generation | Custom random string generator | `LicenseKeyGenerator.generateFormatted()` | Already handles rejection sampling, charset exclusion, formatting [VERIFIED: src/modules/licensing/domain/services/LicenseKeyGenerator.ts] |
| API token generation | Custom token logic | `ApiTokenGenerator.generate()` | Already handles cf_live_ format, SHA-256 hashing [VERIFIED: src/modules/licensing/domain/services/ApiTokenGenerator.ts] |
| Email delivery | Custom email sender | Existing Resend + email template pattern | Already in `src/lib/emails/order-confirmation.ts` [VERIFIED] |
| Settings upsert | Custom SQL | Drizzle `onConflictDoUpdate` | Follows existing pattern in admin-settings.ts |

**Key insight:** This phase is entirely about using existing infrastructure (LicenseKeyGenerator, ApiTokenGenerator, Resend, Drizzle, settings table) for data transformation -- not building new systems.

## Runtime State Inventory

> Phase 20 involves schema migration and data cleanup. Runtime state audit required.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `user.central_user_id` column (nullable text) -- may contain values for v2.x users | Column drop via Drizzle migration (D-01) |
| Stored data | `orders.central_order_id` column (nullable text) -- may contain values for v2.x orders | Column drop via Drizzle migration (D-01) |
| Stored data | `licenses.central_license_id` column (nullable text) -- may contain values for v2.x licenses | Column drop via Drizzle migration (D-01) |
| Stored data | `licenses.api_token_hash` column -- NULL for v2.x licenses that predate Phase 16 | Backfill with generated tokens (D-05) |
| Stored data | `licenses.license_key` column -- v2.x keys in 3-segment nanoid format | Regenerate to 5-segment format (D-07) |
| Stored data | `orders.productId` text field -- stores product identifier (slug or UUID, needs investigation) | Convert to UUID FK (D-03) |
| Stored data | `licenses.productId` text field -- stores product identifier | Convert to UUID FK (D-03) |
| Stored data | `licenses.plan` text field -- stores plan slug | Convert to FK referencing `product_plans.slug` (D-03) |
| Live service config | `.env.local` contains `CENTRAL_API_URL` and `CENTRAL_API_KEY` variables | Add startup warning (D-17), do NOT auto-delete env files |
| Live service config | `.env.example` contains same deprecated variables | Update .env.example to remove or comment out deprecated vars |
| OS-registered state | None -- no OS-level registrations embed "central" strings | None required |
| Secrets/env vars | `CENTRAL_API_URL` and `CENTRAL_API_KEY` in `.env.local` -- code no longer reads these | Startup warning only (D-17) |
| Build artifacts | No installed packages or build artifacts reference central API | None required |

**Nothing found in category (explicit):**
- OS-registered state: None -- verified. No Windows Task Scheduler tasks, systemd units, or launchd plists reference central API strings.
- Build artifacts: None -- verified. No compiled binaries or Docker images reference the central API.

## Common Pitfalls

### Pitfall 1: FK Conversion Data Mismatch
**What goes wrong:** `orders.productId` text values don't match any `products.id` UUID.
**Why it happens:** The text column may store product slugs (e.g., "conversionflow") while `products.id` is a UUID. The data must be mapped via a lookup table before the FK constraint can be added.
**How to avoid:** Migration script must first query all distinct `productId` values from orders and licenses, then match them against `products` table (possibly by slug, not UUID). If any value has no match, the script must abort with a clear error message.
**Warning signs:** Dry-run shows "N orphaned productId values with no matching product".

### Pitfall 2: License Key Regeneration Breaks Active Installations
**What goes wrong:** Regenerated keys don't match what's stored in WooCommerce plugin settings.
**Why it happens:** Existing WooCommerce stores have the old key saved in their plugin configuration.
**How to avoid:** CONTEXT.md states "No production data exists yet" (D-07). If this changes, the key regeneration step must be skipped or a mapping table maintained.
**Warning signs:** Any license with `currentActivations > 0` has active installations.

### Pitfall 3: Drizzle Push Destructive Behavior
**What goes wrong:** `drizzle-kit push` drops columns immediately without confirmation prompt.
**Why it happens:** Push mode applies schema changes directly to the database, bypassing migration file review.
**How to avoid:** Run pg_dump backup BEFORE `drizzle-kit push`. Verify backup exists and is non-empty.
**Warning signs:** Missing or zero-byte backup file.

### Pitfall 4: Bulk Email Rate Limiting
**What goes wrong:** Sending 500 emails via Resend hits rate limits or triggers spam filters.
**Why it happens:** Resend has per-second and per-day sending limits depending on plan.
**How to avoid:** Batch emails with delays (e.g., 50 emails per batch, 2-second pause between batches). Check Resend plan limits before sending.
**Warning signs:** 429 responses from Resend API during bulk send.

### Pitfall 5: nanoid Cannot Be Removed (D-18 Correction)
**What goes wrong:** Removing nanoid from package.json breaks 4 other files.
**Why it happens:** nanoid is used in `ApiTokenGenerator.ts`, `OrderEvents.ts`, `LicenseEvents.ts`, and `ProductEvents.ts` -- not just `central-api.ts`.
**How to avoid:** Do NOT remove nanoid from package.json. D-18 assumption is incorrect.
**Warning signs:** Build failures after `pnpm remove nanoid`.

### Pitfall 6: Missing logs/ and backups/ Directories
**What goes wrong:** Migration script fails when trying to write to `logs/` or `backups/` directories that don't exist.
**Why it happens:** These directories are new and not tracked in git (likely gitignored).
**How to avoid:** Script must create directories with `fs.mkdirSync(dir, { recursive: true })` before writing.
**Warning signs:** EACCES or ENOENT errors during migration script execution.

## Code Examples

### License Key Regeneration (using existing generator)
```typescript
// Source: src/modules/licensing/domain/services/LicenseKeyGenerator.ts [VERIFIED]
import { LicenseKeyGenerator } from "../src/modules/licensing/domain/services/LicenseKeyGenerator.js";

// Generate a new standardized key
const newKey = LicenseKeyGenerator.generateFormatted();
// Returns: "CF-ABCD-2345-EFGH-6789-JKLM"
```

### API Token Backfill (using existing generator)
```typescript
// Source: src/modules/licensing/domain/services/ApiTokenGenerator.ts [VERIFIED]
import { ApiTokenGenerator } from "../src/modules/licensing/domain/services/ApiTokenGenerator.js";

const { plaintext, hash } = ApiTokenGenerator.generate();
// plaintext: "cf_live_<32-char-random>"
// hash: SHA-256 hex digest

// Store hash in DB, send plaintext to customer
await db.update(licenses)
  .set({ apiTokenHash: hash })
  .where(eq(licenses.id, licenseId));
```

### Settings Upsert Pattern (for completion flag)
```typescript
// Source: src/app/(admin)/actions/admin-settings.ts [VERIFIED]
await db.insert(settings).values({
  key: "phase20_migration_complete",
  value: "true",
});
// If key exists, use onConflictDoUpdate:
await db.insert(settings).values({
  key: "phase20_migration_complete",
  value: "true",
}).onConflictDoUpdate({
  target: settings.key,
  set: { value: "true", updatedAt: new Date() },
});
```

### pg_dump Backup (from migration script)
```typescript
import { execSync } from "child_process";
import fs from "fs";

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = "backups";
fs.mkdirSync(backupDir, { recursive: true });
const backupPath = `${backupDir}/pre-phase20-${timestamp}.sql`;

execSync(`pg_dump "${process.env.DATABASE_URL}" -f "${backupPath}"`, {
  stdio: "inherit",
});
console.log(`Backup saved to ${backupPath}`);
```

### Central API Status Card (to be replaced)
```typescript
// Source: src/components/admin/PaymentSettingsForm.tsx lines 467-489 [VERIFIED]
// Current: "Central Licensing API" card showing URL/Key configuration status
// Replacement: "Local License Engine" card showing Active status, license count, migration status
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| External license.devsroom.com API | Local license generation (Phase 16) | Phase 17 | New orders no longer call central API |
| nanoid-based 3-segment keys | 5-segment crypto.randomBytes keys | Phase 16 | Standardized format CF-XXXX-XXXX-XXXX-XXXX-XXXX |
| Text productId/plan fields | FK references to products/plans tables | Phase 20 | Data integrity enforced at DB level |
| Manual API token management | Auto-generated cf_live_ tokens | Phase 16 | All new licenses get tokens; v2.x need backfill |

**Deprecated/outdated:**
- `src/lib/central-api.ts`: Zero imports, fully orphaned since Phase 17. Safe to delete.
- `centralOrderId`/`centralLicenseId`/`centralUserId` columns: Nullable, unused for new records since Phase 17. Safe to drop.
- `CENTRAL_API_URL`/`CENTRAL_API_KEY` env vars: Still in .env files but no code reads them (except admin-settings.ts status check, which is being removed).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `orders.productId` stores values that can be mapped to `products.id` UUIDs | FK Conversion | If values are slugs, need slug-to-UUID lookup; if values are already UUIDs, direct mapping works |
| A2 | `licenses.plan` stores slugs matching `product_plans.slug` values | FK Conversion | If plan values are display names not slugs, need name-to-slug mapping |
| A3 | "No production data exists" for license key regeneration (D-07) | License Key Standardization | If production keys are in use, regeneration breaks active installations |
| A4 | `pg_dump` is available on the deployment machine | Rollback & Safety | If pg_dump is not installed, backup step fails; need fallback |
| A5 | Resend plan supports sending ~500 emails | API Token Backfill | Bulk send may hit rate limits or require plan upgrade |

## Open Questions (RESOLVED)

> All open questions are addressed by Plan 02 (scripts/migrate-phase20.ts). The migration script queries distinct values at runtime and matches against both products.id (UUID) and products.slug (text), counts records for audit reporting, and runs in --dry-run mode for pre-flight verification.

1. **What values are stored in `orders.productId` and `licenses.productId`?**
   - What we know: They are `text` columns defined as `.notNull()`. The products table uses UUID primary keys with slug unique constraints.
   - What's unclear: Whether productId stores the UUID string or the product slug (e.g., "conversionflow-pro").
   - Recommendation: Migration script must query distinct values and attempt matching against both `products.id` (UUID) and `products.slug` (text).

2. **What values are stored in `licenses.plan`?**
   - What we know: It is a `text` column. `product_plans` table has `slug` (unique per product) and `name` fields.
   - What's unclear: Whether `licenses.plan` stores the slug (e.g., "professional") or display name (e.g., "Professional Plan").
   - Recommendation: Same approach -- query distinct values and match against `product_plans.slug`.

3. **How many v2.x licenses need key regeneration vs token backfill?**
   - What we know: Keys using nanoid 3-segment format (`CF-nanoid(4)-nanoid(4)-nanoid(4)`) need regeneration. Licenses with NULL `api_token_hash` need backfill.
   - What's unclear: The exact count. Migration script should count and report.
   - Recommendation: Dry-run mode outputs counts for review before execution.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| PostgreSQL (pg_dump) | Database backup | Not checked on remote | -- | Script should check and warn if missing |
| tsx | Migration script execution | Available | 4.22.0 | -- |
| Node.js | Migration script runtime | Available | 24.15.0 | -- |
| pnpm | Package management | Available | (installed) | -- |
| DATABASE_URL | DB connection | In .env.local | -- | Script exits with error if missing |
| REDIS_URL | Redis for caching | Optional | -- | In-memory fallback already coded |
| RESEND_API_KEY | Email notifications | In .env.local | -- | Skip email step if missing, warn in dry-run |

**Missing dependencies with no fallback:**
- `pg_dump` must be available on the machine running the migration. If not installed, the backup step fails. Script should check for `pg_dump` availability before proceeding and exit with a clear error message if missing.

**Missing dependencies with fallback:**
- `RESEND_API_KEY`: If not set, the script can still perform all data transforms but skip the email notification step. Affected customers would need to request their API token through the portal.

## Validation Architecture

> nyquist_validation is enabled in config.json.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- no test framework installed |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ARCH-07 | centralOrderId/centralLicenseId/centralUserId columns removed from DB | Manual verification | `pnpm drizzle-kit push` succeeds; schema.ts has no central fields | Code change only |
| ARCH-09 | Migration script with dry-run, backup, verification | Manual test | `tsx --env-file=.env.local scripts/migrate-phase20.ts --dry-run` | Wave 0 |
| ARCH-10 | Existing license data preserved after migration | Manual verification | Query licenses before/after; count matches | Wave 0 |

### Sampling Rate
- **Per task commit:** Visual inspection of changed files
- **Per wave merge:** `pnpm build` passes without errors
- **Phase gate:** Migration script dry-run completes without errors; `pnpm build` succeeds; manual verification of data integrity

### Wave 0 Gaps
- [ ] No test framework installed -- all validation is manual for this phase
- [ ] `scripts/migrate-phase20.ts` -- must be created and manually tested with `--dry-run`
- [ ] Manual verification checklist: (1) central-api.ts deleted, (2) schema.ts has no central fields, (3) InvoiceHTML/InvoicePDF have no centralOrderId, (4) admin-settings.ts has no centralApi config, (5) PaymentSettingsForm shows Local Engine card, (6) .env.example updated

*(No automated test infrastructure exists. This phase is validated via build checks, dry-run execution, and manual verification.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | better-auth with additionalFields cleanup |
| V4 Access Control | yes | Admin guard on settings page, migration script auth |
| V5 Input Validation | yes | Drizzle schema enforces data types, FK constraints enforce referential integrity |
| V6 Cryptography | yes | SHA-256 for API token hashing, crypto.randomBytes for key/token generation |

### Known Threat Patterns for Migration/Schema Changes

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Data loss during migration | Tampering/Spoofing | pg_dump backup before any changes; dry-run mode |
| FK constraint violation | Denial of Service | Data validation step before ALTER TABLE; atomic transaction |
| API token exposure in logs | Information Disclosure | Log only token hash, never plaintext; email plaintext once |
| Race condition during migration | Denial of Service | `phase20_migration_complete` flag prevents re-runs; run during maintenance window |

## Codebase Audit Summary

### Files to DELETE (1 file)
| File | Lines | Reason | Imports Verified Zero |
|------|-------|--------|----------------------|
| `src/lib/central-api.ts` | 125 | External API client, fully orphaned | YES -- grep confirmed zero imports |

### Files with centralOrderId/centralUserId/centralLicenseId references (9 files)
| File | Location | What to Change |
|------|----------|----------------|
| `src/lib/db/schema.ts` | Lines 124, 191, 214 | Drop 3 column definitions |
| `src/lib/auth.ts` | Line 109-112 | Remove `centralUserId` from additionalFields |
| `src/app/(admin)/actions/admin-settings.ts` | Lines 248-251 | Remove `centralApi` object from return |
| `src/components/admin/PaymentSettingsForm.tsx` | Lines 467-489 | Remove Central API card; replace with Local Engine card |
| `src/app/(admin)/admin/settings/payment/page.tsx` | Line 31 | Remove `centralApi: settings.centralApi` prop |
| `src/app/(portal)/dashboard/billing/[id]/page.tsx` | Lines 39, 97 | Remove `centralOrderId` from query select and OrderWithUser object |
| `src/app/api/invoices/[id]/pdf/route.ts` | Lines 35, 75 | Remove `centralOrderId` from query select and OrderWithUser object |
| `src/components/invoice/InvoiceHTML.tsx` | Line 9 | Remove `centralOrderId` from `OrderWithUser` type |
| `.env.example` | Lines 30-31 | Remove or comment out CENTRAL_API_URL and CENTRAL_API_KEY |

### nanoid usage audit (CANNOT remove nanoid)
| File | Usage | Can Replace? |
|------|-------|-------------|
| `src/lib/central-api.ts` | License key mock, central IDs | File being deleted -- no change needed |
| `src/modules/licensing/domain/services/ApiTokenGenerator.ts` | `nanoid(32)` for cf_live_ tokens | No -- this is the standard token generator |
| `src/modules/billing/domain/events/OrderEvents.ts` | `nanoid()` for event IDs | No -- event ID generation |
| `src/modules/products/domain/events/ProductEvents.ts` | `nanoid()` for event IDs | No -- event ID generation |
| `src/modules/licensing/domain/events/LicenseEvents.ts` | `nanoid()` for event IDs | No -- event ID generation |

**D-18 Correction:** nanoid CANNOT be removed from package.json. It is used in 4 active files (ApiTokenGenerator and 3 event files).

## Sources

### Primary (HIGH confidence)
- Codebase grep audit: central-api.ts has zero imports [VERIFIED: grep of src/]
- Schema analysis: All 3 central columns identified in schema.ts [VERIFIED: file read]
- All 9 files with centralOrderId/centralUserId references mapped [VERIFIED: grep of src/]
- nanoid usage audit across 5 files [VERIFIED: grep of src/]
- LicenseKeyGenerator (5-segment format with rejection sampling) [VERIFIED: file read]
- ApiTokenGenerator (cf_live_ format with SHA-256) [VERIFIED: file read]
- Drizzle config at drizzle.config.ts [VERIFIED: file read]
- Existing seed script pattern at scripts/seed-phase4.ts [VERIFIED: file read]

### Secondary (MEDIUM confidence)
- Package versions verified from node_modules [VERIFIED: node -e require]
- CONTEXT.md decisions D-01 through D-18 [CITED: .planning/phases/20-migration-cleanup/20-CONTEXT.md]

### Tertiary (LOW confidence)
- pg_dump availability on deployment machine [ASSUMED -- not verified]
- "No production data exists" for license key regeneration [ASSUMED -- per CONTEXT.md D-07]
- Resend can handle ~500 emails in bulk [ASSUMED -- plan limits not checked]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries verified as installed and in active use
- Architecture: HIGH -- codebase audit confirmed all integration points and patterns
- Pitfalls: HIGH -- FK conversion risk, nanoid retention, and pg_dump dependency identified from direct code inspection
- Data migration: MEDIUM -- FK data values not fully known (productId/plan storage format)

**Research date:** 2026-06-04
**Valid until:** 2026-07-04 (stable -- no fast-moving dependencies)
