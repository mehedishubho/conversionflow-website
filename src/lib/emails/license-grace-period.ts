import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface GracePeriodEmailParams {
  to: string;
  licenseKey: string;
  planName: string;
  expiresAt: Date;
  gracePeriodEndsAt: Date;
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

export async function sendGracePeriodEmail(
  params: GracePeriodEmailParams
): Promise<void> {
  const {
    to,
    licenseKey,
    planName,
    expiresAt,
    gracePeriodEndsAt,
  } = params;

  const appUrl = params.appUrl || process.env.NEXT_PUBLIC_APP_URL || "https://conversionflow.com";
  const maskedKey = maskLicenseKey(licenseKey);
  const formattedExpiry = formatDate(expiresAt);
  const formattedGraceEnd = formatDate(gracePeriodEndsAt);

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
          Your License is in Grace Period
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Your ConversionFlow license has expired and is now in the grace period. Your site is still active, but you need to renew before the grace period ends to avoid service interruption.
        </p>

        <!-- Grace Period Warning -->
        <div style="background: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="color: #d97706; font-size: 14px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
            Grace Period Active
          </p>
          <p style="color: #d97706; font-size: 16px; font-weight: 600; margin: 8px 0 0 0;">
            Renew before ${formattedGraceEnd} to keep your license active
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
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${formattedExpiry}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Grace Period Ends</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #d97706;">${formattedGraceEnd}</td>
            </tr>
          </table>
        </div>

        <!-- What This Means -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #1a1a2e; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">What does this mean?</h3>
          <p style="color: #3B4480; font-size: 14px; line-height: 1.6; margin: 0;">
            During the grace period, your license continues to validate and your site keeps working normally. However, once the grace period ends, your license will be marked as expired and premium features will be deactivated. Renew now to prevent any disruption.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${appUrl}/dashboard/licenses" style="display: inline-block; padding: 12px 32px; background: #f59e0b; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
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

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@conversionflow.com",
    to,
    subject: "Your ConversionFlow License is in Grace Period — Renew Now",
    html,
  });
}
