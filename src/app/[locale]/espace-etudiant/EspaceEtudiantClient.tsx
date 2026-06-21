"use client";

const t = useTranslations("admin");
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-toastify";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  FaSignOutAlt, FaDownload, FaUserCircle,
  FaLayerGroup, FaFileInvoiceDollar, FaCheckCircle,
} from "react-icons/fa";
import { StatutBadge } from "@/components/ui/Badge";
import type { StatutInscription, NiveauAllemand } from "@/types";

interface Groupe {
  id: string; nom: string; niveau: NiveauAllemand; type: string;
  heureDebut: string; heureFin: string; salle: string; enseignant: string;
}

interface Facture {
  id: string; numeroRecu: string; formation: string;
  montantTotal: number; montantVerse: number; resteAPayer: number;
  modePaiement: string; date: string; statut: string;
}

interface EtudiantData {
  id: string; numeroInscription: string; nom: string; prenom: string;
  email: string; telephone: string; photoUrl?: string;
  niveauAllemand: NiveauAllemand; statut: StatutInscription;
  dateInscription: string;
  groupes: { groupe: Groupe }[];
  factures: Facture[];
}

const MODE_LABELS: Record<string, string> = {
  ESPECES: "Espèces", VIREMENT: "Virement", PAYPAL: "PayPal",
  ORANGE_MONEY: "Orange Money", MTN_MONEY: "MTN Mobile Money",
};

export default function EspaceEtudiantClient({ etudiant }: { etudiant: EtudiantData }) {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "fr";
  const t = useTranslations("studentSpace");
  const ta = useTranslations("auth");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success(ta("logout"));
    router.push(`/${locale}/connexion`);
  };

  const handleDownloadReceipt = async (factureId: string, numero: string) => {
    try {
      const res = await fetch(`/api/admin/factures/${factureId}/pdf`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `recu-${numero}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Erreur lors du téléchargement."); }
  };

  const groupe = etudiant.groupes?.[0]?.groupe;
  const dateInscription = new Date(etudiant.dateInscription).toLocaleDateString();

  return (
    <div className="min-h-screen bg-ids-gray">
      <div className="bg-ids-black text-white">
        <div className="container-ids py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
              {etudiant.photoUrl ? (
                <Image src={etudiant.photoUrl} alt={etudiant.nom} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaUserCircle className="text-gray-500" size={40} />
                </div>
              )}
            </div>
            <div>
              <p className="text-ids-gold font-bold text-xs uppercase tracking-widest mb-0.5">{t("title")}</p>
              <h1 className="font-display text-xl font-bold">{t("welcomeMsg")} {etudiant.prenom} {etudiant.nom}</h1>
              <p className="text-gray-400 text-xs mt-0.5">{etudiant.numeroInscription} — {dateInscription}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors">
            <FaSignOutAlt size={14} />
            <span className="hidden sm:inline">{ta("logout")}</span>
          </button>
        </div>
      </div>

      <div className="container-ids py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t("statusLabel")}</p>
            <StatutBadge statut={etudiant.statut} />
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">{t("levelLabel")}</p>
            <span className="inline-block bg-ids-black text-ids-gold font-bold text-lg px-4 py-1.5 rounded-lg">{etudiant.niveauAllemand}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Groupe */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-ids-red/10 flex items-center justify-center">
                <FaLayerGroup className="text-ids-red" size={16} />
              </div>
              <h2 className="font-display font-bold text-ids-black">{t("myGroup")}</h2>
            </div>
            {groupe ? (
              <div className="bg-ids-gray rounded-xl p-4">
                <p className="font-bold text-ids-black text-sm mb-3">{groupe.nom}</p>
                {[
                  [t("levelLabel"), groupe.niveau],
                  ["Format", groupe.type],
                  ["Horaire", `${groupe.heureDebut} – ${groupe.heureFin}`],
                  ["Salle", groupe.salle],
                  ["Enseignant", groupe.enseignant],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-1.5 border-b border-gray-200 last:border-0">
                    <span className="text-gray-500 text-xs">{label}</span>
                    <span className="font-semibold text-ids-black text-xs">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FaLayerGroup size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">{etudiant.statut === "VALIDE" ? t("noGroup") : t("notValidated")}</p>
              </div>
            )}
          </motion.div>

          {/* Documents */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-ids-red/10 flex items-center justify-center">
                <FaFileInvoiceDollar className="text-ids-red" size={16} />
              </div>
              <h2 className="font-display font-bold text-ids-black">{t("myDocuments")}</h2>
            </div>
            {etudiant.factures.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("receiptsTitle")}</p>
                {etudiant.factures.map((facture) => (
                  <div key={facture.id} className="flex items-center justify-between p-3 bg-ids-gray rounded-xl">
                    <div>
                      <p className="font-bold text-ids-black text-xs">{facture.numeroRecu}</p>
                      <p className="text-gray-400 text-xs">
                        {facture.montantVerse.toLocaleString()} FCFA — {MODE_LABELS[facture.modePaiement] ?? facture.modePaiement}
                      </p>
                    </div>
                    <button onClick={() => handleDownloadReceipt(facture.id, facture.numeroRecu)}
                      className="flex items-center gap-1.5 text-ids-red text-xs font-semibold hover:text-red-700 transition-colors">
                      <FaDownload size={11} /> PDF
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <FaFileInvoiceDollar size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t("noReceipts")}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Infos */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-ids-red/10 flex items-center justify-center">
              <FaCheckCircle className="text-ids-red" size={16} />
            </div>
            <h2 className="font-display font-bold text-ids-black">{t("infoTitle")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[["Email", etudiant.email], ["Téléphone", etudiant.telephone], [t("levelLabel"), etudiant.niveauAllemand]].map(([label, value]) => (
              <div key={label} className="bg-ids-gray rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-1">{label}</p>
                <p className="font-bold text-ids-black text-sm">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}