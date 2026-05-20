"use client";

import { useState } from "react";
import { faqItems } from "@/data/faq";

export function FAQAccordion({ category }: { category?: string }) {
  const filteredItems = category ? faqItems.filter((item) => item.category === category) : faqItems;
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq-list">
      {filteredItems.map((item, index) => (
        <div key={`${item.category}-${item.question}`} className={`fi${index === openIndex ? " open" : ""}`}>
          <button
            type="button"
            className="fi-q w-full text-left"
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
          >
            <span>
              <span className="block text-[10px] uppercase tracking-[1.2px] text-muted mb-1">{item.category}</span>
              {item.question}
            </span>
            <span className="fi-ic">+</span>
          </button>
          <div className="fi-a">
            <div className="fi-a-in">{item.answer}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
