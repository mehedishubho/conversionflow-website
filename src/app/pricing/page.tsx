import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { PricingGrid } from "@/components/sections/PricingGrid";
import type { Metadata } from "next";

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
          <PricingGrid />

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
