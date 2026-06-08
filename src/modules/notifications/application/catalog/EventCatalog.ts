/**
 * Event Catalog (D-08, D-09)
 *
 * Code-based mapping of all core transactional events to their
 * notification routing config: channels, email template, category, and title.
 *
 * Type-safe and version-controlled. No admin UI for editing.
 * To add new events, add an entry here and deploy.
 */

import type { Channel, NotificationCategory } from "../../domain/types";

export interface EventCatalogEntry {
  /** Which channels to dispatch this event to */
  channels: Channel[];
  /** Name of the email template function in src/lib/emails/ */
  template: string;
  /** Notification category for user preference filtering */
  category: NotificationCategory;
  /** Default title for in-app notification */
  title: string;
}

/**
 * Core transactional event catalog (D-09)
 *
 * 11 events covering orders, licenses, transfers, password reset, and API tokens.
 */
export const EVENT_CATALOG: Record<string, EventCatalogEntry> = {
  // in_app only — the billing OrderCompletedHandler sends the correct email
  // directly with licenseKey/apiToken. Email channel here would cause a duplicate.
  "order.completed": {
    channels: ["in_app"],
    template: "sendOrderConfirmationEmail",
    category: "billing",
    title: "Order Confirmed",
  },
  // in_app only — the billing OrderCompletedHandler sends the correct email
  // directly with licenseKey/apiToken. Email channel here would cause a duplicate
  // without those credentials.
  "license.created": {
    channels: ["in_app"],
    template: "sendOrderConfirmationEmail",
    category: "license",
    title: "License Key Generated",
  },
  "license.expiring": {
    channels: ["email", "in_app"],
    template: "sendLicenseExpiryReminderEmail",
    category: "license",
    title: "License Expiring Soon",
  },
  "license.grace_period_started": {
    channels: ["email", "in_app"],
    template: "sendGracePeriodEmail",
    category: "license",
    title: "License Grace Period",
  },
  "license.expired": {
    channels: ["email", "in_app"],
    template: "sendLicenseExpiredEmail",
    category: "license",
    title: "License Expired",
  },
  "password.reset": {
    channels: ["email"],
    template: "sendResetPasswordEmail",
    category: "system",
    title: "Password Reset",
  },
  "api_token.created": {
    channels: ["email", "in_app"],
    template: "sendApiTokenNotificationEmail",
    category: "license",
    title: "API Token Created",
  },
  "license.transferred": {
    channels: ["email", "in_app"],
    template: "sendTransferNotificationEmail",
    category: "license",
    title: "License Transferred",
  },
  "transfer.initiated": {
    channels: ["email", "in_app"],
    template: "sendTransferInitiatedEmail",
    category: "license",
    title: "Transfer Initiated",
  },
  "transfer.completed": {
    channels: ["email", "in_app"],
    template: "sendTransferCompletedEmail",
    category: "license",
    title: "Transfer Completed",
  },
  "transfer.received": {
    channels: ["email", "in_app"],
    template: "sendTransferReceivedEmail",
    category: "license",
    title: "Transfer Received",
  },
};
