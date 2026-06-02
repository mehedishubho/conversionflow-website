/**
 * HttpProofFetcher - HTTPS file and meta tag proof verification
 *
 * Two verification methods per D-12:
 * 1. File verification: fetches https://<domain>/.well-known/conversionflow-verify.txt
 * 2. Meta tag verification: fetches https://<domain>/ homepage HTML, looks for meta tag
 *
 * Both methods use HTTPS only, with Cache-Control: no-cache and 10s timeout (T-16-07).
 */

const FETCH_TIMEOUT_MS = 10000;

export class HttpProofFetcher {
  /**
   * Verify domain ownership via file upload.
   * Fetches https://<domain>/.well-known/conversionflow-verify.txt
   * and checks that the content matches the expected token.
   *
   * @param domain - The domain to verify
   * @param expectedToken - The verification token to match
   * @returns true if the file contains the expected token, false otherwise
   */
  static async verifyFile(domain: string, expectedToken: string): Promise<boolean> {
    try {
      const url = `https://${domain}/.well-known/conversionflow-verify.txt`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: "follow",
        headers: { "Cache-Control": "no-cache" },
      });
      clearTimeout(timer);
      if (!response.ok) return false;
      const text = await response.text();
      return text.trim() === expectedToken;
    } catch {
      return false;
    }
  }

  /**
   * Verify domain ownership via HTML meta tag.
   * Fetches https://<domain>/ homepage and looks for:
   * <meta name="cf-license-verify" content="<token>">
   *
   * This is the "easy mode" for WordPress customers -- the plugin can inject
   * the meta tag via wp_head hook without the customer lifting a finger.
   *
   * @param domain - The domain to verify
   * @param expectedToken - The verification token to match
   * @returns true if the meta tag is found with matching content, false otherwise
   */
  static async verifyMetaTag(domain: string, expectedToken: string): Promise<boolean> {
    try {
      const url = `https://${domain}/`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: "follow",
        headers: { "Cache-Control": "no-cache" },
      });
      clearTimeout(timer);
      if (!response.ok) return false;
      const html = await response.text();
      const pattern = `<meta\\s+name=["']cf-license-verify["']\\s+content=["']${escapeRegex(expectedToken)}["']`;
      const regex = new RegExp(pattern, "i");
      return regex.test(html);
    } catch {
      return false;
    }
  }
}

/**
 * Escape special regex characters in a string.
 * Used to safely embed the verification token in a regex pattern.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
