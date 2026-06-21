"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { FaCheckCircle, FaArrowRight } from "react-icons/fa";
import SafeImage from "@/components/ui/SafeImage";

type Niveau = "tous" | "A1" | "A2" | "B1" | "B2" | "C1";

const PRIX: Record<string, { prixFCFA: string; prixEUR: string }[]> = {
  A1: [{ prixFCFA: "85 000 FCFA", prixEUR: "130 €" }, { prixFCFA: "85 000 FCFA", prixEUR: "130 €" }, { prixFCFA: "90 000 FCFA", prixEUR: "137 €" }, { prixFCFA: "90 000 FCFA", prixEUR: "137 €" }, { prixFCFA: "75 000 FCFA", prixEUR: "115 €" }],
  A2: [{ prixFCFA: "85 000 FCFA", prixEUR: "130 €" }, { prixFCFA: "85 000 FCFA", prixEUR: "130 €" }, { prixFCFA: "90 000 FCFA", prixEUR: "137 €" }, { prixFCFA: "90 000 FCFA", prixEUR: "137 €" }, { prixFCFA: "75 000 FCFA", prixEUR: "115 €" }],
  B1: [{ prixFCFA: "95 000 FCFA", prixEUR: "145 €" }, { prixFCFA: "95 000 FCFA", prixEUR: "145 €" }, { prixFCFA: "100 000 FCFA", prixEUR: "152 €" }, { prixFCFA: "100 000 FCFA", prixEUR: "152 €" }, { prixFCFA: "85 000 FCFA", prixEUR: "130 €" }],
  B2: [{ prixFCFA: "100 000 FCFA", prixEUR: "152 €" }, { prixFCFA: "100 000 FCFA", prixEUR: "152 €" }, { prixFCFA: "105 000 FCFA", prixEUR: "160 €" }, { prixFCFA: "105 000 FCFA", prixEUR: "160 €" }, { prixFCFA: "90 000 FCFA", prixEUR: "137 €" }],
  C1: [{ prixFCFA: "110 000 FCFA", prixEUR: "168 €" }, { prixFCFA: "110 000 FCFA", prixEUR: "168 €" }, { prixFCFA: "115 000 FCFA", prixEUR: "175 €" }, { prixFCFA: "115 000 FCFA", prixEUR: "175 €" }, { prixFCFA: "100 000 FCFA", prixEUR: "152 €" }],
};

const IMAGES: Record<string, string> = { a1: "/images/cours/a1.jpg", a2: "/images/cours/a2.jpg", b1: "/images/cours/b1.jpg", b2: "/images/cours/b2.jpg", c1: "/images/cours/c1.jpg" };

export default function CoursPageContent() {
  const t = useTranslations("courses");
  const locale = useLocale();
  const [filter, setFilter] = useState<Niveau>("tous");

  const levels = t.raw("levels") as {
    id: string; niveau: string; titre: string; description: string;
    duree: string; prepGratuite: boolean; competences: string[];
  }[];
  const formats = t.raw("formats") as { label: string }[];
  const niveauxFilter: { value: Niveau; label: string }[] = [
    { value: "tous", label: t("allLevels") },
    { value: "A1", label: "A1" }, { value: "A2", label: "A2" },
    { value: "B1", label: "B1" }, { value: "B2", label: "B2" }, { value: "C1", label: "C1" },
  ];

  const filtered = filter === "tous" ? levels : levels.filter((c) => c.niveau === filter);

  return (
    <section className="section-padding bg-ids-gray">
      <div className="container-ids">
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {niveauxFilter.map((n) => (
            <button key={n.value} onClick={() => setFilter(n.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${filter === n.value ? "bg-ids-red text-white" : "bg-white text-ids-black border border-gray-200 hover:border-ids-red hover:text-ids-red"}`}>
              {n.label}
            </button>
          ))}
        </div>

        <div className="space-y-10">
          {filtered.map((cours, i) => {
            const prixList = PRIX[cours.niveau] ?? PRIX.A1;
            return (
              <motion.div key={cours.id} id={cours.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-auto min-h-64">
                    <SafeImage src={IMAGES[cours.id] ?? "/images/cours/a1.jpg"} alt={cours.titre} fill className="object-cover" fallbackText={cours.niveau} />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent lg:bg-gradient-to-t" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-ids-red text-white font-bold text-lg px-4 py-2 rounded-lg">{cours.niveau}</span>
                    </div>
                    {cours.prepGratuite && (
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-ids-gold text-ids-black font-bold text-xs px-3 py-1.5 rounded-full">{t("prepExamIncluded")}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 lg:p-8 flex flex-col">
                    <h2 className="font-display text-2xl font-bold text-ids-black mb-3">{cours.titre}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-5">{cours.description}</p>
                    <div className="mb-5">
                      <p className="text-xs font-bold text-ids-black uppercase tracking-widest mb-3">{t("whatYouLearn")}</p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {cours.competences.map((comp) => (
                          <li key={comp} className="flex items-start gap-2 text-xs text-gray-600">
                            <FaCheckCircle className="text-ids-red flex-shrink-0 mt-0.5" size={12} />
                            {comp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-2 mb-5 p-3 bg-ids-gray rounded-lg">
                      <span className="text-xs font-bold text-ids-black">{t("duration")} :</span>
                      <span className="text-xs text-gray-600">{cours.duree}</span>
                    </div>
                    <div className="mb-6">
                      <p className="text-xs font-bold text-ids-black uppercase tracking-widest mb-3">{t("formatsAvailable")}</p>
                      <div className="space-y-2">
                        {formats.map((fmt, j) => (
                          <div key={fmt.label} className="flex items-center justify-between text-xs py-2 border-b border-gray-100 last:border-0">
                            <span className="text-gray-600">{fmt.label}</span>
                            <div className="text-right">
                              <span className="font-bold text-ids-black">{prixList[j]?.prixFCFA}</span>
                              <span className="text-gray-400 ml-2">/ {prixList[j]?.prixEUR}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link href={`/${locale}/inscription`} className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-ids-red text-white font-bold rounded-xl hover:bg-red-700 transition-colors mt-auto text-sm">
                      {t("registerLevel")} <FaArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}