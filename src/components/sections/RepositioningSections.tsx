import { Link } from "@/i18n/routing";
import { featureCategories } from "@/data/features";
import { platformPricing } from "@/data/pricing";

const painPoints = [
  "Fake COD orders burn courier cost before revenue is real",
  "Browser-only pixels miss purchase signals after iOS and ad blockers",
  "Courier teams waste hours checking Steadfast, Pathao, and RedX manually",
  "Checkout leads disappear before sales teams can follow up",
  "Scattered plugins create weak operational visibility",
];

const comparisons = [
  ["Scattered plugins", "Separate tracking, courier, fraud, payment, and reporting tools with inconsistent data."],
  ["Manual operations", "Courier dashboards, spreadsheets, missed follow-ups, and no reliable customer delivery history."],
  ["ConversionFlow", "One commerce layer for tracking reliability, courier intelligence, COD protection, recovery, and analytics."],
];

export function RepositioningSections() {
  return (
    <>
      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="sh center">
            <div className="eyebrow">The Operational Gap</div>
            <h2 className="sec-title">The problem is not only checkout. It is the full order signal chain.</h2>
            <p className="sec-sub">
              ConversionFlow is built for stores where ads, COD orders, courier outcomes, payment commitment, and customer delivery history all affect profit.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {painPoints.map((point) => (
              <div key={point} className="bg-surface border border-[--border] rounded-[14px] p-5">
                <div className="text-accent font-black mb-3">◆</div>
                <p className="text-sm text-text2 leading-[1.7]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-bg">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="sh center">
            <div className="eyebrow">Platform Editions</div>
            <h2 className="sec-title">One commerce operations ecosystem, three implementation paths.</h2>
            <p className="sec-sub">Start where your stack lives today and keep the same operational philosophy as your business matures.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {platformPricing.map((platform) => (
              <div key={platform.key} className="pc">
                <div className="p-plan">{platform.name}</div>
                <p className="p-desc">{platform.positioning}</p>
                <ul className="p-features">
                  {platform.features.slice(0, 5).map((feature) => (
                    <li key={feature}><span className="p-ck">✓</span>{feature}</li>
                  ))}
                </ul>
                <Link href="/platform-comparison" className="btn btn-outline w-full justify-center">View Platform Editions</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="sh center">
            <div className="eyebrow">Feature Hierarchy</div>
            <h2 className="sec-title">From ad signal to delivery outcome, every module supports conversion quality.</h2>
          </div>
          <div className="bento">
            {featureCategories.map((category, index) => (
              <div key={category.slug} className={`bc${index === 0 ? " w2" : ""}`}>
                <div className="bc-icon">◆</div>
                <h3 className="bc-title">{category.eyebrow}</h3>
                <p className="bc-desc">{category.summary}</p>
                <div className="tags">
                  {category.items.slice(0, 3).map((item) => <span key={item.title} className="tag">{item.title}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-bg">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <div className="eyebrow">Ads Infrastructure</div>
              <h2 className="sec-title">Give Meta and Google cleaner commerce events.</h2>
              <p className="sec-sub" style={{ margin: "0 0 22px" }}>
                ConversionFlow supports server-side purchase signals, browser event backup, GA4 visibility, GTM routing, and campaign diagnostics that match operational reality.
              </p>
              <ul className="checks">
                <li><div className="ck">✓</div>Meta CAPI + Pixel for purchase and checkout reliability</li>
                <li><div className="ck">✓</div>Google Ads, GA4, GTM, TikTok, Pinterest, and Bing UET coverage</li>
                <li><div className="ck">✓</div>Delivery and return outcomes for better ROAS interpretation</li>
              </ul>
            </div>
            <div>
              <div className="eyebrow">Bangladesh COD Operations</div>
              <h2 className="sec-title">Control risk before the courier cost is spent.</h2>
              <p className="sec-sub" style={{ margin: "0 0 22px" }}>
                Courier history, partial payments, booking money, fraud rules, and order activity logs help COD-heavy teams dispatch with better context.
              </p>
              <ul className="checks">
                <li><div className="ck">✓</div>Steadfast, Pathao, and RedX operational positioning</li>
                <li><div className="ck">✓</div>Advance payment and COD booking money workflows</li>
                <li><div className="ck">✓</div>Delivery success analytics and customer courier history</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="sh center">
            <div className="eyebrow">Operational Comparison</div>
            <h2 className="sec-title">Replace fragile workflows with one commerce intelligence layer.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisons.map(([title, body]) => (
              <div key={title} className="bg-surface border border-[--border] rounded-[14px] p-6">
                <h3 className="font-dm-sans text-xl font-black text-foreground mb-3">{title}</h3>
                <p className="text-sm text-text2 leading-[1.8]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
