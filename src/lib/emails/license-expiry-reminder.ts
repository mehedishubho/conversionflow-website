import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ExpiryReminderParams {
  to: string;
  licenseKey: string;
  planName: string;
  daysUntilExpiry: number;
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

function getSubject(days: number): string {
  if (days <= 1) return "FINAL NOTICE: Your ConversionFlow License Expires Tomorrow!";
  if (days <= 3) return `Urgent: Your ConversionFlow License Expires in ${days} Days`;
  if (days <= 7) return `Reminder: Your ConversionFlow License Expires in ${days} Days`;
  return `Your ConversionFlow License Expires in ${days} Days`;
}

function getUrgencyColor(days: number): { bg: string; border: string; text: string } {
  if (days <= 1) return { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" };
  if (days <= 7) return { bg: "#fffbeb", border: "#f59e0b", text: "#d97706" };
  return { bg: "#f0fdf4", border: "#22c55e", text: "#16a34a" };
}

function getUrgencyLabel(days: number): string {
  if (days <= 1) return "FINAL NOTICE";
  if (days <= 3) return "URGENT";
  if (days <= 7) return "REMINDER";
  return "NOTICE";
}

export async function sendLicenseExpiryReminderEmail(
  params: ExpiryReminderParams
): Promise<void> {
  const {
    to,
    licenseKey,
    planName,
    daysUntilExpiry,
    expiresAt,
  } = params;

  const appUrl = params.appUrl || process.env.NEXT_PUBLIC_APP_URL || "https://conversionflow.com";
  const maskedKey = maskLicenseKey(licenseKey);
  const formattedDate = formatDate(expiresAt);
  const subject = getSubject(daysUntilExpiry);
  const urgency = getUrgencyColor(daysUntilExpiry);
  const urgencyLabel = getUrgencyLabel(daysUntilExpiry);

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
          License Expiration Reminder
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Your ConversionFlow license is expiring soon. Please renew to avoid any interruption to your service.
        </p>

        <!-- Urgency Banner -->
        <div style="background: ${urgency.bg}; border: 2px solid ${urgency.border}; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; text-align: center;">
          <p style="color: ${urgency.text}; font-size: 14px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
            ${urgencyLabel}
          </p>
          <p style="color: ${urgency.text}; font-size: 24px; font-weight: 800; margin: 8px 0 0 0;">
            ${daysUntilExpiry} Day${daysUntilExpiry !== 1 ? "s" : ""} Remaining
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
              <td style="padding: 8px 0; color: #666;">Expires On</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${formattedDate}</td>
            </tr>
          </table>
        </div>

        <!-- Renewal Info -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #1a1a2e; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">What happens if you don't renew?</h3>
          <p style="color: #3B4480; font-size: 14px; line-height: 1.6; margin: 0;">
            After expiration, your license enters a grace period where it continues to work. Once the grace period ends, your site may lose access to premium features, updates, and support.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${appUrl}/dashboard/licenses" style="display: inline-block; padding: 12px 32px; background: #0047FF; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Manage Your License
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
    subject,
    html,
  });
}
