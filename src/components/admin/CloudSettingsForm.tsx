"use client";

import React, { useState, useTransition } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import InputField from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { saveCloudSettings } from "@/app/(admin)/actions/admin-backup";

interface CloudSettingsFormProps {
  initialData: {
    interval: string;
    retentionCount: number;
    cloud: {
      provider: string;
      s3: {
        endpoint: string;
        accessKey: string;
        secretKey: string;
        bucket: string;
      };
      gdrive: {
        clientId: string;
        clientSecret: string;
        refreshToken: string;
        folderId: string;
      };
    };
  };
}

export default function CloudSettingsForm({ initialData }: CloudSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { cloud } = initialData;

  const [provider, setProvider] = useState(cloud.provider || "none");
  const [s3Endpoint, setS3Endpoint] = useState(cloud.s3.endpoint);
  const [s3AccessKey, setS3AccessKey] = useState(cloud.s3.accessKey);
  const [s3SecretKey, setS3SecretKey] = useState("");
  const [s3Bucket, setS3Bucket] = useState(cloud.s3.bucket);
  const [gdriveClientId, setGdriveClientId] = useState(cloud.gdrive.clientId);
  const [gdriveClientSecret, setGdriveClientSecret] = useState("");
  const [gdriveRefreshToken, setGdriveRefreshToken] = useState("");
  const [gdriveFolderId, setGdriveFolderId] = useState(cloud.gdrive.folderId);

  const handleSaveCloud = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await saveCloudSettings({
          provider,
          s3Endpoint,
          s3AccessKey,
          s3SecretKey: s3SecretKey || undefined,
          s3Bucket,
          gdriveClientId,
          gdriveClientSecret: gdriveClientSecret || undefined,
          gdriveRefreshToken: gdriveRefreshToken || undefined,
          gdriveFolderId,
        });

        if (!result.success) {
          setMessage({ type: "error", text: "Failed to save cloud settings." });
        } else {
          setMessage({
            type: "success",
            text: "Cloud settings saved successfully.",
          });
          // Clear password fields after save
          setS3SecretKey("");
          setGdriveClientSecret("");
          setGdriveRefreshToken("");
        }
      } catch {
        setMessage({
          type: "error",
          text: "An unexpected error occurred.",
        });
      }
    });
  };

  return (
    <ComponentCard
      title="Cloud Storage"
      desc="Configure optional cloud backup destination. Backups are always stored locally first."
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Cloud Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs appearance-none focus:outline-hidden focus:ring-3 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="none">None (local only)</option>
            <option value="s3">S3-Compatible</option>
            <option value="gdrive">Google Drive</option>
            <option value="r2">Cloudflare R2</option>
          </select>
        </div>

        {/* S3/R2 fields */}
        {(provider === "s3" || provider === "r2") && (
          <div className="space-y-3">
            <InputField
              label="Endpoint URL"
              type="text"
              value={s3Endpoint}
              onChange={(e) => setS3Endpoint(e.target.value)}
              placeholder={
                provider === "r2"
                  ? "https://<account_id>.r2.cloudflarestorage.com"
                  : "https://s3.amazonaws.com"
              }
            />
            <InputField
              label="Access Key"
              type="text"
              value={s3AccessKey}
              onChange={(e) => setS3AccessKey(e.target.value)}
            />
            <InputField
              label="Secret Key"
              type="password"
              value={s3SecretKey}
              onChange={(e) => setS3SecretKey(e.target.value)}
              placeholder="Leave blank to keep current"
            />
            <InputField
              label="Bucket Name"
              type="text"
              value={s3Bucket}
              onChange={(e) => setS3Bucket(e.target.value)}
            />
          </div>
        )}

        {/* Google Drive fields */}
        {provider === "gdrive" && (
          <div className="space-y-3">
            <InputField
              label="Client ID"
              type="text"
              value={gdriveClientId}
              onChange={(e) => setGdriveClientId(e.target.value)}
            />
            <InputField
              label="Client Secret"
              type="password"
              value={gdriveClientSecret}
              onChange={(e) => setGdriveClientSecret(e.target.value)}
              placeholder="Leave blank to keep current"
            />
            <InputField
              label="Refresh Token"
              type="password"
              value={gdriveRefreshToken}
              onChange={(e) => setGdriveRefreshToken(e.target.value)}
              placeholder="Leave blank to keep current"
              helperText="Obtained via OAuth consent flow"
            />
            <InputField
              label="Folder ID"
              type="text"
              value={gdriveFolderId}
              onChange={(e) => setGdriveFolderId(e.target.value)}
              helperText="Google Drive folder ID for backup uploads"
            />
          </div>
        )}

        {provider !== "none" && (
          <div>
            <Button onClick={handleSaveCloud} disabled={isPending}>
              {isPending ? "Saving..." : "Save Cloud Settings"}
            </Button>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}
