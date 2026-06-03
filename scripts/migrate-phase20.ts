/**
 * Phase 20 Migration CLI Script
 *
 * Comprehensive data migration script that handles all data transformations
 * for the Phase 20 migration from external Central API to self-contained licensing.
 *
 * Run with: npx tsx scripts/migrate-phase20.ts [--dry-run]
 *
 * Execution order:
 *   1. This script runs FIRST (data transforms, validation)
 *   2. Then `pnpm drizzle-kit push` runs (schema changes)
 *
 * Decisions implemented:
 *   D-02: Dedicated migration CLI script with verification before schema changes
 *   D-03: FK data validation with detailed error reporting
 *   D-04: Atomic FK validation in a single PostgreSQL transaction
 *   D-05: API token backfill for licenses with NULL api_token_hash
 *   D-06: Bulk email notification for affected customers
 *   D-07: License key regeneration to CF-XXXX format
 *   D-08: Manual CLI script handles data transforms
 *   D-09: Script supports --dry-run flag
 *   D-10: pg_dump full database backup before migration
 *   D-11: Write phase20_migration_complete flag to settings table
 *   D-12: Timestamped log file to logs/ directory
 */

import { db } from "../src/lib/db/index.js";
import { licenses, orders, products, productPlans, settings, user } from "../src/lib/db/schema.js";
import { eq, isNull, sql, and } from "drizzle-orm";
import { LicenseKeyGenerator } from "../src/modules/licensing/domain/services/LicenseKeyGenerator.js";
import { ApiTokenGenerator } from "../src/modules/licensing/domain/services/ApiTokenGenerator.js";
import { sendApiTokenNotificationEmail } from "../src/lib/emails/api-token-notification.js";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");
const EMAIL_BATCH_SIZE = 50;
const EMAIL_BATCH_PAUSE_MS = 2000;

// ──────────────────────────────────────────────
// Logging
// ──────────────────────────────────────────────

fs.mkdirSync("logs", { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const LOG_FILE = path.join("logs", `phase20-migration-${timestamp}.log`);

let logStream: fs.WriteStream | null = null;

function log(msg: string): void {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  if (logStream) {
    logStream.write(line + "\n");
  }
}

// ──────────────────────────────────────────────
// Summary tracking
// ──────────────────────────────────────────────

const summary = {
  usersWithCentralId: 0,
  ordersWithCentralId: 0,
  licensesWithCentralId: 0,
  licensesWithoutApiToken: 0,
  totalLicenses: 0,
  keysRegenerated: 0,
  tokensGenerated: 0,
  emailsSent: 0,
  emailsFailed: 0,
  fkValidationPassed: false,
  backupPath: "",
};

// ──────────────────────────────────────────────
// Main migration
// ──────────────────────────────────────────────

async function main(): Promise<void> {
  logStream = fs.createWriteStream(LOG_FILE, { flags: "a" });

  try {
    log("Phase 20 Migration Script starting... (dry-run: " + DRY_RUN + ")");

    // Step 1: Check if migration already completed
    const existingFlag = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, "phase20_migration_complete"))
      .limit(1);

    if (existingFlag.length > 0 && existingFlag[0].value === "true") {
      log("Migration already completed. Exiting.");
      process.exit(0);
    }

    // Step 2: Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      log("ERROR: DATABASE_URL environment variable is not set.");
      process.exit(1);
    }

    // Step 3: Check pg_dump availability
    let pgDumpAvailable = false;
    try {
      execSync("which pg_dump 2>/dev/null || where pg_dump 2>nul", {
        stdio: "pipe",
      });
      pgDumpAvailable = true;
      log("pg_dump found. Backup will be created.");
    } catch {
      log("WARNING: pg_dump not found. Backup step will be skipped.");
    }

    // Step 4: Backup via pg_dump
    if (pgDumpAvailable && !DRY_RUN) {
      fs.mkdirSync("backups", { recursive: true });
      const backupFile = path.join("backups", `pre-phase20-${timestamp}.sql`);
      try {
        execSync(
          `pg_dump "${process.env.DATABASE_URL}" -f "${backupFile}"`,
          { stdio: "pipe" }
        );
        summary.backupPath = backupFile;
        log("Backup saved to " + backupFile);
      } catch (error) {
        log("ERROR: pg_dump failed: " + (error instanceof Error ? error.message : String(error)));
        log("Aborting migration. Fix pg_dump or run with --dry-run.");
        process.exit(1);
      }
    } else if (pgDumpAvailable && DRY_RUN) {
      log("[DRY-RUN] Would create pg_dump backup to backups/pre-phase20-" + timestamp + ".sql");
    }

    // Step 5: Data verification counts
    log("Gathering data verification counts...");

    const userCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .where(sql`central_user_id IS NOT NULL`);
    summary.usersWithCentralId = userCount[0]?.count ?? 0;
    log("Users with central_user_id: " + summary.usersWithCentralId);

    const orderCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(sql`central_order_id IS NOT NULL`);
    summary.ordersWithCentralId = orderCount[0]?.count ?? 0;
    log("Orders with central_order_id: " + summary.ordersWithCentralId);

    const licenseCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(licenses)
      .where(sql`central_license_id IS NOT NULL`);
    summary.licensesWithCentralId = licenseCount[0]?.count ?? 0;
    log("Licenses with central_license_id: " + summary.licensesWithCentralId);

    const nullTokenCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(licenses)
      .where(isNull(licenses.apiTokenHash));
    summary.licensesWithoutApiToken = nullTokenCount[0]?.count ?? 0;
    log("Licenses with NULL api_token_hash: " + summary.licensesWithoutApiToken);

    const totalLicenseCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(licenses);
    summary.totalLicenses = totalLicenseCount[0]?.count ?? 0;
    log("Total licenses: " + summary.totalLicenses);

    // Step 6: License key regeneration (D-07)
    const allLicenses = await db
      .select({
        id: licenses.id,
        userId: licenses.userId,
        licenseKey: licenses.licenseKey,
      })
      .from(licenses);

    if (DRY_RUN) {
      log("[DRY-RUN] Would regenerate " + allLicenses.length + " license keys");
    } else {
      for (const license of allLicenses) {
        const newKey = LicenseKeyGenerator.generateFormatted();
        await db
          .update(licenses)
          .set({ licenseKey: newKey })
          .where(eq(licenses.id, license.id));
      }
      summary.keysRegenerated = allLicenses.length;
      log("Regenerated " + summary.keysRegenerated + " license keys");
    }

    // Step 7: API token backfill (D-05)
    const licensesNeedingTokens = await db
      .select({
        id: licenses.id,
        userId: licenses.userId,
        licenseKey: licenses.licenseKey,
      })
      .from(licenses)
      .where(isNull(licenses.apiTokenHash));

    interface TokenNotification {
      userId: string;
      licenseId: string;
      licenseKey: string;
      plaintext: string;
    }

    const tokenNotifications: TokenNotification[] = [];

    if (DRY_RUN) {
      log("[DRY-RUN] Would generate " + licensesNeedingTokens.length + " API tokens");
    } else {
      for (const license of licensesNeedingTokens) {
        const { plaintext, hash } = ApiTokenGenerator.generate();
        await db
          .update(licenses)
          .set({ apiTokenHash: hash })
          .where(eq(licenses.id, license.id));

        tokenNotifications.push({
          userId: license.userId,
          licenseId: license.id,
          licenseKey: license.licenseKey,
          plaintext,
        });
      }
      summary.tokensGenerated = licensesNeedingTokens.length;
      log("Generated " + summary.tokensGenerated + " API tokens");
    }

    // Step 8: FK data validation (D-03, D-04) -- inside a transaction
    log("Starting FK data validation...");

    const fkValidationResult = await db.transaction(async (tx) => {
      // Validate productId references from orders
      const distinctOrderProductIds = await tx
        .selectDistinct({ productId: orders.productId })
        .from(orders);

      const allProductSlugs = await tx
        .select({ id: products.id, slug: products.slug })
        .from(products);

      const productSlugSet = new Set(allProductSlugs.map((p) => p.slug));
      const productIdSet = new Set(allProductSlugs.map((p) => p.id));

      const invalidOrderProductIds: string[] = [];
      for (const row of distinctOrderProductIds) {
        const val = row.productId;
        if (!productIdSet.has(val) && !productSlugSet.has(val)) {
          invalidOrderProductIds.push(val);
        }
      }

      // Validate productId references from licenses
      const distinctLicenseProductIds = await tx
        .selectDistinct({ productId: licenses.productId })
        .from(licenses);

      const invalidLicenseProductIds: string[] = [];
      for (const row of distinctLicenseProductIds) {
        const val = row.productId;
        if (!productIdSet.has(val) && !productSlugSet.has(val)) {
          invalidLicenseProductIds.push(val);
        }
      }

      // Validate plan references from licenses
      const distinctPlanSlugs = await tx
        .selectDistinct({ plan: licenses.plan, productId: licenses.productId })
        .from(licenses);

      const allPlanSlugs = await tx
        .select({ slug: productPlans.slug, productId: productPlans.productId })
        .from(productPlans);

      const planSlugByProduct = new Map<string, Set<string>>();
      for (const plan of allPlanSlugs) {
        if (!planSlugByProduct.has(plan.productId)) {
          planSlugByProduct.set(plan.productId, new Set());
        }
        planSlugByProduct.get(plan.productId)!.add(plan.slug);
      }

      const invalidPlanSlugs: { plan: string; productId: string }[] = [];
      for (const row of distinctPlanSlugs) {
        const planSet = planSlugByProduct.get(row.productId);
        if (!planSet || !planSet.has(row.plan)) {
          invalidPlanSlugs.push({ plan: row.plan, productId: row.productId });
        }
      }

      return {
        totalOrderProductIds: distinctOrderProductIds.length,
        totalLicenseProductIds: distinctLicenseProductIds.length,
        totalPlanSlugs: distinctPlanSlugs.length,
        invalidOrderProductIds,
        invalidLicenseProductIds,
        invalidPlanSlugs,
      };
    });

    const hasInvalidFk =
      fkValidationResult.invalidOrderProductIds.length > 0 ||
      fkValidationResult.invalidLicenseProductIds.length > 0 ||
      fkValidationResult.invalidPlanSlugs.length > 0;

    if (hasInvalidFk) {
      if (fkValidationResult.invalidOrderProductIds.length > 0) {
        log(
          "FK ERROR: Orders reference invalid productIds: " +
            fkValidationResult.invalidOrderProductIds.join(", ")
        );
      }
      if (fkValidationResult.invalidLicenseProductIds.length > 0) {
        log(
          "FK ERROR: Licenses reference invalid productIds: " +
            fkValidationResult.invalidLicenseProductIds.join(", ")
        );
      }
      if (fkValidationResult.invalidPlanSlugs.length > 0) {
        log(
          "FK ERROR: Licenses reference invalid plans: " +
            fkValidationResult.invalidPlanSlugs
              .map((p) => `${p.plan} (product: ${p.productId})`)
              .join(", ")
        );
      }

      if (DRY_RUN) {
        log("[DRY-RUN] FK validation failed but continuing in dry-run mode.");
      } else {
        log("FK validation FAILED. Aborting migration.");
        process.exit(1);
      }
    } else {
      summary.fkValidationPassed = true;
      log(
        "FK validation passed: " +
          fkValidationResult.totalOrderProductIds +
          " unique order productId values, " +
          fkValidationResult.totalLicenseProductIds +
          " unique license productId values, " +
          fkValidationResult.totalPlanSlugs +
          " unique plan values all validated"
      );
    }

    // Step 9: Write completion flag (D-11)
    if (DRY_RUN) {
      log("[DRY-RUN] Would write phase20_migration_complete = true");
    } else {
      await db
        .insert(settings)
        .values({
          key: "phase20_migration_complete",
          value: "true",
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: "true" },
        });
      log("Wrote phase20_migration_complete = true to settings");
    }

    // Step 10: Send API token notification emails (D-06)
    if (DRY_RUN) {
      log(
        "[DRY-RUN] Would send " +
          tokenNotifications.length +
          " API token notification emails (note: token list is empty in dry-run since no tokens were generated)"
      );
    } else if (tokenNotifications.length > 0) {
      if (!process.env.RESEND_API_KEY) {
        log(
          "RESEND_API_KEY not set. Skipping email notifications. " +
            tokenNotifications.length +
            " customers need manual token delivery."
        );
      } else {
        // Look up user emails for all notifications
        const userIds = [...new Set(tokenNotifications.map((n) => n.userId))];
        const users = await db
          .select({ id: user.id, name: user.name, email: user.email })
          .from(user)
          .where(sql`${user.id} IN (${sql.join(userIds, sql`, `)})`);

        const userMap = new Map(users.map((u) => [u.id, u]));

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conversionflow.com";

        // Send in batches
        for (let i = 0; i < tokenNotifications.length; i += EMAIL_BATCH_SIZE) {
          const batch = tokenNotifications.slice(i, i + EMAIL_BATCH_SIZE);

          for (const notification of batch) {
            const userInfo = userMap.get(notification.userId);
            if (!userInfo) {
              log("WARNING: No user found for userId " + notification.userId + ". Skipping email.");
              summary.emailsFailed++;
              continue;
            }

            try {
              await sendApiTokenNotificationEmail({
                to: userInfo.email,
                customerName: userInfo.name,
                licenseKey: notification.licenseKey,
                apiToken: notification.plaintext,
                portalUrl: appUrl + "/dashboard/licenses/" + notification.licenseId,
              });
              summary.emailsSent++;
            } catch {
              summary.emailsFailed++;
            }
          }

          // Pause between batches (skip for last batch)
          if (i + EMAIL_BATCH_SIZE < tokenNotifications.length) {
            await new Promise((r) => setTimeout(r, EMAIL_BATCH_PAUSE_MS));
          }
        }

        log(
          "Sent " +
            summary.emailsSent +
            " API token notification emails" +
            (summary.emailsFailed > 0 ? " (" + summary.emailsFailed + " failed)" : "")
        );
      }
    } else {
      log("No API token notification emails to send.");
    }

    // Step 11: Summary
    log("─────────────────────────────────────────");
    log("Phase 20 Migration Summary:");
    log("  Dry-run:              " + DRY_RUN);
    log("  Users w/ central ID:  " + summary.usersWithCentralId);
    log("  Orders w/ central ID: " + summary.ordersWithCentralId);
    log("  Licenses w/ central:  " + summary.licensesWithCentralId);
    log("  Total licenses:       " + summary.totalLicenses);
    log("  Keys regenerated:     " + (DRY_RUN ? "0 (dry-run)" : summary.keysRegenerated));
    log("  Tokens generated:     " + (DRY_RUN ? "0 (dry-run)" : summary.tokensGenerated));
    log("  Tokens w/o hash:      " + summary.licensesWithoutApiToken);
    log("  FK validation:        " + (summary.fkValidationPassed ? "PASSED" : "FAILED"));
    log("  Completion flag:      " + (DRY_RUN ? "not written (dry-run)" : "written"));
    log("  Emails sent:          " + summary.emailsSent);
    log("  Emails failed:        " + summary.emailsFailed);
    log("  Backup:               " + (summary.backupPath || "none"));
    log("  Log file:             " + LOG_FILE);
    log("─────────────────────────────────────────");
    log("Phase 20 Migration Script complete.");

    if (logStream) {
      logStream.end();
    }
    process.exit(0);
  } catch (error) {
    log("ERROR: Migration failed with error:");
    log(error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      log(error.stack);
    }
    log("Migration FAILED. Restore from backup if needed.");
    if (logStream) {
      logStream.end();
    }
    process.exit(1);
  }
}

main();
