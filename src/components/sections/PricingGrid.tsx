"use client";

import { useState } from "react";
import { pricingTiers } from "@/data/pricing";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/useT";

export function PricingGrid() {
  const [currency, setCurrency] = useState<"USD" | "BDT">("USD");
  const t = useT();

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
        {pricingTiers.map((tier) => (
          <div key={tier.plan} className={`pc${tier.popular ? " pop" : ""}`}>
            {tier.popular && <div className="pop-tag">{t.pricingPage.mostPopular}</div>}
            <div className="p-plan">{tier.plan}</div>
            <div className="p-price">
              {currency === "USD" ? tier.priceUSD : tier.priceBDT}
              <span>{tier.period}</span>
            </div>
            <div className="p-bdt">{currency === "USD" ? tier.priceBDT : tier.priceUSD}</div>
            <div className="p-desc">{tier.desc}</div>
            <ul className="p-features">
              {tier.features.map((f) => (
                <li key={f.text}>
                  <span className={f.included ? "p-ck" : "p-no"}>{f.included ? "✓" : "✗"}</span>
                  {f.text}
                </li>
              ))}
            </ul>
            <a
              href={tier.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn ${tier.buttonStyle}`}
              style={{ width: "100%", justifyContent: "center", padding: "13px", cursor: "pointer" }}
            >
              {tier.buttonText}
            </a>
            <a
              href={`https://wa.me/8801721328992?text=${encodeURIComponent(tier.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-[11px] text-muted mt-2 hover:text-accent transition-colors"
            >
              {t.pricingPage.whatsappPay}
            </a>
          </div>
        ))}
      </div>

      <div className="trust-strip">
        <div className="ts-it">{t.pricingPage.trustSecure}</div>
        <div className="ts-it">{t.pricingPage.trustPayment}</div>
        <div className="ts-it">{t.pricingPage.trustRefund}</div>
        <div className="ts-it">{t.pricingPage.trustDelivery}</div>
        <div className="ts-it">{t.pricingPage.trustSupport}</div>
      </div>
    </>
  );
}
