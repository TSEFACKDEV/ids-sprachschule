import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import type { FacturePublic, EtudiantPublic } from "@/types";

const IDS_RED = rgb(0.8, 0, 0);
const IDS_GOLD = rgb(0.83, 0.686, 0.216);
const IDS_BLACK = rgb(0.039, 0.039, 0.039);
const IDS_GRAY = rgb(0.96, 0.96, 0.96);

const LABEL_NATURE: Record<string, string> = {
  ACOMPTE: "Avance (Acompte)",
  TOTAL: "Paiement total",
};

const LABEL_MODE: Record<string, string> = {
  ESPECES: "Especes",
  VIREMENT: "Virement bancaire",
  PAYPAL: "PayPal",
  ORANGE_MONEY: "Orange Money",
  MTN_MONEY: "MTN Mobile Money",
};

/**
 * Supprime tous les caractères non supportés par WinAnsi (pdf-lib).
 * Remplace les espaces insécables et narrow no-break spaces par un espace normal.
 */
function sanitize(str: string): string {
  return str
    .replace(/[\u00a0\u202f\u2009\u2007\u2008]/g, " ") // espaces spéciaux → espace normal
    .replace(/[^\x00-\xFF]/g, "?"); // tout ce qui dépasse Latin-1 → ?
}

/**
 * Formate un montant en FCFA sans toLocaleString (évite les espaces insécables).
 */
function formatMontant(n: number): string {
  // Formatage manuel : séparateur de milliers = espace simple
  const parts = Math.round(n).toString().split("");
  const result: string[] = [];
  parts.reverse().forEach((d, i) => {
    if (i > 0 && i % 3 === 0) result.push(" ");
    result.push(d);
  });
  return result.reverse().join("") + " FCFA";
}

export async function generateRecuPDF(
  facture: FacturePublic,
  etudiant: EtudiantPublic
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const { width, height } = page.getSize();
  let y = height - 40;

  // ── Header background ──
  page.drawRectangle({
    x: 0,
    y: height - 110,
    width,
    height: 110,
    color: IDS_BLACK,
  });

  // Logo (si disponible)
  const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
  if (fs.existsSync(logoPath)) {
    try {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImage, { x: 32, y: height - 100, width: 70, height: 70 });
    } catch {
      // Logo non lisible, on continue sans
    }
  }

  // Texte header
  page.drawText("IDS - Institut fur die Deutsche Sprache", {
    x: 115,
    y: height - 52,
    size: 13,
    font: fontBold,
    color: IDS_GOLD,
  });

  page.drawText("Carrefour Scalom, Biyem-Assi, Yaounde, Cameroun", {
    x: 115,
    y: height - 68,
    size: 9,
    font: fontRegular,
    color: rgb(0.75, 0.75, 0.75),
  });

  page.drawText("WhatsApp : +49 1573 0323154  |  info@ids-sprachschule.com", {
    x: 115,
    y: height - 82,
    size: 9,
    font: fontRegular,
    color: rgb(0.65, 0.65, 0.65),
  });

  y = height - 130;

  // ── Titre ──
  page.drawText("RECU DE PAIEMENT", {
    x: width / 2 - 80,
    y,
    size: 18,
    font: fontBold,
    color: IDS_BLACK,
  });

  y -= 22;

  const date = new Date(facture.date);
  const dateStr = sanitize(
    `${String(date.getDate()).padStart(2, "0")} / ${String(date.getMonth() + 1).padStart(2, "0")} / ${date.getFullYear()}`
  );

  page.drawText(sanitize(`N° ${facture.numeroRecu}   |   Date : ${dateStr}`), {
    x: width / 2 - 110,
    y,
    size: 11,
    font: fontRegular,
    color: IDS_RED,
  });

  y -= 30;

  // Divider
  page.drawLine({
    start: { x: 32, y },
    end: { x: width - 32, y },
    thickness: 1,
    color: IDS_GRAY,
  });

  y -= 24;

  // ── Lignes de données ──
  const rows: [string, string][] = [
    ["Nom de l'etudiant(e)", sanitize(`${etudiant.prenom} ${etudiant.nom}`)],
    ["Formation / Service", sanitize(facture.formation)],
    ["Montant total", sanitize(formatMontant(facture.montantTotal))],
    ["Montant verse", sanitize(formatMontant(facture.montantVerse))],
    ["Reste a payer", sanitize(formatMontant(facture.resteAPayer))],
    ["Nature du paiement", sanitize(LABEL_NATURE[facture.nature] ?? facture.nature)],
    ["Mode de paiement", sanitize(LABEL_MODE[facture.modePaiement] ?? facture.modePaiement)],
  ];

  for (const [label, value] of rows) {
    // Fond alterné
    page.drawRectangle({
      x: 32,
      y: y - 6,
      width: width - 64,
      height: 26,
      color: rgb(0.97, 0.97, 0.97),
    });

    page.drawText(label, {
      x: 44,
      y: y + 2,
      size: 10,
      font: fontBold,
      color: IDS_BLACK,
    });

    page.drawText(value, {
      x: 270,
      y: y + 2,
      size: 10,
      font: fontRegular,
      color: IDS_BLACK,
    });

    y -= 34;
  }

  y -= 8;

  // Divider
  page.drawLine({
    start: { x: 32, y },
    end: { x: width - 32, y },
    thickness: 1,
    color: IDS_GRAY,
  });

  y -= 32;

  // ── Statut PAYÉ ──
  page.drawRectangle({
    x: width / 2 - 80,
    y: y - 8,
    width: 160,
    height: 32,
    color: IDS_RED,
  });

  page.drawText("STATUT : PAYE", {
    x: width / 2 - 52,
    y: y + 4,
    size: 13,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  y -= 56;

  // ── Remerciement ──
  page.drawText("Merci pour votre confiance et a tres bientot.", {
    x: width / 2 - 152,
    y,
    size: 11,
    font: fontRegular,
    color: rgb(0.45, 0.45, 0.45),
  });

  // ── Footer ──
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 38,
    color: IDS_BLACK,
  });

  page.drawText(
    "Institut fur die Deutsche Sprache - Yaounde, Cameroun",
    {
      x: width / 2 - 155,
      y: 14,
      size: 9,
      font: fontRegular,
      color: rgb(0.55, 0.55, 0.55),
    }
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}