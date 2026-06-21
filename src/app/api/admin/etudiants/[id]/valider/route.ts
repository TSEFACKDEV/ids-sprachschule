import { NextResponse } from "next/server";
import { getAuthUser, generateTempPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendValidationEmail } from "@/lib/mailer";
import bcrypt from "bcryptjs";
import { generateInscriptionPDF } from "@/lib/inscription-pdf";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const { id } = await params;

    const etudiant = await prisma.etudiant.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!etudiant) {
      return NextResponse.json({ success: false, error: "Étudiant introuvable." }, { status: 404 });
    }

    if (etudiant.statut === "VALIDE") {
      return NextResponse.json({ success: false, error: "Dossier déjà validé." }, { status: 400 });
    }

    const motDePasseTemp = generateTempPassword();
    const hashed = await bcrypt.hash(motDePasseTemp, 12);

    let userId = etudiant.userId;

    if (!userId) {
      const user = await prisma.user.create({
        data: {
          email: etudiant.email,
          password: hashed,
          role: "ETUDIANT",
          mustChangePassword: true,
        },
      });
      userId = user.id;
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashed, mustChangePassword: true },
      });
    }

    await prisma.etudiant.update({
      where: { id },
      data: { statut: "VALIDE", userId },
    });

    // Générer PDF fiche d'inscription
    let pdfBuffer: Buffer;
    try {
      // On convertit l'objet Prisma pour correspondre au type EtudiantPublic
      const etudiantPourPdf = {
        ...etudiant,
        dateNaissance: etudiant.dateNaissance.toISOString(),
        dateInscription: etudiant.dateInscription.toISOString(),
      };

      // @ts-ignore si un autre champ mineur bloque, mais le cast strict passe ici :
      pdfBuffer = await generateInscriptionPDF(etudiantPourPdf as any);
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      pdfBuffer = Buffer.from("PDF non disponible");
    }

    // Envoyer email avec PJ
    await sendValidationEmail(
      etudiant.email,
      etudiant.prenom,
      etudiant.nom,
      etudiant.numeroInscription,
      motDePasseTemp,
      pdfBuffer
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[VALIDER]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}