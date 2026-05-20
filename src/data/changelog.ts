type ChangeType = "new" | "imp" | "fix";

interface ChangelogChange {
  type: ChangeType;
  text: string;
}

interface ChangelogEntry {
  version: string;
  date: string;
  name: string;
  isLatest: boolean;
  changes: ChangelogChange[];
}

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "v0.1.0",
    date: "Released — May 2026",
    name: "Multi-Platform Commerce Operations Positioning",
    isLatest: true,
    changes: [
      { type: "new", text: "WooCommerce, Laravel, and Next.js/MERN editions positioned as one ConversionFlow ecosystem" },
      { type: "new", text: "Pricing rebuilt around yearly, 2-year, and lifetime platform licenses" },
      { type: "new", text: "FAQ and platform comparison pages added for SEO and conversion support" },
      { type: "imp", text: "Homepage messaging upgraded around tracking reliability, COD protection, courier intelligence, and recovery" },
    ],
  },
  {
    version: "v0.0.14",
    date: "Released — May 2025",
    name: "Analytics Suite Release",
    isLatest: false,
    changes: [
      { type: "new", text: "Operational analytics dashboard with revenue trends and courier performance charts" },
      { type: "new", text: "Unified Tracking Hub for Meta Pixel, Meta CAPI, GA4, TikTok, Pinterest, Bing, and GTM" },
      { type: "imp", text: "Live background polling with auto-refresh operational statistics" },
      { type: "fix", text: "Missing-file guards for stability during deployments" },
    ],
  },
  {
    version: "v0.0.13",
    date: "Released — April 2025",
    name: "Fraud Shield & CAPI Events",
    isLatest: false,
    changes: [
      { type: "new", text: "Global blacklist by phone, IP, and email address" },
      { type: "new", text: "Velocity limits for repeat fake-order attempts" },
      { type: "new", text: "OrderDelivered and OrderReturned Meta CAPI events" },
      { type: "imp", text: "One-click block buttons in the WooCommerce order table" },
    ],
  },
  {
    version: "v0.0.12",
    date: "Released — March 2025",
    name: "RedX Integration & Lead Capture",
    isLatest: false,
    changes: [
      { type: "new", text: "RedX courier workflow support with automated status sync" },
      { type: "new", text: "Incomplete order capture for checkout recovery" },
      { type: "new", text: "Lead management interface to view and recover checkout leads" },
      { type: "fix", text: "Pathao API timeout handling on slow network conditions" },
    ],
  },
];
