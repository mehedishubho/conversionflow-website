"use client";

import Link from "next/link";
import { featureCategories } from "@/data/features";
import { platformPricing } from "@/data/pricing";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const painPointsEn = [
  "Fake COD orders burn courier cost before revenue is real",
  "Browser-only pixels miss purchase signals after iOS and ad blockers",
  "Courier teams waste hours checking Steadfast, Pathao, and RedX manually",
  "Checkout leads disappear before sales teams can follow up",
  "Scattered plugins create weak operational visibility",
];

const painPointsBn = [
  "ফেক COD অর্ডার রেভিনিউ আসার আগেই কুরিয়ার খরচ পোড়ায়",
  "ব্রাউজার-অনলি পিক্সেল iOS এবং অ্যাড ব্লকারের পরে পারচেজ সিগন্যাল মিস করে",
  "কুরিয়ার টিম Steadfast, Pathao এবং RedX ম্যানুয়ালি চেক করে ঘণ্টা নষ্ট করে",
  "চেকআউট লিড সেলস টিম ফলো-আপ করার আগেই হারিয়ে যায়",
  "ছড়িয়ে থাকা প্লাগইন দুর্বল পরিচালনাগত দৃশ্যমানতা তৈরি করে",
];

const comparisonsEn = [
  ["Scattered plugins", "Separate tracking, courier, fraud, payment, and reporting tools with inconsistent data."],
  ["Manual operations", "Courier dashboards, spreadsheets, missed follow-ups, and no reliable customer delivery history."],
  ["ConversionFlow", "One commerce layer for tracking reliability, courier intelligence, COD protection, recovery, and analytics."],
];

const comparisonsBn = [
  ["ছড়িয়ে থাকা প্লাগইন", "আলাদা ট্র্যাকিং, কুরিয়ার, ফ্রড, পেমেন্ট এবং রিপোর্টিং টুল অসঙ্গত ডেটা সহ।"],
  ["ম্যানুয়াল অপারেশন", "কুরিয়ার ড্যাশবোর্ড, স্প্রেডশিট, মিসড ফলো-আপ এবং নির্ভরযোগ্য গ্রাহক ডেলিভারি ইতিহাস নেই।"],
  ["ConversionFlow", "ট্র্যাকিং নির্ভরযোগ্যতা, কুরিয়ার ইন্টেলিজেন্স, COD সুরক্ষা, রিকভারি এবং অ্যানালিটিক্সের জন্য একটি কমার্স লেয়ার।"],
];

export function RepositioningSections() {
  const { t, locale } = useLanguage();

  const painPoints = locale === "bn" ? painPointsBn : painPointsEn;
  const comparisons = locale === "bn" ? comparisonsBn : comparisonsEn;

  return (
    <>
      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="sh center">
            <div className="eyebrow">{t("repositioning.painEyebrow")}</div>
            <h2 className="sec-title">{t("repositioning.painTitle")}</h2>
            <p className="sec-sub">
              {t("repositioning.painSub")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {painPoints.map((point) => (
              <div key={point} className="bg-surface border border-[--border] rounded-[14px] p-5">
                <div className="text-accent font-black mb-3">◆</div>
                <p className="text-sm text-text2 leading-[1.7]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-bg">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="sh center">
            <div className="eyebrow">{t("repositioning.platformEyebrow")}</div>
            <h2 className="sec-title">{t("repositioning.platformTitle")}</h2>
            <p className="sec-sub">{t("repositioning.platformSub")}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {platformPricing.map((platform) => (
              <div key={platform.key} className="pc">
                <div className="p-plan">{platform.name}</div>
                <p className="p-desc">{platform.positioning}</p>
                <ul className="p-features">
                  {platform.features.slice(0, 5).map((feature) => (
                    <li key={feature}><span className="p-ck">✓</span>{feature}</li>
                  ))}
                </ul>
                <Link href="/platform-comparison" className="btn btn-outline w-full justify-center">View Platform Editions</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="sh center">
            <div className="eyebrow">{t("repositioning.featureEyebrow")}</div>
            <h2 className="sec-title">{t("repositioning.featureTitle")}</h2>
          </div>
          <div className="bento">
            {featureCategories.map((category, index) => (
              <div key={category.slug} className={`bc${index === 0 ? " w2" : ""}`}>
                <div className="bc-icon">◆</div>
                <h3 className="bc-title">{category.eyebrow}</h3>
                <p className="bc-desc">{category.summary}</p>
                <div className="tags">
                  {category.items.slice(0, 3).map((item) => <span key={item.title} className="tag">{item.title}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec sec-bg">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <div className="eyebrow">{t("repositioning.adsEyebrow")}</div>
              <h2 className="sec-title">{t("repositioning.adsTitle")}</h2>
              <p className="sec-sub" style={{ margin: "0 0 22px" }}>
                {t("repositioning.adsSub")}
              </p>
              <ul className="checks">
                <li><div className="ck">✓</div>{t("repositioning.adsCheck1")}</li>
                <li><div className="ck">✓</div>{t("repositioning.adsCheck2")}</li>
                <li><div className="ck">✓</div>{t("repositioning.adsCheck3")}</li>
              </ul>
            </div>
            <div>
              <div className="eyebrow">{t("repositioning.codEyebrow")}</div>
              <h2 className="sec-title">{t("repositioning.codTitle")}</h2>
              <p className="sec-sub" style={{ margin: "0 0 22px" }}>
                {t("repositioning.codSub")}
              </p>
              <ul className="checks">
                <li><div className="ck">✓</div>{t("repositioning.codCheck1")}</li>
                <li><div className="ck">✓</div>{t("repositioning.codCheck2")}</li>
                <li><div className="ck">✓</div>{t("repositioning.codCheck3")}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="max-w-[1280px] mx-auto px-7">
          <div className="sh center">
            <div className="eyebrow">{t("repositioning.comparisonEyebrow")}</div>
            <h2 className="sec-title">{t("repositioning.comparisonTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisons.map(([title, body]) => (
              <div key={title} className="bg-surface border border-[--border] rounded-[14px] p-6">
                <h3 className="font-dm-sans text-xl font-black text-foreground mb-3">{title}</h3>
                <p className="text-sm text-text2 leading-[1.8]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
