import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const niveau = searchParams.get("niveau") ?? undefined;

    const etudiants = await prisma.etudiant.findMany({
      where: {
        statut: "VALIDE",
        ...(niveau ? { niveauAllemand: niveau as "A1" | "A2" | "B1" | "B2" | "C1" } : {}),
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        numeroInscription: true,
        niveauAllemand: true,
        photoUrl: true,
      },
      orderBy: { nom: "asc" },
    });

    return NextResponse.json({ success: true, data: etudiants });
  } catch (error) {
    console.error("[ETUDIANTS_VALIDES]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}