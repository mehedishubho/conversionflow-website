/**
 * Notification Service (D-10, D-13)
 *
 * Event-driven notification routing engine.
 * Subscribes to domain events via EventBus, consults the EventCatalog,
 * checks user notification preferences, creates in-app notifications
 * with delivery tracking rows, and enqueues email jobs.
 *
 * Flow:
 * 1. Domain event published via EventBus
 * 2. handleEvent() looks up EventCatalog entry
 * 3. Fetches user preferences from user table
 * 4. Filters enabled channels based on preferences
 * 5. Creates notification row + delivery rows in DB transaction
 * 6. Enqueues email job to BullMQ emailQueue if email channel enabled
 */

import { inProcessSubscriber } from "@/shared/infrastructure/eventBus/EventBus";
import type { BaseEvent } from "@/shared/infrastructure/eventBus/types";
import { EVENT_CATALOG } from "../catalog/EventCatalog";
import type { EventCatalogEntry } from "../catalog/EventCatalog";
import type { NotificationPreferences } from "../../domain/types";
import { db } from "@/lib/db";
import { notifications, notificationDeliveries, user } from "@/lib/db/schema";
import { emailQueue } from "@/jobs/queues";
import { eq } from "drizzle-orm";

/** Default notification preferences for users without saved preferences */
const DEFAULT_PREFS: NotificationPreferences = {
  license: true,
  billing: true,
  support: true,
  system: true,
  channels: { email: true, in_app: true },
};

export class NotificationService {
  private initialized = false;

  /**
   * Subscribe to all event types in the EventCatalog via the in-process EventBus.
   * Safe to call multiple times (idempotent).
   */
  initialize(): void {
    if (this.initialized) return;

    const eventTypes = Object.keys(EVENT_CATALOG);
    for (const eventType of eventTypes) {
      inProcessSubscriber.subscribe(eventType, this.handleEvent.bind(this));
    }

    this.initialized = true;
    console.log(
      `[Notifications] Module initialized, subscribed to ${eventTypes.length} event types`,
    );
  }

  /**
   * Handle an incoming domain event.
   * Looks up catalog entry, checks user preferences, creates notification
   * and delivery rows, enqueues email job.
   *
   * Errors are caught and logged — never throws (continues on partial failure).
   */
  private async handleEvent(event: BaseEvent): Promise<void> {
    try {
      const entry = EVENT_CATALOG[event.type];
      if (!entry) return;

      // Extract userId from payload (T-17-08: validated against user table)
      const payload = event.payload as { userId?: string; [key: string]: unknown };
      if (!payload?.userId) {
        console.warn(
          `[Notifications] Event ${event.type} has no userId in payload, skipping`,
        );
        return;
      }

      const userId = payload.userId;

      // Fetch user email and notification preferences
      const [userRow] = await db
        .select({
          email: user.email,
          notificationPreferences: user.notificationPreferences,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!userRow) {
        console.warn(
          `[Notifications] User ${userId} not found, skipping event ${event.type}`,
        );
        return;
      }

      // Get preferences with defaults
      const prefs: NotificationPreferences =
        userRow.notificationPreferences || DEFAULT_PREFS;

      // Check if category is enabled
      if (!prefs[entry.category]) return;

      // Filter enabled channels
      const enabledChannels = entry.channels.filter(
        (ch) => prefs.channels[ch as keyof typeof prefs.channels],
      );
      if (enabledChannels.length === 0) return;

      // Create notification row + delivery rows in transaction
      const { emailDeliveryId } = await db.transaction(async (tx) => {
        // Always create a notification row (serves as the canonical record)
        const [notificationRow] = await tx
          .insert(notifications)
          .values({
            userId,
            type: entry.category,
            title: entry.title,
            message: this.formatMessage(event, entry),
            data: {
              eventType: event.type,
              aggregateId: event.aggregateId,
              correlationId: event.correlationId,
            },
          })
          .returning({ id: notifications.id });

        const notificationId = notificationRow.id;

        // Create delivery row for each enabled channel
        let emailDeliveryId: string | null = null;
        for (const channel of enabledChannels) {
          const [deliveryRow] = await tx
            .insert(notificationDeliveries)
            .values({
              notificationId,
              channel,
              status: "pending",
            })
            .returning({ id: notificationDeliveries.id });

          if (channel === "email") {
            emailDeliveryId = deliveryRow.id;
          }
        }

        return { emailDeliveryId };
      });

      // Enqueue email job if email channel is enabled
      if (enabledChannels.includes("email") && emailQueue && emailDeliveryId) {
        await emailQueue.add(
          "send-email",
          {
            to: userRow.email,
            eventType: event.type,
            eventPayload: event.payload,
            deliveryId: emailDeliveryId,
          },
          {
            attempts: 3,
            backoff: { type: "exponential", delay: 1000 },
          },
        );
      }
    } catch (err) {
      console.error(
        `[Notifications] Error handling event ${event.type}:`,
        err,
      );
    }
  }

  /**
   * Format a notification message from the event data.
   * Provides a reasonable default. Can be enhanced per event type later.
   */
  private formatMessage(event: BaseEvent, entry: EventCatalogEntry): string {
    return `${entry.title}: ${event.aggregateId}`;
  }
}
