"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { useT } from "@/lib/useT";

function StatItem({ number, label, suffix, display, delay }: {
  number: number;
  label: string;
  suffix?: string;
  display?: string;
  delay: number;
}) {
  const { count, ref } = useCountUp({ target: number, duration: 1800 });
  const displayValue = display
    ? display
    : number === 0
      ? "0"
      : `${count}${suffix ?? ""}`;

  return (
    <motion.div
      className="tstat"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="tstat-n" ref={ref}>{displayValue}</div>
      <div className="tstat-l">{label}</div>
    </motion.div>
  );
}

export function TrustBar() {
  const t = useT();

  const stats = [
    { number: 500, label: t.trustBar.activeStores, suffix: "+" },
    { number: 3, label: t.trustBar.bdCouriers },
    { number: 6, label: t.trustBar.trackingPlatforms },
    { number: 100, label: t.trustBar.capiAccuracy, suffix: "%" },
    { number: 0, label: t.trustBar.bdtPricing, display: "৳৳৳" },
  ];

  return (
    <div className="trust-bar">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="trust-bar-inner">
          {stats.map((stat, i) => (
            <StatItem key={stat.label} {...stat} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </div>
  );
}
