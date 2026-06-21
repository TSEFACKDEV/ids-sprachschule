"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";
import { useState } from "react";
import Button from "@/components/ui/Button";

const INPUT_CLASS =
  "w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ids-red focus:ring-1 focus:ring-ids-red transition-colors placeholder-gray-400 bg-white";

export default function ChangePasswordForm() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "fr";
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const t = useTranslations("auth");
  const te = useTranslations("errors");

  const schema = Yup.object({
    newPassword: Yup.string()
      .min(8, te("passwordMin"))
      .matches(/[A-Z]/, te("passwordStrength"))
      .matches(/[0-9]/, te("passwordStrength"))
      .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, te("passwordStrength"))
      .required(te("required")),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], te("passwordMatch"))
      .required(te("required")),
  });

  const rules = [
    { label: "8 " + te("passwordMin").replace("Minimum ", "").replace("Mindestens ", "").replace("minimum ", ""), test: (v: string) => v.length >= 8 },
    { label: "1 A-Z", test: (v: string) => /[A-Z]/.test(v) },
    { label: "1 0-9", test: (v: string) => /[0-9]/.test(v) },
    { label: "1 !@#...", test: (v: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <Formik
        initialValues={{ newPassword: "", confirmPassword: "" }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const res = await fetch("/api/auth/change-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ newPassword: values.newPassword, confirmPassword: values.confirmPassword }),
            });
            const data = await res.json();
            if (!data.success) { toast.error(data.error ?? te("serverError")); return; }
            toast.success(t("changeBtn") + " !");
            router.push(`/${locale}/espace-etudiant`);
          } catch { toast.error(te("serverError")); }
          finally { setSubmitting(false); }
        }}
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{t("newPassword")}</label>
              <div className="relative">
                <Field name="newPassword" type={showNew ? "text" : "password"} placeholder="••••••••" className={INPUT_CLASS} autoComplete="new-password" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ids-black">
                  {showNew ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
              <ErrorMessage name="newPassword" component="p" className="text-red-500 text-xs mt-1" />
              <div className="mt-3 space-y-1.5">
                {rules.map((rule) => {
                  const ok = rule.test(values.newPassword);
                  return (
                    <div key={rule.label} className={`flex items-center gap-2 text-xs transition-colors ${ok ? "text-green-600" : "text-gray-400"}`}>
                      <FaCheck size={10} className={ok ? "text-green-500" : "text-gray-300"} />
                      {rule.label}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">{t("confirmPassword")}</label>
              <div className="relative">
                <Field name="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="••••••••" className={INPUT_CLASS} autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ids-black">
                  {showConfirm ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
              <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-xs mt-1" />
            </div>
            <Button type="submit" loading={isSubmitting} fullWidth size="lg">{t("changeBtn")}</Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}