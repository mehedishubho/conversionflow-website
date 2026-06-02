/**
 * SuspiciousFlagDetector - Threshold-based suspicious pattern detection
 *
 * Detects suspicious patterns at activation time (D-18).
 * Phase 16 implements burst_ips_24h only.
 * Other flags (vpn_tor_exit, multi_country_7d, plan_limit_breach) are
 * deferred to Phase 19 or are defensive checks.
 */

export interface SuspiciousFlagContext {
  licenseId: string;
  ipAddress: string | null;
  domain: string;
}

export class SuspiciousFlagDetector {
  /**
   * Detect suspicious patterns during an activation attempt.
   *
   * Phase 16 implements:
   * - burst_ips_24h: 5+ unique IPs for same license in 24 hours
   *
   * Phase 19 will add:
   * - vpn_tor_exit: IP matches VPN/Tor exit node list
   * - multi_country_7d: 3+ countries in 7 days (needs geo-IP)
   *
   * plan_limit_breach is defensive -- should never fire if atomic ops work correctly.
   *
   * @param ctx - Context about the activation attempt
   * @param countUniqueIpsSince - Function to count unique IPs (injected from ActivationRepository)
   * @returns Array of flag codes that were triggered
   */
  static async detect(
    ctx: SuspiciousFlagContext,
    countUniqueIpsSince: (licenseId: string, since: Date) => Promise<number>,
  ): Promise<string[]> {
    const flags: string[] = [];

    // burst_ips_24h: 5+ unique IPs for same license in 24h
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const uniqueIps = await countUniqueIpsSince(ctx.licenseId, twentyFourHoursAgo);
    if (uniqueIps >= 5) {
      flags.push("burst_ips_24h");
    }

    // vpn_tor_exit: Phase 16 always returns false (D-18, deferred list)
    // Phase 19 wires: check ctx.ipAddress against VPN/Tor exit node list

    // multi_country_7d: Phase 19 activates (needs geo-IP)

    return flags;
  }
}
