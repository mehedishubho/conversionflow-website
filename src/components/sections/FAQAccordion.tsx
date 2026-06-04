"use client";

import { useState } from "react";
import { faqItems } from "@/data/faq";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  const { t } = useLanguage();

  return (
    <div className="faq-list">
      {faqItems.map((_, index) => (
        <div key={index} className={`fi${index === openIndex ? " open" : ""}`}>
          <div
            className="fi-q"
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
          >
            {t(`faq.q${index}`)}
            <span className="fi-ic">+</span>
          </div>
          <div className="fi-a">
            <div className="fi-a-in">{t(`faq.a${index}`)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
