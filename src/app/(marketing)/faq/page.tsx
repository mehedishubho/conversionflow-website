import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqItems } from "@/data/faq";
import Link from "next/link";
import { breadcrumbSchema, createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata("faq", "bn");

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
            ConversionFlow সচরাচর জিজ্ঞাসা
          </h1>
          <p className="sec-sub" style={{ maxWidth: "680px", margin: "0 auto" }}>
            লাইসেন্সিং, প্ল্যাটফর্ম এডিশন, Meta CAPI, কুরিয়ার অটোমেশন, COD প্রোটেকশন, পার্শিয়াল পেমেন্ট, সাপোর্ট এবং ইমপ্লিমেন্টেশন সম্পর্কে উত্তর।
          </p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="max-w-3xl mx-auto">
            <FAQAccordion />
          </div>

          <div className="cta-wrap mt-16">
            <div className="cta-bd-tag">এখনো সঠিক এডিশন বেছে নিচ্ছেন?</div>
            <h2>কেনার আগে প্ল্যাটফর্ম ফিট তুলনা করুন।</h2>
            <p>WooCommerce, Laravel এবং Next.js/MERN পজিশনিং, মূল্য এবং ইমপ্লিমেন্টেশন স্টাইল পর্যালোচনা করুন।</p>
            <Link href="/platform-comparison" className="btn btn-white">প্ল্যাটফর্ম এডিশন দেখুন</Link>
          </div>
        </div>
      </section>
    </>
  );
}
