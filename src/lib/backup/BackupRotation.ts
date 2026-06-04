import fs from "fs";
import { db } from "@/lib/db";
import { backups, settings } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

export class BackupRotation {
  /**
   * Enforce retention policy by deleting oldest completed backups
   * when count exceeds the configured limit.
   */
  async enforceRetention(): Promise<{ deleted: number }> {
    const { retentionCount } = await this.getRetentionSettings();

    // Get all completed backups ordered oldest first
    const completedBackups = await db
      .select()
      .from(backups)
      .where(eq(backups.status, "completed"))
      .orderBy(asc(backups.createdAt));

    if (completedBackups.length <= retentionCount) {
      return { deleted: 0 };
    }

    const toDelete = completedBackups.slice(
      0,
      completedBackups.length - retentionCount
    );

    let deleted = 0;
    for (const backup of toDelete) {
      try {
        // Delete local file if it exists
        if (backup.filePath && fs.existsSync(backup.filePath)) {
          fs.unlinkSync(backup.filePath);
        }

        // Delete database record
        await db.delete(backups).where(eq(backups.id, backup.id));

        // Audit log
        await createAuditLog({
          action: "admin.backup_rotated",
          targetType: "backup",
          details: {
            filename: backup.filename,
            reason: "retention_policy",
          },
        });

        deleted++;
      } catch (error) {
        console.error(
          `[BackupRotation] Failed to delete backup ${backup.id}:`,
          error
        );
      }
    }

    return { deleted };
  }

  /**
   * Get the current retention settings from the settings table.
   */
  async getRetentionSettings(): Promise<{ retentionCount: number }> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "backup_retention_count"))
      .limit(1);

    const retentionCount = setting ? parseInt(setting.value, 10) : 10;

    // Validate parsed value
    if (isNaN(retentionCount) || retentionCount < 1) {
      return { retentionCount: 10 };
    }

    return { retentionCount };
  }

  /**
   * Save retention settings to the settings table.
   */
  async saveRetentionSettings(data: {
    retentionCount: number;
  }): Promise<{ success: boolean }> {
    // Validate retention count range
    if (data.retentionCount < 1 || data.retentionCount > 50) {
      throw new Error("Retention count must be between 1 and 50");
    }

    // Upsert the setting
    await db
      .insert(settings)
      .values({
        key: "backup_retention_count",
        value: String(data.retentionCount),
      })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: String(data.retentionCount) },
      });

    return { success: true };
  }
}
