import { NextResponse } from "next/server";
import { getAuthUser, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateNumeroContrat(count: number): string {
  const year = new Date().getFullYear();
  return `CTR-${year}-${String(count).padStart(4, "0")}`;
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !isStaff(authUser.role)) {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const [contrats, total] = await Promise.all([
      prisma.contrat.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          etudiant: { select: { nom: true, prenom: true, numeroInscription: true } },
        },
      }),
      prisma.contrat.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: { contrats, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
    });
  } catch (error) {
    console.error("[CONTRATS_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !isStaff(authUser.role)) {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const body = await request.json();
    const {
      etudiantId,
      nomClient,
      cniPasseport,
      telephone,
      montantVerseFCFA,
      montantVerseLettres,
      montantVerseEUR,
      packConcerne,
      packAutre,
      montantTotalPack,
      montantPayeCeJour,
      resteAPayer,
      modePaiement,
      modePaiementAutre,
      referencePaiement,
      nomRepresentant,
    } = body;

    const required = [
      nomClient, cniPasseport, telephone,
      montantVerseFCFA, montantVerseLettres,
      packConcerne, montantTotalPack, montantPayeCeJour,
      modePaiement, nomRepresentant,
    ];
    if (required.some((v) => v === undefined || v === null || String(v).trim() === "")) {
      return NextResponse.json(
        { success: false, error: "Champs obligatoires manquants." },
        { status: 400 }
      );
    }

    const count = await prisma.contrat.count();
    const numeroContrat = generateNumeroContrat(count + 1);

    const contrat = await prisma.contrat.create({
      data: {
        numeroContrat,
        etudiantId: etudiantId || null,
        nomClient: nomClient.trim(),
        cniPasseport: cniPasseport.trim(),
        telephone: telephone.trim(),
        montantVerseFCFA: Number(montantVerseFCFA),
        montantVerseLettres: montantVerseLettres.trim(),
        montantVerseEUR: montantVerseEUR ? Number(montantVerseEUR) : null,
        packConcerne,
        packAutre: packAutre?.trim() || null,
        montantTotalPack: Number(montantTotalPack),
        montantPayeCeJour: Number(montantPayeCeJour),
        resteAPayer: Number(resteAPayer ?? Number(montantTotalPack) - Number(montantPayeCeJour)),
        modePaiement,
        modePaiementAutre: modePaiementAutre?.trim() || null,
        referencePaiement: referencePaiement?.trim() || null,
        nomRepresentant: nomRepresentant.trim(),
      },
    });

    return NextResponse.json({ success: true, data: contrat }, { status: 201 });
  } catch (error) {
    console.error("[CONTRATS_POST]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}
