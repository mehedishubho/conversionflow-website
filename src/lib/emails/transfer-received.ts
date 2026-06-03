import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface TransferReceivedParams {
  to: string;
  licenseKey: string;
  planName: string;
  previousOwnerEmail: string;
}

export async function sendTransferReceivedEmail(
  params: TransferReceivedParams
): Promise<void> {
  const { to, licenseKey, planName, previousOwnerEmail } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conversionflow.com";

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
          You've Received a License!
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          You have received a new license. Here are the details:
        </p>

        <!-- License Details -->
        <div style="background: #f0fdf4; border: 2px solid #12b76a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Plan</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">License Key</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e; font-family: 'JetBrains Mono', 'Courier New', monospace; word-break: break-all;">${licenseKey}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Transferred From</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${previousOwnerEmail}</td>
            </tr>
          </table>
        </div>

        <!-- Next Steps -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #1a1a2e; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">Next Steps</h3>
          <p style="color: #3B4480; font-size: 14px; line-height: 1.6; margin: 0;">
            Activate your domains in the license management dashboard to start using your new license.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${appUrl}/dashboard/licenses" style="display: inline-block; padding: 12px 32px; background: #0047FF; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Go to My Licenses
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
    subject: "You've Received a License - ConversionFlow",
    html,
  });
}
