import { execFileSync, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { backups } from "@/lib/db/schema";
import { createAuditLog } from "@/lib/audit";
import { eq, desc, asc, sql } from "drizzle-orm";

export class BackupService {
  /**
   * Check if pg_dump and psql binaries are available on PATH.
   * Uses cross-platform detection (which/where).
   */
  static checkBinaryAvailability(): { pg_dump: boolean; psql: boolean } {
    let pgDumpAvailable = false;
    let psqlAvailable = false;

    try {
      execSync("which pg_dump 2>/dev/null || where pg_dump 2>nul", {
        stdio: "pipe",
      });
      pgDumpAvailable = true;
    } catch {
      pgDumpAvailable = false;
    }

    try {
      execSync("which psql 2>/dev/null || where psql 2>nul", {
        stdio: "pipe",
      });
      psqlAvailable = true;
    } catch {
      psqlAvailable = false;
    }

    return { pg_dump: pgDumpAvailable, psql: psqlAvailable };
  }

  /**
   * Create a full database backup using pg_dump.
   * Inserts a metadata record, runs pg_dump, updates record on completion.
   */
  async createBackup(
    type: "manual" | "scheduled" | "pre_restore",
    triggeredBy?: string
  ): Promise<{
    success: boolean;
    backupId: string;
    filename: string;
    fileSizeBytes: number;
    error?: string;
  }> {
    // Validate DATABASE_URL
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // Check pg_dump availability
    const binaries = BackupService.checkBinaryAvailability();
    if (!binaries.pg_dump) {
      throw new Error("pg_dump is not installed or not on PATH");
    }

    // Ensure backups directory exists
    fs.mkdirSync("backups", { recursive: true });

    // Generate filename and path
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, "").slice(0, 15);
    const filename = `backup-${timestamp}-${type}.sql`;
    const filePath = path.resolve("backups", filename);

    // Insert backup record with in_progress status
    const [inserted] = await db
      .insert(backups)
      .values({
        filename,
        filePath,
        type,
        status: "in_progress",
        triggeredBy: triggeredBy ?? null,
      })
      .returning({ id: backups.id });

    const backupId = inserted.id;

    try {
      // Run pg_dump with array args (no shell injection)
      execFileSync("pg_dump", [process.env.DATABASE_URL!, "-f", filePath], {
        stdio: "pipe",
        timeout: 300000,
      });

      // Get file size
      const stat = fs.statSync(filePath);
      const fileSizeBytes = stat.size;

      // Update backup record as completed
      await db
        .update(backups)
        .set({
          status: "completed",
          fileSizeBytes,
          completedAt: new Date(),
        })
        .where(eq(backups.id, backupId));

      // Audit log
      await createAuditLog({
        action: "admin.backup_created",
        targetType: "backup",
        targetId: backupId,
        details: { filename, type, size: fileSizeBytes },
      });

      return {
        success: true,
        backupId,
        filename,
        fileSizeBytes,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Update backup record as failed
      await db
        .update(backups)
        .set({
          status: "failed",
          errorMessage,
        })
        .where(eq(backups.id, backupId));

      return {
        success: false,
        backupId,
        filename,
        fileSizeBytes: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * Delete a backup record and its local file.
   */
  async deleteBackup(backupId: string): Promise<void> {
    const [record] = await db
      .select()
      .from(backups)
      .where(eq(backups.id, backupId))
      .limit(1);

    if (!record) {
      throw new Error("Backup not found");
    }

    // Delete local file if it exists
    if (record.filePath && fs.existsSync(record.filePath)) {
      fs.unlinkSync(record.filePath);
    }

    // Delete database record
    await db.delete(backups).where(eq(backups.id, backupId));

    // Audit log
    await createAuditLog({
      action: "admin.backup_deleted",
      targetType: "backup",
      targetId: backupId,
    });
  }

  /**
   * Get backups with optional filtering and sorting.
   */
  async getBackups(filters?: {
    type?: string;
    status?: string;
    search?: string;
    sort?: string;
  }) {
    let query = db.select().from(backups);

    const conditions = [];

    if (filters?.type) {
      conditions.push(eq(backups.type, filters.type as "manual" | "scheduled" | "pre_restore"));
    }
    if (filters?.status) {
      conditions.push(eq(backups.status, filters.status as "in_progress" | "completed" | "failed"));
    }
    if (filters?.search) {
      conditions.push(sql`filename ILIKE ${"%" + filters.search + "%"}`);
    }

    // Determine sort order
    let orderBy;
    switch (filters?.sort) {
      case "size_asc":
        orderBy = asc(backups.fileSizeBytes);
        break;
      case "size_desc":
        orderBy = desc(backups.fileSizeBytes);
        break;
      case "type_asc":
        orderBy = asc(backups.type);
        break;
      case "type_desc":
        orderBy = desc(backups.type);
        break;
      default:
        orderBy = desc(backups.createdAt);
    }

    if (conditions.length > 0) {
      const result = await db
        .select()
        .from(backups)
        .where(sql.join(conditions, sql` AND `))
        .orderBy(orderBy);
      return result;
    }

    const result = await db.select().from(backups).orderBy(orderBy);
    return result;
  }

  /**
   * Get a single backup by ID.
   */
  async getBackupById(id: string) {
    const [record] = await db
      .select()
      .from(backups)
      .where(eq(backups.id, id))
      .limit(1);
    return record ?? null;
  }

  /**
   * Get backup statistics.
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    lastBackupAt: Date | null;
    totalDiskUsageBytes: number;
  }> {
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(backups);

    const [lastResult] = await db
      .select({ createdAt: backups.createdAt })
      .from(backups)
      .where(eq(backups.status, "completed"))
      .orderBy(desc(backups.createdAt))
      .limit(1);

    const [sizeResult] = await db
      .select({ total: sql<number>`coalesce(sum(file_size_bytes), 0)::int` })
      .from(backups)
      .where(eq(backups.status, "completed"));

    return {
      totalBackups: countResult?.count ?? 0,
      lastBackupAt: lastResult?.createdAt ?? null,
      totalDiskUsageBytes: sizeResult?.total ?? 0,
    };
  }
}
