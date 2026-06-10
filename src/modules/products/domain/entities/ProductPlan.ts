/**
 * ProductPlan Domain Entity
 *
 * Represents a pricing/licensing plan for a product.
 * Enforces business invariants for:
 * - D-03: Dual currency pricing (BDT + USD)
 * - D-04: Lifetime vs subscription licensing rules
 * - D-05: Per-plan activation limits
 * - D-07: Named feature flags via JSONB
 */

import { Money } from "@/shared/domain/valueObjects";

export type LicenseType = "lifetime" | "subscription";
export type BillingCycle = "monthly" | "yearly" | "custom";

export class ProductPlan {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string | null,
    private readonly _priceBDT: number,
    private readonly _priceUSD: number,
    public readonly licenseType: LicenseType,
    public readonly billingCycle: BillingCycle | null,
    public readonly billingDurationMonths: number | null,
    public readonly maxActivations: number,
    public readonly features: Record<string, Record<string, boolean>>,
    public readonly sortOrder: number,
    public readonly active: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validateInvariants();
  }

  /**
   * Validate all business invariants for a product plan.
   * Throws Error if any invariant is violated.
   */
  private validateInvariants(): void {
    // D-04: Lifetime plans must not have billing cycle
    if (this.licenseType === "lifetime") {
      if (this.billingCycle !== null) {
        throw new Error("Lifetime plans must not have a billing cycle");
      }
      if (this.billingDurationMonths !== null) {
        throw new Error("Lifetime plans must not have billing duration");
      }
    }

    // D-04: Subscription plans must have billing cycle
    if (this.licenseType === "subscription") {
      if (this.billingCycle === null) {
        throw new Error("Subscription plans must have a billing cycle");
      }
    }

    // D-05: maxActivations must be non-negative
    if (this.maxActivations < 0) {
      throw new Error("Max activations cannot be negative");
    }

    // D-07: Features must be nested per-platform boolean map
    for (const [key, platformMap] of Object.entries(this.features)) {
      if (typeof platformMap !== "object" || platformMap === null) {
        throw new Error(`Feature "${key}" must be a platform map object`);
      }
      for (const [platform, value] of Object.entries(platformMap)) {
        if (typeof value !== "boolean") {
          throw new Error(`Feature "${key}" platform "${platform}" must be a boolean value`);
        }
      }
    }
  }

  /**
   * Get BDT price as Money value object.
   */
  get priceBDT(): Money {
    return Money.create(this._priceBDT, "BDT");
  }

  /**
   * Get USD price as Money value object.
   */
  get priceUSD(): Money {
    return Money.create(this._priceUSD, "USD");
  }

  /**
   * Check if this plan allows unlimited activations.
   * 0 means unlimited per D-05.
   */
  get isUnlimitedActivations(): boolean {
    return this.maxActivations === 0;
  }
}
