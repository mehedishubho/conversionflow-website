"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { PricingGrid } from "@/components/sections/PricingGrid";
import { platforms, type PlatformKey } from "@/data/pricing";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export default function PricingClient() {
  const { t } = useLanguage();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>("wordpress");

  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">{t("nav.pricing")}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(30px,4vw,52px)", letterSpacing: "-2px" }}
          >
            {t("pricing.heroTitle")}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "580px", margin: "0 auto" }}
          >
            {t("pricing.heroSubtitle")}
          </motion.p>

          {/* Platform Selector Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24, ease }}
            className="flex flex-wrap gap-2 justify-center mt-8"
          >
            {platforms.map((platform) => (
              <button
                key={platform.key}
                onClick={() => setSelectedPlatform(platform.key)}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer",
                  selectedPlatform === platform.key
                    ? "bg-accent text-white shadow-lg shadow-accent/25"
                    : "bg-[--surface] border border-[--border] text-foreground hover:border-accent/50 hover:bg-accent/5"
                )}
              >
                <span className="text-base">{platform.icon}</span>
                <span>{t(`platforms.${platform.key}`)}</span>
                {platform.available ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-500 font-semibold">
                    {t("platforms.available")}
                  </span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold">
                    {t("platforms.comingSoon")}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPlatform}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease }}
            >
              <PricingGrid platform={selectedPlatform} />
            </motion.div>
          </AnimatePresence>

          <motion.section
            style={{ padding: "64px 0 0" }}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.5, ease }}
          >
            <div className="sh center">
              <div className="eyebrow">FAQ</div>
              <div className="sec-title">Frequently Asked Questions</div>
            </div>
            <FAQAccordion />
          </motion.section>
        </div>
      </section>
    </>
  );
}
