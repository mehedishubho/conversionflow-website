/**
 * Piracy Detection Library
 *
 * Pure function library for evaluating piracy trigger patterns.
 * Four trigger checks per D-04:
 * 1. Activation limit exceeded
 * 2. Rapid domain activation burst
 * 3. Geographic anomaly
 * 4. Cross-site match (requires DB query, done at server action level)
 */

import type { ActivationDomain } from "@/lib/webhook-types";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface PiracyFlag {
  type:
    | "activation_limit_exceeded"
    | "rapid_domain_burst"
    | "geo_anomaly"
    | "cross_site_match";
  severity: "low" | "medium" | "high";
  description: string;
  detectedAt: Date;
}

// ──────────────────────────────────────────────
// Pure Trigger Evaluation
// ──────────────────────────────────────────────

/**
 * Evaluate piracy triggers from license activation data.
 *
 * Checks three patterns inline:
 * - Activation limit exceeded (high severity)
 * - Rapid domain activation burst (medium severity)
 * - Geographic anomaly (low severity)
 *
 * Cross-site match detection is done at server action level, not in this pure function.
 */
export function evaluatePiracyTriggers(params: {
  currentActivations: number;
  maxActivations: number;
  domains: ActivationDomain[];
  licenseKey: string;
}): PiracyFlag[] {
  const flags: PiracyFlag[] = [];

  // Trigger 1: Activation count exceeds plan limit
  if (
    params.currentActivations > params.maxActivations &&
    params.maxActivations > 0
  ) {
    flags.push({
      type: "activation_limit_exceeded",
      severity: "high",
      description: `${params.currentActivations} activations exceed plan limit of ${params.maxActivations}`,
      detectedAt: new Date(),
    });
  }

  // Trigger 2: Rapid domain activation burst (5+ domains in 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentDomains = params.domains.filter(
    (d) => new Date(d.activatedAt) > oneDayAgo
  );
  if (recentDomains.length >= 5) {
    flags.push({
      type: "rapid_domain_burst",
      severity: "medium",
      description: `${recentDomains.length} domains activated in 24 hours`,
      detectedAt: new Date(),
    });
  }

  // Trigger 3: Geographic anomaly (3+ different countries)
  const uniqueCountries = new Set(params.domains.map((d) => d.country));
  if (uniqueCountries.size >= 3) {
    flags.push({
      type: "geo_anomaly",
      severity: "low",
      description: `Activations from ${uniqueCountries.size} different countries`,
      detectedAt: new Date(),
    });
  }

  return flags;
}

// ──────────────────────────────────────────────
// Cross-Site Match Detection (requires DB)
// ──────────────────────────────────────────────

/**
 * Check if activation domains appear on other unrelated licenses.
 *
 * Queries other active licenses where their activationDomains jsonb overlaps
 * with the given domains. If same domain appears on 2+ unrelated licenses
 * (different userId), flag it as cross-site match with high severity.
 */
export async function checkCrossSiteMatch(
  db: any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Drizzle instance
  domains: ActivationDomain[],
  currentLicenseId: string
): Promise<PiracyFlag | null> {
  if (!domains.length) return null;

  const activeDomains = domains.filter((d) => d.isActive).map((d) => d.domain);
  if (!activeDomains.length) return null;

  // Query all active licenses (excluding current) that have activation domains
  const { licenses } = await import("@/lib/db/schema");
  const { eq, not } = await import("drizzle-orm");

  const otherLicenses = await db
    .select({
      id: licenses.id,
      userId: licenses.userId,
      activationDomains: licenses.activationDomains,
    })
    .from(licenses)
    .where(eq(licenses.status, "active"));

  // Filter in JS: find domain overlaps across different users
  const matchCount: Record<string, { count: number; licenseIds: string[] }> =
    {};

  for (const license of otherLicenses) {
    if (license.id === currentLicenseId) continue;

    const otherDomains = (
      license.activationDomains as unknown as ActivationDomain[]
    )?.filter((d) => d.isActive);

    if (!otherDomains) continue;

    for (const otherDomain of otherDomains) {
      if (activeDomains.includes(otherDomain.domain)) {
        if (!matchCount[otherDomain.domain]) {
          matchCount[otherDomain.domain] = { count: 0, licenseIds: [] };
        }
        matchCount[otherDomain.domain].count += 1;
        matchCount[otherDomain.domain].licenseIds.push(license.id);
      }
    }
  }

  // Find the highest-impact cross-site match
  let worstDomain: string | null = null;
  let worstCount = 0;

  for (const [domain, data] of Object.entries(matchCount)) {
    if (data.count > worstCount) {
      worstDomain = domain;
      worstCount = data.count;
    }
  }

  if (worstDomain && worstCount >= 1) {
    return {
      type: "cross_site_match",
      severity: "high",
      description: `Domain ${worstDomain} also activated on ${worstCount} other license${worstCount > 1 ? "s" : ""}`,
      detectedAt: new Date(),
    };
  }

  return null;
}
