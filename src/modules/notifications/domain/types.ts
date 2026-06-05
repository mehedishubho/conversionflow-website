/**
 * Notification domain types (D-01, D-06, D-11)
 *
 * Shared type definitions for the notification engine.
 * These types are used across adapters, services, schema, and UI components.
 */

/** Delivery channels for notifications */
export type Channel = "email" | "in_app";

/** Notification categories matching existing notifications.type values */
export type NotificationCategory = "license" | "billing" | "support" | "system";

/** Delivery status per channel in notification_deliveries table */
export type DeliveryStatus = "pending" | "sent" | "delivered" | "failed";

/** User notification preferences stored as JSONB on the user table */
export interface NotificationPreferences {
  license: boolean;
  billing: boolean;
  support: boolean;
  system: boolean;
  channels: {
    email: boolean;
    in_app: boolean;
  };
}
