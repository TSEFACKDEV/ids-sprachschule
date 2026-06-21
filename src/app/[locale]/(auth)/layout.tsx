"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-ids-gray flex flex-col">
      {/* Header minimal */}
      <header className="bg-ids-black py-4">
        <div className="container-ids flex justify-center">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ids-gold flex items-center justify-center flex-shrink-0">
              <span className="text-ids-black font-display font-bold text-sm">
                IDS
              </span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                Institut für die Deutsche Sprache
              </p>
              <p className="text-ids-red text-xs">
                Lernen. Verstehen. Erfolgreich sein.
              </p>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        {children}
      </main>

      <footer className="bg-ids-black py-4 text-center text-gray-500 text-xs">
        © 2025 Institut für die Deutsche Sprache – Yaoundé, Cameroun
      </footer>
    </div>
  );
}