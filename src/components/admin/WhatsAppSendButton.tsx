"use client";

import Button from "@/components/ui/button/Button";

/**
 * Generate a wa.me link for manual WhatsApp sending.
 * Inlined here to avoid importing Node.js-only modules (BullMQ) in client bundle.
 */
function generateWhatsAppLink(phone: string, message: string): string {
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "+880" + cleaned.slice(1);
  }
  const waPhone = cleaned.replace("+", "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${waPhone}?text=${encodedMessage}`;
}

interface WhatsAppSendButtonProps {
  phone?: string | null;
  message: string;
}

export default function WhatsAppSendButton({
  phone,
  message,
}: WhatsAppSendButtonProps) {
  if (!phone) {
    return (
      <Button variant="outline" size="sm" disabled>
        Send via WhatsApp
      </Button>
    );
  }

  const handleClick = () => {
    const link = generateWhatsAppLink(phone, message);
    window.open(link, "_blank");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      Send via WhatsApp
    </Button>
  );
}
