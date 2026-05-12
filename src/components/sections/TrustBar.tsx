"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

const stats = [
  { number: 500, label: "Active Stores", suffix: "+" },
  { number: 3, label: "BD Couriers" },
  { number: 6, label: "Tracking Platforms" },
  { number: 100, label: "CAPI Accuracy", suffix: "%" },
  { number: 0, label: "BDT Pricing", display: "৳৳৳" },
];

function StatItem({
  stat,
  delay,
}: {
  stat: (typeof stats)[number];
  delay: number;
}) {
  const { count, ref } = useCountUp({ target: stat.number, duration: 1800 });

  const displayValue = stat.display
    ? stat.display
    : stat.number === 0
      ? "0"
      : `${count}${stat.suffix ?? ""}`;

  return (
    <motion.div
      className="tstat"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="tstat-n" ref={ref}>
        {displayValue}
      </div>
      <div className="tstat-l">{stat.label}</div>
    </motion.div>
  );
}

export function TrustBar() {
  return (
    <div className="trust-bar">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="trust-bar-inner">
          {stats.map((stat, i) => (
            <StatItem key={stat.label} stat={stat} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </div>
  );
}
