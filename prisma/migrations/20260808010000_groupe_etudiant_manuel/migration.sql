-- Sync GroupeEtudiant with schema.prisma (membres ajoutés manuellement)
ALTER TABLE "GroupeEtudiant" ADD COLUMN "nomManuel" TEXT;
ALTER TABLE "GroupeEtudiant" ADD COLUMN "prenomManuel" TEXT;
