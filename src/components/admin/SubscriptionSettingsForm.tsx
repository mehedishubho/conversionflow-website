"use client";

import React, { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { saveSubscriptionSettings } from "@/app/(admin)/actions/admin-settings";

interface SubscriptionSettingsFormProps {
  initialData: {
    gracePeriodDays: number;
    reminderMilestones: string;
  };
}

export default function SubscriptionSettingsForm({
  initialData,
}: SubscriptionSettingsFormProps) {
  const [gracePeriodDays, setGracePeriodDays] = useState(
    initialData.gracePeriodDays,
  );
  const [reminderMilestones, setReminderMilestones] = useState(
    initialData.reminderMilestones,
  );
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);

    const graceVal = parseInt(formData.get("gracePeriodDays") as string, 10);
    const milestonesVal = formData.get("reminderMilestones") as string;

    if (isNaN(graceVal) || graceVal < 7 || graceVal > 30) {
      setMessage({
        type: "error",
        text: "Grace period must be between 7 and 30 days.",
      });
      return;
    }

    startTransition(async () => {
      const result = await saveSubscriptionSettings({
        gracePeriodDays: graceVal,
        reminderMilestones: milestonesVal,
      });

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: "Subscription settings saved successfully.",
        });
      }
    });
  }

  return (
    <ComponentCard title="Subscription Settings">
      <form action={handleSubmit} className="space-y-6">
        {/* Status Message */}
        {message && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Grace Period Days */}
        <div>
          <InputField
            label="Grace Period Days"
            name="gracePeriodDays"
            type="number"
            placeholder="7"
            value={String(gracePeriodDays)}
            onChange={(e) => setGracePeriodDays(parseInt(e.target.value, 10))}
            min={7}
            max={30}
          />
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Number of days after expiration where the license remains valid
            (7-30 days). During grace period, the WordPress plugin continues
            working normally.
          </p>
        </div>

        {/* Reminder Milestones */}
        <div>
          <InputField
            label="Reminder Milestones"
            name="reminderMilestones"
            type="text"
            placeholder="30,14,7,3,1"
            value={reminderMilestones}
            onChange={(e) => setReminderMilestones(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Comma-separated days before expiration to send reminder emails
            (e.g., 30,14,7,3,1). Customers receive emails at each milestone.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </ComponentCard>
  );
}
