"use client";

import { useTranslations } from "next-intl";
import { StaggerReveal, StaggerItem } from "@/components/layout/StaggerReveal";

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <section className="sec">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="sh center">
          <div className="eyebrow">{t("eyebrow")}</div>
          <div className="sec-title">{t("title")}</div>
          <p className="sec-sub">{t("subtitle")}</p>
        </div>
        <StaggerReveal className="steps-grid">
          <StaggerItem className="step-card">
            <div className="step-n">01</div>
            <div className="step-t">{t("step1Title")}</div>
            <div className="step-d">{t("step1Desc")}</div>
          </StaggerItem>
          <StaggerItem className="step-card">
            <div className="step-n">02</div>
            <div className="step-t">{t("step2Title")}</div>
            <div className="step-d">{t("step2Desc")}</div>
          </StaggerItem>
          <StaggerItem className="step-card">
            <div className="step-n">03</div>
            <div className="step-t">{t("step3Title")}</div>
            <div className="step-d">{t("step3Desc")}</div>
          </StaggerItem>
        </StaggerReveal>
      </div>
    </section>
  );
}
