interface SupportChannel {
  icon: string;
  title: string;
  description: string;
  action: string;
  href: string;
}

export const supportChannels: SupportChannel[] = [
  {
    icon: "Email",
    title: "Email Support",
    description:
      "Send platform selection, tracking, courier, licensing, or billing questions to the Devsroom team.",
    action: "support@salesconversionflow.com",
    href: "mailto:support@salesconversionflow.com",
  },
  {
    icon: "WA",
    title: "WhatsApp (BD)",
    description:
      "Bangladesh-based direct support via WhatsApp for pricing, local payment, and implementation questions.",
    action: "+880 1721-328992",
    href: "https://wa.me/8801721328992",
  },
  {
    icon: "Docs",
    title: "Documentation",
    description:
      "Setup guides for Meta CAPI, courier automation, COD protection, partial payments, checkout recovery, and developer editions.",
    action: "Browse Docs",
    href: "/docs",
  },
];
