"use client";

import { useState, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import { FileUploadArea } from "@/components/portal/FileUploadArea";
import { createTicket } from "@/app/(portal)/actions/support";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function CreateTicketModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600"
      >
        <Plus className="w-4 h-4" />
        New Ticket
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setError(null);
        }}
        className="max-w-xl p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-white/90 mb-6">
          Create Support Ticket
        </h3>
        <form
          action={async (formData) => {
            setIsPending(true);
            setError(null);
            for (const file of selectedFiles) {
              formData.append("files", file);
            }
            const result = await createTicket(formData);
            if (result?.error) {
              setError(result.error);
              setIsPending(false);
            } else {
              setIsOpen(false);
              setSelectedFiles([]);
              router.refresh();
            }
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input
                name="subject"
                required
                placeholder="Brief description of your issue"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                name="priority"
                defaultValue="medium"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                required
                placeholder="Describe your issue in detail"
                rows={5}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-800 dark:text-white/90 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <FileUploadArea
                onFilesChange={setSelectedFiles}
                maxFiles={3}
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              {isPending ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
