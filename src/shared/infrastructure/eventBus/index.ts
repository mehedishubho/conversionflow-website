/**
 * Event Bus Barrel Export
 *
 * Central export point for all event bus types, implementations, and utilities.
 * Provides clean public API for the event bus system per D-11 unified interface.
 *
 * Usage:
 * ```typescript
 * import { createEventBus, EventBus, BaseEvent } from '@/shared/infrastructure/eventBus';
 * ```
 */

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
export * from "./types";

// ──────────────────────────────────────────────
// Implementations
// ──────────────────────────────────────────────
export { default as EventEmitterBus } from "./EventEmitterBus";
export { default as RedisPubSubBus } from "./RedisPubSubBus";

// ──────────────────────────────────────────────
// Registry
// ──────────────────────────────────────────────
export { default as eventRegistry } from "./registry";

// ──────────────────────────────────────────────
// Factory Functions
// ──────────────────────────────────────────────
export {
  createEventBus,
  createPublisher,
  createSubscriber,
  inProcessEventBus,
  crossProcessEventBus,
  inProcessPublisher,
  crossProcessPublisher,
  inProcessSubscriber,
  crossProcessSubscriber,
  type Publisher,
} from "./EventBus";
