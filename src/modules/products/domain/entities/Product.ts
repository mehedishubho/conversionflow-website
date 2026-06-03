/**
 * Product Domain Entity
 *
 * Represents a product in the Products bounded context.
 * Multi-product support from day one (D-01).
 * Standard SaaS hierarchy: Product -> Plans + Versions (D-02).
 */

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly currentVersion: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validateName(name);
  }

  /**
   * Create a new Product with auto-generated slug from name.
   * @param name - Product name (must be non-empty)
   * @param description - Optional product description
   */
  static create(name: string, description?: string): Product {
    const slug = Product.generateSlug(name);
    const now = new Date();
    return new Product(
      "",
      name,
      slug,
      description ?? null,
      null,
      now,
      now,
    );
  }

  /**
   * Update product name and regenerate slug.
   */
  updateName(name: string): Product {
    this.validateName(name);
    return new Product(
      this.id,
      name,
      Product.generateSlug(name),
      this.description,
      this.currentVersion,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Update product description.
   */
  updateDescription(description: string | null): Product {
    return new Product(
      this.id,
      this.name,
      this.slug,
      description,
      this.currentVersion,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Update current version string.
   */
  updateCurrentVersion(version: string | null): Product {
    return new Product(
      this.id,
      this.name,
      this.slug,
      this.description,
      version,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Generate URL-safe slug from product name.
   * Lowercases, replaces non-alphanumeric with hyphens, trims leading/trailing hyphens.
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  /**
   * Validate product name is non-empty.
   */
  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error("Product name must be a non-empty string");
    }
  }
}
