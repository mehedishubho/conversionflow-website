interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  plan: string;
  priceUSD: string;
  priceBDT: string;
  period: string;
  desc: string;
  popular: boolean;
  features: PricingFeature[];
  buttonText: string;
  buttonStyle: "btn-primary" | "btn-outline";
  checkoutUrl: string;
  whatsappMessage: string;
}

export const pricingTiers: PricingTier[] = [
  {
    plan: "Starter",
    priceUSD: "$29",
    priceBDT: "≈ ৳3,499 BDT",
    period: "/one-time",
    desc: "For a single WooCommerce store",
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
    checkoutUrl: "https://checkout.woobooster.com/starter",
    whatsappMessage: "Hi, I'd like to purchase WooBooster Starter. I want to pay via bKash/Nagad.",
  },
  {
    plan: "Professional",
    priceUSD: "$69",
    priceBDT: "≈ ৳8,299 BDT",
    period: "/one-time",
    desc: "For agencies managing 3 stores",
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
    checkoutUrl: "https://checkout.woobooster.com/professional",
    whatsappMessage: "Hi, I'd like to purchase WooBooster Professional. I want to pay via bKash/Nagad.",
  },
  {
    plan: "Agency",
    priceUSD: "$129",
    priceBDT: "≈ ৳15,499 BDT",
    period: "/one-time",
    desc: "Unlimited sites for agencies",
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
    checkoutUrl: "https://checkout.woobooster.com/agency",
    whatsappMessage: "Hi, I'd like to purchase WooBooster Agency. I want to pay via bKash/Nagad.",
  },
];
