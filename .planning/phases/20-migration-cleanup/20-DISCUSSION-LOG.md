# Phase 20: Migration & External API Removal - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-04
**Phase:** 20-migration-cleanup
**Areas discussed:** Data Migration Strategy, Foreign Key Migration, API Token Backfill, License Key Format, Migration Script Execution Model, Rollback and Safety, Migration Completion Tracking, Migration Logging, UI and Code Cleanup, Auth Schema Cleanup, Invoice and Billing Updates, Environment Variable Cleanup, Dependency Cleanup

---

## Data Migration Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Drop columns + verification script | Single Drizzle migration with dedicated verification script. Phase 17 already cut over, fields are historical. | ✓ |
| Feature flag rollout then drop columns | Settings-based feature flag, gradual code reference removal, then column drop. | |
| Keep columns as deprecated archive | Keep nullable columns as historical archive, mark deprecated in comments. | |

**User's choice:** Drop columns + verification script
**Notes:** Phase 17 already did immediate cutover. `src/lib/central-api.ts` has zero imports. Central fields are purely historical.

---

## Verification Implementation

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated migration script | `scripts/migrate-phase20.ts` with count verification, audit logging, confirmation prompt. | ✓ |
| Inline SQL migration | Drizzle SQL migration with pre-check and ALTER TABLE in same file. | |
| Drop without verification | Just drop columns — values are meaningless now. | |

**User's choice:** Dedicated migration script

---

## Foreign Key Migration

| Option | Description | Selected |
|--------|-------------|----------|
| Full FK conversion | Convert productId/plan text fields to proper foreign keys in single atomic transaction. | ✓ |
| Add-then-swap migration | New FK columns alongside text, populate, then drop old. Safer but two passes. | |
| Skip FK — keep as text | Service layer joins correctly already. No DB-level referential integrity. | |

**User's choice:** Full FK conversion

---

## FK Migration Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Single atomic migration | All FK changes in one PostgreSQL transaction with rollback on failure. | ✓ |
| Two-phase migration | Migration A adds columns, Migration B drops old and adds constraints. | |

**User's choice:** Single atomic migration

---

## API Token Backfill

| Option | Description | Selected |
|--------|-------------|----------|
| Generate for all existing licenses | Backfill `cf_live_<32>` tokens for all NULL `api_token_hash`. Full API coverage. | ✓ |
| Lazy generation on first use | Generate tokens when first validation request arrives. | |
| On-demand via portal visit | Generate when customer visits license detail page. | |

**User's choice:** Generate for all existing licenses

---

## Token Delivery

| Option | Description | Selected |
|--------|-------------|----------|
| Bulk email notification | "Your API Token is Ready" email via Resend. ~500 emails max. | ✓ |
| Silent backfill + portal banner | Backfill silently, show banner on next login. | |
| Silent backfill, no notification | Simplest approach. Customers discover tokens in portal. | |

**User's choice:** Bulk email notification

---

## License Key Format

| Option | Description | Selected |
|--------|-------------|----------|
| Keep old keys as-is | v2.x 3-segment keys kept. Validation accepts both formats. | |
| Reformat to new 5-segment standard | Regenerate all keys to Phase 16 format. Active plugins using old keys would break. | ✓ |

**User's choice:** Reformat to new 5-segment standard
**Notes:** User clarified this is still in development — no production data exists. Safe to standardize everything.

---

## Migration Script Execution Model

| Option | Description | Selected |
|--------|-------------|----------|
| Manual CLI script + Drizzle migration | `pnpm tsx scripts/migrate-phase20.ts` then `drizzle-kit push`. | ✓ |
| Drizzle-only migration | Everything in SQL migration files. | |
| Auto-run on app startup | Script runs automatically if pending migration detected. | |

**User's choice:** Manual CLI script + Drizzle migration

---

## Rollback and Safety

| Option | Description | Selected |
|--------|-------------|----------|
| pg_dump backup before migration | Full DB backup saved to `backups/`. Restore if migration fails. | ✓ |
| Single transaction with auto-rollback | PostgreSQL transaction rollback on failure. No external backup. | |
| No backup — re-seed if fails | Development-only data, re-seed acceptable. | |

**User's choice:** pg_dump backup before migration

---

## Drizzle vs Raw SQL Split

| Option | Description | Selected |
|--------|-------------|----------|
| Script = data, Drizzle = schema | CLI handles data transforms. Drizzle handles schema changes. Clean separation. | ✓ |
| Script does everything via raw SQL | Bypasses Drizzle migration tracking. More control. | |

**User's choice:** Script handles data, Drizzle handles schema

---

## Migration Completion Flag

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add completion flag | `phase20_migration_complete = true` in settings table. Prevents re-runs. | ✓ |
| No flag — rely on idempotency | Script is safe to re-run. Detect by column presence. | |

**User's choice:** Yes, add completion flag

---

## UI and Code Cleanup Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full cleanup — remove all traces | Delete central-api.ts, remove all UI references, env var refs, invoice refs, auth schema. | ✓ |
| Mostly full, keep invoice history | Delete file and admin UI. Keep invoice centralOrderId as display-only. | |
| Minimal — just delete the file | Only delete central-api.ts. UI shows "Not Configured". | |

**User's choice:** Full cleanup — remove all traces

---

## Local License Engine Status Card

| Option | Description | Selected |
|--------|-------------|----------|
| Local License Engine status card | Replace Central API card with "Local License Engine: Active" indicator, license count, health info. | ✓ |
| Remove card, no replacement | Payment settings page becomes shorter. | |

**User's choice:** Local License Engine status card

---

## Auth Schema Cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Clean removal from both auth + schema | Remove centralUserId from Better Auth config and Drizzle schema. Better Auth reads dynamically. | ✓ |
| Remove from schema, comment in auth.ts | Drop column but leave auth.ts reference as historical comment. | |

**User's choice:** Clean removal from both auth + schema

---

## Invoice and Billing Updates

| Option | Description | Selected |
|--------|-------------|----------|
| Local order UUID only | Remove centralOrderId from invoices. Show only orders.id. | ✓ |
| UUID + Legacy Ref for old orders | Show both for orders that had centralOrderId. More complex. | |

**User's choice:** Local order UUID only

---

## Dry-Run Mode

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add --dry-run | Simulate all changes, output report, no DB writes. | ✓ |
| No dry-run, rely on backup | pg_dump is the safety net. | |

**User's choice:** Yes, add --dry-run

---

## Environment Variable Cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Startup warning for deprecated env vars | If CENTRAL_API_URL/KEY set, log deprecation warning. Helpful, non-breaking. | ✓ |
| Documentation only, no code check | Document removal in migration README. | |

**User's choice:** Startup warning for deprecated env vars

---

## Dependency Cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Remove nanoid if orphaned | Grep for remaining imports after central-api.ts deletion. Remove if none. | ✓ |
| Keep nanoid regardless | Small package, may be useful later. | |

**User's choice:** Remove nanoid if orphaned

---

## Migration Logging

| Option | Description | Selected |
|--------|-------------|----------|
| Timestamped log file | `logs/phase20-migration-{ISO-timestamp}.log` with full audit trail. | ✓ |
| Stdout only, no file logging | Dev redirects if needed. Simpler. | |

**User's choice:** Timestamped log file

---

## Claude's Discretion

- Exact CLI script structure and argument parsing
- Exact Drizzle migration file ordering
- Local License Engine card data source
- Email template design
- Startup warning implementation
- Log file rotation
- FK constraint options (ON DELETE behavior)
- pg_dump backup file handling

## Deferred Ideas

None — discussion stayed within phase scope
