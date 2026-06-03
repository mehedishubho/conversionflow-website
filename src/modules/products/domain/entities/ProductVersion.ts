/**
 * ProductVersion Domain Entity
 *
 * Represents a version of a product with full lifecycle tracking (D-06).
 * Supports semver validation and status transitions (stable/beta/draft).
 */

export type VersionStatus = "stable" | "beta" | "draft";

export class ProductVersion {
  /** Semver pattern: major.minor.patch with optional pre-release suffix */
  private static readonly SEMVER_PATTERN = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/;

  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly version: string,
    public readonly downloadUrl: string | null,
    public readonly changelog: string | null,
    public readonly status: VersionStatus,
    public readonly releasedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validateVersion(version);
  }

  /**
   * Release this version: set status to stable and releasedAt to now.
   * Validates that the version is not already stable.
   */
  release(): ProductVersion {
    if (this.status === "stable") {
      throw new Error("Version is already released (stable)");
    }

    return new ProductVersion(
      this.id,
      this.productId,
      this.version,
      this.downloadUrl,
      this.changelog,
      "stable",
      new Date(),
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Check if this version is stable (released).
   */
  isStable(): boolean {
    return this.status === "stable";
  }

  /**
   * Check if this version is in beta.
   */
  isBeta(): boolean {
    return this.status === "beta";
  }

  /**
   * Check if this version is still a draft.
   */
  isDraft(): boolean {
    return this.status === "draft";
  }

  /**
   * Validate version string matches semver format.
   * @param version - Semver string (e.g., "1.2.0" or "1.2.0-beta.1")
   */
  private validateVersion(version: string): void {
    if (!ProductVersion.SEMVER_PATTERN.test(version)) {
      throw new Error(
        `Invalid semver version: "${version}". Expected format: major.minor.patch (e.g., "1.2.0" or "1.2.0-beta.1")`
      );
    }
  }
}
