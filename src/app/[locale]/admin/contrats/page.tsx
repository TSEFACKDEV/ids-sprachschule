import Link from "next/link";
import { getAuthUser, isStaff } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function ContratsPage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();

  if (!authUser || !isStaff(authUser.role)) {
    redirect(`/${locale}/connexion`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ids-black">
          Contrats téléchargeables
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          Téléchargez un contrat PDF personnalisé avec un identifiant unique et le logo IDS.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="text-gray-600 text-sm mb-4">
          Ce module génère un contrat PDF prêt à être envoyé aux étudiants et établissements.
        </p>
        <Link
          href="/api/admin/contrats/pdf"
          className="inline-flex items-center gap-2 rounded-xl bg-ids-red px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Télécharger le contrat PDF
        </Link>
      </div>
    </div>
  );
}
