import { getEmailSender } from "@/modules/notifications/infrastructure/adapters/EmailSender";

interface ApiTokenNotificationParams {
  to: string;
  customerName: string;
  licenseKey: string;
  apiToken: string;
  portalUrl: string;
}

/**
 * Escape HTML special characters to prevent XSS in email templates.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Send API token notification email to customer after token backfill.
 * Per D-06: Bulk email notification to each affected customer.
 *
 * Errors are logged but not thrown so bulk send continues on individual failures.
 */
export async function sendApiTokenNotificationEmail(
  params: ApiTokenNotificationParams
): Promise<void> {
  const { to, licenseKey, apiToken } = params;
  const customerName = escapeHtml(params.customerName);
  const licenseKeySafe = escapeHtml(licenseKey);
  const apiTokenSafe = escapeHtml(apiToken);
  // Validate portalUrl starts with https:// to prevent javascript: URL injection
  const portalUrl = params.portalUrl.startsWith("https://")
    ? params.portalUrl
    : "#";

  const html = `
    <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
      <!-- Header -->
      <div style="background: #0047FF; padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0;">ConversionFlow</h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 4px 0 0 0;">by Devsroom</p>
      </div>

      <!-- Body -->
      <div style="padding: 40px;">
        <h2 style="color: #1a1a2e; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
          Your API Token is Ready
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Hi ${customerName},
        </p>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Your API token for license <strong style="color: #1a1a2e;">${licenseKeySafe}</strong> has been generated. You'll need this token to authenticate API requests from your WooCommerce store.
        </p>

        <!-- API Token Display -->
        <div style="margin-bottom: 24px;">
          <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Your API Token</p>
          <div style="font-family: 'JetBrains Mono', 'Courier New', monospace; background: #f3f4f6; padding: 12px 16px; border-radius: 8px; font-size: 14px; word-break: break-all; border: 1px solid #e5e7eb;">
            ${apiTokenSafe}
          </div>
        </div>

        <!-- Warning Callout -->
        <div style="border-left: 4px solid #f59e0b; background: #fffbeb; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
          <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">
            Save this token -- it will not be shown again.
          </p>
          <p style="color: #92400e; font-size: 13px; margin: 0;">
            Store it securely as you would a password.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${portalUrl}" style="display: inline-block; padding: 12px 32px; background: #0047FF; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            View Your License Details
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #E8ECFA; padding: 24px 40px; text-align: center;">
        <p style="color: #7C87BB; font-size: 12px; margin: 0;">
          ConversionFlow by Devsroom - WooCommerce automation for Bangladeshi eCommerce
        </p>
        <p style="color: #7C87BB; font-size: 12px; margin: 4px 0 0 0;">
          Need help? Contact us at support@conversionflow.com
        </p>
      </div>
    </div>
  `;

  try {
    const sender = await getEmailSender();
    const result = await sender.send({
      from: "ConversionFlow <noreply@conversionflow.dev>",
      to,
      subject: "Your ConversionFlow API Token is Ready",
      html,
    });
    if (result.error) {
      console.error(
        `Failed to send API token notification to ${to}:`,
        result.error
      );
    }
  } catch (error) {
    console.error(
      `Failed to send API token notification to ${to}:`,
      error
    );
  }
}
