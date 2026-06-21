import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = [
  "/connexion",
  "/mot-de-passe-oublie",
  "/inscription",
  "/nos-cours",
  "/services",
  "/preparation-examens",
  "/offres-speciales",
  "/a-propos",
  "/faq",
  "/contact",
  "/",
];

function isPublicPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(fr|en|de)/, "") || "/";
  return PUBLIC_PATHS.some(
    (p) => withoutLocale === p || withoutLocale.startsWith(p + "/")
  );
}

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

  // Protection /admin
  if (withoutLocale.startsWith("/admin")) {
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL(`/${locale}/connexion`, request.url)
      );
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
        : `/${locale}/espace-etudiant`;
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return intlResponse ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};