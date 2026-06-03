/**
 * Email Value Object
 *
 * Immutable value object representing an email address following D-25, D-26, D-28, D-29.
 * - Private constructor with static create() factory method (D-25)
 * - Validates RFC 5322 format via regex
 * - Normalizes to lowercase, trims whitespace
 * - Throws on invalid input (D-26: fail fast)
 * - Reference equality via === (D-28)
 * - Rich domain model with behavior (D-29)
 * - Serialized via class-transformer (D-27)
 */

/**
 * RFC 5322 compliant email regex.
 * Covers the vast majority of valid email addresses in practice.
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }

  /**
   * Create an Email value object.
   * Validates RFC 5322 format, normalizes to lowercase, trims whitespace.
   * @param input - Raw email string
   * @returns Frozen Email instance
   * @throws Error if input is not a valid email address
   */
  static create(input: string): Email {
    if (typeof input !== "string" || input.trim().length === 0) {
      throw new Error("Email cannot be empty");
    }

    const normalized = input.trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalized)) {
      throw new Error(`Invalid email address: ${input}`);
    }

    return new Email(normalized);
  }

  /**
   * The normalized email address (lowercase, trimmed).
   */
  get value(): string {
    return this._value;
  }

  /**
   * The domain part of the email address (after @).
   * Example: "user@example.com" -> "example.com"
   */
  get domain(): string {
    return this._value.split("@")[1];
  }

  /**
   * The local part of the email address (before @).
   * Example: "user@example.com" -> "user"
   */
  get local(): string {
    return this._value.split("@")[0];
  }

  /**
   * Reference equality comparison (D-28).
   */
  equals(other: Email): boolean {
    return this === other;
  }

  /**
   * Value-based equality comparison.
   * Since emails are normalized to lowercase, this compares string values.
   */
  equalsValue(other: Email): boolean {
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
  static fromJSON(json: { value: string } | string): Email {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    return Email.create(data.value);
  }

  /**
   * String representation returns the normalized email.
   */
  toString(): string {
    return this._value;
  }
}
