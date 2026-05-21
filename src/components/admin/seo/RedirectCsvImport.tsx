"use client";

import React, { useState, useTransition, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import {
  importRedirectsCsv,
  exportRedirectsCsv,
} from "@/app/(admin)/actions/admin-redirects";

interface RedirectCsvImportProps {
  open: boolean;
  onClose: () => void;
  onImport: () => void;
}

export default function RedirectCsvImport({
  open,
  onClose,
  onImport,
}: RedirectCsvImportProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage({ type: "error", text: "Please select a CSV file." });
      return;
    }

    setMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      startTransition(async () => {
        const result = await importRedirectsCsv(text);
        if (result.error) {
          setMessage({ type: "error", text: result.error });
        } else {
          setMessage({
            type: "success",
            text: `Successfully imported ${result.imported} redirect${result.imported !== 1 ? "s" : ""}.`,
          });
          onImport();
        }
      });
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const csv = await exportRedirectsCsv();
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "redirects.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch {
        setMessage({ type: "error", text: "Failed to export redirects." });
      }
    });
  };

  const handleClose = () => {
    setMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose} className="max-w-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
        Import / Export Redirects
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        Import redirects from CSV or export existing redirects.
      </p>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400"
              : "bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Import Section */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Import
        </h4>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="block w-full text-sm text-gray-500 dark:text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-medium
            file:bg-gray-100 file:text-gray-700
            dark:file:bg-gray-800 dark:file:text-gray-300
            hover:file:bg-gray-200 dark:hover:file:bg-gray-700"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500">
          CSV format: from_url,to_url (one redirect per line, all imported as
          301)
        </p>
        <Button
          size="sm"
          onClick={handleImport}
          disabled={isPending}
        >
          {isPending ? "Importing..." : "Import CSV"}
        </Button>
      </div>

      {/* Export Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Export
        </h4>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Download all redirects as a CSV file.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          disabled={isPending}
        >
          Export CSV
        </Button>
      </div>

      {/* Close */}
      <div className="flex justify-end mt-6">
        <Button variant="outline" size="sm" onClick={handleClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
