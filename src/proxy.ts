import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const intlResponse = intlMiddleware(request);

  const token = request.cookies.get("ids_token")?.value;
  const payload = token ? await verifyTokenEdge(token) : null;

  const withoutLocale = pathname.replace(/^\/(fr|en|de)/, "") || "/";
  const locale = pathname.match(/^\/(fr|en|de)/)?.[1] ?? "fr";

  // Protection /admin (ADMIN et SECRETAIRE).
  // La secrétaire n'a que deux restrictions : pas d'accès au tableau de bord
  // (page /admin elle-même) et pas de suppression (gérée au niveau des API).
  if (withoutLocale.startsWith("/admin")) {
    if (!payload || (payload.role !== "ADMIN" && payload.role !== "SECRETAIRE")) {
      return NextResponse.redirect(
        new URL(`/${locale}/connexion`, request.url)
      );
    }
    if (withoutLocale === "/admin" && payload.role === "SECRETAIRE") {
      return NextResponse.redirect(new URL(`/${locale}/admin/etudiants`, request.url));
    }
    return intlResponse ?? NextResponse.next();
  }

  // Protection /espace-etudiant
  if (withoutLocale.startsWith("/espace-etudiant")) {
    if (!payload) {
      return NextResponse.redirect(
        new URL(`/${locale}/connexion`, request.url)
      );
    }
    if (payload.mustChangePassword) {
      return NextResponse.redirect(
        new URL(`/${locale}/changer-mot-de-passe`, request.url)
      );
    }
    return intlResponse ?? NextResponse.next();
  }

  // Protection /changer-mot-de-passe
  if (withoutLocale.startsWith("/changer-mot-de-passe")) {
    if (!payload) {
      return NextResponse.redirect(
        new URL(`/${locale}/connexion`, request.url)
      );
    }
    if (!payload.mustChangePassword) {
      return NextResponse.redirect(
        new URL(`/${locale}/espace-etudiant`, request.url)
      );
    }
    return intlResponse ?? NextResponse.next();
  }

  // Redirection si déjà connecté sur /connexion
  if (withoutLocale === "/connexion" && payload) {
    if (payload.mustChangePassword) {
      return NextResponse.redirect(
        new URL(`/${locale}/changer-mot-de-passe`, request.url)
      );
    }
    const dest =
      payload.role === "ADMIN"
        ? `/${locale}/admin`
        : payload.role === "SECRETAIRE"
        ? `/${locale}/admin/etudiants`
        : `/${locale}/espace-etudiant`;
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return intlResponse ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};