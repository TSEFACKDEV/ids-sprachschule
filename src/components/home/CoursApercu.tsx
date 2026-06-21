"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { FaArrowRight } from "react-icons/fa";
import SafeImage from "@/components/ui/SafeImage";

export default function CoursApercu() {
  const t = useTranslations("courses");
  const locale = useLocale();
  const items = t.raw("items") as {
    key: string; titre: string; duree: string; desc: string; href: string;
  }[];

  return (
    <section className="section-padding bg-ids-gray">
      <div className="container-ids">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="inline-block text-ids-red text-sm font-bold uppercase tracking-widest mb-3">
            {t("sectionLabel")}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ids-black mb-4">{t("title")}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t("subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((cours, i) => {
            const images: Record<string, string> = {
              "a1-a2": "/images/cours/a1.jpg",
              "b1-b2": "/images/cours/b1.jpg",
              "c1": "/images/cours/c1.jpg",
              "examens": "/images/cours/examens.jpg",
              "intensifs": "/images/cours/intensifs.jpg",
            };
            const href = cours.href.startsWith("/")
              ? `/${locale}${cours.href}`
              : `/${locale}/nos-cours${cours.href}`;

            return (
              <motion.div key={cours.key} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group flex flex-col">
                <div className="relative h-52 overflow-hidden">
                  <SafeImage src={images[cours.key] ?? "/images/cours/a1.jpg"} alt={cours.titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" fallbackText="IDS" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-4 text-white text-xs font-semibold bg-ids-red px-3 py-1 rounded-full">{cours.duree}</span>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-ids-black text-lg mb-2">{cours.titre}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4">{cours.desc}</p>
                  <Link href={href} className="inline-flex items-center gap-2 text-ids-red font-semibold text-sm hover:gap-3 transition-all duration-200">
                    {t("learnMore")} <FaArrowRight size={12} />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
          <Link href={`/${locale}/nos-cours`} className="inline-flex items-center gap-2 px-8 py-4 bg-ids-black text-white font-bold rounded-lg hover:bg-ids-red transition-colors duration-200">
            {t("viewAll")} <FaArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}