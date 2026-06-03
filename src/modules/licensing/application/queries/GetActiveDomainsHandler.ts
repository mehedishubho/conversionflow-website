/**
 * GetActiveDomainsHandler - Application query handler for active domains
 *
 * Retrieves the currently active domains for a license from the
 * licenses.activation_domains JSONB column (D-28).
 */

import { LicenseRepository } from "@/modules/licensing/infrastructure/repositories/LicenseRepository";

export interface GetActiveDomainsInput {
  licenseId: string;
}

export interface GetActiveDomainsResult {
  domains: string[];
  maxActivations: number;
  currentActivations: number;
}

export class GetActiveDomainsHandler {
  private static licenseRepo = new LicenseRepository();

  /**
   * Get active domains for a license.
   *
   * @param input - License ID
   * @returns Active domains, max activations, and current activations
   */
  static async execute(input: GetActiveDomainsInput): Promise<GetActiveDomainsResult | null> {
    const license = await this.licenseRepo.findById(input.licenseId);
    if (!license) return null;

    return {
      domains: license.activationDomains,
      maxActivations: license.maxActivations,
      currentActivations: license.currentActivations,
    };
  }
}
