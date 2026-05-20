/**
 * Email template registry.
 *
 * Maps notification events to their email template generators.
 * Each entry produces { subject, html } for the email channel adapter.
 * Events without a registered template fall back to a generic layout.
 */

import type { NotificationEvent } from "./types";
import { generateLicenseDeliveryHTML } from "@/lib/emails/license-delivery";
import { generateLicenseExpiringHTML } from "@/lib/emails/license-expiring";
import { generateLicenseExpiredHTML } from "@/lib/emails/license-expired";
import {
  generateTicketCreatedHTML,
  generateTicketReplyHTML,
  generateTicketResolvedHTML,
} from "@/lib/emails/ticket-notification";
import { generateSystemAlertHTML } from "@/lib/emails/system-alert";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface EmailTemplate {
  subject: string;
  html: string;
}

type TemplateGenerator = (data: Record<string, unknown>) => EmailTemplate;

// ──────────────────────────────────────────────
// Helper: ConversionFlow-branded email wrapper
// ──────────────────────────────────────────────

function brandedEmail(subject: string, bodyContent: string): string {
  return `
    <div style="font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
      <div style="background: #0047FF; padding: 32px 40px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0;">ConversionFlow</h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 4px 0 0 0;">by Devsroom</p>
      </div>
      <div style="padding: 40px;">
        ${bodyContent}
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
}

function genericTemplate(
  subject: string,
  message: string
): EmailTemplate {
  const bodyContent = `
    <h2 style="color: #1a1a2e; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
      ${subject}
    </h2>
    <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0;">
      ${message}
    </p>
  `;

  return {
    subject: `${subject} - ConversionFlow`,
    html: brandedEmail(subject, bodyContent),
  };
}

// ──────────────────────────────────────────────
// Template Registry
// ──────────────────────────────────────────────

export const TEMPLATE_REGISTRY: Partial<
  Record<NotificationEvent, TemplateGenerator>
> = {
  // Order events
  "order.created": (data) => ({
    subject: `Order Confirmation - ConversionFlow`,
    html: brandedEmail(
      "Order Confirmation",
      `
        <h2 style="color: #1a1a2e; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
          Order ${data.orderNumber ?? "placed"}
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Thank you for your purchase! Your order for <strong>${data.planName ?? "a plan"}</strong> has been created and is awaiting payment.
        </p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Order #</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${data.orderNumber ?? ""}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Status</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #f79009;">Pending</td>
            </tr>
          </table>
        </div>
      `
    ),
  }),

  "order.confirmed": (data) => ({
    subject: `Order ${data.orderNumber ?? ""} Confirmed - ConversionFlow`,
    html: brandedEmail(
      "Order Confirmed",
      `
        <h2 style="color: #1a1a2e; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
          Order Confirmed
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          Payment received for <strong>${data.planName ?? "your plan"}</strong>. Your license is being generated.
        </p>
        <div style="background: #f0fdf4; border: 2px solid #12b76a; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="color: #12b76a; font-size: 14px; font-weight: 600; margin: 0;">Payment Verified</p>
        </div>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://conversionflow.com"}/dashboard" style="display: inline-block; padding: 12px 32px; background: #0047FF; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Go to Dashboard
          </a>
        </div>
      `
    ),
  }),

  "order.payment_failed": (data) => ({
    subject: `Payment Failed - ConversionFlow`,
    html: brandedEmail(
      "Payment Failed",
      `
        <h2 style="color: #1a1a2e; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
          Payment Failed
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          We could not process your payment for <strong>${data.planName ?? "your order"}</strong>. Please try again or use a different payment method.
        </p>
        <div style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="color: #ef4444; font-size: 14px; font-weight: 600; margin: 0;">Order #${data.orderNumber ?? ""} - Payment Not Completed</p>
        </div>
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://conversionflow.com"}/pricing" style="display: inline-block; padding: 12px 32px; background: #0047FF; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 14px;">
            Retry Payment
          </a>
        </div>
      `
    ),
  }),

  "order.refunded": (data) => ({
    subject: `Refund Processed - ConversionFlow`,
    html: brandedEmail(
      "Refund Processed",
      `
        <h2 style="color: #1a1a2e; font-size: 20px; font-weight: 700; margin: 0 0 16px 0;">
          Refund Processed
        </h2>
        <p style="color: #3B4480; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
          A refund of <strong>${data.amount ?? "the amount"}</strong> has been processed for your order #${data.orderNumber ?? ""}. It may take 3-5 business days to appear.
        </p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Order #</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${data.orderNumber ?? ""}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Amount</td>
              <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${data.amount ?? "N/A"}</td>
            </tr>
          </table>
        </div>
      `
    ),
  }),

  // License events
  "license.generated": (data) => ({
    subject: `Your License Key - ConversionFlow`,
    html: generateLicenseDeliveryHTML(data),
  }),

  "license.delivered": (data) => ({
    subject: `Your License Key - ConversionFlow`,
    html: generateLicenseDeliveryHTML(data),
  }),

  "license.expiring_soon": (data) => ({
    subject: `License Expiring Soon - ConversionFlow`,
    html: generateLicenseExpiringHTML(data),
  }),

  "license.expired": (data) => ({
    subject: `License Expired - ConversionFlow`,
    html: generateLicenseExpiredHTML(data),
  }),

  // Ticket events
  "ticket.created": (data) => ({
    subject: `Support Ticket #${data.ticketId ?? ""} Received - ConversionFlow`,
    html: generateTicketCreatedHTML(data),
  }),

  "ticket.reply_received": (data) => ({
    subject: `New Reply on Ticket #${data.ticketId ?? ""} - ConversionFlow`,
    html: generateTicketReplyHTML(data),
  }),

  "ticket.resolved": (data) => ({
    subject: `Ticket #${data.ticketId ?? ""} Resolved - ConversionFlow`,
    html: generateTicketResolvedHTML(data),
  }),

  "ticket.status_changed": (data) => ({
    subject: `Ticket #${data.ticketId ?? ""} Updated - ConversionFlow`,
    html: genericTemplate(
      `Ticket Status Updated`,
      `Your support ticket "${data.subject ?? ""}" status has been changed to ${data.newStatus ?? "updated"}.`
    ).html,
  }),

  // System events
  "system.security_alert": (data) => ({
    subject: `Security Alert - ConversionFlow`,
    html: generateSystemAlertHTML(data),
  }),

  "system.blog_published": (data) => ({
    subject: `New Blog Post: ${data.title ?? "Untitled"} - ConversionFlow`,
    html: genericTemplate(
      `New Blog Post`,
      `A new article "${data.title ?? ""}" has been published on ConversionFlow. Check it out!`
    ).html,
  }),
};

// ──────────────────────────────────────────────
// Lookup function
// ──────────────────────────────────────────────

/**
 * Get email template for a notification event.
 * Returns a generic fallback template if no specific template is registered.
 */
export function getEmailTemplate(
  event: NotificationEvent,
  data: Record<string, unknown>
): EmailTemplate {
  const generator = TEMPLATE_REGISTRY[event];
  if (generator) {
    return generator(data);
  }

  // Generic fallback
  return genericTemplate(
    "Notification from ConversionFlow",
    `You have a new notification regarding your ConversionFlow account. Please log in to your dashboard for details.`
  );
}
