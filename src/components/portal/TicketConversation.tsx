"use client";

import { useEffect, useRef, useState } from "react";
import { FileUploadArea } from "@/components/portal/FileUploadArea";
import { replyToTicket } from "@/app/(portal)/actions/support";
import { useRouter } from "next/navigation";

type Attachment = {
  fileName: string;
  storedName: string;
  size: number;
  type: string;
};

type Message = {
  id: string;
  userId: string;
  message: string;
  attachments: Attachment[] | null;
  createdAt: Date;
};

export function TicketConversation({
  messages,
  currentUserId,
  ticketId,
  isTicketOpen,
}: {
  messages: Message[];
  currentUserId: string;
  ticketId: string;
  isTicketOpen: boolean;
}) {
  const [replyText, setReplyText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsPending(true);
    setError(null);

    const formData = new FormData();
    formData.append("message", replyText);
    for (const file of selectedFiles) {
      formData.append("files", file);
    }

    const result = await replyToTicket(ticketId, formData);
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    } else {
      setReplyText("");
      setSelectedFiles([]);
      router.refresh();
    }
  };

  return (
    <div>
      {/* Conversation thread */}
      <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03]">
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
            No messages yet. This is the beginning of the conversation.
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.userId === currentUserId;
          const msgAttachments = (msg.attachments as Attachment[] | null) ?? [];

          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  isOwn
                    ? "bg-brand-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white/90 border border-gray-200 dark:border-gray-700"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                {msgAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {msgAttachments.map((att, i) => (
                      <span
                        key={`${att.storedName}-${i}`}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                          isOwn
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {att.fileName}
                      </span>
                    ))}
                  </div>
                )}
                <span
                  className={`text-xs mt-1 block ${
                    isOwn
                      ? "text-white/70"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply area */}
      {isTicketOpen && (
        <form onSubmit={handleSubmit}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply..."
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 min-h-[100px] text-sm text-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500 mt-4"
          />
          <div className="flex items-center justify-between mt-2">
            <FileUploadArea onFilesChange={setSelectedFiles} />
            <button
              type="submit"
              disabled={isPending || !replyText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-brand-500 dark:hover:bg-brand-600"
            >
              {isPending ? "Sending..." : "Send Reply"}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </form>
      )}
    </div>
  );
}
