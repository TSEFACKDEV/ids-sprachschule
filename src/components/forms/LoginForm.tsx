"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { FaEye, FaEyeSlash, FaIdCard, FaLock } from "react-icons/fa";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";

const INPUT_CLASS =
  "w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ids-red focus:ring-1 focus:ring-ids-red transition-colors placeholder-gray-400 bg-white";

export default function LoginForm() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "fr";
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations("auth");
  const te = useTranslations("errors");

  const schema = Yup.object({
    numeroInscription: Yup.string().required(te("required")),
    password: Yup.string().required(te("required")),
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <Formik
        initialValues={{ numeroInscription: "", password: "" }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          try {
            const res = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                numeroInscription: values.numeroInscription.trim().toUpperCase(),
                password: values.password,
              }),
            });
            const data = await res.json();
            if (!data.success) { setFieldError("password", te("loginFailed")); return; }
            toast.success(t("login") + " !");
            if (data.data.mustChangePassword) { router.push(`/${locale}/changer-mot-de-passe`); }
            else if (data.data.role === "ADMIN") { router.push(`/${locale}/admin`); }
            else { router.push(`/${locale}/espace-etudiant`); }
          } catch { toast.error(te("serverError")); }
          finally { setSubmitting(false); }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                {t("inscriptionNumber")}
              </label>
              <div className="relative">
                <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <Field name="numeroInscription" placeholder={t("inscriptionPlaceholder")} className={INPUT_CLASS} autoComplete="username" />
              </div>
              <ErrorMessage name="numeroInscription" component="p" className="text-red-500 text-xs mt-1" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                {t("password")}
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <Field name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className={`${INPUT_CLASS} pr-10`} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ids-black transition-colors">
                  {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
              <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
            </div>
            <Button type="submit" loading={isSubmitting} fullWidth size="lg">{t("loginBtn")}</Button>
            <p className="text-center text-xs text-gray-400">
              {t("problem")}{" "}
              <Link href={`/${locale}/contact`} className="text-ids-red hover:underline font-semibold">{t("contact", { ns: "contact" })}</Link>
            </p>
          </Form>
        )}
      </Formik>
      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400 mb-2">{t("noAccount")}</p>
        <Link href={`/${locale}/inscription`} className="inline-flex items-center gap-1 text-ids-red font-semibold text-sm hover:underline">
          {t("submitFile")}
        </Link>
      </div>
    </div>
  );
}