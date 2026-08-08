-- Aligner les relations avec schema.prisma (onDelete: SetNull)
ALTER TABLE "Facture" DROP CONSTRAINT "Facture_etudiantId_fkey";
ALTER TABLE "GroupeEtudiant" DROP CONSTRAINT "GroupeEtudiant_etudiantId_fkey";

ALTER TABLE "GroupeEtudiant" ADD CONSTRAINT "GroupeEtudiant_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Facture" ADD CONSTRAINT "Facture_etudiantId_fkey" FOREIGN KEY ("etudiantId") REFERENCES "Etudiant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
