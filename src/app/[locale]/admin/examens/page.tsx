import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { FaGraduationCap } from "react-icons/fa";

export default async function AdminExamensPage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") redirect(`/${locale}/connexion`);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ids-black">
        Préparation aux examens
      </h1>
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm text-gray-400">
        <FaGraduationCap size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-lg font-semibold mb-2">Module en cours de déploiement</p>
        <p className="text-sm">
          Le suivi des préparations aux examens officiels sera disponible
          prochainement. Les inscriptions se gèrent depuis la page Étudiants.
        </p>
      </div>
    </div>
  );
}