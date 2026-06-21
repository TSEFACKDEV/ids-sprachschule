import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, generateToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Non authentifié." },
        { status: 401 }
      );
    }

    if (!authUser.mustChangePassword) {
      return NextResponse.json(
        { success: false, error: "Action non autorisée." },
        { status: 403 }
      );
    }

    const { newPassword, confirmPassword } = await request.json();

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Champs manquants." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Les mots de passe ne correspondent pas." },
        { status: 400 }
      );
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 chiffre et 1 symbole.",
        },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        password: hashed,
        mustChangePassword: false,
      },
    });

    // Renouveler le token avec mustChangePassword = false
    const newToken = generateToken({
      userId: authUser.userId,
      role: authUser.role,
      mustChangePassword: false,
      etudiantId: authUser.etudiantId,
      numeroInscription: authUser.numeroInscription,
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set("ids_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[CHANGE_PASSWORD]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}