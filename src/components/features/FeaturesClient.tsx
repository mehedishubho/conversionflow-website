"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { featureCategories } from "@/data/features";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, productSchema } from "@/lib/seo";

const ease = [0.22, 1, 0.36, 1] as const;

export default function FeaturesClient({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  use(params);

  return (
    <>
      <JsonLd data={[productSchema(), breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Features", path: "/features" }])]} />
      <div className="page-hero-sm">
        <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">Feature Hub</div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title"
            style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}
          >
            Commerce Operations Features Built for High-Volume Stores
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub"
            style={{ maxWidth: "680px", margin: "0 auto" }}
          >
            One operational layer for Meta CAPI, browser tracking, courier automation, COD protection, partial payments,
            checkout recovery, analytics, admin productivity, and developer infrastructure.
          </motion.p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
            {featureCategories.map((category, index) => (
              <motion.a
                key={category.slug}
                href={`#${category.slug}`}
                className="bg-surface border border-[--border] rounded-[14px] p-5 transition-all hover:border-accent hover:-translate-y-[3px] hover:shadow-[var(--shadow-lg)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.45, delay: index * 0.04, ease }}
              >
                <div className="eyebrow">{category.eyebrow}</div>
                <h2 className="font-dm-sans text-xl font-black text-foreground tracking-[-0.5px] mb-2">{category.title}</h2>
                <p className="text-sm text-text2 leading-[1.7]">{category.intent}</p>
              </motion.a>
            ))}
          </div>

          <div className="feat-rows">
            {featureCategories.map((category, index) => (
              <motion.section
                id={category.slug}
                key={category.slug}
                className={`feat-row${index % 2 === 1 ? " rev" : ""}`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, ease }}
              >
                <div className="fc">
                  <div className="eyebrow">{category.eyebrow}</div>
                  <h2 className="sec-title">{category.title}</h2>
                  <p className="text-[15px] text-text2 leading-[1.8]">{category.summary}</p>
                  <ul className="checks">
                    {category.items.map((item) => (
                      <li key={item.title}><div className="ck">✓</div>{item.title}</li>
                    ))}
                  </ul>
                </div>

                <div className="fv">
                  <div className="tp">
                    <div className="tp-head">{category.intent}</div>
                    {category.items.map((item) => (
                      <div key={item.title} className="tp-row" style={{ alignItems: "flex-start", gap: "16px" }}>
                        <div>
                          <h3 className="tp-name mb-1">{item.title}</h3>
                          <p className="text-[12px] text-text2 leading-[1.7]">{item.description}</p>
                          <div className="tags mt-3">
                            {item.keywords.map((keyword) => (
                              <span key={keyword} className="tag">{keyword}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            ))}
          </div>

          <div className="cta-wrap mt-16">
            <div className="cta-bd-tag">Built for paid traffic, COD operations, and developer-led commerce</div>
            <h2>Compare the edition that fits your stack</h2>
            <p>Use WooCommerce for merchant-ready setup, Laravel for custom commerce, or Next.js/MERN for headless event infrastructure.</p>
            <Link href="/pricing" className="btn btn-white">Compare Platform Pricing</Link>
          </div>
        </div>
      </section>
    </>
  );
}
