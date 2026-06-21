import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import EtudiantsClient from "./EtudiantsClient";

export default async function AdminEtudiantsPage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") redirect(`/${locale}/connexion`);
  return <EtudiantsClient />;
}