"use client";

import { useT } from "@/lib/useT";

export function BDSection() {
  const t = useT();

  return (
    <section className="sec sec-bg">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="sh">
          <div className="eyebrow">{t.bdSection.eyebrow}</div>
          <div className="sec-title">
            {t.bdSection.title1}
            <br />
            {t.bdSection.title2}
          </div>
          <p className="sec-sub">{t.bdSection.subtitle}</p>
        </div>
        <div className="bd-layout">
          <div>
            <h3 className="font-syne text-[22px] font-black text-foreground tracking-[-0.5px] mb-2.5">
              {t.bdSection.flowTitle}
            </h3>
            <p className="text-sm text-text2 leading-[1.8] mb-5">{t.bdSection.flowDesc}</p>
            <div className="flow">
              <span className="sn sn-p">{t.bdSection.statusPending}</span>
              <span className="arrow-ch">→</span>
              <span className="sn sn-s">{t.bdSection.statusShipped}</span>
              <span className="arrow-ch">→</span>
              <span className="sn sn-d">{t.bdSection.statusDelivered}</span>
              <span className="arrow-ch">/</span>
              <span className="sn sn-r">{t.bdSection.statusReturned}</span>
            </div>
            <ul className="checks">
              {[t.bdSection.check1, t.bdSection.check2, t.bdSection.check3, t.bdSection.check4, t.bdSection.check5].map((c) => (
                <li key={c}><div className="ck">✓</div>{c}</li>
              ))}
            </ul>
          </div>
          <div className="courier-cards">
            <div className="cc">
              <div className="cc-l">
                <div className="cc-icon">📦</div>
                <div>
                  <div className="cc-name">{t.bdSection.steadfastName}</div>
                  <div className="cc-sub">{t.bdSection.steadfastSub}</div>
                </div>
              </div>
              <div className="live-chip"><div className="live-d" />{t.bdSection.live}</div>
            </div>
            <div className="cc">
              <div className="cc-l">
                <div className="cc-icon">🛵</div>
                <div>
                  <div className="cc-name">{t.bdSection.pathaoName}</div>
                  <div className="cc-sub">{t.bdSection.pathaoSub}</div>
                </div>
              </div>
              <div className="live-chip"><div className="live-d" />{t.bdSection.live}</div>
            </div>
            <div className="cc">
              <div className="cc-l">
                <div className="cc-icon">🔴</div>
                <div>
                  <div className="cc-name">{t.bdSection.redxName}</div>
                  <div className="cc-sub">{t.bdSection.redxSub}</div>
                </div>
              </div>
              <div className="live-chip"><div className="live-d" />{t.bdSection.live}</div>
            </div>
            <div className="bd-pay-note">
              <strong>{t.bdSection.payNote}</strong>
              <p>{t.bdSection.payDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
