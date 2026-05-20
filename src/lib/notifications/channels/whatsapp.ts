/**
 * WhatsApp notification channel adapter.
 *
 * Queues WhatsApp messages via BullMQ for async processing.
 * Gracefully degrades when Redis is unavailable (queue is null).
 *
 * Also provides wa.me link generator for manual admin sending (D-03).
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

/**
 * Generate a wa.me link for manual WhatsApp sending by admins.
 *
 * Strips non-numeric chars, converts BD leading 0 to +880 format,
 * and returns an encoded wa.me URL with pre-filled message.
 *
 * @param phone   - Phone number (any format, will be cleaned)
 * @param message - Pre-filled message text
 * @returns wa.me URL string
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  // Strip all non-numeric chars except leading +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // Convert BD local format: leading "0" -> "+880"
  if (cleaned.startsWith("0")) {
    cleaned = "+880" + cleaned.slice(1);
  }

  // Remove the + for wa.me format (wa.me expects digits only)
  const waPhone = cleaned.replace("+", "");

  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${waPhone}?text=${encodedMessage}`;
}
