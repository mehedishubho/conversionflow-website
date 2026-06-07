/**
 * ProductPlanRepository - Repository for ProductPlan domain entity
 *
 * Extends BaseRepository from Phase 14 shared infrastructure.
 * Provides plan-specific queries (findByProductId, findBySlug).
 */

import { BaseRepository } from "@/shared/infrastructure/repositories";
import { ProductPlan } from "@/modules/products/domain/entities/ProductPlan";
import { productPlans, products } from "@/lib/db/schema";
import { ProductPlanMapper } from "./mappers/ProductPlanMapper";
import { eq, and, asc } from "drizzle-orm";

export class ProductPlanRepository extends BaseRepository<ProductPlan, typeof productPlans.$inferInsert> {
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

  /**
   * Find a plan by product slug and plan slug (JOIN-based lookup).
   *
   * Used by OrderCompletedHandler where orders.productId stores a product slug
   * (text) but product_plans.productId is a UUID. This JOIN avoids the type
   * mismatch by resolving the slug→UUID in the database.
   *
   * @param productSlug - Product slug (e.g., "conversionflow-wp")
   * @param planSlug - Plan slug (e.g., "starter")
   * @returns ProductPlan if found, null otherwise
   */
  async findByProductSlugAndPlanSlug(
    productSlug: string,
    planSlug: string,
  ): Promise<ProductPlan | null> {
    const result = await this.db
      .select({
        id: productPlans.id,
        productId: productPlans.productId,
        name: productPlans.name,
        slug: productPlans.slug,
        description: productPlans.description,
        priceBDT: productPlans.priceBDT,
        priceUSD: productPlans.priceUSD,
        licenseType: productPlans.licenseType,
        billingCycle: productPlans.billingCycle,
        billingDurationMonths: productPlans.billingDurationMonths,
        maxActivations: productPlans.maxActivations,
        features: productPlans.features,
        sortOrder: productPlans.sortOrder,
        active: productPlans.active,
        createdAt: productPlans.createdAt,
        updatedAt: productPlans.updatedAt,
      })
      .from(productPlans)
      .innerJoin(products, eq(productPlans.productId, products.id))
      .where(
        and(
          eq(products.slug, productSlug),
          eq(productPlans.slug, planSlug),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapper.toDomain(result[0] as typeof productPlans.$inferSelect);
  }
}
