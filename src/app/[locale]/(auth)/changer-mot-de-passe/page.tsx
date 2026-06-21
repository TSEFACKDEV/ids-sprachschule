import { getTranslations } from "next-intl/server";
import ChangePasswordForm from "@/components/forms/ChangePasswordForm";
import { FaShieldAlt } from "react-icons/fa";

export default async function ChangerMotDePassePage() {
  const t = await getTranslations("auth");
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-ids-red/10 flex items-center justify-center mx-auto mb-4">
          <FaShieldAlt className="text-ids-red" size={28} />
        </div>
        <h1 className="font-display text-3xl font-bold text-ids-black mb-2">{t("changePasswordTitle")}</h1>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">{t("changePasswordInfo")}</p>
      </div>
      <ChangePasswordForm />
    </div>
  );
}