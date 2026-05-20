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
    ],
  },
  {
    category: "Modules",
    items: [
      { slug: "courier-sync", title: "Courier Sync" },
      { slug: "meta-capi", title: "Meta CAPI" },
      { slug: "fraud-shield", title: "Fraud Shield" },
      { slug: "analytics", title: "Analytics" },
    ],
  },
];
