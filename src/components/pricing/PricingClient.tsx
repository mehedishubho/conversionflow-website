"use client";

import { motion } from "framer-motion";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { PricingGrid } from "@/components/sections/PricingGrid";
import { useTranslations } from "next-intl";
import { use } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function PricingClient({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  use(params);
  const t = useTranslations("pricingPage");

  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">{t("eyebrow")}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(30px,4vw,52px)", letterSpacing: "-2px" }}
          >
            {t("title")}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "500px", margin: "0 auto" }}
          >
            {t("subtitle")}
          </motion.p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
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
              <div className="eyebrow">{t("faqEyebrow")}</div>
              <div className="sec-title">{t("faqTitle")}</div>
            </div>
            <FAQAccordion />
          </motion.section>
        </div>
      </section>
    </>
  );
}
