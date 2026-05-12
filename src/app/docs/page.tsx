import type { Metadata } from "next";
import Link from "next/link";
import { docsNav } from "@/data/docs-nav";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Everything you need to set up, configure, and master WooBooster.",
};

export default function DocsPage() {
  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
          <div className="eyebrow">Documentation</div>
          <div
            className="sec-title"
            style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}
          >
            WooBooster Docs
          </div>
          <p className="sec-sub" style={{ maxWidth: "540px", margin: "0 auto" }}>
            Everything you need to set up, configure, and master WooBooster.
          </p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1160px] mx-auto px-7">
          {docsNav.map((group) => (
            <div key={group.category}>
              <h2 className="font-syne text-[11px] font-extrabold uppercase tracking-[1.3px] text-muted mb-4">
                {group.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {group.items.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/docs/${item.slug}`}
                    className="bg-surface border border-[--border] rounded-[14px] p-6 transition-all duration-[250ms] hover:border-accent hover:-translate-y-[3px] hover:shadow-[var(--shadow-lg)]"
                  >
                    <h3 className="font-syne text-base font-extrabold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <div className="text-sm font-semibold text-accent">Read guide</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
