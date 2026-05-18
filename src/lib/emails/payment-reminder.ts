import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface PaymentReminderParams {
  to: string;
  orderNumber: string;
  planName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function sendPaymentReminderEmail(
  params: PaymentReminderParams
) {
  const { to, orderNumber, planName, amount, currency, paymentMethod } = params;
  const formattedAmount = formatCurrency(amount, currency);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conversionflow.com";

  const html = `
    <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background: #f79009; padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0;">ConversionFlow</h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 4px 0 0 0;">by Devsroom</p>
      </div>

      <div style="padding: 40px;">
        <h2 style="color: #1a1a2e; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
          Payment Reminder
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Your payment is still pending. Please complete your payment to activate your license.
        </p>

        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Order #</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Plan</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${planName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Amount</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Payment Method</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${paymentMethod}</td>
            </tr>
          </table>
        </div>

        <p style="color: #3B4480; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
          If you have already completed your payment, please disregard this email. Your order will be verified shortly.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${appUrl}/dashboard/billing" style="display: inline-block; padding: 12px 32px; background: #f79009; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            View Billing
          </a>
        </div>
      </div>

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
    subject: `Payment Reminder - Order #${orderNumber}`,
    html,
  });
}
