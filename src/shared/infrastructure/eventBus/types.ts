/**
 * Event Bus Type Definitions
 *
 * Defines the core interfaces for the event bus system following D-11, D-12, D-13, D-16.
 * Provides unified abstraction for both in-process (EventEmitter) and cross-process (Redis Pub/Sub)
 * event implementations.
 */

/**
 * BaseEvent interface - Structured event format (D-12)
 *
 * All domain events must implement this interface with:
 * - Unique ID for event identification
 * - Type field for event routing
 * - Aggregate ID for correlation to domain entities
 * - Payload containing event-specific data
 * - Timestamp for event ordering and debugging
 * - Optional correlation ID for event chains
 * - Optional metadata for execution control (D-16)
 */
export interface BaseEvent {
  /** Unique event identifier (nanoid/cuid) */
  id: string;

  /** Event type name (e.g., "LicenseCreated", "OrderCompleted") */
  type: string;

  /** ID of the aggregate/entity this event relates to */
  aggregateId: string;

  /** Event-specific data payload */
  payload: unknown;

  /** When the event occurred */
  timestamp: Date;

  /** Optional correlation ID for chaining related events */
  correlationId?: string;

  /** Execution control metadata (D-16) */
  metadata?: {
    /** If true, handlers execute synchronously (critical events) */
    sync?: boolean;

    /** Event source identifier for debugging */
    source?: string;

    /** Event version for schema evolution */
    version?: number;
  };
}

/**
 * EventHandler function type
 *
 * Event handlers receive events and process them. Can be async or sync.
 * Failed handlers should not block other handlers (D-13: log and continue).
 */
export type EventHandler = (event: BaseEvent) => Promise<void> | void;

/**
 * EventSubscriber interface
 *
 * Defines the contract for subscribing to and unsubscribing from events.
 * Used by event bus implementations to manage handler registration.
 */
export interface EventSubscriber {
  /**
   * Register a handler for a specific event type
   * @param eventType - The event type to listen for
   * @param handler - The handler function to call when event is published
   */
  subscribe(eventType: string, handler: EventHandler): void;

  /**
   * Unregister a handler for a specific event type
   * @param eventType - The event type to stop listening for
   * @param handler - The handler function to remove
   */
  unsubscribe(eventType: string, handler: EventHandler): void;
}

/**
 * EventBus interface - Unified abstraction (D-11)
 *
 * Defines the contract for both in-process (EventEmitter) and cross-process (Redis Pub/Sub)
 * event implementations. Provides publish/subscribe semantics for domain events.
 */
export interface EventBus extends EventSubscriber {
  /**
   * Publish an event to all registered subscribers
   * @param event - The event to publish
   * @returns Promise that resolves when event is published (may be void for sync impls)
   */
  publish(event: BaseEvent): Promise<void> | void;

  /**
   * Register a handler for a specific event type
   * @param eventType - The event type to listen for
   * @param handler - The handler function to call when event is published
   */
  subscribe(eventType: string, handler: EventHandler): void;

  /**
   * Unregister a handler for a specific event type
   * @param eventType - The event type to stop listening for
   * @param handler - The handler function to remove
   */
  unsubscribe(eventType: string, handler: EventHandler): void;
}

/**
 * Event metadata with defaults
 *
 * Helper function to create event metadata with sensible defaults
 */
export function createEventMetadata(
  overrides?: Partial<BaseEvent["metadata"]>
): BaseEvent["metadata"] {
  return {
    sync: false,
    source: "ConversionFlow",
    version: 1,
    ...overrides,
  };
}
