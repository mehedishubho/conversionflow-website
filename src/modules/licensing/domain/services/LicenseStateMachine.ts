/**
 * LicenseStateMachine - Strict state transition validation for license status
 *
 * Per D-23, only these transitions are valid:
 *   active -> grace_period, revoked, suspended
 *   grace_period -> expired
 *   revoked -> active
 *   suspended -> active
 *   expired -> active
 *
 * All other transitions throw an error.
 */

export type LicenseStatus = "active" | "grace_period" | "expired" | "revoked" | "suspended";

const VALID_TRANSITIONS: Record<LicenseStatus, LicenseStatus[]> = {
  active: ["grace_period", "revoked", "suspended"],
  grace_period: ["expired"],
  revoked: ["active"],
  suspended: ["active"],
  expired: ["active"],
};

export class LicenseStateMachine {
  static canTransition(from: LicenseStatus, to: LicenseStatus): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
  }

  static transition(from: LicenseStatus, to: LicenseStatus): LicenseStatus {
    if (!this.canTransition(from, to)) {
      throw new Error(`Invalid license status transition: ${from} -> ${to}`);
    }
    return to;
  }

  static getValidTransitions(from: LicenseStatus): LicenseStatus[] {
    return VALID_TRANSITIONS[from] ?? [];
  }
}
