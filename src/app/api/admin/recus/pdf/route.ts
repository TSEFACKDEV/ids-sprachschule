import { NextResponse } from "next/server";
import { getAuthUser, isStaff } from "@/lib/auth";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

const IDS_RED = rgb(0.8, 0, 0);
const IDS_GOLD = rgb(0.83, 0.686, 0.216);
const IDS_BLACK = rgb(0.039, 0.039, 0.039);
const IDS_GRAY_LINE = rgb(0.85, 0.85, 0.85);

function generateUniqueRecuId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `REC-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
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

    // ── Header ──
    page.drawRectangle({
      x: 0,
      y: height - 110,
      width,
      height: 110,
      color: IDS_BLACK,
    });

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

    page.drawText("IDS-Sprachschule", {
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

    // ── Titre ──
    const uniqueId = generateUniqueRecuId();

    page.drawText("RECU DE PAIEMENT", {
      x: width / 2 - 80,
      y: height - 150,
      size: 18,
      font: fontBold,
      color: IDS_BLACK,
    });

    page.drawText(`N° ${uniqueId}`, {
      x: width / 2 - 45,
      y: height - 172,
      size: 11,
      font: fontRegular,
      color: IDS_RED,
    });

    page.drawLine({
      start: { x: 32, y: height - 190 },
      end: { x: width - 32, y: height - 190 },
      thickness: 1,
      color: IDS_GRAY_LINE,
    });

    // ── Champs vierges ──
    let y = height - 220;

    const drawField = (label: string, lineLength = width - 300) => {
      page.drawText(label, {
        x: 44,
        y,
        size: 11,
        font: fontBold,
        color: IDS_BLACK,
      });
      page.drawLine({
        start: { x: 300, y: y - 1 },
        end: { x: 300 + lineLength, y: y - 1 },
        thickness: 1,
        color: IDS_GRAY_LINE,
      });
      y -= 34;
    };

    drawField("Date :");
    drawField("Nom de l'etudiant(e) :");
    drawField("Formation / Service :");
    drawField("Montant total (FCFA) :");
    drawField("Montant verse (FCFA) :");
    drawField("Reste a payer (FCFA) :");
    drawField("Mode de paiement :");

    // Signature
    page.drawLine({
      start: { x: 44, y: y - 6 },
      end: { x: 240, y: y - 6 },
      thickness: 1,
      color: IDS_GRAY_LINE,
    });
    page.drawText("Signature", {
      x: 44,
      y: y - 26,
      size: 10,
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
    const body = new Uint8Array(pdfBytes);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="recu-${uniqueId}.pdf"`,
        "Content-Length": String(body.length),
      },
    });
  } catch (error) {
    console.error("[RECUS_PDF]", error);
    return NextResponse.json(
      { success: false, error: "Erreur génération du reçu." },
      { status: 500 }
    );
  }
}
