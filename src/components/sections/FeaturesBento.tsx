"use client";

import { featureModules } from "@/data/features";
import { StaggerReveal, StaggerItem } from "@/components/layout/StaggerReveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * Bento layout plan (3-col grid, 12 cards, 5 rows):
 *
 *  Row 1: [Meta CAPI  ─── wide ───] [Multi-Channel]
 *  Row 2: [Courier]  [Fraud Shield]  [Recovery]
 *  Row 3: [Partial Payment ─ wide ─] [Order Status]
 *  Row 4: [Dashboard] [Notifications] [Activity Log]
 *  Row 5: [Admin UI] [License & Security ─ wide ─]
 *
 *  wide = spans 2 columns, featured = gradient accent border
 */
const BENTO_LAYOUT: { wide: boolean; featured: boolean }[] = [
  { wide: true, featured: true },   // 0  Meta CAPI
  { wide: false, featured: false }, // 1  Multi-Channel Tracking
  { wide: false, featured: false }, // 2  Courier Automation
  { wide: false, featured: false }, // 3  Fraud Shield
  { wide: false, featured: false }, // 4  Incomplete Orders Recovery
  { wide: true, featured: false },  // 5  Partial Payment System
  { wide: false, featured: false }, // 6  10 Custom Order Statuses
  { wide: false, featured: false }, // 7  Smart Dashboard
  { wide: false, featured: false }, // 8  Automated Notifications
  { wide: false, featured: false }, // 9  Activity Log
  { wide: false, featured: false }, // 10 Modern Admin UI
  { wide: true, featured: true },   // 11 License & Security
];

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
        <StaggerReveal className="bento bento-12">
          {featureModules.map((module, index) => {
            const layout = BENTO_LAYOUT[index] || { wide: false, featured: false };
            return (
              <StaggerItem
                key={index}
                className={cn(
                  "bc",
                  layout.wide && "bc-w2",
                  layout.featured && "bc-featured"
                )}
              >
                <div className="bc-icon">{module.icon}</div>
                <div className="bc-title">{module.title}</div>
                <div className="bc-desc">{module.description}</div>
                <div className="tags">
                  {module.tags.slice(0, layout.wide ? 5 : 3).map((tag) => (
                    <span key={tag.label} className="tag">{tag.label}</span>
                  ))}
                  {module.tags.length > (layout.wide ? 5 : 3) && (
                    <span className="tag">+{module.tags.length - (layout.wide ? 5 : 3)}</span>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerReveal>
      </div>
    </section>
  );
}
