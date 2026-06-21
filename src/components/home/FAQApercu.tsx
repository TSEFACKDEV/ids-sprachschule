"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { FaChevronDown, FaArrowRight } from "react-icons/fa";

export default function FAQApercu() {
  const t = useTranslations("faq");
  const locale = useLocale();
  const items = t.raw("items") as { q: string; a: string }[];
  const preview = items.slice(0, 4);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="section-padding bg-ids-gray">
      <div className="container-ids">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="inline-block text-ids-red text-sm font-bold uppercase tracking-widest mb-3">FAQ</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ids-black">{t("title")}</h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {preview.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-ids-black text-sm sm:text-base pr-4">{item.q}</span>
                <motion.span animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex-shrink-0 text-ids-red">
                  <FaChevronDown size={14} />
                </motion.span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <div className="px-5 pb-5 border-t border-gray-100">
                      <p className="text-gray-600 text-sm leading-relaxed pt-4">{item.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
          <Link href={`/${locale}/faq`} className="inline-flex items-center gap-2 text-ids-red font-semibold hover:gap-3 transition-all duration-200">
            {t("viewAll")} <FaArrowRight size={13} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}