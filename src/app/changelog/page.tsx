import type { Metadata } from "next";
import { changelogEntries } from "@/data/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description: "See what's new in WooBooster — version history with new features, improvements, and bug fixes for the WooCommerce automation plugin.",
  openGraph: {
    title: "Changelog — WooBooster",
    description: "Version history with new features, improvements, and bug fixes.",
    url: "/changelog",
  },
};

const tagLabels = {
  new: { label: "🆕 New", className: "ct-new" },
  imp: { label: "⬆ Improved", className: "ct-imp" },
  fix: { label: "🐛 Fixed", className: "ct-fix" },
};

export default function Changelog() {
  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
          <div className="eyebrow">Changelog</div>
          <div
            className="sec-title"
            style={{ fontSize: "clamp(30px,4vw,50px)", letterSpacing: "-2px" }}
          >
            What&apos;s New in WooBooster
          </div>
          <p className="sec-sub" style={{ maxWidth: "480px", margin: "0 auto" }}>
            Every update documented transparently. Regular releases with new
            features, improvements, and bug fixes.
          </p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1160px] mx-auto px-7">
          <div className="clog-list" style={{ maxWidth: "800px", margin: "0 auto" }}>
            {changelogEntries.map((entry) => (
              <div key={entry.version} className="clog-item">
                <div
                  className="clog-v"
                  style={
                    !entry.isLatest
                      ? {
                          background: "var(--surface2)",
                          color: "var(--text2)",
                          border: "1px solid var(--border)",
                        }
                      : undefined
                  }
                >
                  {entry.version}
                </div>
                <div className="clog-date">{entry.date}</div>
                <div className="clog-name">{entry.name}</div>
                <div className="clog-changes">
                  {entry.changes.map((change, i) => {
                    const tag = tagLabels[change.type];
                    return (
                      <div key={i} className="clog-entry">
                        <span className={`clog-tag ${tag.className}`}>
                          {tag.label}
                        </span>
                        <span>{change.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
