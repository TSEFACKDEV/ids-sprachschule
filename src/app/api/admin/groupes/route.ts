import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const groupes = await prisma.groupe.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        etudiants: {
          include: {
            etudiant: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                numeroInscription: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: groupes });
  } catch (error) {
    console.error("[GROUPES_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const { nom, niveau, type, heureDebut, heureFin, salle, enseignant, etudiantIds } =
      await request.json();

    if (!nom || !niveau || !type || !heureDebut || !heureFin || !salle || !enseignant) {
      return NextResponse.json(
        { success: false, error: "Champs obligatoires manquants." },
        { status: 400 }
      );
    }

    const groupe = await prisma.groupe.create({
      data: {
        nom,
        niveau,
        type,
        heureDebut,
        heureFin,
        salle,
        enseignant,
        etudiants: {
          create: (etudiantIds ?? []).map((etudiantId: string) => ({ etudiantId })),
        },
      },
      include: { etudiants: { include: { etudiant: true } } },
    });

    return NextResponse.json({ success: true, data: groupe }, { status: 201 });
  } catch (error) {
    console.error("[GROUPES_POST]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}