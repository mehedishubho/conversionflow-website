export interface PlatformPlan {
  name: string;
  priceUSD: string;
  priceBDT: string;
  period: string;
  checkoutUrl: string;
  popular?: boolean;
  support: string;
}

export interface PlatformPricing {
  key: "woocommerce" | "laravel" | "nextjs";
  name: string;
  label: string;
  positioning: string;
  bestFor: string;
  cta: string;
  whatsappMessage: string;
  features: string[];
  plans: PlatformPlan[];
}

export const platformPricing: PlatformPricing[] = [
  {
    key: "woocommerce",
    name: "WooCommerce Edition",
    label: "For WordPress stores",
    positioning: "WordPress-native setup for merchants who need Meta CAPI, courier automation, COD protection, and recovery workflows without custom engineering.",
    bestFor: "WooCommerce store owners, Facebook Ads-driven shops, COD-heavy Bangladesh commerce teams.",
    cta: "Start WooCommerce Edition",
    whatsappMessage: "Hi, I want to buy ConversionFlow WooCommerce Edition.",
    features: [
      "WordPress-native setup",
      "Meta Pixel + Conversions API",
      "Steadfast, Pathao, RedX workflows",
      "Fraud Shield and COD booking money",
      "Partial payments and checkout recovery",
      "Operational dashboard for store teams",
    ],
    plans: [
      { name: "1 Year", priceUSD: "$18", priceBDT: "≈ ৳2,150 BDT", period: "1 year updates", checkoutUrl: "/dashboard/checkout?platform=woocommerce&plan=1-year", support: "Email support" },
      { name: "2 Years", priceUSD: "$28", priceBDT: "≈ ৳3,000 BDT", period: "2 years updates", checkoutUrl: "/dashboard/checkout?platform=woocommerce&plan=2-years", popular: true, support: "Priority email support" },
      { name: "Lifetime", priceUSD: "$75", priceBDT: "≈ ৳8,000 BDT", period: "Lifetime license", checkoutUrl: "/dashboard/checkout?platform=woocommerce&plan=lifetime", support: "Priority WhatsApp support" },
    ],
  },
  {
    key: "laravel",
    name: "Laravel Edition",
    label: "For custom commerce stacks",
    positioning: "Developer-first commerce intelligence for Laravel stores that need API-ready tracking, courier workflows, and operational customization.",
    bestFor: "Laravel developers, agencies, custom checkout teams, and enterprise commerce operations.",
    cta: "Start Laravel Edition",
    whatsappMessage: "Hi, I want to buy ConversionFlow Laravel Edition.",
    features: [
      "API-ready event workflows",
      "Laravel-friendly integration layer",
      "Server-side Meta CAPI architecture",
      "Custom courier and payment workflows",
      "Operational analytics and activity logs",
      "Enterprise customization path",
    ],
    plans: [
      { name: "1 Year", priceUSD: "$42", priceBDT: "≈ ৳5,000 BDT", period: "1 year updates", checkoutUrl: "/dashboard/checkout?platform=laravel&plan=1-year", support: "Developer email support" },
      { name: "2 Years", priceUSD: "$68", priceBDT: "≈ ৳8,000 BDT", period: "2 years updates", checkoutUrl: "/dashboard/checkout?platform=laravel&plan=2-years", popular: true, support: "Priority developer support" },
      { name: "Lifetime", priceUSD: "$170", priceBDT: "≈ ৳20,000 BDT", period: "Lifetime license", checkoutUrl: "/dashboard/checkout?platform=laravel&plan=lifetime", support: "Priority implementation support" },
    ],
  },
  {
    key: "nextjs",
    name: "Next.js / MERN Edition",
    label: "For headless teams",
    positioning: "Headless-ready event infrastructure for React, Node, and MERN commerce teams that need scalable server-side tracking and analytics.",
    bestFor: "Next.js commerce, MERN platforms, headless stores, and teams building modern tracking infrastructure.",
    cta: "Start Headless Edition",
    whatsappMessage: "Hi, I want to buy ConversionFlow Next.js / MERN Edition.",
    features: [
      "React ecosystem optimized",
      "Server-side event architecture",
      "Headless commerce tracking layer",
      "Meta CAPI and analytics event APIs",
      "Scalable reporting data flow",
      "Developer-controlled integration surface",
    ],
    plans: [
      { name: "1 Year", priceUSD: "$68", priceBDT: "≈ ৳8,000 BDT", period: "1 year updates", checkoutUrl: "/dashboard/checkout?platform=nextjs&plan=1-year", support: "Developer email support" },
      { name: "2 Years", priceUSD: "$100", priceBDT: "≈ ৳12,000 BDT", period: "2 years updates", checkoutUrl: "/dashboard/checkout?platform=nextjs&plan=2-years", popular: true, support: "Priority developer support" },
      { name: "Lifetime", priceUSD: "$210", priceBDT: "≈ ৳25,000 BDT", period: "Lifetime license", checkoutUrl: "/dashboard/checkout?platform=nextjs&plan=lifetime", support: "Priority architecture support" },
    ],
  },
];

export const pricingTiers = platformPricing[0].plans.map((plan) => ({
  plan: plan.name,
  priceUSD: plan.priceUSD,
  priceBDT: plan.priceBDT,
  period: plan.period,
  desc: platformPricing[0].positioning,
  popular: Boolean(plan.popular),
  features: platformPricing[0].features.map((text) => ({ text, included: true })),
  buttonText: platformPricing[0].cta,
  buttonStyle: plan.popular ? "btn-primary" as const : "btn-outline" as const,
  checkoutUrl: plan.checkoutUrl,
  whatsappMessage: platformPricing[0].whatsappMessage,
}));
