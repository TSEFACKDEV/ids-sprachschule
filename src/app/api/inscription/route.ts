import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendInscriptionConfirmation,
  sendAdminNewInscription,
} from "@/lib/mailer";
import { getTarifCours } from "@/lib/tarifs";

// Les premiers dossiers réels commencent au numéro 150.
const NUMERO_INSCRIPTION_OFFSET = 149;

function generateNumeroInscription(count: number): string {
  const year = new Date().getFullYear();
  return `IDS-${year}-${String(count + NUMERO_INSCRIPTION_OFFSET).padStart(5, "0")}`;
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
    ];

    if (required.some((v) => !v || String(v).trim() === "")) {
      return NextResponse.json(
        { success: false, error: "Champs obligatoires manquants." },
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
    const count = await prisma.etudiant.count();
    const numeroInscription = generateNumeroInscription(count + 1);

    // Tarif du niveau/format choisi, pour l'email de confirmation
    const tarif = getTarifCours(niveauAllemand, typeCours);

    // Créer l'étudiant
    const etudiant = await prisma.etudiant.create({
      data: {
        numeroInscription,
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