"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  FaBars,
  FaTimes,
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaChevronDown,
} from "react-icons/fa";

const LOCALES = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
];

export default function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: `/${locale}`, label: t("nav.home") },
    { href: `/${locale}/a-propos`, label: t("nav.about") },
    { href: `/${locale}/nos-cours`, label: t("nav.courses") },
    { href: `/${locale}/preparation-examens`, label: t("nav.exams") },
    { href: `/${locale}/services`, label: t("nav.services") },
    { href: `/${locale}/offres-speciales`, label: t("nav.offers") },
    { href: `/${locale}/faq`, label: t("nav.faq") },
    { href: `/${locale}/contact`, label: t("nav.contact") },
  ];

  const switchLocale = (newLocale: string) => {
    const withoutLocale = pathname.replace(/^\/(fr|en|de)/, "") || "/";
    window.location.href = `/${newLocale}${withoutLocale}`;
    setLangOpen(false);
  };

 
  return (
    <header className="w-full z-40 top-0 left-0 sticky">
      {/* Barre info supérieure */}
      <div className="bg-ids-black text-white py-2 hidden md:block">
        <div className="container-ids flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <FaMapMarkerAlt className="text-ids-gold" size={11} />
              {t("topBar.address")}
            </span>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1.5">
              <FaClock className="text-ids-gold" size={11} />
              {t("topBar.hours")}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <FaPhone className="text-ids-gold" size={11} />
              {t("topBar.phone")}
            </span>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1.5">
              <FaEnvelope className="text-ids-gold" size={11} />
              {t("topBar.email")}
            </span>
            <span className="text-gray-600">|</span>
            {/* Sélecteur langue */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-white hover:text-ids-gold transition-colors"
              >
                {locale.toUpperCase()}
                <FaChevronDown size={9} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute top-6 right-0 bg-white rounded-lg shadow-lg overflow-hidden z-50 w-20"
                  >
                    {LOCALES.filter((l) => l.code !== locale).map((l) => (
                      <button
                        key={l.code}
                        onClick={() => switchLocale(l.code)}
                        className="w-full text-left px-3 py-2 text-xs text-ids-black hover:bg-ids-gray transition-colors"
                      >
                        {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="text-gray-600">|</span>
           
          </div>
        </div>
      </div>

      {/* Navbar principale */}
      <nav
        className={`bg-white transition-shadow duration-300 ${
          scrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="container-ids flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="relative w-14 h-14 flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="IDS Logo"
                fill
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-ids-black text-sm leading-tight uppercase tracking-wide">
                Institut für die
                <br />
                Deutsche Sprache
              </p>
              <p className="text-ids-red text-xs font-semibold mt-0.5">
                Lernen. Verstehen. Erfolgreich sein.
              </p>
            </div>
          </Link>

          {/* Liens desktop */}
          <div className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${
                      isActive
                        ? "text-ids-red bg-red-50"
                        : "text-ids-black hover:text-ids-red hover:bg-gray-50"
                    }
                  `}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Bouton Espace Étudiant + Burger */}
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/connexion`}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-ids-black text-white text-sm font-semibold rounded-lg hover:bg-ids-red transition-colors duration-200"
            >
              {t("nav.studentSpace")}
            </Link>

            {/* Burger mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="xl:hidden p-2 rounded-lg text-ids-black hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <motion.div
                animate={{ rotate: menuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
              </motion.div>
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="xl:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="container-ids py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-4 py-3 text-sm font-medium text-ids-black hover:text-ids-red hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={`/${locale}/connexion`}
                  className="mt-2 px-4 py-3 bg-ids-black text-white text-sm font-semibold rounded-lg text-center hover:bg-ids-red transition-colors"
                >
                  {t("nav.studentSpace")}
                </Link>
                {/* Langues mobile */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => switchLocale(l.code)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        l.code === locale
                          ? "bg-ids-red text-white"
                          : "bg-gray-100 text-ids-black hover:bg-gray-200"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}