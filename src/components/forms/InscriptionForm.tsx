"use client";

import { useState, useRef } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Image from "next/image";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import {
  FaUser, FaBook, FaGraduationCap, FaCheckCircle, FaUpload, FaSpinner,
} from "react-icons/fa";
import Button from "@/components/ui/Button";
import type { InscriptionFormData } from "@/types";

const NIVEAUX = ["A1", "A2", "B1", "B2", "C1"];

const INPUT_CLASS =
  "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ids-red focus:ring-1 focus:ring-ids-red transition-colors placeholder-gray-400 bg-white";
const ERROR_CLASS = "text-red-500 text-xs mt-1";
const LABEL_CLASS = "block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide";
const STEP_ICONS = [FaUser, FaBook, FaGraduationCap];

const INITIAL_VALUES: InscriptionFormData = {
  nom: "", prenom: "", dateNaissance: "", sexe: "", nationalite: "",
  adresse: "", ville: "", codePostal: "", telephone: "", email: "",
  photoUrl: "", niveauAllemand: "", typeCours: "", objectif: "",
  disponibilites: { matin: false, apresMidi: false, soir: false, weekend: false },
  joursPreferees: [], niveauEtudes: "", profession: "", accepteReglement: false,
};

export default function InscriptionForm() {
  const t = useTranslations("inscription");
  const tf = useTranslations("inscription.fields");
  const te = useTranslations("errors");

  const typeCoursList = t.raw("typeCours") as { value: string; label: string }[];
  const objectifsList = t.raw("objectifs") as { value: string; label: string }[];
  const disposList = t.raw("dispos") as { key: string; label: string }[];
  const joursList = t.raw("jours") as string[];
  const niveauEtudesList = t.raw("niveauEtudes") as string[];

  const step1Schema = Yup.object({
    nom: Yup.string().required(te("required")),
    prenom: Yup.string().required(te("required")),
    dateNaissance: Yup.string().required(te("required")),
    sexe: Yup.string().required(te("required")),
    nationalite: Yup.string().required(te("required")),
    adresse: Yup.string().required(te("required")),
    ville: Yup.string().required(te("required")),
    telephone: Yup.string().required(te("required")),
    email: Yup.string().email(te("invalidEmail")).required(te("required")),
  });

  const step2Schema = Yup.object({
    niveauAllemand: Yup.string().required(te("required")),
    typeCours: Yup.string().required(te("required")),
    objectif: Yup.string().required(te("required")),
    joursPreferees: Yup.array().min(1, te("required")),
  });

  const step3Schema = Yup.object({
    niveauEtudes: Yup.string().required(te("required")),
    accepteReglement: Yup.boolean().oneOf([true], te("required")),
  });

  const SCHEMAS = [step1Schema, step2Schema, step3Schema];
  const STEP_LABELS = [t("step1"), t("step2"), t("step3")];

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [numeroInscription, setNumeroInscription] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg p-10 text-center"
      >
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="text-green-500" size={40} />
        </div>
        <h2 className="font-display text-2xl font-bold text-ids-black mb-3">{t("successTitle")}</h2>
        <p className="text-gray-500 text-sm mb-6">{t("successText")}</p>
        <div className="inline-block bg-ids-black text-ids-gold font-display font-bold text-2xl px-8 py-4 rounded-xl mb-6">
          {numeroInscription}
        </div>
        <p className="text-gray-400 text-xs max-w-sm mx-auto">{t("successNote")}</p>
      </motion.div>
    );
  }

  return (
    <Formik
      initialValues={INITIAL_VALUES}
      validationSchema={SCHEMAS[step]}
      validateOnMount={false}
      onSubmit={async (values, { setSubmitting }) => {
        if (step < 2) { setStep(step + 1); setSubmitting(false); return; }
        try {
          const res = await fetch("/api/inscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const data = await res.json();
          if (!data.success) { toast.error(data.error ?? te("serverError")); return; }
          setNumeroInscription(data.data.numeroInscription);
          setSubmitted(true);
          toast.success(t("successTitle"));
        } catch { toast.error(te("serverError")); }
        finally { setSubmitting(false); }
      }}
    >
      {({ values, setFieldValue, isSubmitting, errors, touched }) => {
        const handleUpload = async (file: File) => {
          setUploading(true);
          try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (data.success) { setFieldValue("photoUrl", data.data.url); toast.success(tf("photoUploaded")); }
            else { toast.error(data.error ?? te("serverError")); }
          } catch { toast.error(te("serverError")); }
          finally { setUploading(false); }
        };

        return (
          <Form>
            {/* Barre de progression */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between">
                {STEP_LABELS.map((label, i) => {
                  const Icon = STEP_ICONS[i];
                  const done = i < step;
                  const active = i === step;
                  return (
                    <div key={i} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${done ? "bg-green-500 text-white" : active ? "bg-ids-red text-white" : "bg-gray-200 text-gray-400"}`}>
                          {done ? <FaCheckCircle size={16} /> : <Icon size={16} />}
                        </div>
                        <span className={`text-xs mt-2 font-semibold text-center hidden sm:block ${active ? "text-ids-red" : done ? "text-green-600" : "text-gray-400"}`}>{label}</span>
                      </div>
                      {i < 2 && <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${done ? "bg-green-400" : "bg-gray-200"}`} />}
                    </div>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">

                {/* ÉTAPE 1 */}
                {step === 0 && (
                  <div className="space-y-5">
                    <h2 className="font-display text-xl font-bold text-ids-black border-b border-gray-100 pb-3 mb-5">{t("step1")}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL_CLASS}>{tf("nom")} *</label>
                        <Field name="nom" placeholder="DUPONT" className={INPUT_CLASS} />
                        <ErrorMessage name="nom" component="p" className={ERROR_CLASS} />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>{tf("prenom")} *</label>
                        <Field name="prenom" placeholder="Jean" className={INPUT_CLASS} />
                        <ErrorMessage name="prenom" component="p" className={ERROR_CLASS} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL_CLASS}>{tf("dateNaissance")} *</label>
                        <Field name="dateNaissance" type="date" className={INPUT_CLASS} />
                        <ErrorMessage name="dateNaissance" component="p" className={ERROR_CLASS} />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>{tf("sexe")} *</label>
                        <div className="flex gap-4 mt-3">
                          {[{ value: "Homme", label: tf("homme") }, { value: "Femme", label: tf("femme") }].map((s) => (
                            <label key={s.value} className="flex items-center gap-2 cursor-pointer">
                              <Field type="radio" name="sexe" value={s.value} className="accent-ids-red w-4 h-4" />
                              <span className="text-sm text-gray-700">{s.label}</span>
                            </label>
                          ))}
                        </div>
                        <ErrorMessage name="sexe" component="p" className={ERROR_CLASS} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL_CLASS}>{tf("nationalite")} *</label>
                        <Field name="nationalite" className={INPUT_CLASS} />
                        <ErrorMessage name="nationalite" component="p" className={ERROR_CLASS} />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>{tf("telephone")} *</label>
                        <Field name="telephone" placeholder="+237 6XX XXX XXX" className={INPUT_CLASS} />
                        <ErrorMessage name="telephone" component="p" className={ERROR_CLASS} />
                      </div>
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>{tf("adresse")} *</label>
                      <Field name="adresse" className={INPUT_CLASS} />
                      <ErrorMessage name="adresse" component="p" className={ERROR_CLASS} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL_CLASS}>{tf("ville")} *</label>
                        <Field name="ville" className={INPUT_CLASS} />
                        <ErrorMessage name="ville" component="p" className={ERROR_CLASS} />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>{tf("codePostal")}</label>
                        <Field name="codePostal" className={INPUT_CLASS} />
                      </div>
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>{tf("email")} *</label>
                      <Field name="email" type="email" className={INPUT_CLASS} />
                      <ErrorMessage name="email" component="p" className={ERROR_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>{tf("photo")}</label>
                      <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-ids-red transition-colors">
                        {values.photoUrl ? (
                          <div className="flex items-center justify-center gap-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden">
                              <Image src={values.photoUrl} alt="Photo" fill className="object-cover" />
                            </div>
                            <p className="text-green-600 text-sm font-semibold">{tf("photoUploaded")}</p>
                          </div>
                        ) : uploading ? (
                          <div className="flex items-center justify-center gap-2 text-gray-400">
                            <FaSpinner className="animate-spin" size={20} />
                            <span className="text-sm">Upload...</span>
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            <FaUpload size={24} className="mx-auto mb-2" />
                            <p className="text-sm">{tf("photoClick")}</p>
                            <p className="text-xs mt-1">{tf("photoFormats")}</p>
                          </div>
                        )}
                      </div>
                      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                    </div>
                  </div>
                )}

                {/* ÉTAPE 2 */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h2 className="font-display text-xl font-bold text-ids-black border-b border-gray-100 pb-3 mb-5">{t("step2")}</h2>
                    <div>
                      <label className={LABEL_CLASS}>{tf("niveau")} *</label>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {NIVEAUX.map((n) => (
                          <button type="button" key={n} onClick={() => setFieldValue("niveauAllemand", n)}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm border-2 transition-colors ${values.niveauAllemand === n ? "bg-ids-red text-white border-ids-red" : "bg-white text-ids-black border-gray-200 hover:border-ids-red"}`}>
                            {n}
                          </button>
                        ))}
                      </div>
                      {errors.niveauAllemand && touched.niveauAllemand && <p className={ERROR_CLASS}>{errors.niveauAllemand}</p>}
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>{tf("typeCours")} *</label>
                      <Field as="select" name="typeCours" className={INPUT_CLASS}>
                        <option value=""></option>
                        {typeCoursList.map((tc) => <option key={tc.value} value={tc.value}>{tc.label}</option>)}
                      </Field>
                      <ErrorMessage name="typeCours" component="p" className={ERROR_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>{tf("objectif")} *</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                        {objectifsList.map((o) => (
                          <label key={o.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${values.objectif === o.value ? "border-ids-red bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                            <Field type="radio" name="objectif" value={o.value} className="accent-ids-red" />
                            <span className="text-sm text-gray-700">{o.label}</span>
                          </label>
                        ))}
                      </div>
                      <ErrorMessage name="objectif" component="p" className={ERROR_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>{tf("disponibilites")} *</label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {disposList.map((d) => (
                          <label key={d.key} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${values.disponibilites[d.key as keyof typeof values.disponibilites] ? "border-ids-red bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                            <input type="checkbox" checked={values.disponibilites[d.key as keyof typeof values.disponibilites]}
                              onChange={(e) => setFieldValue("disponibilites", { ...values.disponibilites, [d.key]: e.target.checked })}
                              className="accent-ids-red w-4 h-4" />
                            <span className="text-sm text-gray-700">{d.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>{tf("jours")} *</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {joursList.map((jour) => {
                          const selected = values.joursPreferees.includes(jour);
                          return (
                            <button type="button" key={jour}
                              onClick={() => setFieldValue("joursPreferees", selected ? values.joursPreferees.filter((j) => j !== jour) : [...values.joursPreferees, jour])}
                              className={`px-4 py-2 rounded-lg text-xs font-bold border-2 transition-colors ${selected ? "bg-ids-red text-white border-ids-red" : "bg-white text-gray-600 border-gray-200 hover:border-ids-red"}`}>
                              {jour.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                      {errors.joursPreferees && touched.joursPreferees && <p className={ERROR_CLASS}>{errors.joursPreferees as string}</p>}
                    </div>
                  </div>
                )}

                {/* ÉTAPE 3 */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="font-display text-xl font-bold text-ids-black border-b border-gray-100 pb-3 mb-5">{t("step3")}</h2>
                    <div>
                      <label className={LABEL_CLASS}>{tf("niveauEtudes")} *</label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {niveauEtudesList.map((n) => (
                          <label key={n} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${values.niveauEtudes === n ? "border-ids-red bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                            <Field type="radio" name="niveauEtudes" value={n} className="accent-ids-red" />
                            <span className="text-sm text-gray-700">{n}</span>
                          </label>
                        ))}
                      </div>
                      <ErrorMessage name="niveauEtudes" component="p" className={ERROR_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>{tf("profession")}</label>
                      <Field name="profession" className={INPUT_CLASS} />
                    </div>

                    {/* Récap */}
                    <div className="bg-ids-gray rounded-xl p-5 text-sm space-y-2">
                      <p className="font-bold text-ids-black text-xs uppercase tracking-widest mb-3">{t("recap")}</p>
                      {[
                        [tf("nom") + " " + tf("prenom"), `${values.prenom} ${values.nom}`],
                        [tf("email"), values.email],
                        [tf("telephone"), values.telephone],
                        [tf("niveau"), values.niveauAllemand || "—"],
                        [tf("typeCours"), typeCoursList.find((tc) => tc.value === values.typeCours)?.label || "—"],
                        [tf("objectif"), objectifsList.find((o) => o.value === values.objectif)?.label || "—"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-2">
                          <span className="text-gray-500 text-xs">{label}</span>
                          <span className="font-semibold text-ids-black text-xs text-right">{value}</span>
                        </div>
                      ))}
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <Field type="checkbox" name="accepteReglement" className="accent-ids-red w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 leading-relaxed group-hover:text-ids-black transition-colors">
                        {t("reglementText")}
                      </span>
                    </label>
                    <ErrorMessage name="accepteReglement" component="p" className={ERROR_CLASS} />
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                  {step > 0 ? (
                    <button type="button" onClick={() => setStep(step - 1)}
                      className="px-6 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-ids-black hover:text-ids-black transition-colors text-sm">
                      {t("previous")}
                    </button>
                  ) : <div />}
                  <Button type="submit" loading={isSubmitting} size="lg">
                    {step < 2 ? t("next") : t("submit")}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </Form>
        );
      }}
    </Formik>
  );
}