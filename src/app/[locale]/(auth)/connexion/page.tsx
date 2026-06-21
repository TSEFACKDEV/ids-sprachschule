import { getTranslations } from "next-intl/server";
import LoginForm from "@/components/forms/LoginForm";

export default async function ConnexionPage() {
  const t = await getTranslations("auth");
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-ids-black mb-2">{t("loginTitle")}</h1>
        <p className="text-gray-500 text-sm">{t("inscriptionNumber")}</p>
      </div>
      <LoginForm />
    </div>
  );
}