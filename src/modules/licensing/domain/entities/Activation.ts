/**
 * Activation Domain Entity
 *
 * Represents a single activation/deactivation event in the Licensing bounded context.
 * Tracks domain, IP, user agent, and verification method for each activation attempt.
 */

export type ActivationAction = "activate" | "deactivate";
export type VerificationMethod = "dns" | "file" | "meta";

export class Activation {
  constructor(
    public readonly id: string,
    public readonly licenseId: string,
    public readonly domain: string,
    public readonly action: ActivationAction,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public readonly verificationMethod: VerificationMethod | null,
    public readonly suspiciousFlags: string[],
    public readonly createdAt: Date,
  ) {}
}
