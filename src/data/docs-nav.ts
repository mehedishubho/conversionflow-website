export interface DocNavItem {
  slug: string;
  title: string;
}

export interface DocNavCategory {
  category: string;
  items: DocNavItem[];
}

export const docsNav: DocNavCategory[] = [
  {
    category: "Getting Started",
    items: [
      { slug: "getting-started", title: "Getting Started" },
      { slug: "platform-editions", title: "Platform Editions" },
    ],
  },
  {
    category: "Tracking & Operations",
    items: [
      { slug: "courier-sync", title: "Courier Sync" },
      { slug: "meta-capi", title: "Meta CAPI" },
      { slug: "fraud-shield", title: "Fraud Shield" },
      { slug: "analytics", title: "Analytics" },
      { slug: "partial-payments", title: "Partial Payments" },
      { slug: "checkout-recovery", title: "Checkout Recovery" },
      { slug: "courier-history", title: "Courier History" },
    ],
  },
  {
    category: "Developer Guides",
    items: [
      { slug: "laravel-setup", title: "Laravel Setup" },
      { slug: "nextjs-mern-setup", title: "Next.js / MERN Setup" },
    ],
  },
];
