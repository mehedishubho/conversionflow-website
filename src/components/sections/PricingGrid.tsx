"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { pricingTiers, platforms, type PlatformKey } from "@/data/pricing";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function ComingSoonCard({ platform }: { platform: PlatformKey }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const platformName = t(`platforms.${platform}`);
  const platformInfo = platforms.find((p) => p.key === platform);

  return (
    <div className="max-w-lg mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative p-10 rounded-2xl border border-[--border] bg-[--surface] overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-linear-to-br from-accent/5 via-transparent to-accent/5 pointer-events-none" />

        <div className="relative z-10">
          <div className="text-5xl mb-4">{platformInfo?.icon}</div>
          <div className="text-xs px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 font-semibold inline-block mb-4">
            {t("pricing.comingSoonBadge")}
          </div>
          <h3 className="sec-title text-2xl mb-3">
            {t("pricing.comingSoonTitle").replace("{platform}", platformName)}
          </h3>
          <p className="text-muted text-sm leading-relaxed mb-8">
            {t("pricing.comingSoonDesc").replace("{platform}", platformName)}
          </p>

          {!submitted ? (
            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@store.com"
                className="flex-1 px-4 py-3 rounded-xl bg-background border border-[--border] text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={() => { if (email) setSubmitted(true); }}
                className="btn btn-primary px-5 py-3 text-sm whitespace-nowrap"
              >
                {t("pricing.notifyButton")}
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-400 text-sm font-medium bg-green-500/10 rounded-xl px-4 py-3"
            >
              ✅ {t("pricing.notifySuccess").replace("{platform}", platformName)}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Feature preview — what's coming */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        {["Meta CAPI", "Courier Sync", "Fraud Shield", "Analytics", "Lead Recovery", "Smart Dashboard"].map((feat) => (
          <div key={feat} className="px-3 py-2 rounded-lg bg-[--surface] border border-[--border] text-xs text-muted">
            ✨ {feat}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function PricingGrid({ platform }: { platform: PlatformKey }) {
  const { t } = useLanguage();
  const [currency, setCurrency] = useState<"USD" | "BDT">("USD");

  const getTier = (index: number) => {
    const keys = ["starter", "professional", "agency"] as const;
    return keys[index];
  };

  const isAvailable = platforms.find((p) => p.key === platform)?.available ?? false;

  // Coming Soon state for Laravel, Shopify, Next.js
  if (!isAvailable) {
    return <ComingSoonCard platform={platform} />;
  }

  // Available pricing for WordPress
  return (
    <>
      <div className="flex gap-2 justify-center mb-8">
        <button
          onClick={() => setCurrency("USD")}
          className={cn("btn", currency === "USD" ? "btn-primary" : "btn-outline")}
        >
          USD ($)
        </button>
        <button
          onClick={() => setCurrency("BDT")}
          className={cn("btn", currency === "BDT" ? "btn-primary" : "btn-outline")}
        >
          BDT (৳)
        </button>
      </div>

      <div className="price-grid">
        {pricingTiers.map((tier, i) => {
          const tierKey = getTier(i);
          return (
            <div key={tier.plan} className={`pc${tier.popular ? " pop" : ""}`}>
              {tier.popular && <div className="pop-tag">{t("pricing.mostPopular")}</div>}
              <div className="p-plan">{t(`pricing.${tierKey}.plan`)}</div>
              <div className="p-price">
                {currency === "USD" ? tier.priceUSD : tier.priceBDT}
                <span>{t(`pricing.${tierKey}.period`)}</span>
              </div>
              <div className="p-bdt">{currency === "USD" ? tier.priceBDT : tier.priceUSD}</div>
              <div className="p-desc">{t(`pricing.${tierKey}.desc`)}</div>
              <ul className="p-features">
                {tier.features.map((f, j) => {
                  const localizedText = t(`pricing.${tierKey}.feature${j}`);
                  return (
                    <li key={j}>
                      <span className={f.included ? "p-ck" : "p-no"}>{f.included ? "✓" : "✗"}</span>
                      {localizedText}
                    </li>
                  );
                })}
              </ul>
              <a
                href={tier.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn ${tier.buttonStyle}`}
                style={{ width: "100%", justifyContent: "center", padding: "13px", cursor: "pointer" }}
              >
                {t(`pricing.${tierKey}.buttonText`)}
              </a>
              <a
                href={`https://wa.me/8801721328992?text=${encodeURIComponent(tier.whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[11px] text-muted mt-2 hover:text-accent transition-colors"
              >
                {t("pricing.whatsappPay")}
              </a>
            </div>
          );
        })}
      </div>

      <div className="trust-strip">
        <div className="ts-it">{t("pricing.trustSecure")}</div>
        <div className="ts-it">{t("pricing.trustPayment")}</div>
        <div className="ts-it">{t("pricing.trustRefund")}</div>
        <div className="ts-it">{t("pricing.trustDelivery")}</div>
        <div className="ts-it">{t("pricing.trustSupport")}</div>
      </div>
    </>
  );
}
