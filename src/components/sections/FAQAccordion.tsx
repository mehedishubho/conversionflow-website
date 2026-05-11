"use client";

import { useState } from "react";
import { faqItems } from "@/data/faq";

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq-list">
      {faqItems.map((item, index) => (
        <div key={index} className={`fi${index === openIndex ? " open" : ""}`}>
          <div
            className="fi-q"
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
          >
            {item.question}
            <span className="fi-ic">+</span>
          </div>
          <div className="fi-a">
            <div className="fi-a-in">{item.answer}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
