/**
 * Money Value Object
 *
 * Immutable value object representing a monetary amount following D-25, D-26, D-28, D-29.
 * - Private constructor with static create() factory method (D-25)
 * - Validates: non-negative amount, valid currency code (BDT, USD)
 * - Currency-safe arithmetic (add, subtract, multiply)
 * - Locale-aware formatting (BDT with taka symbol, USD with dollar sign)
 * - Throws on invalid input (D-26: fail fast)
 * - Reference equality via === (D-28)
 * - Rich domain model with behavior (D-29)
 * - Serialized via class-transformer (D-27)
 */

/** Supported currency codes */
const SUPPORTED_CURRENCIES = ["BDT", "USD"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export class Money {
  private readonly _amount: number;
  private readonly _currency: string;

  private constructor(amount: number, currency: string) {
    this._amount = amount;
    this._currency = currency;
    Object.freeze(this);
  }

  /**
   * Create a Money value object.
   * Validates non-negative amount and supported currency.
   * @param amount - Non-negative numeric amount
   * @param currency - Currency code (BDT or USD), defaults to BDT
   * @returns Frozen Money instance
   * @throws Error if amount is negative or currency is unsupported
   */
  static create(amount: number, currency: string = "BDT"): Money {
    if (typeof amount !== "number" || isNaN(amount)) {
      throw new Error("Money amount must be a valid number");
    }

    if (amount < 0) {
      throw new Error("Money amount cannot be negative");
    }

    const normalizedCurrency = currency.toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(normalizedCurrency as SupportedCurrency)) {
      throw new Error(
        `Unsupported currency: ${currency}. Supported: ${SUPPORTED_CURRENCIES.join(", ")}`
      );
    }

    // Round to 2 decimal places to avoid floating-point issues
    const roundedAmount = Math.round(amount * 100) / 100;

    return new Money(roundedAmount, normalizedCurrency);
  }

  /**
   * The monetary amount (rounded to 2 decimal places).
   */
  get amount(): number {
    return this._amount;
  }

  /**
   * The currency code (e.g., "BDT", "USD").
   */
  get currency(): string {
    return this._currency;
  }

  /**
   * Add another Money value. Both must have the same currency.
   * @param other - Money to add
   * @returns New Money instance with summed amount
   * @throws Error if currencies differ
   */
  add(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error(
        `Cannot add different currencies: ${this._currency} and ${other._currency}`
      );
    }
    return new Money(this._amount + other._amount, this._currency);
  }

  /**
   * Subtract another Money value. Both must have the same currency.
   * Result must be non-negative.
   * @param other - Money to subtract
   * @returns New Money instance with difference
   * @throws Error if currencies differ or result would be negative
   */
  subtract(other: Money): Money {
    if (this._currency !== other._currency) {
      throw new Error(
        `Cannot subtract different currencies: ${this._currency} and ${other._currency}`
      );
    }
    if (this._amount < other._amount) {
      throw new Error(
        `Subtraction would result in negative amount: ${this._amount} - ${other._amount}`
      );
    }
    return new Money(this._amount - other._amount, this._currency);
  }

  /**
   * Multiply by a scalar factor.
   * @param factor - Non-negative multiplier
   * @returns New Money instance with multiplied amount
   * @throws Error if factor is negative
   */
  multiply(factor: number): Money {
    if (typeof factor !== "number" || isNaN(factor)) {
      throw new Error("Multiplication factor must be a valid number");
    }
    if (factor < 0) {
      throw new Error("Multiplication factor cannot be negative");
    }
    const result = Math.round(this._amount * factor * 100) / 100;
    return new Money(result, this._currency);
  }

  /**
   * Locale-aware formatting.
   * BDT uses taka symbol (Tk), USD uses dollar sign ($).
   */
  format(): string {
    const formatted = this._amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    switch (this._currency) {
      case "BDT":
        return `Tk ${formatted}`;
      case "USD":
        return `$${formatted}`;
      default:
        return `${formatted} ${this._currency}`;
    }
  }

  /**
   * Check if the amount is zero.
   */
  isZero(): boolean {
    return this._amount === 0;
  }

  /**
   * Check if this Money is greater than another (same currency).
   * @throws Error if currencies differ
   */
  greaterThan(other: Money): boolean {
    if (this._currency !== other._currency) {
      throw new Error(
        `Cannot compare different currencies: ${this._currency} and ${other._currency}`
      );
    }
    return this._amount > other._amount;
  }

  /**
   * Reference equality comparison (D-28).
   */
  equals(other: Money): boolean {
    return this === other;
  }

  /**
   * Value-based equality comparison.
   */
  equalsValue(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  /**
   * Serialize to JSON-compatible object (D-27).
   */
  toJSON(): { amount: number; currency: string } {
    return { amount: this._amount, currency: this._currency };
  }

  /**
   * Deserialize from a plain object or JSON string.
   * Re-validates during reconstruction.
   */
  static fromJSON(json: { amount: number; currency: string } | string): Money {
    const data = typeof json === "string" ? JSON.parse(json) : json;
    return Money.create(data.amount, data.currency);
  }

  /**
   * String representation returns formatted value.
   */
  toString(): string {
    return this.format();
  }
}
