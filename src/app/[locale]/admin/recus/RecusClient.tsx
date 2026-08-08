"use client";

import { useState, useEffect, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { FaFilePdf, FaPlus, FaTrash, FaDownload } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";

interface EtudiantOption {
  id: string;
  nom: string;
  prenom: string;
  numeroInscription: string;
}

interface Recu {
  id: string;
  numeroRecu: string;
  formation: string;
  montantTotal: number;
  montantVerse: number;
  resteAPayer: number;
  modePaiement: string;
  nature: string;
  date: string;
  etudiantNom?: string | null;
  etudiantPrenom?: string | null;
  etudiantNumeroInscription?: string | null;
  etudiant?: { nom: string; prenom: string; numeroInscription: string } | null;
}

const MODE_OPTIONS = [
  { value: "ESPECES", label: "Espèces" },
  { value: "VIREMENT", label: "Virement" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "ORANGE_MONEY", label: "Orange Money" },
  { value: "MTN_MONEY", label: "MTN Mobile Money" },
];

const NATURE_OPTIONS = [
  { value: "ACOMPTE", label: "Avance (Acompte)" },
  { value: "TOTAL", label: "Paiement total" },
];

const schema = Yup.object({
  etudiantId: Yup.string().optional(),
  etudiantNom: Yup.string().optional(),
  etudiantPrenom: Yup.string().optional(),
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

export default function RecusClient({ isAdmin }: { isAdmin: boolean }) {
  const [recus, setRecus] = useState<Recu[]>([]);
  const [etudiants, setEtudiants] = useState<EtudiantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lastCreated, setLastCreated] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Recu | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [recusRes, etudiantsRes] = await Promise.all([
        fetch("/api/admin/factures?limit=100"),
        fetch("/api/admin/etudiants/valides"),
      ]);
      const [rd, ed] = await Promise.all([recusRes.json(), etudiantsRes.json()]);
      if (rd.success) setRecus(rd.data.factures);
      if (ed.success) setEtudiants(ed.data);
    } catch {
      toast.error("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/factures/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Reçu supprimé.");
      setDeleteTarget(null);
      fetchData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setDeleting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ids-black">
            Reçus de paiement
          </h1>
          <p className="text-gray-400 text-sm">
            Générez un reçu dynamique après remplissage du formulaire.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(true)} size="sm">
            <FaPlus size={13} />
            Nouveau reçu
          </Button>
        )}
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
                  const f = recus.find((x) => x.numeroRecu === lastCreated);
                  if (f) handleDownloadPDF(f.id, f.numeroRecu);
                }}
              >
                <FaDownload size={14} />
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
              etudiantNom: "",
              etudiantPrenom: "",
              etudiantNumeroInscription: "",
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
                const hasExistingStudent = Boolean(values.etudiantId);
                const hasManualStudent = Boolean(values.etudiantNom?.trim() && values.etudiantPrenom?.trim());
                if (!hasExistingStudent && !hasManualStudent) {
                  throw new Error("Sélectionnez un étudiant existant ou saisissez le nom/prénom de l’étudiant.");
                }

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
                      Nom de l&apos;étudiant(e)
                    </label>
                    <Field as="select" name="etudiantId" className={INPUT_CLASS}>
                      <option value="">Sélectionnez un étudiant déjà inscrit...</option>
                      {etudiants.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.prenom} {e.nom} — {e.numeroInscription}
                        </option>
                      ))}
                    </Field>
                    <p className="text-xs text-gray-400 mt-1">
                      Ou saisissez manuellement un étudiant non inscrit :
                    </p>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Prénom</label>
                        <Field name="etudiantPrenom" placeholder="Prénom" className={INPUT_CLASS} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">Nom</label>
                        <Field name="etudiantNom" placeholder="Nom" className={INPUT_CLASS} />
                      </div>
                    </div>
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
                        Nature du paiement *
                      </label>
                      <div className="flex flex-col gap-2 mt-2">
                        {NATURE_OPTIONS.map((n) => (
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

                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                      Date
                    </label>
                    <Field name="date" type="date" className={INPUT_CLASS} />
                  </div>

                  <Button type="submit" loading={isSubmitting} fullWidth size="lg">
                    Générer le reçu
                  </Button>
                </Form>
              );
            }}
          </Formik>
        )}
      </Modal>

      {/* Liste reçus */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : recus.length === 0 ? (
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
                {recus.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-mono text-ids-red font-bold">
                      {f.numeroRecu}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p className="font-semibold text-ids-black">
                        {f.etudiant ? `${f.etudiant.prenom} ${f.etudiant.nom}` : `${f.etudiantPrenom ?? ""} ${f.etudiantNom ?? ""}`.trim() || "Étudiant manuel"}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {f.etudiant?.numeroInscription ?? f.etudiantNumeroInscription ?? "Aucun dossier existant"}
                      </p>
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
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDownloadPDF(f.id, f.numeroRecu)}
                          className="flex items-center gap-1 text-ids-red hover:text-red-700 text-xs font-semibold transition-colors"
                        >
                          <FaFilePdf size={13} />
                          PDF
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(f)}
                            title="Supprimer"
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmer la suppression" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Voulez-vous vraiment supprimer le reçu <strong>{deleteTarget?.numeroRecu}</strong> ?
            Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <Button onClick={handleDelete} loading={deleting} variant="danger" fullWidth>
              Supprimer
            </Button>
            <Button onClick={() => setDeleteTarget(null)} variant="outline" fullWidth>
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
