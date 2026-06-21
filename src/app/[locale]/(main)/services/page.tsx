"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { FaLanguage, FaGraduationCap, FaPassport, FaUniversity, FaBriefcase, FaGift, FaCheckCircle, FaArrowRight } from "react-icons/fa";

const ICONS = [FaLanguage, FaGraduationCap, FaPassport, FaUniversity, FaBriefcase, FaGift];

export default function ServicesPage() {
  const t = useTranslations("services");
  const locale = useLocale();
  const items = t.raw("items") as {
    titre: string; sous: string; desc: string; points: string[]; lien?: string;
  }[];

  return (
    <div>
      <div className="bg-ids-black py-20 text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">{t("pageTitle")}</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">{t("pageSubtitle")}</p>
      </div>

      <section className="section-padding bg-ids-gray">
        <div className="container-ids">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {items.map((service, i) => {
              const Icon = ICONS[i] ?? FaLanguage;
              return (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-ids-black flex items-center justify-center flex-shrink-0">
                      <Icon size={24} className="text-ids-gold" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-ids-black leading-tight mb-1">{service.titre}</h2>
                      <span className="text-ids-red text-sm font-semibold">{service.sous}</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">{service.desc}</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-gray-700">
                        <FaCheckCircle className="text-ids-red flex-shrink-0 mt-0.5" size={13} />
                        {point}
                      </li>
                    ))}
                  </ul>
                  {"lien" in service && service.lien && (
                    <Link href={`/${locale}${service.lien}`} className="inline-flex items-center gap-2 text-ids-red font-semibold text-sm hover:gap-3 transition-all">
                      {t("viewOffers")} <FaArrowRight size={12} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-14">
            <p className="text-gray-500 mb-6 text-lg">{t("ctaText")}</p>
            <Link href={`/${locale}/inscription`} className="inline-flex items-center gap-2 px-10 py-4 bg-ids-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-base">
              {t("ctaBtn")} <FaArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}