"use client";

import { useTranslations } from "next-intl";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

const STATS = [
  { value: 2000, suffix: "+", labelKey: "students" },
  { value: 95, suffix: "%", labelKey: "success" },
  { value: 15, suffix: "+", labelKey: "teachers" },
  { value: 10, suffix: "+", labelKey: "nationalities" },
];

function AnimatedNumber({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, target, {
      duration: 2,
      ease: "easeOut",
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [isInView, count, rounded, target]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const t = useTranslations("stats");

  return (
    <section className="section-padding bg-ids-black">
      <div className="container-ids">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="font-display text-4xl sm:text-5xl font-bold text-ids-gold mb-3">
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">
                {t(stat.labelKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}