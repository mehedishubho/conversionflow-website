import { Suspense } from "react";
import { TrackingScripts } from "@/components/layout/TrackingScripts";
import { getTrackingSettings } from "@/lib/tracking";

/**
 * Async server component that fetches tracking settings from the DB.
 * Isolated from the layout so the DB promise doesn't collide with
 * React 19's suspense pipeline ("Expected a suspended thenable").
 */
async function TrackingScriptsInner() {
  let trackingSettings: Record<string, string> = {};
  try {
    trackingSettings = await getTrackingSettings();
  } catch {
    // Graceful fallback — tracking scripts simply won't render
  }

  return (
    <TrackingScripts
      ga4Id={trackingSettings.google_analytics_id}
      gtmId={trackingSettings.google_tag_manager_id}
      facebookPixelId={trackingSettings.meta_pixel_id}
      tiktokPixelId={trackingSettings.tiktok_pixel_id}
    />
  );
}

/**
 * Wraps the async tracking loader in Suspense so React 19 can properly
 * track the async boundary. This prevents the "Expected a suspended thenable"
 * error that occurs when a raw DB promise is awaited directly in a layout.
 */
export function TrackingScriptsLoader() {
  return (
    <Suspense fallback={null}>
      <TrackingScriptsInner />
    </Suspense>
  );
}
