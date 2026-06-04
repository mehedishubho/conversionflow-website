"use client";

const bnModules = [{"title":"স্বয়ংক্রিয় কুরিয়ার সিঙ্ক","description":"ব্যাকগ্রাউন্ডে স্বয়ংক্রিয়ভাবে Steadfast, Pathao এবং RedX পোল করে এবং রিয়েল-টাইমে আপনার WooCommerce অর্ডার স্ট্যাটাস আপডেট করে। কোনো ম্যানুয়াল ট্র্যাকিং লাগবে না।","detailDescription":"ConversionFlow প্রতি ঘণ্টায় ব্যাকগ্রাউন্ডে Steadfast, Pathao এবং RedX পোল করে, স্বয়ংক্রিয়ভাবে আপনার WooCommerce অর্ডার স্ট্যাটাস আপডেট করে — ডেলিভার্ড, রিটার্নড বা ক্যানসেলড।","tags":["Steadfast","Pathao","RedX","Auto Poll","Status Mapping"],"checks":["ব্যাকগ্রাউন্ড পোলিং — কোনো ম্যানুয়াল অ্যাকশন লাগবে না","রিয়েল-টাইম স্ট্যাটাস: ডেলিভার্ড / রিটার্নড / ক্যানসেলড","WordPress অ্যাডমিন থেকে প্রতি-কুরিয়ার API কী","অর্ডার লিস্ট থেকে এক-ক্লিক ম্যানুয়াল সিঙ্ক"]},{"title":"অ্যাডভান্সড অ্যানালিটিক্স","description":"রেভিনিউ ট্রেন্ড, কুরিয়ার পারফরম্যান্স চার্ট এবং লাইভ-পোলিং স্ট্যাটস — সব একটি সুন্দর ড্যাশবোর্ডে।","tags":["প্রতিবেদন","স্ট্যাট"]},{"title":"ফ্রড শিল্ড","description":"ফোন, আইপি বা ইমেইল দিয়ে ব্যাড অ্যাক্টরদের ব্লক করুন। অর্ডার প্লেস করার আগেই ভেলোসিটি লিমিট স্বয়ংক্রিয় অপব্যবহার থামায়।","detailDescription":"বাংলাদেশি ই-কমার্সে ফেক-অর্ডার রেট অনেক বেশি। ফোন নম্বর, আইপি অ্যাড্রেস বা ইমেইল দিয়ে ব্যাড অ্যাক্টরদের আপনার টাকা অপচয় করার আগেই ব্লক করুন। ভেলোসিটি লিমিট বারবার অপব্যবহার রোধ করে।","tags":["সুরক্ষা","স্পিডি লিমিট"],"checks":["গ্লোবাল ব্ল্যাকলিস্ট: ফোন, আইপি, ইমেইল","ভেলোসিটি লিমিট — প্রতি ইউজার সর্বোচ্চ অর্ডার","অর্ডার টেবিল থেকে এক-ক্লিক ব্লক","ব্লকড অর্ডার পেমেন্টের আগেই অটো-ক্যানসেলড"],"blockedThisMonth":"{count}টি ফ্রড অর্ডার ব্লক করা হয়েছে","protectedThisMonth":"এই মাসে ৳{amount} রক্ষা করা হয়েছে"},{"title":"Meta Pixel + CAPI","description":"হাইব্রিড ব্রাউজার + সার্ভার-সাইড ট্র্যাকিং যা iOS 14 এবং অ্যাড-ব্লকার সত্ত্বেও কাজ করে। ১০০% সঠিক কনভার্সন।","detailDescription":"ব্রাউজার-সাইড পিক্সেল ৩০-৪০% কনভার্সন মিস করে। ConversionFlow-এর হাইব্রিড পদ্ধতি ব্রাউজার পিক্সেলকে সার্ভার-সাইড CAPI-এর সাথে যুক্ত করে — প্রতিবার প্রতিটি কেনাকাটা ট্র্যাক করা হয়।","tags":["CAPI","iOS 14+","GA4"],"checks":["সব প্ল্যাটফর্মের জন্য ইউনিফাইড ট্র্যাকিং হাব","GA4, TikTok, Pinterest, GTM সাপোর্ট","অটো-ফায়ার OrderDelivered ও OrderReturned","এক-ক্লিক ম্যানুয়াল CAPI সিঙ্ক"]},{"title":"লিড রিকভারি","description":"ইউজাররা টাইপ করার সময় রিয়েল-টাইমে চেকআউট ফিল্ড ক্যাপচার করুন। অসম্পূর্ণ অর্ডারগুলোকে পেমেন্ট করা কাস্টমারে রূপান্তর করুন।","tags":["লিড","অসম্পূর্ণ অর্ডার"]},{"title":"প্রিমিয়াম UI সিস্টেম","description":"গ্লাসমরফিজম, এমারেল্ড অ্যাকসেন্ট এবং মাইক্রো-অ্যানিমেশন সহ লাইট ও ডার্ক অ্যাডমিন থিম।","tags":["লাইট থিম","ডার্ক থিম"]}];


import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { featureModules } from "@/data/features";

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

export default function FeaturesClient() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: "সব মডিউল" },
    { key: "courier", label: "কুরিয়ার সিঙ্ক" },
    { key: "tracking", label: "ট্র্যাকিং" },
    { key: "fraud", label: "ফ্রড শিল্ড" },
    { key: "analytics", label: "অ্যানালিটিক্স" },
    { key: "lead", label: "লিড রিকভারি" },
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
            <div className="eyebrow">সব ফিচার</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease }}
            className="sec-title" style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}
          >
            ConversionFlow যা যা করে
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="sec-sub" style={{ maxWidth: "540px", margin: "0 auto" }}
          >
            ছয়টি শক্তিশালী মডিউল, একটি ইউনিফাইড প্লাগইন। কোনো ইন্টিগ্রেশন ঝামেলা নেই। আলাদাভাবে API ম্যানেজ করতে হবে না।
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
                        {bnModules[originalIndex] ? bnModules[originalIndex].title : module.title}
                      </div>
                      <p className="text-[15px] text-text2 leading-[1.8]">
                        {bnModules[originalIndex] ? bnModules[originalIndex].detailDescription : module.detailDescription}
                      </p>
                      {hasTranslation && bnModules[originalIndex]?.checks && (
                        <ul className="checks">
                          {bnModules[originalIndex].checks.map((check: string) => (
                            <li key={check}><div className="ck">✓</div>{check}</li>
                          ))}
                        </ul>
                      )}
                      {module.eyebrow === "Module 01" && (
                        <div className="tags" style={{ marginTop: "20px" }}>
                          {hasTranslation && bnModules[originalIndex]?.tags ? bnModules[originalIndex].tags.map((tag: string) => (
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
                                <div className="live-chip"><div className="live-d" />"লাইভ"</div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3.5">
                            <div className="text-[11px] font-extrabold text-muted uppercase tracking-[1.2px] mb-3">
                              "স্বয়ংক্রিয় ফ্লো"
                            </div>
                            <div className="flow">
                                <span className="sn sn-p">পেন্ডিং</span><span className="arrow-ch">→</span>
                                <span className="sn sn-s">শিপড</span><span className="arrow-ch">→</span>
                                <span className="sn sn-d">ডেলিভার্ড</span><span className="arrow-ch">/</span>
                                <span className="sn sn-r">রিটার্নড</span>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Meta CAPI / Tracking panel */}
                      {module.eyebrow === "Module 02" && module.trackingPlatforms && (
                        <div className="tp">
                          <div className="tp-head">🎯 ইউনিফাইড ট্র্যাকিং হাব</div>
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
                              <span>অর্ডার</span>
                              <span>ফোন</span>
                              <span>স্ট্যাটাস</span>
                              <span>অ্যাকশন</span>
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
                                  {"${module.fraudStats.blocked}টি ফ্রড অর্ডার ব্লক করা হয়েছে"}
                                </div>
                                <div className="text-[11.5px] text-muted">
                                  {"এই মাসে ৫৮,৪০ টাকা রক্ষা করা হয়েছে"}
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
