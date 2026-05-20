"use client";

import { motion } from "framer-motion";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { PricingGrid } from "@/components/sections/PricingGrid";
import { use } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, productSchema } from "@/lib/seo";

const ease = [0.22, 1, 0.36, 1] as const;

export default function PricingClient({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  use(params);

  return (
    <>
      <JsonLd data={[productSchema(), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }])]} />
      <div className="page-hero-sm">
        <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">Platform Pricing</div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(30px,4vw,52px)", letterSpacing: "-2px" }}
          >
            Choose the ConversionFlow Edition for Your Commerce Stack
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "680px", margin: "0 auto" }}
          >
            Compare WooCommerce, Laravel, and Next.js/MERN editions with yearly, 2-year, and lifetime licensing for serious commerce operations.
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
              <div className="eyebrow">Pricing FAQ</div>
              <div className="sec-title">Licensing, upgrades, local payments, and implementation fit</div>
            </div>
            <FAQAccordion />
          </motion.section>
        </div>
      </section>
    </>
  );
}
