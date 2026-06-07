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
    icon: "🎯",
    title: "Meta Conversions API (CAPI)",
    description:
      "Server-side tracking that survives ad blockers and iOS privacy changes. Send purchase events directly from your server to Facebook — so every sale counts.",
    tags: [
      { label: "6 Auto Events" },
      { label: "Auto-Purchase" },
      { label: "Multi-Pixel" },
      { label: "SHA256 Match" },
      { label: "Test Mode" },
    ],
    eyebrow: "Module 01",
    detailDescription:
      "Browser pixels miss up to 30% of purchases. ConversionFlow sends Purchase, Delivered, Shipping, Returned, Cancelled, and Confirmed events directly from your server via CAPI. Advanced matching with SHA256 hashed email, phone, name, city, and IP for better ad targeting.",
    checks: [
      "6 Automated Events on order status changes",
      "Auto-Purchase Engine with trusted customer threshold",
      "Multi-Pixel support for agencies",
      "UUID-based duplicate prevention",
      "Built-in test event codes for debugging",
    ],
  },
  {
    icon: "📊",
    title: "Multi-Channel Tracking",
    description:
      "One dashboard for 7 tracking platforms. Stop installing scripts manually — manage Meta Pixel, GA4, Google Ads, TikTok, Pinterest, Bing UET, and GTM from a single page.",
    tags: [{ label: "Meta Pixel" }, { label: "GA4" }, { label: "TikTok" }, { label: "GTM" }, { label: "GDPR" }],
    eyebrow: "Module 02",
    detailDescription:
      "ConversionFlow injects and manages all your pixels from a single settings page. Includes GDPR consent management, browser DNT respect, and domain verification for Meta & Google Ads.",
    checks: [
      "Meta Pixel: PageView, ViewContent, AddToCart, Purchase",
      "GA4 Measurement Protocol server-side events",
      "Google Ads, TikTok, Pinterest, Bing UET tracking",
      "GTM centralized tag management",
      "GDPR consent toggle & DNT support",
    ],
    trackingPlatforms: [
      { name: "Meta Pixel", status: "Active + CAPI" },
      { name: "Google GA4", status: "Active" },
      { name: "Google Ads", status: "Active" },
      { name: "TikTok Pixel", status: "Active" },
      { name: "Pinterest Tag", status: "Active" },
      { name: "Bing UET", status: "Active" },
      { name: "Google Tag Manager", status: "Active" },
    ],
  },
  {
    icon: "📦",
    title: "Courier Automation",
    description:
      "Auto-sync orders with Steadfast, Pathao & RedX. Stop manually checking courier websites — statuses update automatically in WooCommerce.",
    tags: [
      { label: "Steadfast" },
      { label: "Pathao" },
      { label: "RedX" },
      { label: "Auto Sync" },
      { label: "Status Mapping" },
    ],
    eyebrow: "Module 03",
    detailDescription:
      "ConversionFlow polls Steadfast, Pathao, and RedX in the background at your chosen interval (15 min to daily), automatically updating WooCommerce order statuses. Create shipments directly from admin, test API connections with one click, and retry on failure up to 3 times.",
    checks: [
      "3 major BD couriers integrated out of the box",
      "Configurable background sync: 15min, 1hr, 6hr, 12hr, daily",
      "Auto status mapping — Delivered → Complete, Returned → Returned",
      "Create shipments from WooCommerce admin",
      "Courier analytics — success vs. failure rates",
    ],
  },
  {
    icon: "🛡️",
    title: "Fraud Shield",
    description:
      "Block fake orders before they happen. Blacklist by phone, email, or IP. Velocity limits stop spam. One-click block from the orders table.",
    tags: [{ label: "Blacklist" }, { label: "IP Block" }, { label: "Velocity Limits" }],
    eyebrow: "Module 04",
    detailDescription:
      "Bad orders cost you money — in courier fees, returned products, and wasted time. Fraud Shield stops them at checkout with global blacklists, velocity limits, customer history lookup, and visual delivery reliability bars.",
    checks: [
      "Global blacklist — phone, email, IP address",
      "Velocity limits — max orders per phone/email/IP in 24hrs",
      "One-click block from orders table",
      "Customer history lookup with success/cancel ratio",
      "Silent or visible blocking modes",
    ],
    fraudOrders: [
      { id: "#8834", phone: "017XXXXX", status: "Pending", statusClass: "bd-pn", action: "Block" },
      { id: "#8833", phone: "018XXXXX", status: "BLOCKED", statusClass: "", action: "Auto-cancelled" },
      { id: "#8832", phone: "019XXXXX", status: "Delivered", statusClass: "bd-ok", action: "Block" },
    ],
    fraudStats: { blocked: 12, protected: "৳18,400 protected this month" },
  },
  {
    icon: "🔄",
    title: "Incomplete Orders Recovery",
    description:
      "Capture every abandoned checkout as it happens. Save name, phone, email, address, and cart contents in real-time as customers type. One-click convert to order.",
    tags: [{ label: "Real-Time Capture" }, { label: "Abandoned Cart" }, { label: "CSV Export" }],
    eyebrow: "Module 05",
    detailDescription:
      "Most stores lose 70% of checkouts to abandonment. ConversionFlow captures customer data as they type — so you can recover them. Includes customer history, IP geolocation, search/filter, and CSV export.",
    checks: [
      "Real-time capture of name, phone, email, address, cart",
      "One-click convert lead to WooCommerce order",
      "Customer success/cancel history per phone number",
      "IP geolocation — city, region, country",
      "Search, filter, CSV export, bulk delete",
    ],
  },
  {
    icon: "💰",
    title: "Partial Payment System",
    description:
      "Let customers pay in advance — on your terms. Fixed amount, percentage, or customer choice. Separate rules for bKash, Nagad, and Rocket.",
    tags: [{ label: "bKash" }, { label: "Nagad" }, { label: "COD Protection" }, { label: "Preorder" }],
    eyebrow: "Module 06",
    detailDescription:
      "COD orders are risky. Partial payments reduce risk by collecting booking money upfront. Includes gateway-specific rules for bKash, Nagad, and Rocket, category/product overrides, variation support, and minimum advance floors.",
    checks: [
      "Flexible rules — fixed, percentage, or customer choice",
      "Gateway-specific amounts for bKash, Nagad, Rocket",
      "Category & product-level overrides",
      "COD Protection (PRO) — refundable booking money",
      "Preorder System (PRO) — accept preorders with advance payment",
    ],
  },
  {
    icon: "✅",
    title: "10 Custom Order Statuses",
    description:
      "Track every stage of your order pipeline with 10 color-coded statuses tailored for COD-heavy markets. Every status auto-triggers Meta CAPI events.",
    tags: [{ label: "Color-Coded" }, { label: "Auto CAPI" }, { label: "COD Pipeline" }],
    eyebrow: "Module 07",
    detailDescription:
      "Default WooCommerce has limited statuses. ConversionFlow adds Purchase, Confirmed, Shipping, Delivered, Returned, Cancelled, Autosave, Partially Paid, Awaiting Verification, and Payment Due — each with a distinct color and automatic CAPI event trigger.",
    checks: [
      "Purchase — auto-approved trusted orders",
      "Confirmed, Shipping, Delivered, Returned, Cancelled",
      "Autosave, Partially Paid, Awaiting Verification, Payment Due",
      "Color-coded badges for instant recognition",
      "Auto-triggers corresponding Meta CAPI events",
    ],
  },
  {
    icon: "📈",
    title: "Smart Dashboard",
    description:
      "Your store's performance at a glance. Revenue cards, order volume charts, courier analytics, and quick toggles — all in one beautiful admin dashboard.",
    tags: [{ label: "Revenue" }, { label: "Charts" }, { label: "Quick Toggles" }],
    eyebrow: "Module 08",
    detailDescription:
      "A modern admin dashboard with revenue card (7/15/30/90 days), order count, open leads, fraud shielded stats, daily revenue trend chart, courier success vs. failure rates, and order volume by status breakdown.",
    checks: [
      "Revenue card — 7, 15, 30, or 90 day periods",
      "Orders card with period selection",
      "Open leads & fraud shielded count cards",
      "Revenue trend, logistics, and order volume charts",
      "Quick toggles to enable/disable features",
    ],
  },
  {
    icon: "📬",
    title: "Automated Notifications",
    description:
      "Send email and SMS notifications when order status changes. Editable HTML templates with placeholders. Per-event control for Shipped, Delivered, Returned.",
    tags: [{ label: "Email" }, { label: "SMS" }, { label: "Templates" }],
    eyebrow: "Module 09",
    detailDescription:
      "Keep customers informed automatically. 3 trigger events — Shipped, Delivered, Returned — with customizable HTML email templates using [order_id], [customer_name], [tracking_id], [courier_name] placeholders. SMS via any gateway hook. Per-event email/SMS control.",
    checks: [
      "3 trigger events — Shipped, Delivered, Returned",
      "Editable HTML email templates with placeholders",
      "SMS support via hook-based gateway integration",
      "Per-event independent control — email, SMS, or both",
    ],
  },
  {
    icon: "📝",
    title: "Activity Log",
    description:
      "Full audit trail for your store. Logs every settings change, license action, courier sync, notification, status update, and fraud action with user ID, IP, and timestamp.",
    tags: [{ label: "Audit Trail" }, { label: "User Tracking" }, { label: "Auto Cleanup" }],
    eyebrow: "Module 10",
    detailDescription:
      "Know exactly what happened, when, and by whom. Configurable retention (7, 15, 30 days, or forever) with automatic old log cleanup.",
    checks: [
      "Logs every settings, license, sync, and fraud action",
      "Tracks user ID, IP address, and timestamp",
      "Configurable retention — 7, 15, 30 days or keep forever",
      "Automatic old log cleanup",
    ],
  },
  {
    icon: "🌙",
    title: "Modern Admin UI",
    description:
      "Dark mode, light mode, glassmorphism design, responsive sidebar, toast notifications, and color-coded badges. Looks like a premium SaaS product.",
    tags: [{ label: "Dark Mode" }, { label: "Glassmorphism" }, { label: "Mobile-First" }],
    eyebrow: "Module 11",
    detailDescription:
      "ConversionFlow's admin interface looks like a premium SaaS product — not a typical WordPress plugin. Dark/Light theme toggle, glassmorphism cards, responsive sidebar, non-blocking toast notifications, and mobile-first layout.",
    checks: [
      "Dark / Light theme — instant toggle, persists across sessions",
      "Glassmorphism design with smooth animations",
      "Responsive sidebar for mobile and tablet",
      "Toast notifications for every action",
      "Color-coded status badges and mobile-first layout",
    ],
  },
  {
    icon: "🔐",
    title: "License & Security",
    description:
      "Domain-bound license, AES-256-CBC encryption, 7-day free trial, remote activation, and built-in tamper detection. Enterprise-grade protection.",
    tags: [{ label: "AES-256" }, { label: "Free Trial" }, { label: "Integrity Guard" }],
    eyebrow: "Module 12",
    detailDescription:
      "One license per domain with AES-256-CBC encryption. 7-day free trial with full feature access. 4 license tiers — Free, Yearly, 2 Years, Lifetime. Remote activation/deactivation from devsroom.com with built-in integrity guard.",
    checks: [
      "Domain-bound license — one per domain",
      "AES-256-CBC encrypted license keys",
      "7-day free trial — full access, no card needed",
      "Remote activation & deactivation",
      "Integrity Guard — built-in tamper detection",
    ],
  },
];

export const featureCategories = featureModules.map((m, i) => ({
  slug: m.title.toLowerCase().replace(/\s+/g, "-"),
  eyebrow: m.eyebrow || m.title,
  summary: m.description,
  items: (m.tags || []).map((t) => ({ title: t.label })),
}));
