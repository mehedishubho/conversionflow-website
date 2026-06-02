"use client";

import React, { useState, useTransition } from "react";
import { issueVerificationToken } from "@/app/(portal)/actions/portal-licenses";

type VerificationMethod = "dns" | "file" | "meta";

interface ActivateDomainFormProps {
  licenseId: string;
  maxActivations: number;
  currentActivations: number;
}

const verificationMethods: { value: VerificationMethod; label: string }[] = [
  { value: "dns", label: "DNS TXT Record" },
  { value: "file", label: "File Upload" },
  { value: "meta", label: "Meta Tag" },
];

const methodInstructions: Record<VerificationMethod, (token: string) => string> = {
  dns: (token) =>
    `Add a DNS TXT record: cf-license-verify=${token}`,
  file: (token) =>
    `Upload a file at https://yourdomain/.well-known/conversionflow-verify.txt containing: ${token}`,
  meta: (token) =>
    `Add <meta name="cf-license-verify" content="${token}"> to your site's <head> section.`,
};

export default function ActivateDomainForm({
  licenseId,
  maxActivations,
  currentActivations,
}: ActivateDomainFormProps) {
  const [domain, setDomain] = useState("");
  const [method, setMethod] = useState<VerificationMethod>("dns");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isAtLimit = currentActivations >= maxActivations;

  const handleGetToken = () => {
    setError(null);
    setToken(null);

    const trimmedDomain = domain.trim();
    if (!trimmedDomain) {
      setError("Please enter a domain name.");
      return;
    }

    startTransition(async () => {
      const result = await issueVerificationToken(licenseId, trimmedDomain);
      if (result.success && result.token) {
        setToken(result.token);
      } else {
        setError(result.error ?? "Failed to issue verification token.");
      }
    });
  };

  return (
    <div className="mt-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-5">
      <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 mb-4">
        Activate New Domain
      </h4>

      {isAtLimit ? (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Activation limit reached ({currentActivations}/{maxActivations}).
          Deactivate an existing domain to activate a new one.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Domain input + method selector */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as VerificationMethod)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {verificationMethods.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Get token button */}
          <button
            type="button"
            onClick={handleGetToken}
            disabled={isPending || !domain.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Generating..." : "Get Verification Token"}
          </button>

          {/* Error display */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Token + instructions */}
          {token && (
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Verification Token:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-mono text-gray-800 dark:text-white/90 break-all">
                    {token}
                  </code>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(token)}
                    className="text-xs px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Instructions:
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  {methodInstructions[method](token)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
                  This token expires in 24 hours and is single-use.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
