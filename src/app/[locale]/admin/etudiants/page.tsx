import { getAuthUser, isStaff } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import EtudiantsClient from "./EtudiantsClient";

export default async function AdminEtudiantsPage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();
  if (!authUser || !isStaff(authUser.role)) redirect(`/${locale}/connexion`);
  return <EtudiantsClient isAdmin={authUser.role === "ADMIN"} />;
}