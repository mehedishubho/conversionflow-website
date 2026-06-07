"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { featureModules } from "@/data/features";
import { useLanguage } from "@/lib/i18n/LanguageContext";

import { VideoSection } from "@/components/sections/VideoSection";

const ease = [0.22, 1, 0.36, 1] as const;

type TabKey = "all" | "capi" | "tracking" | "courier" | "fraud" | "recovery" | "payments" | "statuses" | "dashboard" | "notifications" | "log" | "ui" | "security";

const TAB_EYEBROW: Record<TabKey, string | null> = {
  all: null,
  capi: "Module 01",
  tracking: "Module 02",
  courier: "Module 03",
  fraud: "Module 04",
  recovery: "Module 05",
  payments: "Module 06",
  statuses: "Module 07",
  dashboard: "Module 08",
  notifications: "Module 09",
  log: "Module 10",
  ui: "Module 11",
  security: "Module 12",
};

export default function FeaturesClient() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: t("featuresPage.tabAll") },
    { key: "capi", label: "Meta CAPI" },
    { key: "tracking", label: t("featuresPage.tabTracking") },
    { key: "courier", label: t("featuresPage.tabCourier") },
    { key: "fraud", label: t("featuresPage.tabFraud") },
    { key: "recovery", label: "Recovery" },
    { key: "payments", label: "Payments" },
    { key: "dashboard", label: t("featuresPage.tabAnalytics") },
    { key: "ui", label: "Admin UI" },
    { key: "security", label: "Security" },
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
        <div className="max-w-[1280px] mx-auto px-7 page-hero-sm-inner">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <div className="eyebrow">{t("featuresPage.heroEyebrow")}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}
          >
            {t("featuresPage.heroTitle")}
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "540px", margin: "0 auto" }}
          >
            {t("featuresPage.heroSubtitle")}
          </motion.p>
        </div>
      </div>

      {/* Video Section */}
      <VideoSection />

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
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
                const originalIndex = featureModules.indexOf(module);

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
                        {module.title}
                      </div>
                      <p className="text-[15px] text-text2 leading-[1.8]">
                        {module.detailDescription}
                      </p>
                      {module.checks && (
                        <ul className="checks">
                          {module.checks.map((check: string) => (
                            <li key={check}><div className="ck">✓</div>{check}</li>
                          ))}
                        </ul>
                      )}
                      <div className="tags" style={{ marginTop: "20px" }}>
                        {module.tags.map((tag) => (
                          <span key={tag.label} className="tag">{tag.label}</span>
                        ))}
                      </div>
                    </div>

                    <div className="fv">
                      {/* Meta CAPI panel (Module 01) */}
                      {module.eyebrow === "Module 01" && (
                        <div className="flex flex-col gap-3">
                          {[
                            { icon: "🟢", event: "Purchase", desc: "Auto-fire on order payment" },
                            { icon: "📦", event: "Delivered", desc: "Courier confirms delivery" },
                            { icon: "🚚", event: "Shipping", desc: "Order dispatched to courier" },
                            { icon: "↩️", event: "Returned", desc: "Courier reports return" },
                            { icon: "❌", event: "Cancelled", desc: "Order cancelled by store" },
                            { icon: "✅", event: "Confirmed", desc: "Order manually verified" },
                          ].map((ev) => (
                            <div key={ev.event} className="cc">
                              <div className="cc-l">
                                <div className="cc-icon">{ev.icon}</div>
                                <div>
                                  <div className="cc-name">{ev.event}</div>
                                  <div className="cc-sub">{ev.desc}</div>
                                </div>
                              </div>
                              <div className="live-chip"><div className="live-d" />Auto</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Multi-Channel Tracking panel (Module 02) */}
                      {module.eyebrow === "Module 02" && module.trackingPlatforms && (
                        <div className="tp">
                          <div className="tp-head">{t("featuresPage.unifiedTrackingHub")}</div>
                          {module.trackingPlatforms.map((platform) => (
                            <div key={platform.name} className="tp-row">
                              <div className="tp-name">{platform.name}</div>
                              <span className="ts-on">{platform.status}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Courier Sync panel (Module 03) */}
                      {module.eyebrow === "Module 03" && (
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
                                <div className="live-chip"><div className="live-d" />{t("featuresPage.live")}</div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3.5">
                            <div className="text-[11px] font-extrabold text-muted uppercase tracking-[1.2px] mb-3">
                              {t("featuresPage.automatedFlow")}
                            </div>
                            <div className="flow">
                              <span className="sn sn-p">{t("featuresPage.statusPending")}</span><span className="arrow-ch">→</span>
                              <span className="sn sn-s">{t("featuresPage.statusShipped")}</span><span className="arrow-ch">→</span>
                              <span className="sn sn-d">{t("featuresPage.statusDelivered")}</span><span className="arrow-ch">/</span>
                              <span className="sn sn-r">{t("featuresPage.statusReturned")}</span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Fraud Shield panel (Module 04) */}
                      {module.eyebrow === "Module 04" && module.fraudOrders && (
                        <>
                          <div className="fraud-box">
                            <div className="fb-head">
                              <span>{t("featuresPage.fraudOrder")}</span>
                              <span>{t("featuresPage.fraudPhone")}</span>
                              <span>{t("featuresPage.fraudStatus")}</span>
                              <span>{t("featuresPage.fraudAction")}</span>
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
                          {module.fraudStats && (
                            <div className="mt-3 py-3.5 px-[18px] bg-red-lt border border-red rounded-[10px] flex gap-2.5 items-center">
                              <span className="text-xl">🛡️</span>
                              <div>
                                <div className="text-[12px] font-extrabold text-red">
                                  {t("featuresPage.fraudBlockedLine").replace("{blocked}", String(module.fraudStats.blocked))}
                                </div>
                                <div className="text-[11.5px] text-muted">
                                  {t("featuresPage.fraudProtectedLine").replace("{protected}", module.fraudStats.protected)}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Partial Payment panel (Module 06) */}
                      {module.eyebrow === "Module 06" && (
                        <div className="flex flex-col gap-3">
                          {[
                            { icon: "💳", name: "bKash", desc: "Custom advance amount" },
                            { icon: "📱", name: "Nagad", desc: "Percentage or fixed" },
                            { icon: "🏦", name: "Rocket", desc: "Minimum advance floor" },
                          ].map((gw) => (
                            <div key={gw.name} className="cc">
                              <div className="cc-l">
                                <div className="cc-icon">{gw.icon}</div>
                                <div>
                                  <div className="cc-name">{gw.name}</div>
                                  <div className="cc-sub">{gw.desc}</div>
                                </div>
                              </div>
                              <div className="live-chip"><div className="live-d" />Active</div>
                            </div>
                          ))}
                          <div className="flex gap-2 mt-2">
                            <span className="tag">COD Protection</span>
                            <span className="tag">Preorder</span>
                            <span className="tag">Refundable</span>
                          </div>
                        </div>
                      )}

                      {/* Order Statuses panel (Module 07) */}
                      {module.eyebrow === "Module 07" && (
                        <div className="flex flex-col gap-2">
                          {[
                            { status: "Purchase", color: "bg-green-500" },
                            { status: "Confirmed", color: "bg-green-400" },
                            { status: "Shipping", color: "bg-blue-400" },
                            { status: "Delivered", color: "bg-teal-500" },
                            { status: "Returned", color: "bg-red-500" },
                            { status: "Cancelled", color: "bg-red-400" },
                            { status: "Autosave", color: "bg-purple-500" },
                            { status: "Partially Paid", color: "bg-purple-400" },
                            { status: "Awaiting Verification", color: "bg-orange-500" },
                            { status: "Payment Due", color: "bg-red-600" },
                          ].map((s) => (
                            <div key={s.status} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[--surface] border border-[--border]">
                              <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                              <span className="text-sm font-medium text-foreground">{s.status}</span>
                              <span className="text-[10px] text-muted ml-auto">→ CAPI</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Smart Dashboard panel (Module 08) */}
                      {module.eyebrow === "Module 08" && (
                        <div className="flex flex-col gap-3">
                          {[
                            { card: "💰", label: "Revenue", value: "৳42L", period: "30 days" },
                            { card: "📦", label: "Orders", value: "834", period: "30 days" },
                            { card: "🔄", label: "Open Leads", value: "47", period: "unconverted" },
                            { card: "🛡️", label: "Fraud Blocked", value: "12", period: "this month" },
                          ].map((s) => (
                            <div key={s.label} className="cc">
                              <div className="cc-l">
                                <div className="cc-icon">{s.card}</div>
                                <div>
                                  <div className="cc-name">{s.label}</div>
                                  <div className="cc-sub">{s.period}</div>
                                </div>
                              </div>
                              <div className="text-sm font-extrabold text-accent">{s.value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Empty state for tabs with no visual panels */}
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
