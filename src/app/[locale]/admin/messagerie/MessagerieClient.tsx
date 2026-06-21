"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { motion } from "motion/react";
import { FaPaperPlane, FaEnvelopeOpen } from "react-icons/fa";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

interface Message {
  id: string;
  sujet: string;
  corps: string;
  destinataires: string[];
  envoye: boolean;
  sentAt?: string;
  createdAt: string;
}

const DEST_OPTIONS = [
  { value: "all", label: "Tous les étudiants validés" },
  { value: "A1", label: "Niveau A1" },
  { value: "A2", label: "Niveau A2" },
  { value: "B1", label: "Niveau B1" },
  { value: "B2", label: "Niveau B2" },
  { value: "C1", label: "Niveau C1" },
];

const INPUT_CLASS =
  "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-ids-red";

export default function MessagerieClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sujet, setSujet] = useState("");
  const [corps, setCorps] = useState("");
  const [destinataires, setDestinataires] = useState<string[]>(["all"]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/messagerie");
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch {
      toast.error("Erreur chargement messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const toggleDest = (value: string) => {
    if (value === "all") {
      setDestinataires(["all"]);
      return;
    }
    setDestinataires((prev) => {
      const without = prev.filter((d) => d !== "all");
      return without.includes(value)
        ? without.filter((d) => d !== value)
        : [...without, value];
    });
  };

  const handleSend = async () => {
    if (!sujet.trim() || !corps.trim() || destinataires.length === 0) {
      toast.error("Remplissez tous les champs.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/messagerie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sujet, corps, destinataires }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(`Message envoyé à ${data.data.sent} destinataire(s) !`);
      setSujet("");
      setCorps("");
      setDestinataires(["all"]);
      fetchMessages();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ids-black">
        Messagerie
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-display font-bold text-ids-black text-lg border-b border-gray-100 pb-3">
            Composer un message
          </h2>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
              Destinataires
            </label>
            <div className="flex flex-wrap gap-2">
              {DEST_OPTIONS.map((opt) => {
                const selected = destinataires.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleDest(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors ${
                      selected
                        ? "bg-ids-red text-white border-ids-red"
                        : "bg-white text-gray-600 border-gray-200 hover:border-ids-red"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
              Sujet *
            </label>
            <input
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              placeholder="Objet du message..."
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
              Message *
            </label>
            <textarea
              value={corps}
              onChange={(e) => setCorps(e.target.value)}
              rows={8}
              placeholder="Rédigez votre message ici..."
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>

          <Button onClick={handleSend} loading={sending} fullWidth size="lg">
            <FaPaperPlane size={14} />
            Envoyer le message
          </Button>
        </div>

        {/* Historique */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-display font-bold text-ids-black text-lg border-b border-gray-100 pb-3 mb-4">
            Historique des messages
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FaEnvelopeOpen size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucun message envoyé</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="font-semibold text-ids-black text-sm leading-tight">
                      {msg.sujet}
                    </p>
                    {msg.envoye ? (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                        Envoyé
                      </span>
                    ) : (
                      <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0">
                        En attente
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mb-2 line-clamp-2">
                    {msg.corps}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>
                      {Array.isArray(msg.destinataires)
                        ? msg.destinataires.join(", ")
                        : msg.destinataires}
                    </span>
                    <span>
                      {msg.sentAt
                        ? new Date(msg.sentAt).toLocaleDateString("fr-FR")
                        : new Date(msg.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}