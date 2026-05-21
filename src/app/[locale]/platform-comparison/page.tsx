import { JsonLd } from "@/components/seo/JsonLd";
import { pricingTiers } from "@/data/pricing";
import { Link } from "@/i18n/routing";
import { breadcrumbSchema, createPageMetadata, productSchema } from "@/lib/seo";

export async function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "bn" },
  ];
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createPageMetadata("platformComparison", locale);
}

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
            Compare ConversionFlow Editions by Commerce Stack
          </h1>
          <p className="sec-sub" style={{ maxWidth: "720px", margin: "0 auto" }}>
            Choose WooCommerce for merchant-ready operations, Laravel for custom commerce systems, or Next.js/MERN for headless tracking and analytics infrastructure.
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
            <p className="sec-sub">The same operational strategy, packaged for different implementation realities.</p>
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
              <h2 className="sec-title" style={{ fontSize: "clamp(24px,3vw,36px)" }}>Pick by who will operate the system.</h2>
              <ul className="checks">
                <li><div className="ck">✓</div>Merchants and marketers should start with WooCommerce Edition.</li>
                <li><div className="ck">✓</div>Agencies and custom commerce teams should choose Laravel Edition.</li>
                <li><div className="ck">✓</div>Headless teams needing event infrastructure should choose Next.js/MERN Edition.</li>
              </ul>
            </section>
            <section>
              <div className="eyebrow">Upgrade Path</div>
              <h2 className="sec-title" style={{ fontSize: "clamp(24px,3vw,36px)" }}>Start simple, mature the stack later.</h2>
              <p className="text-text2 leading-[1.8]">
                Many Bangladesh COD businesses begin with WooCommerce and later move into custom Laravel or headless systems.
                ConversionFlow keeps the commercial focus consistent: reliable tracking, courier intelligence, fraud reduction, and operational visibility.
              </p>
            </section>
          </div>

          <div className="cta-wrap mt-16">
            <div className="cta-bd-tag">Ready to choose an edition?</div>
            <h2>Compare pricing across all platform licenses.</h2>
            <p>Review yearly, 2-year, and lifetime options for each ConversionFlow edition.</p>
            <Link href="/pricing" className="btn btn-white">Compare Platform Pricing</Link>
          </div>
        </div>
      </section>
    </>
  );
}
