/**
 * Event Bus Factory and Facade Functions
 *
 * Provides factory functions for creating event bus instances and role-specific facades.
 * Implements unified interface pattern (D-11) supporting both EventEmitter and Redis modes.
 *
 * Factory functions enable:
 * - Easy switching between in-process and cross-process event modes
 * - Role-specific facades (publisher-only, subscriber-only) for better encapsulation
 * - Dependency injection-friendly construction
 */

import EventEmitterBus from "./EventEmitterBus";
import RedisPubSubBus from "./RedisPubSubBus";
import type { EventBus, EventSubscriber, BaseEvent, EventHandler } from "./types";

/**
 * Create an event bus instance
 *
 * Returns EventEmitterBus for in-process events or RedisPubSubBus for cross-process.
 * Factory function allows easy switching based on configuration.
 *
 * @param useRedis - If true, returns RedisPubSubBus; otherwise EventEmitterBus
 * @returns EventBus instance
 *
 * @example
 * ```typescript
 * const eventBus = createEventBus(false); // In-process (EventEmitter)
 * const eventBus = createEventBus(true);  // Cross-process (Redis)
 * ```
 */
export function createEventBus(useRedis: boolean = false): EventBus {
  if (useRedis) {
    return new RedisPubSubBus();
  }
  return new EventEmitterBus();
}

/**
 * Create a publisher-only facade
 *
 * Returns a facade that only exposes the publish method.
 * Used by domain services to publish events without ability to subscribe.
 * Provides better encapsulation - publishers can't accidentally subscribe.
 *
 * @param useRedis - If true, uses RedisPubSubBus; otherwise EventEmitterBus
 * @returns Publisher object with publish method only
 *
 * @example
 * ```typescript
 * const publisher = createPublisher(false);
 * await publisher.publish({ id: '1', type: 'OrderCompleted', ... });
 * // publisher.subscribe is not available
 * ```
 */
export function createPublisher(useRedis: boolean = false): Publisher {
  const eventBus = createEventBus(useRedis);
  return {
    publish: (event: BaseEvent) => {
      const result = eventBus.publish(event);
      return result instanceof Promise ? result : Promise.resolve();
    },
  };
}

/**
 * Create a subscriber-only facade
 *
 * Returns a facade that only exposes subscribe/unsubscribe methods.
 * Used by event consumers to register handlers without ability to publish.
 * Provides better encapsulation - consumers can't accidentally publish.
 *
 * @param useRedis - If true, uses RedisPubSubBus; otherwise EventEmitterBus
 * @returns Subscriber object with subscribe/unsubscribe methods
 *
 * @example
 * ```typescript
 * const subscriber = createSubscriber(false);
 * subscriber.subscribe('OrderCompleted', async (event) => {
 *   console.log('Order completed:', event);
 * });
 * // subscriber.publish is not available
 * ```
 */
export function createSubscriber(useRedis: boolean = false): EventSubscriber {
  const eventBus = createEventBus(useRedis);
  return {
    subscribe: (eventType: string, handler: EventHandler) => {
      eventBus.subscribe(eventType, handler);
    },
    unsubscribe: (eventType: string, handler: EventHandler) => {
      eventBus.unsubscribe(eventType, handler);
    },
  };
}

/**
 * Publisher interface - publish-only facade
 *
 * Exposes only the publish method for event publishers.
 * Prevents accidental subscription in publisher-only contexts.
 */
export interface Publisher {
  publish(event: BaseEvent): Promise<void>;
}

/**
 * Re-exports for convenience
 *
 * Export implementations and types for direct usage if needed.
 * Most code should use factory functions above for better testability.
 */
export { EventEmitterBus, RedisPubSubBus };
export type { EventBus, EventSubscriber, BaseEvent, EventHandler } from "./types";
export { eventRegistry } from "./registry";

/**
 * Default event bus instances
 *
 * Pre-configured instances for common use cases.
 * Applications can use these directly or create their own via factory functions.
 */

/**
 * In-process event bus (EventEmitter)
 * Use for single-process applications or synchronous critical events
 */
export const inProcessEventBus = createEventBus(false);

/**
 * Cross-process event bus (Redis Pub/Sub)
 * Use for multi-process applications (web server + background workers)
 */
export const crossProcessEventBus = createEventBus(true);

/**
 * Publisher facades for common use cases
 */
export const inProcessPublisher = createPublisher(false);
export const crossProcessPublisher = createPublisher(true);

/**
 * Subscriber facades for common use cases
 */
export const inProcessSubscriber = createSubscriber(false);
export const crossProcessSubscriber = createSubscriber(true);
