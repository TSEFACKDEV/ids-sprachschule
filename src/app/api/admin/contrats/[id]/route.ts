import { NextResponse } from "next/server";
import { getAuthUser, isStaff, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !isStaff(authUser.role)) {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const { id } = await params;
    const contrat = await prisma.contrat.findUnique({
      where: { id },
      include: { etudiant: { select: { nom: true, prenom: true, numeroInscription: true } } },
    });

    if (!contrat) {
      return NextResponse.json({ success: false, error: "Contrat introuvable." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: contrat });
  } catch (error) {
    console.error("[CONTRAT_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

// Suppression réservée à ADMIN : la secrétaire ne doit pouvoir supprimer aucune donnée,
// y compris les reçus/contrats déjà générés.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !isAdmin(authUser.role)) {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const { id } = await params;
    await prisma.contrat.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CONTRAT_DELETE]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
