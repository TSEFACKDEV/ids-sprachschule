import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateRecuPDF } from "@/lib/pdf";

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

    const facture = await prisma.facture.findUnique({
      where: { id },
      include: {
        etudiant: true,
      },
    });

    if (!facture) {
      return NextResponse.json({ success: false, error: "Facture introuvable." }, { status: 404 });
    }

    const pdfBuffer = await generateRecuPDF(
      {
        id: facture.id,
        numeroRecu: facture.numeroRecu,
        formation: facture.formation,
        montantTotal: facture.montantTotal,
        montantVerse: facture.montantVerse,
        resteAPayer: facture.resteAPayer,
        nature: facture.nature as "ACOMPTE" | "TOTAL",
        modePaiement: facture.modePaiement as
          | "ESPECES"
          | "VIREMENT"
          | "PAYPAL"
          | "ORANGE_MONEY"
          | "MTN_MONEY",
        statut: facture.statut,
        date: facture.date.toISOString(),
      },
      {
        id: facture.etudiant.id,
        numeroInscription: facture.etudiant.numeroInscription,
        nom: facture.etudiant.nom,
        prenom: facture.etudiant.prenom,
        email: facture.etudiant.email,
        telephone: facture.etudiant.telephone,
        dateNaissance: facture.etudiant.dateNaissance.toISOString(),
        sexe: facture.etudiant.sexe,
        nationalite: facture.etudiant.nationalite,
        adresse: facture.etudiant.adresse,
        ville: facture.etudiant.ville,
        codePostal: facture.etudiant.codePostal ?? undefined,
        photoUrl: facture.etudiant.photoUrl ?? undefined,
        niveauEtudes: facture.etudiant.niveauEtudes,
        profession: facture.etudiant.profession ?? undefined,
        objectif: facture.etudiant.objectif as "ETUDES_ALLEMAGNE" | "TRAVAIL" | "EXAMEN" | "VOYAGE" | "AUTRE",
        disponibilites: facture.etudiant.disponibilites as Record<string, boolean>,
        joursPreferees: facture.etudiant.joursPreferees as string[],
        niveauAllemand: facture.etudiant.niveauAllemand as "A1" | "A2" | "B1" | "B2" | "C1",
        typeCours: facture.etudiant.typeCours,
        statut: facture.etudiant.statut as "EN_ATTENTE" | "VALIDE" | "REFUSE",
        dateInscription: facture.etudiant.dateInscription.toISOString(),
      }
    );

    // --- LA MODIFICATION EST ICI ---
    // On convertit le Buffer Node.js en Uint8Array accepté par NextResponse
    const body = new Uint8Array(pdfBuffer);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="recu-${facture.numeroRecu}.pdf"`,
        "Content-Length": String(body.length),
      },
    });
  } catch (error) {
    console.error("[PDF_RECU]", error);
    return NextResponse.json({ success: false, error: "Erreur génération PDF." }, { status: 500 });
  }
}