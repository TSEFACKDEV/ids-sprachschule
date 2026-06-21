"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import Image from "next/image";

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