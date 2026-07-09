import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EspaceEtudiantClient from "./EspaceEtudiantClient";

export default async function EspaceEtudiantPage() {
  const authUser = await getAuthUser();

  if (!authUser || authUser.role !== "ETUDIANT" || !authUser.etudiantId) {
    redirect("/fr/connexion");
  }

  // Récupération brute avec Prisma
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

  if (!etudiant) {
    redirect("/fr/connexion");
  }

  // Transformation pour coller à l'interface EtudiantData
  const etudiantForClient = {
    id: etudiant.id,
    numeroInscription: etudiant.numeroInscription,
    nom: etudiant.nom,
    prenom: etudiant.prenom,
    email: etudiant.email,
    telephone: etudiant.telephone,
    photoUrl: etudiant.photoUrl ?? undefined,
    niveauAllemand: etudiant.niveauAllemand,
    statut: etudiant.statut,
    dateInscription: etudiant.dateInscription.toISOString(),
    groupes: etudiant.groupes.map((g) => ({
      groupe: {
        id: g.groupe.id,
        nom: g.groupe.nom,
        niveau: g.groupe.niveau,
        type: g.groupe.type,
        heureDebut: g.groupe.heureDebut,
        heureFin: g.groupe.heureFin,
        salle: g.groupe.salle,
        enseignant: g.groupe.enseignant,
      },
    })),
    factures: etudiant.factures.map((f) => ({
      id: f.id,
      numeroRecu: f.numeroRecu,
      formation: f.formation,
      montantTotal: f.montantTotal,
      montantVerse: f.montantVerse,
      resteAPayer: f.resteAPayer,
      modePaiement: f.modePaiement,
      statut: f.statut,
      date: f.date.toISOString(), // ← conversion en string
    })),
  };

  return <EspaceEtudiantClient etudiant={etudiantForClient} />;
}