"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
 
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaWhatsapp,
  FaClock,
} from "react-icons/fa";

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  const courseLinks = [
    { label: "Allemand A1", href: `/${locale}/nos-cours#a1` },
    { label: "Allemand A2", href: `/${locale}/nos-cours#a2` },
    { label: "Allemand B1", href: `/${locale}/nos-cours#b1` },
    { label: "Allemand B2", href: `/${locale}/nos-cours#b2` },
    { label: "Allemand C1", href: `/${locale}/nos-cours#c1` },
    { label: "Préparation examens", href: `/${locale}/preparation-examens` },
  ];

  const quickLinks = [
    { label: t("nav.home"), href: `/${locale}` },
    { label: t("nav.about"), href: `/${locale}/a-propos` },
    { label: t("nav.services"), href: `/${locale}/services` },
    { label: t("nav.offers"), href: `/${locale}/offres-speciales` },
    { label: t("nav.faq"), href: `/${locale}/faq` },
    { label: t("nav.contact"), href: `/${locale}/contact` },
    { label: "S'inscrire", href: `/${locale}/inscription` },
  ];

  return (
    <footer className="bg-ids-black text-white">
      <div className="container-ids py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Colonne 1 — Identité */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              
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
              <p className="font-display font-bold text-white text-sm leading-tight uppercase tracking-wide">
                Institut für die
                <br />
                Deutsche Sprache
              </p>
              <p className="text-ids-red text-xs font-semibold mt-0.5">
                Lernen. Verstehen. Erfolgreich sein.
              </p>
            </div>
          </Link>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Centre de formation en langue allemande basé à Yaoundé, Cameroun.
              De A1 à l&apos;Allemagne, nous vous accompagnons.
            </p>
          
          </div>

          {/* Colonne 2 — Liens rapides */}
          <div>
            <h3 className="font-display font-bold text-ids-gold text-base mb-5 uppercase tracking-wide">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-ids-gold transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-ids-red flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — Nos cours */}
          <div>
            <h3 className="font-display font-bold text-ids-gold text-base mb-5 uppercase tracking-wide">
              {t("footer.ourCourses")}
            </h3>
            <ul className="space-y-2.5">
              {courseLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-ids-gold transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-ids-red flex-shrink-0" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 — Contact */}
          <div>
            <h3 className="font-display font-bold text-ids-gold text-base mb-5 uppercase tracking-wide">
              {t("footer.contact")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <FaMapMarkerAlt
                  className="text-ids-gold mt-0.5 flex-shrink-0"
                  size={14}
                />
                <span>
                  Carrefour Scalom, Immeuble Africa Finance,
                  <br />
                  Biyem-Assi, Yaoundé, Cameroun
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FaPhone className="text-ids-gold flex-shrink-0" size={13} />
                <a
                  href="tel:+4915732878223"
                  className="hover:text-ids-gold transition-colors"
                >
                  +49 1573 2878223
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FaWhatsapp className="text-ids-gold flex-shrink-0" size={14} />

                <a
                  href="https://wa.me/4915732878223"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ids-gold transition-colors"
                >
                  +49 1573 2878223
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FaEnvelope className="text-ids-gold flex-shrink-0" size={13} />
                <a
                  href="mailto:info@ids-sprachschule.com"
                  className="hover:text-ids-gold transition-colors"
                >
                  info@ids-sprachschule.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <FaClock
                  className="text-ids-gold mt-0.5 flex-shrink-0"
                  size={13}
                />
                <span>Lundi – Samedi : 8h00 – 20h00</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer bas */}
      <div className="border-t border-white/10">
        <div className="container-ids py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>{t("footer.copyright")}</p>
          <div className="flex gap-4">
            <Link
              href={`/${locale}/mentions-legales`}
              className="hover:text-ids-gold transition-colors"
            >
              {t("footer.legal")}
            </Link>
            <Link
              href={`/${locale}/confidentialite`}
              className="hover:text-ids-gold transition-colors"
            >
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
