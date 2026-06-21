import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const { id } = await params;
    const { nom, niveau, type, heureDebut, heureFin, salle, enseignant, etudiantIds } =
      await request.json();

    // Mettre à jour les membres du groupe
    await prisma.groupeEtudiant.deleteMany({ where: { groupeId: id } });

    const groupe = await prisma.groupe.update({
      where: { id },
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

    return NextResponse.json({ success: true, data: groupe });
  } catch (error) {
    console.error("[GROUPE_PUT]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const { id } = await params;

    await prisma.groupeEtudiant.deleteMany({ where: { groupeId: id } });
    await prisma.groupe.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[GROUPE_DELETE]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}