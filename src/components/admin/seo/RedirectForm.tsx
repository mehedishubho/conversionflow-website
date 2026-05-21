"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import Switch from "@/components/form/switch/Switch";
import Select from "@/components/form/Select";
import {
  createRedirect,
  updateRedirect,
  type RedirectRow,
} from "@/app/(admin)/actions/admin-redirects";

interface RedirectFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  editData?: RedirectRow | null;
}

const typeOptions = [
  { value: "301", label: "301 (Permanent)" },
  { value: "302", label: "302 (Temporary)" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function RedirectForm({
  open,
  onClose,
  onSave,
  editData,
}: RedirectFormProps) {
  const [isPending, startTransition] = useTransition();
  const [fromUrl, setFromUrl] = useState("");
  const [toUrl, setToUrl] = useState("");
  const [type, setType] = useState("301");
  const [isRegex, setIsRegex] = useState(false);
  const [status, setStatus] = useState("active");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editData) {
      setFromUrl(editData.fromUrl);
      setToUrl(editData.toUrl);
      setType(editData.type);
      setIsRegex(editData.isRegex);
      setStatus(editData.status);
    } else {
      setFromUrl("");
      setToUrl("");
      setType("301");
      setIsRegex(false);
      setStatus("active");
    }
    setError(null);
  }, [editData, open]);

  const handleSubmit = () => {
    setError(null);

    if (!fromUrl.trim() || !toUrl.trim()) {
      setError("From URL and To URL are required.");
      return;
    }

    startTransition(async () => {
      let result;
      if (editData) {
        result = await updateRedirect(editData.id, {
          fromUrl: fromUrl.trim(),
          toUrl: toUrl.trim(),
          type: type as "301" | "302",
          isRegex,
          status: status as "active" | "inactive",
        });
      } else {
        result = await createRedirect({
          fromUrl: fromUrl.trim(),
          toUrl: toUrl.trim(),
          type: type as "301" | "302",
          isRegex,
        });
      }

      if (result.error) {
        setError(result.error);
      } else {
        onSave();
      }
    });
  };

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
        {editData ? "Edit Redirect" : "Add Redirect"}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        {editData
          ? "Update redirect settings."
          : "Create a new URL redirect rule."}
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error-50 text-error-600 text-sm dark:bg-error-500/10 dark:text-error-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* From URL */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            From URL
          </label>
          <InputField
            placeholder={isRegex ? "/old-blog/(.*)" : "/old-page"}
            value={fromUrl}
            onChange={(e) => setFromUrl(e.target.value)}
          />
          {isRegex && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Enter regex pattern, e.g. /old-blog/(.*)
            </p>
          )}
        </div>

        {/* To URL */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            To URL
          </label>
          <InputField
            placeholder={isRegex ? "/blog/$1" : "/new-page"}
            value={toUrl}
            onChange={(e) => setToUrl(e.target.value)}
          />
          {isRegex && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Use $1, $2 for capture groups
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Redirect Type
          </label>
          <div className="w-52">
            <Select
              options={typeOptions}
              defaultValue={type}
              onChange={setType}
            />
          </div>
        </div>

        {/* Is Regex */}
        <Switch
          label="Regex Pattern"
          defaultChecked={isRegex}
          onChange={(checked) => setIsRegex(checked)}
        />

        {/* Status (only in edit mode) */}
        {editData && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Status
            </label>
            <div className="w-52">
              <Select
                options={statusOptions}
                defaultValue={status}
                onChange={setStatus}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending}
        >
          {isPending
            ? "Saving..."
            : editData
              ? "Update Redirect"
              : "Create Redirect"}
        </Button>
      </div>
    </Modal>
  );
}
