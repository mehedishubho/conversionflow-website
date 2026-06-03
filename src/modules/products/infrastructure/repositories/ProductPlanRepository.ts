/**
 * ProductPlanRepository - Repository for ProductPlan domain entity
 *
 * Extends BaseRepository from Phase 14 shared infrastructure.
 * Provides plan-specific queries (findByProductId, findBySlug).
 */

import { BaseRepository } from "@/shared/infrastructure/repositories";
import { ProductPlan } from "@/modules/products/domain/entities/ProductPlan";
import { productPlans } from "@/lib/db/schema";
import { ProductPlanMapper } from "./mappers/ProductPlanMapper";
import { eq, and, asc } from "drizzle-orm";

export class ProductPlanRepository extends BaseRepository<ProductPlan, typeof productPlans.$inferSelect> {
  constructor() {
    super(productPlans, new ProductPlanMapper());
  }

  /**
   * Find all plans for a given product, ordered by sortOrder ascending.
   * @param productId - Parent product ID
   * @returns Array of ProductPlan entities
   */
  async findByProductId(productId: string): Promise<ProductPlan[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.productId, productId))
      .orderBy(asc(this.table.sortOrder));

    return results.map((row) =>
      this.mapper.toDomain(row as typeof productPlans.$inferSelect)
    );
  }

  /**
   * Find a plan by product ID and plan slug (compound lookup).
   * @param productId - Parent product ID
   * @param slug - Plan slug (e.g., "starter", "professional", "agency")
   * @returns ProductPlan if found, null otherwise
   */
  async findBySlug(productId: string, slug: string): Promise<ProductPlan | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(this.table.productId, productId),
          eq(this.table.slug, slug)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapper.toDomain(result[0] as typeof productPlans.$inferSelect);
  }
}
