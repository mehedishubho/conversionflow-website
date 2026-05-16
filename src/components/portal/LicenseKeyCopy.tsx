"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface LicenseKeyCopyProps {
  licenseKey: string;
}

export function LicenseKeyCopy({ licenseKey }: LicenseKeyCopyProps) {
  const [copied, setCopied] = useState(false);

  const masked =
    licenseKey.length >= 8
      ? `${licenseKey.slice(0, 2)}-****-****-${licenseKey.slice(-4)}`
      : licenseKey;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <code className="font-mono text-sm text-gray-800 dark:text-white/90">
        {masked}
      </code>
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
        aria-label="Copy license key"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
