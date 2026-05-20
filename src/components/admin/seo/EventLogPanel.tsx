"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import ComponentCard from "@/components/common/ComponentCard";

export interface TrackingEvent {
  timestamp: Date;
  eventName: string;
  platform: string;
  status: "fired" | "pending" | "error";
}

const MAX_BUFFER = 50;

// Extend Window to include our custom event buffer
declare global {
  interface Window {
    __cf_tracking_events?: TrackingEvent[];
  }
}

/** Get or create the shared event buffer on window */
function getBuffer(): TrackingEvent[] {
  if (typeof window === "undefined") return [];
  if (!window.__cf_tracking_events) {
    window.__cf_tracking_events = [];
  }
  return window.__cf_tracking_events;
}

/** Log a tracking event to the shared buffer and dispatch a custom event */
export function logTrackingEvent(
  event: Omit<TrackingEvent, "timestamp">
): void {
  const buffer = getBuffer();
  buffer.unshift({ ...event, timestamp: new Date() });
  if (buffer.length > MAX_BUFFER) {
    buffer.length = MAX_BUFFER;
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("cf-tracking-event"));
  }
}

interface EventLogPanelProps {
  platform: "meta" | "tiktok" | "google";
}

export default function EventLogPanel({ platform }: EventLogPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState<TrackingEvent[]>([]);

  const refreshEvents = useCallback(() => {
    const buffer = getBuffer();
    // Filter to only show events for this platform
    const filtered = buffer.filter((e) => e.platform === platform);
    setEvents([...filtered]);
  }, [platform]);

  useEffect(() => {
    // Initial load
    refreshEvents();

    // Listen for new events
    const handler = () => refreshEvents();
    window.addEventListener("cf-tracking-event", handler);
    return () => window.removeEventListener("cf-tracking-event", handler);
  }, [refreshEvents]);

  const statusBadge = (status: TrackingEvent["status"]) => {
    const styles = {
      fired:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      pending:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      error:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return styles[status];
  };

  return (
    <ComponentCard
      title="Event Log"
      desc="Session-scoped log of recent tracking events. Events appear when tracking scripts fire on public pages."
    >
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
          {isOpen ? "Hide" : "Show"} Event Log ({events.length})
        </button>

        {isOpen && (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              {events.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No events captured in this session. Events will appear here
                    when tracking scripts fire on public pages.
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
                    {events.map((entry, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                      >
                        <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                          {entry.timestamp.toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-700 dark:text-gray-300 font-mono">
                          {entry.eventName}
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                          {entry.platform}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge(entry.status)}`}
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
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Session-scoped diagnostics. Events are not persisted and will be
              lost on page refresh.
            </p>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}
