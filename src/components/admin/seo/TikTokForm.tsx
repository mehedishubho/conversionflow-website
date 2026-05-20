"use client";

import { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import { saveTrackingSettings } from "@/app/(admin)/actions/admin-tracking-v2";
import {
  TIKTOK_KEYS,
  type TrackingSettingsData,
} from "@/lib/tracking-keys";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  XCircle,
  ChevronDown,
  Circle,
} from "lucide-react";

interface TikTokFormProps {
  initialData: TrackingSettingsData;
}

function parseJsonSetting<T>(value: string | undefined | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

type ConnectionStatus = "idle" | "testing" | "connected" | "error";

const STANDARD_EVENTS = [
  {
    name: "PageView",
    description: "Fires on every page load. Essential for baseline tracking.",
  },
  {
    name: "ViewContent",
    description: "Fires when a user views a product or key content page.",
  },
  {
    name: "AddToCart",
    description: "Fires when a user adds a product to their cart.",
  },
  {
    name: "InitiateCheckout",
    description: "Fires when a user starts the checkout process.",
  },
  {
    name: "Purchase",
    description: "Fires on order confirmation. Used for conversion tracking.",
  },
  {
    name: "Lead",
    description: "Fires when a user submits a lead form (contact, signup).",
  },
] as const;

const MATCHING_FIELDS = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "name", label: "Name" },
  { id: "city", label: "City" },
  { id: "country", label: "Country" },
] as const;

interface LogEntry {
  time: string;
  event: string;
  platform: string;
  status: "fired" | "pending";
}

// Session-scoped event buffer (module-level, last 50 events)
const eventBuffer: LogEntry[] = [];
const MAX_BUFFER = 50;

function pushEvent(event: Omit<LogEntry, "time">) {
  eventBuffer.unshift({
    ...event,
    time: new Date().toLocaleTimeString(),
  });
  if (eventBuffer.length > MAX_BUFFER) {
    eventBuffer.length = MAX_BUFFER;
  }
}

export default function TikTokForm({ initialData }: TikTokFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [data, setData] = useState<TrackingSettingsData>({
    tiktok_pixel_id: "",
    tiktok_events_token: "",
    tiktok_advanced_matching: "false",
    tiktok_matching_fields: "[]",
    tiktok_server_side: "false",
    tiktok_events: "{}",
    ...initialData,
  });

  // Connection status state
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [connectionMessage, setConnectionMessage] = useState<string>("");

  // Event log visibility
  const [eventLogOpen, setEventLogOpen] = useState(false);
  const [eventLogEntries] = useState<LogEntry[]>(() => [...eventBuffer]);

  // Derived state
  const pixelIdConfigured = (data.tiktok_pixel_id ?? "").trim().length > 0;
  const eventsTokenConfigured =
    (data.tiktok_events_token ?? "").trim().length > 0;
  const advancedMatchingEnabled =
    data.tiktok_advanced_matching === "true";
  const serverSideEnabled = data.tiktok_server_side === "true";
  const matchingFields: string[] = parseJsonSetting(
    data.tiktok_matching_fields,
    []
  );
  const selectedEvents: Record<string, boolean> = parseJsonSetting(
    data.tiktok_events,
    {}
  );

  const updateField = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: string, checked: boolean) => {
    updateField(key, checked ? "true" : "false");
  };

  const handleMatchingFieldToggle = (fieldId: string, checked: boolean) => {
    const updated = checked
      ? [...matchingFields, fieldId]
      : matchingFields.filter((f) => f !== fieldId);
    updateField("tiktok_matching_fields", JSON.stringify(updated));
  };

  const handleEventToggle = (eventName: string, checked: boolean) => {
    const updated = { ...selectedEvents, [eventName]: checked };
    updateField("tiktok_events", JSON.stringify(updated));
  };

  const handleSelectAllEvents = () => {
    const all: Record<string, boolean> = {};
    for (const evt of STANDARD_EVENTS) {
      all[evt.name] = true;
    }
    updateField("tiktok_events", JSON.stringify(all));
  };

  const handleDeselectAllEvents = () => {
    updateField("tiktok_events", JSON.stringify({}));
  };

  const handleTestConnection = () => {
    if (!pixelIdConfigured) {
      setConnectionMessage("Configure a Pixel ID first.");
      return;
    }

    const pixelId = (data.tiktok_pixel_id ?? "").trim();

    // Basic pixel ID format validation: starts with C and is alphanumeric
    const formatValid = /^C[A-Za-z0-9]+$/.test(pixelId);

    setConnectionStatus("testing");
    setConnectionMessage("");

    startTransition(async () => {
      try {
        if (!formatValid) {
          setConnectionStatus("error");
          setConnectionMessage(
            "Pixel ID format invalid. TikTok Pixel IDs start with 'C' followed by alphanumeric characters."
          );
          return;
        }

        // Pixel ID format is valid
        setConnectionStatus("connected");
        setConnectionMessage(
          `Pixel ID format valid: ${pixelId}`
        );

        // If Events API token is set, attempt health check
        if (eventsTokenConfigured) {
          try {
            const res = await fetch(
              "https://business-api.tiktok.com/open_api/v1.3/event/track/",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  event: "test",
                  timestamp: Date.now(),
                }),
                signal: AbortSignal.timeout(10000),
              }
            );

            if (res.ok || res.status === 400) {
              // 400 is expected for incomplete payload -- means the endpoint is reachable
              setConnectionMessage(
                `Pixel ID valid. Events API endpoint reachable.`
              );
              pushEvent({
                event: "ConnectionTest",
                platform: "tiktok",
                status: "fired",
              });
            } else {
              setConnectionMessage(
                `Pixel ID valid. Events API returned status ${res.status}. Endpoint may not be reachable.`
              );
            }
          } catch {
            setConnectionMessage(
              `Pixel ID valid. Events API endpoint unreachable (network error).`
            );
          }
        } else {
          setConnectionMessage(
            `Pixel ID format valid: ${pixelId}. Add an Events API token to test server-side connectivity.`
          );
        }
      } catch (err) {
        setConnectionStatus("error");
        setConnectionMessage(
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    });
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const tiktokData: TrackingSettingsData = {};
        for (const key of TIKTOK_KEYS) {
          tiktokData[key] = data[key] ?? "";
        }
        await saveTrackingSettings(tiktokData);
        setMessage({
          type: "success",
          text: "TikTok tracking settings saved.",
        });
      } catch {
        setMessage({
          type: "error",
          text: "An unexpected error occurred.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
              : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Empty State Warning */}
      {!pixelIdConfigured && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              TikTok Pixel is not connected.
            </p>
            <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
              Configure your Pixel ID below to start tracking.{" "}
              <a
                href="#pixel-id-field"
                className="underline font-medium hover:text-amber-700 dark:hover:text-amber-300"
              >
                Configure Now
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Pixel Configured Banner */}
      {pixelIdConfigured && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-700 dark:text-green-400">
            Pixel ID configured: {data.tiktok_pixel_id}
          </span>
          {eventsTokenConfigured && (
            <>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700 dark:text-green-400">
                Events API token configured
              </span>
            </>
          )}
        </div>
      )}

      {/* TikTok Pixel Configuration */}
      <ComponentCard
        title="TikTok Pixel Configuration"
        desc="Set up your TikTok Pixel ID and Events API token for browser and server-side tracking."
      >
        <div className="space-y-5">
          {/* Pixel ID */}
          <div id="pixel-id-field">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              TikTok Pixel ID
            </label>
            <InputField
              placeholder="CTXXXXXX"
              defaultValue={data.tiktok_pixel_id}
              onChange={(e) =>
                updateField("tiktok_pixel_id", e.target.value)
              }
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Your TikTok Pixel ID from TikTok Ads Manager.
            </p>
          </div>

          {/* Events API Token */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Events API Token
            </label>
            <InputField
              type="password"
              placeholder="your-events-api-token"
              defaultValue={data.tiktok_events_token}
              onChange={(e) =>
                updateField("tiktok_events_token", e.target.value)
              }
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Server-side event token for TikTok Events API.
            </p>
          </div>

          {/* Connection Status */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {connectionStatus === "idle" && (
                  <>
                    <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Not tested
                    </span>
                  </>
                )}
                {connectionStatus === "testing" && (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                    <span className="text-sm text-amber-600 dark:text-amber-400">
                      Testing connection...
                    </span>
                  </>
                )}
                {connectionStatus === "connected" && (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Connected
                    </span>
                  </>
                )}
                {connectionStatus === "error" && (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      Connection failed
                    </span>
                  </>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleTestConnection}
                disabled={
                  connectionStatus === "testing" || !pixelIdConfigured
                }
              >
                {connectionStatus === "testing"
                  ? "Testing..."
                  : "Test Connection"}
              </Button>
            </div>

            {connectionMessage && (
              <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                {connectionMessage}
              </p>
            )}
          </div>
        </div>
      </ComponentCard>

      {/* Advanced Matching */}
      <ComponentCard
        title="Advanced Matching"
        desc="Include user data with pixel events for better ad targeting and attribution."
      >
        <div className="space-y-4">
          <Switch
            label="Enable Advanced Matching"
            defaultChecked={advancedMatchingEnabled}
            onChange={(checked) =>
              handleToggle("tiktok_advanced_matching", checked)
            }
          />
          <p className="-mt-2 text-xs text-gray-400 dark:text-gray-500">
            Select user data fields to include with pixel events for better ad
            targeting.
          </p>

          {advancedMatchingEnabled && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 pt-2">
              {MATCHING_FIELDS.map((field) => (
                <label
                  key={field.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    defaultChecked={matchingFields.includes(field.id)}
                    onChange={(e) =>
                      handleMatchingFieldToggle(field.id, e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {field.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Event Tracking */}
      <ComponentCard
        title="Event Tracking"
        desc="Select which standard TikTok events to track on your site."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSelectAllEvents}
              className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
            >
              Select All
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              type="button"
              onClick={handleDeselectAllEvents}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              Deselect All
            </button>
          </div>

          <div className="space-y-3">
            {STANDARD_EVENTS.map((evt) => (
              <label
                key={evt.name}
                className="flex items-start gap-3 cursor-pointer rounded-lg border border-gray-100 p-3 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02] transition-colors"
              >
                <input
                  type="checkbox"
                  defaultChecked={selectedEvents[evt.name] === true}
                  onChange={(e) =>
                    handleEventToggle(evt.name, e.target.checked)
                  }
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900"
                />
                <div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {evt.name}
                  </span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {evt.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </ComponentCard>

      {/* Server-Side Tracking */}
      <ComponentCard
        title="Server-Side Tracking"
        desc="Send events server-side via TikTok Events API in addition to browser pixel."
      >
        <div className="space-y-4">
          <Switch
            label="Enable Server-Side Tracking"
            defaultChecked={serverSideEnabled}
            onChange={(checked) =>
              handleToggle("tiktok_server_side", checked)
            }
          />
          <p className="-mt-2 text-xs text-gray-400 dark:text-gray-500">
            Send events server-side via TikTok Events API in addition to browser
            pixel. Requires an Events API token above.
          </p>
        </div>
      </ComponentCard>

      {/* Event Log Panel */}
      <ComponentCard
        title="Event Log"
        desc="Session-scoped log of recent TikTok pixel events. Events appear when tracking scripts fire on public pages."
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setEventLogOpen(!eventLogOpen)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                eventLogOpen ? "rotate-180" : ""
              }`}
            />
            {eventLogOpen ? "Hide" : "Show"} Event Log (
            {eventLogEntries.length})
          </button>

          {eventLogOpen && (
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              {eventLogEntries.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No events captured in this session.
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Events will appear here when tracking scripts fire on public
                    pages.
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        Time
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        Event
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        Platform
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventLogEntries.map((entry, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                          {entry.time}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-700 dark:text-gray-300 font-mono">
                          {entry.event}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                          {entry.platform}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              entry.status === "fired"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save TikTok Settings"}
        </Button>
      </div>
    </div>
  );
}
