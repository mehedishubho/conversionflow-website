"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { docsNav } from "@/data/docs-nav";
import { useT } from "@/lib/useT";
import { StaggerReveal, StaggerItem } from "@/components/layout/StaggerReveal";

const ease = [0.22, 1, 0.36, 1] as const;

const categoryKeyMap: Record<string, keyof ReturnType<typeof useT>["docsNav"]> = {
  "Getting Started": "gettingStarted",
  "Modules": "modules",
};

export default function DocsPage() {
  const t = useT();

  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">{t.docsPage.eyebrow}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}
          >
            {t.docsPage.title}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "540px", margin: "0 auto" }}
          >
            {t.docsPage.subtitle}
          </motion.p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1160px] mx-auto px-7">
          {docsNav.map((group, gi) => {
            const key = categoryKeyMap[group.category];
            const label = key ? t.docsNav[key] : group.category;
            return (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: gi * 0.1, ease }}
              >
                <h2 className="font-syne text-[11px] font-extrabold uppercase tracking-[1.3px] text-muted mb-4">
                  {label}
                </h2>
                <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {group.items.map((item) => (
                    <StaggerItem key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        className="bg-surface border border-[--border] rounded-[14px] p-6 transition-all duration-[250ms] hover:border-accent hover:-translate-y-[3px] hover:shadow-[var(--shadow-lg)] block"
                      >
                        <h3 className="font-syne text-base font-extrabold text-foreground mb-2">{item.title}</h3>
                        <div className="text-sm font-semibold text-accent">{t.docsPage.readGuide}</div>
                      </Link>
                    </StaggerItem>
                  ))}
                </StaggerReveal>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
