/**
 * ProductRepository - Repository for Product domain entity
 *
 * Extends BaseRepository from Phase 14 shared infrastructure.
 * Provides product-specific queries (findBySlug).
 */

import { BaseRepository } from "@/shared/infrastructure/repositories";
import { Product } from "@/modules/products/domain/entities/Product";
import { products } from "@/lib/db/schema";
import { ProductMapper } from "./mappers/ProductMapper";
import { eq } from "drizzle-orm";

export class ProductRepository extends BaseRepository<Product, typeof products.$inferInsert> {
  constructor() {
    super(products, new ProductMapper());
  }

  /**
   * Find a product by its unique slug.
   * @param slug - URL-safe product slug
   * @returns Product if found, null otherwise
   */
  async findBySlug(slug: string): Promise<Product | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.slug, slug))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return this.mapper.toDomain(result[0] as typeof products.$inferSelect);
  }
}
