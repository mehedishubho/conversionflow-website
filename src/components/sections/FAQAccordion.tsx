"use client";

import { useState } from "react";
import { faqItems } from "@/data/faq";
import { useTranslations } from "next-intl";

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  const t = useTranslations("pricingPage");

  return (
    <div className="faq-list">
      {faqItems.map((_, index) => (
        <div key={index} className={`fi${index === openIndex ? " open" : ""}`}>
          <div
            className="fi-q"
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
          >
            {t(`faqItems.${index}.question`)}
            <span className="fi-ic">+</span>
          </div>
          <div className="fi-a">
            <div className="fi-a-in">{t(`faqItems.${index}.answer`)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
