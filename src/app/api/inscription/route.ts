import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendInscriptionConfirmation,
  sendAdminNewInscription,
} from "@/lib/mailer";
import { getTarifCours } from "@/lib/tarifs";

const NUMERO_INSCRIPTION_MIN = 150;

async function generateNumeroInscription(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `IDS-${year}-`;

  const last = await prisma.etudiant.findFirst({
    where: { numeroInscription: { startsWith: prefix } },
    orderBy: { numeroInscription: "desc" },
    select: { numeroInscription: true },
  });

  let next = NUMERO_INSCRIPTION_MIN;
  if (last) {
    const suffix = parseInt(last.numeroInscription.slice(prefix.length), 10);
    if (!Number.isNaN(suffix)) next = suffix + 1;
  }

  return `${prefix}${String(next).padStart(5, "0")}`;
}

const TYPE_COURS_LABELS: Record<string, string> = {
  SEMAINE_MATIN: "Cours en semaine – Matin",
  SEMAINE_SOIR: "Cours en semaine – Soir",
  WEEKEND_SAT_DIM: "Week-end Samedi + Dimanche",
};

const MODALITE_LABELS: Record<string, string> = {
  EN_LIGNE: "En ligne",
  PRESENTIEL: "En présentiel",
};

function formatTypeCours(typeCours: string, modalites: string[]): string {
  const base = TYPE_COURS_LABELS[typeCours] ?? typeCours;
  const modLabels = (modalites ?? []).map((m) => MODALITE_LABELS[m] ?? m);
  return modLabels.length > 0 ? `${base} (${modLabels.join(", ")})` : base;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      nom,
      prenom,
      dateNaissance,
      sexe,
      nationalite,
      adresse,
      ville,
      codePostal,
      telephone,
      email,
      photoUrl,
      niveauAllemand,
      typeCours,
      modalites,
      objectif,
      disponibilites,
      joursPreferees,
      niveauEtudes,
      profession,
      accepteReglement,
    } = body;

    // Validation serveur minimale
    const required = [
      nom,
      prenom,
      dateNaissance,
      sexe,
      nationalite,
      adresse,
      ville,
      telephone,
      email,
      niveauAllemand,
      typeCours,
      objectif,
      niveauEtudes,
      accepteReglement,
    ];

    if (required.some((v) => !v || String(v).trim() === "")) {
      return NextResponse.json(
        { success: false, error: "Champs obligatoires manquants." },
        { status: 400 }
      );
    }

    if (accepteReglement !== true) {
      return NextResponse.json(
        { success: false, error: "Vous devez accepter le règlement et la confidentialité pour finaliser votre inscription." },
        { status: 400 }
      );
    }

    // Vérifier email unique
    const existingEmail = await prisma.etudiant.findFirst({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Un dossier existe déjà avec cet email. Contactez-nous si besoin.",
        },
        { status: 409 }
      );
    }

    // Générer numéro d'inscription
    const numeroInscription = await generateNumeroInscription();

    const tarif = getTarifCours(niveauAllemand, typeCours);

    let etudiant: Awaited<ReturnType<typeof prisma.etudiant.create>> | null = null;
    for (let attempt = 0; attempt < 5 && !etudiant; attempt++) {
      const numero = attempt === 0 ? numeroInscription : await generateNumeroInscription();
      try {
        etudiant = await prisma.etudiant.create({
          data: {
            numeroInscription: numero,
            nom: nom.trim(),
            prenom: prenom.trim(),
            dateNaissance: new Date(dateNaissance),
            sexe,
            nationalite: nationalite.trim(),
            adresse: adresse.trim(),
            ville: ville.trim(),
            codePostal: codePostal?.trim() || null,
            telephone: telephone.trim(),
            email: email.trim().toLowerCase(),
            photoUrl: photoUrl || null,
            niveauAllemand,
            typeCours: formatTypeCours(typeCours, modalites),
            objectif,
            disponibilites: disponibilites ?? {},
            joursPreferees: joursPreferees ?? [],
            niveauEtudes,
            profession: profession?.trim() || null,
            statut: "EN_ATTENTE",
          },
        });
      } catch (error) {
        const code = (error as { code?: string })?.code;
        if (code !== "P2002" || attempt === 4) throw error;
      }
    }

    if (!etudiant) {
      throw new Error("Impossible de générer un numéro d'inscription unique.");
    }

    // Emails
    await Promise.allSettled([
      sendInscriptionConfirmation(
        etudiant.email,
        etudiant.prenom,
        etudiant.nom,
        etudiant.numeroInscription,
        etudiant.niveauAllemand,
        tarif
      ),
      sendAdminNewInscription(
        etudiant.prenom,
        etudiant.nom,
        etudiant.niveauAllemand,
        etudiant.numeroInscription
      ),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: { numeroInscription: etudiant.numeroInscription },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[INSCRIPTION]", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur." },
      { status: 500 }
    );
  }
}