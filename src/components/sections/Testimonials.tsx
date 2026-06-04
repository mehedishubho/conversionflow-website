"use client";

import { testimonials } from "@/data/testimonials";
import { StaggerReveal, StaggerItem } from "@/components/layout/StaggerReveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function Testimonials() {
  const { t } = useLanguage();

  return (
    <section className="sec sec-bg">
      <div className="max-w-[1280px] mx-auto px-7">
        <div className="sh center">
          <div className="eyebrow">{t("testimonials.eyebrow")}</div>
          <div className="sec-title">{t("testimonials.title")}</div>
        </div>
        <StaggerReveal className="tgrid">
          {testimonials.map((item, index) => (
            <StaggerItem key={index} className="tcard">
              <div className="stars">{item.stars}</div>
              <div className="tquote">{t(`testimonials.quote${index}`)}</div>
              <div className="tauthor">
                <div className={`tav ${item.avatarColor}`}>{item.initials}</div>
                <div>
                  <div className="tname">{t(`testimonials.name${index}`)}</div>
                  <div className="tstore">{t(`testimonials.store${index}`)}</div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
