import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendInscriptionConfirmation,
  sendAdminNewInscription,
} from "@/lib/mailer";

function generateNumeroInscription(count: number): string {
  const year = new Date().getFullYear();
  return `IDS-${year}-${String(count).padStart(5, "0")}`;
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
        typeCours,
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
        etudiant.numeroInscription
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