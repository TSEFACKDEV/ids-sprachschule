"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { FaStar, FaChevronLeft, FaChevronRight, FaQuoteLeft } from "react-icons/fa";

const TEMOIGNAGES = [
  {
    nom: "Marie Nguemba",
    titre: "Étudiante en Master, Munich",
    photo: "/images/temoignages/marie.jpg",
    note: 5,
    texte:
      "Grâce à IDS, j'ai obtenu mon B2 et ma pré-inscription à l'Université de Munich. L'accompagnement visa était parfait. Je recommande vivement.",
  },
  {
    nom: "Jean-Paul Biya",
    titre: "Ingénieur en Ausbildung, Berlin",
    photo: "/images/temoignages/jean.jpg",
    note: 5,
    texte:
      "IDS m'a préparé au telc B2 et aidé à trouver un contrat d'Ausbildung en mécatronique. Les enseignants sont excellents et très disponibles.",
  },
  {
    nom: "Sandrine Atangana",
    titre: "Infirmière, Hambourg",
    photo: "/images/temoignages/sandrine.jpg",
    note: 5,
    texte:
      "De A1 à B2 en moins d'un an chez IDS. Aujourd'hui je travaille en Allemagne. Le soutien de l'équipe tout au long du parcours est remarquable.",
  },
  {
    nom: "Emmanuel Fouda",
    titre: "Étudiant en licence, Cologne",
    photo: "/images/temoignages/emmanuel.jpg",
    note: 5,
    texte:
      "Les cours du soir m'ont permis de continuer à travailler tout en apprenant l'allemand. La méthode pédagogique est moderne et efficace.",
  },
];

const PLACEHOLDER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Crect width='150' height='150' fill='%230A0A0A' rx='75'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23D4AF37' font-size='48' font-family='Arial'%3E%3F%3C/text%3E%3C/svg%3E";

export default function Testimonials() {
  const t = useTranslations("testimonials");
  const [current, setCurrent] = useState(0);

  const prev = () =>
    setCurrent((p) => (p - 1 + TEMOIGNAGES.length) % TEMOIGNAGES.length);
  const next = () => setCurrent((p) => (p + 1) % TEMOIGNAGES.length);

  // Afficher 3 témoignages à la fois sur desktop
  const visible = [
    TEMOIGNAGES[current % TEMOIGNAGES.length],
    TEMOIGNAGES[(current + 1) % TEMOIGNAGES.length],
    TEMOIGNAGES[(current + 2) % TEMOIGNAGES.length],
  ];

  return (
    <section className="section-padding bg-ids-white">
      <div className="container-ids">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-ids-red text-sm font-bold uppercase tracking-widest mb-3">
            Témoignages
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ids-black">
            {t("title")}
          </h2>
        </motion.div>

        <div className="relative">
          {/* Desktop : 3 cards */}
          <div className="hidden md:grid grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {visible.map((item, i) => (
                <motion.div
                  key={`${current}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-ids-gray rounded-2xl p-6 flex flex-col"
                >
                  <FaQuoteLeft className="text-ids-red mb-4" size={20} />
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">
                    {item.texte}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={item.photo}
                        alt={item.nom}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_AVATAR;
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-ids-black text-sm">{item.nom}</p>
                      <p className="text-gray-400 text-xs">{item.titre}</p>
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: item.note }).map((_, k) => (
                          <FaStar key={k} className="text-ids-gold" size={10} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile : 1 card */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="bg-ids-gray rounded-2xl p-6"
              >
                <FaQuoteLeft className="text-ids-red mb-4" size={20} />
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {TEMOIGNAGES[current].texte}
                </p>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={TEMOIGNAGES[current].photo}
                      alt={TEMOIGNAGES[current].nom}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PLACEHOLDER_AVATAR;
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-ids-black text-sm">
                      {TEMOIGNAGES[current].nom}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {TEMOIGNAGES[current].titre}
                    </p>
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: TEMOIGNAGES[current].note }).map(
                        (_, k) => (
                          <FaStar key={k} className="text-ids-gold" size={10} />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Contrôles */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border-2 border-ids-black flex items-center justify-center hover:bg-ids-black hover:text-white transition-colors"
            >
              <FaChevronLeft size={14} />
            </button>
            {TEMOIGNAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? "w-6 bg-ids-red" : "bg-gray-300"
                }`}
              />
            ))}
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border-2 border-ids-black flex items-center justify-center hover:bg-ids-black hover:text-white transition-colors"
            >
              <FaChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}