"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaTrash,
  FaKey,
  FaDownload,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Modal from "@/components/ui/Modal";
import { StatutBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type { StatutInscription, NiveauAllemand } from "@/types";

interface Etudiant {
  id: string;
  numeroInscription: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  niveauAllemand: NiveauAllemand;
  statut: StatutInscription;
  dateInscription: string;
  photoUrl?: string;
  objectif: string;
  ville: string;
  nationalite: string;
  niveauEtudes: string;
  profession?: string;
}

const OBJECTIF_LABELS: Record<string, string> = {
  ETUDES_ALLEMAGNE: "Études en Allemagne",
  TRAVAIL: "Travail",
  EXAMEN: "Préparation examen",
  VOYAGE: "Voyage",
  AUTRE: "Autre",
};

export default function EtudiantsClient() {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [niveauFilter, setNiveauFilter] = useState("");

  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
  const [modalType, setModalType] = useState<"detail" | "refuse" | "delete" | null>(null);
  const [motifRefus, setMotifRefus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEtudiants = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(search && { search }),
        ...(statutFilter && { statut: statutFilter }),
        ...(niveauFilter && { niveau: niveauFilter }),
      });
      const res = await fetch(`/api/admin/etudiants?${params}`);
      const data = await res.json();
      if (data.success) {
        setEtudiants(data.data.etudiants);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch {
      toast.error("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statutFilter, niveauFilter]);

  useEffect(() => { fetchEtudiants(); }, [fetchEtudiants]);

  const handleAction = async (action: string, id: string, body?: object) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/etudiants/${id}/${action}`, {
        method: action === "detail" ? "GET" : "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(
        action === "valider" ? "Étudiant validé !" :
        action === "refuser" ? "Dossier refusé." :
        action === "reset-password" ? "Mot de passe réinitialisé." :
        "Action effectuée."
      );
      fetchEtudiants();
      setModalType(null);
      setSelectedEtudiant(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/etudiants/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Étudiant supprimé.");
      fetchEtudiants();
      setModalType(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["N° Inscription", "Nom", "Prénom", "Email", "Niveau", "Statut", "Date"];
    const rows = etudiants.map((e) => [
      e.numeroInscription, e.nom, e.prenom, e.email,
      e.niveauAllemand, e.statut,
      new Date(e.dateInscription).toLocaleDateString("fr-FR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `etudiants-ids-${Date.now()}.csv`;
    a.click();
  };

  const PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%230A0A0A' rx='20'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23D4AF37' font-size='14'%3E%3F%3C/text%3E%3C/svg%3E";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ids-black">
            Gestion des étudiants
          </h1>
          <p className="text-gray-400 text-sm">
            {etudiants.length} résultats affichés
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm">
          <FaDownload size={13} />
          Exporter CSV
        </Button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Rechercher nom, numéro, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ids-red"
          />
        </div>
        <select
          value={statutFilter}
          onChange={(e) => { setStatutFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ids-red bg-white"
        >
          <option value="">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="VALIDE">Validé</option>
          <option value="REFUSE">Refusé</option>
        </select>
        <select
          value={niveauFilter}
          onChange={(e) => { setNiveauFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ids-red bg-white"
        >
          <option value="">Tous les niveaux</option>
          {["A1", "A2", "B1", "B2", "C1"].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : etudiants.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FaSearch size={32} className="mx-auto mb-3 opacity-30" />
            <p>Aucun étudiant trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-ids-gray text-left">
                  {["N° Inscription", "Étudiant", "Niveau", "Statut", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {etudiants.map((e, i) => (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs font-mono text-ids-red font-bold">
                      {e.numeroInscription}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={e.photoUrl ?? PLACEHOLDER}
                            alt={e.nom}
                            fill
                            className="object-cover"
                            onError={(ev) => {
                              (ev.target as HTMLImageElement).src = PLACEHOLDER;
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-ids-black text-sm">
                            {e.prenom} {e.nom}
                          </p>
                          <p className="text-gray-400 text-xs">{e.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-ids-black text-ids-gold font-bold text-xs px-2.5 py-1 rounded-lg">
                        {e.niveauAllemand}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatutBadge statut={e.statut} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(e.dateInscription).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setSelectedEtudiant(e); setModalType("detail"); }}
                          title="Voir détails"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <FaEye size={13} />
                        </button>
                        {e.statut === "EN_ATTENTE" && (
                          <>
                            <button
                              onClick={() => handleAction("valider", e.id)}
                              title="Valider"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
                            >
                              <FaCheck size={13} />
                            </button>
                            <button
                              onClick={() => { setSelectedEtudiant(e); setModalType("refuse"); }}
                              title="Refuser"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-500 hover:bg-orange-50 transition-colors"
                            >
                              <FaTimes size={13} />
                            </button>
                          </>
                        )}
                        {e.statut === "VALIDE" && (
                          <button
                            onClick={() => handleAction("reset-password", e.id)}
                            title="Régénérer mot de passe"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-ids-gold hover:bg-yellow-50 transition-colors"
                          >
                            <FaKey size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedEtudiant(e); setModalType("delete"); }}
                          title="Supprimer"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Page {page} sur {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 disabled:opacity-40 hover:border-ids-red hover:text-ids-red transition-colors"
              >
                <FaChevronLeft size={12} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 disabled:opacity-40 hover:border-ids-red hover:text-ids-red transition-colors"
              >
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Détail */}
      <Modal
        isOpen={modalType === "detail"}
        onClose={() => { setModalType(null); setSelectedEtudiant(null); }}
        title={`Dossier : ${selectedEtudiant?.numeroInscription}`}
        size="lg"
      >
        {selectedEtudiant && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={selectedEtudiant.photoUrl ?? PLACEHOLDER}
                  alt={selectedEtudiant.nom}
                  fill
                  className="object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER; }}
                />
              </div>
              <div>
                <h3 className="font-bold text-ids-black">
                  {selectedEtudiant.prenom} {selectedEtudiant.nom}
                </h3>
                <p className="text-gray-400 text-sm">{selectedEtudiant.email}</p>
                <StatutBadge statut={selectedEtudiant.statut} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Niveau", selectedEtudiant.niveauAllemand],
                ["Téléphone", selectedEtudiant.telephone],
                ["Ville", selectedEtudiant.ville],
                ["Nationalité", selectedEtudiant.nationalite],
                ["Niveau d'études", selectedEtudiant.niveauEtudes],
                ["Profession", selectedEtudiant.profession ?? "—"],
                ["Objectif", OBJECTIF_LABELS[selectedEtudiant.objectif] ?? selectedEtudiant.objectif],
                ["Date inscription", new Date(selectedEtudiant.dateInscription).toLocaleDateString("fr-FR")],
              ].map(([label, value]) => (
                <div key={label} className="bg-ids-gray rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-1">{label}</p>
                  <p className="font-semibold text-ids-black text-sm">{value}</p>
                </div>
              ))}
            </div>
            {selectedEtudiant.statut === "EN_ATTENTE" && (
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => handleAction("valider", selectedEtudiant.id)}
                  loading={actionLoading}
                  fullWidth
                >
                  Valider le dossier
                </Button>
                <Button
                  onClick={() => setModalType("refuse")}
                  variant="outline"
                  fullWidth
                >
                  Refuser
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Refus */}
      <Modal
        isOpen={modalType === "refuse"}
        onClose={() => { setModalType(null); setMotifRefus(""); }}
        title="Motif du refus"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-500 text-sm">
            Indiquez la raison du refus. Un email sera envoyé automatiquement
            à l'étudiant.
          </p>
          <textarea
            value={motifRefus}
            onChange={(e) => setMotifRefus(e.target.value)}
            rows={4}
            placeholder="Expliquez le motif du refus..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ids-red resize-none"
          />
          <Button
            onClick={() =>
              selectedEtudiant &&
              handleAction("refuser", selectedEtudiant.id, { motif: motifRefus })
            }
            loading={actionLoading}
            disabled={!motifRefus.trim()}
            variant="danger"
            fullWidth
          >
            Confirmer le refus
          </Button>
        </div>
      </Modal>

      {/* Modal Suppression */}
      <Modal
        isOpen={modalType === "delete"}
        onClose={() => setModalType(null)}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Voulez-vous vraiment supprimer le dossier de{" "}
            <strong>{selectedEtudiant?.prenom} {selectedEtudiant?.nom}</strong> ?
            Cette action est irréversible.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => selectedEtudiant && handleDelete(selectedEtudiant.id)}
              loading={actionLoading}
              variant="danger"
              fullWidth
            >
              Supprimer
            </Button>
            <Button
              onClick={() => setModalType(null)}
              variant="outline"
              fullWidth
            >
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}