"use client";

import { motion } from "framer-motion";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { PricingGrid } from "@/components/sections/PricingGrid";
import { useT } from "@/lib/useT";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Pricing() {
  const t = useT();

  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">{t.pricingPage.eyebrow}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(30px,4vw,52px)", letterSpacing: "-2px" }}
          >
            {t.pricingPage.title}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "500px", margin: "0 auto" }}
          >
            {t.pricingPage.subtitle}
          </motion.p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1160px] mx-auto px-7">
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5, ease }}
          >
            <PricingGrid />
          </motion.div>

          <motion.section
            style={{ padding: "64px 0 0" }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5, ease }}
          >
            <div className="sh center">
              <div className="eyebrow">{t.pricingPage.faqEyebrow}</div>
              <div className="sec-title">{t.pricingPage.faqTitle}</div>
            </div>
            <FAQAccordion />
          </motion.section>
        </div>
      </section>
    </>
  );
}
