/**
 * Cache Invalidation - EventBus handlers for validation cache
 *
 * Subscribes to license domain events and invalidates the validation cache
 * when license state changes (D-20).
 *
 * Two invalidation strategies:
 * - Single-domain: For LicenseActivated/Deactivated, invalidates the specific
 *   domain's cache entry via ValidationCache.invalidate()
 * - All-domains: For LicenseRevoked/Suspended, invalidates ALL cached entries
 *   for the license via ValidationCache.invalidateAll() (prefix-scan)
 *
 * The two-level sha256 key scheme in ValidationCache ensures invalidateAll
 * prefix-scans correctly match all domain entries for a license (D-19).
 */

import { inProcessSubscriber } from "@/shared/infrastructure/eventBus/EventBus";
import { LICENSE_EVENTS } from "@/modules/licensing/domain/events/LicenseEvents";
import { ValidationCache } from "@/modules/licensing/infrastructure/adapters/ValidationCache";
import type { BaseEvent } from "@/shared/infrastructure/eventBus/types";

interface LicenseEventPayload {
  licenseId: string;
  licenseKey: string;
  domain?: string;
}

/**
 * Register cache invalidation handlers on the in-process event bus.
 *
 * Should be called once during application startup.
 * Handlers are async -- failures are logged but do not block event processing.
 */
export function registerCacheInvalidationHandlers(): void {
  const invalidateEntry = async (event: BaseEvent) => {
    try {
      const payload = event.payload as LicenseEventPayload;

      // Invalidate the specific domain entry if domain is in the payload
      if (payload.domain && payload.licenseKey) {
        await ValidationCache.invalidate(payload.licenseKey, payload.domain);
      }

      // For revoke/suspend (affects ALL domains), invalidate all entries
      if (
        event.type === LICENSE_EVENTS.LICENSE_REVOKED ||
        event.type === LICENSE_EVENTS.LICENSE_SUSPENDED
      ) {
        if (payload.licenseKey) {
          await ValidationCache.invalidateAll(payload.licenseKey);
        }
      }
    } catch (err) {
      console.error("[CacheInvalidation] Failed to invalidate cache:", err);
    }
  };

  inProcessSubscriber.subscribe(LICENSE_EVENTS.LICENSE_ACTIVATED, invalidateEntry);
  inProcessSubscriber.subscribe(LICENSE_EVENTS.LICENSE_DEACTIVATED, invalidateEntry);
  inProcessSubscriber.subscribe(LICENSE_EVENTS.LICENSE_REVOKED, invalidateEntry);
  inProcessSubscriber.subscribe(LICENSE_EVENTS.LICENSE_SUSPENDED, invalidateEntry);
}
