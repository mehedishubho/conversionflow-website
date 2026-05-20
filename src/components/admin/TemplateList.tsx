"use client";

import { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import TemplatePreviewModal from "@/components/admin/TemplatePreviewModal";

interface TemplateEntry {
  event: string;
  category: string;
  htmlContent: string | null;
}

interface TemplateListProps {
  templates: TemplateEntry[];
}

function getCategoryBadgeColor(category: string) {
  switch (category) {
    case "orders":
      return "primary";
    case "licenses":
      return "success";
    case "tickets":
      return "warning";
    case "system":
      return "info";
    default:
      return "light";
  }
}

function formatTemplateName(event: string): string {
  const names: Record<string, string> = {
    "order.created": "Order Confirmation",
    "order.confirmed": "Order Confirmed",
    "order.payment_failed": "Payment Failed",
    "order.refunded": "Refund Processed",
    "license.generated": "License Key Generated",
    "license.delivered": "License Key Delivered",
    "license.expiring_soon": "License Expiring Soon",
    "license.expired": "License Expired",
    "ticket.created": "Ticket Created",
    "ticket.reply_received": "Ticket Reply Received",
    "ticket.status_changed": "Ticket Status Changed",
    "ticket.resolved": "Ticket Resolved",
    "system.blog_published": "Blog Published",
    "system.security_alert": "Security Alert",
  };
  return names[event] ?? event;
}

export default function TemplateList({ templates }: TemplateListProps) {
  const [previewEvent, setPreviewEvent] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  const openPreview = (event: string, htmlContent: string) => {
    setPreviewEvent(event);
    setPreviewHtml(htmlContent);
  };

  const closePreview = () => {
    setPreviewEvent(null);
    setPreviewHtml("");
  };

  return (
    <>
      <ComponentCard title="Notification Templates">
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Template Name
                </th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                  Category
                </th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr
                  key={template.event}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {formatTemplateName(template.event)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      variant="light"
                      color={getCategoryBadgeColor(template.category)}
                      size="sm"
                    >
                      {template.category}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {template.htmlContent ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          openPreview(template.event, template.htmlContent!)
                        }
                      >
                        Preview
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        No preview available
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          Templates are managed in code. To modify a template, update the source
          files.
        </p>
      </ComponentCard>

      {/* Template preview modal */}
      {previewEvent && (
        <TemplatePreviewModal
          isOpen={!!previewEvent}
          onClose={closePreview}
          templateEvent={previewEvent}
          htmlContent={previewHtml}
        />
      )}
    </>
  );
}
