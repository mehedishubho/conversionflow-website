"use client";

import { useState, useEffect } from "react";
import {
  getUserNotificationPreferences,
  updateNotificationPreferences,
} from "@/app/(portal)/actions/account";
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
} from "@/lib/notifications/types";

const CATEGORY_META: Record<
  string,
  { label: string; description: string }
> = {
  orders: {
    label: "Orders",
    description: "Order updates -- confirmations, payment status, refunds",
  },
  licenses: {
    label: "Licenses",
    description: "License alerts -- delivery, expiry warnings, activation",
  },
  tickets: {
    label: "Support",
    description: "Support tickets -- replies, status changes, resolutions",
  },
  system: {
    label: "System",
    description: "System events -- blog posts, security alerts",
  },
};

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  in_app: "In-App",
  whatsapp: "WhatsApp",
};

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const result = await getUserNotificationPreferences();
        setPreferences(result.preferences);
      } catch {
        setMessage({
          type: "error",
          text: "Failed to load preferences. Please refresh the page.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadPreferences();
  }, []);

  function togglePreference(category: string, channel: string) {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [channel]: !(prev[category]?.[channel] ?? true),
      },
    }));
    // Clear message on change
    setMessage(null);
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    try {
      // Flatten matrix to array format for server action
      const flat: Array<{
        category: string;
        channel: string;
        enabled: boolean;
      }> = [];
      for (const category of NOTIFICATION_CATEGORIES) {
        for (const channel of NOTIFICATION_CHANNELS) {
          flat.push({
            category,
            channel,
            enabled: preferences[category]?.[channel] ?? true,
          });
        }
      }

      const result = await updateNotificationPreferences(flat);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Preferences updated." });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Failed to save preferences. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Loading preferences...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Notification Preferences
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Choose how you want to receive notifications for each category.
        </p>
      </div>

      {/* Message banner */}
      {message && (
        <div
          className={`mb-4 rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
              : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Preference matrix grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="pb-3 pr-4 text-left text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                {" "}
              </th>
              {NOTIFICATION_CHANNELS.map((channel) => (
                <th
                  key={channel}
                  className="pb-3 px-4 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {CHANNEL_LABELS[channel] || channel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOTIFICATION_CATEGORIES.map((category) => {
              const meta = CATEGORY_META[category];
              return (
                <tr
                  key={category}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-4 pr-4">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {meta?.label || category}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {meta?.description || ""}
                    </p>
                  </td>
                  {NOTIFICATION_CHANNELS.map((channel) => {
                    const isOn =
                      preferences[category]?.[channel] ?? true;
                    return (
                      <td
                        key={`${category}-${channel}`}
                        className="py-4 px-4 text-center"
                      >
                        <button
                          role="switch"
                          aria-checked={isOn}
                          aria-label={`${meta?.label || category} ${CHANNEL_LABELS[channel] || channel}`}
                          onClick={() => togglePreference(category, channel)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isOn
                              ? "bg-brand-500"
                              : "bg-gray-300 dark:bg-gray-600"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isOn ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Save button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-brand-500 hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
