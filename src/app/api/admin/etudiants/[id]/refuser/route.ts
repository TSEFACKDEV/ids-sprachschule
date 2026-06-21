import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendRefusEmail } from "@/lib/mailer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const { id } = await params;
    const { motif } = await request.json();

    if (!motif || motif.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Le motif de refus est obligatoire." },
        { status: 400 }
      );
    }

    const etudiant = await prisma.etudiant.findUnique({ where: { id } });

    if (!etudiant) {
      return NextResponse.json({ success: false, error: "Étudiant introuvable." }, { status: 404 });
    }

    await prisma.etudiant.update({
      where: { id },
      data: { statut: "REFUSE" },
    });

    await sendRefusEmail(etudiant.email, etudiant.prenom, motif.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REFUSER]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}