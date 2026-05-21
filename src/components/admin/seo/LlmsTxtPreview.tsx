"use client";

import { useState, useEffect } from "react";
import ComponentCard from "@/components/common/ComponentCard";

export default function LlmsTxtPreview() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchLlmsTxt() {
      try {
        const res = await fetch("/llms.txt");
        if (res.ok) {
          const text = await res.text();
          setContent(text);
        } else {
          setContent("Failed to load llms.txt preview.");
        }
      } catch {
        setContent("Failed to load llms.txt preview.");
      } finally {
        setLoading(false);
      }
    }
    fetchLlmsTxt();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <ComponentCard
      title="llms.txt Preview"
      desc="Auto-generated from your site data for AI crawler consumption."
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading preview...
            </p>
          </div>
        ) : (
          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-gray-50 p-4 font-mono text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
            {content}
          </pre>
        )}

        <div className="flex items-center gap-4">
          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Open /llms.txt
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <button
            type="button"
            onClick={handleCopy}
            disabled={loading || !content}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            {copied ? "Copied!" : "Copy Content"}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          This file is auto-generated from your site configuration. AI crawlers
          can access it at /llms.txt
        </p>
      </div>
    </ComponentCard>
  );
}
