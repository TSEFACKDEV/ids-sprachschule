"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

const INPUT_CLASS = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ids-red focus:ring-1 focus:ring-ids-red transition-colors placeholder-gray-400";
const ERROR_CLASS = "text-red-500 text-xs mt-1";

export default function ContactForm() {
  const t = useTranslations("contact");
  const te = useTranslations("errors");

  const schema = Yup.object({
    nom: Yup.string().required(te("required")),
    email: Yup.string().email(te("invalidEmail")).required(te("required")),
    telephone: Yup.string(),
    sujet: Yup.string().required(te("required")),
    message: Yup.string().min(20, "Minimum 20 caractères").required(te("required")),
  });

  const subjects = t.raw("subjects") as string[];

  return (
    <Formik
      initialValues={{ nom: "", email: "", telephone: "", sujet: "", message: "" }}
      validationSchema={schema}
      onSubmit={async (values, { resetForm, setSubmitting }) => {
        try {
          const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
          const data = await res.json();
          if (data.success) { toast.success(t("successMsg")); resetForm(); }
          else { toast.error(data.error ?? t("errorMsg")); }
        } catch { toast.error(t("errorMsg")); }
        finally { setSubmitting(false); }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{t("name")} *</label>
              <Field name="nom" placeholder="Jean Dupont" className={INPUT_CLASS} />
              <ErrorMessage name="nom" component="p" className={ERROR_CLASS} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{t("email")} *</label>
              <Field name="email" type="email" placeholder="vous@email.com" className={INPUT_CLASS} />
              <ErrorMessage name="email" component="p" className={ERROR_CLASS} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{t("phone")}</label>
              <Field name="telephone" placeholder="+237 6XX XXX XXX" className={INPUT_CLASS} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{t("subject")} *</label>
              <Field as="select" name="sujet" className={INPUT_CLASS}>
                <option value="">{t("selectSubject")}</option>
                {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
              </Field>
              <ErrorMessage name="sujet" component="p" className={ERROR_CLASS} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{t("message")} *</label>
            <Field as="textarea" name="message" rows={5} placeholder={t("messagePlaceholder")} className={`${INPUT_CLASS} resize-none`} />
            <ErrorMessage name="message" component="p" className={ERROR_CLASS} />
          </div>
          <Button type="submit" loading={isSubmitting} fullWidth size="lg">{t("send")}</Button>
        </Form>
      )}
    </Formik>
  );
}