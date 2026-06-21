"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FaCheckCircle, FaArrowRight, FaShieldAlt, FaInfoCircle } from "react-icons/fa";

export default function OffresSpecialesPage() {
  const t = useTranslations("offers");
  const locale = useLocale();
  const packs = t.raw("packs") as {
    titre: string; desc: string; prixSemaine: string; prixWeekend: string;
    inclus: string[]; badge: string | null; hasGuarantee: boolean;
  }[];
  const external = t.raw("external") as { titre: string; prix: string; inclus: string[] }[];

  return (
    <div>
      <div className="bg-ids-black py-20 text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">{t("pageTitle")}</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t("pageSubtitle")}</p>
      </div>

      <section className="section-padding bg-ids-gray">
        <div className="container-ids">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {packs.map((pack, i) => (
              <div key={i} className={`bg-white rounded-2xl overflow-hidden shadow-sm relative ${pack.badge ? "ring-2 ring-ids-red" : ""}`}>
                {pack.badge && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <span className="bg-ids-red text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-lg">{t("recommended")}</span>
                  </div>
                )}
                <div className="bg-ids-black p-6">
                  <h2 className="font-display text-2xl font-bold text-white mb-2">{pack.titre}</h2>
                  <p className="text-gray-400 text-sm">{pack.desc}</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { label: t("perWeek"), prix: pack.prixSemaine },
                      { label: t("perWeekend"), prix: pack.prixWeekend },
                    ].map((p) => (
                      <div key={p.label} className="bg-ids-gray rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">{p.label}</p>
                        <p className="font-display font-bold text-ids-black text-lg leading-tight">{p.prix}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-ids-black uppercase tracking-widest mb-4">{t("included")}</p>
                  <ul className="space-y-2 mb-6">
                    {pack.inclus.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                        <FaCheckCircle className="text-ids-red flex-shrink-0 mt-0.5" size={13} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {pack.hasGuarantee && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl mb-6">
                      <FaShieldAlt className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <p className="font-bold text-blue-900 text-sm mb-1">{t("guarantee")}</p>
                        <p className="text-blue-700 text-xs leading-relaxed">{t("guaranteeText")}</p>
                      </div>
                    </div>
                  )}
                  <Link href={`/${locale}/inscription`} className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-ids-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm">
                    {t("chooseBtn")} <FaArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-12">
            <h2 className="font-display text-2xl font-bold text-ids-black text-center mb-2">{t("externalTitle")}</h2>
            <p className="text-center text-gray-500 mb-8 text-sm">{t("externalDesc")}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {external.map((pack) => (
                <div key={pack.titre} className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display text-xl font-bold text-ids-black mb-1">{pack.titre}</h3>
                  <p className="text-ids-red text-sm font-semibold mb-4">{t("externalB2")}</p>
                  <p className="font-display text-3xl font-bold text-ids-black mb-5">{pack.prix}</p>
                  <ul className="space-y-2 mb-6">
                    {pack.inclus.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                        <FaCheckCircle className="text-ids-red flex-shrink-0 mt-0.5" size={13} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/${locale}/contact`} className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-ids-black text-ids-black font-bold rounded-xl hover:bg-ids-black hover:text-white transition-colors text-sm">
                    {t("contactBtn")} <FaArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 p-6 bg-white rounded-2xl border border-gray-200">
            <FaInfoCircle className="text-gray-400 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-gray-500 text-sm leading-relaxed">{t("legalNote")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}