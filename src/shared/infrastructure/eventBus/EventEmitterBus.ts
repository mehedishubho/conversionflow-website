/**
 * EventEmitter-based In-Process Event Bus
 *
 * Implements EventBus interface using Node.js EventEmitter for in-process events.
 * Provides synchronous event delivery - handlers execute immediately on publish.
 * This is the in-process implementation used for single-process event handling.
 *
 * Per D-16: Synchronous execution for critical events (no await on publish).
 * Per D-13: Errors bubble to handlers - registry handles isolation.
 */

import { EventEmitter } from "events";
import type { EventBus, BaseEvent, EventHandler } from "./types";

/**
 * EventEmitterBus - In-process event bus implementation
 *
 * Uses Node.js EventEmitter for pub/sub within a single process.
 * Handlers execute synchronously - publish() returns immediately after emit.
 */
export class EventEmitterBus extends EventEmitter implements EventBus {
  constructor() {
    super();
    // Set max listeners to a reasonable default for event bus usage
    this.setMaxListeners(50);
  }

  /**
   * Publish an event to all registered subscribers
   *
   * Synchronous operation - emits event immediately without awaiting handlers.
   * Per D-16: Critical events can use sync execution for immediate processing.
   *
   * @param event - The event to publish
   */
  publish(event: BaseEvent): void {
    // Emit event type with event payload
    // EventEmitter calls all handlers synchronously
    this.emit(event.type, event);

    // Also emit a wildcard event for catch-all handlers
    this.emit("*", event);
  }

  /**
   * Register a handler for a specific event type
   *
   * @param eventType - The event type to listen for (e.g., "LicenseCreated")
   * @param handler - The handler function to call when event is published
   */
  subscribe(eventType: string, handler: EventHandler): void {
    this.on(eventType, handler);
  }

  /**
   * Unregister a handler for a specific event type
   *
   * @param eventType - The event type to stop listening for
   * @param handler - The handler function to remove
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    this.off(eventType, handler);
  }

  /**
   * Get the count of registered handlers for an event type
   * Useful for debugging and monitoring
   *
   * @param eventType - The event type to query
   * @returns Number of registered handlers
   */
  getHandlerCount(eventType: string): number {
    return this.listenerCount(eventType);
  }

  /**
   * Get all event types with registered handlers
   * Useful for debugging and monitoring
   *
   * @returns Array of event type names
   */
  getEventTypes(): string[] {
    return this.eventNames();
  }

  /**
   * Remove all handlers for an event type
   * Useful for testing and cleanup
   *
   * @param eventType - The event type to clear
   */
  clear(eventType: string): void {
    this.removeAllListeners(eventType);
  }

  /**
   * Remove all handlers for all event types
   * Useful for testing and cleanup
   */
  clearAll(): void {
    this.removeAllListeners();
  }
}

export default EventEmitterBus;
