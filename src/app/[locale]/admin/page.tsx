import { getAuthUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import AdminDashboardClient from "./AdminDashboardClient";

// Le tableau de bord est réservé à ADMIN (restriction spécifique à la secrétaire).
export default async function AdminPage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();
  if (!authUser || !isAdmin(authUser.role)) redirect(`/${locale}/admin/etudiants`);

  const [totalEtudiants, newThisWeekQuery, pending, revenueResult] = await Promise.all([
    prisma.etudiant.count(),
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::int AS count
      FROM "Etudiant"
      WHERE "dateInscription" >= NOW() - INTERVAL '7 days'
    `,
    prisma.etudiant.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.facture.aggregate({ _sum: { montantVerse: true } }),
  ]);

  const newThisWeek = Number(newThisWeekQuery[0]?.count ?? 0);

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