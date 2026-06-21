"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import SafeImage from "@/components/ui/SafeImage";

const IMAGES = [
  "/images/hero/cours-allemand.jpg",
  "/images/hero/preparation-examens.jpg",
  "/images/hero/visa-allemagne.jpg",
  "/images/hero/universite.jpg",
  "/images/hero/accueil-allemagne.jpg",
];

export default function HeroSlider() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const slides = t.raw("slides") as { title: string; subtitle: string }[];

  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPlaying, next]);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "min(90vh, 800px)" }}
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* Slides */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <SafeImage
            src={IMAGES[current]}
            alt={slides[current].title}
            fill
            priority={current === 0}
            className="object-cover"
            fallbackBg="#0A0A0A"
            fallbackText={slides[current].title}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Contenu */}
      <div className="relative z-10 h-full flex flex-col justify-center">
        <div className="container-ids">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${current}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="max-w-3xl"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 mb-6"
              >
                <span className="w-8 h-0.5 bg-ids-red" />
                <span className="text-ids-gold text-sm font-semibold tracking-widest uppercase">
                  {t("tagline")}
                </span>
              </motion.div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                {slides[current].title}
                <br />
                <span className="text-ids-gold">{slides[current].subtitle}</span>
              </h1>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  href={`/${locale}/inscription`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-ids-red text-white font-bold rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm shadow-lg"
                >
                  {t("registerBtn")}
                </Link>
                <Link
                  href={`/${locale}/nos-cours`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-transparent text-white font-bold rounded-lg border-2 border-white hover:bg-white hover:text-ids-black transition-colors duration-200 text-sm"
                >
                  {t("coursesBtn")}
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Flèches */}
      <button
        onClick={prev}
        aria-label="Slide précédente"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-ids-red transition-colors duration-200"
      >
        <FaChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        aria-label="Slide suivante"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-ids-red transition-colors duration-200"
      >
        <FaChevronRight size={18} />
      </button>

      {/* Indicateurs */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Aller à la slide ${i + 1}`}
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 h-2 bg-ids-red"
                  : "w-2 h-2 bg-white/50 hover:bg-white"
              }`}
            />
          </button>
        ))}
      </div>

      <div className="absolute bottom-8 right-6 z-20 text-white/50 text-sm font-mono">
        {String(current + 1).padStart(2, "0")} /{" "}
        {String(slides.length).padStart(2, "0")}
      </div>
    </section>
  );
}