"use client";

import { motion } from "framer-motion";
import { changelogEntries } from "@/data/changelog";
import { useT } from "@/lib/useT";

const ease = [0.22, 1, 0.36, 1] as const;

export default function Changelog() {
  const t = useT();

  const tagLabels = {
    new: { label: t.changelogPage.tagNew, className: "ct-new" },
    imp: { label: t.changelogPage.tagImp, className: "ct-imp" },
    fix: { label: t.changelogPage.tagFix, className: "ct-fix" },
  };

  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">{t.changelogPage.eyebrow}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-2px" }}
          >
            {t.changelogPage.title}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "480px", margin: "0 auto" }}
          >
            {t.changelogPage.subtitle}
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
