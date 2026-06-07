"use client";

import React, { useState, useTransition } from "react";
import { issueVerificationToken } from "@/app/(portal)/actions/portal-licenses";

type VerificationMethod = "dns" | "file" | "meta";

interface ActivateDomainFormProps {
  licenseId: string;
  maxActivations: number;
  currentActivations: number;
}

const verificationMethods: { value: VerificationMethod; label: string; desc: string }[] = [
  { value: "meta", label: "Meta Tag", desc: "Easiest — add one line to your HTML" },
  { value: "dns", label: "DNS TXT Record", desc: "Add a TXT record in your DNS panel" },
  { value: "file", label: "File Upload", desc: "Upload a verification file to your server" },
];

export default function ActivateDomainForm({
  licenseId,
  maxActivations,
  currentActivations,
}: ActivateDomainFormProps) {
  const [domain, setDomain] = useState("");
  const [method, setMethod] = useState<VerificationMethod>("meta");
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isAtLimit = maxActivations > 0 && currentActivations >= maxActivations;

  const handleGetToken = () => {
    setError(null);
    setToken(null);

    const trimmedDomain = domain.trim();
    if (!trimmedDomain) {
      setError("Please enter a domain name.");
      return;
    }

    // Basic domain validation
    const domainPattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (!domainPattern.test(trimmedDomain)) {
      setError("Please enter a valid domain (e.g., example.com).");
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

  // Generate downloadable verification file
  const handleDownloadFile = () => {
    if (!token) return;
    const content = `conversionflow-verify=${token}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "conversionflow-verify.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderInstructions = () => {
    if (!token) return null;

    switch (method) {
      case "meta":
        return (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 space-y-3">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              📋 Step 1: Copy this meta tag
            </p>
            <div className="flex items-start gap-2">
              <code className="flex-1 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-xs font-mono text-gray-800 dark:text-white/90 break-all border border-blue-200 dark:border-blue-800">
                {`<meta name="cf-license-verify" content="${token}">`}
              </code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`<meta name="cf-license-verify" content="${token}">`)}
                className="shrink-0 text-xs px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              📋 Step 2: Paste it inside your website&apos;s <code className="bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">&lt;head&gt;...&lt;/head&gt;</code> section
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              📋 Step 3: Once saved, click <strong>&quot;Verify &amp; Activate&quot;</strong> below
            </p>
          </div>
        );

      case "dns":
        return (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 space-y-3">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              📋 Step 1: Go to your DNS management panel
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              This is usually in your domain registrar (e.g., Cloudflare, GoDaddy, Namecheap) or hosting control panel.
            </p>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              📋 Step 2: Add a new TXT record with these values:
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-md border border-blue-200 dark:border-blue-800 overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-blue-100 dark:border-blue-900">
                    <td className="px-3 py-2 font-medium text-gray-600 dark:text-gray-400 w-28">Type</td>
                    <td className="px-3 py-2 text-gray-800 dark:text-white/90 font-mono">TXT</td>
                  </tr>
                  <tr className="border-b border-blue-100 dark:border-blue-900">
                    <td className="px-3 py-2 font-medium text-gray-600 dark:text-gray-400">Name / Host</td>
                    <td className="px-3 py-2 text-gray-800 dark:text-white/90 font-mono">cf-license-verify</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-600 dark:text-gray-400">Value</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-gray-800 dark:text-white/90 break-all">{token}</code>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(token)}
                          className="shrink-0 text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              📋 Step 3: Save the record, wait a few minutes for DNS to propagate, then click <strong>&quot;Verify &amp; Activate&quot;</strong> below
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-500">
              ⏱ DNS changes can take 5-30 minutes to propagate globally.
            </p>
          </div>
        );

      case "file":
        return (
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 space-y-3">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              📋 Step 1: Download the verification file
            </p>
            <button
              type="button"
              onClick={handleDownloadFile}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download conversionflow-verify.txt
            </button>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              📋 Step 2: Upload the file to your website
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Place it at this URL path on your server:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-xs font-mono text-gray-800 dark:text-white/90 border border-blue-200 dark:border-blue-800 break-all">
                https://{domain}/.well-known/conversionflow-verify.txt
              </code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`https://${domain}/.well-known/conversionflow-verify.txt`)}
                className="shrink-0 text-xs px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              >
                Copy
              </button>
            </div>
            <div className="rounded-md bg-white dark:bg-gray-800 px-3 py-2 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">File contents:</p>
              <code className="text-xs font-mono text-gray-800 dark:text-white/90 break-all">
                conversionflow-verify={token}
              </code>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              📋 Step 3: Once the file is accessible, click <strong>&quot;Verify &amp; Activate&quot;</strong> below
            </p>
          </div>
        );

      default:
        return null;
    }
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
          {/* Domain input */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Domain Name
            </label>
            <input
              type="text"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Verification method selector */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              Verification Method
            </label>
            <div className="space-y-2">
              {verificationMethods.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    method === m.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="verificationMethod"
                    value={m.value}
                    checked={method === m.value}
                    onChange={() => setMethod(m.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">{m.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Get token button */}
          <button
            type="button"
            onClick={handleGetToken}
            disabled={isPending || !domain.trim()}
            className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Generating..." : "Get Verification Instructions"}
          </button>

          {/* Error display */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Instructions */}
          {token && (
            <div className="mt-3 space-y-3">
              {/* Token display */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Your verification token:
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

              {/* Method-specific instructions */}
              {renderInstructions()}

              {/* Token expiry notice */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ⏱ This token expires in 24 hours and is single-use.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
