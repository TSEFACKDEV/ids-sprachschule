import { NextResponse } from "next/server";
import { getAuthUser, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !isStaff(authUser.role)) {
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
                typeCours: true,
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
    if (!authUser || !isStaff(authUser.role)) {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const {
      nom, niveau, type, heureDebut, heureFin, salle, enseignant,
      dateDebut, dateFin, etudiantIds, manuels,
    } = await request.json();

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
        dateDebut: dateDebut ? new Date(dateDebut) : null,
        dateFin: dateFin ? new Date(dateFin) : null,
        etudiants: {
          create: [
            ...(etudiantIds ?? []).map((etudiantId: string) => ({ etudiantId })),
            ...(manuels ?? []).map((m: { nom: string; prenom: string }) => ({
              nomManuel: m.nom,
              prenomManuel: m.prenom,
            })),
          ],
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