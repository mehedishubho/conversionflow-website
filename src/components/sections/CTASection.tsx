"use client";

import Link from "next/link";
import { useT } from "@/lib/useT";

export function CTASection() {
  const t = useT();

  return (
    <section className="sec">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="cta-wrap">
          <div className="cta-bd-tag">{t.cta.bdTag}</div>
          <h2>{t.cta.title}</h2>
          <p>{t.cta.subtitle}</p>
          <Link href="/pricing" className="btn btn-white">{t.cta.button}</Link>
          <div className="cta-note">{t.cta.note}</div>
        </div>
      </div>
    </section>
  );
}
