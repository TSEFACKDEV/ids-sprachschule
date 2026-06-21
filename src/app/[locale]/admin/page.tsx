import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") redirect(`/${locale}/connexion`);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [totalEtudiants, newThisWeek, pending, revenueResult] =
    await Promise.all([
      prisma.etudiant.count(),
      prisma.etudiant.count({ where: { dateInscription: { gte: sevenDaysAgo } } }),
      prisma.etudiant.count({ where: { statut: "EN_ATTENTE" } }),
      prisma.facture.aggregate({ _sum: { montantVerse: true } }),
    ]);

  const rawChart = await prisma.$queryRaw<{ mois: string; count: bigint }[]>`
    SELECT TO_CHAR("dateInscription", 'YYYY-MM') as mois, COUNT(*) as count
    FROM "Etudiant"
    WHERE "dateInscription" >= NOW() - INTERVAL '6 months'
    GROUP BY mois ORDER BY mois ASC
  `;

  return (
    <AdminDashboardClient
      stats={{
        totalEtudiants,
        newThisWeek,
        pending,
        totalRevenue: revenueResult._sum.montantVerse ?? 0,
        chartData: rawChart.map((r) => ({ mois: r.mois, count: Number(r.count) })),
      }}
    />
  );
}