/**
 * System alert email template.
 *
 * Generates HTML email for security and system alert notifications.
 * Follows the canonical ConversionFlow email pattern with warning styling.
 */

interface SystemAlertData {
  event: string;
  message: string;
}

export function generateSystemAlertHTML(
  data: Record<string, unknown>
): string {
  const event = (data.event as string) ?? "Security Alert";
  const message =
    (data.message as string) ??
    "A security-related event was detected on your account.";

  return `
    <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
      <!-- Header -->
      <div style="background: #0047FF; padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0;">ConversionFlow</h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 4px 0 0 0;">by Devsroom</p>
      </div>

      <!-- Body -->
      <div style="padding: 40px;">
        <h2 style="color: #1a1a2e; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
          Security Alert
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          We detected a security-related event on your ConversionFlow account. Please review the details below.
        </p>

        <!-- Alert Details Box -->
        <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="color: #ef4444; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
            ${event}
          </p>
          <p style="color: #3B4480; font-size: 14px; line-height: 1.6; margin: 0;">
            ${message}
          </p>
        </div>

        <!-- What to do -->
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h3 style="color: #1a1a2e; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Recommended actions:</h3>
          <ul style="color: #3B4480; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Review your recent account activity</li>
            <li>Change your password if you suspect unauthorized access</li>
            <li>Enable two-factor authentication for added security</li>
            <li>Contact support if you did not initiate this action</li>
          </ul>
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
}
