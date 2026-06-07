/**
 * OrderService - Application service for order lifecycle management
 *
 * Main entry point for order completion. Replaces central API calls
 * in IPN handler and admin verify (D-04, D-06).
 *
 * Flow:
 * 1. Marks order as "completed" in database
 * 2. Publishes OrderCompleted event via inProcessPublisher
 * 3. Event handler runs synchronously in-process (D-03) — license exists before return
 */

import { inProcessPublisher } from "@/shared/infrastructure/eventBus/EventBus";
import {
  ORDER_EVENTS,
  createOrderEvent,
} from "../../domain/events/OrderEvents";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export class OrderService {
  /**
   * Complete an order and trigger license generation.
   *
   * Called by IPN handler and admin verify after payment validation.
   * The OrderCompleted event handler runs synchronously, so the license
   * exists in the database before this method returns (D-03).
   *
   * @param orderId - The order UUID
   * @param userId - The user who owns the order
   */
  async completeOrder(orderId: string, userId: string): Promise<void> {
    // 1. Mark order as completed
    await db
      .update(orders)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // 2. Publish OrderCompleted event (triggers license generation synchronously)
    console.log(`[OrderService] Publishing ORDER_COMPLETED — orderId=${orderId}, userId=${userId}`);
    await inProcessPublisher.publish(
      createOrderEvent(ORDER_EVENTS.ORDER_COMPLETED, orderId, {
        orderId,
        userId,
      }),
    );
    console.log(`[OrderService] ORDER_COMPLETED published for orderId=${orderId}`);
  }
}
