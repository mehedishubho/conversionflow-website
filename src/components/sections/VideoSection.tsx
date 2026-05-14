"use client";

import { useTranslations } from "next-intl";

export function VideoSection() {
  const t = useTranslations("videoSection");

  return (
    <div className="video-sec">
      <div className="max-w-[1280px] mx-auto px-7">
        <div className="text-center mb-4">
          <div className="vs-label">{t("label")}</div>
          <div className="vs-title">{t("title")}</div>
          <div className="vs-sub">{t("subtitle")}</div>
        </div>
        <div className="video-player">
          <div className="video-thumb">
            <div className="vt-grid" />
            <div className="vt-ui">
              <div className="vt-ui-bar">
                <div className="vt-ui-dot" style={{ background: "#FF5F57" }} />
                <div className="vt-ui-dot" style={{ background: "#FFBD2E" }} />
                <div className="vt-ui-dot" style={{ background: "#28C840" }} />
              </div>
              <div className="vt-ui-body">
                <div className="vt-card">
                  <div className="vt-card-num">834</div>
                  <div className="vt-card-lbl">{t("ordersLabel")}</div>
                </div>
                <div className="vt-card">
                  <div className="vt-card-num">৳4.2L</div>
                  <div className="vt-card-lbl">{t("revenueLabel")}</div>
                </div>
                <div className="vt-card">
                  <div className="vt-card-num">12</div>
                  <div className="vt-card-lbl">{t("fraudLabel")}</div>
                </div>
              </div>
            </div>
            <div className="play-btn">
              <div className="play-ring" />
              <div className="play-ring" />
              <div className="play-ring" />
              <div className="play-inner" />
            </div>
          </div>
        </div>
        <div className="video-caption">{t("caption")}</div>
      </div>
    </div>
  );
}
