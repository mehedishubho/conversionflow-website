"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useCountUp } from "@/hooks/useCountUp";

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
      <div className={`ms-v ${className}`} ref={ref}>
        {display}
      </div>
    </div>
  );
}

export function HeroSection() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInView = useInView(chartRef, { once: true, amount: 0.3 });

  return (
    <section className="hero min-h-screen bg-[--hero-g] flex items-center py-[110px] pb-20 relative overflow-hidden">
      <div className="hero-mesh absolute inset-0 pointer-events-none" />
      <div className="absolute inset-0 opacity-[.035] bg-[radial-gradient(circle,var(--accent)_1.5px,transparent_1.5px)] bg-[length:40px_40px] pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-7 relative z-10">
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
                v0.0.14 — Analytics Suite Live
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08, ease }}
              className="font-syne text-[clamp(34px,4.5vw,58px)] font-black leading-[1.06] tracking-[-2px] text-foreground mb-5"
            >
              Run Your WooCommerce Store on{" "}
              <span className="text-accent relative inline-block after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[3px] after:bg-accent after:rounded-[3px] after:scale-x-0 after:origin-left after:animate-[underlineIn_.5s_.8s_cubic-bezier(.22,1,.36,1)_forwards]">
                Autopilot
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16, ease }}
              className="hero-sub"
            >
              Automated courier sync with Steadfast, Pathao &amp; RedX. Meta CAPI
              tracking that survives iOS 14. Fraud Shield. Real-time analytics.
              Built for Bangladeshi WooCommerce sellers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.24, ease }}
              className="flex gap-3 flex-wrap mb-9"
            >
              <Link href="/pricing" className="btn btn-primary btn-lg">
                Get WooBooster — ৳3,499
              </Link>
              <Link href="/features" className="btn btn-outline btn-lg">
                See Features
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.32, ease }}
              className="flex flex-wrap gap-5"
            >
              <div className="trust-pill">
                <div className="trust-dot" />
                500+ Active Stores
              </div>
              <div className="trust-pill">
                <div className="trust-dot" />
                30-Day Money Back
              </div>
              <div className="trust-pill">
                <div className="trust-dot" />
                bKash &amp; Nagad Ready
              </div>
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
                  <DashStat
                    target={42}
                    label="Revenue"
                    className="g"
                    formatter={(count) => `৳${count}L`}
                  />
                  <DashStat target={834} label="Orders" className="b" />
                  <DashStat target={12} label="Blocked" className="r" />
                </div>
                <div className="chart-box">
                  <div className="chart-lbl">Revenue Trend — 7 Days</div>
                  <div className="chart-bars" ref={chartRef}>
                    {chartBarHeights.map((height, i) => (
                      <motion.div
                        key={i}
                        className={`cb ${i === 4 ? "green" : "blue"} ${i < 4 ? "dim" : ""}`}
                        style={{ height, transformOrigin: "bottom" }}
                        initial={{ scaleY: 0 }}
                        animate={chartInView ? { scaleY: 1 } : { scaleY: 0 }}
                        transition={{
                          duration: 0.6,
                          delay: i * 0.08,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="order-list">
                  <div className="orow">
                    <span className="oid">#8821</span>
                    <span className="text-muted text-[9.5px]">Steadfast</span>
                    <span className="badge bd-ok">Delivered</span>
                  </div>
                  <div className="orow">
                    <span className="oid">#8820</span>
                    <span className="text-muted text-[9.5px]">Pathao</span>
                    <span className="badge bd-sh">In Transit</span>
                  </div>
                  <div className="orow">
                    <span className="oid">#8819</span>
                    <span className="text-muted text-[9.5px]">RedX</span>
                    <span className="badge bd-rt">Returned</span>
                  </div>
                  <div className="orow">
                    <span className="oid">#8818</span>
                    <span className="text-muted text-[9.5px]">Steadfast</span>
                    <span className="badge bd-pn">Pending</span>
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
