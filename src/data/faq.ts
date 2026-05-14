interface FAQItem {
  question: string;
  answer: string;
}

export const faqItems: FAQItem[] = [
  {
    question: "Is this a one-time payment or subscription?",
    answer:
      "One-time payment. No monthly or annual fees. You own it forever. Updates included for 1 year (Starter) or lifetime (Pro & Agency).",
  },
  {
    question: "Which couriers are supported?",
    answer:
      "Steadfast, Pathao, and RedX — Bangladesh's top three courier services. More are on the roadmap based on user demand.",
  },
  {
    question: "Do I need a developer?",
    answer:
      "No. If you can install a WordPress plugin, you can fully set up ConversionFlow. The wizard guides you step-by-step.",
  },
  {
    question: "Can I pay in BDT using bKash or Nagad?",
    answer:
      "Yes. We accept bKash, Nagad, Rocket, and bank transfer. Email mhs@wpmhs.com to arrange local payment.",
  },
  {
    question: "What is your refund policy?",
    answer:
      "30-day money-back guarantee, no questions asked. Email mhs@wpmhs.com within 30 days for a full refund within 24 hours.",
  },
];
