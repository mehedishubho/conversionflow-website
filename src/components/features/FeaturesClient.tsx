"use client";

import { useState, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { featureModules } from "@/data/features";
import { useTranslations } from "next-intl";
import { VideoSection } from "@/components/sections/VideoSection";

const ease = [0.22, 1, 0.36, 1] as const;

type TabKey = "all" | "courier" | "tracking" | "fraud" | "analytics" | "lead";

const TAB_EYEBROW: Record<TabKey, string | null> = {
  all: null,
  courier: "Module 01",
  tracking: "Module 02",
  fraud: "Module 03",
  analytics: null,
  lead: null,
};

export default function FeaturesClient({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  use(params);
  const t = useTranslations("featuresPage");
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: t("tabAll") },
    { key: "courier", label: t("tabCourier") },
    { key: "tracking", label: t("tabTracking") },
    { key: "fraud", label: t("tabFraud") },
    { key: "analytics", label: t("tabAnalytics") },
    { key: "lead", label: t("tabLead") },
  ];

  const allDetailModules = featureModules.filter((m) => m.eyebrow);
  const eyebrowFilter = TAB_EYEBROW[activeTab];
  const visibleModules = eyebrowFilter
    ? allDetailModules.filter((m) => m.eyebrow === eyebrowFilter)
    : allDetailModules;

  return (
    <>
      {/* Page Hero */}
      <div className="page-hero-sm">
        <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">{t("eyebrow")}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}
          >
            {t("title")}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "540px", margin: "0 auto" }}
          >
            {t("subtitle")}
          </motion.p>
        </div>
      </div>

      {/* Video Section */}
      <VideoSection />

      <section className="sec">
        <div className="max-w-[1160px] mx-auto px-7">
          {/* Tabs */}
          <motion.div
            className="feat-tabs"
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.4, ease }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`ftab${activeTab === tab.key ? " active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Feature rows */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="feat-rows"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease }}
            >
              {visibleModules.map((module) => {
                // Find original index in featureModules to match JSON keys
                const originalIndex = featureModules.indexOf(module);
                const hasTranslation = originalIndex !== -1;

                return (
                  <motion.div
                    key={module.title}
                    className={`feat-row${originalIndex % 2 === 1 ? " rev" : ""}`}
                    initial={{ opacity: 0, y: 32 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.6, delay: originalIndex * 0.05, ease }}
                  >
                    <div className="fc">
                      <div className="eyebrow">{module.eyebrow}</div>
                      <div className="sec-title">
                        {hasTranslation ? t(`modules.${originalIndex}.title`) : module.title}
                      </div>
                      <p className="text-[15px] text-text2 leading-[1.8]">
                        {hasTranslation ? t(`modules.${originalIndex}.detailDescription`) : module.detailDescription}
                      </p>
                      {hasTranslation && (
                        <ul className="checks">
                          {t.raw(`modules.${originalIndex}.checks`)?.map((check: string) => (
                            <li key={check}><div className="ck">✓</div>{check}</li>
                          ))}
                        </ul>
                      )}
                      {module.eyebrow === "Module 01" && (
                        <div className="tags" style={{ marginTop: "20px" }}>
                          {hasTranslation ? t.raw(`modules.${originalIndex}.tags`).map((tag: string) => (
                            <span key={tag} className="tag">{tag}</span>
                          )) : module.tags.map((tag) => (
                            <span key={tag.label} className="tag">{tag.label}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="fv">
                      {/* Courier Sync panel */}
                      {module.eyebrow === "Module 01" && (
                        <>
                          <div className="flex flex-col gap-3">
                            {[
                              { icon: "📦", name: "Steadfast Courier", sub: "834 orders synced today" },
                              { icon: "🛵", name: "Pathao Courier", sub: "421 orders synced today" },
                              { icon: "🔴", name: "RedX Courier", sub: "198 orders synced today" },
                            ].map((c) => (
                              <div key={c.name} className="cc">
                                <div className="cc-l">
                                  <div className="cc-icon">{c.icon}</div>
                                  <div><div className="cc-name">{c.name}</div><div className="cc-sub">{c.sub}</div></div>
                                </div>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                <div className="live-chip"><div className="live-d" />{t("live" as any)}</div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3.5">
                            <div className="text-[11px] font-extrabold text-muted uppercase tracking-[1.2px] mb-3">
                              {t("automatedFlow")}
                            </div>
                            <div className="flow">
                                <span className="sn sn-p">{t("fraudStatusPending")}</span><span className="arrow-ch">→</span>
                                <span className="sn sn-s">{t("fraudStatusShipped")}</span><span className="arrow-ch">→</span>
                                <span className="sn sn-d">{t("fraudStatusDelivered")}</span><span className="arrow-ch">/</span>
                                <span className="sn sn-r">{t("fraudStatusReturned")}</span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Meta CAPI / Tracking panel */}
                      {module.eyebrow === "Module 02" && module.trackingPlatforms && (
                        <div className="tp">
                          <div className="tp-head">{t("trackingHub")}</div>
                          {module.trackingPlatforms.map((platform) => (
                            <div key={platform.name} className="tp-row">
                              <div className="tp-name">{platform.name}</div>
                              <span className="ts-on">{platform.status}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Fraud Shield panel */}
                      {module.eyebrow === "Module 03" && module.fraudOrders && (
                        <>
                          <div className="fraud-box">
                            <div className="fb-head">
                              <span>{t("fraudOrder")}</span>
                              <span>{t("fraudPhone")}</span>
                              <span>{t("fraudStatus")}</span>
                              <span>{t("fraudAction")}</span>
                            </div>
                            {module.fraudOrders.map((order) => (
                              <div key={order.id} className="fb-row">
                                <span className="fid">{order.id}</span>
                                <span className="text-text2">{order.phone}</span>
                                {order.status === "BLOCKED"
                                  ? <span className="blkd-badge">{order.status}</span>
                                  : <span className={`badge ${order.statusClass}`}>{order.status}</span>}
                                {order.status === "BLOCKED"
                                  ? <span className="text-[10px] text-muted">{order.action}</span>
                                  : <button className="blk-btn">{order.action}</button>}
                              </div>
                            ))}
                          </div>
                          {module.fraudStats && hasTranslation && (
                            <div className="mt-3 py-3.5 px-[18px] bg-red-lt border border-red rounded-[10px] flex gap-2.5 items-center">
                              <span className="text-xl">🛡️</span>
                              <div>
                                <div className="text-[12px] font-extrabold text-red">
                                  {t(`modules.${originalIndex}.blockedThisMonth`, { count: module.fraudStats.blocked })}
                                </div>
                                <div className="text-[11.5px] text-muted">
                                  {t(`modules.${originalIndex}.protectedThisMonth`, { amount: "18,400" })}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Empty state for tabs with no detail modules (Analytics, Lead Recovery) */}
              {visibleModules.length === 0 && (
                <div className="text-center py-20 text-text2 text-[15px]">
                  Detailed breakdown coming soon.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
