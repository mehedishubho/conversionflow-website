import { FAQAccordion } from "@/components/sections/FAQAccordion";
import type { Metadata } from "next";
import { pricingTiers } from "@/data/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple one-time pricing for WooBooster. No subscriptions, no monthly fees. Plans from $29 for single stores to $129 for agencies.",
  openGraph: {
    title: "Pricing — WooBooster",
    description: "Simple one-time pricing. No subscriptions. Plans from $29 to $129.",
    url: "/pricing",
  },
};

export default function Pricing() {
  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
          <div className="eyebrow">Pricing</div>
          <div
            className="sec-title"
            style={{ fontSize: "clamp(30px,4vw,52px)", letterSpacing: "-2px" }}
          >
            Simple, One-Time Pricing
          </div>
          <p className="sec-sub" style={{ maxWidth: "500px", margin: "0 auto" }}>
            No subscriptions. No monthly fees. Pay once, own it forever. Updates
            included. Priced in BDT for Bangladeshi sellers.
          </p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1160px] mx-auto px-7">
          <div className="price-grid">
            {pricingTiers.map((tier) => (
              <div key={tier.plan} className={`pc${tier.popular ? " pop" : ""}`}>
                {tier.popular && <div className="pop-tag">⭐ MOST POPULAR</div>}
                <div className="p-plan">{tier.plan}</div>
                <div className="p-price">
                  {tier.priceUSD}
                  <span>{tier.period}</span>
                </div>
                <div className="p-bdt">{tier.priceBDT}</div>
                <div className="p-desc">{tier.desc}</div>
                <ul className="p-features">
                  {tier.features.map((f) => (
                    <li key={f.text}>
                      <span className={f.included ? "p-ck" : "p-no"}>
                        {f.included ? "✓" : "✗"}
                      </span>
                      {f.text}
                    </li>
                  ))}
                </ul>
                <span
                  className={`btn ${tier.buttonStyle}`}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "13px",
                    cursor: "pointer",
                  }}
                >
                  {tier.buttonText}
                </span>
              </div>
            ))}
          </div>

          <div className="trust-strip">
            <div className="ts-it">🔒 Secure Checkout</div>
            <div className="ts-it">💳 bKash · Nagad · Card</div>
            <div className="ts-it">🔄 30-Day Full Refund</div>
            <div className="ts-it">⚡ Instant License Delivery</div>
            <div className="ts-it">📞 BD Local Support</div>
          </div>

          <section style={{ padding: "64px 0 0" }}>
            <div className="sh center">
              <div className="eyebrow">FAQ</div>
              <div className="sec-title">Frequently Asked Questions</div>
            </div>
            <FAQAccordion />
          </section>
        </div>
      </section>
    </>
  );
}
