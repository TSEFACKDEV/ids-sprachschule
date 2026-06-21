import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalEtudiants,
      newThisWeek,
      pending,
      revenueResult,
      inscriptionsParMois,
    ] = await Promise.all([
      prisma.etudiant.count(),
      prisma.etudiant.count({
        where: { dateInscription: { gte: sevenDaysAgo } },
      }),
      prisma.etudiant.count({ where: { statut: "EN_ATTENTE" } }),
      prisma.facture.aggregate({ _sum: { montantVerse: true } }),
      prisma.$queryRaw<{ mois: string; count: bigint }[]>`
        SELECT TO_CHAR("dateInscription", 'YYYY-MM') as mois,
               COUNT(*) as count
        FROM "Etudiant"
        WHERE "dateInscription" >= NOW() - INTERVAL '12 months'
        GROUP BY mois
        ORDER BY mois ASC
      `,
    ]);

    const chartData = inscriptionsParMois.map((row) => ({
      mois: row.mois,
      count: Number(row.count),
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalEtudiants,
        newThisWeek,
        pending,
        totalRevenue: revenueResult._sum.montantVerse ?? 0,
        chartData,
      },
    });
  } catch (error) {
    console.error("[ADMIN_STATS]", error);
    return NextResponse.json({ success: false, error: "Erreur serveur." }, { status: 500 });
  }
}