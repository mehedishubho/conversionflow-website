"use client";

import { useState } from "react";
import { pricingTiers } from "@/data/pricing";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function PricingGrid() {
  const { t } = useLanguage();
  const [currency, setCurrency] = useState<"USD" | "BDT">("USD");

  const getTier = (index: number) => {
    const keys = ["starter", "professional", "agency"] as const;
    return keys[index];
  };

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
