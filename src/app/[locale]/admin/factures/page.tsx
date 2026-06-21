import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import FacturesClient from "./FacturesClient";

export default async function AdminFacturesPage() {
  const locale = await getLocale();
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") redirect(`/${locale}/connexion`);
  return <FacturesClient />;
}