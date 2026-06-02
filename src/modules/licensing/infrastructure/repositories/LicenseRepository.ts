/**
 * LicenseRepository - Repository for License domain entity
 *
 * Extends BaseRepository from Phase 14 shared infrastructure.
 * Provides license-specific queries and atomic activation operations (D-16).
 */

import { BaseRepository } from "@/shared/infrastructure/repositories";
import { License } from "@/modules/licensing/domain/entities/License";
import { licenses } from "@/lib/db/schema";
import { LicenseMapper } from "./mappers/LicenseMapper";
import { eq, and, sql } from "drizzle-orm";

export class LicenseRepository extends BaseRepository<License, typeof licenses.$inferSelect> {
  constructor() {
    super(licenses, new LicenseMapper());
  }

  /**
   * Find a license by its unique license key.
   * @param licenseKey - The license key string (e.g., CF-XXXX-XXXX-XXXX-XXXX-XXXX)
   * @returns License if found, null otherwise
   */
  async findByKey(licenseKey: string): Promise<License | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(licenses.licenseKey, licenseKey))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapper.toDomain(result[0] as typeof licenses.$inferSelect);
  }

  /**
   * Atomically increment activation count and append domain to activation_domains.
   *
   * Single UPDATE...RETURNING statement (D-16, Pattern 3 from RESEARCH.md):
   * - Increments current_activations by 1
   * - Appends domain to activation_domains JSONB array
   * - Only succeeds if current_activations < max_activations AND domain not already in array
   * - Returns updated row, or null if conditions not met (limit reached or domain already active)
   *
   * @param licenseId - UUID of the license
   * @param domain - Domain to activate (normalized)
   * @returns Updated row if successful, null if limit reached or domain already activated
   */
  async atomicIncrementIfUnderLimit(
    licenseId: string,
    domain: string,
  ): Promise<typeof licenses.$inferSelect | null> {
    const result = await this.db
      .update(licenses)
      .set({
        currentActivations: sql`${licenses.currentActivations} + 1`,
        activationDomains: sql`array_append(COALESCE(${licenses.activationDomains}, '[]'::jsonb), to_jsonb(${domain}))`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(licenses.id, licenseId),
          sql`${licenses.currentActivations} < ${licenses.maxActivations}`,
          sql`NOT (COALESCE(${licenses.activationDomains}, '[]'::jsonb) @> to_jsonb(${domain}::text))`,
        ),
      )
      .returning();

    return result[0] ?? null;
  }

  /**
   * Atomically decrement activation count and remove domain from activation_domains.
   *
   * Uses GREATEST(count-1, 0) to floor at zero.
   * Removes domain from JSONB array via jsonb_agg filter.
   * Only succeeds if domain is currently in the activation_domains array.
   *
   * @param licenseId - UUID of the license
   * @param domain - Domain to deactivate (normalized)
   * @returns Updated row if successful, null if domain was not active
   */
  async atomicDecrement(
    licenseId: string,
    domain: string,
  ): Promise<typeof licenses.$inferSelect | null> {
    const result = await this.db
      .update(licenses)
      .set({
        currentActivations: sql`GREATEST(${licenses.currentActivations} - 1, 0)`,
        activationDomains: sql`(SELECT jsonb_agg(elem) FROM jsonb_array_elements(COALESCE(${licenses.activationDomains}, '[]'::jsonb)) elem WHERE elem #>> '{}' != ${domain})`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(licenses.id, licenseId),
          sql`COALESCE(${licenses.activationDomains}, '[]'::jsonb) @> to_jsonb(${domain}::text)`,
        ),
      )
      .returning();

    return result[0] ?? null;
  }

  /**
   * Update the API token hash for a license.
   * Used when regenerating or provisioning API tokens.
   *
   * @param licenseId - UUID of the license
   * @param hash - SHA-256 hash of the new API token
   */
  async updateApiTokenHash(licenseId: string, hash: string): Promise<void> {
    await this.db
      .update(licenses)
      .set({
        apiTokenHash: hash,
        updatedAt: new Date(),
      })
      .where(eq(licenses.id, licenseId));
  }
}
