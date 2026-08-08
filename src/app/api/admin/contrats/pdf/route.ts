import { NextResponse } from "next/server";
import { getAuthUser, isStaff } from "@/lib/auth";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

const IDS_RED = rgb(0.8, 0, 0);
const IDS_GOLD = rgb(0.83, 0.686, 0.216);
const IDS_BLACK = rgb(0.039, 0.039, 0.039);
const IDS_LIGHT_GRAY = rgb(0.75, 0.75, 0.75);
const IDS_GRAY = rgb(0.45, 0.45, 0.45);
const IDS_LINE = rgb(0.85, 0.85, 0.85);

function generateUniqueContractId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `CT-${year}${month}${day}-${random}`;
}

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !isStaff(authUser.role)) {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();

    const contractId = generateUniqueContractId();

    // ── En-tête PDF structuré : logo large sur fond blanc ──
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width,
      height: 120,
      color: rgb(1, 1, 1),
    });

    const logoPath = path.join(process.cwd(), "logo.jpeg");
    if (fs.existsSync(logoPath)) {
      try {
        const logoBytes = fs.readFileSync(logoPath);
        const logoImage = await pdfDoc.embedJpg(logoBytes);
        page.drawImage(logoImage, { x: 38, y: height - 100, width: 220, height: 76 });
      } catch {
        // Logo non lisible, on continue sans
      }
    }

    page.drawText(`Ref. : ${contractId}`, {
      x: width - 40 - 140,
      y: height - 62,
      size: 9,
      font: fontBold,
      color: IDS_BLACK,
    });

    // ── Titre ──
    page.drawText("CONTRAT D'INSCRIPTION", {
      x: width / 2 - 95,
      y: height - 158,
      size: 17,
      font: fontBold,
      color: IDS_BLACK,
    });

    page.drawLine({
      start: { x: 40, y: height - 168 },
      end: { x: width - 40, y: height - 168 },
      thickness: 1,
      color: IDS_LINE,
    });

    page.drawText("Fait a Yaounde, le .........................................", {
      x: 40,
      y: height - 190,
      size: 10,
      font: fontRegular,
      color: IDS_GRAY,
    });

    // ── Parties ──
    page.drawText("ENTRE LES SOUSSIGNES :", {
      x: 40,
      y: height - 220,
      size: 12,
      font: fontBold,
      color: IDS_BLACK,
    });

    let fieldY = height - 246;
    const fieldLine = width - 300;
    const field = (label: string) => {
      page.drawText(label, {
        x: 40,
        y: fieldY,
        size: 10,
        font: fontRegular,
        color: IDS_BLACK,
      });
      page.drawLine({
        start: { x: 220, y: fieldY - 1 },
        end: { x: 220 + fieldLine, y: fieldY - 1 },
        thickness: 1,
        color: IDS_LINE,
      });
      fieldY -= 26;
    };

    field("Nom et prenom de l'etudiant(e) :");
    field("Date et lieu de naissance :");
    field("Nationalite :");
    field("Adresse :");
    field("Telephone / Email :");

    page.drawText("ET :", {
      x: 40,
      y: fieldY - 10,
      size: 12,
      font: fontBold,
      color: IDS_BLACK,
    });

    page.drawText(
      "IDS-SPRACHSCHULE, ecole de langues, Carrefour Scalom, Biyem-Assi, Yaounde, Cameroun.",
      {
        x: 40,
        y: fieldY - 26,
        size: 10,
        font: fontRegular,
        color: IDS_BLACK,
      }
    );

    fieldY -= 42;

    // ── Objet du contrat ──
    page.drawText("ARTICLE 1 - OBJET", {
      x: 40,
      y: fieldY,
      size: 10,
      font: fontBold,
      color: IDS_RED,
    });
    fieldY -= 22;

    page.drawText("Programme / Niveau :", {
      x: 40,
      y: fieldY,
      size: 10,
      font: fontRegular,
      color: IDS_BLACK,
    });
    page.drawLine({
      start: { x: 220, y: fieldY - 1 },
      end: { x: 220 + fieldLine, y: fieldY - 1 },
      thickness: 1,
      color: IDS_LINE,
    });
    fieldY -= 24;

    page.drawText("Horaire des cours :", {
      x: 40,
      y: fieldY,
      size: 10,
      font: fontRegular,
      color: IDS_BLACK,
    });
    page.drawLine({
      start: { x: 220, y: fieldY - 1 },
      end: { x: 220 + fieldLine, y: fieldY - 1 },
      thickness: 1,
      color: IDS_LINE,
    });
    fieldY -= 24;

    page.drawText("Date de debut :", {
      x: 40,
      y: fieldY,
      size: 10,
      font: fontRegular,
      color: IDS_BLACK,
    });
    page.drawLine({
      start: { x: 160, y: fieldY - 1 },
      end: { x: 250, y: fieldY - 1 },
      thickness: 1,
      color: IDS_LINE,
    });
    page.drawText("Duree :", {
      x: 300,
      y: fieldY,
      size: 10,
      font: fontRegular,
      color: IDS_BLACK,
    });
    page.drawLine({
      start: { x: 350, y: fieldY - 1 },
      end: { x: 460, y: fieldY - 1 },
      thickness: 1,
      color: IDS_LINE,
    });
    fieldY -= 24;

    page.drawText("Frais d'inscription (FCFA) :", {
      x: 40,
      y: fieldY,
      size: 10,
      font: fontRegular,
      color: IDS_BLACK,
    });
    page.drawLine({
      start: { x: 220, y: fieldY - 1 },
      end: { x: 220 + fieldLine, y: fieldY - 1 },
      thickness: 1,
      color: IDS_LINE,
    });
    fieldY -= 24;

    page.drawText("Mode de paiement :", {
      x: 40,
      y: fieldY,
      size: 10,
      font: fontRegular,
      color: IDS_BLACK,
    });
    page.drawLine({
      start: { x: 220, y: fieldY - 1 },
      end: { x: 220 + fieldLine, y: fieldY - 1 },
      thickness: 1,
      color: IDS_LINE,
    });

    fieldY -= 38;

    // ── Conditions ──
    page.drawText("ARTICLE 2 - CONDITIONS DE PAIEMENT", {
      x: 40,
      y: fieldY,
      size: 10,
      font: fontBold,
      color: IDS_RED,
    });
    fieldY -= 18;

    page.drawText(
      "Les frais de formation sont payables a l'avance, en tout ou en partie, selon les modalites",
      { x: 40, y: fieldY, size: 9.5, font: fontRegular, color: IDS_GRAY }
    );
    fieldY -= 13;
    page.drawText(
      "convenues. Les acomptes verses ne sont pas remboursables en cas de desistement apres le",
      { x: 40, y: fieldY, size: 9.5, font: fontRegular, color: IDS_GRAY }
    );
    fieldY -= 13;
    page.drawText("debut des cours.", {
      x: 40,
      y: fieldY,
      size: 9.5,
      font: fontRegular,
      color: IDS_GRAY,
    });

    fieldY -= 26;

    page.drawText("ARTICLE 3 - ENGAGEMENT DES PARTIES", {
      x: 40,
      y: fieldY,
      size: 10,
      font: fontBold,
      color: IDS_RED,
    });
    fieldY -= 18;

    page.drawText(
      "L'etudiant(e) s'engage a respecter le reglement interieur et a suivre assidument les cours.",
      { x: 40, y: fieldY, size: 9.5, font: fontRegular, color: IDS_GRAY }
    );
    fieldY -= 13;
    page.drawText(
      "IDS-SPRACHSCHULE s'engage a dispenser les cours conformement au programme choisi et",
      { x: 40, y: fieldY, size: 9.5, font: fontRegular, color: IDS_GRAY }
    );
    fieldY -= 13;
    page.drawText("aux horaires convenus.", {
      x: 40,
      y: fieldY,
      size: 9.5,
      font: fontRegular,
      color: IDS_GRAY,
    });

    fieldY -= 22;

    page.drawText("Fait en deux exemplaires originaux.", {
      x: 40,
      y: fieldY,
      size: 9.5,
      font: fontRegular,
      color: IDS_GRAY,
    });

    // ── Pied de page ──
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 32,
      color: IDS_BLACK,
    });

    page.drawText(
      "IDS-SPRACHSCHULE  |  Carrefour Scalom, Biyem-Assi, Yaounde, Cameroun  |  WhatsApp : +49 1573 0323154",
      {
        x: width / 2 - 230,
        y: 11,
        size: 8.5,
        font: fontRegular,
        color: IDS_LIGHT_GRAY,
      }
    );

    const pdfBytes = await pdfDoc.save();
    const body = new Uint8Array(pdfBytes);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrat-${contractId}.pdf"`,
        "Content-Length": String(body.length),
      },
    });
  } catch (error) {
    console.error("[CONTRATS_PDF]", error);
    return NextResponse.json({ success: false, error: "Erreur génération du contrat." }, { status: 500 });
  }
}
