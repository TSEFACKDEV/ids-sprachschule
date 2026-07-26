"use client";

import { useState, useEffect, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { FaFilePdf, FaPlus, FaTrash } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";

interface EtudiantOption {
  id: string;
  nom: string;
  prenom: string;
  numeroInscription: string;
}

interface Contrat {
  id: string;
  numeroContrat: string;
  nomClient: string;
  packConcerne: string;
  montantPayeCeJour: number;
  resteAPayer: number;
  modePaiement: string;
  dateSignature: string;
  etudiant: { nom: string; prenom: string; numeroInscription: string } | null;
}

const PACK_OPTIONS = [
  { value: "PACK_STANDARD", label: "Pack Étudiant Standard" },
  { value: "PACK_SERENITE", label: "Pack Étudiant Sérénité" },
  { value: "PACK_EXTERNE_STANDARD", label: "Pack Externe Standard" },
  { value: "PACK_EXTERNE_SERENITE", label: "Pack Externe Sérénité" },
  { value: "AUTRE", label: "Autre" },
];

const MODE_OPTIONS = [
  { value: "ESPECES", label: "Espèces" },
  { value: "ORANGE_MONEY", label: "Orange Money" },
  { value: "MTN_MONEY", label: "MTN Mobile Money" },
  { value: "VIREMENT", label: "Virement bancaire" },
  { value: "AUTRE", label: "Autre" },
];

const schema = Yup.object({
  nomClient: Yup.string().required("Obligatoire"),
  cniPasseport: Yup.string().required("Obligatoire"),
  telephone: Yup.string().required("Obligatoire"),
  montantVerseFCFA: Yup.number().positive("Doit être positif").required("Obligatoire"),
  montantVerseLettres: Yup.string().required("Obligatoire"),
  packConcerne: Yup.string().required("Obligatoire"),
  packAutre: Yup.string().when("packConcerne", {
    is: "AUTRE",
    then: (s) => s.required("Précisez le pack"),
  }),
  montantTotalPack: Yup.number().positive("Doit être positif").required("Obligatoire"),
  montantPayeCeJour: Yup.number().min(0, "Doit être positif ou nul").required("Obligatoire"),
  modePaiement: Yup.string().required("Obligatoire"),
  modePaiementAutre: Yup.string().when("modePaiement", {
    is: "AUTRE",
    then: (s) => s.required("Précisez le mode de paiement"),
  }),
  nomRepresentant: Yup.string().required("Obligatoire"),
  confirmation: Yup.boolean().oneOf([true], "Confirmation requise"),
});

const INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ids-red";
const ERROR_CLASS = "text-red-500 text-xs mt-1";
const LABEL_CLASS = "block text-xs font-bold text-gray-600 mb-1.5 uppercase";

export default function ContratsClient({ isAdmin }: { isAdmin: boolean }) {
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [etudiants, setEtudiants] = useState<EtudiantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lastCreated, setLastCreated] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contrat | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [contratsRes, etudiantsRes] = await Promise.all([
        fetch("/api/admin/contrats?limit=50"),
        fetch("/api/admin/etudiants/valides"),
      ]);
      const [cd, ed] = await Promise.all([contratsRes.json(), etudiantsRes.json()]);
      if (cd.success) setContrats(cd.data.contrats);
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
      const res = await fetch(`/api/admin/contrats/${id}/pdf`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contrat-${numero}.pdf`;
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
      const res = await fetch(`/api/admin/contrats/${deleteTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Contrat supprimé.");
      setDeleteTarget(null);
      fetchData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ids-black">
          Reçus & Contrats
        </h1>
        <Button onClick={() => setShowForm(true)} size="sm">
          <FaPlus size={13} />
          Nouveau contrat
        </Button>
      </div>

      {/* Modal Formulaire */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setLastCreated(null); }}
        title="Créer un reçu de paiement / attestation de remise du contrat"
        size="lg"
      >
        {lastCreated ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <FaFilePdf className="text-green-500" size={28} />
            </div>
            <h3 className="font-bold text-ids-black text-lg mb-2">Contrat créé avec succès</h3>
            <p className="text-gray-500 text-sm mb-6">N° {lastCreated}</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  const c = contrats.find((x) => x.numeroContrat === lastCreated);
                  if (c) handleDownloadPDF(c.id, c.numeroContrat);
                }}
              >
                <FaFilePdf size={14} />
                Télécharger le PDF
              </Button>
              <Button variant="outline" onClick={() => setLastCreated(null)}>
                Nouveau contrat
              </Button>
            </div>
          </div>
        ) : (
          <Formik
            initialValues={{
              etudiantId: "",
              nomClient: "",
              cniPasseport: "",
              telephone: "",
              montantVerseFCFA: "",
              montantVerseLettres: "",
              montantVerseEUR: "",
              packConcerne: "PACK_STANDARD",
              packAutre: "",
              montantTotalPack: "",
              montantPayeCeJour: "",
              modePaiement: "ESPECES",
              modePaiementAutre: "",
              referencePaiement: "",
              nomRepresentant: "",
              confirmation: false,
            }}
            validationSchema={schema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                const resteAPayer = Number(values.montantTotalPack) - Number(values.montantPayeCeJour);
                const res = await fetch("/api/admin/contrats", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...values,
                    etudiantId: values.etudiantId || null,
                    montantVerseFCFA: Number(values.montantVerseFCFA),
                    montantVerseEUR: values.montantVerseEUR ? Number(values.montantVerseEUR) : null,
                    montantTotalPack: Number(values.montantTotalPack),
                    montantPayeCeJour: Number(values.montantPayeCeJour),
                    resteAPayer,
                  }),
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.error);
                setLastCreated(data.data.numeroContrat);
                await fetchData();
                resetForm();
              } catch (e: unknown) {
                toast.error(e instanceof Error ? e.message : "Erreur.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ values, isSubmitting, setFieldValue }) => {
              const reste = Number(values.montantTotalPack) - Number(values.montantPayeCeJour) || 0;
              return (
                <Form className="space-y-4">
                  <div>
                    <label className={LABEL_CLASS}>Lier à un étudiant inscrit (facultatif)</label>
                    <Field
                      as="select"
                      name="etudiantId"
                      className={INPUT_CLASS}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const id = e.target.value;
                        setFieldValue("etudiantId", id);
                        const et = etudiants.find((x) => x.id === id);
                        if (et) setFieldValue("nomClient", `${et.prenom} ${et.nom}`);
                      }}
                    >
                      <option value="">Candidat externe / non lié</option>
                      {etudiants.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.prenom} {e.nom} — {e.numeroInscription}
                        </option>
                      ))}
                    </Field>
                  </div>

                  <p className="text-xs font-bold text-ids-black uppercase tracking-widest pt-2">
                    Informations du client
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL_CLASS}>Nom et prénom *</label>
                      <Field name="nomClient" className={INPUT_CLASS} />
                      <ErrorMessage name="nomClient" component="p" className={ERROR_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>CNI / Passeport *</label>
                      <Field name="cniPasseport" className={INPUT_CLASS} />
                      <ErrorMessage name="cniPasseport" component="p" className={ERROR_CLASS} />
                    </div>
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>Téléphone *</label>
                    <Field name="telephone" className={INPUT_CLASS} />
                    <ErrorMessage name="telephone" component="p" className={ERROR_CLASS} />
                  </div>

                  <p className="text-xs font-bold text-ids-black uppercase tracking-widest pt-2">Paiement</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={LABEL_CLASS}>Montant versé (FCFA) *</label>
                      <Field name="montantVerseFCFA" type="number" className={INPUT_CLASS} />
                      <ErrorMessage name="montantVerseFCFA" component="p" className={ERROR_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Équivalent (€)</label>
                      <Field name="montantVerseEUR" type="number" className={INPUT_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>En lettres *</label>
                      <Field name="montantVerseLettres" placeholder="Cent mille francs CFA" className={INPUT_CLASS} />
                      <ErrorMessage name="montantVerseLettres" component="p" className={ERROR_CLASS} />
                    </div>
                  </div>

                  <p className="text-xs font-bold text-ids-black uppercase tracking-widest pt-2">Pack concerné</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PACK_OPTIONS.map((p) => (
                      <label key={p.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${values.packConcerne === p.value ? "border-ids-red bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <Field type="radio" name="packConcerne" value={p.value} className="accent-ids-red" />
                        <span className="text-sm text-gray-700">{p.label}</span>
                      </label>
                    ))}
                  </div>
                  {values.packConcerne === "AUTRE" && (
                    <div>
                      <Field name="packAutre" placeholder="Précisez le pack" className={INPUT_CLASS} />
                      <ErrorMessage name="packAutre" component="p" className={ERROR_CLASS} />
                    </div>
                  )}

                  <p className="text-xs font-bold text-ids-black uppercase tracking-widest pt-2">Situation du paiement</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={LABEL_CLASS}>Montant total du pack *</label>
                      <Field name="montantTotalPack" type="number" className={INPUT_CLASS} />
                      <ErrorMessage name="montantTotalPack" component="p" className={ERROR_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Montant payé ce jour *</label>
                      <Field name="montantPayeCeJour" type="number" className={INPUT_CLASS} />
                      <ErrorMessage name="montantPayeCeJour" component="p" className={ERROR_CLASS} />
                    </div>
                    <div>
                      <label className={LABEL_CLASS}>Reste à payer</label>
                      <div className={`${INPUT_CLASS} bg-ids-gray font-bold text-ids-black`}>
                        {reste.toLocaleString("fr-FR")} FCFA
                      </div>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-ids-black uppercase tracking-widest pt-2">Mode de paiement</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MODE_OPTIONS.map((m) => (
                      <label key={m.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${values.modePaiement === m.value ? "border-ids-red bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <Field type="radio" name="modePaiement" value={m.value} className="accent-ids-red" />
                        <span className="text-sm text-gray-700">{m.label}</span>
                      </label>
                    ))}
                  </div>
                  {values.modePaiement === "AUTRE" && (
                    <div>
                      <Field name="modePaiementAutre" placeholder="Précisez le mode de paiement" className={INPUT_CLASS} />
                      <ErrorMessage name="modePaiementAutre" component="p" className={ERROR_CLASS} />
                    </div>
                  )}
                  <div>
                    <label className={LABEL_CLASS}>Référence du paiement</label>
                    <Field name="referencePaiement" className={INPUT_CLASS} />
                  </div>

                  <div>
                    <label className={LABEL_CLASS}>Nom du représentant IDS *</label>
                    <Field name="nomRepresentant" className={INPUT_CLASS} />
                    <ErrorMessage name="nomRepresentant" component="p" className={ERROR_CLASS} />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer bg-ids-gray rounded-xl p-4">
                    <Field type="checkbox" name="confirmation" className="accent-ids-red w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      Je confirme que le client a reçu un exemplaire du contrat, que les clauses lui ont été
                      expliquées, qu'il reconnaît avoir lu et accepté l'ensemble des clauses, et que le montant
                      indiqué correspond au paiement effectué ce jour.
                    </span>
                  </label>
                  <ErrorMessage name="confirmation" component="p" className={ERROR_CLASS} />

                  <Button type="submit" loading={isSubmitting} fullWidth size="lg">
                    Créer le contrat
                  </Button>
                </Form>
              );
            }}
          </Formik>
        )}
      </Modal>

      {/* Liste contrats */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : contrats.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaFilePdf size={32} className="mx-auto mb-3 opacity-30" />
            <p>Aucun contrat créé pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-ids-gray">
                  {["N° Contrat", "Client", "Pack", "Payé ce jour", "Reste", "Mode", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contrats.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-mono text-ids-red font-bold">{c.numeroContrat}</td>
                    <td className="px-4 py-3 text-sm">
                      <p className="font-semibold text-ids-black">{c.nomClient}</p>
                      {c.etudiant && <p className="text-gray-400 text-xs">{c.etudiant.numeroInscription}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {PACK_OPTIONS.find((p) => p.value === c.packConcerne)?.label ?? c.packConcerne}
                    </td>
                    <td className="px-4 py-3 text-xs text-green-600 font-semibold">
                      {c.montantPayeCeJour.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-xs text-red-500 font-semibold">
                      {c.resteAPayer.toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {MODE_OPTIONS.find((m) => m.value === c.modePaiement)?.label ?? c.modePaiement}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(c.dateSignature).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleDownloadPDF(c.id, c.numeroContrat)}
                          className="flex items-center gap-1 text-ids-red hover:text-red-700 text-xs font-semibold transition-colors"
                        >
                          <FaFilePdf size={13} />
                          PDF
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(c)}
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

      {/* Modal Suppression */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmer la suppression" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Voulez-vous vraiment supprimer le contrat <strong>{deleteTarget?.numeroContrat}</strong> ?
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
