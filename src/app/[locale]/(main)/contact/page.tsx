import { getTranslations, getLocale } from "next-intl/server";
import ContactForm from "@/components/forms/ContactForm";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp, FaClock } from "react-icons/fa";

export default async function ContactPage() {
  const t = await getTranslations("contact");
  const locale = await getLocale();

  const infos = [
    { icon: FaMapMarkerAlt, label: t("addressLabel"), value: "Carrefour Scalom, Immeuble Africa Finance, Biyem-Assi, Yaoundé", href: null },
    { icon: FaPhone, label: t("phoneLabel"), value: "+49 1573 2878223", href: "tel:+4915732878223" },
    { icon: FaWhatsapp, label: t("whatsappLabel"), value: "+49 1573 2878223", href: "https://wa.me/4915732878223" },
    { icon: FaEnvelope, label: t("emailLabel"), value: "info@ids-sprachschule.com", href: "mailto:info@ids-sprachschule.com" },
    { icon: FaClock, label: t("hoursLabel"), value: "Lun – Sam : 8h00 – 20h00", href: null },
  ];

  return (
    <div>
      <div className="bg-ids-black py-20 text-center">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">{t("pageTitle")}</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">{t("pageSubtitle")}</p>
      </div>

      <section className="section-padding bg-ids-gray">
        <div className="container-ids">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-display font-bold text-ids-black text-lg mb-6">{t("infoTitle")}</h2>
                <div className="space-y-5">
                  {infos.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-ids-red/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="text-ids-red" size={15} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm text-ids-black hover:text-ids-red transition-colors">{item.value}</a>
                        ) : (
                          <p className="text-sm text-ids-black">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
                <h2 className="font-display font-bold text-ids-black text-lg mb-6">{t("formTitle")}</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}