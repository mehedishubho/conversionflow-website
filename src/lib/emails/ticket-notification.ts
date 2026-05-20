/**
 * Ticket notification email templates.
 *
 * Three template generators for ticket lifecycle emails:
 * - ticket created
 * - ticket reply received
 * - ticket resolved
 *
 * All follow the canonical ConversionFlow email pattern.
 */

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://conversionflow.com";

interface TicketCreatedData {
  ticketId: string;
  subject: string;
}

export function generateTicketCreatedHTML(
  data: Record<string, unknown>
): string {
  const ticketId = (data.ticketId as string) ?? "";
  const subject = (data.subject as string) ?? "Support Request";

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
          Support Ticket Received
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Thank you for reaching out! We have received your support request and will respond within 24 hours.
        </p>

        <!-- Ticket Details -->
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Ticket #</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${ticketId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Subject</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Status</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #f79009;">Open</td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${appUrl}/dashboard/support" style="display: inline-block; padding: 12px 32px; background: #0047FF; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            View Ticket
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

interface TicketReplyData {
  ticketId: string;
  replyPreview: string;
}

export function generateTicketReplyHTML(
  data: Record<string, unknown>
): string {
  const ticketId = (data.ticketId as string) ?? "";
  const replyPreview = (data.replyPreview as string) ?? "A new reply has been posted.";

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
          New Reply on Your Support Ticket
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          A new reply has been posted on your support ticket #${ticketId}.
        </p>

        <!-- Reply Preview -->
        <div style="background: #f0f4ff; border-left: 4px solid #0047FF; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 24px;">
          <p style="color: #3B4480; font-size: 14px; line-height: 1.6; margin: 0;">
            ${replyPreview}
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${appUrl}/dashboard/support" style="display: inline-block; padding: 12px 32px; background: #0047FF; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            View Reply
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

interface TicketResolvedData {
  ticketId: string;
  subject: string;
}

export function generateTicketResolvedHTML(
  data: Record<string, unknown>
): string {
  const ticketId = (data.ticketId as string) ?? "";
  const subject = (data.subject as string) ?? "Support Request";

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
          Your Support Ticket Has Been Resolved
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Your support ticket has been marked as resolved. If your issue persists, feel free to reopen the ticket or create a new one.
        </p>

        <!-- Ticket Details -->
        <div style="background: #f0fdf4; border: 2px solid #12b76a; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Ticket #</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${ticketId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Subject</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Status</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #12b76a;">Resolved</td>
            </tr>
          </table>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${appUrl}/dashboard/support" style="display: inline-block; padding: 12px 32px; background: #0047FF; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            View Ticket
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
