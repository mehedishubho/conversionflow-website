import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { licenses, licenseTransfers, user } from "@/lib/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { createLicenseEvent, LICENSE_EVENTS } from "@/modules/licensing/domain/events/LicenseEvents";
import { inProcessPublisher } from "@/shared/infrastructure/eventBus/EventBus";
import { TransferRepository } from "../../infrastructure/repositories/TransferRepository";

const TRANSFER_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateTransferCode(): string {
  const bytes = randomBytes(6);
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += TRANSFER_CHARSET[bytes[i] % TRANSFER_CHARSET.length];
  }
  return `CF-XFER-${suffix}`;
}

export class TransferLicenseHandler {
  private transferRepo = new TransferRepository();

  async generateCode(
    licenseId: string,
    userId: string,
    maxTransfersPerMonth: number = 1,
  ): Promise<{ code?: string; error?: string }> {
    // 1. Find license and verify ownership (IDOR)
    const [license] = await db
      .select()
      .from(licenses)
      .where(and(eq(licenses.id, licenseId), eq(licenses.userId, userId)))
      .limit(1);
    if (!license) return { error: "License not found or not owned by you." };

    // 2. Verify license is active (D-12)
    if (license.status !== "active") return { error: "Only active licenses can be transferred." };

    // 3. Check monthly transfer limit (D-14)
    const transferCount = await this.transferRepo.countTransfersThisMonth(licenseId);
    if (transferCount >= maxTransfersPerMonth) {
      return { error: "Transfer limit reached for this license this month." };
    }

    // 4. Generate unique code
    const code = generateTransferCode();

    // 5. Set expiry 48 hours from now (D-10)
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    // 6. Create transfer record
    await db.insert(licenseTransfers).values({
      licenseId,
      transferCode: code,
      fromUserId: userId,
      status: "pending",
      expiresAt,
    });

    // 7. Audit log (D-15, XFER-03)
    await createAuditLog({
      actorId: userId,
      actorRole: "customer",
      action: "license.transferred",
      targetType: "license",
      targetId: licenseId,
      details: { direction: "initiated", fromUserId: userId, licenseId, transferCode: code },
    });

    return { code };
  }

  async claimCode(
    transferCode: string,
    recipientUserId: string,
  ): Promise<{ success: boolean; licenseId?: string; error?: string }> {
    const result = await db.transaction(async (trx) => {
      // 1. Find and lock the transfer record (pending only, not expired)
      const [transfer] = await trx
        .select()
        .from(licenseTransfers)
        .where(
          and(
            eq(licenseTransfers.transferCode, transferCode),
            eq(licenseTransfers.status, "pending"),
            gte(licenseTransfers.expiresAt, new Date()),
          )
        )
        .limit(1)
        .for("update");

      if (!transfer) return { success: false as const, error: "Invalid or expired transfer code. Please check and try again." };

      // 2. Verify recipient has existing account (D-13)
      const [recipient] = await trx
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, recipientUserId))
        .limit(1);
      if (!recipient) return { success: false as const, error: "Recipient account not found." };

      // 3. Self-transfer check (D-13)
      if (recipientUserId === transfer.fromUserId) {
        return { success: false as const, error: "You cannot transfer a license to yourself." };
      }

      // 4. Update license: change owner, clear activations (D-11)
      await trx
        .update(licenses)
        .set({
          userId: recipientUserId,
          activationDomains: [],
          currentActivations: 0,
          updatedAt: new Date(),
        })
        .where(eq(licenses.id, transfer.licenseId));

      // 5. Mark transfer as completed
      await trx
        .update(licenseTransfers)
        .set({
          status: "completed",
          toUserId: recipientUserId,
          completedAt: new Date(),
        })
        .where(eq(licenseTransfers.id, transfer.id));

      return { success: true as const, licenseId: transfer.licenseId };
    });

    // 6. Audit log + event (outside transaction to avoid blocking)
    if (result.success) {
      await createAuditLog({
        actorId: recipientUserId,
        actorRole: "customer",
        action: "license.transferred",
        targetType: "license",
        targetId: result.licenseId,
        details: { direction: "completed", toUserId: recipientUserId, licenseId: result.licenseId, transferCode },
      });

      try {
        await inProcessPublisher.publish(
          createLicenseEvent(LICENSE_EVENTS.LICENSE_TRANSFERRED, result.licenseId!, {
            direction: "completed",
            transferCode,
          }),
        );
      } catch {}
    }

    return result;
  }
}
