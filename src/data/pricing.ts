import type { LicenseType } from "@/lib/plans";

interface PricingFeature {
  text: string;
  included: boolean;
}

export type { PricingFeature };

export type PlatformKey = "wordpress" | "laravel" | "shopify" | "nextjs";

export interface PlatformInfo {
  key: PlatformKey;
  name: string;
  available: boolean;
  description: string;
  icon: string;
}

export const platforms: PlatformInfo[] = [
  {
    key: "wordpress",
    name: "WordPress",
    available: true,
    description: "WooCommerce",
    icon: "🔌",
  },
  {
    key: "laravel",
    name: "Laravel",
    available: false,
    description: "Laravel Commerce",
    icon: "🔥",
  },
  {
    key: "shopify",
    name: "Shopify",
    available: false,
    description: "Shopify Store",
    icon: "🛍️",
  },
  {
    key: "nextjs",
    name: "Next.js",
    available: false,
    description: "Next.js Commerce",
    icon: "▲",
  },
];

// ── Presentation-only metadata keyed by plan slug (D-2 / D-6) ──
// Plan name, price, period, and description come from the DB (product_plans).
// Only the curated marketing feature bullet copy, the "Most Popular" badge,
// button label/style, and the WhatsApp message live here.

export interface PlanPresentation {
  slug: string;
  popular: boolean;
  features: PricingFeature[]; // curated marketing bullet copy
  buttonText: string;
  buttonStyle: "btn-primary" | "btn-outline";
  whatsappMessage: string;
}

export const planPresentation: Record<string, PlanPresentation> = {
  starter: {
    slug: "starter",
    popular: false,
    features: [
      { text: "1 WordPress Site", included: true },
      { text: "All 6 Modules", included: true },
      { text: "Steadfast + Pathao + RedX", included: true },
      { text: "Meta Pixel + CAPI", included: true },
      { text: "Fraud Shield", included: true },
      { text: "1 Year Updates", included: true },
      { text: "Email Support", included: true },
      { text: "Priority Support", included: false },
    ],
    buttonText: "Get Starter",
    buttonStyle: "btn-outline",
    whatsappMessage:
      "Hi, I'd like to purchase ConversionFlow Starter. I want to pay via bKash/Nagad.",
  },
  professional: {
    slug: "professional",
    popular: true,
    features: [
      { text: "3 WordPress Sites", included: true },
      { text: "All 6 Modules", included: true },
      { text: "Steadfast + Pathao + RedX", included: true },
      { text: "Meta Pixel + CAPI", included: true },
      { text: "Fraud Shield", included: true },
      { text: "Lifetime Updates", included: true },
      { text: "Priority Email Support", included: true },
      { text: "WhatsApp Support (BD)", included: true },
    ],
    buttonText: "Get Professional",
    buttonStyle: "btn-primary",
    whatsappMessage:
      "Hi, I'd like to purchase ConversionFlow Professional. I want to pay via bKash/Nagad.",
  },
  agency: {
    slug: "agency",
    popular: false,
    features: [
      { text: "Unlimited Sites", included: true },
      { text: "All 6 Modules", included: true },
      { text: "Steadfast + Pathao + RedX", included: true },
      { text: "Meta Pixel + CAPI", included: true },
      { text: "Fraud Shield", included: true },
      { text: "Lifetime Updates", included: true },
      { text: "Priority WhatsApp Support", included: true },
      { text: "White-label Ready", included: true },
    ],
    buttonText: "Get Agency",
    buttonStyle: "btn-outline",
    whatsappMessage:
      "Hi, I'd like to purchase ConversionFlow Agency. I want to pay via bKash/Nagad.",
  },
};

/** The ordered slugs that drive platformPricing (stable marketing ordering). */
export const PRICING_SLUG_ORDER: string[] = ["starter", "professional", "agency"];

/**
 * Sensible default presentation for any slug without curated copy (D-6).
 * Used as a fallback so the page never renders an empty card if an admin
 * adds a new plan whose slug isn't in planPresentation yet.
 */
export function buildDefaultPresentation(
  slug: string,
  planName: string,
  maxActivations: number,
  licenseType: LicenseType
): PlanPresentation {
  const sitesLabel =
    maxActivations === 0
      ? "Unlimited Sites"
      : `${maxActivations} Site${maxActivations === 1 ? "" : "s"}`;
  const updatesLabel =
    licenseType === "lifetime" ? "Lifetime Updates" : "Updates Included";
  return {
    slug,
    popular: false,
    features: [
      { text: sitesLabel, included: true },
      { text: "All 6 Modules", included: true },
      { text: updatesLabel, included: true },
      { text: "Email Support", included: true },
    ],
    buttonText: `Get ${planName}`,
    buttonStyle: "btn-outline",
    whatsappMessage: `Hi, I'd like to purchase ConversionFlow ${planName}. I want to pay via bKash/Nagad.`,
  };
}

/**
 * Platform-level pricing positioning summary, derived from the presentation
 * map for the three known slugs. Used elsewhere for platform positioning
 * text (kept working after pricingTiers was removed).
 */
export const platformPricing = PRICING_SLUG_ORDER.map((slug) => {
  const presentation = planPresentation[slug];
  const includedFeatures = presentation
    ? presentation.features.filter((f) => f.included).map((f) => f.text)
    : [];
  return {
    key: slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    positioning: includedFeatures[0] ?? "",
    features: includedFeatures,
  };
});
