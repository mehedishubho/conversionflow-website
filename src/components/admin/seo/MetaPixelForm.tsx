"use client";

import { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import {
  saveTrackingSettings,
  sendMetaTestEvent,
} from "@/app/(admin)/actions/admin-tracking-v2";
import {
  META_PIXEL_KEYS,
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

interface MetaPixelFormProps {
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
  { id: "firstname", label: "First Name" },
  { id: "lastname", label: "Last Name" },
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

export default function MetaPixelForm({ initialData }: MetaPixelFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [data, setData] = useState<TrackingSettingsData>({
    meta_pixel_id: "",
    meta_capi_token: "",
    meta_dataset_id: "",
    meta_test_event_code: "",
    meta_advanced_matching: "false",
    meta_matching_fields: "[]",
    meta_events: "{}",
    meta_event_deduplication: "false",
    ...initialData,
  });

  // Connection status state
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [connectionMessage, setConnectionMessage] = useState<string>("");

  // Test event state
  const [testEventPending, setTestEventPending] = useState(false);
  const [testEventResult, setTestEventResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Event log visibility
  const [eventLogOpen, setEventLogOpen] = useState(false);
  const [eventLogEntries] = useState<LogEntry[]>(() => [...eventBuffer]);

  // Advanced matching toggle
  const advancedMatchingEnabled =
    data.meta_advanced_matching === "true";
  const matchingFields: string[] = parseJsonSetting(
    data.meta_matching_fields,
    []
  );

  // Events state
  const selectedEvents: Record<string, boolean> = parseJsonSetting(
    data.meta_events,
    {}
  );

  // Deduplication toggle
  const dedupEnabled = data.meta_event_deduplication === "true";

  // Pixel ID configured?
  const pixelIdConfigured = (data.meta_pixel_id ?? "").trim().length > 0;

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
    updateField("meta_matching_fields", JSON.stringify(updated));
  };

  const handleEventToggle = (eventName: string, checked: boolean) => {
    const updated = { ...selectedEvents, [eventName]: checked };
    updateField("meta_events", JSON.stringify(updated));
  };

  const handleSelectAllEvents = () => {
    const all: Record<string, boolean> = {};
    for (const evt of STANDARD_EVENTS) {
      all[evt.name] = true;
    }
    updateField("meta_events", JSON.stringify(all));
  };

  const handleDeselectAllEvents = () => {
    updateField("meta_events", JSON.stringify({}));
  };

  const handleTestConnection = () => {
    const graphApiToken = data._graph_api_token as string | undefined;
    if (!graphApiToken) {
      setConnectionMessage(
        "Add a Graph API token in the configuration above to enable live testing."
      );
      return;
    }

    if (!pixelIdConfigured) {
      setConnectionMessage("Configure a Pixel ID first.");
      return;
    }

    setConnectionStatus("testing");
    setConnectionMessage("");

    startTransition(async () => {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v21.0/${data.meta_pixel_id}?fields=name,status&access_token=${graphApiToken}`,
          { signal: AbortSignal.timeout(15000) }
        );

        if (res.ok) {
          const result = (await res.json()) as {
            name?: string;
            status?: string;
          };
          setConnectionStatus("connected");
          setConnectionMessage(
            `Connected: "${result.name || "Pixel"}" (status: ${result.status || "active"})`
          );
          pushEvent({
            event: "ConnectionTest",
            platform: "meta",
            status: "fired",
          });
        } else {
          const errText = await res.text();
          setConnectionStatus("error");
          setConnectionMessage(
            `Connection failed: ${res.status} - ${errText.slice(0, 200)}`
          );
          pushEvent({
            event: "ConnectionTest",
            platform: "meta",
            status: "fired",
          });
        }
      } catch (err) {
        setConnectionStatus("error");
        setConnectionMessage(
          `Error: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    });
  };

  const handleSendTestEvent = () => {
    setTestEventPending(true);
    setTestEventResult(null);

    startTransition(async () => {
      try {
        const result = await sendMetaTestEvent(
          data.meta_pixel_id ?? "",
          data.meta_capi_token ?? "",
          data.meta_test_event_code || undefined
        );
        setTestEventResult({
          success: result.success,
          message: result.response || "No response",
        });
        pushEvent({
          event: "Purchase (test)",
          platform: "meta",
          status: result.success ? "fired" : "pending",
        });
      } catch (err) {
        setTestEventResult({
          success: false,
          message: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        setTestEventPending(false);
      }
    });
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const metaData: TrackingSettingsData = {};
        for (const key of META_PIXEL_KEYS) {
          metaData[key] = data[key] ?? "";
        }
        await saveTrackingSettings(metaData);
        setMessage({ type: "success", text: "Meta Pixel settings saved." });
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
              Meta Pixel is not connected.
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
            Pixel ID configured: {data.meta_pixel_id}
          </span>
        </div>
      )}

      {/* Meta Pixel Configuration */}
      <ComponentCard
        title="Meta Pixel Configuration"
        desc="Set up your Meta Pixel ID, Conversions API token, and dataset for server-side tracking."
      >
        <div className="space-y-5">
          {/* Pixel ID */}
          <div id="pixel-id-field">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Meta Pixel ID
            </label>
            <InputField
              placeholder="123456789012345"
              defaultValue={data.meta_pixel_id}
              onChange={(e) => updateField("meta_pixel_id", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Your Meta Pixel ID from Events Manager.
            </p>
          </div>

          {/* CAPI Token */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              CAPI Access Token
            </label>
            <InputField
              type="password"
              placeholder="your-capi-access-token"
              defaultValue={data.meta_capi_token}
              onChange={(e) => updateField("meta_capi_token", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Server-side event token for Meta Conversions API.
            </p>
          </div>

          {/* Dataset ID */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Dataset ID
            </label>
            <InputField
              placeholder="your-dataset-id"
              defaultValue={data.meta_dataset_id}
              onChange={(e) => updateField("meta_dataset_id", e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Required for server-side event matching.
            </p>
          </div>

          {/* Test Event Code */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Test Event Code
            </label>
            <InputField
              placeholder="TEST12345"
              defaultValue={data.meta_test_event_code}
              onChange={(e) =>
                updateField("meta_test_event_code", e.target.value)
              }
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Used for debugging CAPI events in Meta Events Manager.
            </p>
          </div>

          {/* Graph API Token (for connection testing) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Graph API Token
            </label>
            <InputField
              type="password"
              placeholder="Optional: your-meta-graph-api-token"
              defaultValue={(data as Record<string, string>)._graph_api_token ?? ""}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  _graph_api_token: e.target.value,
                }))
              }
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Meta Graph API token for connection status checking. Optional.
            </p>
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
              handleToggle("meta_advanced_matching", checked)
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
        desc="Select which standard Meta events to track on your site."
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

      {/* CAPI Settings */}
      <ComponentCard
        title="Conversions API Settings"
        desc="Configure server-side event sending and deduplication."
      >
        <div className="space-y-5">
          <Switch
            label="Event Deduplication"
            defaultChecked={dedupEnabled}
            onChange={(checked) =>
              handleToggle("meta_event_deduplication", checked)
            }
          />
          <p className="-mt-2 text-xs text-gray-400 dark:text-gray-500">
            Prevents duplicate events when both browser pixel and CAPI fire the
            same event.
          </p>

          {/* Send Test Event */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Test CAPI Connection
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Sends a test Purchase event to verify your CAPI token and
                  pixel configuration.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleSendTestEvent}
                disabled={
                  testEventPending ||
                  !pixelIdConfigured ||
                  !(data.meta_capi_token ?? "").trim()
                }
                variant="outline"
              >
                {testEventPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Test Event"
                )}
              </Button>
            </div>

            {testEventResult && (
              <div
                className={`p-3 rounded-lg text-xs ${
                  testEventResult.success
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                <p className="font-medium">
                  {testEventResult.success
                    ? "Test event sent successfully!"
                    : "Test event failed"}
                </p>
                <p className="mt-1 break-all font-mono opacity-80">
                  {testEventResult.message.slice(0, 500)}
                </p>
              </div>
            )}
          </div>
        </div>
      </ComponentCard>

      {/* Connection Status */}
      <ComponentCard
        title="Connection Status"
        desc="Verify your Meta Pixel connection is working."
      >
        <div className="space-y-4">
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
              {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
            </Button>
          </div>

          {connectionMessage && (
            <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
              {connectionMessage}
            </p>
          )}

          {connectionStatus === "idle" &&
            !(data as Record<string, string>)._graph_api_token && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Add a Graph API token in the configuration above to enable live
                testing.
              </p>
            )}
        </div>
      </ComponentCard>

      {/* Event Log Panel */}
      <ComponentCard
        title="Event Log"
        desc="Session-scoped log of recent Meta pixel events. Events appear when tracking scripts fire on public pages."
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
            {eventLogOpen ? "Hide" : "Show"} Event Log ({eventLogEntries.length}
            )
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
          {isPending ? "Saving..." : "Save Meta Pixel Settings"}
        </Button>
      </div>
    </div>
  );
}
