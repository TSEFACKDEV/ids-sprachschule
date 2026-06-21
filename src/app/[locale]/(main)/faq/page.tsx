"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { FaChevronDown } from "react-icons/fa";

export default function FAQPage() {
  const t = useTranslations("faq");
  const allItems = t.raw("items") as { q: string; a: string }[];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      <div className="bg-ids-black py-20 text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">{t("pageTitle")}</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("pageSubtitle")}</p>
      </div>

      <section className="section-padding bg-ids-gray">
        <div className="container-ids max-w-3xl mx-auto">
          <div className="space-y-3">
            {allItems.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-xl overflow-hidden shadow-sm">
                <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-ids-black text-sm sm:text-base pr-4 leading-snug">{item.q}</span>
                  <motion.span animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex-shrink-0 text-ids-red">
                    <FaChevronDown size={14} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                      <div className="px-6 pb-6 border-t border-gray-100">
                        <p className="text-gray-600 text-sm leading-relaxed pt-4">{item.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-ids-black rounded-2xl p-8 text-center">
            <p className="font-display text-xl font-bold text-white mb-3">{t("notFoundTitle")}</p>
            <p className="text-gray-400 text-sm mb-6">{t("notFoundDesc")}</p>
            <a href="https://wa.me/4915732878223" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-3 bg-ids-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm">
              {t("notFoundBtn")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}