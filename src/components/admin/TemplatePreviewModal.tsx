"use client";

import { Modal } from "@/components/ui/modal";

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateEvent: string;
  htmlContent: string;
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

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  templateEvent,
  htmlContent,
}: TemplatePreviewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Template Preview: {formatTemplateName(templateEvent)}
        </h3>
        <iframe
          srcDoc={htmlContent}
          style={{ width: "100%", height: "500px", border: "none" }}
          title={`Preview of ${templateEvent} template`}
          sandbox="allow-same-origin"
        />
      </div>
    </Modal>
  );
}
