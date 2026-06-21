"use client";

import { useState, useEffect, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { FaFilePdf, FaPlus, FaTimes } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";

interface EtudiantOption {
  id: string;
  nom: string;
  prenom: string;
  numeroInscription: string;
}

interface Facture {
  id: string;
  numeroRecu: string;
  formation: string;
  montantTotal: number;
  montantVerse: number;
  resteAPayer: number;
  modePaiement: string;
  nature: string;
  date: string;
  etudiant: { nom: string; prenom: string; numeroInscription: string };
}

const MODE_OPTIONS = [
  { value: "ESPECES", label: "Espèces" },
  { value: "VIREMENT", label: "Virement bancaire" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "ORANGE_MONEY", label: "Orange Money" },
  { value: "MTN_MONEY", label: "MTN Mobile Money" },
];

const schema = Yup.object({
  etudiantId: Yup.string().required("Sélectionnez un étudiant"),
  formation: Yup.string().required("Obligatoire"),
  montantTotal: Yup.number().positive("Doit être positif").required("Obligatoire"),
  montantVerse: Yup.number()
    .positive("Doit être positif")
    .required("Obligatoire")
    .max(Yup.ref("montantTotal"), "Ne peut dépasser le montant total"),
  nature: Yup.string().required("Obligatoire"),
  modePaiement: Yup.string().required("Obligatoire"),
});

const INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ids-red";

export default function FacturesClient() {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [etudiants, setEtudiants] = useState<EtudiantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lastCreated, setLastCreated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [facturesRes, etudiantsRes] = await Promise.all([
        fetch("/api/admin/factures?limit=50"),
        fetch("/api/admin/etudiants/valides"),
      ]);
      const [fd, ed] = await Promise.all([facturesRes.json(), etudiantsRes.json()]);
      if (fd.success) setFactures(fd.data.factures);
      if (ed.success) setEtudiants(ed.data);
    } catch {
      toast.error("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDownloadPDF = async (id: string, numero: string) => {
    try {
      const res = await fetch(`/api/admin/factures/${id}/pdf`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recu-${numero}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Erreur lors du téléchargement PDF.");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ids-black">
          Facturation & Reçus
        </h1>
        <Button onClick={() => setShowForm(true)} size="sm">
          <FaPlus size={13} />
          Nouveau reçu
        </Button>
      </div>

      {/* Modal Formulaire */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setLastCreated(null); }}
        title="Créer un reçu de paiement"
        size="lg"
      >
        {lastCreated ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <FaFilePdf className="text-green-500" size={28} />
            </div>
            <h3 className="font-bold text-ids-black text-lg mb-2">
              Reçu créé avec succès
            </h3>
            <p className="text-gray-500 text-sm mb-6">N° {lastCreated}</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  const f = factures.find((x) => x.numeroRecu === lastCreated);
                  if (f) handleDownloadPDF(f.id, f.numeroRecu);
                }}
              >
                <FaFilePdf size={14} />
                Télécharger le PDF
              </Button>
              <Button variant="outline" onClick={() => setLastCreated(null)}>
                Nouveau reçu
              </Button>
            </div>
          </div>
        ) : (
          <Formik
            initialValues={{
              etudiantId: "",
              formation: "",
              montantTotal: "",
              montantVerse: "",
              nature: "TOTAL",
              modePaiement: "ESPECES",
              date: today,
            }}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                const res = await fetch("/api/admin/factures", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...values,
                    montantTotal: Number(values.montantTotal),
                    montantVerse: Number(values.montantVerse),
                  }),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error);
                setLastCreated(data.data.numeroRecu);
                await fetchData();
                resetForm();
              } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : "Erreur.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, isSubmitting }) => {
              const reste =
                Number(values.montantTotal) - Number(values.montantVerse) || 0;
              return (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                      Étudiant *
                    </label>
                    <Field as="select" name="etudiantId" className={INPUT_CLASS}>
                      <option value="">Sélectionnez un étudiant...</option>
                      {etudiants.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.prenom} {e.nom} — {e.numeroInscription}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="etudiantId" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                      Formation / Service *
                    </label>
                    <Field name="formation" placeholder="Ex : Cours d'allemand B1" className={INPUT_CLASS} />
                    <ErrorMessage name="formation" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                        Montant total (FCFA) *
                      </label>
                      <Field name="montantTotal" type="number" placeholder="95000" className={INPUT_CLASS} />
                      <ErrorMessage name="montantTotal" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                        Montant versé *
                      </label>
                      <Field name="montantVerse" type="number" placeholder="50000" className={INPUT_CLASS} />
                      <ErrorMessage name="montantVerse" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                        Reste à payer
                      </label>
                      <div className={`${INPUT_CLASS} bg-ids-gray font-bold text-ids-black`}>
                        {reste.toLocaleString("fr-FR")} FCFA
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                        Nature *
                      </label>
                      <div className="flex gap-3 mt-2">
                        {[
                          { value: "ACOMPTE", label: "Acompte" },
                          { value: "TOTAL", label: "Paiement total" },
                        ].map((n) => (
                          <label key={n.value} className="flex items-center gap-2 cursor-pointer">
                            <Field type="radio" name="nature" value={n.value} className="accent-ids-red" />
                            <span className="text-sm">{n.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                        Mode de paiement *
                      </label>
                      <Field as="select" name="modePaiement" className={INPUT_CLASS}>
                        {MODE_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </Field>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                        Date
                      </label>
                      <Field name="date" type="date" className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                        Statut
                      </label>
                      <div className={`${INPUT_CLASS} bg-red-50 text-ids-red font-bold`}>
                        PAYÉ
                      </div>
                    </div>
                  </div>

                  <Button type="submit" loading={isSubmitting} fullWidth size="lg">
                    Créer le reçu
                  </Button>
                </Form>
              );
            }}
          </Formik>
        )}
      </Modal>

      {/* Liste factures */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : factures.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaFilePdf size={32} className="mx-auto mb-3 opacity-30" />
            <p>Aucun reçu créé pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-ids-gray">
                  {["N° Reçu", "Étudiant", "Formation", "Total", "Versé", "Reste", "Mode", "Date", "PDF"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {factures.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-mono text-ids-red font-bold">
                      {f.numeroRecu}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p className="font-semibold text-ids-black">
                        {f.etudiant.prenom} {f.etudiant.nom}
                      </p>
                      <p className="text-gray-400 text-xs">{f.etudiant.numeroInscription}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-32 truncate">
                      {f.formation}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold">
                      {f.montantTotal.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-xs text-green-600 font-semibold">
                      {f.montantVerse.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-xs text-red-500 font-semibold">
                      {f.resteAPayer.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {MODE_OPTIONS.find((m) => m.value === f.modePaiement)?.label ?? f.modePaiement}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(f.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDownloadPDF(f.id, f.numeroRecu)}
                        className="flex items-center gap-1 text-ids-red hover:text-red-700 text-xs font-semibold transition-colors"
                      >
                        <FaFilePdf size={13} />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}