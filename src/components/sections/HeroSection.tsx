"use client";

import { Link } from "@/i18n/routing";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useCountUp } from "@/hooks/useCountUp";
import { useTranslations } from "next-intl";

const ease = [0.22, 1, 0.36, 1] as const;
const chartBarHeights = ["38%", "52%", "46%", "68%", "60%", "82%", "100%"];

function DashStat({
  target,
  label,
  className,
  formatter,
}: {
  target: number;
  label: string;
  className: string;
  formatter?: (count: number) => string;
}) {
  const { count, ref } = useCountUp({ target, duration: 1500 });
  const display = formatter ? formatter(count) : String(count);
  return (
    <div className="ms">
      <div className="ms-l">{label}</div>
      <div className={`ms-v ${className}`} ref={ref}>{display}</div>
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("hero");
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInView = useInView(chartRef, { once: true, amount: 0.3 });

  return (
    <section className="hero min-h-screen bg-[--hero-g] flex items-center py-[110px] pb-20 relative overflow-hidden">
      <div className="hero-mesh absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 opacity-[.035] bg-[radial-gradient(circle,var(--accent)_1.5px,transparent_1.5px)] bg-[length:40px_40px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-7 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
            >
              <div className="hero-eyebrow">
                <div className="eyebrow-dot" />
                {t("eyebrow")}
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08, ease }}
              className="font-dm-sans text-[clamp(34px,4.5vw,58px)] font-black leading-[1.06] tracking-[-2px] text-foreground mb-5"
            >
              {t("title1")}{" "}
              <span className="text-accent relative inline-block after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[3px] after:bg-accent after:rounded-[3px] after:scale-x-0 after:origin-left after:animate-[underlineIn_.5s_.8s_cubic-bezier(.22,1,.36,1)_forwards]">
                {t("titleAccent")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16, ease }}
              className="hero-sub"
            >
              {t("subtitle")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.24, ease }}
              className="flex gap-3 flex-wrap mb-9"
            >
              <Link href="/pricing" className="btn btn-primary btn-lg">{t("ctaPrimary")}</Link>
              <Link href="/features" className="btn btn-outline btn-lg">{t("ctaSecondary")}</Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.32, ease }}
              className="flex flex-wrap gap-5"
            >
              <div className="trust-pill"><div className="trust-dot" />{t("pill1")}</div>
              <div className="trust-pill"><div className="trust-dot" />{t("pill2")}</div>
              <div className="trust-pill"><div className="trust-dot" />{t("pill3")}</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.16, ease }}
            className="hidden lg:block"
          >
            <div className="dash-mock">
              <div className="mock-top">
                <div className="mock-circles">
                  <div className="mc" style={{ background: "#FF5F57" }} />
                  <div className="mc" style={{ background: "#FFBD2E" }} />
                  <div className="mc" style={{ background: "#28C840" }} />
                </div>
                <div className="mock-title-bar">woobooster-dashboard.php</div>
              </div>
              <div className="mock-body">
                <div className="mstats">
                  <DashStat target={42} label={t("dashRevenue")} className="g" formatter={(c) => `৳${c}L`} />
                  <DashStat target={834} label={t("dashOrders")} className="b" />
                  <DashStat target={12} label={t("dashBlocked")} className="r" />
                </div>
                <div className="chart-box">
                  <div className="chart-lbl">{t("chartLabel")}</div>
                  <div className="chart-bars" ref={chartRef}>
                    {chartBarHeights.map((height, i) => (
                      <motion.div
                        key={i}
                        className={`cb ${i === 4 ? "green" : "blue"} ${i < 4 ? "dim" : ""}`}
                        style={{ height, transformOrigin: "bottom" }}
                        initial={{ scaleY: 0 }}
                        animate={chartInView ? { scaleY: 1 } : { scaleY: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      />
                    ))}
                  </div>
                </div>
                <div className="order-list">
                  <div className="orow">
                    <span className="oid">#8821</span>
                    <span className="text-muted text-[9.5px]">Steadfast</span>
                    <span className="badge bd-ok">{t("statusDelivered")}</span>
                  </div>
                  <div className="orow">
                    <span className="oid">#8820</span>
                    <span className="text-muted text-[9.5px]">Pathao</span>
                    <span className="badge bd-sh">{t("statusTransit")}</span>
                  </div>
                  <div className="orow">
                    <span className="oid">#8819</span>
                    <span className="text-muted text-[9.5px]">RedX</span>
                    <span className="badge bd-rt">{t("statusReturned")}</span>
                  </div>
                  <div className="orow">
                    <span className="oid">#8818</span>
                    <span className="text-muted text-[9.5px]">Steadfast</span>
                    <span className="badge bd-pn">{t("statusPending")}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
