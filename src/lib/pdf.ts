import { PDFDocument, rgb, StandardFonts, type PDFPage } from "pdf-lib";
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

export interface ContratPublic {
  numeroContrat: string;
  nomClient: string;
  cniPasseport: string;
  telephone: string;
  montantVerseFCFA: number;
  montantVerseLettres: string;
  montantVerseEUR?: number | null;
  packConcerne: string;
  packAutre?: string | null;
  montantTotalPack: number;
  montantPayeCeJour: number;
  resteAPayer: number;
  modePaiement: string;
  modePaiementAutre?: string | null;
  referencePaiement?: string | null;
  declarationRecuExemplaire: boolean;
  declarationClausesExpliquees: boolean;
  declarationLuComprisAccepte: boolean;
  declarationMontantConforme: boolean;
  nomRepresentant: string;
  dateSignature: string;
}

const LABEL_PACK: Record<string, string> = {
  PACK_STANDARD: "Pack Etudiant Standard",
  PACK_SERENITE: "Pack Etudiant Serenite",
  PACK_EXTERNE_STANDARD: "Pack Externe Standard",
  PACK_EXTERNE_SERENITE: "Pack Externe Serenite",
  AUTRE: "Autre",
};

const LABEL_MODE_CONTRAT: Record<string, string> = {
  ESPECES: "Especes",
  ORANGE_MONEY: "Orange Money",
  MTN_MONEY: "MTN Mobile Money",
  VIREMENT: "Virement bancaire",
  AUTRE: "Autre",
};

export async function generateContratPDF(contrat: ContratPublic): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pageSize: [number, number] = [595, 842];
  const marginX = 40;

  let page: PDFPage = pdfDoc.addPage(pageSize);
  const { width, height } = page.getSize();
  let y = height - 40;

  const drawFooter = (p: PDFPage) => {
    p.drawRectangle({ x: 0, y: 0, width, height: 34, color: IDS_BLACK });
    p.drawText(
      sanitize("IDS - Biyem-Assi, Carrefour Scalom, Yaounde | info@ids-sprachschule.com | WhatsApp : +49 1573 0323154"),
      { x: marginX, y: 12, size: 7.5, font: fontRegular, color: rgb(0.6, 0.6, 0.6) }
    );
  };

  const newPage = () => {
    drawFooter(page);
    page = pdfDoc.addPage(pageSize);
    y = height - 40;
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < 44) newPage();
  };

  const sectionTitle = (title: string) => {
    ensureSpace(26);
    page.drawRectangle({ x: marginX, y: y - 4, width: width - marginX * 2, height: 18, color: IDS_BLACK });
    page.drawText(sanitize(title), { x: marginX + 8, y: y, size: 9.5, font: fontBold, color: IDS_GOLD });
    y -= 26;
  };

  const row = (label: string, value: string) => {
    ensureSpace(20);
    page.drawText(sanitize(label), { x: marginX, y, size: 9, font: fontBold, color: IDS_BLACK });
    page.drawText(sanitize(value || "-"), { x: marginX + 190, y, size: 9, font: fontRegular, color: IDS_BLACK });
    y -= 18;
  };

  const checkbox = (label: string, checked: boolean) => {
    ensureSpace(16);
    page.drawText(sanitize(checked ? "[X]" : "[ ]"), { x: marginX, y, size: 9, font: fontBold, color: checked ? IDS_RED : rgb(0.6, 0.6, 0.6) });
    page.drawText(sanitize(label), { x: marginX + 24, y, size: 9, font: fontRegular, color: IDS_BLACK });
    y -= 16;
  };

  // ── Header ──
  page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: IDS_BLACK });
  const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
  if (fs.existsSync(logoPath)) {
    try {
      const logoImage = await pdfDoc.embedPng(fs.readFileSync(logoPath));
      page.drawImage(logoImage, { x: marginX - 8, y: height - 82, width: 56, height: 56 });
    } catch {
      // pas de logo, on continue
    }
  }
  page.drawText("IDS - Institut fur die Deutsche Sprache", {
    x: marginX + 60, y: height - 40, size: 12, font: fontBold, color: IDS_GOLD,
  });
  page.drawText("Recu de paiement et attestation de remise du contrat", {
    x: marginX + 60, y: height - 56, size: 9.5, font: fontRegular, color: rgb(0.8, 0.8, 0.8),
  });
  page.drawText(sanitize(`N ${contrat.numeroContrat}`), {
    x: marginX + 60, y: height - 72, size: 9, font: fontRegular, color: IDS_RED,
  });

  y = height - 112;

  const dateSig = new Date(contrat.dateSignature);
  const dateStr = `${String(dateSig.getDate()).padStart(2, "0")} / ${String(dateSig.getMonth() + 1).padStart(2, "0")} / ${dateSig.getFullYear()}`;

  sectionTitle("INFORMATIONS DU CLIENT");
  row("Nom et prenom", contrat.nomClient);
  row("CNI / Passeport", contrat.cniPasseport);
  row("Telephone", contrat.telephone);

  y -= 6;
  sectionTitle("PAIEMENT");
  row("Montant verse (FCFA)", formatMontant(contrat.montantVerseFCFA));
  row("En lettres", contrat.montantVerseLettres);
  row("Equivalent (EUR)", contrat.montantVerseEUR != null ? `${contrat.montantVerseEUR} EUR` : "-");

  y -= 6;
  sectionTitle("PACK CONCERNE");
  for (const key of ["PACK_STANDARD", "PACK_SERENITE", "PACK_EXTERNE_STANDARD", "PACK_EXTERNE_SERENITE", "AUTRE"]) {
    const checked = contrat.packConcerne === key;
    const label = key === "AUTRE" && checked && contrat.packAutre
      ? `Autre : ${contrat.packAutre}`
      : LABEL_PACK[key];
    checkbox(label, checked);
  }

  y -= 6;
  sectionTitle("SITUATION DU PAIEMENT");
  row("Montant total du pack", formatMontant(contrat.montantTotalPack));
  row("Montant paye ce jour", formatMontant(contrat.montantPayeCeJour));
  row("Reste a payer", formatMontant(contrat.resteAPayer));

  y -= 6;
  sectionTitle("MODE DE PAIEMENT");
  for (const key of ["ESPECES", "ORANGE_MONEY", "MTN_MONEY", "VIREMENT", "AUTRE"]) {
    const checked = contrat.modePaiement === key;
    const label = key === "AUTRE" && checked && contrat.modePaiementAutre
      ? `Autre : ${contrat.modePaiementAutre}`
      : LABEL_MODE_CONTRAT[key];
    checkbox(label, checked);
  }
  row("Reference du paiement", contrat.referencePaiement ?? "-");

  y -= 6;
  sectionTitle("DECLARATION DU CLIENT");
  checkbox("J'ai recu un exemplaire du contrat de prestation de services conclu avec IDS.", contrat.declarationRecuExemplaire);
  checkbox("Les clauses du contrat m'ont ete expliquees de maniere claire par un representant d'IDS.", contrat.declarationClausesExpliquees);
  checkbox("Je reconnais avoir lu, compris et accepte l'ensemble des clauses du contrat avant sa signature.", contrat.declarationLuComprisAccepte);
  checkbox("Je reconnais que le montant indique ci-dessus correspond au paiement effectue ce jour.", contrat.declarationMontantConforme);

  y -= 14;
  ensureSpace(90);
  page.drawText(sanitize(`Fait a Yaounde, le ${dateStr}`), { x: marginX, y, size: 9.5, font: fontBold, color: IDS_BLACK });
  y -= 30;

  const colWidth = (width - marginX * 2) / 2;
  page.drawText("Le Client", { x: marginX, y, size: 9.5, font: fontBold, color: IDS_RED });
  page.drawText("Pour IDS", { x: marginX + colWidth, y, size: 9.5, font: fontBold, color: IDS_RED });
  y -= 18;
  page.drawText(sanitize("Nom : ________________________________"), { x: marginX, y, size: 9, font: fontRegular, color: IDS_BLACK });
  page.drawText(sanitize(`Nom : ${contrat.nomRepresentant}`), { x: marginX + colWidth, y, size: 9, font: fontRegular, color: IDS_BLACK });
  y -= 20;
  page.drawText(sanitize("Signature : ___________________________"), { x: marginX, y, size: 9, font: fontRegular, color: IDS_BLACK });
  page.drawText(sanitize("Signature : ___________________________"), { x: marginX + colWidth, y, size: 9, font: fontRegular, color: IDS_BLACK });
  y -= 26;
  page.drawText(sanitize("Cachet de l'entreprise :"), { x: marginX, y, size: 9, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });

  drawFooter(page);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}