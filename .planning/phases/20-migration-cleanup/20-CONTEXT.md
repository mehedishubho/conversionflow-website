# Phase 20: Migration & External API Removal - Context

**Gathered:** 2026-06-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Final cleanup phase — remove all remaining external API dependencies (code files, database fields, UI references, environment variables) and ensure data integrity for existing v2.x records. Standardize license key format, backfill API tokens, convert text fields to foreign keys, and replace Central API UI with local engine status.

This phase completes the v3.0 Self-Contained Licensing Architecture milestone by eliminating every trace of the external `license.devsroom.com` dependency.

**In scope:**
- Data migration: drop `centralOrderId`, `centralLicenseId`, `centralUserId` columns from database
- Foreign key conversion: `orders.productId`, `licenses.productId`, `licenses.plan` text fields → proper FK references
- API token backfill: generate `cf_live_<32>` tokens for all existing v2.x licenses with NULL `api_token_hash`
- License key standardization: regenerate all v2.x keys to Phase 16's 5-segment format (`CF-XXXX-XXXX-XXXX-XXXX-XXXX`)
- Code cleanup: delete `src/lib/central-api.ts`, remove all imports/references
- UI cleanup: remove Central API status card, replace with Local License Engine status
- Auth cleanup: remove `centralUserId` from Better Auth schema and Drizzle schema
- Invoice/billing cleanup: remove `centralOrderId` references, show only local order UUID
- Env var cleanup: startup warning for deprecated `CENTRAL_API_URL`/`CENTRAL_API_KEY`
- Migration tooling: dedicated CLI script with dry-run mode, pg_dump backup, audit logging
- Completion flag: write `phase20_migration_complete` to settings table
- Dependency cleanup: remove `nanoid` from package.json if orphaned

**NOT in scope (later phases):**
- Renewal checkout flow — future phase
- Outbound webhook delivery system — future phase
- Real-time analytics dashboard (DEFER-03) — post-MVP
- Advanced reporting with PDF exports (DEFER-05) — post-MVP

</domain>

<decisions>
## Implementation Decisions

### Data Migration Strategy
- **D-01:** Drop `centralOrderId` (orders table), `centralLicenseId` (licenses table), and `centralUserId` (user table) columns entirely. Phase 17 already did immediate cutover for new orders — these columns are historical only. No gradual rollout needed since `src/lib/central-api.ts` has zero imports and is fully orphaned.
- **D-02:** Dedicated migration CLI script (`scripts/migrate-phase20.ts`) runs verification before schema changes. Script counts records with central* values, logs counts for audit trail, then a separate Drizzle migration drops the columns. Two-step: data verification → schema change.

### Foreign Key Migration
- **D-03:** Full FK conversion in a single atomic migration: `orders.productId` text → FK to `products.id`, `licenses.productId` text → FK to `products.id`, `licenses.plan` text → FK to `product_plans.slug`. Requires data validation first (ensure all text values match existing product/plan records).
- **D-04:** Single atomic PostgreSQL transaction for the FK migration. If any step fails, the entire transaction rolls back. Data validation queries run inside the same transaction before ALTER TABLE statements.

### API Token Backfill
- **D-05:** Generate `cf_live_<32>` API tokens for ALL existing licenses with NULL `api_token_hash`. Migration script uses `crypto.randomBytes()` (same as Phase 16's `LicenseKeyGenerator`). Stores SHA-256 hash in `api_token_hash` column. Plaintext token used for notification email.
- **D-06:** Bulk email notification to each affected customer via existing Resend infrastructure. Email: "Your API Token is Ready" with token in a copy-friendly monospace block and "save this" callout. Max ~500 emails (current store count).

### License Key Standardization
- **D-07:** Regenerate ALL v2.x license keys to Phase 16's 5-segment format (`CF-XXXX-XXXX-XXXX-XXXX-XXXX`, 20-char body). Old 3-segment keys (`CF-nanoid(4)-nanoid(4)-nanoid(4)`) are replaced. No production data exists yet so this is safe. Uses `LicenseKeyGenerator` from Phase 16.

### Migration Script Execution Model
- **D-08:** Manual CLI script + Drizzle migration. Script (`scripts/migrate-phase20.ts`) handles data transforms (key regeneration, token backfill, FK data migration, verification counts). Drizzle migration handles schema changes (drop columns, add FK constraints, change column types). Script runs first, then `pnpm drizzle-kit push`.
- **D-09:** Script supports `--dry-run` flag that simulates all changes and outputs a report (record counts, columns to drop, keys to regenerate, tokens to generate) without writing to DB. Run dry-run first, review, then run without flag.

### Rollback & Safety
- **D-10:** `pg_dump` full database backup before migration. Script calls `pg_dump` programmatically and saves to `backups/pre-phase20-{timestamp}.sql`. If migration fails, restore from backup. Script requires `pg_dump` access on the execution machine.

### Migration Completion Tracking
- **D-11:** Write `phase20_migration_complete` = `true` to the `settings` table after successful migration. The app can check this on startup for health checks. Script checks it at the start to prevent accidental re-runs.

### Migration Logging
- **D-12:** Script writes a timestamped log file to `logs/phase20-migration-{ISO-timestamp}.log` with: record counts before/after, keys regenerated, tokens generated, columns dropped, FK constraints added, any errors. Full audit trail for compliance and debugging. Also outputs to stdout for real-time monitoring.

### UI & Code Cleanup
- **D-13:** Delete `src/lib/central-api.ts` entirely (already has zero imports). Remove all remaining references: PaymentSettingsForm Central API status card, admin-settings.ts centralApi config, billing page centralOrderId, invoice PDF route centralOrderId, InvoiceHTML centralOrderId display. Clean slate — no Central API traces remain.
- **D-14:** Replace the "Central Licensing API" status card in Payment Settings with a "Local License Engine" status card showing: "Active" green indicator, product name, total license count, and last health check timestamp. Reuses existing status card layout pattern from `PaymentSettingsForm.tsx`.

### Auth Schema Cleanup
- **D-15:** Clean removal of `centralUserId` from both Better Auth configuration (`src/lib/auth.ts`) and Drizzle schema (`src/lib/db/schema.ts`). The field had `input: false` — purely programmatic. Column drop included in Drizzle migration. Better Auth reads schema dynamically, no stored session migration needed.

### Invoice & Billing Updates
- **D-16:** Remove `centralOrderId` from all invoice templates and billing page references. Show only the local order UUID (`orders.id`) as the order reference. No legacy reference — clean break.

### Environment Variable Cleanup
- **D-17:** Add startup warning: if `CENTRAL_API_URL` or `CENTRAL_API_KEY` are detected in environment, log: "Central API env vars are deprecated and can be removed from your .env configuration." Helpful without breaking anything.

### Dependency Cleanup
- **D-18:** After deleting `src/lib/central-api.ts`, grep codebase for remaining `nanoid` imports. If none found, remove `nanoid` from `package.json` dependencies. Clean dependency tree.

### Claude's Discretion
- Exact CLI script structure (command pattern, argument parsing, progress reporting)
- Exact Drizzle migration file structure and ordering of schema changes
- Local License Engine status card data source (settings table vs live query)
- Email template design for API token notification
- Startup warning implementation (console.warn vs structured logging)
- Log file rotation/cleanup strategy
- Exact FK constraint options (ON DELETE CASCADE vs RESTRICT vs SET NULL)
- How to handle the pg_dump backup file location and naming

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-Level Specs
- `.planning/REQUIREMENTS.md` §"Architecture & Migration (ARCH)" — ARCH-07 (remove centralOrderId/centralLicenseId/centralUserId), ARCH-09 (migration strategy with verification, rollback, gradual rollout), ARCH-10 (preserve all existing license data)
- `.planning/PROJECT.md` §"Key Decisions" — Self-contained licensing, Modular Monolith + DDD, Service Layer, Repository Pattern
- `.planning/PROJECT.md` §"Technical Debt Accumulated" — v2.x debt items that Phase 20 resolves

### Roadmap
- `.planning/ROADMAP.md` §"Phase 20: Migration & External API Removal" — Success criteria 1-5, dependency on Phase 19

### Prior Phase Context (MUST read for integration points)
- `.planning/phases/17-billing-integration/17-CONTEXT.md` — D-10 to D-13: Central API transition decisions, central-api.ts disconnected but not deleted, central fields left NULL for Phase 17+ orders
- `.planning/phases/16-licensing-core/16-CONTEXT.md` — License key format (5-segment), API token format (cf_live_<32>), LicenseKeyGenerator, token nullable for v2.x
- `.planning/phases/15-products-context/15-CONTEXT.md` — Feature flags via JSONB, products/product_plans tables (FK targets)
- `.planning/phases/19-portal-analytics/19-CONTEXT.md` — Analytics worker, transfer system, audit patterns

### Files Being Modified (MUST read before implementation)
- `src/lib/central-api.ts` — File to DELETE (125 lines, zero imports)
- `src/lib/db/schema.ts` — Schema changes: drop centralUserId (line 124), centralOrderId (line 191), centralLicenseId (line 214); convert productId/plan to FKs
- `src/lib/auth.ts` — Remove centralUserId field (line 109, input:false)
- `src/app/(admin)/actions/admin-settings.ts` — Remove centralApi config (lines 248-250)
- `src/components/admin/PaymentSettingsForm.tsx` — Remove Central API status card (lines 467-485), replace with Local Engine status
- `src/app/(admin)/admin/settings/payment/page.tsx` — Update centralApi prop passing (line 31)
- `src/app/(portal)/dashboard/billing/[id]/page.tsx` — Remove centralOrderId references (lines 39, 97)
- `src/app/api/invoices/[id]/pdf/route.ts` — Remove centralOrderId references (lines 35, 75)
- `src/components/invoice/InvoiceHTML.tsx` — Remove centralOrderId reference (line 9)

### Phase 16 Licensing (MUST use for key/token generation)
- `src/modules/licensing/domain/services/LicenseKeyGenerator.ts` — License key generation (5-segment format)
- `src/modules/licensing/domain/valueObjects/LicenseKey.ts` — LicenseKey value object validation

### Existing Infrastructure (MUST use)
- `src/lib/redis.ts` — Redis connection
- `src/lib/audit.ts` — Audit log system
- `src/lib/emails/` — Email template patterns (Resend)
- `src/app/(admin)/actions/admin-settings.ts` — Settings upsert pattern for completion flag

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`LicenseKeyGenerator`** (`src/modules/licensing/domain/services/LicenseKeyGenerator.ts`) — Generates `CF-XXXX-XXXX-XXXX-XXXX-XXXX` keys using `crypto.randomBytes()`. Use for key standardization backfill.
- **`ProductPlan` entity** (`src/modules/products/domain/entities/ProductPlan.ts`) — Has `features: Record<string, boolean>` pattern. Migration completion flag follows similar key-value approach in settings table.
- **`admin-settings.ts`** — Settings upsert pattern for `phase20_migration_complete` flag.
- **Email system** (Resend) — Pattern in `src/lib/emails/order-confirmation.ts`. Follow for API token notification.
- **`ComponentCard`** — Admin UI component for Local License Engine status card layout.

### Established Patterns
- **Drizzle schema migrations** — Use `drizzle-kit` for schema changes. Existing SQL migrations in `src/lib/db/migrations/`.
- **Admin settings** — Key-value in `settings` table, upsert via `admin-settings.ts`.
- **Server actions** — `src/app/(admin)/actions/admin-{resource}.ts` with `requireAdmin()` guard.
- **Email notifications** — Resend-based, template in `src/lib/emails/`, called from server actions/workers.

### Integration Points
- **`scripts/migrate-phase20.ts`** — New CLI script for data migration
- **Drizzle migration** — New migration file for schema changes (drop columns, add FKs)
- **`logs/`** — New directory for migration audit logs
- **`backups/`** — New directory for pg_dump backups
- **`settings` table** — Add `phase20_migration_complete` key
- **`PaymentSettingsForm.tsx`** — Replace Central API card with Local Engine card
- **`src/lib/auth.ts`** — Remove centralUserId from user schema
- **`src/lib/db/schema.ts`** — Multiple column drops and FK additions
- **`package.json`** — Remove `nanoid` if orphaned

</code_context>

<specifics>
## Specific Ideas

- Migration script execution flow: (1) Check `phase20_migration_complete` flag — exit if already done. (2) Run `pg_dump` to `backups/pre-phase20-{timestamp}.sql`. (3) Count records with central* values, log counts. (4) Regenerate v2.x license keys using `LicenseKeyGenerator`. (5) Generate API tokens for licenses with NULL `api_token_hash`. (6) Validate FK data (ensure productId/plan values exist in target tables). (7) Write `phase20_migration_complete = true` to settings. (8) Output summary to log file and stdout.
- Drizzle migration (run AFTER script): (1) Drop `central_user_id` column from `user` table. (2) Drop `central_order_id` column from `orders` table. (3) Drop `central_license_id` column from `licenses` table. (4) Alter `orders.productId` to FK referencing `products.id`. (5) Alter `licenses.productId` to FK referencing `products.id`. (6) Alter `licenses.plan` to FK referencing `product_plans.slug`.
- Dry-run mode: Same flow as above but all DB writes replaced with console.log of what would change. Outputs: "Would regenerate N license keys", "Would generate N API tokens", "Would drop 3 columns", "Would add 3 FK constraints".
- Local License Engine status card data: Query `licenses` table for total count, `settings` for migration status. Simple card with green "Active" indicator, license count, and "Phase 20 migration: Complete" status line.
- Startup env var warning: In `src/app/layout.tsx` or a shared initialization module, check `process.env.CENTRAL_API_URL` and `process.env.CENTRAL_API_KEY`. If set, `console.warn("[DEPRECATED] Central API env vars detected...")`.
- API token notification email: Subject "Your ConversionFlow API Token is Ready". Body: customer name, license key, API token in monospace block, "Save this token — it won't be shown in email again" callout, link to portal license detail page.
- FK constraints: Use `ON DELETE RESTRICT` for products FK (can't delete a product that has orders/licenses). Use `ON DELETE CASCADE` for orders→licenses relationship (already exists).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-migration-cleanup*
*Context gathered: 2026-06-04*
