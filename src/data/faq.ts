export interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    category: "Platform Editions",
    question: "Which ConversionFlow edition should I choose?",
    answer:
      "Choose WooCommerce Edition if your store runs on WordPress, Laravel Edition for custom Laravel commerce systems, and Next.js / MERN Edition for headless React or Node-based commerce infrastructure.",
  },
  {
    category: "Platform Editions",
    question: "Is ConversionFlow still only a WooCommerce plugin?",
    answer:
      "No. WooCommerce remains the fastest merchant-ready edition, but ConversionFlow is now positioned as a multi-platform commerce operations ecosystem with Laravel and Next.js/MERN editions for developer-led teams.",
  },
  {
    category: "Pricing & Licensing",
    question: "What are the current prices?",
    answer:
      "WooCommerce starts at $18/year, Laravel starts at $42/year, and Next.js / MERN starts at $68/year. Every edition also has 2-year and lifetime options with BDT equivalents for Bangladesh buyers.",
  },
  {
    category: "Pricing & Licensing",
    question: "Can I pay locally in Bangladesh?",
    answer:
      "Yes. ConversionFlow supports assisted local payment through bKash, Nagad, Rocket, and bank transfer, with invoices and license delivery through the customer portal.",
  },
  {
    category: "Tracking & Ads",
    question: "Does ConversionFlow support Meta Conversions API?",
    answer:
      "Yes. ConversionFlow is built around hybrid tracking: browser Pixel events plus server-side Meta Conversions API events for stronger purchase, checkout, delivery, and return signal quality.",
  },
  {
    category: "Tracking & Ads",
    question: "Will this help with iOS and browser tracking limitations?",
    answer:
      "ConversionFlow improves event reliability by sending server-side events where browser-only tracking can be blocked, delayed, or underreported. It does not promise impossible 100% attribution, but it gives ad platforms cleaner operational signals.",
  },
  {
    category: "Courier Automation",
    question: "Which Bangladesh couriers are supported?",
    answer:
      "The WooCommerce-focused workflow supports Steadfast, Pathao, and RedX positioning. Laravel and Next.js/MERN editions are designed for API-ready courier workflows that can be adapted to custom operations.",
  },
  {
    category: "Fraud & COD Protection",
    question: "How does ConversionFlow reduce fake COD orders?",
    answer:
      "It combines Fraud Shield rules, customer courier history, delivery success visibility, velocity checks, booking money workflows, activity logs, and operational review points before dispatch.",
  },
  {
    category: "Partial Payments",
    question: "Can I collect booking money before delivery?",
    answer:
      "Yes. The platform positioning includes partial payment and COD booking money workflows so stores can request advance commitment before shipping high-risk orders.",
  },
  {
    category: "Support",
    question: "Do I need a developer?",
    answer:
      "WooCommerce Edition is intended for merchant-friendly setup. Laravel and Next.js/MERN editions are developer-oriented and best suited for teams that control their own commerce infrastructure.",
  },
  {
    category: "Support",
    question: "What support channels are available?",
    answer:
      "Support is available through documentation, email, and WhatsApp-assisted communication for Bangladesh buyers and implementation questions.",
  },
];
