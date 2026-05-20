/**
 * WhatsApp notification channel adapter.
 *
 * Queues WhatsApp messages via BullMQ for async processing.
 * Gracefully degrades when Redis is unavailable (queue is null).
 */

import { notificationQueue } from "@/jobs/queues";
import type { NotificationEvent } from "@/lib/notifications/types";

/**
 * Queue a WhatsApp notification for async delivery.
 * If the notification queue is null (no Redis), logs a warning and returns.
 */
export async function queueWhatsApp(
  userId: string,
  event: NotificationEvent,
  data: Record<string, unknown>
): Promise<void> {
  if (!notificationQueue) {
    console.warn(
      "[Notifications:WhatsApp] No Redis queue available, skipping WhatsApp notification"
    );
    return;
  }

  await notificationQueue.add("whatsapp-send", {
    userId,
    event,
    notificationData: data,
  });
}
