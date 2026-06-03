/**
 * ExpiryCalculator - Exact calendar date calculation for subscription expiry
 *
 * Per D-14:
 * - Monthly = same day next month with last-day-of-month clamping
 *   (Jan 31 -> Feb 28/29, Apr 30 -> May 30, Jun 30 -> Jul 30)
 * - Yearly = same date next year
 * - Custom = use billingDurationMonths
 *
 * Per D-16: Returns null for lifetime licenses (caller's responsibility).
 */

export class ExpiryCalculator {
  /**
   * Calculate exact expiry date from a start date.
   * @param startDate - The starting date (typically creation/purchase date)
   * @param billingCycle - "monthly", "yearly", or "custom"
   * @param billingDurationMonths - Required when billingCycle is "custom"
   * @returns Exact calendar expiry date
   */
  static calculateExpiry(
    startDate: Date,
    billingCycle: "monthly" | "yearly" | "custom" | null,
    billingDurationMonths: number | null,
  ): Date {
    const months =
      billingCycle === "monthly"
        ? 1
        : billingCycle === "yearly"
          ? 12
          : (billingDurationMonths ?? 12);

    const result = new Date(startDate);
    const targetDay = startDate.getDate();

    // Add months
    result.setMonth(result.getMonth() + months);

    // Last-day clamping: if the day rolled over (e.g., Jan 31 -> Mar 3),
    // clamp back to last day of target month
    if (result.getDate() !== targetDay) {
      result.setDate(0); // Last day of previous month (which is the target month)
    }

    return result;
  }
}
