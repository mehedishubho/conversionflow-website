/**
 * Central notification dispatch service.
 *
 * sendNotification() is the single entry point all trigger points call.
 * It routes to channel adapters (in-app, WhatsApp, email) based on event
 * config and user preferences, logging every attempt to notification_log.
 *
 * One channel failure does NOT prevent other channels from sending.
 */

import { db } from "@/lib/db";
import { notificationLog } from "@/lib/db/schema";
import {
  EVENT_CATALOG,
  NOTIFICATION_CHANNELS,
} from "@/lib/notifications/types";
import type {
  NotificationEvent,
  NotificationChannel,
} from "@/lib/notifications/types";
import { sendInApp } from "@/lib/notifications/channels/in-app";
import { queueWhatsApp } from "@/lib/notifications/channels/whatsapp";
import { sendEmail } from "@/lib/notifications/channels/email";
import { getNotificationPreferences } from "@/lib/notifications/preferences";

/**
 * Send a notification to a user across configured channels.
 *
 * @param userId    - Target user ID
 * @param event     - Notification event from the catalog
 * @param data      - Template data for title/message rendering
 * @param channels  - Override channels (defaults to event's defaultChannels)
 */
export async function sendNotification(
  userId: string,
  event: NotificationEvent,
  data: Record<string, unknown>,
  channels?: NotificationChannel[]
): Promise<void> {
  // Validate event against catalog (T-07-01)
  const eventConfig = EVENT_CATALOG[event];
  if (!eventConfig) {
    console.warn(`[Notifications] Unknown event: ${event}`);
    return;
  }

  // Determine target channels
  const targetChannels = channels ?? eventConfig.defaultChannels;

  // Check user preferences
  const prefs = await getNotificationPreferences(userId, eventConfig.category);

  // Process each channel independently
  for (const channel of targetChannels) {
    // Validate channel
    if (!NOTIFICATION_CHANNELS.includes(channel)) {
      continue;
    }

    // Check if user has opted out
    if (prefs[channel] === false) {
      await logNotification(userId, event, channel, "skipped");
      continue;
    }

    try {
      switch (channel) {
        case "email":
          await sendEmail(userId, event, data);
          await logNotification(userId, event, channel, "sent");
          break;

        case "in_app":
          await sendInApp(userId, event, data);
          await logNotification(userId, event, channel, "sent");
          break;

        case "whatsapp":
          await queueWhatsApp(userId, event, data);
          await logNotification(userId, event, channel, "sent");
          break;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `[Notifications] Failed to send ${channel} notification for ${event}: ${errorMessage}`
      );
      await logNotification(userId, event, channel, "failed", errorMessage);
    }
  }
}

/**
 * Log a notification attempt to the notification_log table.
 * Errors during logging are caught to prevent cascading failures.
 */
async function logNotification(
  userId: string,
  event: string,
  channel: string,
  status: string,
  errorMessage?: string
): Promise<void> {
  try {
    await db.insert(notificationLog).values({
      userId,
      event,
      channel,
      status,
      errorMessage: errorMessage ?? null,
    });
  } catch (logError) {
    // Log errors must never break the notification flow
    console.error(
      `[Notifications] Failed to log notification: ${
        logError instanceof Error ? logError.message : "Unknown error"
      }`
    );
  }
}
