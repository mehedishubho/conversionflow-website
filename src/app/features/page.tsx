import type { Metadata } from "next";
import { featureModules } from "@/data/features";

export const metadata: Metadata = {
  title: "Features",
  description: "Six powerful modules — Automated Courier Sync, Meta CAPI Tracking, Fraud Shield, Analytics, and Lead Recovery. One unified WooCommerce plugin.",
  openGraph: {
    title: "Features — WooBooster",
    description: "Six powerful modules — Automated Courier Sync, Meta CAPI Tracking, Fraud Shield, Analytics, and Lead Recovery.",
    url: "/features",
  },
};

const detailModules = featureModules.filter((m) => m.eyebrow);

export default function Features() {
  return (
    <>
      <div className="page-hero-sm">
        <div className="max-w-[1160px] mx-auto px-7 page-hero-sm-inner">
          <div className="eyebrow">All Features</div>
          <div
            className="sec-title"
            style={{ fontSize: "clamp(32px,4vw,52px)", letterSpacing: "-2px" }}
          >
            Everything WooBooster Does
          </div>
          <p className="sec-sub" style={{ maxWidth: "540px", margin: "0 auto" }}>
            Six powerful modules, one unified plugin. No integrations to wrestle
            with. No APIs to manage separately.
          </p>
        </div>
      </div>

      <section className="sec">
        <div className="max-w-[1160px] mx-auto px-7">
          <div className="feat-tabs">
            <div className="ftab active">All Modules</div>
            <div className="ftab">Courier Sync</div>
            <div className="ftab">Tracking</div>
            <div className="ftab">Fraud Shield</div>
            <div className="ftab">Analytics</div>
            <div className="ftab">Lead Recovery</div>
          </div>

          <div className="feat-rows">
            {detailModules.map((module, index) => (
              <div key={module.title} className={`feat-row${index % 2 === 1 ? " rev" : ""}`}>
                <div className="fc">
                  <div className="eyebrow">{module.eyebrow}</div>
                  <div className="sec-title">{module.title}</div>
                  <p className="text-[15px] text-text2 leading-[1.8]">
                    {module.detailDescription}
                  </p>
                  {module.checks && (
                    <ul className="checks">
                      {module.checks.map((check) => (
                        <li key={check}>
                          <div className="ck">✓</div>
                          {check}
                        </li>
                      ))}
                    </ul>
                  )}
                  {index === 0 && (
                    <div className="tags" style={{ marginTop: "20px" }}>
                      {module.tags.map((tag) => (
                        <span key={tag.label} className="tag">{tag.label}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="fv">
                  {/* Module 01: Courier Sync — decorative UI chrome kept inline */}
                  {index === 0 && (
                    <>
                      <div className="flex flex-col gap-3">
                        <div className="cc">
                          <div className="cc-l">
                            <div className="cc-icon">📦</div>
                            <div>
                              <div className="cc-name">Steadfast Courier</div>
                              <div className="cc-sub">834 orders synced today</div>
                            </div>
                          </div>
                          <div className="live-chip">
                            <div className="live-d"></div>Live
                          </div>
                        </div>
                        <div className="cc">
                          <div className="cc-l">
                            <div className="cc-icon">🛵</div>
                            <div>
                              <div className="cc-name">Pathao Courier</div>
                              <div className="cc-sub">421 orders synced today</div>
                            </div>
                          </div>
                          <div className="live-chip">
                            <div className="live-d"></div>Live
                          </div>
                        </div>
                        <div className="cc">
                          <div className="cc-l">
                            <div className="cc-icon">🔴</div>
                            <div>
                              <div className="cc-name">RedX Courier</div>
                              <div className="cc-sub">198 orders synced today</div>
                            </div>
                          </div>
                          <div className="live-chip">
                            <div className="live-d"></div>Live
                          </div>
                        </div>
                      </div>
                      <div className="mt-3.5">
                        <div className="text-[11px] font-extrabold text-muted uppercase tracking-[1.2px] mb-3">
                          Automated Flow
                        </div>
                        <div className="flow">
                          <span className="sn sn-p">Pending</span>
                          <span className="arrow-ch">→</span>
                          <span className="sn sn-s">Shipped</span>
                          <span className="arrow-ch">→</span>
                          <span className="sn sn-d">Delivered</span>
                          <span className="arrow-ch">/</span>
                          <span className="sn sn-r">Returned</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Module 02: Tracking panel — data-driven from trackingPlatforms */}
                  {index === 1 && module.trackingPlatforms && (
                    <div className="tp">
                      <div className="tp-head">🎯 Unified Tracking Hub</div>
                      {module.trackingPlatforms.map((platform) => (
                        <div key={platform.name} className="tp-row">
                          <div className="tp-name">{platform.name}</div>
                          <span className="ts-on">{platform.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Module 03: Fraud box — data-driven from fraudOrders and fraudStats */}
                  {index === 2 && module.fraudOrders && (
                    <>
                      <div className="fraud-box">
                        <div className="fb-head">
                          <span>Order</span>
                          <span>Phone</span>
                          <span>Status</span>
                          <span>Action</span>
                        </div>
                        {module.fraudOrders.map((order) => (
                          <div key={order.id} className="fb-row">
                            <span className="fid">{order.id}</span>
                            <span className="text-text2">{order.phone}</span>
                            {order.status === "BLOCKED" ? (
                              <span className="blkd-badge">{order.status}</span>
                            ) : (
                              <span className={`badge ${order.statusClass}`}>{order.status}</span>
                            )}
                            {order.status === "BLOCKED" ? (
                              <span className="text-[10px] text-muted">{order.action}</span>
                            ) : (
                              <button className="blk-btn">{order.action}</button>
                            )}
                          </div>
                        ))}
                      </div>
                      {module.fraudStats && (
                        <div className="mt-3 py-3.5 px-[18px] bg-red-lt border border-red rounded-[10px] flex gap-2.5 items-center">
                          <span className="text-xl">🛡️</span>
                          <div>
                            <div className="text-[12px] font-extrabold text-red">
                              {module.fraudStats.blocked} Fraud Orders Blocked
                            </div>
                            <div className="text-[11.5px] text-muted">
                              {module.fraudStats.protected}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
