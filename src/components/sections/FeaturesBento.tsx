"use client";

import { useTranslations } from "next-intl";
import { featureModules } from "@/data/features";
import { StaggerReveal, StaggerItem } from "@/components/layout/StaggerReveal";

export function FeaturesBento() {
  const t = useTranslations("featuresBento");
  const tf = useTranslations("featuresPage");

  return (
    <section className="sec">
      <div className="max-w-[1280px] mx-auto px-7">
        <div className="sh center">
          <div className="eyebrow">{t("eyebrow")}</div>
          <div className="sec-title">{t("title")}</div>
          <p className="sec-sub">{t("subtitle")}</p>
        </div>
        <StaggerReveal className="bento">
          {featureModules.map((module, index) => (
            <StaggerItem key={index} className={`bc${index === 0 ? " w2" : ""}`}>
              <div className="bc-icon">{module.icon}</div>
              <div className="bc-title">{tf(`modules.${index}.title`)}</div>
              <div className="bc-desc">{tf(`modules.${index}.description`)}</div>
              <div className="tags">
                {tf.raw(`modules.${index}.tags`)?.map((tag: string) => (
                  <span key={tag} className="tag">{tag}</span>
                )) || module.tags.map((tag) => (
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
