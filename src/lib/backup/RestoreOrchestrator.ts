/**
 * Restore Orchestrator
 *
 * Per D-05/D-08: Multi-step restore with mandatory pre-restore backup
 * and auto-rollback on failure.
 * Per D-06: Restore status stored in Redis with TTL.
 * Per D-07: Maintenance mode blocks non-admin routes during restore.
 */

import { execFile } from "child_process";
import { db } from "@/lib/db";
import { backups, settings } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { kvGet, kvSet, kvDelete } from "@/lib/redis";
import { BackupService } from "@/lib/backup/BackupService";
import { createAuditLog } from "@/lib/audit";
import { resolvePsqlPath, checkBinaryAvailability } from "./binary-resolver";

type RestoreStage =
  | "pre_backup"
  | "maintenance"
  | "dropping"
  | "restoring"
  | "verifying"
  | "complete"
  | "failed";

interface RestoreStatus {
  stage: RestoreStage;
  backupId: string;
  startedAt: string;
  error?: string;
  preRestoreBackupId?: string;
}

const RESTORE_STATUS_KEY = "restore:status";
const RESTORE_STATUS_TTL = 600; // 10 minutes

/** Promisified execFile for async database operations */
function execFileAsync(
  command: string,
  args: string[],
  options: { timeout?: number } = {}
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(
      command,
      args,
      { timeout: options.timeout ?? 30000 },
      (err: Error | null, stdout: string, stderr: string) => {
        if (err) {
          reject(err);
        } else {
          resolve({ stdout, stderr });
        }
      }
    );
  });
}

/** Set a setting value in the settings table (upsert) */
async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value },
    });
}

export class RestoreOrchestrator {
  /**
   * Restore a backup by ID. Runs a multi-step state machine:
   * 1. Pre-restore backup (mandatory safety net)
   * 2. Enable maintenance mode
   * 3. Terminate existing DB connections
   * 4. Run psql restore
   * 5. Verify database connectivity
   * 6. Disable maintenance mode
   *
   * On ANY failure, attempts auto-rollback using pre-restore backup.
   */
  async restoreBackup(
    backupId: string,
    triggeredBy: string
  ): Promise<{ success: boolean; error?: string }> {
    // Check if a restore is already in progress (D-06)
    const existingStatus = await RestoreOrchestrator.getRestoreStatus();
    if (
      existingStatus &&
      existingStatus.stage !== "complete" &&
      existingStatus.stage !== "failed"
    ) {
      throw new Error("Restore already in progress");
    }

    // Check psql availability before starting
    const binaries = checkBinaryAvailability();
    if (!binaries.psql) {
      throw new Error(
        "psql is not installed or not on PATH. Install PostgreSQL client tools."
      );
    }

    const psqlPath = resolvePsqlPath();

    // Set initial status
    const status: RestoreStatus = {
      stage: "pre_backup",
      backupId,
      startedAt: new Date().toISOString(),
    };
    await kvSet(RESTORE_STATUS_KEY, JSON.stringify(status), RESTORE_STATUS_TTL);

    try {
      // Step 1: Pre-restore backup (per D-05/D-08)
      const backupService = new BackupService();
      const preRestoreResult = await backupService.createBackup(
        "pre_restore",
        triggeredBy
      );

      if (!preRestoreResult.success) {
        throw new Error(
          `Pre-restore backup failed: ${preRestoreResult.error ?? "unknown error"}`
        );
      }

      status.preRestoreBackupId = preRestoreResult.backupId;
      status.stage = "maintenance";
      await kvSet(RESTORE_STATUS_KEY, JSON.stringify(status), RESTORE_STATUS_TTL);

      // Step 2: Enable maintenance mode (per D-07)
      await setSetting("maintenance_mode", "true");

      status.stage = "dropping";
      await kvSet(RESTORE_STATUS_KEY, JSON.stringify(status), RESTORE_STATUS_TTL);

      // Step 3: Terminate existing connections (Pitfall 3)
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error("DATABASE_URL environment variable is not set");
      }

      try {
        await execFileAsync(psqlPath, [
          databaseUrl,
          "-c",
          "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()",
        ], { timeout: 30000 });
      } catch (termErr) {
        // Non-fatal: connections may already be cleared
        console.warn(
          "[Restore] Connection termination warning:",
          termErr instanceof Error ? termErr.message : String(termErr)
        );
      }

      status.stage = "restoring";
      await kvSet(RESTORE_STATUS_KEY, JSON.stringify(status), RESTORE_STATUS_TTL);

      // Step 4: Restore via psql (per D-05)
      const [backupRecord] = await db
        .select()
        .from(backups)
        .where(eq(backups.id, backupId))
        .limit(1);

      if (!backupRecord) {
        throw new Error(`Backup record not found: ${backupId}`);
      }

      await execFileAsync(psqlPath, [databaseUrl, "-f", backupRecord.filePath], {
        timeout: 300000, // 5-minute timeout for large restores
      });

      status.stage = "verifying";
      await kvSet(RESTORE_STATUS_KEY, JSON.stringify(status), RESTORE_STATUS_TTL);

      // Step 5: Verify database connectivity
      await db.execute(sql`SELECT 1`);

      // Step 6: Disable maintenance mode
      await setSetting("maintenance_mode", "false");

      status.stage = "complete";
      await kvSet(RESTORE_STATUS_KEY, JSON.stringify(status), RESTORE_STATUS_TTL);

      // Audit log
      await createAuditLog({
        action: "admin.backup_restored",
        targetType: "backup",
        targetId: backupId,
      });

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);

      // Update status to failed
      status.stage = "failed";
      status.error = errorMessage;
      await kvSet(RESTORE_STATUS_KEY, JSON.stringify(status), RESTORE_STATUS_TTL);

      // Auto-rollback using pre-restore backup (per D-08)
      if (status.preRestoreBackupId) {
        try {
          const [preBackupRecord] = await db
            .select()
            .from(backups)
            .where(eq(backups.id, status.preRestoreBackupId))
            .limit(1);

          if (preBackupRecord) {
            const databaseUrl = process.env.DATABASE_URL;
            if (databaseUrl) {
              await execFileAsync(
                psqlPath,
                [databaseUrl, "-f", preBackupRecord.filePath],
                { timeout: 300000 }
              );
            }
          }
          console.log("[Restore] Auto-rollback completed successfully");
        } catch (rollbackErr) {
          console.error(
            "[Restore] Auto-rollback failed:",
            rollbackErr instanceof Error ? rollbackErr.message : String(rollbackErr)
          );
        }
      }

      // Always clear maintenance mode on failure
      try {
        await setSetting("maintenance_mode", "false");
      } catch {
        // Best-effort
      }

      // Audit log
      await createAuditLog({
        action: "admin.backup_restore_failed",
        targetType: "backup",
        targetId: backupId,
        details: { error: errorMessage },
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get the current restore status from Redis (per D-06).
   */
  static async getRestoreStatus(): Promise<RestoreStatus | null> {
    const data = await kvGet(RESTORE_STATUS_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data) as RestoreStatus;
    } catch {
      return null;
    }
  }

  /**
   * Clear the restore status from Redis.
   */
  static async clearRestoreStatus(): Promise<void> {
    await kvDelete(RESTORE_STATUS_KEY);
  }
}
