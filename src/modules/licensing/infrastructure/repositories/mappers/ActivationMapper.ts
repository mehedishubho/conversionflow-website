/**
 * ActivationMapper - Domain-to-data mapper for Activation entity
 *
 * Converts between Activation domain entities and license_activations table rows.
 * Handles JSONB conversion for suspiciousFlags and nullable fields.
 */

import type { IMapper } from "@/shared/infrastructure/repositories";
import { Activation } from "@/modules/licensing/domain/entities/Activation";
import type { licenseActivations } from "@/lib/db/schema";

export class ActivationMapper implements IMapper<Activation, typeof licenseActivations.$inferSelect> {
  /**
   * Convert database row to Activation domain entity.
   * Handles JSONB deserialization for suspiciousFlags (defaults to []).
   */
  toDomain(row: typeof licenseActivations.$inferSelect): Activation {
    return new Activation(
      row.id,
      row.licenseId,
      row.domain,
      row.action,
      row.ipAddress ?? null,
      row.userAgent ?? null,
      row.verificationMethod ?? null,
      Array.isArray(row.suspiciousFlags) ? row.suspiciousFlags as string[] : [],
      row.createdAt,
    );
  }

  /**
   * Convert Activation domain entity to database row data.
   * Omits createdAt (handled by DB default).
   */
  toData(domain: Activation): typeof licenseActivations.$inferInsert {
    return {
      id: domain.id,
      licenseId: domain.licenseId,
      domain: domain.domain,
      action: domain.action,
      ipAddress: domain.ipAddress,
      userAgent: domain.userAgent,
      verificationMethod: domain.verificationMethod,
      suspiciousFlags: domain.suspiciousFlags,
    };
  }
}
