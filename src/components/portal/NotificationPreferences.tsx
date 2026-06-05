"use client";

import { useState, useEffect, useTransition } from "react";
import {
  saveNotificationPreferences,
  getNotificationPreferences,
} from "@/app/(portal)/actions/notification-preferences";
import type { NotificationPreferences } from "@/modules/notifications/domain/types";

const NOTIFICATION_TYPES = [
  {
    key: "license" as const,
    label: "License Notifications",
    description: "License activation and expiry alerts",
  },
  {
    key: "billing" as const,
    label: "Billing Notifications",
    description: "Payment and refund notifications",
  },
  {
    key: "support" as const,
    label: "Support Notifications",
    description: "Ticket replies and status updates",
  },
  {
    key: "system" as const,
    label: "System Notifications",
    description: "Platform maintenance and updates",
  },
];

const CHANNEL_TYPES = [
  {
    key: "email" as const,
    label: "Email Notifications",
    description: "Receive notifications via email",
  },
  {
    key: "in_app" as const,
    label: "In-App Notifications",
    description: "Receive notifications in the notification bell",
  },
];

const DEFAULT_PREFERENCES: NotificationPreferences = {
  license: true,
  billing: true,
  support: true,
  system: true,
  channels: { email: true, in_app: true },
};

export function NotificationPreferences() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<
    null | "saved" | "error"
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load current preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const result = await getNotificationPreferences();
        if (result) {
          setPreferences(result);
        }
      } catch {
        // Use defaults on error
      } finally {
        setIsLoading(false);
      }
    }
    loadPreferences();
  }, []);

  function toggleCategory(key: keyof NotificationPreferences) {
    if (key === "channels") return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key as keyof Omit<NotificationPreferences, "channels">],
    }));
  }

  function toggleChannel(key: keyof NotificationPreferences["channels"]) {
    setPreferences((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [key]: !prev.channels[key],
      },
    }));
  }

  function handleSave() {
    setSaveStatus(null);
    startTransition(async () => {
      const result = await saveNotificationPreferences(preferences);
      if (result.success) {
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
      }
      // Auto-clear status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    });
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
      {/* Category Toggles */}
      <div className="space-y-4">
        {NOTIFICATION_TYPES.map((type) => {
          const isOn = preferences[type.key] !== false;
          return (
            <div
              key={type.key}
              className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {type.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {type.description}
                </p>
              </div>
              <button
                role="switch"
                aria-checked={isOn}
                onClick={() => toggleCategory(type.key)}
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
            </div>
          );
        })}
      </div>

      {/* Channel Toggles */}
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-4">
          Notification Channels
        </h4>
        <div className="space-y-4">
          {CHANNEL_TYPES.map((channel) => {
            const isOn = preferences.channels[channel.key] !== false;
            return (
              <div
                key={channel.key}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {channel.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {channel.description}
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={isOn}
                  onClick={() => toggleChannel(channel.key)}
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button with Feedback */}
      <div className="flex items-center justify-end gap-3 mt-6">
        {saveStatus === "saved" && (
          <span className="text-sm text-green-600 dark:text-green-400">
            Preferences saved!
          </span>
        )}
        {saveStatus === "error" && (
          <span className="text-sm text-red-600 dark:text-red-400">
            Failed to save. Please try again.
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-brand-500 hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
