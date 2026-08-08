import { getAuthUser, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function AdminStatsPage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();

  if (!authUser || !isAdmin(authUser.role)) {
    redirect(`/${locale}/connexion`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ids-black">
          Statistiques
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Tableau de bord de performance et suivi.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="text-gray-600 text-sm">
          Statistiques globales disponibles dans le tableau de bord principal.
        </p>
      </div>
    </div>
  );
}
