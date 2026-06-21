import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import EspaceEtudiantClient from "./EspaceEtudiantClient";

export default async function EspaceEtudiantPage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();

  if (!authUser) redirect(`/${locale}/connexion`);
  if (authUser.mustChangePassword) redirect(`/${locale}/changer-mot-de-passe`);

  const etudiant = await prisma.etudiant.findUnique({
    where: { id: authUser.etudiantId },
    include: {
      groupes: { include: { groupe: true } },
      factures: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!etudiant) redirect(`/${locale}/connexion`);

  return <EspaceEtudiantClient etudiant={JSON.parse(JSON.stringify(etudiant))} />;
}