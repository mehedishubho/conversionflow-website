/**
 * License expiring soon email template.
 *
 * Generates HTML email warning that a license is about to expire.
 * Follows the canonical ConversionFlow email pattern with urgency styling.
 */

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conversionflow.com";

interface LicenseExpiringData {
  planName: string;
  expiresAt: string;
  daysLeft: number;
}

export function generateLicenseExpiringHTML(
  data: Record<string, unknown>
): string {
  const planName = (data.planName as string) ?? "ConversionFlow";
  const expiresAt = (data.expiresAt as string) ?? "";
  const daysLeft = (data.daysLeft as number) ?? 0;

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
          Your License Expires Soon
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Your <strong>${planName}</strong> license is about to expire. Renew now to continue receiving updates, support, and full plugin functionality.
        </p>

        <!-- Days Remaining Warning Box -->
        <div style="background: #fff7ed; border: 2px solid #f79009; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Days Remaining</p>
          <p style="font-size: 32px; font-weight: 800; color: #f79009; margin: 0;">${daysLeft}</p>
          ${
            expiresAt
              ? `<p style="color: #666; font-size: 13px; margin: 8px 0 0 0;">Expires on ${expiresAt}</p>`
              : ""
          }
        </div>

        <!-- What You'll Lose -->
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h3 style="color: #1a1a2e; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Don't lose access to:</h3>
          <ul style="color: #3B4480; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Plugin updates and new features</li>
            <li>Priority support from our team</li>
            <li>License activation on your WooCommerce store</li>
          </ul>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${appUrl}/dashboard/licenses" style="display: inline-block; padding: 12px 32px; background: #0047FF; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Renew License
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
}
