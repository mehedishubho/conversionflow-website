import { JsonLd } from "@/components/seo/JsonLd";
import { pricingTiers } from "@/data/pricing";
import Link from "next/link";
import { breadcrumbSchema, createPageMetadata, productSchema } from "@/lib/seo";

export const metadata = createPageMetadata("platformComparison", "bn");

const matrix = [
  ["Primary buyer", "Store owner / marketer", "Developer / agency", "Headless commerce team"],
  ["Setup model", "WordPress-native", "Laravel integration", "React/Node event architecture"],
  ["Best use case", "Fast COD and courier operations", "Custom commerce workflows", "Scalable server-side tracking"],
  ["Tracking focus", "Meta CAPI + pixels", "API-ready event flows", "Server-side event infrastructure"],
  ["Operations focus", "Courier, COD, recovery", "Custom courier/payment logic", "Analytics/event data layer"],
];

export default function PlatformComparisonPage() {
  return (
    <>
      <JsonLd data={[productSchema(), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Platform Comparison", path: "/platform-comparison" }])]} />
      <div className="page-hero-sm">
        <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
          <div className="eyebrow">Platform Comparison</div>
          <h1 className="sec-title" style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}>
            কমার্স স্ট্যাক অনুযায়ী ConversionFlow এডিশন তুলনা করুন
          </h1>
          <p className="sec-sub" style={{ maxWidth: "720px", margin: "0 auto" }}>
            মার্চেন্ট-রেডি অপারেশনের জন্য WooCommerce, কাস্টম কমার্সের জন্য Laravel অথবা হেডলেস ট্র্যাকিংয়ের জন্য Next.js/MERN বেছে নিন।
          </p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-16">
            {pricingTiers.map((tier) => (
              <div key={tier.plan} className="pc">
                <div className="p-plan">{tier.plan}</div>
                <div className="p-desc">{tier.priceBDT}{tier.period}</div>
                <p className="text-sm text-text2 leading-[1.8] mb-5">{tier.desc}</p>
                <ul className="p-features">
                  {tier.features.map((feature) => (
                    <li key={feature.text}>
                      <span className="p-ck">{feature.included ? "✓" : "✗"}</span>
                      {feature.text}
                    </li>
                  ))}
                </ul>
                <Link href={tier.checkoutUrl} className="btn btn-outline w-full justify-center">
                  {tier.buttonText}
                </Link>
              </div>
            ))}
          </div>

          <div className="sh center">
            <div className="eyebrow">Feature Matrix</div>
            <h2 className="sec-title">WooCommerce vs Laravel vs Next.js/MERN eCommerce tracking</h2>
            <p className="sec-sub">একই অপারেশনাল স্ট্র্যাটেজি, ভিন্ন ইমপ্লিমেন্টেশনের জন্য প্যাকেজ করা।</p>
          </div>
          <div className="overflow-x-auto bg-surface border border-[--border] rounded-[14px]">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="border-b border-[--border]">
                  <th className="p-4 text-xs uppercase tracking-[1.2px] text-muted">Criteria</th>
                  <th className="p-4 text-xs uppercase tracking-[1.2px] text-muted">WooCommerce</th>
                  <th className="p-4 text-xs uppercase tracking-[1.2px] text-muted">Laravel</th>
                  <th className="p-4 text-xs uppercase tracking-[1.2px] text-muted">Next.js / MERN</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row[0]} className="border-b border-[--border] last:border-b-0">
                    {row.map((cell, index) => (
                      <td key={cell} className={`p-4 text-sm leading-[1.7] ${index === 0 ? "font-bold text-foreground" : "text-text2"}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
            <section>
              <div className="eyebrow">Best Fit by Team</div>
              <h2 className="sec-title" style={{ fontSize: "clamp(24px,3vw,36px)" }}>টিম অনুযায়ী বেছে নিন।</h2>
              <ul className="checks">
                <li><div className="ck">✓</div>মার্চেন্ট এবং মার্কেটাররা WooCommerce Edition দিয়ে শুরু করুন।</li>
                <li><div className="ck">✓</div>এজেন্সি এবং কাস্টম কমার্স টিমগুলো Laravel Edition বেছে নিন।</li>
                <li><div className="ck">✓</div>ইভেন্ট ইনফ্রাস্ট্রাকচার প্রয়োজন এমন হেডলেস টিমগুলো Next.js/MERN Edition বেছে নিন।</li>
              </ul>
            </section>
            <section>
              <div className="eyebrow">Upgrade Path</div>
              <h2 className="sec-title" style={{ fontSize: "clamp(24px,3vw,36px)" }}>সহজে শুরু করুন, পরে স্ট্যাক উন্নত করুন।</h2>
              <p className="text-text2 leading-[1.8]">
                অনেক বাংলাদেশি COD ব্যবসা WooCommerce দিয়ে শুরু করে পরে কাস্টম Laravel বা হেডলেস সিস্টেমে চলে যায়।
                ConversionFlow কমার্শিয়াল ফোকাস ধারাবাহিক রাখে: নির্ভরযোগ্য ট্র্যাকিং, কুরিয়ার ইন্টেলিজেন্স, ফ্রড হ্রাস এবং অপারেশনাল ভিজিবিলিটি।
              </p>
            </section>
          </div>

          <div className="cta-wrap mt-16">
            <div className="cta-bd-tag">এডিশন বেছে নিতে প্রস্তুত?</div>
            <h2>সব প্ল্যাটফর্ম লাইসেন্সের মূল্য তুলনা করুন।</h2>
            <p>প্রতিটি ConversionFlow এডিশনের বার্ষিক, ২-বছর এবং এককালীন অপশন পর্যালোচনা করুন।</p>
            <Link href="/pricing" className="btn btn-white">প্ল্যাটফর্ম মূল্য তুলনা করুন</Link>
          </div>
        </div>
      </section>
    </>
  );
}
