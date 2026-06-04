"use client";

const docLabels: Record<string, string> = {"getting-started":"শুরু করুন","courier-sync":"কুরিয়ার সিঙ্ক","meta-capi":"মেটা CAPI","fraud-shield":"ফ্রড শিল্ড","analytics":"অ্যানালিটিক্স"};
const catLabels: Record<string, string> = {
  "gettingStarted": "শুরু করুন",
  "modules": "মডিউলসমূহ",
};


import { motion } from "framer-motion";
import Link from "next/link";
import { docsNav } from "@/data/docs-nav";

import { StaggerReveal, StaggerItem } from "@/components/layout/StaggerReveal";

const ease = [0.22, 1, 0.36, 1] as const;

const categoryKeyMap: Record<string, string> = {
  "Getting Started": "gettingStarted",
  "Modules": "modules",
};

export default function DocsClient() {



  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">ডকুমেন্টেশন</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}
          >
            ConversionFlow ডকস
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "540px", margin: "0 auto" }}
          >
            ConversionFlow সেটআপ, কনফিগার এবং মাস্টার করতে যা দরকার সব।
          </motion.p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          {docsNav.map((group, gi) => {
            const key = categoryKeyMap[group.category];
            return (
              <motion.div
                key={group.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: gi * 0.1, ease }}
              >
                <h2 className="font-dm-sans text-[11px] font-extrabold uppercase tracking-[1.3px] text-muted mb-4">
                  {catLabels[key] || group.category}
                </h2>
                <StaggerReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {group.items.map((item) => (
                    <StaggerItem key={item.slug}>
                      <Link
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        href={`/docs/${item.slug}`}
                        className="bg-surface border border-[--border] rounded-[14px] p-6 transition-all duration-[250ms] hover:border-accent hover:-translate-y-[3px] hover:shadow-[var(--shadow-lg)] block"
                      >
                        <h3 className="font-dm-sans text-base font-extrabold text-foreground mb-2">
                          {docLabels[item.slug] || item.title}
                        </h3>
                        <div className="text-sm font-semibold text-accent">গাইড পড়ুন</div>
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
