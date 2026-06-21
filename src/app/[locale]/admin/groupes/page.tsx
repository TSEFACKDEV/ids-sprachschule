import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import GroupesClient from "./GroupesClient";

export default async function AdminGroupesPage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") redirect(`/${locale}/connexion`);
  return <GroupesClient />;
}