import { getAuthUser, isStaff } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import MessagerieClient from "./MessagerieClient";

export default async function AdminMessagériePage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();
  if (!authUser || !isStaff(authUser.role)) redirect(`/${locale}/connexion`);
  return <MessagerieClient />;
}