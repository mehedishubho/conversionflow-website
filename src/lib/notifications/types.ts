/**
 * Notification engine types and event catalog.
 *
 * Defines all 14 notification events across 4 categories (orders, licenses,
 * tickets, system), their default channels, and title/message templates.
 */

// ──────────────────────────────────────────────
// Type Definitions
// ──────────────────────────────────────────────

export type NotificationCategory = "orders" | "licenses" | "tickets" | "system";

export type NotificationChannel = "email" | "in_app" | "whatsapp";

export type NotificationEvent =
  // Order events
  | "order.created"
  | "order.confirmed"
  | "order.payment_failed"
  | "order.refunded"
  // License events
  | "license.generated"
  | "license.delivered"
  | "license.expiring_soon"
  | "license.expired"
  // Ticket events
  | "ticket.created"
  | "ticket.reply_received"
  | "ticket.status_changed"
  | "ticket.resolved"
  // System events
  | "system.blog_published"
  | "system.security_alert";

export interface EventConfig {
  category: NotificationCategory;
  defaultChannels: NotificationChannel[];
  titleTemplate: (data: Record<string, unknown>) => string;
  messageTemplate: (data: Record<string, unknown>) => string;
}

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "orders",
  "licenses",
  "tickets",
  "system",
];

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  "email",
  "in_app",
  "whatsapp",
];

// ──────────────────────────────────────────────
// Event Catalog
// ──────────────────────────────────────────────

export const EVENT_CATALOG: Record<NotificationEvent, EventConfig> = {
  // Order events
  "order.created": {
    category: "orders",
    defaultChannels: ["email", "in_app"],
    titleTemplate: (data) => `Order ${data.orderNumber ?? "placed"}`,
    messageTemplate: (data) =>
      `Your order for ${data.planName ?? "a plan"} has been created and is awaiting payment.`,
  },
  "order.confirmed": {
    category: "orders",
    defaultChannels: ["email", "in_app"],
    titleTemplate: (data) => `Order ${data.orderNumber ?? ""} confirmed`,
    messageTemplate: (data) =>
      `Payment received for ${data.planName ?? "your plan"}. Your license is being generated.`,
  },
  "order.payment_failed": {
    category: "orders",
    defaultChannels: ["email", "in_app"],
    titleTemplate: (data) => `Payment failed for order ${data.orderNumber ?? ""}`,
    messageTemplate: (data) =>
      `We could not process your payment for ${data.planName ?? "your order"}. Please try again or use a different method.`,
  },
  "order.refunded": {
    category: "orders",
    defaultChannels: ["email", "in_app"],
    titleTemplate: (data) => `Refund processed for order ${data.orderNumber ?? ""}`,
    messageTemplate: (data) =>
      `A refund of ${data.amount ?? "the amount"} has been processed for your order. It may take 3-5 business days to appear.`,
  },

  // License events
  "license.generated": {
    category: "licenses",
    defaultChannels: ["email", "in_app"],
    titleTemplate: (data) => `License key generated`,
    messageTemplate: (data) =>
      `Your license key for ${data.planName ?? "your plan"} has been generated and is ready to use.`,
  },
  "license.delivered": {
    category: "licenses",
    defaultChannels: ["email", "in_app"],
    titleTemplate: (data) => `License key delivered`,
    messageTemplate: (data) =>
      `Your license key for ${data.planName ?? "your plan"} has been delivered to your email.`,
  },
  "license.expiring_soon": {
    category: "licenses",
    defaultChannels: ["email", "in_app", "whatsapp"],
    titleTemplate: (data) => `License expiring soon`,
    messageTemplate: (data) =>
      `Your license for ${data.planName ?? "your plan"} expires in ${data.daysRemaining ?? "a few"} days. Renew now to avoid interruption.`,
  },
  "license.expired": {
    category: "licenses",
    defaultChannels: ["email", "in_app", "whatsapp"],
    titleTemplate: (data) => `License expired`,
    messageTemplate: (data) =>
      `Your license for ${data.planName ?? "your plan"} has expired. Renew to continue receiving updates and support.`,
  },

  // Ticket events
  "ticket.created": {
    category: "tickets",
    defaultChannels: ["email", "in_app"],
    titleTemplate: (data) => `Support ticket #${data.ticketId ?? ""} created`,
    messageTemplate: (data) =>
      `Your support ticket "${data.subject ?? ""}" has been created. We will respond within 24 hours.`,
  },
  "ticket.reply_received": {
    category: "tickets",
    defaultChannels: ["email", "in_app"],
    titleTemplate: (data) => `New reply on ticket #${data.ticketId ?? ""}`,
    messageTemplate: (data) =>
      `A new reply has been added to your support ticket "${data.subject ?? ""}".`,
  },
  "ticket.status_changed": {
    category: "tickets",
    defaultChannels: ["email", "in_app"],
    titleTemplate: (data) => `Ticket #${data.ticketId ?? ""} status updated`,
    messageTemplate: (data) =>
      `Your support ticket "${data.subject ?? ""}" status has been changed to ${data.newStatus ?? "updated"}.`,
  },
  "ticket.resolved": {
    category: "tickets",
    defaultChannels: ["email", "in_app"],
    titleTemplate: (data) => `Ticket #${data.ticketId ?? ""} resolved`,
    messageTemplate: (data) =>
      `Your support ticket "${data.subject ?? ""}" has been marked as resolved. If you need further help, feel free to reopen it.`,
  },

  // System events
  "system.blog_published": {
    category: "system",
    defaultChannels: ["in_app"],
    titleTemplate: (data) => `New blog post: ${data.title ?? "Untitled"}`,
    messageTemplate: (data) =>
      `A new article "${data.title ?? ""}" has been published. Check it out!`,
  },
  "system.security_alert": {
    category: "system",
    defaultChannels: ["in_app"],
    titleTemplate: () => `Security alert`,
    messageTemplate: (data) =>
      `${data.message ?? "A security-related event was detected on your account."}`,
  },
};
