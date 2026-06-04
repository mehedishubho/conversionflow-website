/**
 * ActivationRepository - Repository for Activation domain entity
 *
 * Extends BaseRepository from Phase 14 shared infrastructure.
 * Provides activation-specific queries for history and suspicious pattern detection.
 */

import { BaseRepository } from "@/shared/infrastructure/repositories";
import { Activation } from "@/modules/licensing/domain/entities/Activation";
import { licenseActivations } from "@/lib/db/schema";
import { ActivationMapper } from "./mappers/ActivationMapper";
import { eq, sql, desc } from "drizzle-orm";

export class ActivationRepository extends BaseRepository<Activation, typeof licenseActivations.$inferInsert> {
  constructor() {
    super(licenseActivations, new ActivationMapper());
  }

  /**
   * Find activations for a license, ordered by most recent first.
   * Used for activation history display in admin and portal views.
   *
   * @param licenseId - UUID of the license
   * @param limit - Maximum number of records to return (default 50)
   * @param offset - Number of records to skip for pagination (default 0)
   * @returns Array of Activation entities
   */
  async findByLicense(
    licenseId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Activation[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(licenseActivations.licenseId, licenseId))
      .orderBy(desc(licenseActivations.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map((row) =>
      this.mapper.toDomain(row as typeof licenseActivations.$inferSelect),
    );
  }

  /**
   * Count unique IP addresses for a license within a time window.
   * Used by SuspiciousFlagDetector for burst_ips_24h detection (D-18).
   *
   * @param licenseId - UUID of the license
   * @param since - Start of the time window
   * @returns Count of distinct non-null IP addresses
   */
  async countUniqueIpsSince(licenseId: string, since: Date): Promise<number> {
    const result = await this.db
      .select({
        count: sql<number>`COUNT(DISTINCT ${licenseActivations.ipAddress})::int`,
      })
      .from(this.table)
      .where(
        sql`${licenseActivations.licenseId} = ${licenseId} AND ${licenseActivations.createdAt} >= ${since} AND ${licenseActivations.ipAddress} IS NOT NULL`,
      );

    return result[0]?.count ?? 0;
  }
}
