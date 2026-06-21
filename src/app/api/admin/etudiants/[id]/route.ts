import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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
      include: {
        user: { select: { email: true, mustChangePassword: true, createdAt: true } },
        groupes: { include: { groupe: true } },
        factures: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!etudiant) {
      return NextResponse.json({ success: false, error: "Étudiant introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: etudiant });
  } catch (error) {
    console.error("[ADMIN_ETUDIANT_GET]", error);
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

    const etudiant = await prisma.etudiant.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!etudiant) {
      return NextResponse.json({ success: false, error: "Étudiant introuvable." }, { status: 404 });
    }

    // Supprimer dans l'ordre des dépendances
    await prisma.groupeEtudiant.deleteMany({ where: { etudiantId: id } });
    await prisma.facture.deleteMany({ where: { etudiantId: id } });
    await prisma.inscriptionCours.deleteMany({ where: { etudiantId: id } });
    await prisma.etudiant.delete({ where: { id } });

    if (etudiant.userId) {
      await prisma.user.delete({ where: { id: etudiant.userId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_ETUDIANT_DELETE]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}