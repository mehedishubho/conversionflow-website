"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import TextArea from "@/components/form/input/TextArea";
import InputField from "@/components/form/input/InputField";
import {
  deleteNotification,
  broadcastNotification,
} from "@/app/(admin)/actions/admin-notifications";
import type { NotificationRow } from "@/app/(admin)/actions/admin-notifications";

export default function NotificationsTable({ notifications }: { notifications: NotificationRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteNotification(id);
      router.refresh();
    });
  };

  const handleBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setActionError(null);
    startTransition(async () => {
      const result = await broadcastNotification("admin_broadcast", broadcastTitle, broadcastMessage);
      if (result.error) {
        setActionError(result.error);
      } else {
        setBroadcastModal(false);
        setBroadcastTitle("");
        setBroadcastMessage("");
        router.refresh();
      }
    });
  };

  const typeColor = (type: string): "success" | "warning" | "error" | "light" => {
    if (type.includes("order")) return "success";
    if (type.includes("license")) return "warning";
    if (type.includes("security")) return "error";
    return "light";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="primary" onClick={() => setBroadcastModal(true)}>
          Broadcast Message
        </Button>
      </div>

      {actionError && (
        <div className="p-3 rounded-lg bg-error-50 text-error-600 text-sm dark:bg-error-500/10 dark:text-error-400">
          {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-gray-800 [&>th]:bg-gray-50 dark:[&>th]:bg-white/5">
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Type
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                User
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Title
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Message
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Date
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  No notifications found.
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((notif) => (
                <TableRow
                  key={notif.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <TableCell className="px-5 py-3 text-sm">
                    <Badge variant="light" color={typeColor(notif.type)} size="sm">
                      {notif.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {notif.userName ?? "Unknown"}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm font-medium text-gray-800 dark:text-white/90">
                    {notif.title}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                    {notif.message}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm">
                    <Badge
                      variant="light"
                      color={notif.read ? "light" : "success"}
                      size="sm"
                    >
                      {notif.read ? "Read" : "Unread"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(notif.createdAt)}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm">
                    <Button
                      size="sm"
                      variant="outline"
                      className="!text-error-500 !ring-error-300 hover:!bg-error-50 dark:hover:!bg-error-500/10"
                      onClick={() => handleDelete(notif.id)}
                      disabled={isPending}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={broadcastModal}
        onClose={() => {
          setBroadcastModal(false);
          setBroadcastTitle("");
          setBroadcastMessage("");
        }}
        className="max-w-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Broadcast Notification
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Send a notification to all users in the system.
        </p>
        <div className="space-y-3">
          <InputField
            label="Title"
            placeholder="Notification title"
            value={broadcastTitle}
            onChange={(e) => setBroadcastTitle(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Message
            </label>
            <TextArea
              placeholder="Notification message..."
              rows={3}
              value={broadcastMessage}
              onChange={setBroadcastMessage}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBroadcastModal(false);
              setBroadcastTitle("");
              setBroadcastMessage("");
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleBroadcast}
            disabled={isPending || !broadcastTitle.trim() || !broadcastMessage.trim()}
          >
            Send to All Users
          </Button>
        </div>
      </Modal>
    </div>
  );
}
