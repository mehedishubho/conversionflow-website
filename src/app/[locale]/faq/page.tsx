import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqItems } from "@/data/faq";
import { Link } from "@/i18n/routing";
import { breadcrumbSchema, createPageMetadata } from "@/lib/seo";

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
  return createPageMetadata("faq", locale);
}

function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export default function FAQPage() {
  return (
    <>
      <JsonLd data={[faqSchema(), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }])]} />
      <div className="page-hero-sm">
        <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
          <div className="eyebrow">ConversionFlow FAQ</div>
          <h1 className="sec-title" style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}>
            ConversionFlow Frequently Asked Questions
          </h1>
          <p className="sec-sub" style={{ maxWidth: "680px", margin: "0 auto" }}>
            Answers about licensing, platform editions, Meta CAPI, courier automation, COD protection, partial payments, support, and implementation fit.
          </p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="max-w-3xl mx-auto">
            <FAQAccordion />
          </div>

          <div className="cta-wrap mt-16">
            <div className="cta-bd-tag">Still choosing the right edition?</div>
            <h2>Compare platform fit before you buy.</h2>
            <p>Review WooCommerce, Laravel, and Next.js/MERN positioning, pricing, and implementation style.</p>
            <Link href="/platform-comparison" className="btn btn-white">View Platform Editions</Link>
          </div>
        </div>
      </section>
    </>
  );
}
