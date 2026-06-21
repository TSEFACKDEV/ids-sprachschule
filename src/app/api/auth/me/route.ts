import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Non authentifié." },
        { status: 401 }
      );
    }

    if (authUser.role === "ETUDIANT" && authUser.etudiantId) {
      const etudiant = await prisma.etudiant.findUnique({
        where: { id: authUser.etudiantId },
        include: {
          groupes: {
            include: { groupe: true },
          },
          factures: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      return NextResponse.json({ success: true, data: { authUser, etudiant } });
    }

    return NextResponse.json({ success: true, data: { authUser } });
  } catch (error) {
    console.error("[ME]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}