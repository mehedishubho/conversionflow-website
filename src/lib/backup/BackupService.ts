import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { backups } from "@/lib/db/schema";
import { createAuditLog } from "@/lib/audit";
import { eq, desc, asc, sql } from "drizzle-orm";
import {
  resolvePgDumpPath,
  checkBinaryAvailability as resolveBinaries,
} from "./binary-resolver";

export class BackupService {
  /**
   * Check if pg_dump and psql binaries are available.
   * Delegates to binary-resolver for multi-strategy path detection.
   */
  static checkBinaryAvailability(): { pg_dump: boolean; psql: boolean } {
    return resolveBinaries();
  }

  /**
   * Create a full database backup using pg_dump.
   * Uses execFileSync with array args to prevent command injection (T-21-01).
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
      throw new Error(
        "pg_dump is not installed or not on PATH. Install PostgreSQL client tools."
      );
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
      const pgDumpPath = resolvePgDumpPath();
      execFileSync(pgDumpPath, [process.env.DATABASE_URL!, "-f", filePath], {
        stdio: "pipe",
        timeout: 300000, // 5 minute timeout
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
  }): Promise<typeof backups.$inferSelect[]> {
    const conditions = [];

    if (filters?.type) {
      conditions.push(eq(backups.type, filters.type as "manual" | "scheduled" | "pre_restore"));
    }

    if (filters?.status) {
      conditions.push(eq(backups.status, filters.status as "in_progress" | "completed" | "failed"));
    }

    let query = db.select().from(backups).$dynamic();

    // Apply type filter
    if (filters?.type) {
      query = query.where(eq(backups.type, filters.type as "manual" | "scheduled" | "pre_restore"));
    }

    // Apply status filter
    if (filters?.status) {
      query = query.where(eq(backups.status, filters.status as "in_progress" | "completed" | "failed"));
    }

    // Apply search
    if (filters?.search) {
      query = query.where(
        sql`filename ILIKE ${"%" + filters.search + "%"}`
      );
    }

    // Apply sort
    switch (filters?.sort) {
      case "size_asc":
        query = query.orderBy(asc(backups.fileSizeBytes));
        break;
      case "size_desc":
        query = query.orderBy(desc(backups.fileSizeBytes));
        break;
      case "type_asc":
        query = query.orderBy(asc(backups.type));
        break;
      case "type_desc":
        query = query.orderBy(desc(backups.type));
        break;
      default:
        query = query.orderBy(desc(backups.createdAt));
    }

    return query;
  }

  /**
   * Get a single backup by ID.
   */
  async getBackupById(
    id: string
  ): Promise<typeof backups.$inferSelect | null> {
    const [record] = await db
      .select()
      .from(backups)
      .where(eq(backups.id, id))
      .limit(1);

    return record ?? null;
  }

  /**
   * Get backup statistics: total count, last backup time, total disk usage.
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
