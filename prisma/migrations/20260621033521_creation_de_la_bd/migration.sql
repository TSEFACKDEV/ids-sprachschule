-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ETUDIANT');

-- CreateEnum
CREATE TYPE "StatutInscription" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REFUSE');

-- CreateEnum
CREATE TYPE "Objectif" AS ENUM ('ETUDES_ALLEMAGNE', 'TRAVAIL', 'EXAMEN', 'VOYAGE', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeCours" AS ENUM ('SEMAINE_MATIN', 'SEMAINE_SOIR', 'WEEKEND_SAT_DIM', 'WEEKEND_SAT_MER_DIM', 'EN_LIGNE', 'PRESENTIEL');

-- CreateEnum
CREATE TYPE "NiveauAllemand" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1');

-- CreateEnum
CREATE TYPE "TypeExamen" AS ENUM ('GOETHE', 'OSD', 'TELC', 'ECL', 'TESTDAF');

-- CreateEnum
CREATE TYPE "NatureFacture" AS ENUM ('ACOMPTE', 'TOTAL');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('ESPECES', 'VIREMENT', 'PAYPAL', 'ORANGE_MONEY', 'MTN_MONEY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ETUDIANT',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etudiant" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "numeroInscription" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "dateNaissance" TIMESTAMP(3) NOT NULL,
    "sexe" TEXT NOT NULL,
    "nationalite" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "codePostal" TEXT,
    "telephone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "photoUrl" TEXT,
    "niveauEtudes" TEXT NOT NULL,
    "profession" TEXT,
    "objectif" "Objectif" NOT NULL,
    "disponibilites" JSONB NOT NULL,
    "joursPreferees" JSONB NOT NULL,
    "niveauAllemand" "NiveauAllemand" NOT NULL,
    "typeCours" TEXT NOT NULL,
    "statut" "StatutInscription" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateInscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Etudiant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cours" (
    "id" TEXT NOT NULL,
    "niveau" "NiveauAllemand" NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "competences" TEXT NOT NULL,
    "dureeEnMois" INTEGER NOT NULL,
    "preparationGratuiteIncluse" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormatCours" (
    "id" TEXT NOT NULL,
    "coursId" TEXT NOT NULL,
    "type" "TypeCours" NOT NULL,
    "dureeMois" INTEGER NOT NULL,
    "prixFCFA" DOUBLE PRECISION NOT NULL,
    "prixEUR" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FormatCours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InscriptionCours" (
    "id" TEXT NOT NULL,
    "etudiantId" TEXT NOT NULL,
    "coursId" TEXT NOT NULL,
    "formatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InscriptionCours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groupe" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "niveau" "NiveauAllemand" NOT NULL,
    "type" "TypeCours" NOT NULL,
    "heureDebut" TEXT NOT NULL,
    "heureFin" TEXT NOT NULL,
    "salle" TEXT NOT NULL,
    "enseignant" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Groupe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupeEtudiant" (
    "id" TEXT NOT NULL,
    "groupeId" TEXT NOT NULL,
    "etudiantId" TEXT NOT NULL,

    CONSTRAINT "GroupeEtudiant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Examen" (
    "id" TEXT NOT NULL,
    "type" "TypeExamen" NOT NULL,
    "niveau" "NiveauAllemand" NOT NULL,
    "tarifFCFA" DOUBLE PRECISION NOT NULL,
    "gratuitPourNiveauIDS" BOOLEAN NOT NULL DEFAULT true,
    "duree" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Examen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Facture" (
    "id" TEXT NOT NULL,
    "numeroRecu" TEXT NOT NULL,
    "etudiantId" TEXT NOT NULL,
    "formation" TEXT NOT NULL,
    "montantTotal" DOUBLE PRECISION NOT NULL,
    "montantVerse" DOUBLE PRECISION NOT NULL,
    "resteAPayer" DOUBLE PRECISION NOT NULL,
    "nature" "NatureFacture" NOT NULL,
    "modePaiement" "ModePaiement" NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'PAYE',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Facture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "sujet" TEXT NOT NULL,
    "corps" TEXT NOT NULL,
    "destinataires" JSONB NOT NULL,
    "envoye" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Etudiant_userId_key" ON "Etudiant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Etudiant_numeroInscription_key" ON "Etudiant"("numeroInscription");

-- CreateIndex
CREATE UNIQUE INDEX "InscriptionCours_etudiantId_key" ON "InscriptionCours"("etudiantId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupeEtudiant_groupeId_etudiantId_key" ON "GroupeEtudiant"("groupeId", "etudiantId");

-- CreateIndex
CREATE UNIQUE INDEX "Facture_numeroRecu_key" ON "Facture"("numeroRecu");

-- AddForeignKey
ALTER TABLE "Etudiant" ADD CONSTRAINT "Etudiant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormatCours" ADD CONSTRAINT "FormatCours_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscriptionCours" ADD CONSTRAINT "InscriptionCours_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscriptionCours" ADD CONSTRAINT "InscriptionCours_coursId_fkey" FOREIGN KEY ("coursId") REFERENCES "Cours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InscriptionCours" ADD CONSTRAINT "InscriptionCours_formatId_fkey" FOREIGN KEY ("formatId") REFERENCES "FormatCours"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupeEtudiant" ADD CONSTRAINT "GroupeEtudiant_groupeId_fkey" FOREIGN KEY ("groupeId") REFERENCES "Groupe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupeEtudiant" ADD CONSTRAINT "GroupeEtudiant_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
