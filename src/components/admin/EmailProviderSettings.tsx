"use client";

import { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import {
  saveEmailProviderSettings,
  testEmailConnection,
} from "@/app/(admin)/actions/admin-notif-settings";

interface EmailProviderSettingsProps {
  initialData: {
    provider: "resend" | "smtp";
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpFrom: string;
  };
}

export default function EmailProviderSettings({
  initialData,
}: EmailProviderSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [provider, setProvider] = useState<"resend" | "smtp">(
    initialData.provider
  );
  const [smtpHost, setSmtpHost] = useState(initialData.smtpHost);
  const [smtpPort, setSmtpPort] = useState(initialData.smtpPort);
  const [smtpUser, setSmtpUser] = useState(initialData.smtpUser);
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpFrom, setSmtpFrom] = useState(initialData.smtpFrom);

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        await saveEmailProviderSettings({
          provider,
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPass: smtpPass || undefined,
          smtpFrom,
        });
        setMessage({ type: "success", text: "Email settings saved." });
        setSmtpPass("");
      } catch {
        setMessage({
          type: "error",
          text: "An unexpected error occurred.",
        });
      }
    });
  };

  const handleTest = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await testEmailConnection(
          provider,
          provider === "smtp"
            ? {
                host: smtpHost,
                port: smtpPort,
                user: smtpUser,
                pass: smtpPass,
                from: smtpFrom,
              }
            : { from: smtpFrom, host: "", port: "", user: "", pass: "" }
        );
        if (result.error) {
          setMessage({ type: "error", text: result.error });
        } else {
          setMessage({
            type: "success",
            text: result.message ?? "Test email sent successfully. Check the inbox.",
          });
        }
      } catch {
        setMessage({
          type: "error",
          text: "Connection failed. Verify your credentials.",
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

      <ComponentCard
        title="Email Provider"
        desc="Configure how notification emails are sent. Resend is the default provider."
      >
        <div className="space-y-4">
          {/* Provider toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setProvider("resend")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                provider === "resend"
                  ? "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              Resend (API)
            </button>
            <button
              type="button"
              onClick={() => setProvider("smtp")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                provider === "smtp"
                  ? "bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              SMTP (Custom)
            </button>
          </div>

          {provider === "resend" ? (
            /* Resend config */
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  From Address
                </label>
                <InputField
                  type="email"
                  placeholder="e.g. noreply@yourdomain.com"
                  defaultValue={smtpFrom}
                  onChange={(e) => setSmtpFrom(e.target.value)}
                />
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={isPending}
                >
                  {isPending ? "Sending..." : "Send Test Email"}
                </Button>
              </div>
            </div>
          ) : (
            /* SMTP config */
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  SMTP Host
                </label>
                <InputField
                  type="text"
                  placeholder="e.g. smtp.gmail.com"
                  defaultValue={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  SMTP Port
                </label>
                <InputField
                  type="number"
                  placeholder="587"
                  defaultValue={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Username
                </label>
                <InputField
                  type="text"
                  placeholder="SMTP username"
                  defaultValue={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Password
                </label>
                <InputField
                  type="password"
                  placeholder="Leave blank to keep current"
                  defaultValue=""
                  onChange={(e) => setSmtpPass(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  From Address
                </label>
                <InputField
                  type="email"
                  placeholder="e.g. noreply@yourdomain.com"
                  defaultValue={smtpFrom}
                  onChange={(e) => setSmtpFrom(e.target.value)}
                />
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={isPending}
                >
                  {isPending ? "Testing..." : "Test SMTP Connection"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </ComponentCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save Email Settings"}
        </Button>
      </div>
    </div>
  );
}
