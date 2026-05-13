"use client";

import { useTranslations } from "next-intl";

export function BDSection() {
  const t = useTranslations("bdSection");

  return (
    <section className="sec sec-bg">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="sh">
          <div className="eyebrow">{t("eyebrow")}</div>
          <div className="sec-title">
            {t("title1")}
            <br />
            {t("title2")}
          </div>
          <p className="sec-sub">{t("subtitle")}</p>
        </div>
        <div className="bd-layout">
          <div>
            <h3 className="font-dm-sans text-[22px] font-black text-foreground tracking-[-0.5px] mb-2.5">
              {t("flowTitle")}
            </h3>
            <p className="text-sm text-text2 leading-[1.8] mb-5">{t("flowDesc")}</p>
            <div className="flow">
              <span className="sn sn-p">{t("statusPending")}</span>
              <span className="arrow-ch">→</span>
              <span className="sn sn-s">{t("statusShipped")}</span>
              <span className="arrow-ch">→</span>
              <span className="sn sn-d">{t("statusDelivered")}</span>
              <span className="arrow-ch">/</span>
              <span className="sn sn-r">{t("statusReturned")}</span>
            </div>
            <ul className="checks">
              {[t("check1"), t("check2"), t("check3"), t("check4"), t("check5")].map((c) => (
                <li key={c}><div className="ck">✓</div>{c}</li>
              ))}
            </ul>
          </div>
          <div className="courier-cards">
            <div className="cc">
              <div className="cc-l">
                <div className="cc-icon">📦</div>
                <div>
                  <div className="cc-name">{t("steadfastName")}</div>
                  <div className="cc-sub">{t("steadfastSub")}</div>
                </div>
              </div>
              <div className="live-chip"><div className="live-d" />{t("live")}</div>
            </div>
            <div className="cc">
              <div className="cc-l">
                <div className="cc-icon">🛵</div>
                <div>
                  <div className="cc-name">{t("pathaoName")}</div>
                  <div className="cc-sub">{t("pathaoSub")}</div>
                </div>
              </div>
              <div className="live-chip"><div className="live-d" />{t("live")}</div>
            </div>
            <div className="cc">
              <div className="cc-l">
                <div className="cc-icon">🔴</div>
                <div>
                  <div className="cc-name">{t("redxName")}</div>
                  <div className="cc-sub">{t("redxSub")}</div>
                </div>
              </div>
              <div className="live-chip"><div className="live-d" />{t("live")}</div>
            </div>
            <div className="bd-pay-note">
              <strong>{t("payNote")}</strong>
              <p>{t("payDesc")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
