import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

type AuditAction =
  | "user.registered"
  | "user.login"
  | "user.login_failed"
  | "user.logout"
  | "user.password_reset"
  | "user.email_verified"
  | "user.account_locked"
  | "user.role_changed"
  | "user.banned"
  | "user.activated"
  | "order.created"
  | "order.status_changed"
  | "license.created"
  | "license.status_changed"
  | "ticket.created"
  | "ticket.updated"
  | "admin.setup_completed"
  | string;

export interface AuditLogEntry {
  actorId?: string;
  actorRole?: string;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Create an audit log entry.
 * Wrapped in try/catch so audit failures never break the main flow.
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      actorId: entry.actorId ?? null,
      actorRole: entry.actorRole ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      details: entry.details ?? null,
      ipAddress: entry.ipAddress ?? null,
    });
  } catch (error) {
    // Audit logging should never break the main flow
    console.error("[Audit] Failed to create audit log:", error);
  }
}
