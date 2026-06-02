/**
 * ActivateLicenseHandler - Application command handler for domain activation
 *
 * Implements the full activation flow per D-10 (single round-trip verification),
 * D-16 (atomic activation count), and D-18 (suspicious pattern detection).
 *
 * Flow: parse key -> lookup license -> validate API token -> check status ->
 *       check expiry -> check already activated -> consume verification token ->
 *       verify domain proof (DNS/file/meta) -> detect suspicious flags ->
 *       atomic increment + JSONB update -> log to history -> publish event
 */

import { LicenseRepository } from "@/modules/licensing/infrastructure/repositories/LicenseRepository";
import { ActivationRepository } from "@/modules/licensing/infrastructure/repositories/ActivationRepository";
import { ApiTokenGenerator } from "@/modules/licensing/domain/services/ApiTokenGenerator";
import { VerificationTokenIssuer } from "@/modules/licensing/domain/services/VerificationTokenIssuer";
import { DnsVerifier } from "@/modules/licensing/infrastructure/adapters/DnsVerifier";
import { HttpProofFetcher } from "@/modules/licensing/infrastructure/adapters/HttpProofFetcher";
import { SuspiciousFlagDetector } from "@/modules/licensing/infrastructure/adapters/SuspiciousFlagDetector";
import { LicenseKey } from "@/shared/domain/valueObjects/LicenseKey";
import { Activation } from "@/modules/licensing/domain/entities/Activation";
import { inProcessPublisher } from "@/shared/infrastructure/eventBus/EventBus";
import {
  LICENSE_EVENTS,
  createLicenseEvent,
} from "@/modules/licensing/domain/events/LicenseEvents";

export interface ActivateInput {
  licenseKey: string;
  apiToken: string;
  domain: string;
  verificationMethod: "dns" | "file" | "meta";
  verificationToken: string;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface ActivateResult {
  success: boolean;
  error?: string;
  licenseId?: string;
  plan?: string;
  expiresAt?: Date | null;
  maxActivations?: number;
  currentActivations?: number;
}

export class ActivateLicenseHandler {
  private static licenseRepo = new LicenseRepository();
  private static activationRepo = new ActivationRepository();

  /**
   * Execute license activation for a domain.
   *
   * Verifies domain ownership via DNS/file/meta proof, atomically increments
   * activation count, logs to history, and publishes domain event.
   */
  static async execute(input: ActivateInput): Promise<ActivateResult> {
    // 1. Parse and validate license key
    let key: LicenseKey;
    try {
      key = LicenseKey.create(input.licenseKey);
    } catch {
      return { success: false, error: "INVALID_LICENSE" };
    }

    const domain = input.domain.toLowerCase().trim();

    // 2. Look up license
    const license = await this.licenseRepo.findByKey(key.value);
    if (!license) return { success: false, error: "INVALID_LICENSE" };

    // 3. Validate API token
    if (!license.apiTokenHash || !ApiTokenGenerator.validate(input.apiToken, license.apiTokenHash)) {
      return { success: false, error: "INVALID_LICENSE" };
    }

    // 4. Check status
    if (license.status !== "active") return { success: false, error: "INVALID_LICENSE" };

    // 5. Check expiry
    if (license.expiresAt && new Date() > license.expiresAt) {
      return { success: false, error: "INVALID_LICENSE" };
    }

    // 6. Check if domain already activated
    if (license.activationDomains.includes(domain)) {
      return { success: false, error: "ALREADY_ACTIVATED" };
    }

    // 7. Consume verification token (single-use per D-13)
    // Note: Token is consumed before proof verification. If proof fails,
    // the customer must request a new token. This prevents token replay
    // at the cost of requiring re-issuance on verification failure.
    const tokenValid = await VerificationTokenIssuer.consume(
      input.verificationToken,
      license.id,
      domain,
    );
    if (!tokenValid) return { success: false, error: "VERIFICATION_FAILED" };

    // 8. Verify domain proof (server-side per D-10)
    const proofValid = await this.verifyProof(domain, input.verificationToken, input.verificationMethod);
    if (!proofValid) return { success: false, error: "VERIFICATION_FAILED" };

    // 9. Detect suspicious flags (D-18)
    const flags = await SuspiciousFlagDetector.detect(
      { licenseId: license.id, ipAddress: input.ipAddress, domain },
      this.activationRepo.countUniqueIpsSince.bind(this.activationRepo),
    );

    // 10. Atomic increment + JSONB domain update (D-16)
    const updated = await this.licenseRepo.atomicIncrementIfUnderLimit(license.id, domain);
    if (!updated) return { success: false, error: "ACTIVATION_LIMIT_REACHED" };

    // 11. Log to license_activations history
    await this.activationRepo.create(
      new Activation(
        "",
        license.id,
        domain,
        "activate",
        input.ipAddress,
        input.userAgent,
        input.verificationMethod,
        flags,
        new Date(),
      ),
    );

    // 12. Publish event for cache invalidation (D-20)
    await inProcessPublisher.publish(
      createLicenseEvent(LICENSE_EVENTS.LICENSE_ACTIVATED, license.id, {
        licenseId: license.id,
        licenseKey: key.value,
        domain,
        currentActivations: updated.currentActivations,
      }),
    );

    return {
      success: true,
      licenseId: license.id,
      plan: license.plan,
      expiresAt: license.expiresAt,
      maxActivations: updated.maxActivations,
      currentActivations: updated.currentActivations,
    };
  }

  /**
   * Verify domain proof using the selected verification method.
   * Server fetches the proof directly -- never trusts client-supplied content (T-16-11).
   */
  private static async verifyProof(
    domain: string,
    token: string,
    method: "dns" | "file" | "meta",
  ): Promise<boolean> {
    switch (method) {
      case "dns":
        return DnsVerifier.verify(domain, token);
      case "file":
        return HttpProofFetcher.verifyFile(domain, token);
      case "meta":
        return HttpProofFetcher.verifyMetaTag(domain, token);
    }
  }
}
