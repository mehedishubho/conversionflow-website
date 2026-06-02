/**
 * License Domain Entity
 *
 * Aggregate root for the Licensing bounded context.
 * Represents a license with activation tracking, expiry management, and status lifecycle.
 */

export class License {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly productId: string,
    public readonly plan: string,
    public readonly licenseKey: string,
    public readonly status: string,
    public readonly activationDomains: string[],
    public readonly maxActivations: number,
    public readonly currentActivations: number,
    public readonly apiTokenHash: string | null,
    public readonly expiresAt: Date | null,
    public readonly orderId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Whether the license is in active status.
   */
  get isActive(): boolean {
    return this.status === "active";
  }

  /**
   * Whether the license can accept new activations.
   * maxActivations of 0 means unlimited activations.
   */
  get canActivate(): boolean {
    return this.maxActivations === 0 || this.currentActivations < this.maxActivations;
  }

  /**
   * Whether the license has an expiry date set.
   */
  get hasExpiry(): boolean {
    return this.expiresAt !== null;
  }

  /**
   * Whether the license has passed its expiry date.
   * Returns false if no expiry is set (lifetime licenses).
   */
  get isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  /**
   * Factory method to create a new License with auto-generated timestamps.
   */
  static create(data: Omit<License, "id" | "createdAt" | "updatedAt">): License {
    const now = new Date();
    return new License(
      "",
      data.userId,
      data.productId,
      data.plan,
      data.licenseKey,
      data.status,
      data.activationDomains,
      data.maxActivations,
      data.currentActivations,
      data.apiTokenHash,
      data.expiresAt,
      data.orderId,
      now,
      now,
    );
  }
}
