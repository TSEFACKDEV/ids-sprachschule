import { getAuthUser, isStaff } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import ContratsClient from "./ContratsClient";

export default async function AdminContratsPage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();
  if (!authUser || !isStaff(authUser.role)) redirect(`/${locale}/connexion`);
  return <ContratsClient isAdmin={authUser.role === "ADMIN"} />;
}
