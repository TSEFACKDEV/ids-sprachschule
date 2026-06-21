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
  etudiants: { etudiant: EtudiantOption }[];
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
  type: "SEMAINE_MATIN",
  heureDebut: "08:00",
  heureFin: "10:00",
  salle: "",
  enseignant: "",
  etudiantIds: [] as string[],
};

const INPUT_CLASS =
  "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ids-red";

export default function GroupesClient() {
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [etudiants, setEtudiants] = useState<EtudiantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Groupe | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [groupesRes, etudiantsRes] = await Promise.all([
        fetch("/api/admin/groupes"),
        fetch("/api/admin/etudiants/valides"),
      ]);
      const [gd, ed] = await Promise.all([groupesRes.json(), etudiantsRes.json()]);
      if (gd.success) setGroupes(gd.data);
      if (ed.success) setEtudiants(ed.data);
    } catch {
      toast.error("Erreur chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (groupe: Groupe) => {
    setEditing(groupe);
    setForm({
      nom: groupe.nom,
      niveau: groupe.niveau,
      type: groupe.type,
      heureDebut: groupe.heureDebut,
      heureFin: groupe.heureFin,
      salle: groupe.salle,
      enseignant: groupe.enseignant,
      etudiantIds: groupe.etudiants.map((e) => e.etudiant.id),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nom || !form.salle || !form.enseignant) {
      toast.error("Remplissez tous les champs obligatoires.");
      return;
    }
    setSaving(true);
    try {
      const url = editing
        ? `/api/admin/groupes/${editing.id}`
        : "/api/admin/groupes";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(editing ? "Groupe mis à jour !" : "Groupe créé !");
      setShowModal(false);
      fetchData();
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
      fetchData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur.");
    }
  };

  const filteredEtudiants = etudiants.filter(
    (e) => !form.niveau || e.niveauAllemand === form.niveau
  );

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
                  <div className="w-10 h-10 rounded-xl bg-ids-black flex items-center justify-center">
                    <span className="text-ids-gold font-bold text-sm">
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
                    {groupe.etudiants.length} étudiant(s)
                  </span>
                  <button
                    onClick={() => openEdit(groupe)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaEdit size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(groupe.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <FaTrash size={12} />
                  </button>
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
                            {groupe.etudiants.map(({ etudiant }) => (
                              <div
                                key={etudiant.id}
                                className="flex items-center gap-2 p-2 bg-ids-gray rounded-lg"
                              >
                                <div className="w-6 h-6 rounded-full bg-ids-red flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-bold">
                                    {etudiant.prenom[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-ids-black leading-tight">
                                    {etudiant.prenom} {etudiant.nom}
                                  </p>
                                  <p className="text-gray-400 text-xs">
                                    {etudiant.numeroInscription}
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
              </select>
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">
              Étudiants (niveau {form.niveau} validés)
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
                        {e.numeroInscription}
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

          <Button onClick={handleSave} loading={saving} fullWidth size="lg">
            {editing ? "Mettre à jour" : "Créer le groupe"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}