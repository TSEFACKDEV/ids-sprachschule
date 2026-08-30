import { NextResponse } from "next/server";
import { getAuthUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function buildManualNumber(): string {
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MANUEL-${Date.now()}-${random}`;
}

async function generateNumeroRecu(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `IDS-${year}-`;

  const last = await prisma.facture.findFirst({
    where: { numeroRecu: { startsWith: prefix } },
    orderBy: { numeroRecu: "desc" },
    select: { numeroRecu: true },
  });

  let next = 1;
  if (last) {
    const suffix = parseInt(last.numeroRecu.slice(prefix.length), 10);
    if (!Number.isNaN(suffix)) next = suffix + 1;
  }

  return `${prefix}${String(next).padStart(3, "0")}`;
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !isAdmin(authUser.role)) {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const etudiantId = searchParams.get("etudiantId") ?? undefined;
    const modePaiement = searchParams.get("modePaiement") ?? undefined;
    const dateFrom = searchParams.get("dateFrom") ?? undefined;
    const dateTo = searchParams.get("dateTo") ?? undefined;

    const where: Record<string, unknown> = {};
    if (etudiantId) where.etudiantId = etudiantId;
    if (modePaiement) where.modePaiement = modePaiement;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.date as Record<string, unknown>).lte = new Date(dateTo);
    }

    const [factures, total] = await Promise.all([
      prisma.facture.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          etudiant: {
            select: {
              nom: true,
              prenom: true,
              numeroInscription: true,
              email: true,
            },
          },
        },
      }),
      prisma.facture.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        factures,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("[FACTURES_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !isAdmin(authUser.role)) {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const {
      etudiantId,
      etudiantNom,
      etudiantPrenom,
      etudiantNumeroInscription,
      etudiantEmail,
      formation,
      montantTotal,
      montantVerse,
      nature,
      modePaiement,
      date,
    } = await request.json();

    const manualNom = typeof etudiantNom === "string" ? etudiantNom.trim() : "";
    const manualPrenom = typeof etudiantPrenom === "string" ? etudiantPrenom.trim() : "";
    const manualNumero = typeof etudiantNumeroInscription === "string" ? etudiantNumeroInscription.trim() : "";
    const manualEmail = typeof etudiantEmail === "string" ? etudiantEmail.trim() : "";

    if (!formation || !montantTotal || !montantVerse || !nature || !modePaiement) {
      return NextResponse.json(
        { success: false, error: "Champs obligatoires manquants." },
        { status: 400 }
      );
    }

    if (!etudiantId && (!manualNom || !manualPrenom)) {
      return NextResponse.json(
        { success: false, error: "Sélectionnez un étudiant existant ou saisissez un nom/prénom manuel." },
        { status: 400 }
      );
    }

    const numeroRecu = await generateNumeroRecu();
    const resteAPayer = Number(montantTotal) - Number(montantVerse);

    let factureEtudiantNom = manualNom || null;
    let factureEtudiantPrenom = manualPrenom || null;
    let factureEtudiantNumero = manualNumero || null;
    let factureEtudiantEmail = manualEmail || null;

    if (etudiantId) {
      const etudiant = await prisma.etudiant.findUnique({
        where: { id: etudiantId },
        select: { nom: true, prenom: true, numeroInscription: true, email: true },
      });

      if (!etudiant) {
        return NextResponse.json(
          { success: false, error: "Étudiant introuvable." },
          { status: 400 }
        );
      }

      factureEtudiantNom = factureEtudiantNom || etudiant.nom;
      factureEtudiantPrenom = factureEtudiantPrenom || etudiant.prenom;
      factureEtudiantNumero = factureEtudiantNumero || etudiant.numeroInscription;
      factureEtudiantEmail = factureEtudiantEmail || etudiant.email;
    }

    const facture = await prisma.facture.create({
      data: {
        numeroRecu,
        etudiantId: etudiantId || null,
        etudiantNom: factureEtudiantNom,
        etudiantPrenom: factureEtudiantPrenom,
        etudiantNumeroInscription: factureEtudiantNumero || buildManualNumber(),
        etudiantEmail: factureEtudiantEmail,
        formation,
        montantTotal: Number(montantTotal),
        montantVerse: Number(montantVerse),
        resteAPayer,
        nature,
        modePaiement,
        statut: "PAYE",
        date: date ? new Date(date) : new Date(),
      },
      include: {
        etudiant: {
          select: {
            nom: true,
            prenom: true,
            numeroInscription: true,
            email: true,
            adresse: true,
            ville: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: facture }, { status: 201 });
  } catch (error) {
    console.error("[FACTURES_POST]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}