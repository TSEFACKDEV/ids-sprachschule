"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { FaFilePdf, FaDownload } from "react-icons/fa";
import Button from "@/components/ui/Button";

export default function RecusClient() {
  const [downloading, setDownloading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/recus/pdf");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors du téléchargement.");
      }
      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="?(.+?)"?$/);
      const filename = filenameMatch ? filenameMatch[1] : "recu.pdf";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setHistory((prev) => [filename, ...prev]);
      toast.success("Reçu téléchargé avec succès !");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ids-black">
          Reçus de paiement
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-ids-red/10 flex items-center justify-center mx-auto mb-6">
            <FaFilePdf className="text-ids-red" size={36} />
          </div>
          <h2 className="text-xl font-bold text-ids-black mb-3">
            Télécharger un reçu de paiement
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Cliquez sur le bouton ci-dessous pour générer et télécharger un reçu
            de paiement. Chaque reçu reçoit un numéro unique automatique et
            inclut le logo d&apos;IDS-Sprachschule.
          </p>
          <Button onClick={handleDownload} loading={downloading} size="lg">
            <FaDownload size={15} />
            Générer et télécharger un reçu
          </Button>
        </div>
      </div>

      {history.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-ids-black text-sm">
              Reçus générés cette session
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {history.map((filename, idx) => (
              <div key={idx} className="flex items-center gap-3 px-6 py-3">
                <FaFilePdf className="text-ids-red" size={14} />
                <span className="text-sm text-gray-700 font-mono">
                  {filename}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
