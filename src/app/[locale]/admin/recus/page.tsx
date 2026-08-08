import { getAuthUser, isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import RecusClient from "./RecusClient";

export default async function AdminRecusPage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();
  if (!authUser || !isAdmin(authUser.role)) redirect(`/${locale}/connexion`);
  return <RecusClient isAdmin={authUser.role === "ADMIN"} />;
}
