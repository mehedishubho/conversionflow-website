/**
 * LicenseMapper - Domain-to-data mapper for License entity
 *
 * Converts between License domain entities and licenses table rows.
 * Handles JSONB conversion for activationDomains and nullable fields.
 */

import type { IMapper } from "@/shared/infrastructure/repositories";
import { License } from "@/modules/licensing/domain/entities/License";
import type { licenses } from "@/lib/db/schema";

export class LicenseMapper implements IMapper<License, typeof licenses.$inferInsert> {
  /**
   * Convert database row to License domain entity.
   * Handles JSONB deserialization for activationDomains (defaults to []).
   */
  toDomain(row: typeof licenses.$inferSelect): License {
    return new License(
      row.id,
      row.userId,
      row.productId,
      row.plan,
      row.licenseKey,
      row.status,
      Array.isArray(row.activationDomains) ? row.activationDomains as string[] : [],
      row.maxActivations ?? 0,
      row.currentActivations ?? 0,
      row.apiTokenHash ?? null,
      row.expiresAt,
      row.orderId ?? null,
      row.createdAt,
      row.updatedAt,
    );
  }

  /**
   * Convert License domain entity to database row data.
   * Omits timestamps with DB defaults (createdAt, updatedAt).
   */
  toData(domain: License): typeof licenses.$inferInsert {
    // Omit id when empty so DB defaultRandom() generates a UUID
    const data: typeof licenses.$inferInsert = {
      userId: domain.userId,
      productId: domain.productId,
      plan: domain.plan,
      licenseKey: domain.licenseKey,
      status: domain.status as "active" | "expired" | "revoked" | "suspended" | "grace_period",
      activationDomains: domain.activationDomains,
      maxActivations: domain.maxActivations,
      currentActivations: domain.currentActivations,
      apiTokenHash: domain.apiTokenHash,
      expiresAt: domain.expiresAt,
      orderId: domain.orderId,
    };
    if (domain.id) {
      data.id = domain.id;
    }
    return data;
  }
}
