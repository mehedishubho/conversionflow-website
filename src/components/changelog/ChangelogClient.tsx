"use client";

import { motion } from "framer-motion";
import { changelogEntries } from "@/data/changelog";
import { useTranslations } from "next-intl";
import { use } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export default function ChangelogClient({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  use(params);
  const t = useTranslations("changelogPage");

  const tagLabels: Record<string, { label: string; className: string }> = {
    new: { label: t("tagNew"), className: "ct-new" },
    imp: { label: t("tagImp"), className: "ct-imp" },
    fix: { label: t("tagFix"), className: "ct-fix" },
  };

  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">{t("eyebrow")}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-2px" }}
          >
            {t("title")}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "480px", margin: "0 auto" }}
          >
            {t("subtitle")}
          </motion.p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1160px] mx-auto px-7">
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
                <div className="clog-date">{t(`entries.${i}.date`)}</div>
                <div className="clog-name">{t(`entries.${i}.name`)}</div>
                <div className="clog-changes">
                  {entry.changes.map((change, j) => {
                    const tag = tagLabels[change.type];
                    const localizedChanges = t.raw(`entries.${i}.changes`);
                    const localizedText = Array.isArray(localizedChanges) ? localizedChanges[j] : change.text;
                    return (
                      <div key={j} className="clog-entry">
                        <span className={`clog-tag ${tag.className}`}>{tag.label}</span>
                        <span>{localizedText}</span>
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
