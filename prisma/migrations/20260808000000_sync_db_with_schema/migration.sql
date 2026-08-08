-- Sync Groupe with schema.prisma
ALTER TABLE "Groupe" ADD COLUMN "dateDebut" TIMESTAMP(3);
ALTER TABLE "Groupe" ADD COLUMN "dateFin" TIMESTAMP(3);
ALTER TABLE "Groupe" ALTER COLUMN "niveau" SET DATA TYPE TEXT USING "niveau"::text;

-- Sync Facture with schema.prisma
ALTER TABLE "Facture" ADD COLUMN "etudiantNom" TEXT;
ALTER TABLE "Facture" ADD COLUMN "etudiantPrenom" TEXT;
ALTER TABLE "Facture" ADD COLUMN "etudiantNumeroInscription" TEXT;
ALTER TABLE "Facture" ADD COLUMN "etudiantEmail" TEXT;
ALTER TABLE "Facture" ALTER COLUMN "etudiantId" DROP NOT NULL;

-- Sync GroupeEtudiant with schema.prisma
ALTER TABLE "GroupeEtudiant" ALTER COLUMN "etudiantId" DROP NOT NULL;
