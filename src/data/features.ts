export interface FeatureItem {
  title: string;
  description: string;
  keywords: string[];
}

export interface FeatureCategory {
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  intent: string;
  items: FeatureItem[];
}

export const featureCategories: FeatureCategory[] = [
  {
    slug: "tracking-analytics",
    eyebrow: "Tracking & Analytics",
    title: "Server-side and browser tracking for serious ad operations",
    summary:
      "ConversionFlow combines Meta Conversions API, browser Pixel, GA4, Google Ads tracking, TikTok Pixel, Pinterest Tag, Bing UET, and Google Tag Manager into one controlled tracking layer.",
    intent: "Improve event accuracy, recover lost purchase signals, and give ad platforms cleaner data after iOS and browser tracking limits.",
    items: [
      {
        title: "Meta Conversions API + Meta Pixel",
        description:
          "Send browser and server-side purchase, lead, delivery, and return events so Meta campaigns receive reliable conversion signals.",
        keywords: ["WooCommerce Meta CAPI plugin", "Meta Conversion API WooCommerce"],
      },
      {
        title: "GA4, Google Ads, GTM, TikTok, Pinterest, Bing",
        description:
          "Centralize campaign measurement across major ad and analytics platforms without stacking fragile tracking plugins.",
        keywords: ["WooCommerce tracking plugin", "Google Ads Tracking WooCommerce"],
      },
      {
        title: "Operational event quality",
        description:
          "Track checkout, paid, shipped, delivered, returned, and failed delivery outcomes so reporting follows the real order lifecycle.",
        keywords: ["Facebook Ads tracking for WooCommerce", "WooCommerce analytics dashboard"],
      },
    ],
  },
  {
    slug: "courier-automation",
    eyebrow: "Courier Automation",
    title: "Courier workflows built for Bangladesh delivery operations",
    summary:
      "Automate Steadfast, Pathao, and RedX workflows with courier booking, sync, status mapping, delivery visibility, and one-click order operations.",
    intent: "Reduce courier dashboard switching and give teams reliable delivery status inside the commerce platform.",
    items: [
      {
        title: "Steadfast, Pathao, and RedX integration",
        description:
          "Connect the courier partners Bangladesh stores actually use and keep operational status close to the order record.",
        keywords: ["WooCommerce Steadfast integration", "WooCommerce Pathao integration", "WooCommerce RedX integration"],
      },
      {
        title: "Delivery success analytics",
        description:
          "See delivered, returned, cancelled, and in-transit patterns so teams can identify courier and customer risk faster.",
        keywords: ["WooCommerce delivery analytics", "Bangladesh courier automation"],
      },
      {
        title: "Customer courier history",
        description:
          "Review customer delivery behavior before accepting risky COD orders or shipping repeat-return customers.",
        keywords: ["WooCommerce courier history", "COD fraud protection system"],
      },
    ],
  },
  {
    slug: "fraud-cod-protection",
    eyebrow: "Fraud & COD Protection",
    title: "Protect COD revenue before fake orders hit your delivery cost",
    summary:
      "Use fraud rules, customer courier intelligence, booking money, advance payment workflows, and order risk visibility to control COD exposure.",
    intent: "Stop repeat fake orders, reduce delivery failure, and protect margin before fulfillment begins.",
    items: [
      {
        title: "Fraud Shield",
        description:
          "Flag suspicious phone, email, IP, velocity, courier history, and repeat-return patterns before dispatch.",
        keywords: ["WooCommerce fraud protection plugin", "WooCommerce COD protection"],
      },
      {
        title: "COD booking money",
        description:
          "Collect partial advance payment or booking money for high-risk COD orders before sending inventory out.",
        keywords: ["Booking money WooCommerce", "Advance payment WooCommerce"],
      },
      {
        title: "Activity logging",
        description:
          "Keep a traceable record of order actions, customer risk checks, payment updates, and admin decisions.",
        keywords: ["WooCommerce order automation", "WooCommerce operational dashboard"],
      },
    ],
  },
  {
    slug: "checkout-recovery",
    eyebrow: "Checkout Recovery",
    title: "Recover abandoned checkout intent before the buyer disappears",
    summary:
      "Capture checkout leads, incomplete order data, and payment intent signals so sales teams can recover buyers while interest is still warm.",
    intent: "Turn lost checkout starts into actionable leads for follow-up and remarketing.",
    items: [
      {
        title: "Incomplete order recovery",
        description:
          "Save checkout fields as buyers type, then convert incomplete checkout sessions into sales follow-up opportunities.",
        keywords: ["WooCommerce abandoned checkout recovery", "checkout lead capture"],
      },
      {
        title: "Checkout lead capture",
        description:
          "Capture name, phone, product interest, and cart context before the final payment step fails or gets abandoned.",
        keywords: ["lost checkout leads", "WooCommerce checkout recovery"],
      },
      {
        title: "Notification engine",
        description:
          "Alert teams when a high-intent checkout lead, payment issue, or risky COD order needs action.",
        keywords: ["WooCommerce order automation", "eCommerce notification engine"],
      },
    ],
  },
  {
    slug: "partial-payments",
    eyebrow: "Partial Payments",
    title: "Advance payment controls for COD-heavy commerce",
    summary:
      "Support partial payment workflows, COD booking money, payment verification, and invoice visibility for stores that need commitment before delivery.",
    intent: "Reduce fake COD dispatches and give teams a cleaner payment-to-delivery workflow.",
    items: [
      {
        title: "Partial payment system",
        description:
          "Let teams collect a fixed or percentage advance before approving high-risk orders for courier booking.",
        keywords: ["WooCommerce partial payment plugin", "partial payment system"],
      },
      {
        title: "Manual BD payment workflows",
        description:
          "Support bKash, Nagad, Rocket, and bank transfer verification for local commerce teams.",
        keywords: ["bKash WooCommerce payment", "Nagad WooCommerce payment"],
      },
      {
        title: "Invoices and payment history",
        description:
          "Keep customer and admin views aligned with order payment state, invoice records, and verification outcomes.",
        keywords: ["WooCommerce invoice management", "BD payment automation"],
      },
    ],
  },
  {
    slug: "developer-infrastructure",
    eyebrow: "Developer Infrastructure",
    title: "Platform editions for merchants, custom stacks, and headless teams",
    summary:
      "Use WooCommerce Edition for WordPress-native operations, Laravel Edition for API-ready custom commerce, and Next.js/MERN Edition for headless tracking infrastructure.",
    intent: "Give technical teams the same commerce intelligence layer without forcing every business into WordPress.",
    items: [
      {
        title: "WooCommerce Edition",
        description:
          "Best for non-technical merchants that need fast setup, WordPress-native workflows, and marketing-friendly tracking.",
        keywords: ["WooCommerce Meta CAPI plugin", "WooCommerce courier integration Bangladesh"],
      },
      {
        title: "Laravel Edition",
        description:
          "Developer-first architecture for custom Laravel commerce stacks, API-ready workflows, and enterprise customization.",
        keywords: ["Laravel Meta CAPI", "Laravel eCommerce analytics"],
      },
      {
        title: "Next.js / MERN Edition",
        description:
          "Headless-ready event infrastructure for React, Node, and modern commerce teams that need server-side analytics control.",
        keywords: ["Next.js eCommerce tracking", "MERN commerce analytics"],
      },
    ],
  },
];

export const featureModules = featureCategories.map((category) => ({
  icon: "◆",
  title: category.eyebrow,
  description: category.summary,
  tags: category.items.slice(0, 3).map((item) => ({ label: item.title })),
  eyebrow: category.eyebrow,
  detailDescription: category.intent,
  checks: category.items.map((item) => item.title),
}));
