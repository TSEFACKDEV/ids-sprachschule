import { NextResponse } from "next/server";
import { getAuthUser, generateTempPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";
import bcrypt from "bcryptjs";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const { id } = await params;

    const etudiant = await prisma.etudiant.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!etudiant || !etudiant.user) {
      return NextResponse.json(
        { success: false, error: "Étudiant introuvable ou sans compte." },
        { status: 404 }
      );
    }

    const motDePasseTemp = generateTempPassword();
    const hashed = await bcrypt.hash(motDePasseTemp, 12);

    await prisma.user.update({
      where: { id: etudiant.user.id },
      data: { password: hashed, mustChangePassword: true },
    });

    await sendPasswordResetEmail(
      etudiant.email,
      etudiant.prenom,
      etudiant.numeroInscription,
      motDePasseTemp
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[RESET_PASSWORD]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}