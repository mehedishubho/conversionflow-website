"use client";

import { featureModules } from "@/data/features";
import { StaggerReveal, StaggerItem } from "@/components/layout/StaggerReveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function FeaturesBento() {
  const { t } = useLanguage();

  return (
    <section className="sec">
      <div className="max-w-[1280px] mx-auto px-7">
        <div className="sh center">
          <div className="eyebrow">{t("featuresBento.eyebrow")}</div>
          <div className="sec-title">{t("featuresBento.title")}</div>
          <p className="sec-sub">{t("featuresBento.subtitle")}</p>
        </div>
        <StaggerReveal className="bento">
          {featureModules.map((module, index) => (
            <StaggerItem key={index} className={`bc${index === 0 ? " w2" : ""}`}>
              <div className="bc-icon">{module.icon}</div>
              <div className="bc-title">{module.title}</div>
              <div className="bc-desc">{module.description}</div>
              <div className="tags">
                {module.tags.map((tag) => (
                  <span key={tag.label} className="tag">{tag.label}</span>
                ))}
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
