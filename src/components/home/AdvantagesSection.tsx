"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import {
  FaChalkboardTeacher,
  FaAward,
  FaPassport,
  FaLaptop,
  FaUserCheck,
} from "react-icons/fa";

const ICONS = [
  FaChalkboardTeacher,
  FaAward,
  FaPassport,
  FaLaptop,
  FaUserCheck,
];

export default function AdvantagesSection() {
  const t = useTranslations("advantages");
  const items = t.raw("items") as { title: string; desc: string }[];

  return (
    <section className="section-padding bg-ids-white border-b border-gray-100">
      <div className="container-ids">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-display text-2xl sm:text-3xl font-bold text-center text-ids-black mb-12"
        >
          {t("title")}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-ids-gray hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-ids-black flex items-center justify-center mb-4 group-hover:bg-ids-red transition-colors duration-300">
                  <Icon size={28} className="text-ids-gold" />
                </div>
                <h3 className="font-display font-bold text-ids-black text-base mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}