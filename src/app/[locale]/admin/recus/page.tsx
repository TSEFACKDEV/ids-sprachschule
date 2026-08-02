import { getAuthUser, isStaff } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import RecusClient from "./RecusClient";

export default async function AdminRecusPage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();
  if (!authUser || !isStaff(authUser.role)) redirect(`/${locale}/connexion`);
  return <RecusClient />;
}
