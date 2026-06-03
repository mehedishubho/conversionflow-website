"use client";

import React, { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { saveTransferSettings } from "@/app/(admin)/actions/admin-settings";

interface TransferSettingsFormProps {
  initialData: {
    maxTransfersPerMonth: number;
  };
}

export default function TransferSettingsForm({
  initialData,
}: TransferSettingsFormProps) {
  const [maxTransfersPerMonth, setMaxTransfersPerMonth] = useState(
    initialData.maxTransfersPerMonth,
  );
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleSubmit(formData: FormData) {
    setMessage(null);

    const parsedValue = parseInt(
      formData.get("maxTransfersPerMonth") as string,
      10,
    );

    if (isNaN(parsedValue) || parsedValue < 1 || parsedValue > 12) {
      setMessage({
        type: "error",
        text: "Transfer limit must be between 1 and 12 per month.",
      });
      return;
    }

    startTransition(async () => {
      const result = await saveTransferSettings({
        maxTransfersPerMonth: parsedValue,
      });

      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: "Transfer settings saved successfully.",
        });
      }
    });
  }

  return (
    <ComponentCard title="License Transfer Settings">
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

        {/* Max Transfers Per Month */}
        <div>
          <InputField
            label="Maximum Transfers Per Month"
            name="maxTransfersPerMonth"
            type="number"
            placeholder="1"
            value={String(maxTransfersPerMonth)}
            onChange={(e) =>
              setMaxTransfersPerMonth(parseInt(e.target.value, 10))
            }
            min={1}
            max={12}
          />
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Maximum number of times a license can be transferred per calendar
            month (1-12). Default: 1. Each transfer clears all domain
            activations and reassigns ownership.
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
