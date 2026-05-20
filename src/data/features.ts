interface FeatureTag {
  label: string;
}

interface TrackingPlatform {
  name: string;
  status: string;
}

interface FraudOrder {
  id: string;
  phone: string;
  status: string;
  statusClass: string;
  action: string;
}

interface FeatureModule {
  icon: string;
  title: string;
  description: string;
  tags: FeatureTag[];
  eyebrow?: string;
  detailDescription?: string;
  checks?: string[];
  trackingPlatforms?: TrackingPlatform[];
  fraudOrders?: FraudOrder[];
  fraudStats?: { blocked: number; protected: string };
}

export const featureModules: FeatureModule[] = [
  {
    icon: "🚚",
    title: "Automated Courier Sync",
    description:
      "Automatically polls Steadfast, Pathao, and RedX in the background and updates your WooCommerce order statuses in real-time. Zero manual tracking.",
    tags: [
      { label: "Steadfast" },
      { label: "Pathao" },
      { label: "RedX" },
      { label: "Auto Poll" },
      { label: "Status Mapping" },
    ],
    eyebrow: "Module 01",
    detailDescription:
      "ConversionFlow polls Steadfast, Pathao, and RedX every hour in the background, automatically updating your WooCommerce order statuses — delivered, returned, or cancelled.",
    checks: [
      "Background polling — no manual action needed",
      "Real-time status: Delivered / Returned / Cancelled",
      "Per-courier API key from WordPress admin",
      "One-click manual sync from order list",
    ],
  },
  {
    icon: "📊",
    title: "Advanced Analytics",
    description:
      "Revenue trends, courier performance charts, and live-polling stats — all in one beautiful dashboard.",
    tags: [{ label: "Live Data" }, { label: "Charts" }],
  },
  {
    icon: "🛡️",
    title: "Fraud Shield",
    description:
      "Block bad actors by phone, IP, or email. Velocity limits stop automated abuse before orders are placed.",
    tags: [{ label: "Blacklist" }, { label: "IP Block" }],
    eyebrow: "Module 03",
    detailDescription:
      "Bangladesh eCommerce has a high fake-order rate. Block bad actors before they cost you money — by phone number, IP address, or email. Velocity limits stop repeat abuse.",
    checks: [
      "Global blacklist: phone, IP, email",
      "Velocity limits — max orders per user",
      "One-click block from the order table",
      "Blocked orders auto-cancelled pre-payment",
    ],
    fraudOrders: [
      { id: "#8834", phone: "017XXXXX", status: "Pending", statusClass: "bd-pn", action: "Block" },
      { id: "#8833", phone: "018XXXXX", status: "BLOCKED", statusClass: "", action: "Auto-cancelled" },
      { id: "#8832", phone: "019XXXXX", status: "Delivered", statusClass: "bd-ok", action: "Block" },
    ],
    fraudStats: { blocked: 12, protected: "৳18,400 protected this month" },
  },
  {
    icon: "📈",
    title: "Meta Pixel + CAPI",
    description:
      "Hybrid browser + server-side tracking that survives iOS 14 and ad-blockers. 100% accurate conversions.",
    tags: [{ label: "CAPI" }, { label: "iOS 14+" }, { label: "GA4" }],
    eyebrow: "Module 02",
    detailDescription:
      "Browser-side pixels miss 30–40% of conversions. ConversionFlow’s hybrid approach combines browser Pixel with server-side CAPI — every purchase tracked, every time.",
    checks: [
      "Unified Tracking Hub for all platforms",
      "GA4, TikTok, Pinterest, GTM supported",
      "Auto-fire OrderDelivered & OrderReturned",
      "One-click manual CAPI sync",
    ],
    trackingPlatforms: [
      { name: "Meta Pixel", status: "Active + CAPI" },
      { name: "Google GA4", status: "Active" },
      { name: "TikTok Pixel", status: "Active" },
      { name: "Pinterest Tag", status: "Active" },
      { name: "Google Tag Manager", status: "Active" },
    ],
  },
  {
    icon: "🛒",
    title: "Lead Recovery",
    description:
      "Capture checkout fields in real-time as users type. Convert incomplete orders into paying customers.",
    tags: [{ label: "Leads" }, { label: "Abandoned Cart" }],
  },
  {
    icon: "💎",
    title: "Premium UI System",
    description:
      "Light & dark admin themes with glassmorphism, emerald accents, and micro-animations.",
    tags: [{ label: "Dark Mode" }, { label: "Animations" }],
  },
];
