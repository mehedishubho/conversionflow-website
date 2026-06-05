import { getEmailSender } from "@/modules/notifications/infrastructure/adapters/EmailSender";

interface TransferCompletedParams {
  to: string;
  licenseKey: string;
  planName: string;
  recipientEmail: string;
}

function maskLicenseKey(key: string): string {
  if (key.length <= 8) return key + "***";
  return key.substring(0, 8) + "***";
}

export async function sendTransferCompletedEmail(
  params: TransferCompletedParams
): Promise<void> {
  const { to, licenseKey, planName, recipientEmail } = params;
  const maskedKey = maskLicenseKey(licenseKey);

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
          License Transfer Completed
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Your license has been successfully transferred.
        </p>

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
              <td style="padding: 8px 0; color: #666;">Transferred To</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${recipientEmail}</td>
            </tr>
          </table>
        </div>

        <!-- Notice -->
        <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
          <p style="color: #991b1b; font-size: 14px; line-height: 1.6; margin: 0;">
            The license is now owned by <strong>${recipientEmail}</strong>. All domain activations have been cleared.
            You will no longer have access to this license.
          </p>
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
    subject: "License Transfer Completed - ConversionFlow",
    html,
    from: process.env.EMAIL_FROM || "noreply@conversionflow.com",
  });
  if (result.error) {
    throw new Error(`Email send failed: ${result.error}`);
  }
}
