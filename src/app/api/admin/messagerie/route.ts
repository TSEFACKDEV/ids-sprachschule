import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendBulkMessage } from "@/lib/mailer";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("[MESSAGERIE_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const { sujet, corps, destinataires } = await request.json();

    if (!sujet || !corps || !destinataires?.length) {
      return NextResponse.json(
        { success: false, error: "Sujet, corps et destinataires sont requis." },
        { status: 400 }
      );
    }

    // Résoudre les emails selon les destinataires
    let emails: string[] = [];

    if (destinataires.includes("all")) {
      const etudiants = await prisma.etudiant.findMany({
        where: { statut: "VALIDE" },
        select: { email: true },
      });
      emails = etudiants.map((e) => e.email);
    } else {
      // Vérifier si ce sont des niveaux ou des IDs
      const niveaux = ["A1", "A2", "B1", "B2", "C1"];
      const filteredNiveaux = destinataires.filter((d: string) =>
        niveaux.includes(d)
      );
      const filteredIds = destinataires.filter(
        (d: string) => !niveaux.includes(d)
      );

      const queries = [];

      if (filteredNiveaux.length > 0) {
        queries.push(
          prisma.etudiant.findMany({
            where: {
              statut: "VALIDE",
              niveauAllemand: { in: filteredNiveaux },
            },
            select: { email: true },
          })
        );
      }

      if (filteredIds.length > 0) {
        queries.push(
          prisma.etudiant.findMany({
            where: {
              id: { in: filteredIds },
              statut: "VALIDE",
            },
            select: { email: true },
          })
        );
      }

      const results = await Promise.all(queries);
      const allEmails = results.flat().map((e) => e.email);
      emails = [...new Set(allEmails)];
    }

    if (emails.length === 0) {
      return NextResponse.json(
        { success: false, error: "Aucun destinataire valide trouvé." },
        { status: 400 }
      );
    }

    // Créer le message en DB
    const message = await prisma.message.create({
      data: {
        sujet,
        corps,
        destinataires,
        envoye: false,
      },
    });

    // Envoyer les emails
    await sendBulkMessage(emails, sujet, corps);

    // Marquer comme envoyé
    await prisma.message.update({
      where: { id: message.id },
      data: { envoye: true, sentAt: new Date() },
    });

    return NextResponse.json(
      { success: true, data: { sent: emails.length } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[MESSAGERIE_POST]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}