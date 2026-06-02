/**
 * GetActivationHistoryHandler - Application query handler for activation history
 *
 * Retrieves paginated activation history for a license.
 * Used by admin activation history view (D-30) and customer portal (D-28).
 */

import { ActivationRepository } from "@/modules/licensing/infrastructure/repositories/ActivationRepository";
import { Activation } from "@/modules/licensing/domain/entities/Activation";

export interface GetActivationHistoryInput {
  licenseId: string;
  limit?: number;
  offset?: number;
}

export class GetActivationHistoryHandler {
  private static activationRepo = new ActivationRepository();

  /**
   * Get activation history for a license, ordered by most recent first.
   *
   * @param input - License ID with optional pagination
   * @returns Array of Activation entities
   */
  static async execute(input: GetActivationHistoryInput): Promise<Activation[]> {
    return this.activationRepo.findByLicense(
      input.licenseId,
      input.limit ?? 50,
      input.offset ?? 0,
    );
  }
}
