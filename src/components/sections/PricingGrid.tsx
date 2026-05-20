"use client";

import { useState } from "react";
import { platformPricing } from "@/data/pricing";
import { cn } from "@/lib/utils";

export function PricingGrid() {
  const [currency, setCurrency] = useState<"USD" | "BDT">("USD");
  const [platformKey, setPlatformKey] = useState(platformPricing[0].key);
  const activePlatform = platformPricing.find((platform) => platform.key === platformKey) ?? platformPricing[0];

  return (
    <>
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {platformPricing.map((platform) => (
          <button
            key={platform.key}
            onClick={() => setPlatformKey(platform.key)}
            className={cn("btn", platform.key === platformKey ? "btn-primary" : "btn-outline")}
          >
            {platform.name}
          </button>
        ))}
      </div>

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

      <div className="max-w-[860px] mx-auto mb-8 text-center">
        <div className="eyebrow">{activePlatform.label}</div>
        <h2 className="font-dm-sans text-[clamp(24px,3vw,36px)] font-black tracking-[-1px] text-foreground mb-3">
          {activePlatform.positioning}
        </h2>
        <p className="text-text2 leading-[1.8]">{activePlatform.bestFor}</p>
      </div>

      <div className="price-grid">
        {activePlatform.plans.map((plan) => (
          <div key={plan.name} className={`pc${plan.popular ? " pop" : ""}`}>
            {plan.popular && <div className="pop-tag">Best Value</div>}
            <div className="p-plan">{plan.name}</div>
            <div className="p-price">
              {currency === "USD" ? plan.priceUSD : plan.priceBDT}
              <span>{plan.period}</span>
            </div>
            <div className="p-bdt">{currency === "USD" ? plan.priceBDT : plan.priceUSD}</div>
            <div className="p-desc">{plan.support}</div>
            <ul className="p-features">
              {activePlatform.features.map((feature) => (
                <li key={feature}>
                  <span className="p-ck">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={plan.checkoutUrl}
              className={`btn ${plan.popular ? "btn-primary" : "btn-outline"}`}
              style={{ width: "100%", justifyContent: "center", padding: "13px", cursor: "pointer" }}
            >
              {activePlatform.cta}
            </a>
            <a
              href={`https://wa.me/8801721328992?text=${encodeURIComponent(activePlatform.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-[11px] text-muted mt-2 hover:text-accent transition-colors"
            >
              Buy with bKash/Nagad via WhatsApp
            </a>
          </div>
        ))}
      </div>

      <div className="trust-strip">
        <div className="ts-it">Secure checkout</div>
        <div className="ts-it">bKash, Nagad, Rocket, Bank Transfer</div>
        <div className="ts-it">License portal included</div>
        <div className="ts-it">Platform upgrade path</div>
        <div className="ts-it">Devsroom support</div>
      </div>
    </>
  );
}
