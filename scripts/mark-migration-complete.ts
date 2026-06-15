/**
 * Mark Phase 20 Migration Complete
 *
 * One-off utility for deployments with NO legacy Central-API data.
 * Flips the phase20_migration_complete setting to "true" so the admin
 * Payment Settings "Local License Engine" badge shows "Migration Complete"
 * instead of "Migration Pending".
 *
 * If you have legacy Central-API data, run scripts/migrate-phase20.ts instead.
 *
 * Run with: npx tsx scripts/mark-migration-complete.ts [--dry-run]
 */

import { db } from "../src/lib/db/index.js";
import { settings } from "../src/lib/db/schema.js";
import { eq } from "drizzle-orm";

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");

const SETTING_KEY = "phase20_migration_complete";
const SETTING_VALUE = "true";

// ──────────────────────────────────────────────
// Logging (console-only — this is a one-off flag flip, not a long migration)
// ──────────────────────────────────────────────

function log(msg: string): void {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

async function main(): Promise<void> {
  try {
    log(`Mark Migration Complete script starting... (dry-run: ${DRY_RUN})`);

    // Idempotency check: query existing flag first
    const existing = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, SETTING_KEY))
      .limit(1);

    if (existing.length > 0 && existing[0].value === SETTING_VALUE) {
      log(`${SETTING_KEY} is already 'true'. Nothing to do.`);
      process.exit(0);
    }

    if (existing.length > 0) {
      log(
        `${SETTING_KEY} is currently '${existing[0].value}'. Will overwrite with '${SETTING_VALUE}'.`
      );
    } else {
      log(`${SETTING_KEY} not set. Will insert.`);
    }

    // Dry-run branch: report would-be action, skip the write
    if (DRY_RUN) {
      log(
        `[DRY-RUN] Would upsert ${SETTING_KEY} = '${SETTING_VALUE}' into settings table.`
      );
    } else {
      // Write: Drizzle upsert with literal string "true"
      // (matches getLicenseEngineStatus's `value === "true"` check)
      await db
        .insert(settings)
        .values({ key: SETTING_KEY, value: SETTING_VALUE })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: SETTING_VALUE },
        });
      log(`Wrote ${SETTING_KEY} = '${SETTING_VALUE}' to settings.`);

      // Verify-after write: re-query to confirm the operator sees proof
      const verify = await db
        .select({ value: settings.value })
        .from(settings)
        .where(eq(settings.key, SETTING_KEY))
        .limit(1);

      if (verify.length === 0 || verify[0].value !== SETTING_VALUE) {
        log(
          `ERROR: Verification failed. Expected ${SETTING_KEY}='${SETTING_VALUE}' but got: ${
            verify.length === 0 ? "<row missing>" : `'${verify[0].value}'`
          }`
        );
        process.exit(1);
      }
      log(`Verified: ${SETTING_KEY} = '${verify[0].value}'.`);
    }

    // Summary
    log("─────────────────────────────────────────");
    log("Mark Migration Complete Summary:");
    log(`  Dry-run:          ${DRY_RUN}`);
    log(
      `  Final value:      ${
        DRY_RUN ? `not written (would be '${SETTING_VALUE}')` : `'${SETTING_VALUE}'`
      }`
    );
    log(`  Setting key:      ${SETTING_KEY}`);
    log("─────────────────────────────────────────");
    log("Mark Migration Complete script finished.");

    process.exit(0);
  } catch (error) {
    log("ERROR: " + (error instanceof Error ? error.message : String(error)));
    if (error instanceof Error && error.stack) {
      log(error.stack);
    }
    process.exit(1);
  }
}

main();
