"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { docsNav } from "@/data/docs-nav";
import { useTranslations } from "next-intl";
import { StaggerReveal, StaggerItem } from "@/components/layout/StaggerReveal";
import { use } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

const categoryKeyMap: Record<string, string> = {
  "Getting Started": "gettingStarted",
  "Modules": "modules",
};

export default function DocsClient({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  use(params);
  const tDocs = useTranslations("docsPage");
  const tNav = useTranslations("docsNav");

  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">{tDocs("eyebrow")}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}
          >
            {tDocs("title")}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "540px", margin: "0 auto" }}
          >
            {tDocs("subtitle")}
          </motion.p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1160px] mx-auto px-7">
          {docsNav.map((group, gi) => {
            const key = categoryKeyMap[group.category];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const label = key ? tNav(key as any) : group.category;
            return (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: gi * 0.1, ease }}
              >
                <h2 className="font-dm-sans text-[11px] font-extrabold uppercase tracking-[1.3px] text-muted mb-4">
                  {label}
                </h2>
                <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {group.items.map((item) => (
                    <StaggerItem key={item.slug}>
                      <Link
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        href={`/docs/${item.slug}` as any}
                        className="bg-surface border border-[--border] rounded-[14px] p-6 transition-all duration-[250ms] hover:border-accent hover:-translate-y-[3px] hover:shadow-[var(--shadow-lg)] block"
                      >
                        <h3 className="font-dm-sans text-base font-extrabold text-foreground mb-2">
                          {tNav(`items.${item.slug}`)}
                        </h3>
                        <div className="text-sm font-semibold text-accent">{tDocs("readGuide")}</div>
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
