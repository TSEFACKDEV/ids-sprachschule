import { NextResponse } from "next/server";
import { getAuthUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Suppression réservée à ADMIN : la secrétaire ne doit pouvoir supprimer aucune
// donnée, y compris les reçus déjà générés.
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
    await prisma.facture.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FACTURE_DELETE]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
