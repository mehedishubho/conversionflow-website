/**
 * In-app notification channel adapter.
 *
 * Inserts notification records into the existing `notifications` table
 * using event catalog templates for title and message.
 */

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { EVENT_CATALOG } from "@/lib/notifications/types";
import type { NotificationEvent } from "@/lib/notifications/types";

/**
 * Send an in-app notification by inserting into the notifications table.
 * Uses the EVENT_CATALOG titleTemplate and messageTemplate to generate content.
 */
export async function sendInApp(
  userId: string,
  event: NotificationEvent,
  data: Record<string, unknown>
): Promise<void> {
  const eventConfig = EVENT_CATALOG[event];

  await db.insert(notifications).values({
    userId,
    type: event,
    title: eventConfig.titleTemplate(data),
    message: eventConfig.messageTemplate(data),
    data,
    read: false,
  });
}
