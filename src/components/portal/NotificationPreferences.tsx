"use client";

import { useState } from "react";

interface NotificationPreferencesProps {
  initialPreferences?: Record<string, boolean>;
}

const NOTIFICATION_TYPES = [
  {
    key: "license",
    label: "License Notifications",
    description: "License activation and expiry alerts",
  },
  {
    key: "billing",
    label: "Billing Notifications",
    description: "Payment and refund notifications",
  },
  {
    key: "support",
    label: "Support Notifications",
    description: "Ticket replies and status updates",
  },
  {
    key: "system",
    label: "System Notifications",
    description: "Platform maintenance and updates",
  },
];

export function NotificationPreferences({
  initialPreferences,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<Record<string, boolean>>(
    initialPreferences || {
      license: true,
      billing: true,
      support: true,
      system: true,
    }
  );

  function togglePreference(key: string) {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <div>
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
                onClick={() => togglePreference(type.key)}
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

      <div className="flex justify-end mt-4">
        <button className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white rounded-xl bg-brand-500 hover:bg-brand-600 transition-colors">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
