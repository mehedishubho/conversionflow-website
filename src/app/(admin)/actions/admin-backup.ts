"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { BackupService } from "@/lib/backup/BackupService";
import { BackupRotation } from "@/lib/backup/BackupRotation";
import { RestoreOrchestrator } from "@/lib/backup/RestoreOrchestrator";
import { scheduleBackupJob } from "@/jobs/workers/backup-worker";

// ──────────────────────────────────────────────
// Admin Role Guard
// ──────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as Record<string, unknown>).role as string;
  if (role !== "admin" && role !== "super_admin") {
    redirect("/dashboard");
  }

  return { session, userId: session.user.id, role };
}

// ──────────────────────────────────────────────
// Helper: Upsert a setting value (D-10, D-11)
// ──────────────────────────────────────────────

async function upsertSetting(key: string, value: string): Promise<void> {
  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(settings)
      .set({ value, updatedAt: new Date() })
      .where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

async function getSettingValue(
  key: string,
  defaultValue: string = ""
): Promise<string> {
  const [row] = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  return row?.value ?? defaultValue;
}

// ──────────────────────────────────────────────
// 1. Create Backup (D-01)
// ──────────────────────────────────────────────

export async function createBackupAction() {
  const { userId } = await requireAdmin();

  try {
    const backupService = new BackupService();
    const result = await backupService.createBackup("manual", userId);

    // Fire-and-forget retention enforcement after manual backup
    if (result.success) {
      new BackupRotation()
        .enforceRetention()
        .catch((err) =>
          console.error("[Backup] Retention enforcement failed:", err)
        );
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false as const,
      backupId: "",
      filename: "",
      fileSizeBytes: 0,
      error: errorMessage,
    };
  }
}

// ──────────────────────────────────────────────
// 2. Delete Backup (D-02)
// ──────────────────────────────────────────────

export async function deleteBackupAction(backupId: string) {
  const { userId, role } = await requireAdmin();

  try {
    const backupService = new BackupService();
    await backupService.deleteBackup(backupId);

    await createAuditLog({
      actorId: userId,
      actorRole: role,
      action: "admin.backup_deleted",
      targetType: "backup",
      targetId: backupId,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: errorMessage };
  }
}

// ──────────────────────────────────────────────
// 3. Restore Backup (D-05, D-08)
// ──────────────────────────────────────────────

export async function restoreBackupAction(backupId: string) {
  const { userId } = await requireAdmin();

  try {
    const orchestrator = new RestoreOrchestrator();
    // Restore runs asynchronously — start it and return immediately
    orchestrator
      .restoreBackup(backupId, userId)
      .catch((err) =>
        console.error("[Backup] Restore failed:", err)
      );

    return { started: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: errorMessage };
  }
}

// ──────────────────────────────────────────────
// 4. Get Backup List
// ──────────────────────────────────────────────

export async function getBackupList(filters?: {
  type?: string;
  status?: string;
  search?: string;
  sort?: string;
}) {
  await requireAdmin();

  const backupService = new BackupService();
  return backupService.getBackups(filters);
}

// ──────────────────────────────────────────────
// 5. Get Backup Dashboard Data (D-17)
// ──────────────────────────────────────────────

export async function getBackupDashboardData() {
  await requireAdmin();

  const backupService = new BackupService();
  const stats = await backupService.getBackupStats();

  const interval = await getSettingValue("backup_interval", "disabled");
  const retentionCount = (
    await new BackupRotation().getRetentionSettings()
  ).retentionCount;
  const binaryAvailability = BackupService.checkBinaryAvailability();

  return {
    stats,
    interval,
    retentionCount,
    binaryAvailability,
  };
}

// ──────────────────────────────────────────────
// 6. Save Backup Settings (D-10, D-11)
// ──────────────────────────────────────────────

const VALID_INTERVALS = [
  "disabled",
  "every_6_hours",
  "daily",
  "weekly",
  "monthly",
];

export async function saveBackupSettings(data: {
  interval: string;
  retentionCount: number;
}) {
  const { userId, role } = await requireAdmin();

  // Validate interval
  if (!VALID_INTERVALS.includes(data.interval)) {
    return {
      error:
        "Invalid interval. Must be one of: disabled, every_6_hours, daily, weekly, monthly.",
    };
  }

  // Validate retention count
  if (
    typeof data.retentionCount !== "number" ||
    isNaN(data.retentionCount) ||
    data.retentionCount < 1 ||
    data.retentionCount > 50
  ) {
    return { error: "Retention count must be between 1 and 50." };
  }

  // Upsert backup_interval setting
  await upsertSetting("backup_interval", data.interval);

  // Save retention count via BackupRotation
  await new BackupRotation().saveRetentionSettings({
    retentionCount: data.retentionCount,
  });

  // Reschedule the backup job
  await scheduleBackupJob();

  // Audit log
  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.settings_updated",
    targetType: "settings",
    targetId: "backup",
    details: {
      action: "backup_settings_updated",
      interval: data.interval,
      retentionCount: data.retentionCount,
    },
  });

  return { success: true };
}

// ──────────────────────────────────────────────
// 7. Get Backup Settings
// ──────────────────────────────────────────────

export async function getBackupSettings() {
  await requireAdmin();

  const interval = await getSettingValue("backup_interval", "disabled");
  const { retentionCount } = await new BackupRotation().getRetentionSettings();

  // Cloud settings
  const cloudProvider = await getSettingValue("backup_cloud_provider", "none");
  const s3Endpoint = await getSettingValue("backup_cloud_s3_endpoint");
  const s3AccessKey = await getSettingValue("backup_cloud_s3_access_key");
  const s3SecretKey = await getSettingValue("backup_cloud_s3_secret_key");
  const s3Bucket = await getSettingValue("backup_cloud_s3_bucket");
  const gdriveClientId = await getSettingValue(
    "backup_cloud_gdrive_client_id"
  );
  const gdriveClientSecret = await getSettingValue(
    "backup_cloud_gdrive_client_secret"
  );
  const gdriveRefreshToken = await getSettingValue(
    "backup_cloud_gdrive_refresh_token"
  );
  const gdriveFolderId = await getSettingValue(
    "backup_cloud_gdrive_folder_id"
  );

  return {
    interval,
    retentionCount,
    cloud: {
      provider: cloudProvider,
      s3: {
        endpoint: s3Endpoint,
        accessKey: s3AccessKey,
        secretKey: s3SecretKey,
        bucket: s3Bucket,
      },
      gdrive: {
        clientId: gdriveClientId,
        clientSecret: gdriveClientSecret,
        refreshToken: gdriveRefreshToken,
        folderId: gdriveFolderId,
      },
    },
  };
}

// ──────────────────────────────────────────────
// 8. Save Cloud Settings
// ──────────────────────────────────────────────

export async function saveCloudSettings(data: {
  provider: string;
  s3Endpoint?: string;
  s3AccessKey?: string;
  s3SecretKey?: string;
  s3Bucket?: string;
  gdriveClientId?: string;
  gdriveClientSecret?: string;
  gdriveRefreshToken?: string;
  gdriveFolderId?: string;
}) {
  const { userId, role } = await requireAdmin();

  // Upsert all cloud settings
  const entries: Array<{ key: string; value: string }> = [
    { key: "backup_cloud_provider", value: data.provider },
  ];

  if (data.s3Endpoint !== undefined)
    entries.push({ key: "backup_cloud_s3_endpoint", value: data.s3Endpoint });
  if (data.s3AccessKey !== undefined)
    entries.push({
      key: "backup_cloud_s3_access_key",
      value: data.s3AccessKey,
    });
  if (data.s3SecretKey !== undefined)
    entries.push({
      key: "backup_cloud_s3_secret_key",
      value: data.s3SecretKey,
    });
  if (data.s3Bucket !== undefined)
    entries.push({ key: "backup_cloud_s3_bucket", value: data.s3Bucket });
  if (data.gdriveClientId !== undefined)
    entries.push({
      key: "backup_cloud_gdrive_client_id",
      value: data.gdriveClientId,
    });
  if (data.gdriveClientSecret !== undefined)
    entries.push({
      key: "backup_cloud_gdrive_client_secret",
      value: data.gdriveClientSecret,
    });
  if (data.gdriveRefreshToken !== undefined)
    entries.push({
      key: "backup_cloud_gdrive_refresh_token",
      value: data.gdriveRefreshToken,
    });
  if (data.gdriveFolderId !== undefined)
    entries.push({
      key: "backup_cloud_gdrive_folder_id",
      value: data.gdriveFolderId,
    });

  for (const entry of entries) {
    await upsertSetting(entry.key, entry.value);
  }

  // Audit log
  await createAuditLog({
    actorId: userId,
    actorRole: role,
    action: "admin.settings_updated",
    targetType: "settings",
    targetId: "backup_cloud",
    details: {
      action: "backup_cloud_settings_updated",
      provider: data.provider,
    },
  });

  return { success: true };
}
