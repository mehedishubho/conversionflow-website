"use client";

import { useT } from "@/lib/useT";
import { StaggerReveal, StaggerItem } from "@/components/layout/StaggerReveal";

export function HowItWorks() {
  const t = useT();

  return (
    <section className="sec">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="sh center">
          <div className="eyebrow">{t.howItWorks.eyebrow}</div>
          <div className="sec-title">{t.howItWorks.title}</div>
          <p className="sec-sub">{t.howItWorks.subtitle}</p>
        </div>
        <StaggerReveal className="steps-grid">
          <StaggerItem className="step-card">
            <div className="step-n">01</div>
            <div className="step-t">{t.howItWorks.step1Title}</div>
            <div className="step-d">{t.howItWorks.step1Desc}</div>
          </StaggerItem>
          <StaggerItem className="step-card">
            <div className="step-n">02</div>
            <div className="step-t">{t.howItWorks.step2Title}</div>
            <div className="step-d">{t.howItWorks.step2Desc}</div>
          </StaggerItem>
          <StaggerItem className="step-card">
            <div className="step-n">03</div>
            <div className="step-t">{t.howItWorks.step3Title}</div>
            <div className="step-d">{t.howItWorks.step3Desc}</div>
          </StaggerItem>
        </StaggerReveal>
      </div>
    </section>
  );
}
