import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function AdminRecusRedirect() {
  const locale = await getLocale();
  redirect(`/${locale}/admin/factures`);
}
