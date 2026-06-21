import { getTranslations } from "next-intl/server";
import CoursPageContent from "@/components/courses/CoursPageContent";

export default async function NosCoursPage() {
  const t = await getTranslations("courses");
  return (
    <div>
      <div className="bg-ids-black py-20 text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">{t("pageTitle")}</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("pageSubtitle")}</p>
      </div>
      <CoursPageContent />
    </div>
  );
}