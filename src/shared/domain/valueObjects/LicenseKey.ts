/**
 * LicenseKey Value Object
 *
 * Immutable value object representing a license key following D-25, D-26, D-28, D-29.
 * - Private constructor with static create() factory method (D-25)
 * - Validates format: uppercase alphanumeric, no ambiguous chars (0/O, 1/I/L)
 * - Strips hyphens/spaces, normalizes to uppercase
 * - Throws on invalid input (D-26: fail fast)
 * - Reference equality via === (D-28)
 * - Rich domain model with behavior (D-29)
 * - Serialized via class-transformer (D-27)
 */
export class LicenseKey {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  /**
   * Create a LicenseKey from a raw string input.
   * Strips hyphens and spaces, normalizes to uppercase, validates format.
   * @param input - Raw license key string (may contain hyphens/spaces)
   * @returns Frozen LicenseKey instance
   * @throws Error if input is invalid
   */
  static create(input: string): LicenseKey {
    if (typeof input !== "string" || input.trim().length === 0) {
      throw new Error("License key cannot be empty");
    }

    // Strip hyphens and spaces, normalize to uppercase
    const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (cleaned.length < 12 || cleaned.length > 32) {
      throw new Error(
        `Invalid license key length: ${cleaned.length}. Must be 12-32 characters.`
      );
    }

    // Exclude ambiguous characters: 0/O, 1/I/L
    const ambiguous = /[01OIL]/;
    if (ambiguous.test(cleaned)) {
      throw new Error(
        "License key cannot contain ambiguous characters (0, O, 1, I, L)"
      );
    }

    return new LicenseKey(cleaned);
  }

  /**
   * Create a LicenseKey from a database value without minimum length validation.
   * Used for loading existing v2.x keys that may be shorter than 12 characters.
   * @param value - Raw license key string from database
   * @returns Frozen LicenseKey instance
   * @throws Error if value is empty or contains invalid characters
   */
  static fromDatabase(value: string): LicenseKey {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error("License key cannot be empty");
    }
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const ambiguous = /[01OIL]/;
    if (ambiguous.test(cleaned)) {
      throw new Error("License key contains invalid characters");
    }
    return new LicenseKey(cleaned);
  }

  /**
   * Raw license key value (uppercase alphanumeric, no separators)
   */
  get value(): string {
    return this._value;
  }

  /**
   * Formatted license key with 4-character segments separated by hyphens.
   * Example: "ABCD-2345-EFGH-6789"
   */
  get formatted(): string {
    return this._value.match(/.{1,4}/g)?.join("-") || this._value;
  }

  /**
   * Reference equality comparison (D-28).
   * For value-based equality, use equalsValue().
   */
  equals(other: LicenseKey): boolean {
    return this === other;
  }

  /**
   * Value-based equality comparison.
   * Returns true if both keys have the same underlying value.
   */
  equalsValue(other: LicenseKey): boolean {
    return this._value === other._value;
  }

  /**
   * Serialize to a plain JSON-compatible object (D-27).
   * Uses class-transformer instanceToPlain for serialization.
   */
  toJSON(): { value: string } {
    return { value: this._value };
  }

  /**
   * Deserialize from a plain object or JSON string back to a LicenseKey.
   * Re-validates during reconstruction to ensure domain invariant.
   */
  static fromJSON(json: { value: string } | string): LicenseKey {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    // Re-create through factory to maintain validation
    return LicenseKey.create(data.value);
  }

  /**
   * String representation returns the raw value.
   */
  toString(): string {
    return this._value;
  }
}
