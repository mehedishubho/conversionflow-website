"use client";

import { useState, useCallback, useRef } from "react";
import { Paperclip, X } from "lucide-react";

export function FileUploadArea({
  onFilesChange,
  maxFiles = 3,
}: {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/pdf",
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList) return;

      const newFiles: File[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (!allowedTypes.includes(file.type)) continue;
        if (file.size > maxSize) continue;
        newFiles.push(file);
      }

      const updated = [...selectedFiles, ...newFiles].slice(0, maxFiles);
      setSelectedFiles(updated);
      onFilesChange(updated);

      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [selectedFiles, maxFiles, onFilesChange]
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      const updated = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(updated);
      onFilesChange(updated);
    },
    [selectedFiles, onFilesChange]
  );

  return (
    <div>
      <input
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.pdf"
        multiple
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <Paperclip className="w-4 h-4" />
        Attach Files
        <span className="text-xs text-gray-400 dark:text-gray-500">
          (PNG, JPG, WebP, PDF -- max 10MB)
        </span>
      </button>
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedFiles.map((file, i) => (
            <span
              key={`${file.name}-${i}`}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-700 dark:text-gray-300"
            >
              {file.name}
              <button
                type="button"
                onClick={() => handleRemoveFile(i)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
