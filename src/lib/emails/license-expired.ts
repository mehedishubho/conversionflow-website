/**
 * License expired email template.
 *
 * Generates HTML email when a license has expired.
 * Follows the canonical ConversionFlow email pattern with renewal CTA.
 */

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conversionflow.com";

interface LicenseExpiredData {
  planName: string;
  expiredAt: string;
}

export function generateLicenseExpiredHTML(
  data: Record<string, unknown>
): string {
  const planName = (data.planName as string) ?? "ConversionFlow";
  const expiredAt = (data.expiredAt as string) ?? "";

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
          Your ConversionFlow License Has Expired
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Your <strong>${planName}</strong> license has expired and your plugin is no longer receiving updates or support.
          Renew now to restore full functionality.
        </p>

        <!-- Expired Notice Box -->
        <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="color: #ef4444; font-size: 14px; font-weight: 600; margin: 0;">License Expired</p>
          ${
            expiredAt
              ? `<p style="color: #666; font-size: 13px; margin: 4px 0 0 0;">Expired on ${expiredAt}</p>`
              : ""
          }
        </div>

        <!-- What's Affected -->
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h3 style="color: #1a1a2e; font-size: 14px; font-weight: 600; margin: 0 0 12px 0;">Your plugin is now limited:</h3>
          <ul style="color: #3B4480; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>No plugin updates or new features</li>
            <li>No access to priority support</li>
            <li>Plugin may display deactivation notices</li>
            <li>Some features may be disabled</li>
          </ul>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${appUrl}/dashboard/licenses" style="display: inline-block; padding: 12px 32px; background: #0047FF; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Renew Now
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
