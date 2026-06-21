import { getTranslations } from "next-intl/server";
import InscriptionForm from "@/components/forms/InscriptionForm";

export default async function InscriptionPage() {
  const t = await getTranslations("inscription");
  return (
    <div>
      <div className="bg-ids-black py-16 text-center">
        <h1 className="font-display text-4xl font-bold text-white mb-3">{t("pageTitle")}</h1>
        <p className="text-gray-400 max-w-xl mx-auto text-sm">{t("pageSubtitle")}</p>
      </div>
      <section className="section-padding bg-ids-gray">
        <div className="container-ids max-w-3xl mx-auto">
          <InscriptionForm />
        </div>
      </section>
    </div>
  );
}