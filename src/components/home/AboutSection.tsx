"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";
import SafeImage from "@/components/ui/SafeImage";

export default function AboutSection() {
  const t = useTranslations("about");
  const locale = useLocale();
  const points = t.raw("points") as string[];
  const ctaPoints = t.raw("ctaPoints") as string[];

  return (
    <section className="section-padding bg-ids-white">
      <div className="container-ids">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:col-span-1">
            <span className="inline-block text-ids-red text-sm font-bold uppercase tracking-widest mb-3">{t("sectionLabel")}</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ids-black mb-6 leading-tight">{t("title")}</h2>
            <p className="text-gray-600 leading-relaxed mb-6 text-sm sm:text-base">{t("text")}</p>
            <ul className="space-y-3 mb-8">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <FaCheckCircle className="text-ids-red flex-shrink-0 mt-0.5" size={16} />
                  <span className="text-gray-700 text-sm">{point}</span>
                </li>
              ))}
            </ul>
            <Link href={`/${locale}/a-propos`} className="inline-flex items-center gap-2 px-6 py-3 bg-ids-red text-white font-bold rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm">
              {t("learnMore")} <FaArrowRight size={12} />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="relative h-80 sm:h-96 lg:h-[480px] rounded-2xl overflow-hidden shadow-2xl lg:col-span-1">
            <SafeImage src="/images/batiment.jpg" alt="Institut IDS" fill className="object-cover" fallbackText="IDS" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4">
                <p className="font-display font-bold text-ids-black text-sm">Institut für die Deutsche Sprache</p>
                <p className="text-gray-500 text-xs mt-1">Carrefour Scalom, Biyem-Assi, Yaoundé</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className="lg:col-span-1">
            <div className="bg-ids-black rounded-2xl p-8 text-white h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-1 bg-ids-red mb-6" />
                <h3 className="font-display text-2xl font-bold mb-4 leading-tight">
                  {t("ctaTitle")}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">{t("ctaDesc")}</p>
                <ul className="space-y-3 mb-8">
                  {ctaPoints.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-ids-red flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={`/${locale}/inscription`} className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-ids-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors duration-200 text-sm">
                {t("ctaBtn")} <FaArrowRight size={13} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}