/**
 * Redis Pub/Sub Cross-Process Event Bus
 *
 * Implements EventBus interface using Redis Pub/Sub for cross-process events.
 * Enables event delivery across multiple processes (e.g., web server → background worker).
 * Falls back gracefully when Redis is unavailable (development mode).
 *
 * Per D-11: Hybrid abstraction supports both EventEmitter and Redis implementations.
 * Per D-13: Errors are logged but don't block operation (log and continue).
 */

import { redis } from "@/lib/redis";
import type { EventBus, BaseEvent, EventHandler } from "./types";

/**
 * RedisPubSubBus - Cross-process event bus implementation
 *
 * Uses Redis Pub/Sub for event delivery across process boundaries.
 * Maintains local handler registry and Redis subscription management.
 */
export class RedisPubSubBus implements EventBus {
  /**
   * Map of event type to set of local handlers
   * Each event type can have multiple registered handlers
   */
  private subscribers = new Map<string, Set<EventHandler>>();

  /**
   * Redis subscriber client (separate from publisher)
   * Pub/Sub requires dedicated connection that only subscribes
   */
  private subscriber: typeof redis | null = null;

  /**
   * Track which channels we're subscribed to avoid duplicate subscriptions
   */
  private subscribedChannels = new Set<string>();

  constructor() {
    // Initialize Redis subscriber if available
    if (redis) {
      this.initializeSubscriber();
    }
  }

  /**
   * Initialize Redis subscriber connection
   * Creates dedicated connection for pub/sub (required by Redis protocol)
   */
  private initializeSubscriber(): void {
    if (!redis) return;

    // For ioredis, we use the same connection but subscribe to channels
    // ioredis handles creating a dedicated subscriber connection internally
    this.subscriber = redis;

    // Set up message listener
    this.subscriber.on("message", (channel: string, message: string) => {
      this.handleRedisMessage(channel, message);
    });

    // Handle pmessage for pattern subscriptions (future use)
    this.subscriber.on("pmessage", (...args: unknown[]) => {
      // Pattern: [pattern, channel, message]
      if (args.length >= 3) {
        const channel = args[1] as string;
        const message = args[2] as string;
        this.handleRedisMessage(channel, message);
      }
    });
  }

  /**
   * Publish an event to Redis Pub/Sub
   *
   * Async operation - awaits Redis publish command.
   * Per D-13: Errors are logged but don't throw (log and continue).
   *
   * @param event - The event to publish
   */
  async publish(event: BaseEvent): Promise<void> {
    // Also execute local handlers (in-process delivery)
    this.publishLocal(event);

    if (!redis) {
      // Fallback: no Redis, only local handlers were notified
      return;
    }

    try {
      const channel = `events:${event.type}`;
      const message = JSON.stringify(event);
      await redis.publish(channel, message);
    } catch (error) {
      // Log error but don't throw (D-13: log and continue)
      console.error(`[RedisPubSubBus] Failed to publish event ${event.id}:`, error);
    }
  }

  /**
   * Publish event to local handlers only (in-process)
   * Used by publish() for immediate local delivery
   *
   * @param event - The event to publish locally
   */
  private publishLocal(event: BaseEvent): void {
    const handlers = this.subscribers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        // Execute handler asynchronously but don't await
        // Errors are handled by the registry wrapper
        Promise.resolve().then(() => handler(event));
      }
    }

    // Also notify wildcard handlers
    const wildcardHandlers = this.subscribers.get("*");
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        Promise.resolve().then(() => handler(event));
      }
    }
  }

  /**
   * Register a handler for a specific event type
   *
   * Stores handler in local map and subscribes to Redis channel if not already.
   *
   * @param eventType - The event type to listen for
   * @param handler - The handler function to call when event is published
   */
  subscribe(eventType: string, handler: EventHandler): void {
    // Add handler to local subscribers
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);

    // Subscribe to Redis channel if available and not already subscribed
    if (redis && this.subscriber && !this.subscribedChannels.has(eventType)) {
      const channel = `events:${eventType}`;
      this.subscriber.subscribe(channel).catch((error) => {
        console.error(`[RedisPubSubBus] Failed to subscribe to ${channel}:`, error);
      });
      this.subscribedChannels.add(eventType);
    }
  }

  /**
   * Unregister a handler for a specific event type
   *
   * Removes handler from local map and unsubscribes from Redis if no handlers remain.
   *
   * @param eventType - The event type to stop listening for
   * @param handler - The handler function to remove
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      handlers.delete(handler);

      // Unsubscribe from Redis if no handlers left
      if (handlers.size === 0) {
        this.subscribers.delete(eventType);

        if (redis && this.subscriber && this.subscribedChannels.has(eventType)) {
          const channel = `events:${eventType}`;
          this.subscriber.unsubscribe(channel).catch((error) => {
            console.error(`[RedisPubSubBus] Failed to unsubscribe from ${channel}:`, error);
          });
          this.subscribedChannels.delete(eventType);
        }
      }
    }
  }

  /**
   * Handle incoming Redis message
   * Parses JSON message and calls all registered handlers for the event type
   *
   * @param channel - The Redis channel (e.g., "events:LicenseCreated")
   * @param message - The JSON-encoded event payload
   */
  private handleRedisMessage(channel: string, message: string): void {
    try {
      const event = JSON.parse(message) as BaseEvent;

      // Extract event type from channel name
      const eventType = channel.replace(/^events:/, "");

      // Get handlers for this event type
      const handlers = this.subscribers.get(eventType);
      if (handlers) {
        for (const handler of handlers) {
          // Execute handler asynchronously
          Promise.resolve().then(() => handler(event));
        }
      }

      // Also notify wildcard handlers
      const wildcardHandlers = this.subscribers.get("*");
      if (wildcardHandlers) {
        for (const handler of wildcardHandlers) {
          Promise.resolve().then(() => handler(event));
        }
      }
    } catch (error) {
      console.error(`[RedisPubSubBus] Failed to handle message from ${channel}:`, error);
    }
  }

  /**
   * Get the count of registered handlers for an event type
   * Useful for debugging and monitoring
   *
   * @param eventType - The event type to query
   * @returns Number of registered handlers
   */
  getHandlerCount(eventType: string): number {
    return this.subscribers.get(eventType)?.size ?? 0;
  }

  /**
   * Get all event types with registered handlers
   * Useful for debugging and monitoring
   *
   * @returns Array of event type names
   */
  getEventTypes(): string[] {
    return Array.from(this.subscribers.keys());
  }

  /**
   * Check if Redis is available
   * Useful for graceful degradation handling
   *
   * @returns True if Redis client is configured
   */
  isRedisAvailable(): boolean {
    return redis !== null;
  }

  /**
   * Clean up resources
   * Unsubscribe from all Redis channels and clear local handlers
   */
  async dispose(): Promise<void> {
    if (redis && this.subscriber && this.subscribedChannels.size > 0) {
      const channels = Array.from(this.subscribedChannels).map((type) => `events:${type}`);
      await this.subscriber.unsubscribe(...channels);
      this.subscribedChannels.clear();
    }
    this.subscribers.clear();
  }
}

export default RedisPubSubBus;
