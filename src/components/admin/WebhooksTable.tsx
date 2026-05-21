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
import InputField from "@/components/form/input/InputField";
import {
  createWebhook,
  deleteWebhook,
  toggleWebhookStatus,
} from "@/app/(admin)/actions/admin-webhooks";
import type { WebhookRow } from "@/app/(admin)/actions/admin-webhooks";

const AVAILABLE_EVENTS = [
  "order.created",
  "order.status_changed",
  "license.created",
  "license.status_changed",
  "user.registered",
  "user.banned",
  "ticket.created",
];

export default function WebhooksTable({ webhooks }: { webhooks: WebhookRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const handleCreate = () => {
    if (!newUrl.trim() || selectedEvents.length === 0) return;
    setActionError(null);
    startTransition(async () => {
      const result = await createWebhook(newUrl, selectedEvents);
      if (result.error) {
        setActionError(result.error);
      } else {
        setCreateModal(false);
        setNewUrl("");
        setSelectedEvents([]);
        router.refresh();
      }
    });
  };

  const handleToggle = (id: string) => {
    startTransition(async () => {
      await toggleWebhookStatus(id);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteWebhook(id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="primary" onClick={() => setCreateModal(true)}>
          Add Webhook
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
                URL
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Events
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Last Triggered
              </TableCell>
              <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 dark:text-gray-400 text-start">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  No webhook endpoints configured. Click &quot;Add Webhook&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              webhooks.map((wh) => (
                <TableRow
                  key={wh.id}
                  className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <TableCell className="px-5 py-3 text-sm font-mono text-gray-800 dark:text-white/90 max-w-xs truncate">
                    {wh.url}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((e) => (
                        <Badge key={e} variant="light" color="light" size="sm">
                          {e}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm">
                    <Badge
                      variant="light"
                      color={wh.status === "active" ? "success" : "warning"}
                      size="sm"
                    >
                      {wh.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(wh.lastTriggeredAt)}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggle(wh.id)}
                        disabled={isPending}
                      >
                        {wh.status === "active" ? "Disable" : "Enable"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="!text-error-500 !ring-error-300 hover:!bg-error-50 dark:hover:!bg-error-500/10"
                        onClick={() => handleDelete(wh.id)}
                        disabled={isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={createModal}
        onClose={() => {
          setCreateModal(false);
          setNewUrl("");
          setSelectedEvents([]);
          setActionError(null);
        }}
        className="max-w-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Add Webhook Endpoint
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Webhook URLs must use HTTPS. A signing secret will be generated automatically.
        </p>
        <div className="space-y-4">
          <InputField
            label="Endpoint URL"
            placeholder="https://example.com/webhooks"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Events
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_EVENTS.map((event) => (
                <button
                  key={event}
                  type="button"
                  onClick={() => toggleEvent(event)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedEvents.includes(event)
                      ? "bg-brand-50 text-brand-600 border-brand-200 dark:bg-brand-500/15 dark:text-brand-400 dark:border-brand-500/30"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-white/5 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-white/10"
                  }`}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCreateModal(false);
              setNewUrl("");
              setSelectedEvents([]);
              setActionError(null);
            }}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleCreate}
            disabled={isPending || !newUrl.trim() || selectedEvents.length === 0}
          >
            Create Webhook
          </Button>
        </div>
      </Modal>
    </div>
  );
}
