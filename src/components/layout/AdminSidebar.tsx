"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FaTachometerAlt, FaUsers, FaLayerGroup, FaGraduationCap,
  FaFileInvoiceDollar, FaEnvelope, FaSignOutAlt, FaBars, FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Image from "next/image";

export default function AdminSidebar() {
  const t = useTranslations("admin");
  const ta = useTranslations("auth");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: `/${locale}/admin`, label: t("dashboard"), icon: FaTachometerAlt },
    { href: `/${locale}/admin/etudiants`, label: t("students"), icon: FaUsers },
    { href: `/${locale}/admin/groupes`, label: t("groups"), icon: FaLayerGroup },
    { href: `/${locale}/admin/examens`, label: t("exams"), icon: FaGraduationCap },
    { href: `/${locale}/admin/factures`, label: t("invoices"), icon: FaFileInvoiceDollar },
    { href: `/${locale}/admin/messagerie`, label: t("messages"), icon: FaEnvelope },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success(ta("logout"));
    router.push(`/${locale}/connexion`);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
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
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === `/${locale}/admin`
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? "bg-ids-red text-white shadow-lg" : "text-gray-400 hover:bg-white/10 hover:text-white"}`}>
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
          <FaSignOutAlt size={15} />
          {ta("logout")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-ids-black text-white rounded-lg shadow-lg">
        <FaBars size={20} />
      </button>
      <aside className="hidden lg:flex flex-col w-64 bg-ids-black fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed inset-y-0 left-0 w-64 bg-ids-black z-50 lg:hidden">
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white">
                <FaTimes size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}