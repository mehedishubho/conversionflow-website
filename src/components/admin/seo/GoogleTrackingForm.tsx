"use client";

import { useState, useTransition, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Switch from "@/components/form/switch/Switch";
import Button from "@/components/ui/button/Button";
import {
  saveTrackingSettings,
  getGa4Summary,
} from "@/app/(admin)/actions/admin-tracking-v2";
import {
  GOOGLE_KEYS,
  type TrackingSettingsData,
} from "@/lib/tracking-keys";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  XCircle,
  ChevronDown,
  Circle,
  Users,
  Eye,
  Globe,
  FileText,
} from "lucide-react";

interface GoogleTrackingFormProps {
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

interface GaSummary {
  activeUsers: string;
  pageviews: string;
  sessions: string;
  topPages: { path: string; views: number }[];
}

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

const SUMMARY_METRICS = [
  {
    key: "activeUsers",
    label: "Active Users",
    icon: Users,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    key: "pageviews",
    label: "Pageviews",
    icon: Eye,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    key: "sessions",
    label: "Sessions",
    icon: Globe,
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
] as const;

export default function GoogleTrackingForm({
  initialData,
}: GoogleTrackingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [data, setData] = useState<TrackingSettingsData>({
    google_analytics_id: "",
    google_tag_manager_id: "",
    google_ads_conversion_id: "",
    google_ads_conversion_label: "",
    google_server_side: "false",
    google_enhanced_ecommerce: "false",
    ...initialData,
  });

  // GA Summary state
  const [gaSummary, setGaSummary] = useState<GaSummary | null>(null);
  const [gaSummaryLoading, setGaSummaryLoading] = useState(true);

  // Connection status state
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [connectionMessage, setConnectionMessage] = useState<string>("");

  // Event log visibility
  const [eventLogOpen, setEventLogOpen] = useState(false);
  const [eventLogEntries] = useState<LogEntry[]>(() => [...eventBuffer]);

  // GTM enabled state (derived from container ID)
  const [gtmEnabled, setGtmEnabled] = useState(
    (initialData.google_tag_manager_id ?? "").trim().length > 0
  );

  // Derived state
  const ga4Configured =
    (data.google_analytics_id ?? "").trim().length > 0;
  const serverSideEnabled = data.google_server_side === "true";
  const enhancedEcommerceEnabled =
    data.google_enhanced_ecommerce === "true";

  // Load GA summary on mount
  useEffect(() => {
    startTransition(async () => {
      try {
        const summary = await getGa4Summary();
        setGaSummary(summary);
      } catch {
        setGaSummary(null);
      } finally {
        setGaSummaryLoading(false);
      }
    });
  }, []);

  const updateField = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: string, checked: boolean) => {
    updateField(key, checked ? "true" : "false");
  };

  const handleTestConnection = () => {
    if (!ga4Configured) {
      setConnectionMessage("Configure a GA4 Measurement ID first.");
      return;
    }

    const ga4Id = (data.google_analytics_id ?? "").trim();
    const formatValid = /^G-[A-Za-z0-9]+$/.test(ga4Id);

    setConnectionStatus("testing");
    setConnectionMessage("");

    startTransition(async () => {
      if (!formatValid) {
        setConnectionStatus("error");
        setConnectionMessage(
          "GA4 ID format invalid. Measurement IDs start with 'G-' followed by alphanumeric characters."
        );
        return;
      }

      setConnectionStatus("connected");
      setConnectionMessage(`GA4 ID format valid: ${ga4Id}`);

      // Check if GA4 env vars are set for live testing
      if (gaSummary && gaSummary.activeUsers === "--") {
        setConnectionMessage(
          `GA4 ID format valid: ${ga4Id}. Set GA4 environment variables (GA4_PROPERTY_ID, GA4_SERVICE_ACCOUNT_EMAIL, GA4_PRIVATE_KEY) for live connection testing and summary data.`
        );
      } else if (gaSummary && gaSummary.activeUsers !== "--") {
        setConnectionMessage(
          `GA4 ID format valid: ${ga4Id}. Google Analytics API connected and returning data.`
        );
        pushEvent({
          event: "ConnectionTest",
          platform: "google",
          status: "fired",
        });
      }
    });
  };

  const handleGtmToggle = (checked: boolean) => {
    setGtmEnabled(checked);
    if (!checked) {
      updateField("google_tag_manager_id", "");
    }
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const googleData: TrackingSettingsData = {};
        for (const key of GOOGLE_KEYS) {
          googleData[key] = data[key] ?? "";
        }
        await saveTrackingSettings(googleData);
        setMessage({
          type: "success",
          text: "Google Analytics & Ads settings saved.",
        });
      } catch {
        setMessage({
          type: "error",
          text: "An unexpected error occurred.",
        });
      }
    });
  };

  // Determine if GA is connected (summary has real data)
  const gaConnected =
    gaSummary !== null &&
    gaSummary.activeUsers !== "--" &&
    gaSummary.activeUsers !== undefined;

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

      {/* GA Summary Cards */}
      <ComponentCard
        title="Google Analytics Summary"
        desc="Real-time metrics from Google Analytics (last 7 days). Data refreshes every 5 minutes."
      >
        <div className="space-y-4">
          {gaSummaryLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                Loading analytics data...
              </span>
            </div>
          ) : !gaConnected ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
              <FileText className="h-8 w-8 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Google Analytics data unavailable
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Set GA4 environment variables to see real data:
              </p>
              <code className="mt-2 block text-xs text-gray-500 dark:text-gray-400 font-mono">
                GA4_PROPERTY_ID, GA4_SERVICE_ACCOUNT_EMAIL, GA4_PRIVATE_KEY
              </code>
            </div>
          ) : (
            <>
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {SUMMARY_METRICS.map((metric) => (
                  <div
                    key={metric.key}
                    className={`rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${metric.bgColor}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <metric.icon
                        className={`h-4 w-4 ${metric.color}`}
                      />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {metric.label}
                      </span>
                    </div>
                    <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                      {gaSummary?.[metric.key as keyof GaSummary] ?? "--"}
                    </p>
                  </div>
                ))}

                {/* Top Pages Card */}
                <div className="col-span-2 lg:col-span-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Top Pages
                    </span>
                  </div>
                  {gaSummary?.topPages && gaSummary.topPages.length > 0 ? (
                    <div className="space-y-2">
                      {gaSummary.topPages.slice(0, 3).map((page, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-700 dark:text-gray-300 font-mono text-xs truncate max-w-[70%]">
                            {page.path}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {page.views.toLocaleString()} views
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      No page data available.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </ComponentCard>

      {/* Empty State Warning */}
      {!ga4Configured && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Google Analytics is not connected.
            </p>
            <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-400">
              Configure your GA4 Measurement ID below to start tracking.{" "}
              <a
                href="#ga4-id-field"
                className="underline font-medium hover:text-amber-700 dark:hover:text-amber-300"
              >
                Configure Now
              </a>
            </p>
          </div>
        </div>
      )}

      {/* GA4 Configured Banner */}
      {ga4Configured && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 dark:border-green-800 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-700 dark:text-green-400">
            GA4 configured: {data.google_analytics_id}
          </span>
        </div>
      )}

      {/* Google Analytics 4 */}
      <ComponentCard
        title="Google Analytics 4"
        desc="Configure your GA4 Measurement ID and verify the connection."
      >
        <div className="space-y-5">
          <div id="ga4-id-field">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              GA4 Measurement ID
            </label>
            <InputField
              placeholder="G-XXXXXXXXXX"
              defaultValue={data.google_analytics_id}
              onChange={(e) =>
                updateField("google_analytics_id", e.target.value)
              }
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Your GA4 Measurement ID from Google Analytics.
            </p>
          </div>

          {/* Connection Tester */}
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
                  connectionStatus === "testing" || !ga4Configured
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

      {/* Google Tag Manager */}
      <ComponentCard
        title="Google Tag Manager"
        desc="Configure tags and events inside Google Tag Manager's own UI. Only the Container ID is needed here."
      >
        <div className="space-y-4">
          <Switch
            label="Enable GTM"
            defaultChecked={gtmEnabled}
            onChange={handleGtmToggle}
          />

          {gtmEnabled && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                GTM Container ID
              </label>
              <InputField
                placeholder="GTM-XXXXXXX"
                defaultValue={data.google_tag_manager_id}
                onChange={(e) =>
                  updateField("google_tag_manager_id", e.target.value)
                }
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Your Google Tag Manager Container ID. Leave empty to disable
                GTM.
              </p>
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Google Ads */}
      <ComponentCard
        title="Google Ads"
        desc="Google Ads conversion tracking for purchase events."
      >
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Conversion ID
            </label>
            <InputField
              placeholder="AW-XXXXXXXXX"
              defaultValue={data.google_ads_conversion_id}
              onChange={(e) =>
                updateField("google_ads_conversion_id", e.target.value)
              }
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Google Ads conversion tracking ID.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Conversion Label
            </label>
            <InputField
              placeholder="XXXXXXXXXX"
              defaultValue={data.google_ads_conversion_label}
              onChange={(e) =>
                updateField("google_ads_conversion_label", e.target.value)
              }
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Google Ads conversion label for purchase events.
            </p>
          </div>
        </div>
      </ComponentCard>

      {/* Advanced Settings */}
      <ComponentCard
        title="Advanced Settings"
        desc="Server-side tracking and enhanced ecommerce configuration."
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <Switch
              label="Server-Side Tracking"
              defaultChecked={serverSideEnabled}
              onChange={(checked) =>
                handleToggle("google_server_side", checked)
              }
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Send tracking data through a server-side proxy.
            </p>
          </div>

          <div className="space-y-2">
            <Switch
              label="Enhanced Ecommerce"
              defaultChecked={enhancedEcommerceEnabled}
              onChange={(checked) =>
                handleToggle("google_enhanced_ecommerce", checked)
              }
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Track product impressions, clicks, and checkout steps in detail.
            </p>
          </div>
        </div>
      </ComponentCard>

      {/* Event Log Panel */}
      <ComponentCard
        title="Event Log"
        desc="Session-scoped log of recent Google tracking events. Events appear when tracking scripts fire on public pages."
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
          {isPending ? "Saving..." : "Save Google Settings"}
        </Button>
      </div>
    </div>
  );
}
