/**
 * Event Handler Registry with Error Isolation
 *
 * Central event handler registry following D-13, D-17.
 * Provides "at least once" delivery semantics with error isolation -
 * failed handlers are logged but don't block other handlers.
 *
 * Per D-17: Central registry maps event types to handler arrays.
 * Per D-13: Failed handlers logged but continue to next handler (log and continue).
 */

import type { EventHandler, BaseEvent, EventBus } from "./types";

/**
 * EventRegistry - Central handler registry with error isolation
 *
 * Maps event types to sets of handlers and provides safe execution
 * with error isolation. Failed handlers don't block other handlers.
 */
class EventRegistry {
  /**
   * Map of event type to set of registered handlers
   * Using Set for automatic deduplication
   */
  private handlers = new Map<string, Set<EventHandler>>();

  /**
   * Register a handler for an event type
   *
   * @param eventType - The event type to listen for
   * @param handler - The handler function to register
   */
  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  /**
   * Unregister a handler for an event type
   *
   * @param eventType - The event type to stop listening for
   * @param handler - The handler function to remove
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);

      // Clean up empty sets
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }

  /**
   * Get all handlers for an event type
   * Returns a copy to prevent external modification
   *
   * @param eventType - The event type to query
   * @returns Array of registered handlers
   */
  getHandlers(eventType: string): EventHandler[] {
    const handlers = this.handlers.get(eventType);
    return handlers ? Array.from(handlers) : [];
  }

  /**
   * Get all registered event types
   * Useful for debugging and monitoring
   *
   * @returns Array of event type names
   */
  getEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get the count of handlers for an event type
   *
   * @param eventType - The event type to query
   * @returns Number of registered handlers
   */
  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size ?? 0;
  }

  /**
   * Publish an event to all registered handlers
   *
   * Executes all handlers for the event type with error isolation.
   * Per D-13: Failed handlers are logged but don't block other handlers.
   * Per D-16: Supports sync/async execution via event.metadata.sync flag.
   *
   * @param event - The event to publish
   * @param eventBus - Optional event bus to also publish through
   */
  async publish(event: BaseEvent, eventBus?: EventBus): Promise<void> {
    // If eventBus provided, also publish through it
    if (eventBus) {
      const publishResult = eventBus.publish(event);
      if (publishResult instanceof Promise) {
        await publishResult;
      }
    }

    // Get handlers for this event type
    const handlers = this.getHandlers(event.type);

    // Also include wildcard handlers (*)
    const wildcardHandlers = this.getHandlers("*");
    const allHandlers = [...handlers, ...wildcardHandlers];

    if (allHandlers.length === 0) {
      return;
    }

    // Check if synchronous execution is requested
    const sync = event.metadata?.sync ?? false;

    if (sync) {
      // Execute sequentially (critical event)
      await this.executeSequentially(event, allHandlers);
    } else {
      // Execute in parallel (default)
      await this.executeInParallel(event, allHandlers);
    }
  }

  /**
   * Execute handlers sequentially with error isolation
   * Used for critical events where order matters
   *
   * @param event - The event being processed
   * @param handlers - Array of handlers to execute
   */
  private async executeSequentially(event: BaseEvent, handlers: EventHandler[]): Promise<void> {
    for (const handler of handlers) {
      try {
        await handler(event);
        console.log(`[EventRegistry] Handler succeeded for event ${event.id} (${event.type})`);
      } catch (error) {
        // Log error but continue to next handler (D-13: log and continue)
        console.error(
          `[EventRegistry] Handler failed for event ${event.id} (${event.type}):`,
          error
        );
      }
    }
  }

  /**
   * Execute handlers in parallel with error isolation
   * Used for non-critical events where performance matters
   *
   * @param event - The event being processed
   * @param handlers - Array of handlers to execute
   */
  private async executeInParallel(event: BaseEvent, handlers: EventHandler[]): Promise<void> {
    // Execute all handlers in parallel
    const results = await Promise.allSettled(
      handlers.map((handler) => handler(event))
    );

    // Log results
    let successCount = 0;
    let failureCount = 0;

    for (const result of results) {
      if (result.status === "fulfilled") {
        successCount++;
      } else {
        failureCount++;
        console.error(
          `[EventRegistry] Handler failed for event ${event.id} (${event.type}):`,
          result.reason
        );
      }
    }

    if (successCount > 0) {
      console.log(
        `[EventRegistry] ${successCount} handler(s) succeeded for event ${event.id} (${event.type})`
      );
    }

    if (failureCount > 0) {
      console.warn(
        `[EventRegistry] ${failureCount} handler(s) failed for event ${event.id} (${event.type})`
      );
    }
  }

  /**
   * Clear all handlers for an event type
   * Useful for testing and cleanup
   *
   * @param eventType - The event type to clear
   */
  clear(eventType: string): void {
    this.handlers.delete(eventType);
  }

  /**
   * Clear all handlers for all event types
   * Useful for testing
   */
  clearAll(): void {
    this.handlers.clear();
  }

  /**
   * Get total count of all registered handlers
   * Useful for monitoring
   *
   * @returns Total handler count across all event types
   */
  getTotalHandlerCount(): number {
    let total = 0;
    for (const handlers of this.handlers.values()) {
      total += handlers.size;
    }
    return total;
  }
}

/**
 * Singleton instance of the event registry
 * Provides central point for all event handler registration (D-17)
 */
export const eventRegistry = new EventRegistry();

export default EventRegistry;
