interface SupportChannel {
  icon: string;
  title: string;
  description: string;
  action: string;
  href: string;
}

export const supportChannels: SupportChannel[] = [
  {
    icon: "📧",
    title: "Email Support",
    description:
      "Send us a detailed message and we'll respond within 24 hours, usually much faster.",
    action: "mhs@wpmhs.com",
    href: "mailto:mhs@wpmhs.com",
  },
  {
    icon: "💬",
    title: "WhatsApp (BD)",
    description:
      "Bangladesh-based direct support via WhatsApp. Reply within business hours (9AM–6PM BST).",
    action: "+880 1721-328992",
    href: "#",
  },
  {
    icon: "📖",
    title: "Documentation",
    description:
      "Step-by-step guides for every module — from first install to advanced CAPI configuration.",
    action: "Browse Docs →",
    href: "#",
  },
];
