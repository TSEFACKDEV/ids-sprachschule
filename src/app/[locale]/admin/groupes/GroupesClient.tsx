"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "motion/react";
import {
  FaPlus,
  FaChevronDown,
  FaEdit,
  FaTrash,
  FaLayerGroup,
  FaUserPlus,
  FaTimes,
} from "react-icons/fa";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";

interface EtudiantOption {
  id: string;
  nom: string;
  prenom: string;
  numeroInscription: string;
  niveauAllemand: string;
  typeCours: string;
}

interface Manuel {
  nom: string;
  prenom: string;
}

interface Membre {
  etudiant: EtudiantOption | null;
  nomManuel?: string | null;
  prenomManuel?: string | null;
}

interface Groupe {
  id: string;
  nom: string;
  niveau: string;
  type: string;
  heureDebut: string;
  heureFin: string;
  salle: string;
  enseignant: string;
  dateDebut: string | null;
  dateFin: string | null;
  etudiants: Membre[];
}

const NIVEAUX = ["A1", "A2", "B1", "B2", "C1"];
const TYPE_OPTIONS = [
  { value: "SEMAINE_MATIN", label: "Semaine Matin" },
  { value: "SEMAINE_SOIR", label: "Semaine Soir" },
  { value: "WEEKEND_SAT_DIM", label: "Week-end Sam+Dim" },
  { value: "WEEKEND_SAT_MER_DIM", label: "Week-end Sam+Mer+Dim" },
  { value: "EN_LIGNE", label: "En ligne" },
  { value: "PRESENTIEL", label: "En présentiel" },
];

const EMPTY_FORM = {
  nom: "",
  niveau: "A1",
  niveauAutre: "",
  type: "SEMAINE_MATIN",
  heureDebut: "08:00",
  heureFin: "10:00",
  salle: "",
  enseignant: "",
  dateDebut: "",
  dateFin: "",
  etudiantIds: [] as string[],
  manuels: [] as Manuel[],
};

const INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ids-red";

export default function GroupesClient({ isAdmin }: { isAdmin: boolean }) {
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [etudiants, setEtudiants] = useState<EtudiantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Groupe | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [manuelNom, setManuelNom] = useState("");
  const [manuelPrenom, setManuelPrenom] = useState("");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchGroupes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/groupes");
      const data = await res.json();
      if (data.success) setGroupes(data.data);
    } catch {
      toast.error("Erreur chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchGroupes();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchGroupes]);

  // Charge les étudiants validés éligibles à la sélection : ceux sans groupe,
  // plus (en édition) ceux déjà membres du groupe en cours d'édition.
  const fetchEtudiants = useCallback(async (groupeId?: string) => {
    try {
      const params = groupeId ? `?groupeId=${groupeId}` : "";
      const res = await fetch(`/api/admin/etudiants/valides${params}`);
      const data = await res.json();
      if (data.success) setEtudiants(data.data);
    } catch {
      toast.error("Erreur chargement des étudiants.");
    }
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setManuelNom("");
    setManuelPrenom("");
    fetchEtudiants();
    setShowModal(true);
  };

  const openEdit = (groupe: Groupe) => {
    setEditing(groupe);
    const niveauConnu = NIVEAUX.includes(groupe.niveau);
    setForm({
      nom: groupe.nom,
      niveau: niveauConnu ? groupe.niveau : "AUTRE",
      niveauAutre: niveauConnu ? "" : groupe.niveau,
      type: groupe.type,
      heureDebut: groupe.heureDebut,
      heureFin: groupe.heureFin,
      salle: groupe.salle,
      enseignant: groupe.enseignant,
      dateDebut: groupe.dateDebut ? groupe.dateDebut.split("T")[0] : "",
      dateFin: groupe.dateFin ? groupe.dateFin.split("T")[0] : "",
      etudiantIds: groupe.etudiants.filter((m) => m.etudiant).map((m) => m.etudiant!.id),
      manuels: groupe.etudiants
        .filter((m) => !m.etudiant)
        .map((m) => ({ nom: m.nomManuel ?? "", prenom: m.prenomManuel ?? "" })),
    });
    setManuelNom("");
    setManuelPrenom("");
    fetchEtudiants(groupe.id);
    setShowModal(true);
  };

  const addManuel = () => {
    if (!manuelNom.trim() || !manuelPrenom.trim()) return;
    setForm({ ...form, manuels: [...form.manuels, { nom: manuelNom.trim(), prenom: manuelPrenom.trim() }] });
    setManuelNom("");
    setManuelPrenom("");
  };

  const removeManuel = (index: number) => {
    setForm({ ...form, manuels: form.manuels.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    if (!form.nom || !form.salle || !form.enseignant) {
      toast.error("Remplissez tous les champs obligatoires.");
      return;
    }
    if (form.niveau === "AUTRE" && !form.niveauAutre.trim()) {
      toast.error("Précisez le niveau (ex : Préparation Goethe B2).");
      return;
    }
    setSaving(true);
    try {
      const niveauFinal = form.niveau === "AUTRE" ? form.niveauAutre.trim() : form.niveau;
      const url = editing ? `/api/admin/groupes/${editing.id}` : "/api/admin/groupes";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, niveau: niveauFinal }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(editing ? "Groupe mis à jour !" : "Groupe créé !");
      setShowModal(false);
      fetchGroupes();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce groupe ?")) return;
    try {
      const res = await fetch(`/api/admin/groupes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Groupe supprimé.");
      fetchGroupes();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur.");
    }
  };

  const filteredEtudiants =
    form.niveau === "AUTRE" ? etudiants : etudiants.filter((e) => e.niveauAllemand === form.niveau);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ids-black">
          Gestion des groupes
        </h1>
        <Button onClick={openCreate} size="sm">
          <FaPlus size={13} />
          Nouveau groupe
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : groupes.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm text-gray-400">
          <FaLayerGroup size={40} className="mx-auto mb-4 opacity-30" />
          <p>Aucun groupe créé. Commencez par en créer un.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groupes.map((groupe, i) => (
            <motion.div
              key={groupe.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-ids-black flex items-center justify-center flex-shrink-0">
                    <span className="text-ids-gold font-bold text-[10px] text-center leading-tight px-1">
                      {groupe.niveau}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-ids-black">{groupe.nom}</p>
                    <p className="text-gray-400 text-xs">
                      {TYPE_OPTIONS.find((t) => t.value === groupe.type)?.label} —{" "}
                      {groupe.heureDebut}–{groupe.heureFin} — Salle {groupe.salle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-ids-gray text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                    {groupe.etudiants.length} membre(s)
                  </span>
                  <button
                    onClick={() => openEdit(groupe)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaEdit size={13} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(groupe.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <FaTrash size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => setExpanded(expanded === groupe.id ? null : groupe.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <motion.span animate={{ rotate: expanded === groupe.id ? 180 : 0 }}>
                      <FaChevronDown size={12} />
                    </motion.span>
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expanded === groupe.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-gray-100">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 mb-4">
                        {[
                          ["Enseignant", groupe.enseignant],
                          ["Salle", groupe.salle],
                          ["Horaire", `${groupe.heureDebut} – ${groupe.heureFin}`],
                          ["Début", groupe.dateDebut ? new Date(groupe.dateDebut).toLocaleDateString("fr-FR") : "—"],
                          ["Fin", groupe.dateFin ? new Date(groupe.dateFin).toLocaleDateString("fr-FR") : "—"],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-ids-gray rounded-xl p-3">
                            <p className="text-gray-400 text-xs">{label}</p>
                            <p className="font-semibold text-ids-black text-sm">{value}</p>
                          </div>
                        ))}
                      </div>
                      {groupe.etudiants.length > 0 ? (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Membres
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {groupe.etudiants.map((m, idx) => (
                              <div
                                key={m.etudiant?.id ?? `manuel-${idx}`}
                                className="flex items-center gap-2 p-2 bg-ids-gray rounded-lg"
                              >
                                <div className="w-6 h-6 rounded-full bg-ids-red flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">
                                    {(m.etudiant?.prenom ?? m.prenomManuel ?? "?")[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-ids-black leading-tight">
                                    {m.etudiant ? `${m.etudiant.prenom} ${m.etudiant.nom}` : `${m.prenomManuel} ${m.nomManuel}`}
                                  </p>
                                  <p className="text-gray-400 text-xs">
                                    {m.etudiant ? m.etudiant.numeroInscription : "Ajouté manuellement"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">Aucun étudiant dans ce groupe.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal création/édition */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Modifier le groupe" : "Créer un groupe"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Nom du groupe *
              </label>
              <input
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="A1 – Groupe Matin 1"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Niveau *
              </label>
              <select
                value={form.niveau}
                onChange={(e) => setForm({ ...form, niveau: e.target.value })}
                className={INPUT_CLASS}
              >
                {NIVEAUX.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
                <option value="AUTRE">Autre (préparation examens, etc.)</option>
              </select>
            </div>
          </div>

          {form.niveau === "AUTRE" && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Précisez le niveau / l&apos;intitulé *
              </label>
              <input
                value={form.niveauAutre}
                onChange={(e) => setForm({ ...form, niveauAutre: e.target.value })}
                placeholder="Ex : Préparation Goethe B2"
                className={INPUT_CLASS}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={INPUT_CLASS}
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Salle *
              </label>
              <input
                value={form.salle}
                onChange={(e) => setForm({ ...form, salle: e.target.value })}
                placeholder="Salle 3"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Heure début
              </label>
              <input
                type="time"
                value={form.heureDebut}
                onChange={(e) => setForm({ ...form, heureDebut: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Heure fin
              </label>
              <input
                type="time"
                value={form.heureFin}
                onChange={(e) => setForm({ ...form, heureFin: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Enseignant *
              </label>
              <input
                value={form.enseignant}
                onChange={(e) => setForm({ ...form, enseignant: e.target.value })}
                placeholder="Prof. Müller"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Date de début du niveau
              </label>
              <input
                type="date"
                value={form.dateDebut}
                onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                Date de fin du niveau
              </label>
              <input
                type="date"
                value={form.dateFin}
                onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">
              Étudiants inscrits {form.niveau !== "AUTRE" && `(niveau ${form.niveau}, validés, non affectés)`}
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-3">
              {filteredEtudiants.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Aucun étudiant disponible pour ce niveau
                </p>
              ) : (
                filteredEtudiants.map((e) => (
                  <label
                    key={e.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.etudiantIds.includes(e.id)}
                      onChange={(ev) => {
                        setForm({
                          ...form,
                          etudiantIds: ev.target.checked
                            ? [...form.etudiantIds, e.id]
                            : form.etudiantIds.filter((id) => id !== e.id),
                        });
                      }}
                      className="accent-ids-red w-4 h-4"
                    />
                    <span className="text-sm text-ids-black">
                      {e.prenom} {e.nom}
                      <span className="text-gray-400 ml-2 text-xs">
                        {e.numeroInscription} — {e.typeCours}
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {form.etudiantIds.length} étudiant(s) sélectionné(s)
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">
              Ajouter un participant manuellement (non inscrit sur le site)
            </label>
            <div className="flex gap-2">
              <input
                value={manuelPrenom}
                onChange={(e) => setManuelPrenom(e.target.value)}
                placeholder="Prénom"
                className={INPUT_CLASS}
              />
              <input
                value={manuelNom}
                onChange={(e) => setManuelNom(e.target.value)}
                placeholder="Nom"
                className={INPUT_CLASS}
              />
              <button
                type="button"
                onClick={addManuel}
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-ids-black text-white flex items-center justify-center hover:bg-ids-red transition-colors"
                title="Ajouter"
              >
                <FaUserPlus size={14} />
              </button>
            </div>
            {form.manuels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {form.manuels.map((m, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2 bg-ids-gray text-ids-black text-xs font-semibold px-3 py-1.5 rounded-full">
                    {m.prenom} {m.nom}
                    <button type="button" onClick={() => removeManuel(idx)} className="text-gray-400 hover:text-red-500">
                      <FaTimes size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleSave} loading={saving} fullWidth size="lg">
            {editing ? "Mettre à jour" : "Créer le groupe"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
