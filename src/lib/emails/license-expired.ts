import { getEmailSender } from "@/modules/notifications/infrastructure/adapters/EmailSender";

interface LicenseExpiredEmailParams {
  to: string;
  licenseKey: string;
  planName: string;
  expiresAt: Date;
  appUrl?: string;
}

function maskLicenseKey(key: string): string {
  if (key.length <= 8) return key + "***";
  return key.substring(0, 8) + "***";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function sendLicenseExpiredEmail(
  params: LicenseExpiredEmailParams
): Promise<void> {
  const {
    to,
    licenseKey,
    planName,
    expiresAt,
  } = params;

  const appUrl = params.appUrl || process.env.NEXT_PUBLIC_APP_URL || "https://conversionflow.com";
  const maskedKey = maskLicenseKey(licenseKey);
  const formattedExpiry = formatDate(expiresAt);

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
          Your License Has Expired
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Your ConversionFlow license has expired. Premium features, updates, and support are no longer available for your site. Renew your license to restore full functionality.
        </p>

        <!-- Expired Status Badge -->
        <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
          <p style="color: #dc2626; font-size: 14px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
            License Expired
          </p>
          <p style="color: #dc2626; font-size: 16px; font-weight: 600; margin: 8px 0 0 0;">
            Expired on ${formattedExpiry}
          </p>
        </div>

        <!-- License Details -->
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Plan</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">License Key</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e; font-family: 'JetBrains Mono', 'Courier New', monospace;">${maskedKey}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Expired On</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #dc2626;">${formattedExpiry}</td>
            </tr>
          </table>
        </div>

        <!-- Impact Info -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #1a1a2e; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">What happens now?</h3>
          <p style="color: #3B4480; font-size: 14px; line-height: 1.6; margin: 0;">
            Your site may lose access to premium ConversionFlow features. You will no longer receive plugin updates or priority support. Renew your license to restore everything immediately.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${appUrl}/dashboard/licenses" style="display: inline-block; padding: 12px 32px; background: #ef4444; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Renew Your License
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

  const sender = await getEmailSender();
  const result = await sender.send({
    to,
    subject: "Your ConversionFlow License Has Expired",
    html,
    from: process.env.EMAIL_FROM || "noreply@conversionflow.com",
  });
  if (result.error) {
    throw new Error(`Email send failed: ${result.error}`);
  }
}
