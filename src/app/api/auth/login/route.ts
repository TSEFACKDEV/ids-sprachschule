import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Rate limiting simple en mémoire
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) return false;

  entry.count++;
  return true;
}

function resetRateLimit(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { numeroInscription, password } = body;

    if (!numeroInscription || !password) {
      return NextResponse.json(
        { success: false, error: "Champs manquants." },
        { status: 400 }
      );
    }

    // Recherche de l'étudiant par numéro d'inscription
    const etudiant = await prisma.etudiant.findUnique({
      where: { numeroInscription: numeroInscription.trim().toUpperCase() },
      include: { user: true },
    });

    // Vérifier aussi si c'est un admin (connexion par email)
    let user = etudiant?.user ?? null;
    let isAdmin = false;

    if (!user) {
      // Tentative admin par email
      const adminUser = await prisma.user.findUnique({
        where: { email: numeroInscription.trim().toLowerCase() },
      });
      if (adminUser && adminUser.role === "ADMIN") {
        user = adminUser;
        isAdmin = true;
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: "Identifiants incorrects." },
        { status: 401 }
      );
    }

    resetRateLimit(ip);

    const token = generateToken({
      userId: user.id,
      role: user.role as "ADMIN" | "ETUDIANT",
      mustChangePassword: user.mustChangePassword,
      etudiantId: etudiant?.id,
      numeroInscription: etudiant?.numeroInscription,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        numeroInscription: etudiant?.numeroInscription,
      },
    });

    response.cookies.set("ids_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[LOGIN]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}