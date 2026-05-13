"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export function CTASection() {
  const t = useTranslations("cta");

  return (
    <section className="sec">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="cta-wrap">
          <div className="cta-bd-tag">{t("bdTag")}</div>
          <h2>{t("title")}</h2>
          <p>{t("subtitle")}</p>
          <Link href="/pricing" className="btn btn-white">{t("button")}</Link>
          <div className="cta-note">{t("note")}</div>
        </div>
      </div>
    </section>
  );
}
