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
    version: "v0.0.14",
    date: "Released — May 2025",
    name: "Analytics Suite Release",
    isLatest: true,
    changes: [
      { type: "new", text: "Full analytics dashboard with revenue trends and courier performance charts" },
      { type: "new", text: "Unified Tracking Hub — manage all pixels from one interface" },
      { type: "new", text: "Live background polling with auto-refresh stats" },
      { type: "imp", text: "Dual-theme design system — glassmorphism light & dark modes" },
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
      { type: "new", text: "Velocity limits — max orders per user per day" },
      { type: "new", text: "OrderDelivered & OrderReturned Meta CAPI events" },
      { type: "imp", text: "One-click block buttons in the WooCommerce order table" },
    ],
  },
  {
    version: "v0.0.12",
    date: "Released — March 2025",
    name: "RedX Integration & Lead Capture",
    isLatest: false,
    changes: [
      { type: "new", text: "RedX courier deep integration with auto status sync" },
      { type: "new", text: "Incomplete order capture — saves checkout fields in real-time" },
      { type: "new", text: "Lead management interface to view and convert leads" },
      { type: "fix", text: "Pathao API timeout handling on slow network conditions" },
    ],
  },
];
