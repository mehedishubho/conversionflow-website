/**
 * Static page SEO configuration.
 * This file is safe to import in both server and client components.
 * It does not contain any database imports or server-only code.
 */

export type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords: string[];
};

export const pageSeo: Record<string, PageSeo> = {
  home: {
    title: "ConversionFlow - Commerce Tracking, Courier Automation & COD Protection",
    description:
      "Unify Meta CAPI, pixels, courier automation, COD fraud protection, partial payments, checkout recovery, and analytics for WooCommerce, Laravel, and Next.js/MERN stores.",
    path: "",
    keywords: [
      "eCommerce operations platform Bangladesh",
      "WooCommerce Meta CAPI plugin",
      "COD fraud protection system",
      "Bangladesh courier automation",
      "WooCommerce tracking plugin",
    ],
  },
  features: {
    title: "ConversionFlow Features - Tracking, Courier Automation, Fraud Protection",
    description:
      "Explore ConversionFlow features for tracking accuracy, courier automation, COD protection, partial payments, checkout recovery, and operational analytics.",
    path: "/features",
    keywords: [
      "WooCommerce tracking plugin",
      "Meta Conversion API WooCommerce",
      "WooCommerce courier integration Bangladesh",
      "WooCommerce fraud protection plugin",
      "WooCommerce analytics dashboard",
    ],
  },
  pricing: {
    title: "ConversionFlow Pricing - WooCommerce, Laravel, Next.js/MERN Editions",
    description:
      "Compare ConversionFlow pricing for WooCommerce, Laravel, and Next.js/MERN editions with yearly, 2-year, and lifetime licensing options.",
    path: "/pricing",
    keywords: [
      "ConversionFlow pricing",
      "WooCommerce COD protection pricing",
      "Laravel eCommerce analytics pricing",
      "Next.js eCommerce tracking pricing",
    ],
  },
  changelog: {
    title: "ConversionFlow Changelog - Product Updates and Release Notes",
    description:
      "Track ConversionFlow releases across Meta CAPI, courier integrations, fraud protection, checkout recovery, analytics, and platform editions.",
    path: "/changelog",
    keywords: ["ConversionFlow changelog", "WooCommerce Meta CAPI updates", "fraud protection release notes"],
  },
  faq: {
    title: "ConversionFlow FAQ - Licensing, Tracking, Couriers, COD Protection",
    description:
      "Answers about ConversionFlow editions, pricing, Meta CAPI, courier integrations, partial payments, COD protection, support, and licensing.",
    path: "/faq",
    keywords: ["ConversionFlow FAQ", "WooCommerce COD protection FAQ", "Meta CAPI WooCommerce FAQ"],
  },
  platformComparison: {
    title: "WooCommerce vs Laravel vs Next.js/MERN - ConversionFlow Editions",
    description:
      "Compare ConversionFlow editions for WooCommerce merchants, Laravel commerce stacks, and Next.js/MERN headless commerce infrastructure.",
    path: "/platform-comparison",
    keywords: ["WooCommerce vs Laravel vs Next.js eCommerce tracking", "Laravel Meta CAPI", "Next.js eCommerce tracking"],
  },
  docs: {
    title: "ConversionFlow Documentation - Setup Tracking, Couriers, Fraud Protection",
    description:
      "Setup guides for ConversionFlow tracking, Meta CAPI, courier automation, fraud protection, partial payments, checkout recovery, and platform editions.",
    path: "/docs",
    keywords: ["ConversionFlow documentation", "Meta CAPI setup WooCommerce", "Steadfast WooCommerce integration"],
  },
  support: {
    title: "ConversionFlow Support - Tracking, Courier, COD and Licensing Help",
    description:
      "Get support for ConversionFlow setup, Meta CAPI, courier integrations, fraud protection, licensing, billing, and platform edition selection.",
    path: "/support",
    keywords: ["ConversionFlow support", "Meta CAPI setup help", "COD protection support"],
  },
};
