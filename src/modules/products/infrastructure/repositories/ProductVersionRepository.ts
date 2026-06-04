/**
 * ProductVersionRepository - Repository for ProductVersion domain entity
 *
 * Extends BaseRepository from Phase 14 shared infrastructure.
 * Provides version-specific queries (findByProductId, findLatestStable).
 */

import { BaseRepository } from "@/shared/infrastructure/repositories";
import { ProductVersion } from "@/modules/products/domain/entities/ProductVersion";
import { productVersions } from "@/lib/db/schema";
import { ProductVersionMapper } from "./mappers/ProductVersionMapper";
import { eq, and, desc } from "drizzle-orm";

export class ProductVersionRepository extends BaseRepository<ProductVersion, typeof productVersions.$inferInsert> {
  constructor() {
    super(productVersions, new ProductVersionMapper());
  }

  /**
   * Find all versions for a given product, ordered by createdAt descending.
   * @param productId - Parent product ID
   * @returns Array of ProductVersion entities
   */
  async findByProductId(productId: string): Promise<ProductVersion[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.productId, productId))
      .orderBy(desc(this.table.createdAt));

    return results.map((row) =>
      this.mapper.toDomain(row as typeof productVersions.$inferSelect)
    );
  }

  /**
   * Find the latest stable version for a given product.
   * @param productId - Parent product ID
   * @returns Latest stable ProductVersion if found, null otherwise
   */
  async findLatestStable(productId: string): Promise<ProductVersion | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(this.table.productId, productId),
          eq(this.table.status, "stable")
        )
      )
      .orderBy(desc(this.table.releasedAt))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapper.toDomain(result[0] as typeof productVersions.$inferSelect);
  }
}
