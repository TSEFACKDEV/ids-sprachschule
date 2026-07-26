import { NextResponse } from "next/server";
import { getAuthUser, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateContratPDF } from "@/lib/pdf";

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
    const contrat = await prisma.contrat.findUnique({ where: { id } });

    if (!contrat) {
      return NextResponse.json({ success: false, error: "Contrat introuvable." }, { status: 404 });
    }

    const pdfBuffer = await generateContratPDF({
      numeroContrat: contrat.numeroContrat,
      nomClient: contrat.nomClient,
      cniPasseport: contrat.cniPasseport,
      telephone: contrat.telephone,
      montantVerseFCFA: contrat.montantVerseFCFA,
      montantVerseLettres: contrat.montantVerseLettres,
      montantVerseEUR: contrat.montantVerseEUR,
      packConcerne: contrat.packConcerne,
      packAutre: contrat.packAutre,
      montantTotalPack: contrat.montantTotalPack,
      montantPayeCeJour: contrat.montantPayeCeJour,
      resteAPayer: contrat.resteAPayer,
      modePaiement: contrat.modePaiement,
      modePaiementAutre: contrat.modePaiementAutre,
      referencePaiement: contrat.referencePaiement,
      declarationRecuExemplaire: contrat.declarationRecuExemplaire,
      declarationClausesExpliquees: contrat.declarationClausesExpliquees,
      declarationLuComprisAccepte: contrat.declarationLuComprisAccepte,
      declarationMontantConforme: contrat.declarationMontantConforme,
      nomRepresentant: contrat.nomRepresentant,
      dateSignature: contrat.dateSignature.toISOString(),
    });

    const body = new Uint8Array(pdfBuffer);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrat-${contrat.numeroContrat}.pdf"`,
        "Content-Length": String(body.length),
      },
    });
  } catch (error) {
    console.error("[PDF_CONTRAT]", error);
    return NextResponse.json({ success: false, error: "Erreur génération PDF." }, { status: 500 });
  }
}
