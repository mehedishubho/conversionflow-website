"use client";

import { useTranslations } from "next-intl";
import { testimonials } from "@/data/testimonials";
import { StaggerReveal, StaggerItem } from "@/components/layout/StaggerReveal";

export function Testimonials() {
  const t = useTranslations("testimonials");

  return (
    <section className="sec sec-bg">
      <div className="max-w-[1280px] mx-auto px-7">
        <div className="sh center">
          <div className="eyebrow">{t("eyebrow")}</div>
          <div className="sec-title">{t("title")}</div>
        </div>
        <StaggerReveal className="tgrid">
          {testimonials.map((item, index) => (
            <StaggerItem key={index} className="tcard">
              <div className="stars">{item.stars}</div>
              <div className="tquote">&quot;{t(`items.${index}.quote`)}&quot;</div>
              <div className="tauthor">
                <div className={`tav ${item.avatarColor}`}>{item.initials}</div>
                <div>
                  <div className="tname">{t(`items.${index}.name`)}</div>
                  <div className="tstore">{t(`items.${index}.store`)}</div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
