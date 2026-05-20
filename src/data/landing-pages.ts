export interface LandingPage {
  slug: string;
  primaryKeyword: string;
  title: string;
  description: string;
  audience: string;
  pain: string;
  solution: string;
  proofPoints: string[];
  relatedLinks: { label: string; href: string }[];
}

export const landingPages: LandingPage[] = [
  {
    slug: "woocommerce-meta-capi-plugin",
    primaryKeyword: "WooCommerce Meta CAPI plugin",
    title: "WooCommerce Meta CAPI Plugin for Cleaner Purchase Signals",
    description: "Send browser and server-side events from WooCommerce so Meta campaigns receive more reliable checkout, purchase, delivery, and return signals.",
    audience: "WooCommerce stores scaling Facebook Ads and needing better event quality.",
    pain: "Browser pixels alone miss events because of iOS restrictions, ad blockers, redirect delays, and unstable mobile checkout sessions.",
    solution: "ConversionFlow combines Meta Pixel and Meta Conversions API with operational order events for cleaner campaign optimization data.",
    proofPoints: ["Meta CAPI + browser Pixel", "Purchase, checkout, delivery, and return events", "WooCommerce-native setup", "Built for Bangladesh COD commerce"],
    relatedLinks: [{ label: "Explore Features", href: "/features" }, { label: "Compare Pricing", href: "/pricing" }],
  },
  {
    slug: "woocommerce-courier-integration-bangladesh",
    primaryKeyword: "WooCommerce courier integration Bangladesh",
    title: "WooCommerce Courier Integration for Bangladesh Stores",
    description: "Connect courier workflows, order status visibility, and delivery intelligence for Steadfast, Pathao, and RedX operations.",
    audience: "Courier-heavy Bangladesh WooCommerce teams.",
    pain: "Manual courier dashboards slow teams down and hide return, delivery, and customer history signals from the order workflow.",
    solution: "ConversionFlow brings courier operations closer to WooCommerce orders with sync, history, and delivery intelligence.",
    proofPoints: ["Steadfast workflow positioning", "Pathao workflow positioning", "RedX workflow positioning", "Delivery success analytics"],
    relatedLinks: [{ label: "Read Courier Docs", href: "/docs/courier-sync" }, { label: "View Platform Editions", href: "/platform-comparison" }],
  },
  {
    slug: "woocommerce-fraud-protection-plugin",
    primaryKeyword: "WooCommerce fraud protection plugin",
    title: "WooCommerce Fraud Protection for COD-Heavy Stores",
    description: "Reduce fake COD orders with fraud rules, courier history, activity logs, and booking money workflows.",
    audience: "COD-heavy eCommerce stores with repeat fake orders and delivery failures.",
    pain: "Fake orders cost courier fees, team time, stock availability, and campaign confidence before revenue is confirmed.",
    solution: "ConversionFlow adds operational checks before dispatch so teams can review risk and request advance payment where needed.",
    proofPoints: ["Fraud Shield", "Customer courier history", "Velocity and repeat-risk signals", "COD booking money"],
    relatedLinks: [{ label: "Read Fraud Docs", href: "/docs/fraud-shield" }, { label: "See FAQ", href: "/faq" }],
  },
  {
    slug: "woocommerce-partial-payment-plugin",
    primaryKeyword: "WooCommerce partial payment plugin",
    title: "WooCommerce Partial Payment and Booking Money Workflows",
    description: "Collect advance payment or booking money before high-risk COD dispatches.",
    audience: "Stores that need buyer commitment before courier booking.",
    pain: "COD buyers can place orders without commitment, leaving the store to absorb dispatch cost when delivery fails.",
    solution: "ConversionFlow positions partial payment as a COD protection workflow connected to risk review and payment verification.",
    proofPoints: ["Partial payment system", "COD booking money", "bKash/Nagad/Rocket workflows", "Invoice and payment history"],
    relatedLinks: [{ label: "Read Partial Payment Docs", href: "/docs/partial-payments" }, { label: "Compare Pricing", href: "/pricing" }],
  },
  {
    slug: "laravel-meta-capi",
    primaryKeyword: "Laravel Meta CAPI",
    title: "Laravel Meta CAPI for Custom Commerce Stacks",
    description: "Build server-side Meta events, analytics, courier workflows, and payment-state reporting into Laravel commerce systems.",
    audience: "Laravel developers and agencies building custom eCommerce platforms.",
    pain: "Custom stacks often need Meta CAPI and analytics without forcing operations into WordPress plugins.",
    solution: "ConversionFlow Laravel Edition gives developer-led teams an API-ready path for tracking and operations intelligence.",
    proofPoints: ["Laravel-friendly integration layer", "Server-side event workflows", "Custom courier/payment logic", "Operational analytics"],
    relatedLinks: [{ label: "Laravel Setup Docs", href: "/docs/laravel-setup" }, { label: "Compare Platforms", href: "/platform-comparison" }],
  },
  {
    slug: "nextjs-ecommerce-tracking",
    primaryKeyword: "Next.js eCommerce tracking",
    title: "Next.js eCommerce Tracking for Headless Commerce",
    description: "Plan server-side event architecture for Meta CAPI, GA4, checkout recovery, and operational analytics in Next.js and MERN stacks.",
    audience: "Headless commerce teams using React, Next.js, Node, or MERN infrastructure.",
    pain: "Modern commerce stacks need event ownership beyond fragile browser snippets and scattered analytics calls.",
    solution: "ConversionFlow Next.js/MERN Edition focuses on server-side event infrastructure for tracking, recovery, and operations visibility.",
    proofPoints: ["React ecosystem optimized", "Server-side event architecture", "Headless checkout signal capture", "Scalable analytics layer"],
    relatedLinks: [{ label: "Next.js / MERN Docs", href: "/docs/nextjs-mern-setup" }, { label: "View Pricing", href: "/pricing" }],
  },
];
