"use client";

import { motion } from "framer-motion";
import { changelogEntries } from "@/data/changelog";
import { use } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ChangelogClient({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  use(params);

  const tagLabels: Record<string, { label: string; className: string }> = {
    new: { label: "New", className: "ct-new" },
    imp: { label: "Improved", className: "ct-imp" },
    fix: { label: "Fixed", className: "ct-fix" },
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Changelog", path: "/changelog" }]),
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "ConversionFlow Product Changelog",
            itemListElement: changelogEntries.map((entry, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: `${entry.version}: ${entry.name}`,
            })),
          },
        ]}
      />
      <div className="page-hero-sm">
        <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">ConversionFlow Changelog</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-2px" }}
          >
            ConversionFlow Product Changelog
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "480px", margin: "0 auto" }}
          >
            Product updates across tracking, courier integrations, fraud protection, checkout recovery, analytics, and platform editions.
          </motion.p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="clog-list" style={{ maxWidth: "800px", margin: "0 auto" }}>
            {changelogEntries.map((entry, i) => (
              <motion.div
                key={entry.version}
                className="clog-item"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
              >
                <div
                  className="clog-v"
                  style={!entry.isLatest ? { background: "var(--surface2)", color: "var(--text2)", border: "1px solid var(--border)" } : undefined}
                >
                  {entry.version}
                </div>
                <div className="clog-date">{entry.date}</div>
                <div className="clog-name">{entry.name}</div>
                <div className="clog-changes">
                  {entry.changes.map((change, j) => {
                    const tag = tagLabels[change.type];
                    return (
                      <div key={j} className="clog-entry">
                        <span className={`clog-tag ${tag.className}`}>{tag.label}</span>
                        <span>{change.text}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
