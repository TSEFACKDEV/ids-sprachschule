"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { FaCheckCircle, FaArrowRight, FaInfoCircle } from "react-icons/fa";

export default function PreparationExamensPage() {
  const t = useTranslations("exams");
  const locale = useLocale();
  const examItems = t.raw("examItems") as {
    type: string;
    niveaux: { niveau: string; tarif: string; gratuit: boolean; desc: string }[];
  }[];
  const included = t.raw("included") as string[];

  return (
    <div>
      <div className="bg-ids-black py-20 text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">{t("pageTitle")}</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t("pageSubtitle")}</p>
      </div>

      <section className="section-padding bg-ids-gray">
        <div className="container-ids">
          <div className="bg-ids-black rounded-2xl p-8 mb-12 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-display text-2xl font-bold mb-4">{t("howTitle")}</h2>
                <p className="text-gray-400 leading-relaxed mb-4">{t("howText")}</p>
                <div className="flex items-start gap-3 p-4 bg-white/10 rounded-xl">
                  <FaInfoCircle className="text-ids-gold flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-gray-300 text-sm">{t("freeNote")}</p>
                </div>
              </div>
              <div>
                <p className="text-ids-gold font-bold uppercase text-xs tracking-widest mb-4">{t("includedTitle")}</p>
                <ul className="space-y-2">
                  {included.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                      <FaCheckCircle className="text-ids-red flex-shrink-0 mt-0.5" size={13} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {examItems.map((examen) => (
              <div key={examen.type} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-ids-black px-8 py-4 flex items-center gap-4">
                  <h2 className="font-display text-2xl font-bold text-ids-gold">{examen.type}</h2>
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-gray-400 text-sm">
                    {examen.niveaux.length} {examen.niveaux.length > 1 ? t("levelsPlural") : t("levels")}
                  </span>
                </div>
                <div className={`grid grid-cols-1 ${examen.niveaux.length > 1 ? "md:grid-cols-2" : ""} gap-0 divide-x divide-gray-100`}>
                  {examen.niveaux.map((n) => (
                    <div key={n.niveau} className="p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="inline-block bg-ids-red text-white font-bold px-3 py-1 rounded-lg text-sm mb-2">
                            {examen.type} {n.niveau}
                          </span>
                          {n.gratuit && (
                            <span className="ml-2 inline-block bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full text-xs">
                              {t("freeForIDS")}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl font-bold text-ids-black">{n.tarif}</p>
                          <p className="text-gray-400 text-xs">{t("perMonth")}</p>
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link href={`/${locale}/inscription`} className="inline-flex items-center gap-2 px-10 py-4 bg-ids-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-base">
              {t("ctaBtn")} <FaArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}