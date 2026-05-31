"use strict";
/**
 * Event Bus Type Definitions
 *
 * Defines the core interfaces for the event bus system following D-11, D-12, D-13, D-16.
 * Provides unified abstraction for both in-process (EventEmitter) and cross-process (Redis Pub/Sub)
 * event implementations.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventMetadata = createEventMetadata;
/**
 * Event metadata with defaults
 *
 * Helper function to create event metadata with sensible defaults
 */
function createEventMetadata(overrides) {
    return __assign({ sync: false, source: "ConversionFlow", version: 1 }, overrides);
}
