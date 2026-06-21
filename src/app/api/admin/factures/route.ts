import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateNumeroRecu(count: number): string {
  const year = new Date().getFullYear();
  return `IDS-${year}-${String(count).padStart(3, "0")}`;
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
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
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const {
      etudiantId,
      formation,
      montantTotal,
      montantVerse,
      nature,
      modePaiement,
      date,
    } = await request.json();

    if (!etudiantId || !formation || !montantTotal || !montantVerse || !nature || !modePaiement) {
      return NextResponse.json(
        { success: false, error: "Champs obligatoires manquants." },
        { status: 400 }
      );
    }

    const count = await prisma.facture.count();
    const numeroRecu = generateNumeroRecu(count + 1);
    const resteAPayer = Number(montantTotal) - Number(montantVerse);

    const facture = await prisma.facture.create({
      data: {
        numeroRecu,
        etudiantId,
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