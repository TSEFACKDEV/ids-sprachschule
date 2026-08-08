import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import type { FacturePublic, EtudiantPublic } from "@/types";

const IDS_RED = rgb(0.8, 0, 0);
const IDS_GOLD = rgb(0.83, 0.686, 0.216);
const IDS_BLACK = rgb(0.039, 0.039, 0.039);
const IDS_GRAY = rgb(0.96, 0.96, 0.96);
const IDS_LIGHT_GRAY = rgb(0.75, 0.75, 0.75);
const IDS_DARK_GRAY = rgb(0.45, 0.45, 0.45);

const LABEL_NATURE: Record<string, string> = {
  ACOMPTE: "Avance (Acompte)",
  TOTAL: "Paiement total",
};

const LABEL_MODE: Record<string, string> = {
  ESPECES: "Especes",
  VIREMENT: "Virement",
  PAYPAL: "PayPal",
  ORANGE_MONEY: "Orange Money",
  MTN_MONEY: "MTN Mobile Money",
};

// Caractères WinAnsi "étendus" (au-delà de \x00-\xFF) à préserver.
const WINANSI_EXTRA: Record<number, number> = {
  0x2013: 0x96, // – en dash
  0x2014: 0x97, // — em dash
  0x2018: 0x91, // ‘
  0x2019: 0x92, // ’
  0x201C: 0x93, // “
  0x201D: 0x94, // ”
  0x20AC: 0x80, // €
  0x2022: 0x95, // •
  0x2026: 0x85, // …
};

/**
 * Conforme la chaîne au sous-ensemble WinAnsi (pdf-lib).
 * Les espaces insécables sont remplacés par un espace normal ; les
 * caractères "étendus" WinAnsi (tirets, guillemets, €, ...) sont mappés
 * vers leur octet WinAnsi, et tout le reste devient "?".
 */
function sanitize(str: string): string {
  return str
    .replace(/[\u00a0\u202f\u2009\u2007\u2008]/g, " ")
    .replace(/[^\x00-\xFF]/g, (ch) => {
      const mapped = WINANSI_EXTRA[ch.charCodeAt(0)];
      return mapped !== undefined ? String.fromCharCode(mapped) : "?";
    });
}

/**
 * Formate un montant en FCFA sans toLocaleString (évite les espaces insécables).
 */
function formatMontant(n: number): string {
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

  // ── En-tête PDF (logo large, fond blanc) ──
  page.drawRectangle({
    x: 0,
    y: height - 110,
    width,
    height: 110,
    color: rgb(1, 1, 1),
  });

  const logoPath = path.join(process.cwd(), "logo.jpeg");
  if (fs.existsSync(logoPath)) {
    try {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImage = await pdfDoc.embedJpg(logoBytes);
      page.drawImage(logoImage, { x: 30, y: height - 98, width: 220, height: 80 });
    } catch {
      // Logo non lisible, on continue sans
    }
  }

  // ── Titre ──
  page.drawText("RECU DE PAIEMENT", {
    x: width / 2 - 80,
    y: height - 148,
    size: 18,
    font: fontBold,
    color: IDS_BLACK,
  });

  page.drawText(sanitize(`N° : ${facture.numeroRecu}`), {
    x: width / 2 - 75,
    y: height - 170,
    size: 11,
    font: fontRegular,
    color: IDS_RED,
  });

  page.drawLine({
    start: { x: 32, y: height - 190 },
    end: { x: width - 32, y: height - 190 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  // ── Champs dynamiques (remplis après soumission du formulaire) ──
  const date = new Date(facture.date);
  const dateStr = sanitize(
    `${String(date.getDate()).padStart(2, "0")} / ${String(date.getMonth() + 1).padStart(2, "0")} / ${date.getFullYear()}`
  );

  const rows: [string, string][] = [
    ["Date", dateStr],
    ["Nom de l'etudiant(e)", sanitize(`${etudiant.prenom} ${etudiant.nom}`)],
    ["Formation / Service", sanitize(facture.formation)],
    ["Montant total de la formation", sanitize(formatMontant(facture.montantTotal))],
    ["Montant verse", sanitize(formatMontant(facture.montantVerse))],
    ["Reste a payer", sanitize(formatMontant(facture.resteAPayer))],
    ["Nature du paiement", sanitize(LABEL_NATURE[facture.nature] ?? facture.nature)],
    ["Mode de paiement", sanitize(LABEL_MODE[facture.modePaiement] ?? facture.modePaiement)],
  ];

  let y = height - 224;

  for (const [label, value] of rows) {
    page.drawRectangle({
      x: 32,
      y: y - 6,
      width: width - 64,
      height: 26,
      color: IDS_GRAY,
    });

    page.drawText(label, {
      x: 44,
      y: y + 2,
      size: 10,
      font: fontBold,
      color: IDS_BLACK,
    });

    page.drawText(":", {
      x: 268,
      y: y + 2,
      size: 10,
      font: fontBold,
      color: IDS_BLACK,
    });

    page.drawText(value, {
      x: 282,
      y: y + 2,
      size: 10,
      font: fontRegular,
      color: IDS_BLACK,
    });

    y -= 34;
  }

  y -= 10;

  // Divider
  page.drawLine({
    start: { x: 32, y },
    end: { x: width - 32, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  y -= 36;

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

  y -= 58;

  // ── Pied de page ──
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height: 38,
    color: IDS_BLACK,
  });

  page.drawText(
    "IDS-Sprachschule - Yaounde, Cameroun",
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
