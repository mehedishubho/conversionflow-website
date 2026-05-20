/**
 * License delivery email template.
 *
 * Generates HTML email when a license key is generated/delivered.
 * Follows the canonical ConversionFlow email pattern (blue header, DM Sans, 600px).
 */

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conversionflow.com";

interface LicenseDeliveryData {
  licenseKey: string;
  planName: string;
  expiresAt: string;
}

export function generateLicenseDeliveryHTML(
  data: Record<string, unknown>
): string {
  const licenseKey = (data.licenseKey as string) ?? "N/A";
  const planName = (data.planName as string) ?? "ConversionFlow";
  const expiresAt = (data.expiresAt as string) ?? "";

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
          Your ConversionFlow License Key
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Your license key for <strong>${planName}</strong> has been generated and is ready to use. Copy the key below and activate it in your WordPress plugin settings.
        </p>

        <!-- License Key Box -->
        <div style="background: #f0fdf4; border: 2px solid #12b76a; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Your License Key</p>
          <p style="font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 16px; font-weight: 600; color: #1a1a2e; margin: 0; word-break: break-all;">${licenseKey}</p>
        </div>

        <!-- Plan Details -->
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Plan</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${planName}</td>
            </tr>
            ${
              expiresAt
                ? `<tr>
              <td style="padding: 8px 0; color: #666;">Valid Until</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${expiresAt}</td>
            </tr>`
                : ""
            }
          </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${appUrl}/dashboard" style="display: inline-block; padding: 12px 32px; background: #0047FF; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Go to Dashboard
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
