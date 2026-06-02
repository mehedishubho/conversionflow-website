/**
 * Domain Value Object
 *
 * Immutable value object representing a domain/hostname following D-25, D-26, D-28, D-29.
 * - Private constructor with static create() factory method (D-25)
 * - Normalizes: strips protocol, www prefix, trailing slashes, lowercase
 * - Validates hostname format, rejects protocols and paths
 * - Throws on invalid input (D-26: fail fast)
 * - Reference equality via === (D-28)
 * - Rich domain model with behavior (D-29)
 * - Serialized via class-transformer (D-27)
 */

/**
 * Validates a hostname according to RFC 1123.
 * Allows labels of 1-63 chars, total domain 1-253 chars,
 * alphanumeric and hyphens (not at start/end of label).
 */
const HOSTNAME_REGEX =
  /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;

export class Domain {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  /**
   * Create a Domain value object.
   * Strips protocol (https://), www prefix, trailing slashes, lowercases.
   * Validates that the result is a proper hostname.
   * @param input - Raw domain string (e.g., "https://www.example.com/")
   * @returns Frozen Domain instance
   * @throws Error if input is not a valid domain
   */
  static create(input: string): Domain {
    if (typeof input !== "string" || input.trim().length === 0) {
      throw new Error("Domain cannot be empty");
    }

    let normalized = input.trim().toLowerCase();

    // Strip protocol
    normalized = normalized.replace(/^https?:\/\//, "");

    // Strip www prefix
    normalized = normalized.replace(/^www\./, "");

    // Strip trailing slashes and paths
    normalized = normalized.replace(/\/.*$/, "");

    // Strip port numbers
    normalized = normalized.replace(/:\d+$/, "");

    // Validate hostname format
    if (!HOSTNAME_REGEX.test(normalized)) {
      throw new Error(`Invalid domain: ${input}`);
    }

    // Max length check (RFC 1035: 253 chars for FQDN)
    if (normalized.length > 253) {
      throw new Error(`Domain too long: ${normalized.length} chars (max 253)`);
    }

    return new Domain(normalized);
  }

  /**
   * The normalized domain value (lowercase, no protocol/www/slashes).
   */
  get value(): string {
    return this._value;
  }

  /**
   * Extracts the top-level domain (TLD).
   * Example: "store.example.com" -> "com"
   * Example: "example.com.bd" -> "com.bd"
   */
  get tld(): string {
    const parts = this._value.split(".");
    // Handle multi-part TLDs like .com.bd, .co.uk
    if (parts.length >= 3) {
      const lastTwo = parts.slice(-2).join(".");
      // Common two-part TLDs
      const twoPartTlds = [
        "co.uk",
        "com.bd",
        "com.au",
        "co.nz",
        "co.jp",
        "co.in",
        "com.br",
        "com.cn",
        "co.kr",
        "com.sg",
      ];
      if (twoPartTlds.includes(lastTwo)) {
        return lastTwo;
      }
    }
    return parts[parts.length - 1];
  }

  /**
   * Check if this domain is a subdomain.
   * A subdomain has more than 2 parts (subdomain.domain.tld).
   */
  isSubdomain(): boolean {
    const parts = this._value.split(".");
    // Handle two-part TLDs: need more than 3 parts for subdomain
    const twoPartTlds = [
      "co.uk",
      "com.bd",
      "com.au",
      "co.nz",
      "co.jp",
      "co.in",
      "com.br",
      "com.cn",
      "co.kr",
      "com.sg",
    ];
    const lastTwo = parts.slice(-2).join(".");
    if (twoPartTlds.includes(lastTwo)) {
      return parts.length > 3;
    }
    return parts.length > 2;
  }

  /**
   * Extract the root (apex) domain.
   * Example: "store.example.com" -> "example.com"
   */
  get rootDomain(): string {
    const parts = this._value.split(".");
    const twoPartTlds = [
      "co.uk",
      "com.bd",
      "com.au",
      "co.nz",
      "co.jp",
      "co.in",
      "com.br",
      "com.cn",
      "co.kr",
      "com.sg",
    ];
    const lastTwo = parts.slice(-2).join(".");
    if (twoPartTlds.includes(lastTwo)) {
      return parts.slice(-3).join(".");
    }
    return parts.slice(-2).join(".");
  }

  /**
   * Reference equality comparison (D-28).
   */
  equals(other: Domain): boolean {
    return this === other;
  }

  /**
   * Value-based equality comparison.
   */
  equalsValue(other: Domain): boolean {
    return this._value === other._value;
  }

  /**
   * Serialize to JSON-compatible object (D-27).
   */
  toJSON(): { value: string } {
    return { value: this._value };
  }

  /**
   * Deserialize from a plain object or JSON string.
   * Re-validates during reconstruction.
   */
  static fromJSON(json: { value: string } | string): Domain {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    return Domain.create(data.value);
  }

  /**
   * String representation returns the normalized domain.
   */
  toString(): string {
    return this._value;
  }
}
