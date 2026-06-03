/**
 * DnsVerifier - DNS TXT record verification for domain ownership
 *
 * Resolves TXT records for a domain and checks for the expected
 * cf-license-verify=<token> record. Uses a 5-second timeout via Promise.race
 * to prevent hanging on unresponsive DNS servers (D-11).
 */

import { promises as dnsPromises } from "dns";

const DNS_TIMEOUT_MS = 5000;

export class DnsVerifier {
  /**
   * Verify domain ownership via DNS TXT record.
   *
   * Looks for a TXT record matching: cf-license-verify=<expectedToken>
   * Times out after 5 seconds to prevent hanging.
   *
   * @param domain - The domain to verify (e.g., "example.com")
   * @param expectedToken - The verification token to match
   * @returns true if the expected TXT record is found, false otherwise
   */
  static async verify(domain: string, expectedToken: string): Promise<boolean> {
    const expected = `cf-license-verify=${expectedToken}`;

    try {
      const result = await Promise.race<boolean>([
        dnsPromises
          .resolveTxt(domain)
          .then((records) => {
            for (const record of records) {
              const joined = record.join("");
              if (joined === expected) return true;
            }
            return false;
          })
          .catch(() => false),
        new Promise<false>((resolve) =>
          setTimeout(() => resolve(false), DNS_TIMEOUT_MS),
        ),
      ]);
      return result;
    } catch {
      return false;
    }
  }
}
