"use client";

import { useTranslations } from "next-intl";
import { featureCategories } from "@/data/features";
import { StaggerReveal, StaggerItem } from "@/components/layout/StaggerReveal";

const categoryIcons: Record<string, string> = {
  "Tracking & Analytics": "📊",
  "Courier Automation": "🚚",
  "Fraud & COD Protection": "🛡️",
  "Checkout Recovery": "🔄",
  "Partial Payments": "💳",
  "Developer Infrastructure": "⚙️",
};

// 4-row repeating cycle: [w2, n] [n,n,n] [n, w2] [n,n,n]
function isWide(index: number) {
  const pos = index % 10;
  return pos === 0 || pos === 6;
}

const allCards = featureCategories.flatMap((category) => [
  // Category header card
  {
    type: "category" as const,
    icon: categoryIcons[category.eyebrow] || "◆",
    title: category.eyebrow,
    description: category.summary,
    tag: null as string | null,
  },
  // 3 feature cards
  ...category.items.map((item) => ({
    type: "feature" as const,
    icon: categoryIcons[category.eyebrow] || "◆",
    title: item.title,
    description: item.description,
    tag: category.eyebrow,
  })),
]);

export function FeaturesBento() {
  const t = useTranslations("featuresBento");

  return (
    <section className="sec">
      <div className="max-w-[1280px] mx-auto px-7">
        <div className="sh center">
          <div className="eyebrow">{t("eyebrow")}</div>
          <div className="sec-title">{t("title")}</div>
          <p className="sec-sub">{t("subtitle")}</p>
        </div>
        <StaggerReveal className="bento">
          {allCards.map((card, index) => (
            <StaggerItem
              key={`${card.type}-${index}`}
              className={`bc${isWide(index) ? " w2" : ""}`}
            >
              <div className="bc-icon">{card.icon}</div>
              <div className="bc-title">{card.title}</div>
              <div className="bc-desc">{card.description}</div>
              {card.tag && (
                <div className="tags">
                  <span className="tag">{card.tag}</span>
                </div>
              )}
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
