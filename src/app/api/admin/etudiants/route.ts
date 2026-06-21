import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const statut = searchParams.get("statut") ?? undefined;
    const niveau = searchParams.get("niveau") ?? undefined;
    const search = searchParams.get("search") ?? undefined;

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (statut) where.statut = statut;
    if (niveau) where.niveauAllemand = niveau;
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: "insensitive" } },
        { prenom: { contains: search, mode: "insensitive" } },
        { numeroInscription: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [etudiants, total] = await Promise.all([
      prisma.etudiant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dateInscription: "desc" },
        include: { user: { select: { email: true, mustChangePassword: true } } },
      }),
      prisma.etudiant.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        etudiants,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("[ADMIN_ETUDIANTS_GET]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}