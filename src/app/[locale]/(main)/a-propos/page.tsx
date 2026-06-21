"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { motion } from "motion/react";
import { FaCheckCircle, FaMapMarkerAlt, FaClock, FaArrowRight } from "react-icons/fa";
import SafeImage from "@/components/ui/SafeImage";

export default function AProposPage() {
  const t = useTranslations("about");
  const locale = useLocale();
  const values = t.raw("values") as { title: string; desc: string }[];
  const teamMembers = t.raw("teamMembers") as { nom: string; poste: string }[];

  

  return (
    <div>
      <div className="bg-ids-black py-20 text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">{t("pageTitle")}</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t("pageSubtitle")}</p>
      </div>

      <section className="section-padding bg-ids-white">
        <div className="container-ids">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="text-ids-red text-sm font-bold uppercase tracking-widest mb-3 block">{t("sectionLabel")}</span>
              <h2 className="font-display text-3xl font-bold text-ids-black mb-6">{t("heading")}</h2>
              <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <p>{t("text")}</p>
                <p>{t("text2")}</p>
                <p>{t("text3")}</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="relative h-80 lg:h-[420px] rounded-2xl overflow-hidden shadow-xl">
              <SafeImage src="/images/batiment.jpg" alt="IDS – Yaoundé" fill className="object-cover" fallbackText="IDS Yaoundé" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-ids-black">
        <div className="container-ids">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-12">{t("valuesTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="w-14 h-14 rounded-full bg-ids-red/20 flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle className="text-ids-red" size={22} />
                </div>
                <h3 className="font-display font-bold text-ids-gold text-lg mb-2">{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    

      <section className="section-padding bg-ids-white">
        <div className="container-ids">
          <h2 className="font-display text-3xl font-bold text-ids-black text-center mb-12">{t("locationTitle")}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-ids-red/10 flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-ids-red" size={16} />
                </div>
                <div>
                  <p className="font-bold text-ids-black text-sm mb-1">{t("address")}</p>
                  <p className="text-gray-500 text-sm">{t("addressValue")}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-ids-red/10 flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-ids-red" size={16} />
                </div>
                <div>
                  <p className="font-bold text-ids-black text-sm mb-1">{t("hours")}</p>
                  <p className="text-gray-500 text-sm">{t("hoursValue")}<br />{t("closed")}</p>
                </div>
              </div>
              <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 px-6 py-3 bg-ids-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm">
                {t("contactBtn")} <FaArrowRight size={12} />
              </Link>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg h-72 lg:h-80">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3979.968!2d11.507!3d3.848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBiyem-Assi%2C%20Yaound%C3%A9%2C%20Cameroun!5e0!3m2!1sfr!2scm!4v1700000000000" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="IDS – Localisation" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}